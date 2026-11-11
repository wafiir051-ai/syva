# SYVA Spatial Lab

Lab belajar 3D interaktif. Siswa menjelajahi model materi dengan **gerakan tangan** dan **asisten suara**, langsung di browser tanpa headset VR.

**Demo:** https://syva-seven.vercel.app

## Halaman
| Rute | Fungsi |
|---|---|
| `/` | Landing page: hero, momen scroll 3D, daftar mapel, cara kerja, dan obrolan dengan robot SYVA |
| `/teacher` | Panel Guru: pilih mapel, edit naskah, unggah model `.glb`, lalu tampilkan di lab |
| `/student` | Lab Siswa: model 3D, kendali tangan lewat kamera, asisten suara |

Mata pelajaran: TKJ & IT, Biologi, Fisika, Matematika, Sejarah. Model 3D dibuat dari kode (`components/models/ProceduralModels.tsx`); file `.glb` di `public/models/` otomatis menggantikannya bila ada.

## Teknologi
Next.js 16 (App Router), React 19, Tailwind CSS 4, three.js + React Three Fiber, Motion, MediaPipe (pelacakan tangan), komponen gratis dari [React Bits](https://reactbits.dev).

## Menjalankan lokal
```bash
npm install
npm run dev
```
Buka http://localhost:3000. Pakai Chrome desktop dengan webcam dan mikrofon untuk fitur gerakan dan suara.

## AI SYVA (opsional)
Obrolan robot dan pertanyaan bebas di lab dijawab lewat [Groq](https://console.groq.com). Buat file `.env.local`:
```
GROQ_API_KEY=isi_key_anda
# opsional: GROQ_MODEL=openai/gpt-oss-120b
```
Key hanya dipakai di server (`app/api/syva/route.ts`) dan tidak dikirim ke browser. Tanpa key, SYVA memakai model kecil di browser (WebLLM) setelah pengguna menyetujui unduhan.

## Desain
Sistem desain, palet warna, dan keputusan gerak ada di [`DESIGN.md`](DESIGN.md).

## Deploy
Siap untuk Vercel. Atur `GROQ_API_KEY` di Environment Variables bila ingin AI server aktif.
