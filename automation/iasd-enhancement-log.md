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

## S04: Use case dan skenario (27 Oktober 2026, WIB)

- Pemilihan: worktree awal bersih, fetch dan ff-only dari origin/main ke `88e4e08` sebelum authoring. Membaca sesi 04 lengkap, kasus Aruna, usecase_detail.csv, requirements.csv serta log S01–S03. S04 berikutnya tanpa suplemen, bukan inferensi progres mahasiswa. S05–16 belum mendapat pendalaman tambahan.
- Satu pendalaman: kontrak UC01 dengan boundary tetap Aplikasi Aruna, aktor versus komponen internal, UC01-M reservasi dan UC01-A stok berubah, precondition yang tidak menutup alur alternatif, dua postcondition serta AC-M/AC-A menuju FR01. Prediksi menggabungkan klasifikasi peran dan hasil stok; pilihan lunas memberi koreksi eksplisit bahwa reservasi bukan bukti pembayaran.
- Render: disclosure Konsep, tambahan kontrol pada simulator use case lama, transfer peminjaman kamera serta empat baris artefak lokal pada tab Bukti, fasilitasi/rubrik pada tab dosen, satu tautan overview. Tidak mengubah homepage umum, tab atau navigasi sesi. Penjelasan kasus mengakui kasir tetap perlu dimodelkan di artefak lengkap.
- Dasar/batas: semua fakta berasal dari sesi/kasus lampiran, tanpa klaim eksternal baru. Stok, reservasi sebelum pembayaran dan hasil contoh dilabeli asumsi kelas; bukan implementasi atau observasi toko. RPS asli tetap tidak tersedia, bobot usulan dan latihan ujian publik tidak berubah. Tidak mengklaim konkurensi, penagihan atau serah-terima diuji.
- Kompatibilitas: field s4Stock/s4Role/s4Outcome/s4Reviewed opsional di sim. KEY, versi, validator cadangan, syarat selesai, baseline lampiran dan 13 berkas tetap. Cadangan lama tanpa field s4 mempertahankan catatan dan mulai prediksi belum diperiksa; cadangan baru mengembalikan feedback serta catatan S04.
- Design Read sebelum generasi, antislop DURING sesuai preferensi tersimpan: workspace akademi ringkas mahasiswa/dosen berbahasa Indonesia, ENERGY 1 / RHYTHM 2 / MOTION 1. Warna biru/slate lama menandai tindakan; font lokal menjaga kontinuitas; disclosure menjaga halaman ringkas; jarak/kontrol minimum 44px untuk sentuhan; diagram boundary lama untuk alasan aktor, bukan urutan pesan. Tidak membuat aset, ikon, warna, kartu atau gerak dekoratif.
- RED: smoke desktop terhadap produksi lama gagal timeout 7000ms pada `select[data-setting="s4Stock"]` sebelum implementasi. GREEN final lokal: `npm run build && npm run smoke:pwa` exit 0, 188 halaman dibangun, gate 174 halaman pembelajaran dan hash sumber/embedded IASD lulus; smoke desktop/mobile/PWA/offline lulus. Log mesin: scratch/iasd-s04-build.log dan scratch/iasd-s04-smoke.log, hasil/screenshot output/playwright/iasd-s04-{desktop,mobile}.png serta iasd-{desktop,mobile}-results.json (ignored).
- Cakupan tes S04: tiga aktor × dua stok × dua prediksi peran × tiga prediksi hasil, alasan benar/salah, invalidasi saat stok berubah, reload, catatan transfer lokal, isolasi sesi setelah grading, impor lama/baru, instructor permalink #4, penggunaan offline. Smoke regresi mempertahankan semua 16 sesi/48 jawaban kuis/simulator/tab serta 13 unduhan desktop isi identik lampiran.
- Click-through: tautan overview 04 → studio sesi 04; actor/stok/peran/postcondition → skenario berubah; Periksa kontrak UC01 dengan Enter → alasan benar/salah; stok diubah → hasil lama tidak ditampilkan; reload → pilihan/hasil pulih; summary contoh Enter → UC01-M/UC01-A, Escape → tutup, Enter → buka; tab Bukti → transfer kamera, ketik/reload → catatan pulih; panduan dosen #4/summary → prediksi/demonstrasi/penjelasan/transfer/rubrik; kedua tema → teks terpindai memenuhi AA; empat select → Tab/Shift+Tab mengembalikan fokus terlihat dan tinggi ≥44px; mobile → tanpa overflow; offline → prediksi serta contoh tetap tersedia. Tidak ada pageerror pada smoke.
- Status penulisan awal log: bukti implementasi dan verifikasi lokal, belum klaim publikasi pada saat ditulis. Bukti berikut ditambahkan hanya setelah maintainer dan pemeriksaan produksi benar-benar selesai.
- Publikasi konten terverifikasi: `python3 /home/ubuntu/.hermes/scripts/hicall_iasd_maintainer.py` exit 0; gate konten/link/lint/build/LMS/desktop/mobile/PWA/offline, baseline dan Impeccable lulus sebelum commit/deploy. Commit konten `330d3fdf1ad89e8a3a347f0b9e9dda9cb78c2a8b` sama dengan origin/main saat dibaca kembali. Deployment `https://vc-lecturer-7waihwoob-hicall-projects.vercel.app`.
- Bukti live exact read-back via fetch_live: HTTP 200 dan objek manifest sama persis dengan sumber, revision `625a05179aff2fb9be8c07b72f2677c531b377935c53c90f3e59ed58a842270f`; course-data serta seluruh supplement-data pada studio produksi sama persis dengan sumber. S04 berjudul UC01: layar berhasil bukan kontrak checkout benar-benar terbundel.
- GREEN produksi tambahan: runIasdSmoke terhadap https://hicall.web.id pada desktop 1440×900 dan mobile 390×844 exit 0; kedua profil mengulang semua 16 sesi, 48 jawaban kuis, simulator, catatan, cadangan lama/baru/salah, permalink dosen #4, prediksi S04 offline dan semua kontrol tambahan. Seluruh 13 unduhan desktop dibandingkan isi identik lampiran. Tidak ada pageerror. Gate R-35 produksi PASS dengan click-through yang sama, bukan hanya HTTP 200/build/push.
- Inspeksi browser produksi tambahan: tampilan desktop 1280px dan emulasi mobile 390px dilihat langsung; tombol Periksa kontrak UC01 menghasilkan alasan UC01-A, overflow nol, empat select mobile tinggi 44px/lebar 328px. Screenshot memperlihatkan diagram/kontrol/feedback tetap terpisah tanpa benturan. Ini pemeriksaan viewport, bukan audit visual setiap halaman.
- Pembaruan log bukti tidak mengubah revisi konten; wajib melewati maintainer lagi sebelum commit log. Bukti commit akhir dicatat pada keluaran run.

