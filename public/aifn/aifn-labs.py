"""AiFn offline baseline labs. Synthetic data only; no financial advice.
Python 3 standard library. Run beside aifn-synthetic.csv.
"""
import csv
from typing import Any
import math
import hashlib
import json
from pathlib import Path
from statistics import mean, median

DATA = Path('aifn-synthetic.csv')
if not DATA.is_file():
    raise FileNotFoundError('Letakkan aifn-synthetic.csv bersama notebook / script, lalu jalankan ulang.')
rows = []
with DATA.open(newline='', encoding='utf-8') as stream:
    reader = csv.DictReader(stream)
    required = {'id', 'income', 'debt_ratio', 'default', 'group', 'month'}
    if set(reader.fieldnames or []) != required:
        raise ValueError('Header CSV tidak sesuai kontrak AiFn')
    for line_number, raw in enumerate(reader, 2):
        try:
            item: dict[str, Any] = dict(raw, income=float(raw['income']), debt_ratio=float(raw['debt_ratio']),
                        default=int(raw['default']), month=int(raw['month']))
            if not math.isfinite(item['income']) or not math.isfinite(item['debt_ratio']):
                raise ValueError('angka harus finite')
            if item['income'] <= 0 or not 0 <= item['debt_ratio'] <= 1 or item['default'] not in (0, 1):
                raise ValueError('rentang income/debt_ratio/default')
            if not 1 <= item['month'] <= 12 or item['group'] not in ('A', 'B'):
                raise ValueError('month/group tidak valid')
            rows.append(item)
        except (ValueError, TypeError) as error:
            raise ValueError(f'Baris {line_number} tidak valid: {error}') from error
if not rows:
    raise ValueError('Dataset kosong: tambahkan observasi valid, bukan mean nol.')
if len({r['id'] for r in rows}) != len(rows):
    raise ValueError('Id duplikat ditemukan')
print('SINTETIS, bukan nasabah nyata:', len(rows), 'baris; SHA256', hashlib.sha256(DATA.read_bytes()).hexdigest())

# LAB 1: define prediction time before observing the 90-day outcome.
problem = {'unit': 'pengajuan sintetis', 'prediction_time': 'hari pengajuan',
           'target': 'default 90 hari', 'features': ['income', 'debt_ratio'],
           'excluded': ['hasil_penagihan', 'default_masa_depan'], 'action': 'latihan review manusia'}
assert 'default' not in problem['features']
print('Lab 1:', problem)

# LAB 2: numeric conversion and a deliberate invalid-row diagnostic.
def parse_income(value):
    number = float(value)
    if not math.isfinite(number) or number <= 0:
        raise ValueError('income harus positif dan finite')
    return number
try:
    parse_income('tidak tahu')
except ValueError:
    print('Lab 2: baris rusak terdeteksi, tidak diganti nol.')
print('Mean income:', round(mean(r['income'] for r in rows), 3), 'juta/bulan')

# LAB 3: out-of-time split; preprocessing parameters fit on train only.
train = [r for r in rows if r['month'] <= 8]
validation = [r for r in rows if 9 <= r['month'] <= 10]
test = [r for r in rows if r['month'] >= 11]
assert train and validation and test
imputation_income = median(r['income'] for r in train)
print('Lab 3: split', list(map(len, (train, validation, test))), 'median train', imputation_income)
assert median([2, 4, 6]) == 4 and median([2, 4, 6, 20, 22]) == 6

# LAB 4: supervised target determines task, not feature type.
majority = int(mean(r['default'] for r in train) >= 0.5)
baseline_accuracy = mean(int(r['default'] == majority) for r in test)
print('Lab 4: majority class', majority, 'test accuracy', baseline_accuracy)

