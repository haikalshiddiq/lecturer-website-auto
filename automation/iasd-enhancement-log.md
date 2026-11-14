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

## S06: Sequence diagram (29 Oktober 2026, WIB)

- Pemilihan: worktree awal bersih, fetch dan ff-only ke origin/main `c02048d`; membaca sesi 06 lengkap, kasus Aruna dan log S01–S05. S06 berikutnya tanpa pendalaman, bukan perkiraan progres mahasiswa. S07–16 belum mendapat suplemen tambahan.
- Satu pendalaman: jejak timeout O-AR1/K-AR1, perbedaan keadaan penyedia dan pengetahuan UI, tiga guard alt, query versus pay, hasil cocok/tidak cocok serta invariant callback berulang. Latihan terpisah membandingkan tiga bukti × dua korelasi × tiga keputusan dengan alasan benar/salah. Transfer tiket lokakarya, empat baris bukti lokal, fasilitasi prediksi → demonstrasi → penjelasan → transfer dan rubrik diagnostik.
- Render: disclosure Konsep, disclosure latihan dalam simulator sequence yang dipertahankan, transfer pada Bukti dan disclosure dosen. Overview mengganti tautan terbaru, tidak menambah panjang katalog. Semua rincian kontrak, retensi, korelasi dan hasil adalah asumsi kelas dari konsep lampiran, bukan klaim kemampuan penyedia tertentu. Tidak ada klaim eksternal baru.
- Kompatibilitas: hanya field sim s6Status/s6Identity/s6Decision/s6Reviewed opsional. KEY, versi, validasi cadangan, syarat selesai, baseline dan 13 berkas tidak diubah. Feedback terikat bukti/korelasi/keputusan, bukan boolean lama. Cadangan lama tetap mempertahankan catatan, prediksi baru mulai belum diperiksa.
- Design Read sebelum generasi, antislop DURING: workspace akademi ringkas mahasiswa/dosen Indonesia, ENERGY 1 / RHYTHM 2 / MOTION 1. Warna tindakan dan font lama untuk kontinuitas; disclosure untuk hierarki tanpa panjang awal; whitespace label dan select minimum 44px untuk sentuhan; diagram sequence lama menunjukkan partisipan/pesan, bukan dekorasi. Tidak ada logo, avatar, ikon, warna, kartu, efek atau animasi baru.
- RED: runIasdSmoke desktop terhadap produksi sebelum implementasi gagal timeout 7000ms pada `[data-iasd-recovery] summary`; log scratch/iasd-s06-red.log. Tes ditambah sebelum implementasi, bukan lulus semu tanpa fitur.
- Verifikasi yang diwajibkan untuk rilis: seluruh kombinasi bukti/korelasi/keputusan; invalidasi saat bukti berubah; reload; transfer lokal; isolasi sesi setelah kuis; cadangan lama/baru/salah; permalink dosen #6; keyboard Enter/Escape/Tab/Shift+Tab; fokus/target 44px; kontras computed text dua tema; overflow desktop/mobile; penggunaan latihan offline. Regresi tetap mencakup 16 sesi/48 kuis dan 13 unduhan desktop identik lampiran.
- Click-through yang direkam tes: overview #6 → Sequence; disclosure latihan Enter → tiga select; bukti/korelasi/keputusan → skenario tersimpan; Periksa keputusan pemulihan Enter → alasan; perubahan bukti → hasil lama tidak tampil; reload → hasil pulih; contoh Enter/Escape → buka/tutup; Bukti/ketik/reload → transfer tersimpan; dosen #6/disclosure → fasilitasi/rubrik; select Tab/Shift+Tab → fokus/44px; toggle tema → kedua tema; offline reload → prediksi tetap berfungsi. Status PASS hanya sah setelah perintah tes terkait benar-benar exit 0.
- Gate perubahan, belum klaim PASS saat penulisan: Hard R-02/03/17/18/23/24/25/26/27/28/32/33/34/35/36/37/38 diperiksa lewat validator, scope/diff dan smoke di atas. Purpose R-01/04/06/07/08/09/10/12/13/14/19/22: tidak ada teknik dekoratif baru, font/layout/diagram untuk alasan yang tercatat. Liveliness: dials 1/2/1, fokus keputusan berbukti, aksen tindakan lama, motif jejak Aruna dan whitespace struktural. Craft C-1..C-5, Quality R-05/11/15/16/20/21/29/30/31: tugas sesuai sesi, CTA spesifik, radius/palette/dua tema lama, tanpa template pemasaran/buzzword/kloning. Ini gate perubahan S06, bukan audit ulang teks lampiran immutable.
- Batasan: latihan pemulihan adalah walkthrough bukti terpisah dari hitungan simulator dasar, tidak mengirim query API, memverifikasi callback atau membuktikan exactly-once. Perubahan strategi simulator dasar adalah counterfactual, bukan pembatalan efek sebelumnya. RPS asli belum tersedia, rubrik bukan nilai resmi, catatan lokal tidak dikirim. Materi beku, antrean, dependensi bersama dan dashboard tidak diedit.
- Status: implementasi sumber dengan RED terverifikasi, belum klaim publikasi atau GREEN. Maintainer wajib mengulang gate, commit/deploy dan membaca exact revision/baseline; hasil aktual serta gate final dilaporkan pada keluaran run. Jangan menandai terbit jika deploy gagal.
- Mahasiswa: https://hicall.web.id/iasd/studio#6
- Dosen: https://hicall.web.id/iasd/studio?mode=teach#6
- GREEN pertama: maintainer exit 0, commit `5d89aee87e62939887232228dd4d36d1e3998cdc` sama dengan origin/main; deployment https://vc-lecturer-ialxq5igc-hicall-projects.vercel.app. Manifest dibaca HTTP 200 dan objek sama persis, revision `ce480d2f34ef85470657cbb35cb4ff821c2fbdb815e4bc83f66b8c096aaa2b38`. Baseline dan seluruh suplemen studio produksi identik dengan sumber. Ini bukti versi pertama; koreksi copy kecil berikut beserta log ini harus melewati maintainer lagi sebelum dianggap final.
- GREEN produksi pertama: runIasdSmoke desktop 1440×900 dan mobile 390×844 exit 0, masing-masing 16 sesi/48 jawaban, simulator, instructor #6, catatan, backup lama/baru/salah dan offline; 13 unduhan desktop dibandingkan isi identik lampiran, tanpa pageerror. Log scratch/iasd-s06-live-smoke.log. Browser produksi 390px juga diamati langsung: overflow 0, tiga select 44×328px, kontrol/diagram terpisah tanpa benturan. Koreksi copy sesudah inspeksi: menyebut diagram dasar, bukan diagram atas karena letak diagram mengikuti kontrol.

### Gate perubahan S06, berdasarkan GREEN dan inspeksi di atas

- R-02 PASS: validator suplemen tanpa em dash.
- R-03 PASS: smoke kedua viewport/tema dan browser mobile overflow 0, select 44px.
- R-17 PASS: angka hanya identitas/struktur latihan berlabel asumsi, bukan statistik.
- R-18 PASS: tanpa testimoni baru.
- R-23 PASS: memakai diagram lama, tanpa logo/avatar/aset baru.
- R-24 PASS: overview #6 dan permalink dosen #6 dibuka dalam smoke.
- R-25 PASS: computed contrast teks tambahan terpindai AA pada dua tema.
- R-26 PASS: ketiga select, tombol Periksa, disclosure dan tautan berfungsi sesuai click-through di atas.
- R-27 PASS: boot/error penyimpanan lama, belum diperiksa/salah/tersimpan dan backup salah dipertahankan/diuji; data sinkron tanpa fetch baru.
- R-28 PASS: tanpa FAQ tambahan.
- R-32 PASS: Enter/Escape/Tab/Shift+Tab serta fokus terlihat diuji.
- R-33 PASS: implementasi langsung pada sumber, tanpa script penulis ulang UI.
- R-34 PASS: kedua tema diuji tanpa font/layout baru.
- R-35 PASS: maintainer dan smoke produksi exit 0; click-through per kontrol tercatat, exact manifest/baseline/suplemen dibaca kembali.
- R-36 PASS: tanpa klaim keamanan/performa/pelanggan baru.
- R-37 PASS: arah studio dan Design Read/dials dinyatakan sebelum generasi.
- R-38 PASS: skenario dan kontrak diberi label asumsi, bukan transaksi nyata.
- R-01 PASS: tidak menambah gradien/glow, aksen tindakan lama.
- R-04 PASS: tanpa ikon baru.
- R-06 PASS: font sistem lama untuk kontinuitas baca.
- R-07 PASS: tanpa pola latar baru.
- R-08 PASS: panah hanya urutan pesan, bukan dekorasi CTA.
- R-09 PASS: tanpa badge baru.
- R-10 PASS: tanpa blur baru.
- R-12 PASS: tanpa shadow baru.
- R-13 PASS: tanpa glow baru.
- R-14 PASS: tanpa feature-card baru, rincian tugas dalam disclosure.
- R-19 PASS: MOTION 1 memakai interaksi/fokus lama, tanpa animasi baru.
- R-22 PASS: diagram sequence lama menjelaskan lifeline dan arah pesan, bukan ilustrasi generik.
- Liveliness PASS: dials 1/2/1 konsisten, focal point keputusan bukti, whitespace label struktural, aksen tindakan lama, motif jejak O-AR1/K-AR1 dan variasi Konsep/latihan/Bukti/Dosen; Design Read sebelum generasi.
- C-1 PASS: alasan warna/layout/font/jarak/diagram tertulis di Design Read.
- C-2 PASS: semua kontrol baru memiliki hasil yang diuji.
- C-3 PASS: satu tugas sesi 06, tanpa section template.
- C-4 PASS: state belum diperiksa/salah/tersimpan, keyboard, dua tema/viewport, backup dan offline diuji.
- C-5 PASS: asumsi eksplisit, tanpa klaim faktual rekaan.
- R-05 PASS: komposisi berbasis tugas/tab/disclosure yang sudah ada.
- R-11 PASS: radius kontrol lama dipertahankan.
- R-15 PASS: CTA spesifik Periksa keputusan pemulihan.
- R-16 PASS: tanpa buzzword pemasaran baru.
- R-20 PASS: identitas jejak bukti kasus Aruna, bukan halaman generik.
- R-21 PASS: toggle kedua tema aktif dan diuji.
- R-29 PASS: palette lama, tanpa warna tambahan.
- R-30 PASS: tidak mengkloning produk lain.
- R-31 PASS: alasan desain tertulis, CSS hanya minimum target select S06.
- Batas gate: computed contrast teks terpindai bukan sertifikasi seluruh aplikasi; gate hanya perubahan S06, tidak menulis ulang lampiran immutable. Bukti commit/revision final setelah rilis ulang disampaikan pada keluaran run.

## S07: Class diagram dan OOAD (30 Oktober 2026, WIB)