### Gate perubahan S04 (bukan audit ulang lampiran immutable)

- R-02 PASS: validator JSON suplemen menolak em dash; validasi setelah build lulus.
- R-03 PASS: smoke kedua viewport/tema memeriksa overflow setelah contoh diperluas; empat select ≥44px.
- R-17 PASS: jumlah stok serta reservasi dilabeli asumsi, bukan statistik nyata.
- R-18 PASS: tidak menambah testimoni atau identitas rekaan.
- R-23 PASS: diagram serta kontrol lama digunakan, tanpa logo/avatar/aset baru.
- R-24 PASS: tautan overview #4 dan permalink dosen #4 benar-benar dibuka dalam smoke.
- R-25 PASS: computed contrast teks contoh, label/select dan feedback terpindai AA di kedua tema.
- R-26 PASS: empat select, tombol Periksa, disclosure dan tautan diuji sesuai click-through.
- R-27 PASS: bundel sinkron memakai boot/error lama; prediksi belum diperiksa, salah, tersimpan dan invalid-backup diuji.
- R-28 PASS: tidak menambah FAQ.
- R-32 PASS: Enter/Escape, Tab/Shift+Tab dan fokus terlihat diuji.
- R-33 PASS: implementasi langsung pada sumber, tanpa script penulis ulang UI.
- R-34 PASS: kedua tema mempertahankan kontrol, fokus, kontras terpindai dan layout.
- R-35 PASS: build/smoke lokal dan smoke produksi dua viewport exit 0, click-through per kontrol di atas; maintainer membaca exact revisi serta baseline live.
- R-36 PASS: tidak ada klaim keamanan, performa atau pelanggan baru.
- R-37 PASS: arah studio serta Design Read/dials dinyatakan sebelum generasi.
- R-38 PASS: skenario berlabel latihan/asumsi, bukan transaksi atau nilai resmi.
- R-01 PASS: tidak menambah gradien/glow; aksen biru tindakan lama dipertahankan.
- R-04 PASS: tidak menambah ikon.
- R-06 PASS: font lokal lama menjaga kontinuitas pembacaan.
- R-07 PASS: tidak menambah pola latar.
- R-08 PASS: tidak menambah panah dekoratif pada CTA.
- R-09 PASS: tidak menambah badge.
- R-10 PASS: tidak menambah blur.
- R-12 PASS: tidak menambah shadow.
- R-13 PASS: tidak menambah glow.
- R-14 PASS: tidak menambah grid kartu; contoh sesuai tugas dalam disclosure.
- R-19 PASS: MOTION 1 memakai interaksi/fokus lama, tanpa animasi baru.
- R-22 PASS: diagram boundary lama langsung relevan terhadap klasifikasi aktor, tanpa ilustrasi dekoratif.
- Liveliness PASS: ENERGY 1 / RHYTHM 2 / MOTION 1, fokus kontrak checkout, aksen biru tindakan, whitespace label, motif jejak bukti Aruna, variasi Konsep/Bukti/Dosen/disclosure, Design Read sebelum generasi.
- C-1 PASS: alasan warna, font, layout, jarak dan diagram tercatat di Design Read.
- C-2 PASS: setiap kontrol tambahan memiliki hasil teruji.
- C-3 PASS: hanya kontrak/latihan sesi 04, tanpa section pemasaran/template.
- C-4 PASS: belum diperiksa/salah/tersimpan, dua tema/viewport, keyboard, backup serta offline diuji.
- C-5 PASS: asumsi dinyatakan, tanpa klaim observasi/penilaian resmi.
- R-05 PASS: komposisi mengikuti tugas dan tab/disclosure, bukan landing-page generik.
- R-11 PASS: radius kontrol lama dipertahankan.
- R-15 PASS: CTA spesifik Periksa kontrak UC01.
- R-16 PASS: tidak menambah buzzword pemasaran.
- R-20 PASS: identitas jejak UC01/FR01 memakai kasus Aruna yang disediakan.
- R-21 PASS: toggle kedua tema tetap aktif dan diuji.
- R-29 PASS: palette lama, tanpa warna tambahan.
- R-30 PASS: tidak mengkloning produk lain.
- R-31 PASS: alasan desain tercatat; CSS hanya minimum target sentuh empat select sesi 04.
- Batasan gate: computed contrast hanya teks yang dipindai, bukan sertifikasi aksesibilitas seluruh aplikasi. Simulator bukan validator UML atau backend transaksi. Catatan lokal tidak dikirim otomatis. Materi beku, antrean, dependensi bersama, baseline dan dashboard tidak diedit.
- Mahasiswa: https://hicall.web.id/iasd/studio#4
- Dosen: https://hicall.web.id/iasd/studio?mode=teach#4

