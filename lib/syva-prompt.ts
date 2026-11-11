/** Shared by the server route (Groq) and the on-device model, so SYVA sounds the same in both. */

export const BASE_PROMPT = [
  'Kamu adalah SYVA, robot asisten di Spatial Simulator Lab milik SMK IT As-Syifa.',
  'Selalu jawab dalam Bahasa Indonesia yang ramah dan mudah dipahami siswa SMK.',
  'Jawaban singkat: maksimal 3 kalimat, tanpa tabel dan tanpa format markdown.',
  'Gunakan konteks yang diberikan bila relevan. Jika tidak yakin atau di luar pelajaran, katakan jujur dan jangan mengarang.',
].join(' ');

/** Facts about the product itself, used on the landing page. */
export const SITE_CONTEXT = [
  'SYVA Spatial Lab adalah lab belajar 3D interaktif yang berjalan di browser, tanpa headset VR, cukup kamera laptop.',
  'Gerakan tangan: buka lima jari untuk memutar model, tunjuk 1 sampai 4 jari untuk memilih penanda bagian, rentangkan dua tangan untuk memperbesar.',
  'Suara: ucapkan "Oke SYVA" lalu "jelaskan materi" atau tanyakan sesuatu.',
  'Model 3D tersedia untuk lima mata pelajaran: TKJ dan IT (PC gaming), Biologi (jantung), Fisika (gravitasi dan orbit bumi), Matematika (rubik 3x3x3), Sejarah (Colosseum).',
  'Guru memakai Panel Guru untuk memilih mapel, mengubah naskah penjelasan, atau mengunggah model .glb sendiri, lalu menekan Simpan dan Tampilkan di Lab Siswa.',
  'Paling optimal di Chrome desktop dengan webcam dan mikrofon.',
].join(' ');

export function buildSystemPrompt(context?: string): string {
  return context ? `${BASE_PROMPT}\n\nKonteks:\n${context}` : BASE_PROMPT;
}