- Pemilihan: worktree awal bersih, fetch dan ff-only ke origin/main `dc69ab5` sebelum authoring; pembaruan dashboard dari remote hanya diterima, tidak diedit. Membaca sesi 07 lengkap, kasus Aruna dan log S01–S06. S07 berikutnya tanpa pendalaman; bukan inferensi progres mahasiswa.
- Satu pendalaman: kontrak saveDraft()/submit() dengan nol/satu/beberapa baris, perbedaan struktur 0..* dan constraint Submitted, multiplicity dua arah, jumlah objek versus qty unit, owner invariant Order dan jejak pesan ke operasi. Worked example O-AR7 mempunyai input, jejak A/B/C, hasil, miskonsepsi dan batas bukti. Transfer peminjaman alat serta rubrik empat kriteria untuk dosen.
- Render: disclosure Konsep, latihan dalam simulator class lama, transfer/catatan lokal pada Bukti dan disclosure dosen. Overview mengganti tautan pendalaman terbaru, tidak menumpuk homepage atau navigasi. Diagram asli tetap; latihan tidak berpura-pura melakukan mutasi Order atau validasi backend.
- Kompatibilitas: hanya field sim s7Event/s7Decision/s7Owner/s7Reviewed opsional. KEY, versi, validator cadangan, syarat selesai, baseline lampiran dan 13 berkas tidak diubah. Feedback terikat jumlah, kebijakan draft, operasi dan kedua prediksi. Backup lama tanpa s7 mempertahankan catatan, mulai belum diperiksa; backup baru mengembalikan feedback.
- Dasar: konsep/transfer sesi 07 dan kasus yang sudah dibundel, tanpa klaim faktual eksternal baru. Kontrak operasi dan lifecycle berlabel asumsi kelas. Composition tidak disimpulkan dari foreign key; pertanyaan audit/lifecycle tetap terbuka. RPS asli tidak tersedia; rubrik bukan nilai resmi.
- Design Read sebelum generasi, antislop DURING: workspace pembelajaran akademi ringkas untuk mahasiswa/dosen Indonesia, ENERGY 1 / RHYTHM 2 / MOTION 1. Warna tindakan/font sistem lama untuk kontinuitas; disclosure untuk hierarki tanpa panjang awal; whitespace label dan kontrol 44px untuk sentuhan; diagram class untuk tanggung jawab/relasi, bukan dekorasi. Tidak ada logo/avatar/aset/ikon/palette/kartu/efek/animasi baru.
- RED: browser produksi sebelum implementasi gagal timeout 3000ms pada `[data-iasd-object-contract] summary`, scratch/iasd-s07-red.log. Smoke lokal pertama kemudian menemukan disclosure tertutup saat checkbox draft berubah sebelum field s7 pernah dipilih. Root cause: render ulang menentukan open hanya dari field tersimpan. Perbaikan langsung pada render mempertahankan disclosure yang sudah terbuka; tes yang sama lalu lulus.
- GREEN lokal: `npm run build && npm run smoke:pwa` exit 0; 188 halaman dibangun, gate 174 halaman LMS, hash baseline sumber/embedded serta suplemen lulus. Desktop/mobile masing-masing seluruh 16 sesi/48 jawaban, simulator, instructor, catatan, backup lama/baru/salah dan offline; 13 unduhan desktop identik isi lampiran. Homepage desktop 1038px (budget 1400px), mobile 1789px (budget 2200px). Log scratch/iasd-s07-{build,smoke}.log. Sesudah GREEN ini, tes invalidasi jumlah/kebijakan ditambah; maintainer wajib mengulangnya sebelum rilis.
- Click-through S07 yang sudah lulus: overview #7 → studio Class; disclosure Enter → tiga select; checkbox draft/slider → kondisi/diagram berubah dan disclosure tetap terbuka; kombinasi kebijakan × jumlah 0/1/4 × operasi × prediksi izin × owner → alasan benar/salah; tombol Periksa dengan Enter → hasil; ubah operasi → feedback lama tidak tampil; reload → pilihan/hasil pulih; contoh Enter/Escape → buka/tutup; Bukti/ketik/reload → transfer lokal pulih; dosen #7/disclosure → fasilitasi/rubrik; Tab/Shift+Tab select → fokus terlihat/44px; Space checkbox dan panah slider → berubah; tema terang/gelap → computed contrast terpindai AA, tanpa overflow; offline reload → latihan/contoh tetap berfungsi. Tidak ada pageerror pada smoke.
- Status log: implementasi dan bukti lokal, belum klaim publikasi. Maintainer wajib mengulang seluruh gate, commit/deploy serta exact revision dan baseline live. Bukti live final disampaikan pada keluaran run; jangan menandai terbit bila deploy gagal.

### Gate perubahan S07 (bukan audit ulang teks lampiran immutable)

- R-02 PASS: validator suplemen tanpa em dash.
- R-03 PASS: smoke desktop/mobile tanpa overflow, kontrol minimum 44px.
- R-17 PASS: angka hanya struktur/asumsi latihan, tanpa statistik rekaan.
- R-18 PASS: tidak menambah testimoni.
- R-23 PASS: memakai diagram lama, tanpa aset/identitas baru.
- R-24 PASS: overview #7 dan permalink dosen #7 benar-benar dibuka.
- R-25 PASS: computed contrast teks tambahan terpindai AA di kedua tema.
- R-26 PASS: select, slider, checkbox, tombol dan disclosure sesuai click-through.
- R-27 PASS: boot/error bundel/penyimpanan lama tetap; belum diperiksa/salah/tersimpan dan invalid-backup diuji.
- R-28 PASS: tanpa FAQ tambahan.
- R-32 PASS: Enter/Escape/Space/Tab/Shift+Tab/panah slider dan fokus diuji.
- R-33 PASS: perubahan langsung pada sumber, bukan script penulis ulang UI.
- R-34 PASS: kedua tema diuji, font/layout lama tetap.
- R-35 PASS lokal: build dan smoke dua viewport exit 0, click-through tercatat; belum klaim live.
- R-36 PASS: tanpa klaim keamanan/performa/pelanggan baru.
- R-37 PASS: arah studio dan Design Read/dials sebelum generasi.
- R-38 PASS: skenario/kontrak berlabel asumsi, bukan transaksi nyata.
- R-01 PASS: tidak menambah gradien/glow, aksen tindakan lama.
- R-04 PASS: tanpa ikon baru.
- R-06 PASS: font sistem lama untuk kontinuitas membaca.
- R-07 PASS: tanpa pola latar baru.
- R-08 PASS: panah hanya jejak pesan, bukan dekorasi CTA.
- R-09 PASS: tanpa badge baru.
- R-10 PASS: tanpa blur baru.
- R-12 PASS: tanpa shadow baru.
- R-13 PASS: tanpa glow baru.
- R-14 PASS: tanpa feature-card; disclosure sesuai hierarki tugas.
- R-19 PASS: MOTION 1 memakai interaksi/fokus lama, tanpa animasi baru.
- R-22 PASS: diagram class lama untuk atribut/operasi/relasi, tanpa ilustrasi generik.
- Liveliness PASS: dials 1/2/1 konsisten, fokus kontrak objek, aksen tindakan lama, motif jejak Aruna, whitespace label, variasi Konsep/latihan/Bukti/Dosen, Design Read sebelum generasi.
- C-1 PASS: alasan warna/font/layout/jarak/diagram tertulis di Design Read.
- C-2 PASS: semua kontrol tambahan mempunyai hasil teruji.
- C-3 PASS: tugas khusus sesi 07, tanpa section pemasaran/template.
- C-4 PASS: belum diperiksa/salah/tersimpan, dua tema/viewport, keyboard, backup dan offline diuji.
- C-5 PASS: asumsi eksplisit, tanpa klaim observasi/penilaian resmi.
- R-05 PASS: komposisi mengikuti tugas/tab/disclosure yang sudah ada.
- R-11 PASS: radius kontrol lama dipertahankan.
- R-15 PASS: CTA spesifik Periksa kontrak objek.
- R-16 PASS: tanpa buzzword pemasaran baru.
- R-20 PASS: identitas jejak kontrak O-AR7 dan kasus Aruna, bukan halaman generik.
- R-21 PASS: toggle kedua tema aktif dan diuji.
- R-29 PASS: palette lama tanpa warna tambahan.
- R-30 PASS: tidak mengkloning produk lain.
- R-31 PASS: alasan desain tertulis; CSS hanya target sentuh S07.
- Batasan: simulator mengecek izin dari jumlah baris, bukan mutasi status, database, stok, pembayaran atau seluruh UML. Kontras terpindai bukan sertifikasi aksesibilitas seluruh aplikasi. RPS asli belum diverifikasi; catatan lokal tidak dikirim otomatis. Materi beku, antrean, dependensi bersama dan dashboard tidak diedit oleh run ini.
- Mahasiswa: https://hicall.web.id/iasd/studio#7
- Dosen: https://hicall.web.id/iasd/studio?mode=teach#7

## S08: UTS kasus individu (31 Oktober 2026, WIB)

- Pemilihan: worktree awal bersih; fetch dan ff-only ke origin/main `e6b0e43` sebelum authoring. Pembaruan dashboard remote hanya diterima, tidak diedit. Membaca sesi 08 lengkap, kasus Aruna dan seluruh log S01–S07; S08 berikutnya tanpa pendalaman, bukan inferensi progres mahasiswa.
- Satu pendalaman: jejak FR-SLOT-v1/v2 → guard BPMN → postcondition use case → operasi Slot/Reservation → acceptance test, memakai penuh/cukup, pembatalan aktif, pengulangan pembatalan dan data awal melebihi kapasitas. Contoh A/B/C/D membedakan histori dari reservasi aktif serta perubahan multiplicity dari constraint kapasitas. Transfer ruang konsultasi, empat baris bukti lokal, fasilitasi prediksi/demonstrasi/penjelasan/transfer dan rubrik diagnostik.
- Render: disclosure Konsep, latihan dalam simulator kesiapan/slot yang sudah ada, transfer pada Bukti, disclosure dosen. Overview mengganti tautan terbaru, bukan menumpuk katalog. Tidak mengubah homepage umum, tab atau navigasi sesi.
- Asumsi/batas: identitas target, otorisasi, interval tetap dan kebijakan menahan data invalid untuk audit adalah asumsi kelas. Tidak ada klaim eksternal baru. Snapshot tidak memutasi reservasi dan bukan uji atomisitas/konkurensi; urutan R-A/R-B dikerjakan pada jejak tertulis. RPS asli belum tersedia; usulan bobot, akses dosen terbuka dan caveat latihan ujian publik dipertahankan. Catatan tidak dikirim atau dinilai otomatis.
- Kompatibilitas: hanya s8Event/s8Decision/s8Reviewed opsional pada sim. KEY, versi, validator cadangan, catatan, syarat selesai, baseline dan 13 berkas tidak diubah. Signature mengikat kapasitas, jumlah aktif, operasi dan prediksi. Cadangan lama tanpa s8 mempertahankan catatan dan mulai belum diperiksa; cadangan baru memulihkan feedback.
- Design Read sebelum generasi, antislop DURING sesuai preferensi: workspace akademi ringkas mahasiswa/dosen Indonesia, ENERGY 1 / RHYTHM 2 / MOTION 1. Warna tindakan dan font sistem lama untuk kontinuitas; disclosure menjaga hierarki dan panjang awal; whitespace label serta target 44px untuk sentuhan; diagram jejak kebutuhan/proses/objek lama tetap menjelaskan lintas artefak. Tidak membuat logo/avatar/ikon/aset/palette/kartu/efek/animasi baru.
- RED: browser produksi sebelum implementasi gagal timeout 3000ms pada `[data-iasd-slot-contract] summary`; error asli tersimpan di scratch/iasd-s08-red.log. Tes perilaku S08 ditambah sebelum implementasi.
- GREEN lokal: `npm run build && npm run smoke:pwa` exit 0. Build 188 halaman; gate semua 174 halaman pembelajaran dan hash baseline source/embedded serta suplemen lulus. Desktop/mobile masing-masing 16 sesi/48 jawaban, simulator, instructor #8, catatan, cadangan lama/baru/salah, offline; 13 unduhan desktop identik isi lampiran. Homepage 1038px desktop (budget 1400), 1789px mobile (budget 2200). Log scratch/iasd-s08-{build,smoke}.log.
- Cakupan S08: dua kapasitas × empat jumlah × tiga operasi × tiga prediksi, alasan benar/salah; invalidasi kapasitas/jumlah/operasi; reload; transfer lokal; isolasi setelah grading; impor lama/baru/salah; instructor permalink #8; offline; computed contrast teks suplemen/latihan/feedback dua tema; fokus/44px/overflow desktop-mobile.
- Click-through lokal: overview #8 → UTS kasus individu; disclosure latihan Enter → dua select; kapasitas/jumlah/operasi/prediksi → snapshot tersimpan dan feedback lama tidak ditampilkan; Periksa jejak slot Enter → alasan dan jumlah sebelum/sesudah; reload → hasil pulih; contoh Enter/Escape → buka/tutup; Bukti/ketik/reload → catatan transfer pulih; dosen #8/disclosure → fasilitasi/rubrik; Tab/Shift+Tab empat kontrol → fokus terlihat/44px; toggle tema → kedua tema tanpa overflow; offline reload → prediksi pembatalan ulang dan contoh FR-SLOT berfungsi. Tidak ada pageerror pada smoke.
- Status log: implementasi dan bukti lokal, belum klaim publikasi. Maintainer wajib mengulang gate, commit/deploy dan exact revision/baseline live; hasil final dilaporkan pada keluaran run. Jangan menandai terbit jika deploy gagal.

### Gate perubahan S08 (bukan audit ulang teks lampiran immutable)

