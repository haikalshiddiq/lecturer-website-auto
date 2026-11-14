AiFn: 16 lab keuangan dengan data publik, Python stdlib dan JavaScript lokal

MULAI DARI EXCEL
1. Unduh aifn-labs.ipynb dan aifn-finance.csv ke satu folder kerja.
2. Jupyter lokal dengan Python 3.10+: Restart Kernel, lalu Run All. Tidak perlu
   memasang pandas, scikit-learn, paket lain, API atau mengunduh data saat run.
3. Alternatif terminal dari folder CSV: python3 aifn-labs.py.
4. Google Colab: unggah notebook, lalu unggah CSV melalui panel Files.
   Colab memerlukan internet; notebook/script lokal tidak memerlukan jaringan.
5. Jalankan setup lalu 16 lab berurutan. Notebook sengaja tanpa output tersimpan.
   Setiap angka benar-benar dihitung saat Run All, bukan tangkapan output palsu.
6. Setiap sesi: 30-45 menit terpandu (5 menit persoalan, 10 menit baca contoh,
   15-20 menit jalankan/cocokkan Excel, 5-10 menit diskusi), lalu tugas notebook.
   Capaian dan judul sesi mengikuti RPS; latihan UTS/UAS publik bukan ujian resmi.

DATA DAN LISENSI
Hofmann, H. (1994). Statlog (German Credit Data). UCI Machine Learning Repository.
DOI: https://doi.org/10.24432/C5NC77
https://archive.ics.uci.edu/dataset/144/statlog+german+credit+data
Lisensi CC BY 4.0: https://creativecommons.org/licenses/by/4.0/legalcode
1000 baris asli, 700 good dan 300 bad. Bukan dataset sintetis. Data teks sentimen
Lab9 saja adalah SINTETIS, termasuk label referensinya; bukan berita/anotasi
manusia nyata dan bukan keluaran Claude. Claude opsional melalui antarmuka
manual, tanpa API berbayar, kunci atau output Claude yang direkayasa.

credit.json berisi tepat {meta,records}. Meta memuat title,sourceUrl,downloadUrl,
license,licenseUrl,retrievedAt,sourceSha256,currency,limitations.
CSV dan setiap record JSON memiliki kolom yang sama, dalam urutan:
sourceRow,duration,amount,installmentRate,existingCredits,age,risk
sourceRow: ordinal lokal 1-based dari german.data, bukan ID nasabah.
duration: bulan. age: tahun, audit saja, tidak digunakan sebagai fitur keputusan.
amount: nilai kredit sumber. UCI Attribute5 tidak menyebut mata uang: jangan
menampilkan Rp/IDR atau mengasumsikan konversi. german.doc menyebut DM pada
atribut lain, bukan kepastian satuan amount. installmentRate: integer asli 1-4,
dideskripsikan sumber sebagai installment rate in percentage of disposable
income; tidak ditambahkan batas kategori atau pemetaan persen yang tidak ada.
existingCredits: jumlah kredit yang ada di bank ini.
risk: sumber class1 good menjadi0, class2 bad menjadi1. Label historis
creditworthiness, BUKAN default 90 hari. Tidak ada tanggal, nama atau ID pribadi.
Tidak mewakili nasabah Indonesia atau kondisi ekonomi sekarang.

Bukti resmi disimpan di data/: archive ZIP, german.data, german.doc, metadata
API, snapshot halaman dengan pernyataan CC BY 4.0, ATTRIBUTION.txt dan
provenance.json. sourceSha256 merujuk byte german.data, BUKAN byte ZIP:
b21f3d81db8071257d5ff1deaeba1fd4303b62712e6fcc9715c7a86202cb5871
ZIP SHA256:
e12d9d5def6845c0622634a1cd2ab87fa470668c4298f1ec52a4e403376a435b
Rebuild offline dari root repo: python3 scripts/aifn-data-build.py
Builder mempertahankan retrievedAt saat membangun ulang byte sumber yang sama.