## S05: Activity diagram (28 Oktober 2026, WIB)

- Pemilihan: worktree awal bersih, ff-only ke origin/main `09607de` sebelum authoring. Membaca seluruh sesi 05, kasus Aruna, starter/test_cases.csv serta log S01–S04. S05 adalah sesi berikutnya tanpa suplemen; bukan inferensi progres mahasiswa. S06–16 belum mendapat pendalaman tambahan.
- Satu pendalaman: membedakan token lolos dari izin bisnis alamat DAN label; jejak A/B parsial sebagai contoh lawan merge, C semua-selesai, D tanpa token; prediksi tiga hasil dengan alasan benar/salah; transfer sertifikat dengan decision/guard/bypass/merge sebelum join, serta rubrik diagnostik empat kriteria. Tidak menambah simulator opsional palsu: topologi opsional tetap tugas menggambar individu, snapshot hanya menguji dua pekerjaan wajib.
- Render: disclosure Konsep, prediksi dalam simulator activity lama, transfer/catatan lokal pada Bukti, fasilitasi dalam disclosure dosen. Overview mengganti tautan pendalaman terbaru, tidak menumpuk katalog atau memperpanjang homepage umum. Memperbaiki feedback snapshot merge tanpa token yang sebelumnya keliru menyebut join.
- Sumber primer: https://www.omg.org/spec/UML/2.5.1/PDF, HTTP 200, dibaca 28 Oktober 2026 WIB. Bagian 15.3.3.3 (halaman tercetak 388) memperingatkan guarded fork yang menghilangkan token ke join dan menyarankan decision/bypass; 15.3.3.4–15.3.3.5 (389) menyatakan AND default dan merge tanpa sinkronisasi; Gambar 15.39 (393) menunjukkan dua eksekusi setelah dua kedatangan. PDF dan ekstraksi disimpan di scratch, tidak dimasukkan ke baseline atau dependensi proyek. Join khusus/joinSpec bukan cakupan latihan.
- Kompatibilitas: hanya field sim opsional s5Outcome/s5Reviewed; signature terikat penyatuan, kedua pekerjaan dan prediksi. KEY, versi, validator backup, syarat selesai, baseline/13 berkas tidak diubah. Impor cadangan lama tanpa field s5 mempertahankan catatan dan meminta pemeriksaan baru; backup baru memulihkan hasil.
- Design Read sebelum generasi, antislop DURING: workspace akademi ringkas mahasiswa/dosen Indonesia, ENERGY 1 / RHYTHM 2 / MOTION 1. Warna aksi/font lokal lama untuk kontinuitas, disclosure untuk hierarki tanpa panjang awal, whitespace label dan target 44px untuk sentuhan, diagram activity lama untuk membandingkan penyatuan. Tidak ada aset/ikon/palette/efek/animasi baru.
- RED: smoke terhadap produksi lama gagal timeout 7000ms pada `select[data-setting="s5Outcome"]`. GREEN lokal: `npm run build && npm run smoke:pwa` exit 0; 188 halaman, gate 174 halaman LMS dan baseline sumber/embedded lulus. Desktop/mobile masing-masing 16 sesi dan 48 jawaban kuis, simulator, instructor, persistensi, backup lama/baru/salah dan offline; seluruh 13 unduhan desktop identik lampiran. Homepage desktop 1038px dari budget 1400px, mobile 1789px dari budget 2200px. Log mesin scratch/iasd-s05-{red,build,smoke}.log, hasil output/playwright/iasd-{desktop,mobile}-results.json.
- Click-through S05: join/merge dan dua checkbox → diagram berubah; prediksi tiga pilihan × delapan snapshot → feedback benar/salah dengan alasan; Enter pada Periksa izin kirim → hasil; ubah status → hasil lama tidak ditampilkan; reload → hasil pulih; Enter/Escape contoh → buka/tutup; Bukti → transfer sertifikat, ketik/reload → catatan pulih; dosen #5/disclosure → fasilitasi/rubrik; Tab/Shift+Tab select → fokus terlihat/44px; Space kedua checkbox → toggle dan target label 44px; dua tema → computed contrast teks terpindai AA; mobile → tanpa overflow; offline → prediksi/contoh tetap berfungsi. Tidak ada pageerror pada smoke.
- Hard Gate perubahan PASS, R-02: validator suplemen tanpa em dash.
- R-03 PASS: dua viewport tanpa overflow, kontrol target sentuh diuji.
- R-17 PASS: angka hanya struktur jejak/rubrik berlabel latihan, tanpa statistik rekaan.
- R-18 PASS: tanpa testimoni atau identitas baru.
- R-23 PASS: memakai aset/diagram lama, tanpa logo/avatar baru.
- R-24 PASS: tautan overview #5 dan mode=teach#5 dibuka oleh smoke.
- R-25 PASS: computed contrast teks suplemen/kontrol/feedback terpindai AA di dua tema.
- R-26 PASS: setiap kontrol baru diuji sesuai click-through.
- R-27 PASS: boot/error bundel dan penyimpanan lama dipertahankan; belum diperiksa/salah/tersimpan/backup salah diuji.
- R-28 PASS: tanpa FAQ tambahan.
- R-32 PASS: Enter/Escape/Space/Tab/Shift+Tab serta fokus diuji.
- R-33 PASS: perubahan langsung pada sumber, bukan script penulis ulang UI.
- R-34 PASS: kedua tema diuji, warna/font lama dipertahankan.
- R-35 PASS lokal: build dan smoke dua viewport exit 0, click-through tercatat; publikasi belum diklaim.
- R-36 PASS: tanpa klaim keamanan/performa/pelanggan baru.
- R-37 PASS: arah studio lama dan Design Read/dials dinyatakan sebelum generasi.
- R-38 PASS: skenario dan aturan berlabel asumsi, sumber semantik primer dibaca.
- Purpose Gate PASS, R-01/R-04/R-06/R-07/R-08/R-09/R-10/R-12/R-13/R-14/R-19/R-22: tidak menambah teknik dekoratif, ikon, gradien, glow, blur, shadow, pola, badge atau animasi; font untuk kontinuitas, diagram lama untuk penjelasan dan disclosure untuk hierarki, bukan dekorasi.
- Liveliness PASS: dials 1/2/1 eksplisit dan mengikuti studio, fokus keputusan izin kirim, whitespace struktural, satu aksen tindakan lama, motif jejak bukti Aruna, variasi konsep/praktik/transfer/dosen, Design Read sebelum generasi.
- Craft/Quality PASS, C-1..C-5 dan R-05/R-11/R-15/R-16/R-20/R-21/R-29/R-30/R-31: tugas nyata dari lampiran, CTA Periksa izin kirim spesifik, alasan layout/font/spacing/diagram tercatat, radius/palette lama, tanpa template pemasaran/buzzword/kloning; dua tema/state/keyboard/backup/offline diuji. Ini gate perubahan S05, bukan audit ulang teks lampiran immutable.
- Batasan: snapshot tidak menghitung eksekusi, bukan validator UML lengkap atau backend pengiriman. Bypass opsional dijelaskan dan ditugaskan, bukan dieksekusi di diagram dua-checkbox. Pemindaian kontras bukan sertifikasi seluruh aplikasi. Rubrik bukan nilai resmi; RPS asli tidak diverifikasi; catatan tidak dikirim otomatis. Materi beku, antrean, dependensi bersama dan dashboard tidak diedit.
- Status log: implementasi dan verifikasi lokal, belum klaim publikasi. Maintainer wajib mengulang seluruh gate, commit/deploy dan membaca exact revision/baseline produksi; hasil aktual dilaporkan pada keluaran run, bukan menandai published sebelum deploy.
- Mahasiswa: https://hicall.web.id/iasd/studio#5
- Dosen: https://hicall.web.id/iasd/studio?mode=teach#5
- Publikasi konten terverifikasi setelah penulisan log di atas: maintainer exit 0, commit `969265e8991132b9962cd4411fb352ecf3f622d3` sama dengan origin/main, deployment https://vc-lecturer-4oozybv2m-hicall-projects.vercel.app. Manifest produksi HTTP 200 dan objek persis sama dengan sumber, revision `3352b89c89f806dda473253c1ff9385a50451e88967fd4f8e5eccba417b60245`; course-data serta supplement-data produksi identik dengan sumber. Gate konten/link/lint/build/LMS/Impeccable/PWA/offline lulus.
- R-35 produksi PASS: runIasdSmoke terhadap https://hicall.web.id pada desktop 1440×900 dan mobile 390×844 exit 0, mengulang 16 sesi/48 jawaban, simulator, instructor #5, kontrol S05 sesuai click-through di atas, catatan, cadangan lama/baru/salah, offline dan 13 unduhan desktop identik lampiran. Bukti mesin scratch/iasd-s05-live-smoke.log. Pemeriksaan browser produksi tambahan menjalankan skenario merge parsial dengan feedback tepat, overflow mobile 0 dan kedua select tinggi 44px. Pembaruan log bukti ini tidak mengubah revision konten dan wajib dirilis ulang lewat maintainer; commit akhir dicatat pada keluaran run.
