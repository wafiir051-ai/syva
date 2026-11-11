// app/student/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Moon, RotateCcw, Sun, ZoomIn } from 'lucide-react';
import SyvaAssistant from '@/components/SyvaAssistant';
import SyvaTracker from '@/components/SyvaTracker';
import SyvaCanvas from '@/components/SyvaCanvas';
import SyvaHUD from '@/components/SyvaHUD';
import { SyvaModule, SyvaAnnotation } from '@/types/syva';

const fallbackPCModule: SyvaModule = {
  id: 'demo-tkj-pc',
  title: 'PC Gaming & Hardware System',
  category: 'TKJ_IT',
  description: 'Simulasi 3D arsitektur hardware PC Gaming modern.',
  nodes: [
    {
      id: '1',
      label: 'Rig PC Gaming Specs',
      subtitle: 'Intel Core i9 / RTX 4090 / 32GB RAM',
      description: 'Unit komputer PC Gaming modern.',
      assetType: 'PC_GAMING',
      color: '#3fefff',
      position: [0, 0, 0],
    },
  ],
  quizzes: [],
};

export default function StudentLab() {
  const [moduleData, setModuleData] = useState<SyvaModule>(fallbackPCModule);
  const [handPos, setHandPos] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [isGrabbing, setIsGrabbing] = useState<boolean>(false);
  const [fingerCount, setFingerCount] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [twoHandDist, setTwoHandDist] = useState<number>(0.45);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [selectedAnnotation, setSelectedAnnotation] = useState<SyvaAnnotation | null>(null);

  const loadActiveModule = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedModule = localStorage.getItem('syva_active_module');
      if (savedModule) {
        try {
          const parsed = JSON.parse(savedModule);
          if (parsed && parsed.nodes && parsed.nodes[0]) {
            setModuleData(parsed);
          }
        } catch (e) {}
      }

      const savedTheme = localStorage.getItem('syva_theme') as 'light' | 'dark';
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }
    }
  }, []);

  useEffect(() => {
    loadActiveModule();
    const handleStorageChange = () => loadActiveModule();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadActiveModule]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('syva_theme', nextTheme);
    }
  };

  const handleHandUpdate = useCallback(
    (pos: { x: number; y: number }, grabbing: boolean, dist: number, count: number) => {
      setHandPos(pos);
      setIsGrabbing(grabbing);
      setTwoHandDist(dist);
      setFingerCount(count);
    },
    []
  );

  const handleSyvaCommand = useCallback((action: string) => {
    if (action === 'SIMULATE_PACKET') {
      setIsSimulating(true);
      setTimeout(() => setIsSimulating(false), 4500);
    } else if (action === 'RESET_LAYOUT') {
      setIsSimulating(false);
    }
  }, []);

  const handleResetStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('syva_active_module');
      setModuleData(fallbackPCModule);
      setSelectedAnnotation(null);
    }
  };

  const zoomPercent = Math.round(
    Math.min(Math.max(((twoHandDist - 0.2) / (0.75 - 0.2)) * 180 + 40, 40), 230)
  );

  const isDark = theme === 'dark';

  const chip = `pointer-events-auto flex min-h-11 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold shadow-[0_14px_28px_-16px_rgba(10,8,60,0.9)] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow ${
    isDark
      ? 'border-line bg-ink-deep text-mist hover:border-periwinkle hover:text-white'
      : 'border-paper-line bg-white text-ink-deep hover:border-periwinkle'
  }`;

  return (
    <main className={`relative w-full h-screen overflow-hidden font-sans tracking-tight antialiased select-none transition-colors duration-300 ${isDark ? 'bg-ink text-white' : 'bg-paper text-ink-deep'}`}>
      <SyvaAssistant
        onCommand={handleSyvaCommand}
        moduleTitle={moduleData.title}
        moduleDescription={moduleData.nodes[0]?.description || moduleData.description}
        selectedAnnotation={selectedAnnotation}
      />
      <SyvaTracker onHandUpdate={handleHandUpdate} />
      <SyvaHUD
        title={moduleData?.title || 'Materi Pembelajaran'}
        description={moduleData?.description || 'Simulasi interaktif 3D'}
      />

      {/* bottom-left controls: icons only on small screens */}
      <div className="pointer-events-none fixed bottom-4 left-4 z-40 flex flex-col items-start gap-2 sm:bottom-6 sm:left-6">
        <div
          role="status"
          aria-label={`Zoom ${zoomPercent} persen`}
          className={`flex min-h-11 items-center gap-2 rounded-full border px-3.5 text-sm shadow-[0_14px_28px_-16px_rgba(10,8,60,0.9)] ${
            isDark ? 'border-line bg-ink-deep text-mist' : 'border-paper-line bg-white text-ink-deep'
          }`}
        >
          <ZoomIn aria-hidden className="h-4 w-4 text-glow" />
          <span className="hidden sm:inline">Zoom</span>
          <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-ink-deep'}`}>{zoomPercent}%</span>
        </div>

        <button type="button" onClick={toggleTheme} aria-label={isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'} className={chip}>
          {isDark ? <Moon aria-hidden className="h-4 w-4" /> : <Sun aria-hidden className="h-4 w-4" />}
          <span className="hidden sm:inline">{isDark ? 'Tema gelap' : 'Tema terang'}</span>
        </button>

        <button type="button" onClick={handleResetStorage} aria-label="Reset materi ke bawaan" className={chip}>
          <RotateCcw aria-hidden className="h-4 w-4" />
          <span className="hidden sm:inline">Reset materi</span>
        </button>
      </div>

      <SyvaCanvas
        moduleData={moduleData}
        handPos={handPos}
        isGrabbing={isGrabbing}
        fingerCount={fingerCount}
        isSimulating={isSimulating}
        twoHandDist={twoHandDist}
        theme={theme}
        onSelectAnnotation={(anno) => setSelectedAnnotation(anno)}
      />
    </main>
  );
}