# LAB 5: fit ordinary least squares with no dependencies.
# Artificial expenditure is generated here, explicitly not an observed CSV outcome.
xs = [r['income'] for r in train]
ys = [1 + .4*r['income'] + (i % 3 - 1)*.2 for i, r in enumerate(train)]
xbar, ybar = mean(xs), mean(ys)
slope = sum((x-xbar)*(y-ybar) for x, y in zip(xs, ys))/sum((x-xbar)**2 for x in xs)
intercept = ybar - slope*xbar
residuals = [y-(intercept+slope*x) for x, y in zip(xs, ys)]
print('Lab 5: OLS', intercept, slope, 'train MAE', mean(map(abs, residuals)))
demo_residuals = [y-(1+x) for x, y in zip([1, 2, 3, 4], [2, 3, 5, 4])]
assert demo_residuals == [0, 0, 1, -1] and mean(map(abs, demo_residuals)) == .5

# LAB 6: a fitted nearest-class-centroid classifier, split-safe normalization.
features = ['income', 'debt_ratio']
means = {f: mean(r[f] for r in train) for f in features}
scales = {f: max(r[f] for r in train)-min(r[f] for r in train) or 1 for f in features}
def vector(row):
    return [(row[f]-means[f])/scales[f] for f in features]
centroids = {}
for label in (0, 1):
    members = [vector(r) for r in train if r['default'] == label]
    if not members:
        raise ValueError('Train memerlukan kedua kelas untuk centroid baseline')
    centroids[label] = [mean(v[j] for v in members) for j in range(len(features))]
def model_score(row):
    v = vector(row)
    distances = [math.dist(v, centroids[label]) for label in (0, 1)]
    return distances[0]/sum(distances) if sum(distances) else .5
# This distance-derived score is NOT a calibrated probability.
def matrix(labels, scores, threshold):
    result = dict(TP=0, FP=0, TN=0, FN=0)
    for actual, score in zip(labels, scores):
        predicted = int(score >= threshold)
        result[{(1, 1): 'TP', (0, 1): 'FP', (0, 0): 'TN', (1, 0): 'FN'}[(actual, predicted)]] += 1
    return result
val_y = [r['default'] for r in validation]
val_scores = [model_score(r) for r in validation]
print('Lab 6: validation scores', val_scores, matrix(val_y, val_scores, .5))

# LAB 7: threshold selection uses VALIDATION, not the final test.
fn_cost, fp_cost = 5, 1
candidates = [.3, .5, .7]
costs = {}
for threshold in candidates:
    m = matrix(val_y, val_scores, threshold)
    costs[threshold] = m['FN']*fn_cost + m['FP']*fp_cost
chosen = min(candidates, key=lambda t: (costs[t], t))
print('Lab 7: validation cost', costs, 'chosen', chosen, '(not a lending policy)')

# LAB 8: public UTS practice checks leakage and residual reasoning.
assert not set(problem['features']) & set(problem['excluded'])
assert all(r['month'] <= 8 for r in train) and all(r['month'] >= 11 for r in test)
print('Lab 8: public practice assertions passed; not official exam grading.')

# LAB 9: offline lexicon baseline, plus an optional MANUAL Claude prompt.
headlines = ['Laba naik dan biaya turun', 'Laba turun meski pendapatan naik',
             'Target laba naik, hasil aktual belum tersedia']
lexicon = {'naik': 1, 'turun': -1}
for headline in headlines:
    score = sum(lexicon.get(word.strip(',.').lower(), 0) for word in headline.split())
    print('Lab 9:', headline, 'lexicon=', score)
print('Claude manual: label positif/negatif/perlu konteks; kutip bukti; bedakan target dan hasil; jangan mengarang fakta.')

# LAB 10: all confusion matrices, ROC points and pairwise AUC share one array.
demo_scores = [.1, .2, .35, .45, .55, .65, .8, .9]
demo_labels = [0, 0, 1, 0, 1, 0, 1, 1]
def auc_pairwise(labels, scores):
    positive = [s for y, s in zip(labels, scores) if y == 1]
    negative = [s for y, s in zip(labels, scores) if y == 0]
    if not positive or not negative:
        return None  # undefined, never silently return zero
    return mean(1 if p > n else .5 if p == n else 0 for p in positive for n in negative)
