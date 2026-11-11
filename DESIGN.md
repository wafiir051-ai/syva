# SYVA Spatial Lab — Design System

Sumber: palet yang sudah ada di `app/globals.css` + rekomendasi skill `ui-ux-pro-max`
(pola *Immersive + Interactive*, gaya *Spatial UI*, tipografi ramah edukasi).
**Palet tidak diubah.** Semua warna di bawah adalah token yang sudah ada.

## Karakter
Ruang belajar 3D yang hangat dan playful, bukan SaaS generik. Kedalaman datang dari
lapisan (bayangan berlapis, lingkaran panggung, orbit), bukan dari kaca/blur
(blur berisiko kontras dan berat di laptop sekolah).

## Warna (token Tailwind)
| Token | Hex | Peran |
|---|---|---|
| `ink` | #2a2788 | latar halaman |
| `ink-deep` | #1f1c6b | nav, section selang-seling, teks di atas `flame` |
| `surface` | #3836a8 | kartu |
| `surface-hi` | #4347c6 | kartu terangkat / hover |
| `line` | #5559d9 | border |
| `periwinkle` | #9da3f7 | stroke dekoratif |
| `mist` | #cbceff | teks sekunder |
| `flame` | #ff7a1f | aksi utama (teks di atasnya wajib `ink-deep`) |
| `glow` | #3fefff | highlight teknologi, focus ring, teks aksen kecil |
| `lilac` | #c4c0ff | eyebrow, sparkle |
| `iris` | #5b5bf0 | tombol bulat sekunder |

Warna per mapel diambil dari data modul (`node.color` di `lib/presets.ts`) dan hanya
dipakai sebagai aksen kecil (garis atas, ikon, titik penanda).

## Tipografi
- Heading: **Baloo 2** (`font-display`), bobot 600–800, tracking rapat.
- Isi: Geist Sans. Data/label teknis: Geist Mono, huruf kapital kecil, tracking lebar.
- Isi minimal 16px, line-height 1.6, lebar baris maks ~65 karakter.

## Layout
- Container `max-w-7xl` (hero) / `max-w-6xl` (section), gutter 16/24px.
- Ritme section: eyebrow mono → heading → satu kalimat → konten. Padding vertikal 80–112px.
- Fitur memakai **bento grid** (satu kartu utama dengan visual, sisanya kecil), bukan
  empat kartu seragam.
- Alur "Cara kerja" berupa garis penghubung bernomor, bukan kartu terpisah.

## Komponen
- Tombol utama: pill `flame`, teks `ink-deep`, min-h 48px. Sekunder: pill outline `line`.
- Kartu: `rounded-3xl`, border `line`, bayangan berlapis, hover naik 4–6px + border berubah.
- Semua elemen klik: `cursor-pointer`, focus ring `glow`, target ≥ 44px.

## Gerak
- Maksimal 1–2 elemen bergerak per layar: robot hero + orbit di mockup lab.
- Durasi 150–300ms untuk interaksi mikro, spring lembut untuk reveal.
- Hormati `prefers-reduced-motion` (sudah global di `globals.css` + `MotionConfig`).
- Tidak ada scroll-jacking.

## Hindari
- Placeholder bergaya template (rating, "Enroll today", menu berbahasa Inggris tak relevan).
- Efek kaca/blur, emoji sebagai ikon, warna baru di luar token.
- Hover yang menggeser layout.
- Lapisan partikel/kabut di atas latar hero: sudah dicoba (React Bits Particles), membuat warna pucat. Dibuang.

## Scroll dan 3D (landing page)
Dirancang dengan prinsip skill scroll-craft: tiap bagian bereaksi berbeda, satu momen puncak, kedalaman dari lapisan.

| Bagian | Perangkat | Catatan |
|---|---|---|
| Hero | Parallax berlapis | Teks, panggung lingkaran, robot, chip melayang bergerak dengan kecepatan beda. |
| Pita mapel | Marquee (React Bits `ScrollVelocity`) | Mempercepat mengikuti kecepatan scroll. Daftar statis bila gerak dikurangi. |
| Fitur | Bento tenang | Sengaja diam sebelum puncak. |
| **Puncak: Jelajah** | Pin + scrub | Bagian terkunci ±5 layar. Scroll memutar model 3D dan mengganti mapel; penanda menyala satu per satu. Bagian terpanjang di halaman. |
| Mapel | Kartu miring (React Bits `TiltedCard`) | Hover memiringkan kartu secara 3D. |
| Cara kerja | Garis yang tergambar saat scroll | Nomor berubah indigo ke oranye saat tersentuh garis. |
| Penutup | Tombol magnet (React Bits `Magnet`) | Tombol tertarik ke kursor. |

Model 3D dibuat dari kode (`components/models/ProceduralModels.tsx`), sesuai koordinat penanda di `lib/presets.ts`. File `.glb` di `public/models/` otomatis menggantikannya bila ada.

Aturan yang dipegang: tidak ada petunjuk "scroll" berupa panah/ikon mouse, tidak ada penghitung "01 / 06", tidak ada scroll-jacking (scroll tetap normal, bagian hanya terkunci), `prefers-reduced-motion` mematikan parallax, pin, dan marquee, dan model diganti lewat chip mapel.

## Komponen React Bits yang dipakai (semua gratis, palet tidak berubah)
Disalin ke `components/reactbits/` dari registry publik, tanpa WebGL kecuali yang disebut.
| Komponen | Dipakai di |
|---|---|
| `TechText` | Judul hero (garis ukur putus-putus mengikuti kursor, huruf bisa digeser). Kanvas dibuat lebih besar dari teks agar tidak terpotong. |
| `BlurText` | Judul section landing dan judul halaman guru |
| `ShinyText` | Chip hero, label "Panel Guru", status asisten suara saat mendengarkan |
| `SpotlightCard` | Kartu fitur landing dan kartu langkah halaman guru (sorotan cyan mengikuti kursor, permukaan dipaksa ke palet) |
| `StarBorder` | Tombol utama "Simpan materi & tampilkan" |
| `GlareHover` | Kartu pratinjau halaman guru |
| `CountUp` | Angka "5 mata pelajaran" dan jumlah penanda |
| `ClickSpark` | Percikan oranye saat klik di landing dan halaman guru |
| `ScrollVelocity`, `TiltedCard`, `Magnet` | Pita mapel, kartu mapel, tombol penutup |

Pernah dicoba lalu dibuang: `Particles` (membuat latar hero pucat).

## Maskot AI
Obrolan SYVA (landing) dan pertanyaan bebas di Lab Siswa memakai Groq lewat `app/api/syva/route.ts` (key `GROQ_API_KEY` di `.env.local`, hanya di server). Tanpa key, SYVA memakai model kecil di browser (WebLLM) setelah pengguna menyetujui unduhan.