- R-02 PASS: validator suplemen tanpa em dash.
- R-03 PASS: smoke kedua viewport/tema tanpa overflow, empat kontrol tinggi minimum 44px.
- R-17 PASS: angka/ID hanya struktur latihan berlabel asumsi, tanpa statistik rekaan.
- R-18 PASS: tanpa testimoni baru.
- R-23 PASS: memakai diagram lama, tidak menambah aset/identitas.
- R-24 PASS: overview #8 dan permalink dosen #8 dibuka dalam smoke.
- R-25 PASS: computed contrast teks tambahan terpindai AA di kedua tema.
- R-26 PASS: dua select, slider, Periksa dan disclosure berfungsi sesuai click-through.
- R-27 PASS: boot/error penyimpanan lama dipertahankan; belum diperiksa/salah/tersimpan dan invalid-backup diuji, tanpa fetch baru.
- R-28 PASS: tanpa FAQ baru.
- R-32 PASS: Enter/Escape/Tab/Shift+Tab dan fokus terlihat diuji.
- R-33 PASS: perubahan langsung pada sumber, bukan script penulis ulang UI.
- R-34 PASS: kedua tema mempertahankan font, kontrol dan layout.
- R-35 PASS lokal: build serta smoke dua viewport exit 0; click-through tercatat; belum klaim produksi.
- R-36 PASS: tanpa klaim keamanan/performa/pelanggan baru.
- R-37 PASS: arah studio dan Design Read/dials dinyatakan sebelum generasi.
- R-38 PASS: kontrak/skenario diberi label asumsi, tanpa data klinik atau kebijakan rekaan.
- R-01 PASS: tanpa gradien/glow baru; warna tindakan lama dipertahankan.
- R-04 PASS: tanpa ikon baru.
- R-06 PASS: font sistem lama untuk kontinuitas baca.
- R-07 PASS: tanpa pola latar baru.
- R-08 PASS: panah hanya jejak artefak/jumlah, bukan dekorasi CTA.
- R-09 PASS: tanpa badge baru.
- R-10 PASS: tanpa blur baru.
- R-12 PASS: tanpa shadow baru.
- R-13 PASS: tanpa glow baru.
- R-14 PASS: tanpa feature-card; contoh berbasis tugas dalam disclosure.
- R-19 PASS: MOTION 1 memakai interaksi/fokus lama, tanpa animasi baru.
- R-22 PASS: diagram lama menjelaskan lintas artefak, tanpa ilustrasi dekoratif.
- Liveliness PASS: dials 1/2/1 konsisten, fokus invariant slot, whitespace label struktural, satu aksen aksi lama, motif jejak bukti Aruna menuju transfer teknisi; variasi Konsep/latihan/Bukti/Dosen; Design Read sebelum generasi.
- C-1 PASS: alasan warna/layout/font/jarak/diagram tertulis pada Design Read.
- C-2 PASS: semua kontrol tambahan memiliki hasil teruji.
- C-3 PASS: satu tugas khusus S08, tanpa section template.
- C-4 PASS: belum diperiksa/salah/tersimpan, dua tema/viewport, keyboard, cadangan dan offline diuji.
- C-5 PASS: asumsi dan batas bukti eksplisit, tanpa klaim nilai resmi.
- R-05 PASS: komposisi berbasis tugas/tab/disclosure yang sudah ada.
- R-11 PASS: radius kontrol lama dipertahankan.
- R-15 PASS: CTA spesifik Periksa jejak slot.
- R-16 PASS: tanpa buzzword pemasaran baru.
- R-20 PASS: motif jejak FR-SLOT serta kasus transfer dari lampiran, bukan halaman generik.
- R-21 PASS: toggle kedua tema tetap aktif dan diuji.
- R-29 PASS: palette lama tanpa warna tambahan.
- R-30 PASS: tidak mengkloning produk lain.
- R-31 PASS: alasan desain tertulis; CSS hanya minimum target kontrol S08.
- Batas gate: computed contrast hanya teks terpindai, bukan sertifikasi aksesibilitas seluruh aplikasi. Baseline immutable, materi beku, antrean, dependensi bersama dan dashboard tidak diedit oleh run ini.
- Mahasiswa: https://hicall.web.id/iasd/studio#8
- Dosen: https://hicall.web.id/iasd/studio?mode=teach#8

## S09: DFD (1 November 2026, WIB)

- Pemilihan: worktree awal bersih, fetch dan ff-only ke origin/main `5d08a61` sebelum authoring. Pembaruan dashboard remote diterima tanpa edit. Sesi 09 dibaca lengkap, bersama kasus Aruna, template data_dictionary.csv, sumber yang sudah dicantumkan dan log S01–S08. S09 berikutnya tanpa pendalaman, bukan inferensi progres mahasiswa.
- Satu pendalaman: kontrak Pesanan/Konfirmasi dengan request_id dan status_hasil; empat jejak lengkap/hilang/ID-saja/bypass; dua audit independen untuk balancing kontrak dan legalitas akses store. Transfer peminjaman alat membandingkan perubahan pengembalian eksternal dengan store audit internal. Rubrik diagnostik dan fasilitasi prediksi → demonstrasi → penjelasan → transfer memeriksa alasan serta field lintas tingkat, bukan jumlah panah.
- Render: disclosure Konsep, latihan dalam simulator DFD lama, tabel kamus arus dinamis, transfer pada Bukti dan disclosure dosen. Overview mengganti tautan terbaru, tanpa menumpuk katalog. Diagram lama menampilkan label, tabel menunjukkan isi. Pesan dasar diperjelas agar nama arus tidak diklaim sudah membuktikan balancing. Homepage umum/tab/navigasi tetap.
- Asumsi/batas: kontrak field, identitas, bentuk input dan retur adalah asumsi kelas. Semantik diturunkan dari konsep lampiran, tanpa klaim faktual eksternal baru. Template CSV asli berorientasi entity/attribute tetap utuh; mahasiswa membuat tabel arus pendamping. RPS asli belum tersedia, bobot usulan serta latihan ujian publik tetap. Bukan validator DFD lengkap, eksekusi reservasi/refund atau pengujian integrasi.
- Kompatibilitas: s9Payload/s9Boundary/s9Routing/s9Reviewed opsional pada sim; feedback terikat keberadaan/isi output, bypass dan kedua prediksi. KEY, versi, validator cadangan, syarat selesai, baseline dan 13 berkas tidak diubah. Cadangan lama mempertahankan catatan dan memulai prediksi belum diperiksa; cadangan baru memulihkan hasil.
- Design Read sebelum generasi, antislop DURING sesuai preferensi: workspace akademi ringkas mahasiswa/dosen Indonesia, ENERGY 1 / RHYTHM 2 / MOTION 1. Warna tindakan/font lama untuk kontinuitas; disclosure menjaga hierarki serta panjang awal; whitespace label/target 44px untuk sentuhan; diagram lama dan tabel arus untuk menjelaskan isi yang tidak terlihat dari label. Tidak menambah logo/avatar/ikon/ilustrasi/palette/efek/animasi.
- RED: browser produksi sebelum implementasi gagal timeout 3000ms pada `[data-iasd-data-contract] summary`; scratch/iasd-s09-red.log. Tes baru ditulis sebelum implementasi.
- GREEN lokal: `npm run build && npm run smoke:pwa` exit 0. Gate seluruh 174 halaman pembelajaran, hash sumber/embedded baseline dan suplemen lulus. Desktop/mobile menguji 16 sesi/48 jawaban, simulator, dosen #9, catatan, cadangan lama/baru/salah, offline; seluruh 13 unduhan desktop identik lampiran. Homepage 1038px desktop (budget 1400), 1789px mobile (budget 2200). Log scratch/iasd-s09-build.log dan iasd-s09-smoke.log. Koreksi satu kata Contract menjadi Kontrak sesudah GREEN wajib diuji ulang oleh maintainer.
- Cakupan S09: delapan snapshot (output ada/hilang × bypass × dua isi) dengan empat pasangan prediksi per snapshot, alasan benar/salah, invalidasi tiap kondisi, reload/persistensi, transfer lokal, isolasi setelah grading, impor lama/baru, instructor permalink, offline, dua tema, computed contrast teks terpindai, fokus/44px/overflow.
- Click-through lokal: overview #9 → DFD; disclosure latihan Enter → tiga select; dua checkbox → diagram/snapshot berubah; isi/prediksi → tersimpan; Periksa dua audit Enter → alasan kontrak dan routing; ubah kondisi → feedback menunggu; reload → hasil pulih; contoh Enter/Escape → buka/tutup; Bukti/ketik/reload → transfer tersimpan; dosen #9/disclosure → fasilitasi/rubrik; Tab/Shift+Tab lima kontrol → fokus terlihat/target 44px; toggle tema → dua tema; offline reload → bypass dengan kontrak lengkap tetap memberi dua kesimpulan berbeda. Tidak ada pageerror pada smoke.
- Status log: implementasi dan verifikasi lokal, bukan klaim publikasi. Maintainer wajib mengulang semua gate, commit/deploy dan exact revision/baseline produksi; hasil final dilaporkan pada keluaran run. Jangan menandai published jika deploy gagal.

### Gate perubahan S09, bukti GREEN lokal di atas (bukan audit ulang lampiran immutable)

- R-02 PASS: validator suplemen menolak em dash.
- R-03 PASS: dua viewport/tema tanpa overflow; target lima kontrol minimal 44px.
- R-17 PASS: angka/ID hanya struktur latihan berlabel asumsi, tanpa statistik rekaan.
- R-18 PASS: tanpa testimoni baru.
- R-23 PASS: memakai diagram lama, tanpa aset/identitas baru.
- R-24 PASS: overview #9 dan instructor #9 dibuka smoke.
- R-25 PASS: computed contrast teks tambahan yang dipindai AA di dua tema; bukan sertifikasi seluruh aplikasi.
- R-26 PASS: tiga select/dua checkbox/Periksa/disclosure bekerja sesuai click-through.
- R-27 PASS: bundel sinkron memakai boot/error penyimpanan lama; belum diperiksa/salah/tersimpan/invalid-backup diuji.
- R-28 PASS: tidak menambah FAQ.
- R-32 PASS: Enter/Escape/Tab/Shift+Tab dan fokus terlihat diuji.
- R-33 PASS: perubahan langsung sumber, tanpa script penulis ulang UI.
- R-34 PASS: kedua tema diuji, font/layout lama dipertahankan.
- R-35 PASS lokal: build/smoke dua viewport exit 0, click-through tercatat; belum klaim produksi.
- R-36 PASS: tanpa klaim keamanan/performa/pelanggan baru.
- R-37 PASS: arah studio serta Design Read/dials dinyatakan sebelum generasi.
- R-38 PASS: skenario/kontrak diberi label asumsi, bukan data lapangan.
- R-01 PASS: tanpa gradien/glow baru; warna tindakan lama.
- R-04 PASS: tanpa ikon baru.
- R-06 PASS: font lama menjaga kontinuitas pembacaan.
- R-07 PASS: tanpa pola latar baru.
- R-08 PASS: panah menyatakan arah data, bukan dekorasi CTA.
- R-09 PASS: tanpa badge baru.
- R-10 PASS: tanpa blur baru.
- R-12 PASS: tanpa shadow baru.
- R-13 PASS: tanpa glow baru.
- R-14 PASS: tabel untuk perbandingan isi, tanpa feature-card.
- R-19 PASS: MOTION 1 memakai interaksi/fokus lama, tanpa animasi baru.
- R-22 PASS: diagram DFD lama langsung terkait latihan, bukan ilustrasi dekoratif.
- Liveliness PASS: dials 1/2/1 konsisten, fokus kontrak arus, whitespace label struktural, aksen tindakan lama, motif jejak Aruna, variasi Konsep/latihan/Bukti/Dosen, Design Read sebelum generasi.
- C-1 PASS: alasan warna/layout/font/jarak/diagram/tabel tertulis di atas.
- C-2 PASS: seluruh kontrol tambahan memiliki hasil teruji.
- C-3 PASS: satu tugas S09, tanpa section template pemasaran.
- C-4 PASS: belum diperiksa/salah/tersimpan, dua tema/viewport, keyboard, backup serta offline diuji.
- C-5 PASS: asumsi dan batas bukti eksplisit, tanpa klaim nilai resmi.
- R-05 PASS: komposisi berbasis tugas/tab/disclosure lama.
- R-11 PASS: radius kontrol lama dipertahankan.
- R-15 PASS: CTA spesifik Periksa dua audit.
- R-16 PASS: tanpa buzzword pemasaran.
- R-20 PASS: motif Pesanan/Konfirmasi kasus Aruna, bukan template generik.
- R-21 PASS: toggle kedua tema tetap aktif dan diuji.
- R-29 PASS: palette lama tanpa warna tambahan.
- R-30 PASS: tidak mengkloning produk lain.
- R-31 PASS: alasan desain tertulis; CSS hanya minimum target kontrol S09.
- Batas: snapshot hanya menguji output Konfirmasi dan satu bypass, bukan semua proses/store/aliran atau urutan waktu. Catatan lokal tidak terkirim otomatis. Baseline, materi beku, antrean, dependensi bersama dan dashboard tidak diedit oleh run ini.
- Mahasiswa: https://hicall.web.id/iasd/studio#9
- Dosen: https://hicall.web.id/iasd/studio?mode=teach#9

## S10: ERD (2 November 2026, WIB)