MODEL DAN BATAS
Split deterministik seeded stratified 80/20 (seed2026, train800/test200).
Bukan split waktu karena sumber tidak menyediakan timestamp. Standardisasi
classifier/regresi hanya FIT TRAIN. Tidak ada imputasi diam-diam: input yang
hilang/rusak ditolak. Data resmi tidak memiliki missing pada kolom terpilih.
Classifier logistic regression mempelajari duration,log1p(amount),installmentRate,
existingCredits; age hanya untuk audit kelompok usia<25 vs>=25. Cutoff tersebut
pilihan latihan, bukan standar hukum atau jaminan fairness. 600 gradient updates,
learning rate.15, penalti L2.01 untuk bobot selain intercept. Skor 0-1 bukan PD
terkalibrasi. Semua ROC, confusion matrix dan audit memakai skor holdout yang sama.
Regresi memprediksi ACTUAL amount dari duration,installmentRate,existingCredits
menggunakan persamaan linear ridge1e-8 untuk kestabilan. Tidak memasukkan amount
sebagai input. Baseline memakai mean amount TRAIN lalu MAE HOLDOUT.
K-means k3 memakai standardized amount/duration (seluruh data, unsupervised),
centroid awal seeded/farthest-first, assign-update sampai stabil/max100.
Cluster bukan kelas risiko dan bukan bukti segmen pemasaran yang siap dipakai.
Biaya FN5/FP1 dari matriks ilustratif UCI dalam UNIT HIPOTETIS, tanpa mata uang.
Threshold di studio adalah eksplorasi deskriptif, bukan rekomendasi kebijakan.
Notebook memilih threshold di validation INTERNAL TRAIN, bukan pada test final.
Perbandingan eksperimen juga internal train. Test tidak dipakai tuning.

KONTRAK ENGINE UNTUK STUDIO
Module: src/scripts/aifn-finance-engine.js
Exports: analyzeFinance, metricsAt, auditAt, auc, splitRecords, validateRecords,
fitLogistic, fitRegression, kmeans, CLASS_FEATURES, REG_FEATURES.
analyzeFinance(records, {seed=2026}) mengembalikan:
summary:{count,good,bad,missing};
split:{trainCount,testCount,seed,trainRows,testRows};
regression:{mae,baselineMae,intercept,coefficients,rows:[{actual,predicted,duration}],
 normalization:{means,scales},baseline};
classification:{auc,scores:[{score,actual,age,amount,duration,sourceRow}],weights,
 features,normalization:{means,scales},iterations,trainLogLoss,baselineLogLoss,
 metrics,roc:[{threshold,TP,FP,TN,FN,accuracy,precision,recall,fpr}]};
clustering:{points:[{amount,duration,cluster}],centroids:[{cluster,amount,duration,
 count}],inertia,iterations,converged,history,normalization}; audit:auditAt(...,.5).
Coefficients regresi adalah object keyed nama fitur, pada unit asli.
Weights classifier berurutan intercept lalu empat CLASS_FEATURES terstandar.
Centroid cluster pada unit asli; inertia/history pada unit terstandar.
metricsAt(scores,threshold): {TP,FP,TN,FN,accuracy,precision,recall,fpr}.
Threshold memakai score>=threshold untuk predicted bad. Penyebut nol -> null,
bukan0, NaN atau jaminan performa. auc tanpa salah satu kelas -> null.
auditAt(scores,threshold): {groups,fprGap,zeroHandling,ageCutoff:25}.
Setiap group: label,count,good,bad,predictedBad,fprDenominator dan semua metrik.
Jangan hitung model ulang untuk setiap gerak slider: analyzeFinance sekali saat
load dataset, lalu metricsAt/auditAt dari classification.scores yang disimpan.
Tidak ada global cache mutable atau network di engine.

VERIFIKASI REPO
node scripts/test-aifn-finance.mjs
node scripts/validate-aifn.mjs
Suite menguji batas ambang, denominator nol, tie/invariansi AUC, split deterministik,
train-only scaling, target leakage, age audit-only, baseline, NaN/Infinity,
konvergensi inertia dan kesetaraan numerik JS/Python. Validator mengeksekusi semua
17 sel notebook lokal dengan timeout120detik, memeriksa source/license/hash,
kesetaraan CSV/JSON ke semua1000baris sumber, dan mempertahankan checks immutable
RPS, objective/topic16sesi, grading25/25/20/20/10 serta latihan publik.
Penggunaan hanya untuk pembelajaran, bukan nasihat investasi atau kredit nyata.
