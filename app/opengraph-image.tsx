import { ImageResponse } from 'next/og';

// The picture shown when the link is shared (Telegram, WhatsApp, Google...). SYVA palette only.
export const alt = 'SYVA Spatial Lab: lab belajar 3D interaktif';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 96px',
          background: 'linear-gradient(135deg, #2a2788 0%, #3137b8 60%, #4b50e6 100%)',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* stage circles, like the hero */}
        <div style={{ position: 'absolute', right: -140, top: -70, width: 680, height: 680, borderRadius: 340, background: '#5257ea', display: 'flex' }} />
        <div style={{ position: 'absolute', right: -60, top: 10, width: 520, height: 520, borderRadius: 260, border: '3px solid rgba(255,255,255,0.28)', display: 'flex' }} />

        <div style={{ display: 'flex', fontSize: 30, letterSpacing: 6, color: '#c4c0ff', textTransform: 'uppercase' }}>Lab belajar 3D interaktif</div>
        <div style={{ display: 'flex', fontSize: 170, fontWeight: 800, lineHeight: 1, marginTop: 28 }}>SYVA</div>
        <div style={{ display: 'flex', fontSize: 104, fontWeight: 800, lineHeight: 1.05, color: '#ff7a1f' }}>Spatial Lab</div>
        <div style={{ display: 'flex', fontSize: 34, color: '#cbceff', marginTop: 40, maxWidth: 640 }}>
          Gerakan tangan, suara, dan model 3D langsung di browser.
        </div>
      </div>
    ),
    size
  );
}