- Pemilihan: worktree awal bersih, fetch/ff-only ke origin/main `5f89a13` sebelum authoring. Pembaruan dashboard remote hanya diterima, tidak diedit. Membaca sesi 10 lengkap, kasus Aruna, data_dictionary.csv, rujukan bawaan dan log S01–S09. S10 berikutnya tanpa pendalaman; bukan inferensi progres mahasiswa.
- Satu pendalaman: histori harga DAN diskon per unit, waktu penguncian submit, kebetulan angka cocok tanpa snapshot, serta audit parent yang terpisah dari total. Jejak A/B/C/D, kamus PK/FK/satuan, draft versus invariant submit, transfer pemesanan buku, empat baris bukti lokal dan fasilitasi/rubrik diagnostik. Semua angka/kontrak adalah asumsi kelas; tidak ada klaim faktual eksternal baru.
- Render: disclosure Konsep, latihan dalam simulator ERD lama, tabel total bersih/asal field, transfer Bukti dan disclosure dosen. Total dasar dinyatakan kotor tanpa diskon agar tidak disamakan dengan total bersih tambahan. Overview mengganti tautan terbaru, bukan menambah panjang katalog. Homepage umum, tab dan navigasi tetap.
- Kompatibilitas: hanya field sim s10Discount/s10Parent/s10History/s10Row/s10Reviewed opsional. Signature mengikat harga, snapshot, diskon, parent dan kedua prediksi. KEY, versi, validator backup, syarat selesai, baseline serta 13 berkas tidak diubah. Cadangan lama mengawali latihan belum diperiksa sambil mempertahankan catatan; cadangan baru memulihkan feedback.
- Design Read sebelum generasi, antislop DURING sesuai preferensi: workspace akademi ringkas mahasiswa/dosen Indonesia, ENERGY 1 / RHYTHM 2 / MOTION 1. Warna tindakan/font sistem lama menjaga kontinuitas, disclosure menahan panjang awal dan memisahkan hierarki, whitespace label/target 44px untuk sentuhan; diagram lama untuk relasi, tabel tambahan untuk asal harga/diskon yang tidak ditampilkan diagram. Tidak menambah logo/avatar/ikon/ilustrasi/palette/efek/animasi atau dependensi.
- RED: browser produksi sebelum implementasi gagal timeout 3000ms pada `[data-iasd-price-contract] summary`; bukti scratch/iasd-s10-red.log. Tes perilaku ditulis sebelum implementasi.
- Gate wajib: kombinasi harga katalog 50/100/150/300 × snapshot aktif/tidak × diskon lama/kini × parent ada/hilang × dua prediksi berpasangan. Memeriksa hasil hitung, alasan benar/salah termasuk angka kebetulan cocok, invalidasi tiap kondisi, reload, transfer lokal, isolasi sesudah grading, backup lama/baru/salah, permalink dosen #10, keyboard Enter/Escape/Tab/Shift+Tab, fokus/44px, computed contrast teks dua tema, overflow kedua viewport dan latihan offline. Regresi tetap 16 sesi/48 jawaban dan 13 unduhan desktop identik lampiran.
- Click-through yang direkam tes (status hanya sah setelah exit 0): overview #10 → ERD; disclosure Enter → empat select; slider/checkbox/sumber diskon/parent/prediksi → snapshot tersimpan; Periksa histori dan parent Enter → dua alasan; perubahan kondisi → feedback menunggu; reload → hasil pulih; contoh Enter/Escape → buka/tutup; Bukti/ketik/reload → catatan pulih; dosen #10/disclosure → prediksi/demonstrasi/penjelasan/transfer/rubrik; Tab/Shift+Tab enam kontrol → fokus terlihat/44px; toggle tema → kedua tema; offline reload → kedua snapshot dengan parent hilang tetap memberi dua kesimpulan berbeda.
- Gate perubahan yang harus dibuktikan oleh maintainer: Hard R-02/03/17/18/23/24/25/26/27/28/32/33/34/35/36/37/38 melalui validator suplemen, pemeriksaan diff/scope dan click-through. Purpose R-01/04/06/07/08/09/10/12/13/14/19/22: tidak menambah teknik dekoratif, alasan font/warna/layout/tabel di atas. Liveliness: dials 1/2/1, fokus rekonstruksi nilai, motif jejak Aruna, aksen tindakan lama, whitespace struktural dan variasi tab/disclosure. Craft C-1..C-5 serta R-05/11/15/16/20/21/29/30/31: komposisi berbasis tugas, CTA spesifik, radius/palette/dua tema lama, tanpa marketing, data/testimoni rekaan atau kloning. Ini gate perubahan S10, bukan audit ulang lampiran immutable.
- Batas: snapshot tidak menjalankan SQL/constraint database, mutasi transaksi, migrasi, pembayaran atau koreksi berversi. Product selalu ada dalam skenario; parent hanya menguji Order. Draft kosong adalah usulan perluasan, bukan penggantian aturan minimal satu item pada submit. Computed contrast terpindai bukan sertifikasi aksesibilitas seluruh aplikasi. RPS asli belum diverifikasi, rubrik bukan nilai resmi, catatan tetap lokal. Baseline, materi beku, antrean, dependensi bersama serta dashboard tidak diedit oleh run ini.
- Status log saat penulisan: implementasi dengan RED terverifikasi, belum klaim GREEN atau publikasi. Maintainer wajib menjalankan seluruh gate, commit/deploy dan membaca exact revision/baseline live; hasil final disampaikan pada keluaran run. Jangan menandai terbit jika deploy gagal.
- Mahasiswa: https://hicall.web.id/iasd/studio#10
- Dosen: https://hicall.web.id/iasd/studio?mode=teach#10
- GREEN dan publikasi konten: maintainer exit 0; commit `86ce8d1eef3526abc419ff3bdae4de0f2fa77121` sama dengan origin/main saat pemeriksaan, worktree bersih. Deployment https://vc-lecturer-a0wv0e554-hicall-projects.vercel.app. Exact manifest HTTP 200 dan objek sama dengan sumber, revision `2dfbb5d8b2c276fa77872df8acc0493744cd4c2e0478187271f099c7bed7abba`; course-data dan seluruh supplement-data produksi identik sumber. Log scratch/iasd-s10-release.log.
- GREEN produksi: runIasdSmoke https://hicall.web.id exit 0 pada desktop 1440×900 dan mobile 390×844. Tiap profil menguji 16 sesi/48 jawaban, seluruh simulator, 128 pasangan skenario/prediksi S10, tab dosen, catatan, backup lama/baru/salah dan offline; 13 unduhan desktop identik lampiran. Tidak ada pageerror. Log scratch/iasd-s10-live-smoke.log; hasil output/playwright/iasd-{desktop,mobile}-results.json. Browser produksi mobile juga dilihat langsung: empat select 328×44px, overflow 0, label/kontrol/diagram terpisah tanpa benturan. Click-through di atas kini terbukti PASS, bukan rencana.

### Gate perubahan S10, bukti GREEN lokal/produksi di atas

- R-02 PASS: validator JSON suplemen menolak em dash.
- R-03 PASS: smoke dua viewport/tema tanpa overflow; browser mobile overflow 0, empat select 44px.
- R-17 PASS: angka/satuan/ID dilabeli asumsi kelas, tanpa statistik rekaan.
- R-18 PASS: tanpa testimoni baru.
- R-23 PASS: memakai diagram lama, tanpa aset/identitas baru.
- R-24 PASS: overview #10 dan instructor #10 dibuka dalam smoke.
- R-25 PASS: computed contrast teks tambahan terpindai AA dua tema, bukan sertifikasi seluruh aplikasi.
- R-26 PASS: empat select, slider/checkbox, Periksa dan disclosure sesuai click-through teruji di atas.
- R-27 PASS: boot/error bundel dan penyimpanan lama tetap; belum diperiksa/salah/tersimpan/invalid-backup diuji.
- R-28 PASS: tanpa FAQ baru.
- R-32 PASS: Enter/Escape/Tab/Shift+Tab dan fokus terlihat diuji.
- R-33 PASS: implementasi langsung pada sumber, tanpa script penulis ulang UI.
- R-34 PASS: kedua tema diuji, font/layout lama tetap.
- R-35 PASS: maintainer dan smoke produksi exit 0, click-through setiap kontrol tercatat, exact revision/baseline/suplemen dibaca kembali.
- R-36 PASS: tanpa klaim keamanan/performa/pelanggan baru.
- R-37 PASS: arah studio serta Design Read/dials dinyatakan sebelum generasi.
- R-38 PASS: skenario/kontrak berlabel asumsi, bukan data lapangan atau nilai resmi.
- R-01 PASS: tanpa gradien/glow baru, aksen tindakan lama.
- R-04 PASS: tanpa ikon baru.
- R-06 PASS: font sistem lama untuk kontinuitas pembacaan.
- R-07 PASS: tanpa pola latar baru.
- R-08 PASS: tanpa panah CTA dekoratif baru.
- R-09 PASS: tanpa badge baru.
- R-10 PASS: tanpa blur baru.
- R-12 PASS: tanpa shadow baru.
- R-13 PASS: tanpa glow baru.
- R-14 PASS: tabel perbandingan field, tanpa feature-card.
- R-19 PASS: MOTION 1 memakai perilaku/fokus lama, tanpa animasi baru.
- R-22 PASS: diagram ERD lama relevan terhadap relasi, bukan ilustrasi dekoratif.
- Liveliness PASS: dials 1/2/1 konsisten, focal point asal nilai, whitespace label struktural, satu aksen tindakan lama, motif jejak Aruna, variasi Konsep/latihan/Bukti/Dosen dan Design Read sebelum generasi.
- C-1 PASS: alasan warna/font/layout/jarak/diagram/tabel tertulis di Design Read.
- C-2 PASS: setiap kontrol tambahan memiliki hasil teruji.
- C-3 PASS: satu tugas S10, tanpa section template pemasaran.
- C-4 PASS: state belum diperiksa/salah/tersimpan, keyboard, dua tema/viewport, backup dan offline diuji.
- C-5 PASS: asumsi/batas bukti eksplisit, tanpa klaim rekaan.
- R-05 PASS: komposisi mengikuti tugas/tab/disclosure lama.
- R-11 PASS: radius kontrol lama tetap.
- R-15 PASS: CTA spesifik Periksa histori dan parent.
- R-16 PASS: tanpa buzzword pemasaran baru.
- R-20 PASS: motif OI-10, harga/diskon kasus Aruna dan transfer individu, bukan halaman generik.
- R-21 PASS: toggle dua tema aktif dan diuji.
- R-29 PASS: palette lama tanpa warna tambahan.
- R-30 PASS: tidak mengkloning produk lain.
- R-31 PASS: alasan desain tertulis; CSS hanya minimum target sentuh S10.
- Pembaruan log bukti ini tidak mengubah revisi konten; tetap wajib melewati maintainer sebelum commit log. Bukti commit akhir disampaikan pada keluaran run.

## S11: State machine (3 November 2026, WIB)

- Pemilihan: worktree bersih, fetch dan ff-only ke origin/main `eb9e89e` sebelum authoring. Pembaruan dashboard remote hanya diterima, tidak diedit. Seluruh sesi 11, kasus Aruna dan log S01-S10 dibaca; S11 berikutnya tanpa pendalaman, bukan inferensi progres mahasiswa.
- Satu pendalaman: jejak O-AR11/P-AR11 normal, callback setelah timeout, callback duplikat dan notifikasi belum terverifikasi. Dua prediksi memisahkan state Order dari tindak lanjut bukti uang; feedback menjelaskan guard, asal state, identitas duplikat, owner rekonsiliasi dan larangan mengklaim refund selesai. Transfer tiket lokakarya serta rubrik empat kriteria membantu dosen menguji penjelasan, bukan hafalan panah.
- Render: disclosure Konsep, latihan dalam simulator state lama, transfer pada Bukti, disclosure dosen dan penggantian satu tautan overview. Tidak menambah tab atau panjang katalog. Snapshot tambahan tidak memutasi state/log tombol event dasar.
- Kompatibilitas: hanya s11Trace/s11State/s11Follow/s11Reviewed opsional pada sim; signature mengikat urutan dan kedua prediksi. KEY, versi, validator cadangan, syarat selesai, baseline dan 13 berkas tidak diubah. Tes impor lama menghapus field s11 lalu memeriksa catatan tetap ada; impor baru memulihkan feedback.
- Design Read sebelum generasi, antislop DURING: workspace akademi ringkas mahasiswa/dosen Indonesia, ENERGY 1 / RHYTHM 2 / MOTION 1. Warna aksi/font sistem lama untuk kontinuitas; disclosure menahan panjang awal dan memisahkan hierarki; whitespace label dan select 44px untuk sentuhan; diagram state lama untuk lifecycle dan jejak teks untuk urutan event yang tidak terlihat dari state akhir. Tidak menambah aset, ikon, palette, efek, kartu atau gerak dekoratif.
- RED: browser produksi sebelum implementasi timeout 3000ms pada `[data-iasd-lifecycle-contract] summary`, setelah tes baru ditulis. Implementasi langsung pada sumber, bukan script penulis ulang UI.
- Gate wajib: empat jejak × empat prediksi state × tiga tindak lanjut; feedback benar/salah, isolasi state/log dasar, invalidasi tiap select, reload, catatan transfer, isolasi sesi sesudah grading, backup lama/baru/salah, instructor #11, keyboard Enter/Escape/Tab/Shift+Tab, fokus/44px, computed contrast teks tambahan dua tema, overflow kedua viewport dan penggunaan latihan offline. Regresi seluruh 16 sesi/48 jawaban/13 unduhan desktop identik lampiran tetap.
- Click-through yang direkam tes (PASS hanya setelah exit 0): overview #11 membuka State machine; disclosure latihan Enter membuka tiga select; tiap select mengubah snapshot/prediksi dan membuat feedback menunggu; Periksa lifecycle dan tindak lanjut Enter menampilkan dua alasan; reload memulihkan hasil; contoh Enter/Escape membuka/menutup; Bukti ketik/reload mempertahankan transfer; panduan dosen #11/disclosure menampilkan fasilitasi/rubrik; Tab/Shift+Tab mengembalikan fokus terlihat dan target 44px; kedua tema diperiksa; offline reload mempertahankan latihan.
- Gate perubahan yang harus dibuktikan: Hard R-02/03/17/18/23/24/25/26/27/28/32/33/34/35/36/37/38 melalui validator, diff/scope dan smoke. Purpose R-01/04/06/07/08/09/10/12/13/14/19/22: tidak menambah teknik dekoratif, alasan font/warna/layout/diagram/jejak di atas. Liveliness: dials 1/2/1, fokus state versus uang, motif jejak Aruna, aksen tindakan lama, whitespace struktural dan variasi tab/disclosure. Craft C-1..C-5 serta R-05/11/15/16/20/21/29/30/31: tugas berbasis sesi asli, CTA spesifik, radius/palette/dua tema lama, tanpa pemasaran, statistik/testimoni rekaan atau kloning. Ini gate perubahan S11, bukan audit ulang lampiran immutable.
- Batasan: seluruh kontrak/urutan/peran adalah asumsi kelas, tanpa klaim eksternal baru. Snapshot bukan mesin transaksi, verifikasi signature, konkurensi, deduplikasi backend, refund atau jaminan tepat satu kali. Payment_id berbeda dan pemulihan order adalah tugas audit/transfer, bukan fungsi dieksekusi. RPS asli tidak diverifikasi, rubrik bukan nilai resmi, catatan tetap lokal. Materi beku, antrean, dependensi bersama dan dashboard tidak diedit.
- Status saat penulisan: GREEN lokal `npm run smoke:pwa` exit 0 setelah build maintainer selesai; gate 174 halaman, baseline/suplemen, desktop/mobile, 16 sesi/48 jawaban, 13 unduhan identik dan offline lulus. Percobaan maintainer pertama berhenti sebelum commit pada assertion fokus kontrol actor S04 di mobile; pengulangan penuh tanpa perubahan kode lulus. Penyebab intermiten belum dipastikan, bukan dianggap perbaikan S04. Log scratch/iasd-s11-release.log dan iasd-s11-retry-smoke.log. Belum klaim publikasi; maintainer wajib diulang sampai semua gate, commit/deploy dan exact revision/baseline live lulus.

