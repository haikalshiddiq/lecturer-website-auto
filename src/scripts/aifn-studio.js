const course = JSON.parse(document.querySelector('#aifn-course-data').textContent);
const KEY = 'hicall-aifn-studio-v1';
const app = document.querySelector('#aifn-app');
const status = document.querySelector('#aifn-status');
const teaching = new URLSearchParams(location.search).get('mode') === 'teach';
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let state = {course:'aifn',version:1,lessons:{}};
let storageMessage = '';
let diagramExpanded = false;
function validateState(value) {
  if (!value || value.course !== 'aifn' || value.version !== 1 || !value.lessons || typeof value.lessons !== 'object' || Array.isArray(value.lessons)) throw new Error('Berkas harus untuk course aifn dengan version 1 dan objek lessons. Data lama tidak diubah.');
  const clean = {course:'aifn',version:1,lessons:{}};
  for (const [id, entry] of Object.entries(value.lessons)) {
    const lesson = course.lessons[Number(id)-1];
    if (!/^(?:[1-9]|1[0-6])$/.test(id) || !lesson || !entry || typeof entry !== 'object') throw new Error('Id pertemuan tidak valid.');
    if (typeof entry.notes !== 'string' || entry.notes.length > 30000 || typeof entry.done !== 'boolean') throw new Error('Catatan atau status progres tidak valid.');
    const c = lesson.control;
    if (entry.setting !== undefined && (c.options ? !c.options.some(([v])=>v===entry.setting) : !Number.isFinite(Number(entry.setting)) || Number(entry.setting)<c.min || Number(entry.setting)>c.max)) throw new Error('Nilai simulator tidak valid.');
    if (entry.quiz !== undefined && (!Number.isInteger(entry.quiz) || entry.quiz<0 || entry.quiz>=lesson.quiz.options.length)) throw new Error('Jawaban kuis tidak valid.');
    clean.lessons[id] = {notes:entry.notes,done:entry.done,...(entry.setting===undefined?{}:{setting:entry.setting}),...(entry.quiz===undefined?{}:{quiz:entry.quiz})};
  }
  return clean;
}
try { const raw=localStorage.getItem(KEY); if(raw) state=validateState(JSON.parse(raw)); } catch(error) { storageMessage=`Progres belum dimuat: ${error.message} Anda masih dapat belajar dan mengekspor sesi ini.`; }
let current=1;
let activeTab=teaching?'teach':'concept';
function record() { return state.lessons[current] ||= {notes:'',done:false}; }
function save() { try {localStorage.setItem(KEY,JSON.stringify(state)); status.textContent='Tersimpan lokal untuk AiFn.';} catch {status.textContent='Penyimpanan browser tidak tersedia. Ekspor progres sebelum menutup halaman.';} }
function scores(threshold) {
  const s=[.1,.2,.35,.45,.55,.65,.8,.9], y=[0,0,1,0,1,0,1,1];
  let TP=0,FP=0,TN=0,FN=0;
  s.forEach((p,i)=>{if(p>=threshold){y[i]?TP++:FP++;}else{y[i]?FN++:TN++;}});
  const positives=s.filter((_,i)=>y[i]), negatives=s.filter((_,i)=>!y[i]);
  const auc=positives.reduce((sum,p)=>sum+negatives.reduce((n,q)=>n+(p>q?1:p===q?.5:0),0),0)/(positives.length*negatives.length);
  return {TP,FP,TN,FN,auc,precision:TP+FP?TP/(TP+FP):null,recall:TP/4,fpr:FP/4,accuracy:(TP+TN)/8};
}
const fmt = value => value === null ? 'tidak terdefinisi (tanpa prediksi positif)' : Number(value).toFixed(3);
const text = (x,y,label,extra='')=>`<text x="${x}" y="${y}" ${extra}>${esc(label)}</text>`;
const line = (x1,y1,x2,y2,extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="2" ${extra}/>`;
function bars(labels, values, max=1) {
  return labels.map((label,i)=>{const y=30+i*45;return text(10,y+15,label)+`<rect class="af-mark" x="160" y="${y}" width="${Math.max(0,values[i]/max*215)}" height="22"/>`+text(385,y+16,fmt(values[i]));}).join('');
}
function svg(title,desc,body) { return `<svg data-course-visual="${current}" viewBox="0 0 480 240" role="img" aria-labelledby="af-vtitle af-vdesc"><title id="af-vtitle">${esc(title)}</title><desc id="af-vdesc">${esc(desc)}</desc>${body}</svg>`; }
function visual(lesson,value) {
  let title=lesson.title, body='', equivalent='', reasoning='', expected='safe';
  const n=Number(value);
  switch(lesson.kind) {
    case 'workflow': {
      const safe=value==='before'; expected=safe?'safe':'revise';
      body=line(40,110,435,110)+[40,230,430].map((x,i)=>`<circle cx="${x}" cy="110" r="7" class="af-mark"/>`+text(x===430?330:x-20,85,['Pengajuan','Prediksi','Label 90 hari'][i])).join('')+text(30,155,safe?'Fitur historis tersedia':'Fitur masa depan bocor')+line(safe?40:430,175,230,175,safe?'':'stroke-dasharray="5 4"');
      equivalent=safe?'Fitur sebelum pengajuan → prediksi hari ini → label 90 hari kemudian.':'Label masa depan mengalir mundur ke prediksi: kebocoran informasi.';
      reasoning=safe?'Rancangan waktu layak untuk latihan karena fitur sudah diketahui saat pengajuan. Validasi kualitas data masih diperlukan.':'Revisi rancangan: status default masa depan hanya boleh menjadi label historis, bukan fitur ketika pengajuan baru.'; break;
    }
    case 'data': {
      expected=value==='valid'?'safe':'revise';
      const rows=value==='valid'?['id | income | debt_ratio','S01 | 2.0 | 0.10','S02 | 3.0 | 0.20','Tipe numerik tervalidasi']:value==='empty'?['id | income | debt_ratio','Belum ada baris data','Tidak ada rata-rata yang dihitung']:['id | income | debt_ratio','S01 | tidak tahu | 0.10','Error baris 2: income harus numerik'];
      body=rows.map((s,i)=>text(20,40+i*45,s)).join(''); equivalent=rows.join('. ');
      reasoning=value==='valid'?'Data contoh lolos kontrak tipe. Ini bukan bukti representatif; lanjutkan pemeriksaan rentang, duplikasi, dan satuan.':value==='empty'?'Keadaan kosong: hanya header, tidak ada observasi. Tambahkan baris valid sebelum menghitung statistik; nol baris bukan mean nol.':'Keadaan error: konversi income gagal di baris 2. Perbaiki atau laporkan baris, jangan diam-diam mengganti dengan nol.'; break;
    }
    case 'split': {
      expected=value==='train'?'safe':'revise';
      body=text(15,30,'Train: 2, 4, 6, hilang')+text(275,30,'Test: 20, 22')+line(250,10,250,220,'stroke-dasharray="4 4"')+bars(['Isi nilai hilang'],[value==='train'?4:6],8)+text(15,150,value==='train'?'Fit median train = 4':'Median gabungan = 6 (bocor)');
      equivalent=`Median train 4; median seluruh data 6. Nilai hilang diisi ${value==='train'?4:6}. Test harus tidak memengaruhi fit.`;
      reasoning=value==='train'?'Prosedur tepat: transformasi dipelajari hanya dari train dan dipakai tanpa fit ulang pada test.':'Revisi: median gabungan telah belajar distribusi test. Split harus mendahului fit praproses.'; break;
    }
    case 'target': {
      const amount=value==='amount'; expected='safe';
      body=amount?bars(['Baris 1','Baris 2','Baris 3','Baris 4'],[4,6,8,10],10):[0,0,0,1].map((v,i)=>`<rect x="${30+i*110}" y="75" width="85" height="70" class="${v?'af-mark':'af-alt'}"/>`+text(63+i*110,115,v)).join('');
      equivalent=amount?'Target besaran [4,6,8,10] juta: regresi; baseline mean 7 juta.':'Target default [0,0,0,1]: klasifikasi; baseline mayoritas 0 dengan accuracy 0.75, recall 0.';
      reasoning=amount?'Regresi cocok untuk besaran numerik. Nilai baseline dan error harus menggunakan satuan juta rupiah.':'Klasifikasi cocok untuk label default. Baseline accuracy tinggi dapat melewatkan seluruh kasus default.'; break;
    }
    case 'regression': {
      const x=[1,2,3,4],y=[2,3,5,4],pred=x.map(v=>1+n*v),res=y.map((v,i)=>v-pred[i]);
      body=line(40,205,440,205)+line(40,205,40,20)+line(40,205-(1+n)*13,400,205-(1+4*n)*13,'class="af-mark"')+x.map((v,i)=>line(40+i*120,205-y[i]*13,40+i*120,205-pred[i]*13,'stroke-dasharray="4 3"')+`<circle cx="${40+i*120}" cy="${205-y[i]*13}" r="5" class="af-mark"/>`).join('')+text(40,232,'Pendapatan 1, 2, 3, 4 juta')+text(50,25,'Pengeluaran dan residual');
      const mae=res.reduce((a,v)=>a+Math.abs(v),0)/4; expected=mae<=.5?'safe':'revise';
      equivalent=`Slope ${n}, intercept 1. Prediksi: ${pred.join(', ')}; residual: ${res.join(', ')}; MAE ${fmt(mae)} juta.`;
      reasoning=mae<=.5?'MAE rendah pada empat titik demo. Jangan menganggap hasil train ini membuktikan generalisasi; bandingkan baseline pada holdout.':'Slope ini memberi MAE lebih dari 0.5 pada contoh. Periksa besar tiap residual, bukan hanya apakah satu titik pas.'; break;
    }
    case 'classification': case 'evaluation': {
      const m=scores(n); expected='safe';
      if(lesson.kind==='classification') {
        body=[.1,.2,.35,.45,.55,.65,.8,.9].map((s,i)=>`<circle cx="${35+s*410}" cy="${65+(i%2)*45}" r="9" class="${[0,0,1,0,1,0,1,1][i]?'af-mark':'af-alt'}"/>`).join('')+line(35+n*410,25,35+n*410,155,'stroke-dasharray="5 4"')+text(20,195,'Penuh = default; kosong = non-default')+text(20,220,'Di kanan ambang = ditandai untuk review');
      } else {
        body=text(10,20,'Aktual / Prediksi risiko')+[['TP',m.TP,130,45],['FP',m.FP,15,45],['FN',m.FN,130,110],['TN',m.TN,15,110]].map(([k,v,x,y])=>`<rect x="${x}" y="${y}" width="100" height="55" class="af-alt"/>`+text(Number(x)+12,Number(y)+33,`${k}: ${v}`)).join('');
        const thresholds=[1.01,.9,.8,.65,.55,.45,.35,.2,.1]; const points=thresholds.map(t=>scores(t)).map(p=>`${285+p.fpr*155},${190-p.recall*155}`).join(' ');
        body+=line(285,190,445,190)+line(285,190,285,30)+line(285,190,440,35,'stroke-dasharray="3 3"')+`<polyline points="${points}" fill="none" stroke="var(--af-accent)" stroke-width="3"/><circle cx="${285+m.fpr*155}" cy="${190-m.recall*155}" r="6" class="af-mark"/>`+text(290,220,'FPR →; vertikal = TPR');
      }
      equivalent=`Ambang ${n}: TP=${m.TP}, FP=${m.FP}, TN=${m.TN}, FN=${m.FN}. Accuracy ${fmt(m.accuracy)}, precision ${fmt(m.precision)}, recall ${fmt(m.recall)}, FPR ${fmt(m.fpr)}. AUC ranking tetap ${m.auc}.`;
      reasoning='Perhitungan konsisten dengan delapan skor yang sama. Ambang mengubah matriks dan titik operasi, bukan ranking atau AUC. Pilihan kebijakan memerlukan biaya serta audit dampak.'; break;
    }
    case 'credit': {
      const costs=[.3,.5,.7].map(t=>{const m=scores(t);return m.FN*n+m.FP;}); const best=Math.min(...costs); expected='safe';
      body=bars(['Ambang 0.3','Ambang 0.5','Ambang 0.7'],costs,22)+text(15,210,'Biaya ilustratif = FN × biaya + FP × 1');
      equivalent=`Biaya FN ${n}, FP 1: ambang 0.3 = ${costs[0]}, 0.5 = ${costs[1]}, 0.7 = ${costs[2]} unit. Minimum kandidat ${best}; ties mungkin.`;
      reasoning='Analisis sensitivitas sah untuk asumsi demo. Biaya terendah bukan keputusan kredit nyata atau bukti fairness; review manusia dan validasi terpisah tetap dibutuhkan.'; break;
    }
    case 'exam': case 'synthesis': {
      const safe=value==='honest'||value==='audit'; expected=safe?'safe':'revise';
      const labels=lesson.kind==='exam'?['Target','Split waktu','Fitur sah','Evaluasi']:['Konsep','Data & model','Evaluasi','Etika & bukti'];
      body=labels.map((s,i)=>`<rect x="${12+i*118}" y="75" width="105" height="70" class="${safe?'af-alt':'af-mark'}"/>`+text(18+i*118,103,s)+text(20+i*118,128,safe?'terhubung':i===2?'skor saja':'belum sah')).join('');
      equivalent=safe?'Empat tahap audit terhubung dengan bukti dan asumsi eksplisit.':'Skor saja atau fitur masa depan memutus hubungan klaim dan bukti.';
      reasoning=safe?'Rancangan mencakup bukti yang diperlukan untuk latihan. Pelaksanaan dan artefaknya tetap harus diperiksa.':'Revisi: angka tinggi tidak menutup leakage atau ketiadaan audit. Tunjukkan data, waktu fitur, denominator, dan batasan.'; break;
    }
    case 'sentiment': {
      expected=value==='positive'?'safe':'revise';
      const titles={positive:'Laba naik dan biaya turun',negative:'Laba turun meski pendapatan naik',ambiguous:'Target laba naik, hasil aktual belum tersedia'};
      const score=value==='ambiguous'?1:0; const ref={positive:'positif',negative:'negatif',ambiguous:'perlu konteks'};
      body=text(15,35,'Baseline kamus: naik +1, turun −1')+bars(['Skor kamus'],[score+1],2)+text(15,135,`Skor sebenarnya: ${score}`)+text(15,175,`Rujukan pedagogis: ${ref[value]}`)+text(15,210,'Jumlah kata ≠ pemahaman konteks');
      equivalent=`Judul: ${titles[value]}. Kamus naik/turun: ${score}; rujukan: ${ref[value]}. Kamus tidak memahami laba versus biaya atau target versus hasil.`;
      reasoning='Audit label perlu konteks. Bahkan judul positif bernilai kamus nol karena biaya turun. Cocokkan bukti teks, negasi, dan ketidakpastian; jangan memprediksi harga aset dari label.'; expected='revise'; break;
    }
    case 'explain': {
      const debt=2*n,income=-.4,z=-1+debt+income,p=1/(1+Math.exp(-z)); expected='safe';
      body=text(15,25,'Kontribusi logit (bukan efek kausal)')+line(200,40,200,210)+[[-1,'Baseline'],[debt,'Utang'],[income,'Pendapatan']].map(([v,l],i)=>{const width=Math.abs(v)*85;return text(10,70+i*55,l)+`<rect x="${v<0?200-width:200}" y="${50+i*55}" width="${width}" height="28" class="af-mark"/>`+text(390,70+i*55,fmt(v));}).join('');
      equivalent=`Baseline -1; utang +${fmt(debt)}; pendapatan -0.400; z=${fmt(z)}, sigmoid=${fmt(p)}. Income tetap 8 juta.`;
      reasoning='Uraian benar untuk fungsi model sintetis ini. Kontribusi menjelaskan perubahan logit saat fitur lain tetap, bukan sebab-akibat atau saran mengubah keuangan seseorang.'; break;
    }
    case 'fairness': {
      const fpB=Math.max(0,3-n),fpA=Math.max(0,1-Math.max(0,n-3));expected=n>=2?'safe':'revise';
      body=bars(['FPR A','FPR B'],[fpA/4,fpB/4],1)+text(15,165,`Review dipakai ${Math.min(n,4)} dari kapasitas ${n}`)+text(15,205,'Oracle sempurna: asumsi demo, bukan realitas');
      equivalent=`FP A=${fpA}/4, FP B=${fpB}/4. FPR A ${fmt(fpA/4)}, B ${fmt(fpB/4)}; selisih absolut ${fmt(Math.abs(fpA-fpB)/4)}. Prioritas koreksi B lalu A.`;
      reasoning='Kapasitas mengubah dampak hanya karena review diasumsikan sempurna. Pada kapasitas 2, satu metrik setara; pada 3, ketimpangan dapat berbalik. Jangan menyamakan angka ini dengan fairness menyeluruh.'; expected='revise'; break;
    }
    case 'cluster': {
      const points=[[2,.1],[3,.2],[4,.8],[8,.2],[9,.8],[10,.9]], centers=[[2,.1],[10,.9]];
      const assign=points.map(p=>{const d=centers.map(c=>Math.hypot((p[0]-c[0])/(value==='scaled'?8:1),(p[1]-c[1])/(value==='scaled'?.8:1)));return d[0]<=d[1]?0:1;}); expected='safe';
      body=line(35,200,445,200)+line(35,200,35,20)+points.map((p,i)=>{const x=35+p[0]*39,y=200-p[1]*170;return assign[i]===0?`<circle cx="${x}" cy="${y}" r="7" class="af-mark"/>`:`<rect x="${x-7}" y="${y-7}" width="14" height="14" class="af-alt"/>`;}).join('')+text(45,230,'Income →; vertikal debt_ratio; bentuk = cluster');
      equivalent=`Assignment satu langkah ${value==='scaled'?'dengan skala rentang':'tanpa skala'}: ${points.map((p,i)=>`(${p.join(',')})→${assign[i]}`).join('; ')}. Centroid awal tetap, belum iterasi.`;
      reasoning='Perbandingan menunjukkan bobot jarak berubah oleh skala. Hasil ini baru assignment satu langkah, belum k-means konvergen. Cluster bukan label default atau urutan kelayakan.'; break;
    }
    case 'refine': {
      expected=value==='validation'?'safe':'revise';
      body=bars(['A validation','B validation','C validation'],[1,.8,.9],1.2)+text(15,195,value==='validation'?'Pilih B → test B = 1.1':'Pilih C dari test 0.7 → bias seleksi');
      equivalent='Validation MAE A=1.0, B=0.8, C=0.9. Test A=0.9, B=1.1, C=0.7. '+(value==='validation'?'Pilihan B berdasarkan validation, test 1.1 dilaporkan.':'Pilihan C memakai test, sehingga test tidak lagi independen.');
      reasoning=value==='validation'?'Prosedur pemilihan benar: pilih pada validation, laporkan test sekali beserta ketidakpastian.':'Revisi: test telah menjadi bagian pencarian kandidat. Laporkan riwayat seleksi dan gunakan holdout baru untuk evaluasi independen.'; break;
    }
    case 'trace': {
      expected=value==='complete'?'safe':'revise';
      const labels=['CSV','Notebook','Metrik','Klaim'];
      body=labels.map((l,i)=>`<rect x="${15+i*118}" y="80" width="95" height="55" class="af-alt"/>`+text(25+i*118,113,l)+(i<3?line(110+i*118,105,130+i*118,105,value==='missing'?'stroke-dasharray="3 4"':''):'')).join('')+text(15,185,value==='complete'?'Tautan bukti dapat diperiksa ulang':'Klaim skor saja: asal dan denominator hilang');
      equivalent=value==='complete'?'CSV → notebook → metrik dengan denominator → klaim dan batasan.':'Klaim skor tidak memiliki CSV, kode, atau denominator yang bisa diaudit.';
      reasoning=value==='complete'?'Paket bukti mendukung audit ulang; pastikan isi artefaknya benar-benar berjalan dan klaim tidak melampaui sampel.':'Revisi: presentasi memerlukan jejak baris data dan kode, bukan hanya angka hasil di slide.'; break;
    }
  }
  return {html:svg(title,equivalent,body),equivalent,reasoning,expected};
}
function setTab(name,focus=false) {
  activeTab=name;
  document.querySelectorAll('[data-af-tab]').forEach(el=>{const on=el.dataset.afTab===name;el.setAttribute('aria-selected',String(on));el.tabIndex=on?0:-1;});
  document.querySelectorAll('[data-af-pane]').forEach(el=>el.hidden=el.dataset.afPane!==name);
  if(focus)document.querySelector(`[data-af-tab="${name}"]`).focus();
}
function render() {
  const hash=Number(location.hash.slice(1)); current=Number.isInteger(hash)&&hash>=1&&hash<=16?hash:1;
  const l=course.lessons[current-1], r=record(), c=l.control;
  const setting=r.setting??(c.options?c.options[0][0]:c.value);
  const tabs=[['concept','Konsep & simulasi'],['practice','Praktik & notebook'],['quiz','Kuis & refleksi'],['teach','Fasilitasi publik']];
  app.innerHTML=`<div class="af-shell"><aside class="af-rail" aria-label="Navigasi pertemuan"><label for="af-session">Pertemuan</label><select id="af-session">${course.lessons.map(x=>`<option value="${x.id}" ${x.id===current?'selected':''}>${x.id}. ${esc(x.title)}</option>`).join('')}</select><ol>${course.lessons.map(x=>`<li><a href="#${x.id}" ${x.id===current?'aria-current="page"':''}>${String(x.id).padStart(2,'0')} ${esc(x.title)}</a></li>`).join('')}</ol><p class="af-muted" id="af-progress">${Object.values(state.lessons).filter(x=>x.done).length}/16 ditandai selesai</p></aside><main id="aifn-main" class="af-main" tabindex="-1"><p class="af-kicker">Pertemuan ${current}/16 · ${l.cpmk.map(n=>`CPMK${n}`).join(', ')}${teaching?' · Mode pengajar publik':''}</p><h1>${esc(l.title)}</h1><p class="af-muted">${esc(l.objective)}</p><div class="af-tabs" role="tablist" aria-label="Bagian pertemuan">${tabs.map(([id,label])=>`<button type="button" role="tab" id="af-tab-${id}" aria-controls="af-pane-${id}" data-af-tab="${id}">${label}</button>`).join('')}</div><section role="tabpanel" id="af-pane-concept" aria-labelledby="af-tab-concept" data-af-pane="concept"><div class="af-grid"><article class="af-panel"><h2>Gagasan inti</h2>${l.concept.map(p=>`<p>${esc(p)}</p>`).join('')}<details><summary>Contoh dikerjakan & asumsi dataset</summary><h3>Asumsi, bukan data nyata</h3><p>${esc(l.assumptions)}</p><h3>Langkah penalaran</h3><p>${esc(l.worked)}</p></details><details><summary>Miskonsepsi yang perlu dibongkar</summary><p>${esc(l.misconception)}</p></details></article><section class="af-panel af-sim" aria-labelledby="af-sim-title"><h2 id="af-sim-title">Uji asumsi, baca dampaknya</h2><label for="af-setting">${esc(c.label)}</label>${c.options?`<select id="af-setting">${c.options.map(([v,label])=>`<option value="${v}" ${String(setting)===v?'selected':''}>${esc(label)}</option>`).join('')}</select>`:`<input id="af-setting" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${setting}"/><output id="af-setting-value" for="af-setting">${setting}</output>`}<div id="af-viz" class="af-visual" aria-live="polite"></div><div class="af-question"><label for="af-prediction">Prediksi Anda tentang rancangan saat ini</label><select id="af-prediction"><option value="safe">Layak untuk tujuan demo, dengan batasan</option><option value="revise">Perlu revisi / bukti belum cukup</option></select><button type="button" id="af-reason">Periksa alasan</button><p id="af-reason-result" class="af-result" role="status"></p></div></section></div></section><section role="tabpanel" id="af-pane-practice" aria-labelledby="af-tab-practice" data-af-pane="practice"><div class="af-panel"><h2>Artefak praktik</h2><p>${esc(l.practice)}</p><h3>Asumsi dataset</h3><p>${esc(l.assumptions)}</p><h3>Contoh dikerjakan</h3><p>${esc(l.worked)}</p><div class="af-actions"><a class="af-link" download href="/aifn/aifn-labs.ipynb">Notebook .ipynb</a><a class="af-link" download href="/aifn/aifn-synthetic.csv">CSV sintetis</a><a class="af-link" download href="/aifn/README.txt">Petunjuk .txt</a></div><details><summary>Jupyter / Colab: buka manual, jalankan ulang</summary><p>Jupyter lokal: letakkan CSV dan notebook dalam folder yang sama, buka notebook dengan Python 3, Restart Kernel lalu Run All. Sel hanya memakai pustaka standar. Lab diberi nomor sesi; tidak perlu jaringan atau kunci.</p><p>Colab: buka layanan secara manual, pilih File → Upload notebook. Unggah CSV melalui panel Files sebelum Run All. Membuka Colab memerlukan internet; jalur Jupyter lokal tetap offline. Unduh ulang hasil bila ingin menyimpannya.</p></details>${l.prompt?`<h3>Prompt Claude, penggunaan manual opsional</h3><p>Tidak ada API, kunci, atau panggilan jaringan dari studio. Salin teks sintetis ini; jangan unggah data privat.</p><pre id="af-prompt" class="af-prompt">${esc(l.prompt)}</pre><button type="button" id="af-copy">Salin prompt Claude</button><p id="af-copy-status" role="status"></p>`:''}</div></section><section role="tabpanel" id="af-pane-quiz" aria-labelledby="af-tab-quiz" data-af-pane="quiz"><div class="af-panel"><h2>Kuis beralasan</h2><form id="af-quiz"><fieldset><legend>${esc(l.quiz.question)}</legend>${l.quiz.options.map((option,i)=>`<label style="display:flex;align-items:center;gap:.6rem;min-height:44px"><input type="radio" name="answer" value="${i}" ${r.quiz===i?'checked':''} required/>${esc(option)}</label>`).join('')}</fieldset><button type="submit">Periksa jawaban kuis</button></form><p id="af-quiz-result" class="af-result" role="status">${r.quiz===undefined?'Belum ada jawaban. Pilih satu dan periksa alasannya.':esc(l.quiz.explanations[r.quiz])}</p><label for="af-notes"><h3>Catatan: klaim, bukti, dan batasan</h3></label><textarea id="af-notes" maxlength="30000" placeholder="Belum ada catatan. Apa yang berubah ketika asumsi simulator diubah?">${esc(r.notes)}</textarea><label style="display:flex;align-items:center;gap:.6rem;min-height:44px"><input id="af-done" type="checkbox" ${r.done?'checked':''}/>Tandai pertemuan ini selesai (penilaian mandiri)</label><details><summary>Cadangkan / pindahkan progres AiFn</summary><p>Ekspor mencakup catatan pribadi di browser ini. Impor mengganti progres AiFn saja setelah validasi course dan version. Penyimpanan IASD tidak dibaca atau diubah.</p><div class="af-actions"><button id="af-export" type="button">Ekspor progres JSON</button><label for="af-import">Impor progres JSON</label><input id="af-import" type="file" accept="application/json,.json"/></div></details></div></section><section role="tabpanel" id="af-pane-teach" aria-labelledby="af-tab-teach" data-af-pane="teach"><div class="af-panel" data-aifn-teacher="${current}"><h2>Fasilitasi dan rubrik latihan publik</h2><p>Materi ini terbuka untuk semua, bukan akses rahasia. Durasi berikut adalah saran kegiatan studio, bukan perubahan bobot atau jam resmi RPS.</p><h3>Alur fasilitasi</h3><p>${esc(l.teacher.flow)}</p><h3>Pertanyaan diagnostik</h3><p>${esc(l.teacher.probe)}</p><h3>Rubrik artefak latihan (100 poin lokal)</h3><ul>${l.teacher.rubric.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><p>Gunakan 0–49% bobot kriteria bila bukti belum ada/keliru; 50–79% bila sebagian benar namun asumsi atau jejak belum lengkap; 80–100% bila benar, dapat ditelusuri, dan batasannya jelas. Poin rubrik bukan bobot nilai akhir mata kuliah.</p><details><summary>Kunci kuis dan tindak lanjut</summary><p>${esc(l.quiz.options[l.quiz.answer])}</p><p>${esc(l.quiz.explanations[l.quiz.answer])}</p><p>Untuk jawaban keliru, minta mahasiswa mengubah satu asumsi simulator dan menjelaskan perbedaannya sebelum mengulang kuis. Nilai alasan dan bukti, bukan hafalan posisi opsi.</p></details></div></section><p class="af-notice">Dataset sintetis, bukan nasihat atau keputusan keuangan nyata.${[8,16].includes(current)?' Ujian di sini adalah LATIHAN PUBLIK, bukan ujian resmi.':''} ${esc(current===8?'Bobot UTS akhir 25%.':current===16?'Bobot UAS akhir 25%.':'Kuis tidak mengirim nilai akademik.')}</p><nav class="af-footer" aria-label="Pindah pertemuan"><button type="button" id="af-prev" ${current===1?'disabled':''}>Pertemuan sebelumnya</button><button type="button" id="af-next" ${current===16?'disabled':''}>Pertemuan berikutnya</button></nav></main></div>`;
  app.setAttribute('aria-busy','false'); setTab(activeTab); updateVisual();
  document.querySelector('#aifn-mode').textContent=teaching?'Mode mahasiswa':'Pengajar publik';
  document.querySelector('#aifn-mode').href=teaching?`/aifn/studio#${current}`:`/aifn/studio?mode=teach#${current}`;
}
function updateVisual() {
  const l=course.lessons[current-1], value=document.querySelector('#af-setting').value, v=visual(l,value);
  document.querySelector('#af-viz').innerHTML=`<button type="button" id="af-zoom" aria-pressed="${diagramExpanded}">${diagramExpanded?'Ukuran ringkas':'Perbesar diagram'}</button><div class="af-diagram-surface ${diagramExpanded?'af-diagram-expanded':''}" tabindex="0" aria-label="Diagram. Saat diperbesar, geser mendatar untuk membaca seluruh label.">${v.html}</div><p class="af-equivalent" data-aifn-equivalent>${esc(v.equivalent)}</p>`;
  const out=document.querySelector('#af-setting-value');if(out)out.textContent=value;
  document.querySelector('#af-reason-result').textContent='Asumsi berubah? Periksa kembali alasan Anda.';
}
app.addEventListener('click',async event=>{
  const target=event.target.closest('button'); if(!target)return;
  if(target.dataset.afTab){setTab(target.dataset.afTab);return;}
  if(target.id==='af-zoom') {
    diagramExpanded=!diagramExpanded;
    document.querySelector('.af-diagram-surface').classList.toggle('af-diagram-expanded',diagramExpanded);
    target.setAttribute('aria-pressed',String(diagramExpanded));
    target.textContent=diagramExpanded?'Ukuran ringkas':'Perbesar diagram';
    return;
  }
  if(target.id==='af-reason') {
    const v=visual(course.lessons[current-1],document.querySelector('#af-setting').value);
    const correct=document.querySelector('#af-prediction').value===v.expected;
    document.querySelector('#af-reason-result').textContent=`${correct?'Alasan pilihan tepat.':'Tinjau pilihan Anda.'} ${v.reasoning}`;
  }
  if(target.id==='af-prev')location.hash=String(Math.max(1,current-1));
  if(target.id==='af-next')location.hash=String(Math.min(16,current+1));
  if(target.id==='af-export') {
    const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='aifn-progress-v1.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Progres AiFn diekspor. Simpan berkas ini secara pribadi.';
  }
  if(target.id==='af-copy') {
    try {await navigator.clipboard.writeText(course.lessons[current-1].prompt);document.querySelector('#af-copy-status').textContent='Prompt tersalin. Buka Claude manual jika tersedia.';}
    catch {document.querySelector('#af-copy-status').textContent='Clipboard tidak tersedia. Pilih teks prompt di atas lalu salin manual.';}
  }
});
app.addEventListener('keydown',event=>{
  const tab=event.target.closest('[data-af-tab]');if(!tab)return;
  const names=['concept','practice','quiz','teach'];let i=names.indexOf(tab.dataset.afTab);
  if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();i=event.key==='Home'?0:event.key==='End'?3:(i+(event.key==='ArrowRight'?1:3))%4;setTab(names[i],true);}
});
app.addEventListener('input',event=>{
  if(event.target.id==='af-setting'){record().setting=event.target.value;updateVisual();save();}
  if(event.target.id==='af-notes'){record().notes=event.target.value;save();}
});
app.addEventListener('change',async event=>{
  const el=event.target;
  if(el.id==='af-session')location.hash=el.value;
  if(el.id==='af-setting'){record().setting=el.value;updateVisual();save();}
  if(el.id==='af-prediction')document.querySelector('#af-reason-result').textContent='Pilihan berubah. Periksa kembali alasan Anda.';
  if(el.id==='af-done'){record().done=el.checked;save();document.querySelector('#af-progress').textContent=`${Object.values(state.lessons).filter(x=>x.done).length}/16 ditandai selesai`;}
  if(el.id==='af-import') {
    const file=el.files?.[0];if(!file)return;
    status.textContent='Memuat dan memvalidasi progres…';
    try{if(file.size>600000)throw new Error('Berkas melebihi 600 KB.');const imported=validateState(JSON.parse(await file.text()));state=imported;save();render();status.textContent='Progres AiFn diimpor dan divalidasi. Penyimpanan course lain tidak berubah.';}catch(error){status.textContent=`Impor ditolak: ${error.message}`;}
  }
});
app.addEventListener('submit',event=>{
  if(event.target.id!=='af-quiz')return;event.preventDefault();const answer=new FormData(event.target).get('answer');if(answer===null)return;record().quiz=Number(answer);save();document.querySelector('#af-quiz-result').textContent=course.lessons[current-1].quiz.explanations[Number(answer)];
});
document.querySelector('#aifn-theme').addEventListener('click',()=>{const dark=!document.documentElement.classList.contains('dark');document.documentElement.classList.toggle('dark',dark);document.documentElement.dataset.theme=dark?'dark':'light';try{localStorage.setItem('theme',dark?'dark':'light');}catch{status.textContent='Tema berubah untuk sesi ini saja.';}});
window.addEventListener('hashchange',()=>{render();document.querySelector('#aifn-main').focus({preventScroll:true});});
render(); if(storageMessage)status.textContent=storageMessage;
async function warmOffline() {
  if(!('serviceWorker' in navigator))return;
  try {
    await navigator.serviceWorker.register('/sw.js',{scope:'/'});await navigator.serviceWorker.ready;
    if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));
    const urls=new Set(['/aifn','/aifn/studio','/aifn/studio?mode=teach','/aifn/aifn-labs.ipynb','/aifn/aifn-synthetic.csv','/aifn/README.txt']);
    document.querySelectorAll('link[rel="stylesheet"],script[src]').forEach(el=>urls.add(el.href||el.src));
    await Promise.all([...urls].map(async url=>{const response=await fetch(url);if(!response.ok)throw new Error(`${url}: ${response.status}`);if(response.headers.get('vary')?.toLowerCase()==='origin'){const headers=new Headers(response.headers);headers.delete('vary');const cache=await caches.open('hicall-aifn-public-v1');await cache.put(url,new Response(await response.arrayBuffer(),{status:200,headers}));}}));
    document.documentElement.dataset.aifnOffline='ready';
  } catch(error) { document.documentElement.dataset.aifnOffline='error';console.warn('AiFn offline belum siap:',error.message); }
}
warmOffline();
