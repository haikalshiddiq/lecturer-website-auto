# Log pendalaman IASD

## S01: SDLC dan analisis sistem (24 Oktober 2026, WIB)

- Pemilihan: riwayat IASD hanya menunjukkan integrasi lampiran dan manifest rilis; belum ada suplemen per sesi. Mulai dari sesi 01 sebagai fondasi, bukan karena mengasumsikan progres mahasiswa. Sesi 02–16 belum mendapat pendalaman tambahan.
- Perubahan tunggal: latihan keputusan siklus kerja Aruna, dengan worked example input → penalaran → hasil → batas bukti; prediksi tindakan awal pada empat kombinasi perubahan kebutuhan/akses stakeholder; alasan jawaban benar/salah; koreksi miskonsepsi; transfer individu reservasi ruang rapat; fasilitasi dan rubrik diagnostik.
- Tempat tampil: disclosure tab Konsep, simulator sesi 01, instruksi artefak pada tab Bukti dan disclosure Panduan dosen. Overview hanya menambah satu tautan. Tidak mengubah homepage umum.
- Artefak individu: empat baris penalaran di catatan nomor 3, ikut mekanisme catatan/lembar kerja lama. KEY, versi baseline, validator cadangan dan syarat penyelesaian lama tidak diubah; state simulator hanya menambah dua field opsional yang kompatibel.
- Dasar materi: seluruh sesi 01 dan kasus Aruna pada lampiran; tanpa klaim faktual eksternal baru. Akses kasir, frekuensi perubahan dan kondisi ruang rapat dilabeli asumsi kelas. Tidak memverifikasi RPS asli atau menetapkan nilai resmi.
- Alasan desain: ENERGY 1 / RHYTHM 2 / MOTION 1, mengikuti studio ringkas yang sudah ada. Panel/disclosure memisahkan contoh mendalam tanpa memperpanjang halaman awal; select dan tombol lama dipakai untuk prediksi; warna/font/fokus lama menjaga konsistensi kedua tema; tidak menambah ikon, ilustrasi atau animasi dekoratif.
- Bukti TDD: tes baru mula-mula gagal pada selector `s1Decision` yang belum ada; setelah implementasi, smoke desktop seluruh 16 sesi dan 48 jawaban kuis lulus, termasuk unduhan 13 berkas, persistensi, cadangan dan offline. Pemeriksaan hash baseline serta build juga lulus. Gate akhir mengulang seluruh pemeriksaan dan menambah keyboard, invalidasi feedback, isolasi sesi dan penggunaan suplemen offline.
- Status catatan ini: implementasi dan verifikasi lokal, bukan klaim publikasi. Publikasi hanya sah jika perintah maintainer selesai dan manifest revisi serta data produksi dibaca kembali; bukti hasil akhir disampaikan pada laporan run.
- Mahasiswa: https://hicall.web.id/iasd/studio#1
- Dosen: https://hicall.web.id/iasd/studio?mode=teach#1