### Gate perubahan S11, bukti GREEN lokal (publikasi belum diklaim)

- R-02 PASS: validator suplemen tanpa em dash.
- R-03 PASS: dua viewport/tema tanpa overflow dan select 44px.
- R-17 PASS: ID dan urutan hanya asumsi latihan, tanpa statistik rekaan.
- R-18 PASS: tanpa testimoni.
- R-23 PASS: tidak membuat aset atau identitas baru.
- R-24 PASS: overview #11 dan instructor #11 dibuka smoke.
- R-25 PASS: computed contrast teks tambahan terpindai AA dua tema, bukan sertifikasi seluruh aplikasi.
- R-26 PASS: setiap select, Periksa dan disclosure sesuai click-through teruji di atas.
- R-27 PASS: boot/error penyimpanan lama tetap; belum diperiksa/salah/tersimpan serta backup salah diuji; tanpa fetch baru.
- R-28 PASS: tanpa FAQ.
- R-32 PASS: Enter/Escape/Tab/Shift+Tab dan fokus terlihat diuji.
- R-33 PASS: implementasi langsung sumber, tanpa script penulis ulang UI.
- R-34 PASS: kedua tema diuji, font/layout lama tetap.
- R-35 PASS lokal: build maintainer dan smoke penuh exit 0; click-through di atas, belum klaim produksi.
- R-36 PASS: tanpa klaim keamanan/performa/pelanggan baru.
- R-37 PASS: arah studio serta Design Read/dials sebelum generasi.
- R-38 PASS: kontrak/peran/urutan berlabel asumsi, bukan transaksi nyata.
- R-01 PASS: tanpa gradien/glow baru; aksen tindakan lama.
- R-04 PASS: tanpa ikon baru.
- R-06 PASS: font sistem lama menjaga kontinuitas baca.
- R-07 PASS: tanpa pola latar baru.
- R-08 PASS: panah hanya urutan event, bukan CTA dekoratif.
- R-09 PASS: tanpa badge baru.
- R-10 PASS: tanpa blur baru.
- R-12 PASS: tanpa shadow baru.
- R-13 PASS: tanpa glow baru.
- R-14 PASS: tanpa feature-card, contoh berbasis tugas dalam disclosure.
- R-19 PASS: MOTION 1 memakai interaksi/fokus lama, tanpa animasi baru.
- R-22 PASS: diagram state lama relevan dengan lifecycle, tanpa ilustrasi dekoratif.
- Liveliness PASS: dials 1/2/1 konsisten, fokus state versus uang, whitespace label struktural, aksen tindakan lama, motif O-AR11/P-AR11, variasi Konsep/latihan/Bukti/Dosen; Design Read sebelum generasi.
- C-1 PASS: alasan warna/font/layout/jarak/diagram/jejak tertulis di atas.
- C-2 PASS: semua kontrol tambahan punya hasil teruji.
- C-3 PASS: satu tugas khusus S11, tanpa section template.
- C-4 PASS: belum diperiksa/salah/tersimpan, keyboard, dua tema/viewport, backup dan offline diuji.
- C-5 PASS: asumsi serta batas bukti eksplisit.
- R-05 PASS: struktur berbasis tugas/tab/disclosure lama.
- R-11 PASS: radius kontrol lama dipertahankan.
- R-15 PASS: CTA spesifik Periksa lifecycle dan tindak lanjut.
- R-16 PASS: tanpa buzzword pemasaran.
- R-20 PASS: motif jejak lifecycle Aruna dan transfer tiket, bukan halaman generik.
- R-21 PASS: toggle dua tema tetap aktif dan diuji.
- R-29 PASS: palette lama tanpa warna tambahan.
- R-30 PASS: tidak mengkloning produk lain.
- R-31 PASS: alasan desain tertulis; CSS hanya target select S11.
- Mahasiswa: https://hicall.web.id/iasd/studio#11
- Dosen: https://hicall.web.id/iasd/studio?mode=teach#11

## S12: Arsitektur sistem (4 November 2026, WIB)

- Pemilihan: worktree bersih, fetch dan ff-only origin/main `626cb8e` sebelum authoring. Pembaruan dashboard hanya diterima dari remote, tidak diedit. Sesi 12 lengkap, kasus Aruna dan log S01-S11 dibaca; S12 belum memiliki suplemen. Tidak mengasumsikan progres mahasiswa.
- Satu pendalaman: kontrak reserve O-AR12/K-R12, empat jejak reserved/insufficient_stock/respons hilang/unauthorized. Dua prediksi memisahkan pengetahuan Order dari pemulihan dan menjelaskan owner Inventori, referensi Order, batas UI serta usulan queryReservation. Koreksi timeout bukan gagal, reserved bukan Paid dan komponen logis bukan kewajiban microservices. Transfer peminjaman kamera, acceptance test respons hilang dan rubrik diagnostik empat kriteria.
- Render: contoh/miskonsepsi pada disclosure Konsep, latihan pada simulator arsitektur lama, transfer di Bukti, fasilitasi di Dosen. Mengganti satu tautan overview tanpa menambah katalog/tab. Diagram pembayaran dasar tetap; jalur reserve dan batas diagram dijelaskan eksplisit pada bukti snapshot.
- Kompatibilitas: hanya field sim opsional s12Trace/s12Known/s12Next/s12Reviewed; signature mengikat skenario dan kedua prediksi. KEY, versi, validator backup, baseline, 13 berkas dan syarat selesai tidak diubah. Impor backup lama tanpa field s12 mempertahankan catatan; backup baru harus memulihkan feedback.
- Design Read sebelum generasi, antislop DURING: workspace akademi ringkas mahasiswa/dosen Indonesia, ENERGY 1 / RHYTHM 2 / MOTION 1. Font/palette aksi lama menjaga kontinuitas; disclosure menjaga halaman ringkas dan hierarki; whitespace label serta select 44px membantu sentuhan; diagram lama menunjukkan peran pembayaran, jejak reserve menunjukkan bukti yang hilang dari panah. Tanpa aset, ikon, badge, gradien, glow, shadow, ilustrasi atau animasi baru.
- Gate wajib: smoke kedua viewport menguji seluruh pasangan empat jejak × tiga pengetahuan × lima tindakan, alasan tepat/salah, invalidasi ketiga select, isolasi owner pembayaran, reload, catatan, backup lama/baru/salah, instructor #12, Enter/Escape/Tab/Shift+Tab, fokus/44px, kontras computed teks tambahan pada dua tema, overflow serta penggunaan offline. Regresi 16 sesi/48 jawaban/13 unduhan desktop byte-identik tetap dipertahankan.
- Click-through yang harus dibuktikan oleh exit 0: overview #12 membuka Arsitektur sistem; Enter membuka latihan; setiap select mengubah snapshot/prediksi; Enter Periksa menampilkan alasan; perubahan membuat hasil menunggu; reload memulihkan hasil; Enter/Escape contoh membuka/menutup; Bukti ketik/reload mempertahankan transfer; URL dosen membuka fasilitasi/rubrik; Tab/Shift+Tab mengembalikan fokus terlihat; kedua tema/tap-target/overflow diperiksa; offline latihan berfungsi.
- Delivery gate perubahan, bukan audit ulang baseline immutable: Hard R-02/03/17/18/23/24/25/26/27/28/32/33/34/35/36/37/38 wajib dibuktikan validator, scope dan smoke di atas. R-27 memakai boot/storage-error lama serta state prediksi belum diperiksa/salah/tersimpan, tidak menambah fetch. Purpose R-01/04/06/07/08/09/10/12/13/14/19/22: tanpa teknik dekoratif baru, alasan font/warna/layout/diagram tercatat. Liveliness dials 1/2/1, fokus bukti versus pemulihan, motif jejak Aruna, aksen aksi lama, whitespace struktural dan variasi tab/disclosure. C-1..C-5 serta R-05/11/15/16/20/21/29/30/31: tugas sesi asli, CTA spesifik, radius/palette/dua tema lama, tanpa pemasaran, statistik/testimoni atau kloning.
- Batasan: kontrak, ID dan hasil adalah asumsi kelas. Tidak ada API, reservasi nyata, verifikasi izin, deduplikasi backend atau deployment arsitektur yang dieksekusi. Query adalah usulan yang perlu disepakati. RPS asli tidak diverifikasi, rubrik bukan nilai resmi, catatan lokal. Mata kuliah beku, antrean, dependensi bersama dan dashboard tidak diedit.
- Percobaan kedua: gate berhenti sebelum commit pada fokus/tap s8Decision sesi 08 yang tidak diubah. Probe terisolasi mobile 390×844 menjalankan 60 siklus focus → Tab → Shift+Tab pada kontrol itu, seluruhnya fokus kembali/outline terlihat/tinggi 44px terpenuhi. Tidak mengubah atau melonggarkan tes S08; penyebab intermiten pada rangkaian penuh belum terbukti. Satu pengulangan gate penuh dipakai sebagai pemeriksaan tambahan, bukan klaim perbaikan S08.
- Status saat penulisan: percobaan maintainer pertama berhenti sebelum commit/deploy karena ekspektasi tes isolasi transfer masih hanya mencantumkan S01-S11; S12 sudah merender transfer sehingga tes mendapat 1 alih-alih 0. Daftar sesi ber-suplemen pada assertion ditambah S12, tanpa mengurangi pemeriksaan isolasi sesi lain. Build, gate 174 halaman, baseline dan interaksi S12 desktop sudah terlewati sebelum assertion itu, tetapi belum klaim seluruh gate atau publikasi. Maintainer wajib diulang; bukti akhir disampaikan pada laporan run.
- Mahasiswa: https://hicall.web.id/iasd/studio#12
- Dosen: https://hicall.web.id/iasd/studio?mode=teach#12

## S13: Desain antarmuka (6 November 2026, WIB)

