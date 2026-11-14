AiFn: 16 lab Python offline, Universitas Cakrawala

Semua data sintetis untuk pembelajaran. Bukan nasihat investasi, keputusan kredit nyata, atau ujian resmi.

1. Unduh aifn-labs.ipynb dan aifn-synthetic.csv. Opsional: aifn-labs.py adalah sumber Python yang sama.
2. Jupyter lokal: gunakan Python 3, simpan CSV pada working directory notebook. Restart Kernel lalu Run All. Tidak memerlukan paket eksternal atau jaringan.
3. Alternatif terminal: python aifn-labs.py, dari folder CSV.
4. Colab: buka Google Colab manual, File > Upload notebook, unggah CSV lewat panel Files, lalu Run All. Colab sendiri memerlukan internet; jalur Jupyter/terminal lokal tidak.
5. Jalankan sel setup lebih dahulu, lalu Lab 1 sampai Lab 16. Output notebook sengaja kosong agar hasil benar-benar berasal dari eksekusi Anda.

Kontrak CSV: 24 baris sintetis; id unik; income juta rupiah/bulan >0; debt_ratio 0-1; default 0/1 dalam horizon ilustratif 90 hari; group A/B untuk audit saja; month 1-12. Label dibangkitkan secara deterministik dari rasio utang untuk baseline yang mudah diaudit, bukan proses kredit realistis. Tidak mencakup bias seleksi, perubahan ekonomi, atau perilaku nasabah nyata.

Train month<=8, validation month9-10, test month11-12. Praproses dipelajari dari train, ambang dipilih pada validation. Baseline supervised benar-benar mempelajari centroid kelas dari train. Skor jarak BUKAN probabilitas terkalibrasi. Lab regresi memakai target pengeluaran buatan yang dinyatakan eksplisit, bukan outcome observasi CSV. Demo delapan skor di studio/Lab10 terpisah dari 24 baris CSV untuk menghitung ROC/AUC manual. Cluster studio hanya assignment satu langkah; notebook melanjutkan update centroid sampai stabil.

Claude opsional: salin prompt sesi 9 ke antarmuka Claude secara manual jika tersedia. Jangan unggah data nasabah, kunci, atau materi privat. Tidak ada panggilan API atau jaringan dari notebook. Bandingkan label dengan anotator manusia; jangan menjadikan sentimen rekomendasi beli/jual.

Studio: /aifn/studio#1. Pengajar publik: /aifn/studio?mode=teach#1. Kunjungi online sekali dan tunggu cache siap sebelum mencoba reload offline. Browser tanpa service worker tetap dapat memakai unduhan lokal.

Progres/notes memakai hicall-aifn-studio-v1 dan tidak menyentuh penyimpanan IASD. Ekspor JSON bersifat pribadi. Impor hanya menerima course aifn, version 1, id sesi1-16 dan nilai skema yang sah. Tidak ada sinkronisasi ke server.
