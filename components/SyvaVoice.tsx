'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface SyvaVoiceProps {
  onCommand: (action: string) => void;
}

export default function SyvaVoice({ onCommand }: SyvaVoiceProps) {
  const [transcript, setTranscript] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [syvaStatus, setSyvaStatus] = useState<string>('STANDBY');
  const [syvaSpeech, setSyvaSpeech] = useState<string>('SYVA Core Online. Siap menerima perintah.');
  const isSpeakingRef = useRef<boolean>(false);

  // 1. Efek Suara Sci-Fi Futuristik (Web Audio API Native)
  const playJarvisChime = useCallback((type: 'listen' | 'confirm' | 'alert') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'listen') {
        // Sound saat SYVA mendengarkan (Chime tinggi cepat)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'confirm') {
        // Sound saat SYVA mengonfirmasi perintah (Double beep JARVIS)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'alert') {
        // Sound peringatan/potong kabel
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      // Audio context disabled or not allowed yet
    }
  }, []);

  // 2. Fungsi Talkback JARVIS (Text-to-Speech)
  const speakAsJarvis = useCallback((text: string, chimeType: 'confirm' | 'alert' = 'confirm') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Putar suara efek chime terlebih dahulu
    playJarvisChime(chimeType);

    // Hentikan suara yang sedang berjalan jika ada
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID'; // Bahasa Indonesia
    utterance.rate = 1.05;    // Kecepatan bicara sedikit lebih cepat ala AI
    utterance.pitch = 0.95;   // Pitch sedikit lebih berat/maskulin ala JARVIS

    // Cari suara Bahasa Indonesia yang tersedia di OS/Browser
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find((v) => v.lang.includes('id') || v.lang.includes('ID'));
    if (idVoice) utterance.voice = idVoice;

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      setSyvaSpeech(text);
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
    };

    window.speechSynthesis.speak(utterance);
  }, [playJarvisChime]);

  // 3. Engine Pengenal Suara (Speech Recognition)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSyvaStatus('VOICE ENGINE UNSUPPORTED');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'id-ID';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsActive(true);
      setSyvaStatus('LISTENING...');
    };

    recognition.onresult = (event: any) => {
      if (isSpeakingRef.current) return; // Jangan mendengarkan saat SYVA sedang bicara

      const current = event.resultIndex;
      const text = event.results[current][0].transcript.toLowerCase().trim();
      setTranscript(text);

      const isCallSyva = text.includes('syva') || text.includes('syifa') || text.includes('sifa') || text.includes('siva');

      if (isCallSyva) {
        if (text.includes('simulasi') || text.includes('ping') || text.includes('paket') || text.includes('jalan')) {
          setSyvaStatus('EXECUTING SIMULATION');
          speakAsJarvis('Siap. Memulai simulasi transmisi paket data pada topologi star.', 'confirm');
          onCommand('SIMULATE_PACKET');
        } else if (text.includes('potong') || text.includes('putus') || text.includes('matikan')) {
          setSyvaStatus('LINK SEVERED');
          speakAsJarvis('Peringatan! Jalur koneksi utama telah diputuskan.', 'alert');
          onCommand('CUT_CABLE');
        } else if (text.includes('reset') || text.includes('ulang') || text.includes('kembali')) {
          setSyvaStatus('RESETTING TOPOLOGY');
          speakAsJarvis('Mengembalikan konfigurasi topologi jaringan ke status awal.', 'confirm');
          onCommand('RESET_LAYOUT');
        } else if (text.includes('halo') || text.includes('pagi') || text.includes('siang') || text.includes('tes')) {
          speakAsJarvis('Sistem SYVA aktif dan siap membantu laboratorium jaringan.', 'confirm');
        } else {
          speakAsJarvis('Perintah diterima, sistem SYVA siap.', 'confirm');
        }
      }
    };

    recognition.onerror = () => setIsActive(false);
    recognition.onend = () => {
      // Auto restart agar tetap mendengarkan secara kontinu
      try {
        recognition.start();
      } catch (e) {
        // Already started
      }
    };

    recognition.start();

    return () => {
      recognition.stop();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [onCommand, speakAsJarvis]);

  return (
    <div className="fixed top-6 left-6 z-50 bg-slate-950/85 border border-cyan-500/50 p-4 rounded-br-2xl rounded-tl-2xl backdrop-blur-md font-mono text-xs flex flex-col gap-2 max-w-sm shadow-[0_0_25px_rgba(0,243,255,0.2)]">
      {/* Header Status Voice */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isActive ? 'bg-cyan-400' : 'bg-red-400'} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? 'bg-cyan-300 shadow-[0_0_8px_#00f3ff]' : 'bg-red-500'}`} />
          </div>
          <span className="font-bold tracking-widest text-white">SYVA TALKBACK</span>
        </div>
        <span className="text-[9px] text-cyan-400 font-semibold tracking-wider bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
          {syvaStatus}
        </span>
      </div>

      {/* Input Suara Pengguna */}
      <div className="text-[11px] text-cyan-400/80">
        <span className="text-cyan-600 font-bold">USER &gt; </span>
        {transcript ? `"${transcript}"` : 'Ucapkan "Syva, simulasi paket"'}
      </div>

      {/* Respon Suara SYVA (JARVIS Output) */}
      <div className="bg-cyan-950/40 border-l-2 border-cyan-400 p-2 rounded-r text-[11px] text-cyan-200">
        <span className="text-cyan-400 font-bold block text-[9px] tracking-widest mb-0.5">SYVA RESPONSE:</span>
        <p className="italic leading-relaxed">"{syvaSpeech}"</p>
      </div>
    </div>
  );
}