- Pemilihan: worktree awal bersih, fetch dan ff-only dari origin/main sebelum authoring; membaca seluruh sesi 13, kasus Aruna, usability.csv dan log S01-S12. S13 berikutnya tanpa suplemen, bukan inferensi progres mahasiswa. Run 5 November gagal provider sebelum mengarang materi, bukan sesi yang dilewati mahasiswa.
- Design Read sebelum generasi, antislop DURING: workspace akademi ringkas untuk mahasiswa/dosen Indonesia, mempertahankan studio yang ada, ENERGY 1 / RHYTHM 2 / MOTION 1. Warna aksi dan font lokal lama untuk kontinuitas; disclosure memisahkan contoh/latihan/dosen tanpa panjang awal; whitespace label dan select 44px untuk sentuhan; prototipe empat layar tetap menjelaskan navigasi, tabel jejak mengungkap bantuan/versi yang tidak tampak dari klik. Tidak membuat aset, ikon, warna, efek atau animasi baru.
- Satu pendalaman yang dituju: membedakan selesai dengan bantuan, selesai mandiri pada satu percobaan, dan klaim sebab revisi; tiga jejak latihan, prediksi dua keputusan beserta alasan, transfer peminjaman proyektor dan rubrik diagnostik. Semua peserta berkode, detik dan hasil adalah data sintetis berlabel asumsi, bukan observasi manusia nyata.
- RED terverifikasi: browser produksi timeout 3000ms pada `[data-iasd-task-evidence] summary`, log scratch/iasd-s13-red.log. Tes perilaku ditulis sebelum implementasi.
- Status saat penulisan awal: belum klaim implementasi selesai, GREEN atau publikasi. Maintainer harus menjalankan seluruh gate, commit/deploy dan exact revision/baseline read-back; bukti aktual disampaikan pada laporan run. Tidak mengubah baseline, versi/KEY/progres, syarat selesai atau validasi backup. Materi beku/dashboard/dependensi bersama tetap di luar scope.
- GREEN lokal: `npm run build && npm run smoke:pwa` exit 0. Build 188 halaman, gate semua 174 halaman pembelajaran, hash baseline sumber/embedded serta suplemen lulus. Desktop/mobile menguji seluruh 16 sesi/48 jawaban, simulator, catatan, cadangan lama/baru/salah, instructor #13 dan offline; 13 unduhan desktop dibandingkan isi identik lampiran. Homepage 1038px desktop (budget 1400), 1789px mobile (budget 2200). Log scratch/iasd-s13-build.log dan iasd-s13-smoke.log. Sesudah GREEN ini, click-through prototipe normal/error diperluas; maintainer wajib mengulangnya sebelum commit.
- Click-through tambahan yang sudah GREEN: overview #13 membuka sesi; Enter disclosure latihan membuka tiga select; 27 kombinasi jejak/kesimpulan/lanjut menampilkan alasan tepat/salah tanpa mengubah layar dasar; Periksa dengan Enter menampilkan hasil; ubah tiap select mengembalikan pesan belum diperiksa; reload memulihkan feedback; contoh Enter/Escape membuka/menutup; Bukti ketik/reload mempertahankan transfer; dosen #13/disclosure menampilkan fasilitasi/rubrik; Tab/Shift+Tab pada tiga select mengembalikan fokus terlihat, target 44px; toggle kedua tema mempertahankan kontras teks terpindai AA; dua viewport tanpa overflow; offline reload tetap menjalankan jejak C dan contoh. Tidak ada pageerror pada smoke.

### Delivery gate perubahan S13, berdasarkan GREEN lokal (bukan audit ulang baseline immutable)

- R-02 PASS: validator suplemen menolak em dash.
- R-03 PASS: smoke desktop/mobile dan kedua tema tanpa overflow, tiga select minimal 44px.
- R-17 PASS: waktu dan kode peserta berlabel data sintetis/asumsi, bukan statistik website.
- R-18 PASS: tanpa testimoni.
- R-23 PASS: prototipe lama dipertahankan, tanpa logo/avatar/aset baru.
- R-24 PASS: overview #13 dan URL dosen #13 dibuka smoke.
- R-25 PASS: computed contrast teks tambahan terpindai AA dua tema, bukan sertifikasi seluruh aplikasi.
- R-26 PASS: tiga select, Periksa, disclosure dan tautan diuji sesuai click-through di atas.
- R-27 PASS: boot/error penyimpanan lama tetap, belum diperiksa/salah/tersimpan serta invalid-backup diuji; tidak ada fetch baru.
- R-28 PASS: tanpa FAQ tambahan.
- R-32 PASS: Enter/Escape/Tab/Shift+Tab dan fokus terlihat diuji.
- R-33 PASS: implementasi langsung pada sumber, bukan script penulis ulang UI.
- R-34 PASS: kedua tema diuji, font/layout lama tetap.
- R-35 PASS lokal: build dan smoke penuh exit 0, click-through tercatat; belum klaim produksi.
- R-36 PASS: tanpa klaim keamanan/performa/pelanggan baru.
- R-37 PASS: arah studio dan Design Read/dials sebelum generasi.
- R-38 PASS: seluruh jejak peserta/waktu diberi label sintetis, bukan observasi manusia nyata.
- R-01 PASS: tanpa gradien/glow baru, warna aksi lama.
- R-04 PASS: tanpa ikon baru.
- R-06 PASS: font lokal lama menjaga kontinuitas membaca.
- R-07 PASS: tanpa pola latar baru.
- R-08 PASS: tanpa panah dekoratif baru.
- R-09 PASS: tanpa badge baru.
- R-10 PASS: tanpa blur baru.
- R-12 PASS: tanpa shadow baru.
- R-13 PASS: tanpa glow baru.
- R-14 PASS: tabel log untuk perbandingan bukti, tanpa feature-card.
- R-19 PASS: MOTION 1 memakai interaksi/fokus lama, tanpa animasi baru.
- R-22 PASS: prototipe lama relevan untuk navigasi, bukan ilustrasi dekoratif.
- Liveliness PASS: dials 1/2/1, fokus bukti tugas, whitespace label struktural, aksen tindakan lama, motif jejak Aruna dan variasi Konsep/latihan/Bukti/Dosen; Design Read sebelum generasi.
- C-1 PASS: alasan warna/font/layout/jarak/prototipe/tabel tertulis di Design Read.
- C-2 PASS: setiap kontrol tambahan punya hasil teruji.
- C-3 PASS: satu tugas khusus S13, tanpa section pemasaran/template.
- C-4 PASS: belum diperiksa/salah/tersimpan, keyboard, dua tema/viewport, backup dan offline diuji.
- C-5 PASS: asumsi serta batas bukti eksplisit.
- R-05 PASS: komposisi mengikuti tugas/tab/disclosure lama.
- R-11 PASS: radius kontrol lama dipertahankan.
- R-15 PASS: CTA spesifik Periksa log dan uji ulang.
- R-16 PASS: tanpa buzzword pemasaran.
- R-20 PASS: motif stok Aruna ke log/bantuan/revisi dan transfer proyektor, bukan halaman generik.
- R-21 PASS: toggle kedua tema tetap aktif dan diuji.
- R-29 PASS: palette lama tanpa warna tambahan.
- R-30 PASS: tidak mengkloning produk lain.
- R-31 PASS: alasan desain tertulis, CSS hanya target select dan jarak label S13.
- Batasan: latihan bukan uji manusia, stopwatch, eksperimen kausal, implementasi backend, reservasi atau pembayaran. Tidak ada klaim eksternal baru. RPS asli tidak diverifikasi; rubrik bukan nilai resmi; catatan lokal tidak dikirim otomatis. Syarat selesai dan backup lama dipertahankan lewat field sim s13 opsional. Materi beku, antrean, baseline, dependensi bersama dan dashboard tidak diedit. Bukti publikasi harus berasal dari hasil maintainer final, bukan log GREEN lokal ini.
- Mahasiswa: https://hicall.web.id/iasd/studio#13
- Dosen: https://hicall.web.id/iasd/studio?mode=teach#13

## S14: Dokumen SRS (7 November 2026, WIB)

- Pemilihan: worktree awal bersih, fetch/ff-only ke origin/main `721fc74` sebelum authoring. Membaca sesi 14 lengkap, kasus Aruna, traceability.csv, change_log.csv dan log S01-S13; S14 berikutnya tanpa pendalaman, bukan inferensi progres mahasiswa. Pembaruan dashboard remote hanya diterima, tidak diedit.
- Design Read sebelum generasi, antislop DURING: workspace akademi ringkas mahasiswa/dosen Indonesia, mempertahankan studio, ENERGY 1 / RHYTHM 2 / MOTION 1. Warna aksi dan font sistem lama untuk kontinuitas, disclosure untuk hierarki tanpa panjang awal, whitespace label/select 44px untuk sentuhan, diagram jejak lama dan tabel isi untuk membedakan label/versi dari makna. Tanpa aset, ikon, palette, efek, kartu atau animasi baru.
- Satu pendalaman: audit CR-14 reservasi baru 15 menjadi 10 menit, empat kartu test versi lama/guard beda/persetujuan belum ada/paket konsisten untuk review. Prediksi status dan tindakan disertai alasan, miskonsepsi expected versus actual, transfer batas lima unit bukan lima baris, serta fasilitasi prediksi/demonstrasi/penjelasan/transfer dan rubrik diagnostik. Seluruh aturan/ID/persetujuan adalah asumsi kelas, bukan klaim eksternal baru.
- Render: disclosure Konsep, latihan dalam simulator trace lama, transfer Bukti dan disclosure Dosen. Overview mengganti satu tautan terbaru, tidak menambah tab/katalog/panjang homepage umum. Checkbox dampak dasar tidak dimutasi latihan audit. Field sim s14Trace/s14Verdict/s14Next/s14Reviewed opsional; KEY, versi, validator backup, baseline dan syarat selesai tidak diubah.
- RED terverifikasi: browser produksi sebelum implementasi timeout 3000ms pada `[data-iasd-version-audit] summary`. Tes perilaku ditulis sebelum implementasi, perubahan langsung sumber tanpa script penulis ulang UI.
- Gate wajib: empat kartu × tiga status × empat tindakan, alasan tepat/salah, invalidasi tiap select, reload, isolasi simulator dasar, catatan lokal, impor lama/baru/salah, instructor #14, Enter/Escape/Tab/Shift+Tab, fokus/44px, computed contrast teks tambahan dua tema, overflow desktop/mobile dan offline. Regresi 16 sesi/48 jawaban dan 13 unduhan byte-identik dipertahankan. Pemindaian computed contrast bukan sertifikasi aksesibilitas seluruh aplikasi.
- Click-through yang direkam tes, PASS hanya setelah exit 0: overview #14 membuka SRS; Enter disclosure membuka tiga select; tiap select mengubah kartu/prediksi; Enter Periksa versi dan isi memberi alasan; perubahan mengembalikan status belum diperiksa; reload memulihkan feedback; Enter/Escape contoh membuka/menutup; Bukti ketik/reload mempertahankan transfer; URL dosen/disclosure membuka fasilitasi/rubrik; Tab/Shift+Tab mengembalikan fokus/44px; toggle kedua tema mempertahankan kontras/overflow; offline menjalankan kartu B dan contoh.
- Delivery gate perubahan, status wajib dibuktikan sebelum deliver: Hard R-02/03/17/18/23/24/25/26/27/28/32/33/34/35/36/37/38 melalui validator, scope/diff dan smoke di atas. R-27 menggunakan boot/error bundel serta storage lama, belum diperiksa/salah/tersimpan/invalid-backup, tanpa fetch baru. Purpose R-01/04/06/07/08/09/10/12/13/14/19/22: tanpa teknik dekoratif baru, alasan font/warna/layout/tabel/diagram tercatat. Liveliness: dials 1/2/1, fokus audit makna, aksen tindakan lama, motif jejak Aruna dan whitespace struktural. Craft C-1..C-5 serta R-05/11/15/16/20/21/29/30/31: satu tugas sesi, CTA spesifik, radius/palette/dua tema lama, tanpa template pemasaran/buzzword/kloning atau klaim rekaan. Ini gate perubahan S14, bukan audit ulang teks baseline immutable.
- Batasan: kartu tidak menjalankan timer, scheduler, transisi/backend atau tes integrasi. Test batas merupakan expected result walkthrough; callback terlambat dan reservasi lama masih keputusan terbuka. RPS asli tidak diverifikasi, rubrik bukan nilai resmi, catatan tidak dikirim otomatis. Materi beku, antrean, baseline, dependensi bersama dan dashboard tidak diedit oleh run ini.
- Status log: implementasi sumber dengan RED terverifikasi, belum klaim GREEN atau publikasi. Maintainer wajib menjalankan seluruh gate, commit/deploy dan exact revision/baseline read-back; bukti final dilaporkan pada keluaran run. Jangan menandai terbit bila deploy gagal.
- Mahasiswa: https://hicall.web.id/iasd/studio#14
- Dosen: https://hicall.web.id/iasd/studio?mode=teach#14

## S15: Presentasi dan review (8 November 2026, WIB)

