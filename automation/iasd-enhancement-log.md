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

## S02: Elisitasi kebutuhan (25 Oktober 2026, WIB)

- Pemilihan: membaca sesi 02 lengkap, kasus Aruna, template interview.csv/requirements.csv dan log S01. S02 adalah sesi berikutnya tanpa suplemen; bukan perkiraan progres mahasiswa. S03–16 belum mendapat pendalaman tambahan.
- Satu pendalaman: jejak kutipan → klarifikasi → FR01/NFR01 berversi → kriteria stok → batas bukti. Ada dua hasil stok, perubahan batas dua/lima detik, status persetujuan terpisah dari pemenuhan batas, miskonsepsi, transfer peminjaman proyektor, dan rubrik diagnostik empat kriteria untuk dosen. Semua angka serta persetujuan dilabeli asumsi kelas; template CSV lampiran tetap kosong dan utuh, bukan bukti wawancara yang direka.
- Render: disclosure contoh tab Konsep, disclosure latihan dalam simulator sesi 02, instruksi empat baris pada tab Bukti, dan disclosure fasilitasi tab dosen. Overview tetap satu baris tautan pendalaman. Homepage umum tidak diubah.
- Perbaikan terkait sesi 02: feedback klasifikasi kini terikat kutipan/kategori yang diperiksa, sehingga perubahan tidak menyisakan hasil seolah sudah dinilai. Cadangan lama tanpa field tambahan diterima; feedback lama perlu diperiksa lagi, bukan menghapus progres. KEY, versi, validasi cadangan, syarat selesai dan baseline tidak diubah.
- Desain: antislop DURING; membaca ini sebagai workspace pembelajaran mahasiswa/dosen berbahasa Indonesia, gaya akademi ringkas yang ada, ENERGY 1 / RHYTHM 2 / MOTION 1. Biru/slate menandai tindakan; font lokal lama menjaga kontinuitas; disclosure menjaga hierarki dan ringkasnya navigasi; jarak label serta select 44px memudahkan sentuhan. Tidak ada aset, ikon, ilustrasi, efek atau animasi baru. Contoh tetap terbuka atas tindakan pengguna, bukan dekorasi.
- Bukti RED: smoke terhadap produksi sebelum implementasi gagal pada `Changed quote must invalidate classification feedback`. Uji target sentuh kemudian menemukan select 41px; diperbaiki dengan CSS hanya pada latihan S02, bukan melonggarkan tes. Preview debug milik run sempat menghalangi preview smoke; dihentikan lalu smoke diulang.
- Bukti GREEN lokal: build Astro selesai tanpa error/warning/hint; hash sumber dan embedded baseline identik; gate 174 halaman LMS lulus; smoke desktop/mobile seluruh 16 sesi, 48 jawaban kuis, simulator, tab dosen, progres, cadangan baru/lama, 13 unduhan byte-identik dan offline lulus. Tes tambahan memeriksa seluruh pasangan kutipan/kategori, pilihan benar/salah pada kombinasi stok/persetujuan, perubahan SLA, invalidasi feedback, persistensi, isolasi sesi, dan penggunaan S02 offline.
- Click-through baru: pilih kartu/kategori → feedback benar/salah; ubah kutipan → feedback menunggu pemeriksaan; buka latihan dengan Enter → kontrol muncul; kelima select → skenario tersimpan; Periksa dua prediksi dengan Enter → alasan stok/persetujuan/waktu; ubah batas → hasil lama tidak ditampilkan; reload → pilihan/hasil pulih; buka contoh → FR01-v0 tampil; tab Bukti → transfer proyektor; tab dosen → fasilitasi/rubrik; mode terang/gelap → teks tambahan yang dipindai memenuhi AA; kelima select → fokus terlihat, navigasi Tab/Shift+Tab dan tinggi minimal 44px; mobile → tidak overflow.
- Gate perubahan, Hard PASS: R-02/R-17/R-18/R-23/R-36/R-38, JSON suplemen tanpa em dash dan seluruh angka/skenario dilabeli asumsi, tanpa klaim/testimoni/aset rekaan. R-03/R-25/R-32/R-34/R-35, smoke kedua viewport/tema, pemeriksaan computed contrast/fokus/tap-target dan click-through di atas. R-24/R-26, tautan hanya route studio aktif dan semua kontrol baru diuji. R-27, data bundel sinkron memakai pesan boot/penyimpanan/invalid-backup yang sudah ada, prediksi belum diperiksa serta jawaban salah memiliki feedback. R-28, tidak menambah FAQ. R-33, perubahan langsung pada sumber. R-37, arah dan dials memakai studio yang ada.
- Gate perubahan, Purpose PASS: R-01/R-04/R-06/R-07/R-08/R-09/R-10/R-12/R-13/R-14/R-19/R-22, tidak menambah teknik dekoratif; warna/font lama, alasan disclosure serta jarak kontrol tercatat. Liveliness PASS: dials eksplisit, fokus pada keputusan kebutuhan, aksen aksi tunggal, pola jejak bukti Aruna, whitespace untuk label. Craft/Quality PASS: C-1..C-5 dan R-05/R-11/R-15/R-16/R-20/R-21/R-29/R-30/R-31, komposisi berbasis tugas asli, CTA spesifik, tanpa marketing/kloning, radius/palette/dua tema lama dipertahankan. Ini gate perubahan S02, bukan klaim mengaudit ulang semua teks lampiran yang wajib immutable.
- Batasan: tidak ada klaim eksternal baru atau pengukuran performa nyata. Konkurensi dan pembayaran tidak diuji oleh latihan ini. Rubrik bukan nilai resmi; RPS asli belum tersedia. Materi lain dan dashboard tidak diedit oleh run ini.
- Status log: implementasi dan bukti lokal, belum klaim publikasi. Perintah maintainer wajib mengulang gate, deploy dan membaca revisi serta baseline produksi; kegagalan tidak boleh dicatat sebagai sudah terbit. Bukti live final dilaporkan pada keluaran run.
- Mahasiswa: https://hicall.web.id/iasd/studio#2
- Dosen: https://hicall.web.id/iasd/studio?mode=teach#2

