// components/SyvaAssistant.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { SyvaAnnotation } from '@/types/syva';
import { Bot, PencilLine } from 'lucide-react';
import { askSyva } from '@/lib/syva-ai';
import ShinyText from '@/components/reactbits/ShinyText';

interface SyvaAssistantProps {
  onCommand?: (cmd: string) => void;
  moduleTitle?: string;
  moduleDescription?: string;
  selectedAnnotation?: SyvaAnnotation | null;
}

export default function SyvaAssistant({
  onCommand,
  moduleTitle = 'Materi Pembelajaran',
  moduleDescription = 'Belum ada penjelasan materi.',
  selectedAnnotation,
}: SyvaAssistantProps) {
  const [isActivated, setIsActivated] = useState<boolean>(false);
  const [isMicAllowed, setIsMicAllowed] = useState<boolean>(true);
  const [statusText, setStatusText] = useState<string>("Tunjuk titik / Katakan 'OKE'");
  const [transcript, setTranscript] = useState<string>('');
  const [isInputOpen, setIsInputOpen] = useState<boolean>(false);
  const [textCommand, setTextCommand] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const isActivatedRef = useRef<boolean>(false);
  const onCommandRef = useRef(onCommand);
  const descriptionRef = useRef(moduleDescription);
  const annotationRef = useRef(selectedAnnotation);
  const lastSpokenAnnoId = useRef<string>('');

  useEffect(() => {
    isActivatedRef.current = isActivated;
  }, [isActivated]);

  useEffect(() => {
    onCommandRef.current = onCommand;
    descriptionRef.current = moduleDescription;
    annotationRef.current = selectedAnnotation;
  }, [onCommand, moduleDescription, selectedAnnotation]);

  const speakResponse = useCallback((text: string, onEndCallback?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;

    if (onEndCallback) {
      utterance.onend = onEndCallback;
    }

    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    if (selectedAnnotation && selectedAnnotation.id !== lastSpokenAnnoId.current) {
      lastSpokenAnnoId.current = selectedAnnotation.id;
      setStatusText(`Menjelaskan: ${selectedAnnotation.label}`);

      const speechText = `Ini adalah ${selectedAnnotation.label}. ${selectedAnnotation.description}`;
      speakResponse(speechText, () => {
        setStatusText("Tunjuk titik / Katakan 'OKE'");
      });
    }
  }, [selectedAnnotation, speakResponse]);

  const processCommand = useCallback(
    (inputSentence: string) => {
      const cleanText = inputSentence.toLowerCase().trim();
      setTranscript(cleanText);

      if (
        cleanText.includes('simulasi') ||
        cleanText.includes('paket') ||
        cleanText.includes('jalan') ||
        cleanText.includes('mulai')
      ) {
        setStatusText('Menjalankan Simulasi...');
        speakResponse('Memulai simulasi interaktif.', () => {
          if (onCommandRef.current) onCommandRef.current('SIMULATE_PACKET');
          setIsActivated(false);
          setStatusText("Tunjuk titik / Katakan 'OKE'");
        });
      } else if (
        cleanText.includes('reset') ||
        cleanText.includes('ulang') ||
        cleanText.includes('kembali') ||
        cleanText.includes('awal')
      ) {
        setStatusText('Mereset Tampilan...');
        speakResponse('Posisi dan animasi direset ke awal.', () => {
          if (onCommandRef.current) onCommandRef.current('RESET_LAYOUT');
          setIsActivated(false);
          setStatusText("Tunjuk titik / Katakan 'OKE'");
        });
      } else if (
        cleanText.includes('jelaskan') ||
        cleanText.includes('penjelasan') ||
        cleanText.includes('materi') ||
        cleanText.includes('apa itu')
      ) {
        setStatusText('Menjelaskan Materi...');
        const answer = `Berikut penjelasan mengenai ${moduleTitle}: ${descriptionRef.current}`;
        speakResponse(answer, () => {
          setIsActivated(false);
          setStatusText("Tunjuk titik / Katakan 'OKE'");
        });
      } else if (
        cleanText.includes('tutup') ||
        cleanText.includes('batal') ||
        cleanText.includes('diam')
      ) {
        setStatusText("Tunjuk titik / Katakan 'OKE'");
        speakResponse('Kembali ke mode siaga.');
        setIsActivated(false);
      } else {
        setStatusText('Menjawab Pertanyaan...');
        const fallbackAnswer = `Mengenai ${cleanText}, pada materi ${moduleTitle}: ${descriptionRef.current}`;
        const finish = () => {
          setIsActivated(false);
          setStatusText("Tunjuk titik / Katakan 'OKE'");
        };
        const anno = annotationRef.current;
        const context = [
          `Materi: ${moduleTitle}. ${descriptionRef.current}`,
          anno ? `Bagian yang sedang dipilih siswa: ${anno.label} (${anno.subtitle}). ${anno.description}` : '',
        ]
          .filter(Boolean)
          .join('\n');
        // Free-form questions go to the on-device AI, but only if it is already
        // loaded or cached here: the lab never triggers a big download by itself.
        askSyva({ question: inputSentence, context, allowDownload: false })
          .then((answer) => speakResponse(answer, finish))
          .catch(() => speakResponse(fallbackAnswer, finish));
      }
    },
    [moduleTitle, speakResponse]
  );

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textCommand.trim()) return;

    setIsActivated(true);
    processCommand(textCommand);
    setTextCommand('');
  };

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err: any) {
        if (err.name !== 'InvalidStateError') {
          console.warn('Gagal memulai pengenalan suara:', err);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusText('Gunakan kolom ketik perintah');
      setIsMicAllowed(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'id-ID';

    recognition.onstart = () => {
      setIsMicAllowed(true);
    };

    // Once the mic is denied, stop auto-restarting: a blocked mic would otherwise
    // restart in a tight loop (error -> end -> start -> error) and freeze the page.
    let micDenied = false;

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        micDenied = true;
        setIsMicAllowed(false);
        setStatusText('Mikrofon Mati (Gunakan Teks)');
      }
    };

    recognition.onresult = (event: any) => {
      const lastIndex = event.results.length - 1;
      const cleanText = event.results[lastIndex][0].transcript.toLowerCase().trim();

      const isListening = isActivatedRef.current;

      const isWakeWord =
        cleanText.includes('ok syva') ||
        cleanText.includes('oke syva') ||
        cleanText.includes('ok siva') ||
        cleanText.includes('oke siva') ||
        cleanText.startsWith('oke') ||
        cleanText.startsWith('ok') ||
        cleanText.includes('syva') ||
        cleanText.includes('siva');

      if (!isListening && isWakeWord) {
        setIsActivated(true);
        setStatusText('Mendengarkan Perintah...');
        speakResponse('Ya, SYVA di sini. Silakan tunjuk komponen atau sebutkan perintah.');
        return;
      }

      if (isListening) {
        processCommand(cleanText);
      }
    };

    recognition.onend = () => {
      if (micDenied) return;
      try {
        recognition.start();
      } catch (e) {}
    };

    recognitionRef.current = recognition;
    startListening();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [speakResponse, startListening, processCommand]);

  const handleManualToggle = () => {
    startListening();
    const nextState = !isActivated;
    setIsActivated(nextState);

    if (nextState) {
      setStatusText('Mendengarkan Perintah...');
      speakResponse(`Halo! SYVA siap membantu untuk materi ${moduleTitle}. Tunjuk komponen 3D atau sebutkan perintah.`);
    } else {
      setStatusText("Tunjuk titik / Katakan 'OKE'");
    }
  };

  return (
    <div className="pointer-events-auto fixed left-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 font-sans">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleManualToggle}
          className={`relative group w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg shadow-ink-deep/40 border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow ${
            !isMicAllowed
              ? 'bg-amber-950/90 border-amber-500/60 text-amber-300'
              : isActivated
              ? 'bg-flame border-flame-hi scale-105 text-ink-deep'
              : 'bg-ink-deep border-line hover:border-periwinkle text-glow hover:scale-105'
          }`}
        >
          <Bot aria-hidden className="h-6 w-6 transition-transform group-hover:scale-110" />

          <span
            className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-ink-deep ${
              !isMicAllowed
                ? 'bg-amber-400'
                : isActivated
                ? 'bg-emerald-400 animate-ping'
                : 'bg-glow'
            }`}
          />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-line bg-ink-deep px-4 py-2.5 text-white shadow-[0_14px_28px_-16px_rgba(10,8,60,0.9)]">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-glow">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  !isMicAllowed
                    ? 'bg-amber-400'
                    : isActivated
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-glow'
                }`}
              />
              SYVA • AI VOICE ASSISTANT
            </span>
            <span className="mt-0.5 truncate text-sm font-medium text-white">
              {isActivated ? <ShinyText text={statusText} color="#ffffff" shineColor="#ff9445" speed={2.5} /> : statusText}
            </span>
            {transcript && (
              <span className="mt-0.5 max-w-[14rem] truncate font-mono text-xs text-mist">
                "{transcript}"
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsInputOpen(!isInputOpen)}
            className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow ${
              isInputOpen
                ? 'bg-flame border-flame text-ink-deep'
                : 'bg-surface border-line text-mist hover:text-white hover:border-periwinkle'
            }`}
            title="Buka Prompt Ketik Perintah"
            aria-label="Ketik perintah atau pertanyaan"
            aria-expanded={isInputOpen}
          >
            <PencilLine aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isInputOpen && (
        <form
          onSubmit={handleTextSubmit}
          className="flex w-full gap-2 rounded-2xl border border-line bg-ink-deep p-2 shadow-[0_14px_28px_-16px_rgba(10,8,60,0.9)]"
        >
          <label htmlFor="syva-lab-command" className="sr-only">
            Perintah atau pertanyaan untuk SYVA
          </label>
          <input
            id="syva-lab-command"
            type="text"
            placeholder="Ketik 'simulasi', 'reset', atau pertanyaan..."
            value={textCommand}
            onChange={(e) => setTextCommand(e.target.value)}
            autoComplete="off"
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 font-sans text-base text-white outline-none placeholder:text-periwinkle focus:border-glow"
          />
          <button
            type="submit"
            className="min-h-11 cursor-pointer rounded-xl bg-flame px-4 text-sm font-extrabold text-ink-deep transition-colors hover:bg-flame-hi focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
          >
            Kirim
          </button>
        </form>
      )}
    </div>
  );
}