- Pemilihan: worktree awal bersih, fetch/ff-only ke origin/main `ec79b02` sebelum authoring. Seluruh sesi 15, kasus Aruna, change_log.csv, contribution.csv, test_cases.csv dan log S01-S14 dibaca. S15 berikutnya tanpa suplemen, bukan inferensi progres mahasiswa. Pembaruan dashboard remote hanya diterima, tidak diedit.
- Design Read sebelum generasi, antislop DURING: workspace belajar ringkas mahasiswa/dosen Indonesia, mempertahankan studio, ENERGY 1 / RHYTHM 2 / MOTION 1. Warna aksi/font lokal lama untuk kontinuitas, disclosure untuk hierarki tanpa panjang awal, whitespace label/select 44px untuk sentuhan; diagram dampak lama dipertahankan, kartu bukti membedakan kewenangan/lingkup, bukan dekorasi. Tanpa aset, ikon, palette, efek, kartu pemasaran atau animasi baru.
- Satu pendalaman: pembelaan retur sebagian melalui tiga kartu: aturan disepakati dalam asumsi, dua komentar bertentangan tanpa keputusan, dan kontras tombol saja. Prediksi lingkup/respons dengan alasan benar/salah; worked example sisa tiga dikurangi satu, test 0/1/2/3; histori dan permohonan/penerimaan/refund dipisah. Transfer alat dan fasilitasi prediksi/demonstrasi/penjelasan/transfer beserta rubrik diagnostik menilai alasan dan kontribusi individu.
- Render: disclosure Konsep, latihan dalam simulator review, transfer Bukti dan disclosure Dosen; overview mengganti satu tautan terbaru. Tidak mengubah homepage umum/tab/navigasi. Field sim s15Trace/s15Scope/s15Next/s15Reviewed opsional; KEY, versi, validator backup, baseline lampiran dan syarat selesai tetap.
- Pemeriksaan awal: node --check kedua file JS dan git diff --check exit 0. Hitungan contoh diuji Python: kedua sisa 2; q=0/3 false, q=1/2 true; 27 kombinasi kartu/lingkup/respons. Tidak mengklaim TDD RED: tes ditambah sesudah implementasi, bukan hasil uji gagal yang direka.
- Gate wajib sebelum publikasi: 27 kombinasi, invalidasi tiap select, reload, isolasi checkbox dasar, catatan transfer, backup lama/baru/salah, instructor #15, keyboard/fokus/44px, dua tema/kontras teks terpindai, overflow desktop/mobile dan penggunaan offline. Regresi 16 sesi/48 kuis dan 13 unduhan byte-identik tetap.
- Click-through direkam tes, PASS hanya setelah exit 0: overview #15 membuka sesi; Enter disclosure membuka tiga select; tiap pilihan mengubah kartu/prediksi, Enter Periksa memberi alasan; perubahan membatalkan feedback lama; reload memulihkan hasil; Enter/Escape contoh membuka/menutup; tab Bukti ketik/reload memulihkan catatan; URL dosen/disclosure membuka fasilitasi/rubrik; Tab/Shift+Tab fokus/44px; toggle dua tema tanpa overflow dan kontras terpindai AA; offline kartu konflik tetap berfungsi.
- Gate perubahan yang harus dibuktikan sebelum deliver: Hard R-02/03/17/18/23/24/25/26/27/28/32/33/34/35/36/37/38 lewat validator/scope dan smoke. R-27 mempertahankan boot/error bundel/storage lama serta belum diperiksa/salah/tersimpan/invalid-backup, tanpa fetch baru. Purpose R-01/04/06/07/08/09/10/12/13/14/19/22: tidak menambah teknik dekoratif; alasan font/warna/disclosure/jarak/diagram tercatat. Liveliness: dials 1/2/1, fokus respons review, aksen tindakan lama, motif bukti Aruna dan whitespace struktural. Craft C-1..C-5 serta R-05/11/15/16/20/21/29/30/31: tugas khusus sesi, CTA Periksa respons review, radius/palette/tema lama, tanpa marketing/template/kloning/klaim rekaan. Ini gate perubahan S15, bukan audit ulang lampiran immutable.
- Batasan: seluruh kebijakan/jumlah/owner adalah asumsi kelas, bukan fakta eksternal baru. Snapshot tidak menjalankan retur, kontrol konkurensi, penerimaan barang, stok atau refund; nominal refund masih terbuka. RPS asli tidak diverifikasi; rubrik bukan nilai resmi; catatan lokal tidak dikirim otomatis. Materi beku/antrean/baseline/dependensi bersama/dashboard tidak diedit.
- Status saat penulisan: implementasi sumber dan pemeriksaan awal, belum klaim GREEN/publikasi. Maintainer harus mengulang semua gate, commit/deploy dan exact revision/baseline read-back; hasil aktual disampaikan pada keluaran run. Kegagalan deployment bukan published.
- Mahasiswa: https://hicall.web.id/iasd/studio#15
- Dosen: https://hicall.web.id/iasd/studio?mode=teach#15

## S16: UAS capaian menyeluruh (9 November 2026, WIB)

- Pemilihan: worktree awal bersih, fetch/ff-only ke origin/main `e1ea9ab` sebelum authoring. Seluruh sesi 16, kasus Aruna, traceability.csv/change_log.csv/test_cases.csv dan log terkini dibaca; data suplemen menunjukkan S01-S15 tersedia dan S16 belum. Pemilihan berdasarkan cakupan, bukan inferensi progres mahasiswa. Perubahan dashboard dari remote hanya diterima, tidak diedit.
- Design Read sebelum generasi: workspace akademi ringkas mahasiswa/dosen Indonesia, arah studio dipertahankan, ENERGY 1 / RHYTHM 2 / MOTION 1. Warna aksi/font lokal lama untuk kontinuitas; disclosure untuk kedalaman tanpa memperpanjang tampilan awal; label terpisah dan target 44px untuk sentuhan; diagram jejak lama dan tabel ledger untuk membedakan alokasi/event/serah-terima, bukan dekorasi. Tidak ada aset, ikon, palette, efek atau animasi baru.
- Satu pendalaman: rencana stok A=2/B=2 untuk permintaan tiga dibandingkan kebijakan satu lokasi; kartu A pengambilan dua, B event sama diulang, C event baru satu dari B. Prediksi status pemenuhan dan respons event disertai alasan tepat/salah serta ledger per alokasi. Worked example menghubungkan FR-WH ke Allocation/Pickup/kontrak/UI/test, mempertahankan harga historis; transfer kamera dan fasilitasi prediksi/demonstrasi/penjelasan/transfer dengan rubrik diagnostik.
- Render: contoh Konsep, latihan di simulator S16, transfer Bukti dan fasilitasi Dosen; overview mengganti satu tautan terbaru. Field sim s16Trace/s16Status/s16Next/s16Reviewed opsional. KEY, versi, validasi backup, syarat selesai dan baseline tidak diubah. Slider stok dasar tidak dimutasi kartu independen.
- Pemeriksaan yang ditambahkan: 18 kombinasi kartu/status/respons, ledger tepat, invalidasi tiap select, reload, catatan lokal, backup lama/baru/salah, keyboard/fokus/44px, dua tema/kontras teks terpindai, overflow, penggunaan offline. Seluruh regresi lama termasuk assertion fokus S04 dipertahankan. Tidak mengklaim TDD RED: tes ditambahkan setelah implementasi.
- Click-through yang akan dibuktikan oleh smoke: tautan overview #16 membuka sesi; Enter disclosure membuka tiga select; pilihan mengubah prediksi/kartu; Enter Periksa menghasilkan alasan dan ledger; perubahan membatalkan feedback; reload memulihkan hasil; Enter/Escape contoh membuka/menutup; catatan Bukti bertahan reload; fasilitasi Dosen terbuka; Tab/Shift+Tab dan dua tema mempertahankan fokus/44px; offline kartu C berfungsi. Status PASS hanya setelah hasil eksekusi tersedia.
- Review kode manual: input baru dibatasi pick/enum, teks data di-escape, signature mengikat seluruh jawaban, state opsional memakai validasi sim lama, tidak ada API/efek eksternal atau dependensi baru. CLI aislop tidak ditemukan pada PATH; tidak mengklaim skor scanner. Pemindaian computed contrast bukan sertifikasi aksesibilitas seluruh aplikasi.
- Gate perubahan yang harus dibuktikan: Hard R-02/03/17/18/23/24/25/26/27/28/32/33/34/35/36/37/38 melalui scope, validator dan smoke. R-27 memakai boot/error bundel serta storage lama, state belum diperiksa/salah/tersimpan/invalid-backup tanpa fetch baru. Purpose R-01/04/06/07/08/09/10/12/13/14/19/22 tanpa teknik dekoratif baru, alasan font/warna/layout/tabel/diagram tercatat. Liveliness dials 1/2/1, fokus ledger, whitespace label, aksen tindakan dan motif bukti Aruna. Craft C-1..C-5 serta R-05/11/15/16/20/21/29/30/31: satu tugas khusus sesi, CTA spesifik, radius/palette/tema lama tanpa marketing/template/kloning atau fakta rekaan. Ini gate perubahan, bukan audit ulang lampiran immutable.
- Isu regresi S04 mobile-focus tetap TERBUKA: run sebelumnya gagal lalu retry lulus tanpa penyebab terisolasi. Tidak diperbaiki oleh pendalaman S16; run/retry yang gagal harus tetap dicatat, hasil lulus baru tidak menutup isu atau membenarkan klaim regresi tanpa kualifikasi.
- Batasan: kontrak atomik/otorisasi/pembayaran/ledger adalah asumsi, bukan backend yang dieksekusi. ID sama dengan payload berbeda, retensi, konkurensi dan kebijakan reservasi lama masih perlu keputusan/uji. RPS asli tidak diverifikasi, latihan UAS publik bukan ujian resmi, rubrik bukan nilai resmi; catatan tidak dikirim otomatis. Materi beku, antrean, baseline, dependensi bersama dan dashboard tidak diedit.
- Status saat penulisan: implementasi sumber, belum klaim GREEN atau publikasi. Maintainer wajib menjalankan gate, commit/deploy dan exact revision/baseline read-back; bukti final dilaporkan pada keluaran run. Jangan menandai published bila deploy gagal.
- Mahasiswa: https://hicall.web.id/iasd/studio#16
- Dosen: https://hicall.web.id/iasd/studio?mode=teach#16

## S01 putaran kedua: aturan stabil versus bukti stok mutakhir (10 November 2026, WIB)

- Pemilihan: worktree awal bersih, fetch/ff-only origin/main `d6892cc` sebelum authoring. Membaca sesi 01 lengkap, kasus Aruna, seluruh entri log dan struktur suplemen. Seluruh 16 sesi sudah memiliki pendalaman; S01 paling lama belum ditinjau dan belum menguraikan pertanyaan bawaan stok hanya diperbarui malam hari. Bukan inferensi progres mahasiswa. Pembaruan dashboard remote hanya diterima, tidak diedit.
- Design Read sebelum generasi: workspace akademi ringkas mahasiswa/dosen Indonesia, mempertahankan studio, ENERGY 1 / RHYTHM 2 / MOTION 1. Font/palette/fokus lama untuk kontinuitas, disclosure untuk kedalaman tanpa memperpanjang tampilan awal, whitespace label lama untuk keterbacaan, diagram SDLC lama untuk hasil kerja lima tahap. Perubahan teks saja, tanpa layout/kontrol/aset/efek baru.
- Satu pendalaman: buku dua/rak satu/permintaan dua dengan pembaruan malam, jejak FR-STOK-v1 ke desain/implementasi/test/operasi, hasil stok kurang versus belum pasti, feedback pilihan metode yang tidak mengklaim akurasi stok. Transfer ruang rapat membedakan kalender salinan dan bukti bentrok; fasilitasi serta empat kriteria diagnostik membantu dosen meminta pembelaan individu. Seluruh angka/jadwal/versi/owner adalah asumsi kelas, tanpa klaim eksternal baru.
- Render: mengganti suplemen S01 dalam disclosure Konsep/Bukti/Dosen dan label tautan overview yang sudah ada; memperdalam tiga pesan feedback pada kontrol S01 lama. Tidak menambah section/katalog/tab. Pilihan, signature, KEY, versi, validator cadangan, progres dan syarat selesai tidak berubah. S02-S16, baseline, 13 berkas dan materi beku tidak diedit.
- Pemeriksaan awal: node --check runtime/tes dan git diff --check exit 0. Perbandingan JSON terhadap HEAD membuktikan hanya suplemen key 1 berubah; baseline tidak berubah dan S01 tanpa em dash. Review kode manual karena CLI aislop tidak ditemukan di PATH: perubahan runtime hanya string alasan, input/escaping/signature/efek tetap, tes mempertahankan seluruh pemeriksaan lama termasuk S04. Tidak mengklaim skor scanner atau TDD RED; tes diperluas setelah penulisan materi.
- Gate tambahan: seluruh 12 kombinasi kondisi/prediksi S01 kini juga menuntut alasan pembaruan malam dan koreksi spesifik; contoh yang benar-benar dibuka harus memuat FR-STOK-v1, TC-STOK, tanpa reservasi baru, bukti belum tersedia, implementasi/operasi kelak dan batas walkthrough. Tes overflow contoh terbuka ditambahkan. Regresi seluruh 16 sesi/48 kuis, backup lama/baru/salah, 13 unduhan desktop identik dan offline tetap diwajibkan.
- Click-through yang akan diverifikasi: dua kondisi dan prediksi S01 → feedback tepat/salah; Enter Periksa alasan → alasan baru; ubah prediksi → status belum diperiksa; reload → pilihan/feedback pulih; Enter contoh → jejak stok malam; Bukti → transfer ruang rapat; Dosen/disclosure → fasilitasi/rubrik. PASS hanya sah setelah perintah tes terkait benar-benar selesai.
- Isu S04 mobile-focus tetap TERBUKA; tidak disentuh, dilonggarkan atau dianggap diperbaiki karena run berikutnya lulus. Catat setiap kegagalan/retry bila terjadi. Batas lain: snapshot stok tertulis bukan simulator stok/backend, tidak membuktikan konkurensi, penerimaan pesanan, pembayaran atau penyebab selisih hilang. RPS asli tidak diverifikasi; rubrik bukan nilai resmi; catatan tetap lokal.
- Percobaan maintainer pertama berhenti sebelum commit/deploy pada pemeriksaan penolakan backup salah (`#toast` belum memuat Tidak dipulihkan), bukan pada S01 atau S04. Probe lokal dengan File.text yang ditahan sampai sinyal manual membuktikan setInputFiles selesai sebelum handler async validasi selesai: toast awal kosong, setelah pembacaan dilepas muncul penolakan versi yang benar. Tes diperbaiki pada batas observasi dengan waitForFunction pesan penolakan, assertion asli dipertahankan; tidak mengubah runtime impor, menambah sleep atau melonggarkan timeout. Bukti probe: scratch/iasd-import-probe.mjs dan keluaran terminal; kegagalan pertama scratch/iasd-s01-round2-release.log. Maintainer wajib mengulang seluruh gate sesudah perbaikan tes, belum klaim publikasi.
- Percobaan kedua berhenti sebelum smoke berjalan karena preview probe milik run ini masih aktif pada port 41381; Astro menolak preview kedua. Preview probe dihentikan melalui process_manage, tanpa menghentikan layanan pengguna. Ini kegagalan setup pemeriksaan, bukan regresi materi atau alasan bypass gate. Log scratch/iasd-s01-round2-release-repaired.log; perintah maintainer diulang setelah cleanup.
- Bukti publikasi awal: maintainer percobaan ketiga exit 0, commit `10cd8e7bcebac5a20ddf86d8f0c4edac053d7e95`; manifest, baseline dan seluruh suplemen produksi identik sumber, revisi `a757b9e5e1c6da0dfc8dbd18b39a353dc5105e4051781291efe51b88914ed442`. Probe produksi S01 desktop/mobile masing-masing 12 kombinasi, invalidasi/reload/catatan, dua tema/fokus/overflow, akses dosen dan offline exit 0 tanpa pageerror. Computed contrast teks S01 yang dipindai AA pada dua tema.
- Pemeriksaan lanjutan menemukan tiga select S01 lama hanya 41px. Ditambahkan min-height 44px khusus kontrol S01 dan assertion tinggi ketiganya; bukan redesign atau perubahan sesi lain. Alasan: target sentuh, tanpa mengubah warna/font/spacing lain. Rilis koreksi wajib melewati maintainer kembali; jangan menyebut revisi awal sebagai bukti CSS baru. Isu fokus S04 tetap terbuka. Durasi run melewati target sekitar 15 menit untuk menyelesaikan koreksi gate yang terukur, bukan memperluas sesi.
- Status log saat penulisan: konten awal telah terbukti live; koreksi target sentuh belum diklaim terbit. Maintainer wajib menjalankan gate, commit/deploy dan exact revision/baseline read-back ulang; bukti hasil aktual pada laporan run. Jangan menandai CSS terbit jika deployment gagal.
- Mahasiswa: https://hicall.web.id/iasd/studio#1
- Dosen: https://hicall.web.id/iasd/studio?mode=teach#1