def metrics(m):
    total = sum(m.values())
    return {'accuracy': (m['TP']+m['TN'])/total if total else None,
            'precision': m['TP']/(m['TP']+m['FP']) if m['TP']+m['FP'] else None,
            'recall': m['TP']/(m['TP']+m['FN']) if m['TP']+m['FN'] else None,
            'FPR': m['FP']/(m['FP']+m['TN']) if m['FP']+m['TN'] else None}
assert matrix(demo_labels, demo_scores, .5) == {'TP': 3, 'FP': 1, 'TN': 3, 'FN': 1}
assert auc_pairwise(demo_labels, demo_scores) == .8125
roc = [metrics(matrix(demo_labels, demo_scores, t)) for t in [1.01]+sorted(set(demo_scores), reverse=True)]
print('Lab 10: AUC', auc_pairwise(demo_labels, demo_scores), 'ROC (FPR,TPR)', [(p['FPR'], p['recall']) for p in roc])

# LAB 11: explain a local synthetic logit, without causal claims.
contributions = {'baseline': -1, 'debt_ratio': 2*.4, 'income': -.05*8}
z = sum(contributions.values())
print('Lab 11:', contributions, 'logit', z, 'sigmoid', 1/(1+math.exp(-z)))

# LAB 12: audit groups on the final test without using group as a feature.
test_y = [r['default'] for r in test]
test_scores = [model_score(r) for r in test]
final_matrix = matrix(test_y, test_scores, chosen)
for group in ('A', 'B'):
    group_rows = [r for r in test if r['group'] == group]
    m = matrix([r['default'] for r in group_rows], [model_score(r) for r in group_rows], chosen)
    print('Lab 12 group', group, 'N=', len(group_rows), 'metrics=', metrics(m), 'small sample: no fairness guarantee')

# LAB 13: actual two-cluster iterations with range scaling; no target used.
points = [[2, .1], [3, .2], [4, .8], [8, .2], [9, .8], [10, .9]]
scaled = [[(x-2)/8, (y-.1)/.8] for x, y in points]
centers = [scaled[0][:], scaled[-1][:]]
previous = None
assignment = []
iteration = 0
for iteration in range(20):
    assignment = [min(range(2), key=lambda k: math.dist(p, centers[k])) for p in scaled]
    if assignment == previous:
        break
    for k in range(2):
        members = [p for p, a in zip(scaled, assignment) if a == k]
        if members:
            centers[k] = [mean(p[j] for p in members) for j in range(2)]
    previous = assignment[:]
print('Lab 13: clusters', assignment, 'iterations', iteration+1, 'arbitrary labels, not risk classes')

# LAB 14: final evaluation is reported, not used to retune.
model_card = {'purpose': 'synthetic teaching baseline only', 'forbidden': 'real lending/investment advice',
              'data_sha256': hashlib.sha256(DATA.read_bytes()).hexdigest(),
              'split': {'train': '<=8', 'validation': '9-10', 'test': '11-12'},
              'method': 'nearest class centroid with train-only range scaling',
              'threshold_selected_on': 'validation', 'threshold': chosen,
              'validation_costs': costs, 'test_matrix': final_matrix,
              'test_metrics': metrics(final_matrix), 'test_auc': auc_pairwise(test_y, test_scores),
              'limitations': ['tiny synthetic sample', 'not calibrated', 'selection bias not modeled',
                              'no production fairness validation', 'reviewer accuracy not measured']}
print('Lab 14:', json.dumps(model_card, ensure_ascii=False, indent=2))

# LAB 15: claim-to-evidence traceability, including denominators.
trace = [{'claim': 'test precision', 'evidence': final_matrix, 'formula': 'TP/(TP+FP)',
          'limitation': 'undefined if no predicted positives; small synthetic sample'}]
print('Lab 15:', trace)

# LAB 16: public UAS practice, all artifacts can be reproduced offline.
assert sum(final_matrix.values()) == len(test)
assert 'group' not in features and 'default' not in features
assert model_card['threshold_selected_on'] == 'validation'
print('Lab 16: ALL OFFLINE LAB ASSERTIONS PASSED. Public practice only; not an official exam.')