## S03: BPMN proses bisnis (26 Oktober 2026, WIB)

- Pemilihan: worktree bersih diperbarui ff-only ke origin/main `8ab3966`; sesi 03 dibaca lengkap bersama kasus Aruna, berkas lampiran dan log S01/S02. S03 adalah sesi berikutnya tanpa pendalaman; tidak mengasumsikan progres mahasiswa. Materi beku serta dashboard tidak diedit.
- Satu pendalaman: jejak A/B stok cukup/kurang, token cabang aktif versus tidak pernah diaktifkan, penyebab parallel join macet setelah exclusive split, perbaikan exclusive merge dan batasnya. Transfer perpustakaan membedakan alternatif stok dari dua pekerjaan paralel wajib, bukan menyarankan semua gateway diganti X.
- Render: contoh dan miskonsepsi pada disclosure Konsep; prediksi hasil token memakai diagram/simulator BPMN yang sudah ada; empat baris bukti pada tab individu; fasilitasi prediksi → demonstrasi → penjelasan → transfer dengan rubrik diagnostik pada tab dosen. Overview memakai tautan pendalaman yang sudah ada. Homepage dan navigasi tetap.
- Kompatibilitas: field s3Outcome/s3Reviewed opsional dalam sim; KEY, versi course, validasi cadangan, catatan dan syarat selesai tidak diubah. Feedback terikat stok/join/prediksi, bukan boolean lama. Posisi token terpisah dari prediksi hasil setelah task selesai dan dinyatakan di label. Tidak menambah topologi paralel palsu pada diagram stok.
- Dasar: konsep BPMN dan batas pool/lane yang sudah tercantum di lampiran. Tidak menambah klaim eksternal baru. Jumlah token, kondisi eksklusif dan task selesai adalah asumsi kelas; bukan observasi toko atau hasil validator XML. RPS asli tetap tidak tersedia; rubrik bukan nilai resmi.
- Desain, antislop DURING: workspace akademi ringkas mahasiswa/dosen berbahasa Indonesia, ENERGY 1 / RHYTHM 2 / MOTION 1. Biru/slate dan font lokal lama menjaga kontinuitas; disclosure menahan panjang halaman; select prediksi memiliki target 44px dan CTA spesifik; diagram lama menjelaskan cabang, bukan dekorasi. Tidak ada aset, ikon, warna atau animasi baru.
- Bukti RED: smoke desktop terhadap produksi sebelum implementasi gagal menunggu `select[data-setting="s3Outcome"]` (timeout 7000ms). Tes baru mencakup dua stok × dua join × dua prediksi, alasan benar/salah, invalidasi, reload, transfer, dosen, Tab/Shift+Tab/Enter, fokus, target sentuh, kontras teks terpindai pada dua tema, overflow dan penggunaan offline. Cadangan lama tanpa field s3 juga dimasukkan ke gate.
- Status sebelum rilis: implementasi sumber, belum klaim publikasi atau hasil GREEN. Perintah maintainer wajib menjalankan seluruh gate; bukti aktual setelahnya dicatat di bawah.
- GREEN dan publikasi terverifikasi: maintainer exit 0 menjalankan validasi konten/link, lint Astro, build, gate LMS, smoke desktop/mobile/PWA/offline, hash baseline dan Impeccable. Commit konten `82a784fc5a6ec53a9719bbc55d3cbc19b0901ee3` sama dengan origin/main saat pemeriksaan. Deployment `https://vc-lecturer-6dhak56se-hicall-projects.vercel.app`; manifest produksi sama persis dengan sumber, revision `7fba48e6e09953ce607fef34905ad96c9a8a1b6a34784a1ebfd444b15a4a5860`, baseline studio produksi identik. Read-back tambahan memakai urllib mendapat 403; jalur fetch_live milik maintainer berhasil HTTP 200 dan perbandingan objek lengkap, bukan mengabaikan kegagalan.
- Verifikasi produksi terpisah setelah deploy: `runIasdSmoke` terhadap https://hicall.web.id pada desktop 1440×900 dan mobile 390×844 exit 0. Masing-masing menjalankan 16 sesi, 48 jawaban kuis, seluruh simulator, tab dosen, persistensi, cadangan baru/lama, penolakan cadangan salah, serta offline. Seluruh 13 unduhan desktop dibandingkan isi persis dengan lampiran. Tidak ada pageerror. Hasil mesin berada di output/playwright/iasd-{desktop,mobile}-results.json (artefak ignored, bukan konten terbit).
- Click-through S03: stok/join/prediksi → alasan benar/salah; ganti stok → feedback menunggu; Enter pada Periksa → hasil; reload → hasil pulih; Enter pada contoh → jejak A/B; tab Bukti → transfer perpustakaan; tab dosen/disclosure → fasilitasi/rubrik; Tab/Shift+Tab → fokus kembali terlihat dan select ≥44px; kedua tema → kontras teks terpindai AA; mobile → tanpa overflow; offline reload → prediksi tetap berfungsi.