## S02 putaran kedua: hasil akhir versus spinner (11 November 2026, WIB)

- Pemilihan: worktree awal bersih, fetch/ff-only origin/main `cc43773` sebelum authoring. Membaca seluruh sesi 02, kasus Aruna, interview.csv/requirements.csv, suplemen S02 dan riwayat lengkap judul pendalaman. Seluruh sesi sudah mendapat suplemen, S01 sudah putaran kedua; S02 paling lama belum diperdalam. Bukan inferensi progres mahasiswa. Dashboard remote hanya diterima, tidak diedit.
- Design Read sebelum perubahan materi: workspace akademi ringkas mahasiswa/dosen Indonesia, arah studio tetap, ENERGY 1 / RHYTHM 2 / MOTION 1. Warna/font/fokus lama untuk kontinuitas; disclosure untuk kedalaman tanpa memperpanjang tampilan awal; whitespace serta kontrol lama untuk keterbacaan; diagram klasifikasi lama untuk kutipan. Tidak mengubah layout, aset, CSS, tab atau navigasi.
- Satu pendalaman: jejak A membedakan spinner satu detik dari penolakan benar tiga detik; contoh lawan B cepat satu detik tetapi salah reservasi. FR, durasi, persetujuan dan bukti beban menjadi empat pemeriksaan berbeda. AC-WAKTU-v0 memperjelas titik akhir dan tabel bukti. Feedback interaktif lama diperdalam, transfer P/Q proyektor serta fasilitasi/rubrik meminta alasan bukan waktu tercepat. Kartu B/P/Q tertulis, bukan mode simulator baru. Seluruh angka adalah asumsi sintetis kelas, tanpa klaim eksternal baru.
- Render: mengganti suplemen S02 pada Konsep/Bukti/Dosen dan pesan hasil kontrol S02 lama. Tidak menambah section, kontrol atau file data tak terpakai. KEY/versi, signature, validator cadangan, progres, baseline, jawaban kuis dan berkas bundel tidak diubah. S01/S03-S16 serta materi beku tetap.
- Tes diperluas: 16 kombinasi stok/persetujuan/dua prediksi menuntut koreksi spinner, empat pemeriksaan, respons cepat salah dan actual beban belum diuji. Contoh dan transfer yang benar-benar dibuka wajib memuat kartu dan AC baru. Invalidasi/reload, keyboard/fokus/44px, dua tema/kontras teks terpindai, overflow, backup lama/baru/salah dan offline tetap di gate. Seluruh 16 sesi/48 kuis dan 13 unduhan desktop identik tetap wajib. Tidak mengklaim TDD RED: tes diperluas sesudah implementasi.
- Click-through yang harus dibuktikan: buka latihan; ubah stok/persetujuan/batas/prediksi; Enter Periksa memberi alasan; ubah batas menghapus hasil lama; reload memulihkan; contoh terbuka memuat A/B; Bukti memuat P/Q; Dosen memuat fasilitasi/rubrik; tema/Tab/Shift+Tab dan offline tetap berfungsi. PASS hanya setelah hasil perintah tersedia.
- Review manual scoped diff: runtime hanya string hasil, tanpa perubahan input/escaping/state/efek; JSON hanya key 2; tes menambah assertion tanpa menghapus gate lama. Scanner aislop tidak ditemukan pada PATH, tidak memasang dependensi atau mengklaim skor. Perbandingan durasi memakai Python; tidak mengklaim benchmark website.
- Gate perubahan yang harus dibuktikan: Hard R-02/03/17/18/23/24/25/26/27/28/32/33/34/35/36/37/38 melalui validator/scope/smoke. R-27 memakai bundel sinkron dan boot/error/storage lama, tanpa fetch baru. Purpose R-01/04/06/07/08/09/10/12/13/14/19/22 tanpa teknik dekoratif baru; font/warna/disclosure dipertahankan dengan alasan di atas. Liveliness dials 1/2/1, fokus keputusan bukti, aksen aksi lama, motif jejak Aruna, whitespace struktural. Craft C-1..C-5 dan R-05/11/15/16/20/21/29/30/31 mengikuti tugas sesi, CTA lama spesifik, palette/radius/dua tema tetap, tanpa marketing atau kloning. Ini gate perubahan, bukan audit ulang teks baseline immutable.
- Isu S04 mobile-focus tetap TERBUKA, assertion tidak dihapus atau dilonggarkan. Run/retry gagal harus dicatat; retry lulus bukan isolasi penyebab. Batas materi: tidak mengukur waktu browser, menjalankan reservasi atau uji beban; persetujuan sintetis bukan keputusan kampus. RPS asli belum diverifikasi, rubrik bukan nilai resmi, catatan lokal tidak dikirim otomatis.
- Status saat penulisan: implementasi sumber, belum klaim GREEN/publikasi. Perintah maintainer wajib mengulang seluruh gate, commit/deploy dan exact production read-back; bukti aktual disampaikan pada keluaran run. Tidak menandai published jika deployment gagal.
- Mahasiswa: https://hicall.web.id/iasd/studio#2
- Dosen: https://hicall.web.id/iasd/studio?mode=teach#2

## S03 putaran kedua: akhir aliran bukan penerimaan bisnis (12 November 2026, WIB)

- Pemulihan 14 November 2026, WIB: empat file draft S03 dari run sebelumnya dipertahankan, patch biner disimpan di scratch/iasd-s03-recovery-20261114.patch. Fetch membuktikan HEAD tertinggal dua commit yang hanya memperbarui dashboard; ff-only berhasil ke origin/main e20ff71 tanpa menyentuh draft atau mengedit dashboard. Tidak menambah sesi lain: menyelesaikan satu pendalaman S03 tertunda. Seluruh sesi 03, kasus, suplemen serta riwayat pendalaman dibaca ulang; hanya key 3 suplemen berubah dan baseline byte-identik HEAD. Koreksi instruksi dosen Q versi Aruna menjadi jejak B Aruna agar konsisten dengan contoh; Q tetap nama transfer perpustakaan. Node syntax dan diff whitespace lulus; aislop tidak tersedia di PATH, review manual tanpa skor. Isu S04 mobile-focus tetap TERBUKA; belum ada klaim rilis atau regresi penuh sampai hasil gate aktual.
- Pemilihan: worktree awal bersih, fetch/ff-only origin/main `fa51674` sebelum authoring. Membaca seluruh sesi 03, kasus Aruna, suplemen S03 serta log sampai S02 putaran kedua. Seluruh sesi sudah ber-suplemen; S03 paling lama belum ditinjau ulang. Tidak mengasumsikan progres mahasiswa. Dashboard remote hanya diterima, tidak diedit.
- Design Read untuk perubahan teks: workspace akademi ringkas mahasiswa/dosen Indonesia, arah studio lama, ENERGY 1 / RHYTHM 2 / MOTION 1. Font/palette/fokus lama untuk kontinuitas; disclosure untuk kedalaman tanpa panjang awal; whitespace label lama untuk keterbacaan; diagram token lama untuk percabangan. Tanpa layout/kontrol/CSS/aset/efek baru.
- Satu pendalaman: A mereservasi, B menolak dengan benar, keduanya bisa ke End memakai exclusive merge. C tertulis mencapai End tetapi salah mereservasi stok kurang; audit aliran dipisahkan dari pesan/efek task dan pembayaran. Join macet tidak membuktikan rollback. Feedback kontrol S03 lama, transfer perpustakaan P/Q/R, AC-KURANG dan rubrik diagnostik meminta alasan berbukti. Seluruh angka/kontrak berlabel asumsi; C bukan mode simulator baru, actual backend belum diuji. Tidak ada klaim eksternal baru.
- Render: mengganti hanya suplemen key 3 pada Konsep/Bukti/Dosen dan menambah alasan pada hasil kontrol S03 lama. KEY/versi/signature, progres, backup, jawaban kuis/baseline dan 13 berkas tidak diubah. Homepage/navigasi tetap; S01/S02/S04-S16 dan mata kuliah beku tidak diedit.
- Tes diperluas sesudah implementasi, bukan klaim TDD RED: delapan pasangan stok/join/prediksi wajib memuat hasil task A/B, koreksi End/rollback, FR dan batas backend. Contoh dibuka harus memuat C/AC-KURANG; transfer dibuka memuat P/Q/R. Assertion lama, termasuk fokus S04 mobile, dipertahankan. Klik Periksa dengan Enter, invalidasi/reload, contoh, Bukti, Dosen, dua tema/fokus/kontras teks terpindai/overflow dan offline tetap wajib.
- Review manual scoped diff: runtime hanya menambah string hasil berdasarkan enum stok lama; tanpa input/escaping/signature/efek baru. Scanner aislop tidak ditemukan pada PATH, tanpa instalasi atau skor rekaan. JSON hanya key 3 berubah, baseline tetap diperiksa. Isu S04 mobile-focus TERBUKA, bukan diperbaiki oleh run ini; retry lulus tidak menutup penyebab.
- Gate antislop perubahan wajib dibuktikan: Hard R-02/03/17/18/23/24/25/26/27/28/32/33/34/35/36/37/38 melalui validator/scope/smoke; R-27 memakai boot/storage-error lama dan state belum diperiksa/salah/tersimpan, tanpa fetch. Purpose R-01/04/06/07/08/09/10/12/13/14/19/22 tidak menambah teknik dekoratif; alasan font/warna/layout/diagram di atas. Liveliness dials 1/2/1, fokus audit dua pertanyaan, motif jejak Aruna, whitespace dan aksen aksi lama. C-1..C-5 serta R-05/11/15/16/20/21/29/30/31 mengikuti tugas, palette/radius/tema dan CTA spesifik lama, tanpa pemasaran/kloning/klaim rekaan. Gate hanya perubahan S03, bukan audit ulang lampiran immutable.
- Status saat penulisan: implementasi sumber, belum klaim GREEN atau publikasi. Maintainer wajib menjalankan gate/commit/deploy dan exact live revision/baseline read-back; bukti aktual pada laporan run. Kegagalan tidak boleh dicatat terbit. RPS asli belum diverifikasi, rubrik bukan nilai resmi dan catatan lokal tidak dikirim otomatis.
- Mahasiswa: https://hicall.web.id/iasd/studio#3
- Dosen: https://hicall.web.id/iasd/studio?mode=teach#3
