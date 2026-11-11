// components/SyvaTracker.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { Hand, MousePointer2, RotateCw, VideoOff } from 'lucide-react';

interface SyvaTrackerProps {
  onHandUpdate: (
    pos: { x: number; y: number },
    isGrabbing: boolean,
    dist: number,
    fingerCount: number
  ) => void;
}

export default function SyvaTracker({ onHandUpdate }: SyvaTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const [isLoaded, setIsLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [fingerCount, setFingerCount] = useState(0);

  useEffect(() => {
    let landmarker: HandLandmarker | null = null;
    let animId: number;

    async function initHandTracker() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        });

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, frameRate: 30 },
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play().catch(() => {});
              setIsLoaded(true);
              detectFrame();
            };
          }
        }
      } catch (err) {
        console.warn('Sensor tangan tidak dapat diakses:', err);
        setFailed(true);
      }
    }

    function detectFrame() {
      if (landmarker && videoRef.current && videoRef.current.readyState >= 2) {
        const results = landmarker.detectForVideo(videoRef.current, performance.now());

        if (results.landmarks && results.landmarks.length > 0) {
          const hand1 = results.landmarks[0];

          let count = 0;
          if (Math.abs(hand1[4].x - hand1[2].x) > 0.04) count++;
          if (hand1[8].y < hand1[6].y) count++;
          if (hand1[12].y < hand1[10].y) count++;
          if (hand1[16].y < hand1[14].y) count++;
          if (hand1[20].y < hand1[18].y) count++;

          setFingerCount(count);

          const posX = 1 - hand1[8].x;
          const posY = hand1[8].y;
          const isRotating5Fingers = count === 5;

          let dist = 0.45;
          if (results.landmarks.length >= 2) {
            const hand2 = results.landmarks[1];
            const dx = hand1[0].x - hand2[0].x;
            const dy = hand1[0].y - hand2[0].y;
            dist = Math.sqrt(dx * dx + dy * dy);
          }

          onHandUpdate({ x: posX, y: posY }, isRotating5Fingers, dist, count);
        } else {
          setFingerCount(0);
          onHandUpdate({ x: 0.5, y: 0.5 }, false, 0.45, 0);
        }
      }
      animId = requestAnimationFrame(detectFrame);
    }

    initHandTracker();

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (landmarker) landmarker.close();
    };
  }, [onHandUpdate]);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 font-sans sm:bottom-6 sm:right-6">
      <div className="relative h-32 w-44 overflow-hidden rounded-2xl border border-line bg-ink-deep shadow-[0_20px_40px_-20px_rgba(10,8,60,0.9),inset_0_1px_0_rgba(255,255,255,0.07)] sm:h-40 sm:w-56">
        <div aria-hidden className="absolute left-1.5 top-1.5 z-10 h-2.5 w-2.5 border-l-2 border-t-2 border-flame" />
        <div aria-hidden className="absolute right-1.5 top-1.5 z-10 h-2.5 w-2.5 border-r-2 border-t-2 border-flame" />
        <div aria-hidden className="absolute bottom-1.5 left-1.5 z-10 h-2.5 w-2.5 border-b-2 border-l-2 border-flame" />
        <div aria-hidden className="absolute bottom-1.5 right-1.5 z-10 h-2.5 w-2.5 border-b-2 border-r-2 border-flame" />

        <video
          ref={videoRef}
          className="h-full w-full -scale-x-100 object-cover opacity-80 mix-blend-screen"
          muted
          playsInline
        />

        {failed && (
          <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-2 px-4 text-center">
            <VideoOff aria-hidden className="h-6 w-6 text-periwinkle" />
            <p className="text-xs leading-snug text-mist">Kamera tidak aktif. Izinkan kamera di browser untuk kendali gerakan tangan.</p>
          </div>
        )}

        <div className="absolute left-2 right-2 top-2 z-10 flex items-center justify-between gap-2 font-mono text-[11px] font-bold">
          <span className="truncate rounded-md border border-line bg-ink-deep px-2 py-0.5 text-glow">
            {failed ? 'Kamera mati' : isLoaded ? 'Kamera aktif' : 'Memulai kamera...'}
          </span>
          <span className="shrink-0 rounded-md border border-flame bg-flame px-2 py-0.5 text-ink-deep">{fingerCount} jari</span>
        </div>

        <div className="absolute inset-x-2 bottom-2 z-10">
          <div className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-ink-deep px-2 py-1 shadow-lg">
            {fingerCount === 5 ? (
              <RotateCw aria-hidden className="h-3.5 w-3.5 shrink-0 text-glow" />
            ) : fingerCount >= 1 && fingerCount <= 4 ? (
              <MousePointer2 aria-hidden className="h-3.5 w-3.5 shrink-0 text-glow" />
            ) : (
              <Hand aria-hidden className="h-3.5 w-3.5 shrink-0 text-glow" />
            )}
            <span className="block truncate text-[11px] font-semibold text-glow">
              {fingerCount === 5
                ? 'Putar model (5 jari)'
                : fingerCount >= 1 && fingerCount <= 4
                ? 'Tunjuk penanda (1-4 jari)'
                : 'Tunjukkan tanganmu'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}