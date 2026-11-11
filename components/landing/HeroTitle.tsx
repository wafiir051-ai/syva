'use client';

import { useEffect, useState } from 'react';
import TechText from '@/components/reactbits/TechText';

const LINES = [
  { text: 'Spatial', accent: false },
  { text: 'Simulator', accent: false },
  { text: 'Lab', accent: true },
];

/** Canvas width as a percentage of the column, so letters never hit the canvas edge. */
const CANVAS_W = 115;

/** Largest size the title may use; the canvas shrinks a line only if it would not fit. */
const sizeFor = (width: number) => Math.round(Math.min(96, Math.max(52, width * 0.064)));

/**
 * The hero title drawn with React Bits "Tech Text": letters can be dragged, and dashed
 * measuring lines trace the glyphs near the cursor. Colours stay on the SYVA palette:
 * white and cyan lines for the first two words, orange for "Lab".
 */
export default function HeroTitle() {
  const [size, setSize] = useState(88);
  // The hero column is centred on phones and left-aligned from tablet width up.
  const [centered, setCentered] = useState(false);

  useEffect(() => {
    const update = () => {
      setSize(sizeFor(window.innerWidth));
      setCentered(window.innerWidth < 768);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const pitch = Math.round(size * 0.98); // line spacing of the original title
  const canvasH = Math.round(size * 1.7);

  return (
    <h1 id="hero-title" className="w-full">
      {/* real text for screen readers and before the canvas is ready */}
      <span className="sr-only">Spatial Simulator Lab</span>
      <span aria-hidden className="block font-display">
        {LINES.map((line) => (
          // The line keeps the original spacing; its canvas is far larger than the text
          // (the component only fills 66% of its height and 90% of its width), so letters keep
          // their full size and the dashed lines are never cut off at a box edge.
          <span
            key={line.text}
            className={`relative block ${line.accent ? 'text-flame' : 'text-white'}`}
            style={{ height: pitch }}
          >
            <span
              className="absolute block"
              style={{
                height: canvasH,
                top: (pitch - canvasH) / 2,
                width: `${CANVAS_W}%`,
                // the component indents text by 5% of its own width; cancel that so words sit on the column edge
                left: centered ? `${(100 - CANVAS_W) / 2}%` : `${-0.05 * CANVAS_W}%`,
              }}
            >
              <TechText
                text={line.text}
                fontWeight={800}
                fontSize={size}
                letterSpacing={-0.03}
                color="currentColor"
                accentColor={line.accent ? '#ff7a1f' : '#3fefff'}
                align={centered ? 'center' : 'left'}
                labels={false}
                reach={170}
                specks={10}
                intro="assemble"
                introDuration={1.4}
              />
            </span>
          </span>
        ))}
      </span>
    </h1>
  );
}
