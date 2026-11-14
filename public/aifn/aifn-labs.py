"""AiFn: 16 lab keuangan, Python 3 standard library, tanpa jaringan/API.
Simpan aifn-finance.csv di folder kerja. Jalankan sel berurutan atau python aifn-labs.py.
"""
import csv
import hashlib
import json
import math
from pathlib import Path
from statistics import mean, median
from typing import TypedDict

class Metrics(TypedDict):
    TP: int
    FP: int
    TN: int
    FN: int
    accuracy: float | None
    precision: float | None
    recall: float | None
    fpr: float | None

class ClusterResult(TypedDict):
    assignment: list[int]
    centers: list[list[float]]
    iterations: int
    converged: bool
    inertia: float
    history: list[float]
    normalization: tuple[list[float], list[float]]

DATA = Path('aifn-finance.csv')
if not DATA.is_file():
    raise FileNotFoundError('Unggah aifn-finance.csv ke folder kerja notebook, lalu Run All.')
FIELDS = ['sourceRow', 'duration', 'amount', 'installmentRate', 'existingCredits', 'age', 'risk']
with DATA.open(newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    assert reader.fieldnames == FIELDS, 'Header tidak sesuai; jangan ganti data tanpa audit.'
    rows = [{k: int(v) for k, v in r.items()} for r in reader]
assert len(rows) == 1000 and sum(r['risk'] for r in rows) == 300
assert len({r['sourceRow'] for r in rows}) == len(rows)
assert all(r['risk'] in (0, 1) and all(r[k] > 0 for k in FIELDS if k != 'risk') for r in rows)
FEATURES = ['duration', 'log1p(amount)', 'installmentRate', 'existingCredits']
REG_FEATURES = ['duration', 'installmentRate', 'existingCredits']

def split_records(items, seed=2026):
    state = seed & 0xffffffff
    train, test = [], []
    for label in (0, 1):
        group = [r for r in items if r['risk'] == label]
        for i in range(len(group)-1, 0, -1):
            state = (1664525*state + 1013904223) & 0xffffffff
            j = int(state / 4294967296 * (i+1))
            group[i], group[j] = group[j], group[i]
        n = int(len(group)*.8)
        train.extend(group[:n])
        test.extend(group[n:])
    return train, test

def vector(r):
    return [r['duration'], math.log1p(r['amount']), r['installmentRate'], r['existingCredits']]

def scaler(vectors):
    means = [mean(v[j] for v in vectors) for j in range(len(vectors[0]))]
    scales = [math.sqrt(mean((v[j]-m)**2 for v in vectors)) or 1 for j, m in enumerate(means)]
    return means, scales

def normalize(v, norm):
    return [(a-m)/s for a, m, s in zip(v, *norm)]

def dot(a, b):
    return sum(x*y for x, y in zip(a, b))

def sigmoid(z):
    return 1/(1+math.exp(-max(-40, min(40, z))))

def fit_logistic(items, iterations=600):
    norm = scaler([vector(r) for r in items])
    x = [[1]+normalize(vector(r), norm) for r in items]
    bad = sum(r['risk'] for r in items)
    w = [math.log((bad+.5)/(len(items)-bad+.5)), 0., 0., 0., 0.]
    for _ in range(iterations):
        gradient = [0.]*5
        for v, r in zip(x, items):
            error = sigmoid(dot(w, v))-r['risk']
            for j in range(5):
                gradient[j] += error*v[j]
        w = [a-.15*(g/len(items)+(.01*a if j else 0)) for j, (a, g) in enumerate(zip(w, gradient))]
    return {'weights': w, 'normalization': norm}

def predict(model, r):
    return sigmoid(dot(model['weights'], [1]+normalize(vector(r), model['normalization'])))

def scores_for(model, items):
    return [dict(score=predict(model, r), actual=r['risk'], age=r['age'], amount=r['amount'], duration=r['duration']) for r in items]

def ratio(a, b):
    return a/b if b else None

def metrics_at(scores, threshold) -> Metrics:
    m = dict(TP=0, FP=0, TN=0, FN=0)
    for r in scores:
        key = ('TP' if r['actual'] else 'FP') if r['score'] >= threshold else ('FN' if r['actual'] else 'TN')
        m[key] += 1
    return {'TP': m['TP'], 'FP': m['FP'], 'TN': m['TN'], 'FN': m['FN'], 'accuracy': ratio(m['TP']+m['TN'], len(scores)), 'precision': ratio(m['TP'], m['TP']+m['FP']), 'recall': ratio(m['TP'], m['TP']+m['FN']), 'fpr': ratio(m['FP'], m['FP']+m['TN'])}

def auc(scores):
    positive = [r['score'] for r in scores if r['actual']]
    negative = [r['score'] for r in scores if not r['actual']]
    return ratio(sum(1 if p > n else .5 if p == n else 0 for p in positive for n in negative), len(positive)*len(negative))

def solve(matrix, target):
    a = [list(row)+[y] for row, y in zip(matrix, target)]
    n = len(target)
    for j in range(n):
        pivot = max(range(j, n), key=lambda i: abs(a[i][j]))
        a[j], a[pivot] = a[pivot], a[j]
        assert abs(a[j][j]) > 1e-14
        divisor = a[j][j]
        a[j] = [x/divisor for x in a[j]]
        for i in range(n):
            if i != j:
                factor = a[i][j]
                a[i] = [x-factor*y for x, y in zip(a[i], a[j])]
    return [row[n] for row in a]

def fit_regression(items):
    vectors = [[r[f] for f in REG_FEATURES] for r in items]
    norm = scaler(vectors)
    x = [[1]+normalize(v, norm) for v in vectors]
    gram = [[sum(v[j]*v[k] for v in x)+(1e-8 if j == k and j else 0) for k in range(4)] for j in range(4)]
    rhs = [sum(v[j]*r['amount'] for v, r in zip(x, items)) for j in range(4)]
    weights = solve(gram, rhs)
    coefficients = [w/s for w, s in zip(weights[1:], norm[1])]
    intercept = weights[0]-dot(coefficients, norm[0])
    return intercept, coefficients

def reg_predict(model, r):
    return model[0]+dot(model[1], [r[f] for f in REG_FEATURES])

def kmeans(items, k=3, seed=2026) -> ClusterResult:
    norm = scaler([[r['amount'], r['duration']] for r in items])
    x = [normalize([r['amount'], r['duration']], norm) for r in items]
    def distance(a, b):
        return sum((v-w)**2 for v, w in zip(a, b))
    state = (1664525*(seed & 0xffffffff)+1013904223) & 0xffffffff
    centers = [x[int(state/4294967296*len(x))][:]]
    while len(centers) < k:
        distances = [min(distance(v, c) for c in centers) for v in x]
        centers.append(x[distances.index(max(distances))][:])
    assignment, history = [], []
    converged = False
    iteration = 0
    for iteration in range(1, 101):
        new = [min(range(k), key=lambda j: distance(v, centers[j])) for v in x]
        if new == assignment:
            converged = True
            break
        assignment = new
        for j in range(k):
            members = [v for v, a in zip(x, assignment) if a == j]
            if members:
                centers[j] = [mean(v[d] for v in members) for d in range(2)]
        history.append(sum(distance(v, centers[a]) for v, a in zip(x, assignment)))
    return {'assignment': assignment, 'centers': centers, 'iterations': iteration, 'converged': converged, 'inertia': history[-1], 'history': history, 'normalization': norm}

print('Setup:', len(rows), 'baris UCI 144; CSV SHA256:', hashlib.sha256(DATA.read_bytes()).hexdigest())

# LAB 1
problem = dict(unit='baris historis kredit Jerman', target='label good/bad sumber, bukan default 90 hari', purpose='belajar review risiko, bukan keputusan kredit nyata')
counts = {label: sum(r['risk'] == label for r in rows) for label in (0, 1)}
assert counts == {0: 700, 1: 300}
print('Lab 1: target dan distribusi aktual:', problem, counts)

# LAB 2
first = rows[0]
# Excel AVERAGE menjadi mean(generator); nama kolom menggantikan alamat sel.
average_amount = mean(r['amount'] for r in rows)
assert first['sourceRow'] == 1 and first['duration'] == 6 and first['amount'] == 1169
print('Lab 2: satu dict seperti satu baris Excel:', first, 'AVERAGE(amount)=', average_amount)

# LAB 3
train, test = split_records(rows)
assert len(train) == 800 and len(test) == 200
assert not {r['sourceRow'] for r in train} & {r['sourceRow'] for r in test}
quantiles = [sorted(r['amount'] for r in rows)[int((len(rows)-1)*q)] for q in (.25, .5, .75)]
histogram = [sum(low <= r['amount'] < high for r in rows) for low, high in [(0, 2000), (2000, 5000), (5000, 10000), (10000, math.inf)]]
assert sum(histogram) == 1000
print('Lab 3: amount mean/median/quartiles', average_amount, median(r['amount'] for r in rows), quantiles, 'histogram', histogram, 'split', len(train), len(test))

# LAB 4
majority = int(mean(r['risk'] for r in train) >= .5)
baseline_accuracy = mean(r['risk'] == majority for r in test)
baseline_amount = mean(r['amount'] for r in train)
baseline_mae = mean(abs(r['amount']-baseline_amount) for r in test)
assert majority == 0 and baseline_accuracy == .7
print('Lab 4: klasifikasi mayoritas accuracy=', baseline_accuracy, 'regresi rata-rata train MAE=', baseline_mae)

# LAB 5
regression = fit_regression(train)
regression_rows = [dict(actual=r['amount'], predicted=reg_predict(regression, r), duration=r['duration']) for r in test]
mae = mean(abs(r['actual']-r['predicted']) for r in regression_rows)
assert 'amount' not in REG_FEATURES and mae < baseline_mae
print('Lab 5: actual amount, tanpa amount sebagai input; intercept/coef=', regression, 'holdout MAE=', mae, 'baseline=', baseline_mae, 'contoh', regression_rows[:3])

# LAB 6
model = fit_logistic(train)
scores = scores_for(model, test)
train_scores = scores_for(model, train)
loss = -mean(r['actual']*math.log(r['score'])+(1-r['actual'])*math.log(1-r['score']) for r in train_scores)
prevalence = mean(r['risk'] for r in train)
baseline_loss = -prevalence*math.log(prevalence)-(1-prevalence)*math.log(1-prevalence)
assert loss < baseline_loss and len(scores) == 200 and all(0 < r['score'] < 1 for r in scores)
assert 'age' not in FEATURES
print('Lab 6: logistic 600 update; train log loss=', loss, 'baseline=', baseline_loss, 'holdout', metrics_at(scores, .5))

# LAB 7
# Pilih ambang pada split INTERNAL train; test final tidak dipakai memilih kebijakan.
inner_train, validation = split_records(train, 77)
inner_model = fit_logistic(inner_train)
validation_scores = scores_for(inner_model, validation)
thresholds = [.2, .35, .5, .65, .8]
validation_costs = {t: 5*metrics_at(validation_scores, t)['FN']+metrics_at(validation_scores, t)['FP'] for t in thresholds}
chosen = min(thresholds, key=lambda t: (validation_costs[t], t))
assert len(inner_train)+len(validation) == len(train)
print('Lab 7: biaya hipotetis tanpa mata uang (FN=5, FP=1), validation=', validation_costs, 'ambang=', chosen, 'test terkunci', metrics_at(scores, chosen))

# LAB 8
# Latihan UTS publik: cek klaim dengan angka, bukan hafalan istilah.
assert math.isclose(baseline_accuracy, .7)
assert len({r['sourceRow'] for r in train+test}) == 1000
assert mae < baseline_mae and sum(metrics_at(scores, .5)[k] for k in ('TP', 'FP', 'TN', 'FN')) == 200
print('Lab 8: latihan UTS publik lulus: split tidak tumpang tindih, baseline 70%, MAE membaik; bukan ujian resmi.')

# LAB 9
# Teks dan label referensi SINTETIS, bukan berita, anotasi manusia, atau keluaran Claude.
texts = [dict(text='Laba naik tetapi biaya naik', reference='perlu konteks'), dict(text='Kerugian turun, kas naik', reference='positif'), dict(text='Target laba naik; hasil belum tersedia', reference='perlu konteks')]
lexicon = {'naik': 1, 'turun': -1}
lexicon_results = [sum(lexicon.get(w.strip(';,').lower(), 0) for w in r['text'].split()) for r in texts]
assert len(lexicon_results) == len(texts)
print('Lab 9: teks dan label referensi SINTETIS; skor kata=', lexicon_results)
print('Claude MANUAL opsional, tanpa API: minta positif/negatif/perlu konteks, kutip bukti, pisahkan target dari hasil. Isi kolom jawaban sendiri; tidak ada keluaran Claude yang disediakan.')

# LAB 10
roc = [dict(threshold=t, **metrics_at(scores, t)) for t in [1.000001]+sorted({r['score'] for r in scores}, reverse=True)]
area = auc(scores)
def roc_area(points):
    total = 0.
    for a, b in zip(points, points[1:]):
        ax, ay, bx, by = a['fpr'], a['recall'], b['fpr'], b['recall']
        assert ax is not None and ay is not None and bx is not None and by is not None
        total += (bx-ax)*(by+ay)/2
    return total
trapezoid = roc_area(roc)
assert area is not None
assert math.isclose(area, trapezoid, abs_tol=1e-12)
assert auc([dict(r, score=3*r['score']+2) for r in scores]) == area
print('Lab 10: ROC dari 200 skor model yang sama, AUC=', area, 'trapezoid=', trapezoid, 'threshold .5', metrics_at(scores, .5))

# LAB 11
example = test[0]
z_features = normalize(vector(example), model['normalization'])
contributions = {f: w*x for f, w, x in zip(FEATURES, model['weights'][1:], z_features)}
logit = model['weights'][0]+sum(contributions.values())
assert math.isclose(sigmoid(logit), predict(model, example))
print('Lab 11: kontribusi log-odds untuk sourceRow', example['sourceRow'], contributions, 'intercept', model['weights'][0], 'score', sigmoid(logit), 'bukan sebab-akibat atau PD terkalibrasi')

# LAB 12
audit = []
for name, predicate in [('age < 25', lambda r: r['age'] < 25), ('age >= 25', lambda r: r['age'] >= 25)]:
    members = [r for r in scores if predicate(r)]
    m = metrics_at(members, chosen)
    audit.append(dict(group=name, count=len(members), good=m['FP']+m['TN'], bad=m['TP']+m['FN'], **m))
assert sum(g['count'] for g in audit) == 200
assert metrics_at([], .5)['fpr'] is None
print('Lab 12: cutoff usia 25 adalah pilihan latihan, bukan standar hukum;', audit, 'FPR=None bila denominator good nol. Tanpa age pada fitur bukan jaminan adil.')

# LAB 13
clusters = kmeans(rows)
assert clusters['converged'] and 1 < clusters['iterations'] < 100
assert all(b <= a+1e-8 for a, b in zip(clusters['history'], clusters['history'][1:]))
segments = [dict(cluster=j, count=clusters['assignment'].count(j), amount=mean(r['amount'] for r, a in zip(rows, clusters['assignment']) if a == j), duration=mean(r['duration'] for r, a in zip(rows, clusters['assignment']) if a == j)) for j in range(3)]
assert sum(s['count'] for s in segments) == 1000
print('Lab 13: k-means amount/duration distandardisasi, iterasi=', clusters['iterations'], 'inertia=', clusters['inertia'], 'segmen=', segments, 'nomor cluster bukan kelas risiko')

# LAB 14
# Eksperimen seed di data TRAIN saja; test final tidak menjadi leaderboard tuning.
experiments = []
for seed in (17, 42):
    fit_rows, val_rows = split_records(train, seed)
    candidate = fit_logistic(fit_rows, iterations=300)
    experiments.append(dict(seed=seed, validationCount=len(val_rows), auc=auc(scores_for(candidate, val_rows))))
assert all(e['validationCount'] == 160 for e in experiments)
model_card = dict(source='https://doi.org/10.24432/C5NC77', csv_sha256=hashlib.sha256(DATA.read_bytes()).hexdigest(), features=FEATURES, seed=2026, train=800, test=200, threshold=chosen, threshold_selected_on='inner train validation', test_auc=area, test_mae=mae, limitations=['historical selected German sample', 'no dates or verified default horizon', 'no external validation or probability calibration', 'not an Indonesia lending model'])
print('Lab 14: eksperimen validation', experiments, 'model card', json.dumps(model_card, ensure_ascii=False))

# LAB 15
final_metrics = metrics_at(scores, chosen)
presentation = dict(question=problem['target'], evidence=dict(n=200, matrix={k: final_metrics[k] for k in ('TP', 'FP', 'TN', 'FN')}, auc=area, mae=mae), proposed_action='review manusia dalam simulasi', limitation=model_card['limitations'])
assert sum(presentation['evidence']['matrix'].values()) == presentation['evidence']['n']
print('Lab 15: bukti presentasi proyek credit-scoring=', json.dumps(presentation, ensure_ascii=False))

# LAB 16
assert sum(counts.values()) == 1000 and len(scores) == 200
assert set(FEATURES).isdisjoint({'risk', 'age', 'sourceRow'})
assert clusters['converged'] and model_card['threshold_selected_on'] == 'inner train validation'
assert math.isclose(area, .6536904761904762, abs_tol=1e-12)
assert math.isclose(mae, 1466.1160154055108, abs_tol=1e-7)
print('Lab 16: latihan UAS publik: model, audit, sumber, baseline dan batas penggunaan terverifikasi; bukan ujian resmi.')
print('CROSS_LANGUAGE', json.dumps(dict(auc=area, mae=mae, baselineMae=baseline_mae, weights=model['weights'], firstScore=scores[0]['score'], inertia=clusters['inertia'], clusterIterations=clusters['iterations'])))
print('ALL OFFLINE LAB ASSERTIONS PASSED')