### Gate perubahan S03 (bukan audit ulang teks lampiran immutable)

- R-02 PASS: validator suplemen menolak em dash; build/validator lulus.
- R-03 PASS: smoke desktop/mobile memeriksa overflow sesudah contoh dibuka, kedua tema.
- R-17 PASS: jumlah token diberi asumsi kelas, tanpa statistik pengguna.
- R-18 PASS: tidak menambah testimoni atau identitas rekaan.
- R-23 PASS: memakai diagram/kontrol lama; tidak membuat logo/avatar/aset baru.
- R-24 PASS: hanya URL studio aktif #3 dan mode=teach; keduanya diuji.
- R-25 PASS: computed contrast teks suplemen, prediksi dan feedback terpindai AA di kedua tema.
- R-26 PASS: select mengubah skenario, Periksa memberi alasan, disclosure terbuka; click-through di atas.
- R-27 PASS: bundel sinkron memakai boot/error penyimpanan lama, status belum diperiksa dan jawaban salah tersedia.
- R-28 PASS: tidak menambah FAQ.
- R-32 PASS: Enter, Tab/Shift+Tab dan fokus terlihat diuji; Escape memakai handler details lama.
- R-33 PASS: perubahan langsung pada sumber, bukan script penulis ulang UI.
- R-34 PASS: prediksi, teks dan overflow diuji pada tema terang/gelap.
- R-35 PASS: maintainer serta smoke produksi exit 0; click-through tercatat di atas.
- R-36 PASS: tidak ada klaim keamanan/performa atau pelanggan baru.
- R-37 PASS: arah studio lama dan Design Read/dials dinyatakan sebelum perubahan.
- R-38 PASS: seluruh skenario diberi label latihan/asumsi; tidak menyamarkan hasil sebagai transaksi nyata.
- R-01 PASS: tidak menambah gradien/glow; warna aksi lama dipertahankan.
- R-04 PASS: tidak menambah ikon.
- R-06 PASS: font lokal lama menjaga kontinuitas pembacaan, tanpa tipografi dekoratif baru.
- R-07 PASS: tidak menambah pola latar.
- R-08 PASS: panah pada jejak menyatakan urutan proses, bukan dekorasi CTA.
- R-09 PASS: tidak menambah badge.
- R-10 PASS: tidak menambah blur.
- R-12 PASS: tidak menambah shadow.
- R-13 PASS: tidak menambah glow.
- R-14 PASS: tidak menambah grid feature-card; contoh dalam disclosure berbasis tugas.
- R-19 PASS: MOTION 1 memakai perilaku/fokus lama, tanpa animasi baru.
- R-22 PASS: diagram stok lama relevan langsung pada penalaran token; tanpa ilustrasi dekoratif.
- Liveliness PASS: ENERGY 1 / RHYTHM 2 / MOTION 1; fokus keputusan token, aksen tindakan biru, whitespace label, motif jejak bukti Aruna; disclosure membedakan konsep/praktik/dosen dan menjaga halaman ringkas.
- C-1 PASS: alasan warna, layout, font, jarak dan diagram tercatat dalam Design Read di atas.
- C-2 PASS: seluruh kontrol baru berfungsi dalam smoke produksi.
- C-3 PASS: tidak menambah section pemasaran/template; hanya tugas sesi 03.
- C-4 PASS: state belum diperiksa/salah/tersimpan, dua tema, dua viewport, keyboard dan offline diuji.
- C-5 PASS: asumsi dinyatakan, bukan data observasi atau nilai resmi.
- R-05 PASS: struktur Konsep/Bukti/Dosen/disclosure mengikuti kebutuhan pelajaran, bukan landing-page template.
- R-11 PASS: radius kontrol lama dipertahankan.
- R-15 PASS: CTA spesifik Periksa prediksi token.
- R-16 PASS: tidak menambah buzzword pemasaran.
- R-20 PASS: contoh dan motif jejak token memakai kasus Aruna yang nyata dalam lampiran.
- R-21 PASS: toggle dua tema tetap aktif dan diuji.
- R-29 PASS: palette lama tanpa warna baru.
- R-30 PASS: tidak mengkloning produk lain.
- R-31 PASS: alasan desain tercatat; perubahan CSS hanya minimum tinggi select prediksi.
- Batasan: gate kontras adalah pemindaian computed text yang diuji, bukan sertifikasi aksesibilitas seluruh aplikasi. Simulator bukan validator BPMN lengkap; loop, XML dan transaksi nyata tidak diuji. RPS asli tidak diverifikasi dan rubrik bukan nilai resmi. Pembaruan log bukti ini tidak mengubah revisi konten; rilis log wajib melewati maintainer lagi.
- Mahasiswa: https://hicall.web.id/iasd/studio#3
- Dosen: https://hicall.web.id/iasd/studio?mode=teach#3
