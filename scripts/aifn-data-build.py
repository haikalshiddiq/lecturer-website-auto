"""Rebuild the six-feature teaching extract from retained official UCI bytes (offline)."""
import csv
import hashlib
import io
import json
import zipfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'public/aifn'
DATA = DEST / 'data'
SOURCE = 'https://archive.ics.uci.edu/dataset/144/statlog+german+credit+data'
DOWNLOAD = 'https://archive.ics.uci.edu/static/public/144/statlog+german+credit+data.zip'
FIELDS = ['sourceRow', 'duration', 'amount', 'installmentRate', 'existingCredits', 'age', 'risk']
archive = (DATA / 'uci-144-source.zip').read_bytes()
raw = zipfile.ZipFile(io.BytesIO(archive)).read('german.data')
assert raw == (DATA / 'german.data').read_bytes()
metadata = json.loads((DATA / 'uci-144-metadata.json').read_text())['data']
assert metadata['num_instances'] == 1000
assert metadata['variables'][1]['units'] == 'months'
assert metadata['variables'][12]['units'] == 'years'
assert metadata['variables'][4]['units'] is None
page = (DATA / 'uci-144-source-page.html.txt').read_text()
assert 'https://creativecommons.org/licenses/by/4.0/legalcode' in page
assert 'CC BY 4.0' in page
records = []
for i, line in enumerate(raw.decode('ascii').splitlines(), 1):
    a = line.split()
    assert len(a) == 21 and a[20] in ('1', '2')
    records.append(dict(zip(FIELDS, [i, int(a[1]), int(a[4]), int(a[7]), int(a[15]), int(a[12]), int(a[20]) - 1])))
assert len(records) == 1000 and sum(r['risk'] for r in records) == 300
previous = DATA / 'credit.json'
retrieved = json.loads(previous.read_text())['meta']['retrievedAt'] if previous.exists() else datetime.now(timezone.utc).isoformat()
meta = {
    'title': 'Statlog (German Credit Data), UCI 144: six-feature teaching extract',
    'sourceUrl': SOURCE, 'downloadUrl': DOWNLOAD, 'license': 'CC BY 4.0',
    'licenseUrl': 'https://creativecommons.org/licenses/by/4.0/legalcode',
    'retrievedAt': retrieved, 'sourceSha256': hashlib.sha256(raw).hexdigest(),
    'currency': 'Unspecified for Attribute5 in UCI documentation; original credit-amount units, not IDR',
    'limitations': [
        'Historical German creditworthiness labels: source 1=good, 2=bad; extract risk=0 good, 1 bad. Not a verified 90-day default outcome.',
        'No application timestamps: random stratified split is not an out-of-time validation or a future-performance guarantee.',
        'UCI explicitly specifies duration in months and age in years. Attribute5 credit amount has no currency unit in its variable entry; retain original units, never convert to rupiah.',
        'InstallmentRate retains source integer values 1-4 described as installment rate in percentage of disposable income; do not invent thresholds, convert categories, or assume a modern debt-ratio measure.',
        'sourceRow is a local 1-based line ordinal, not a customer identifier. Public extract omits other source attributes.',
        'Age is retained only for descriptive audit, never a classifier feature. Age cutoff 25 is a teaching choice, not a legal fairness standard.',
        'Historical selected sample of 1000 records, 700 good and 300 bad. Not representative of Indonesia or current borrowers; correlations are not causal.',
        'Three regression predictors cannot establish credit affordability. Regression reconstructs observed credit amount, not a justified lending limit.',
        'Cost weights FN=5 and FP=1 follow the documented illustrative UCI cost matrix; costs are dimensionless teaching units, not actual money.',
        'Logistic scores are not validated/calibrated PDs. Threshold sweeps on test are descriptive; policy selection requires a separate training-side validation set.',
    ],
}
(DATA / 'credit.json').write_text(json.dumps({'meta': meta, 'records': records}, ensure_ascii=False, indent=2) + '\n')
with (DEST / 'aifn-finance.csv').open('w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=FIELDS)
    writer.writeheader()
    writer.writerows(records)
provenance = {
    'creator': 'Hans Hofmann', 'citation': 'Hofmann, H. (1994). Statlog (German Credit Data). UCI Machine Learning Repository. https://doi.org/10.24432/C5NC77',
    'sourceUrl': SOURCE, 'metadataUrl': 'https://archive.ics.uci.edu/api/dataset?id=144',
    'downloadUrl': DOWNLOAD, 'licenseUrl': meta['licenseUrl'], 'retrievedAt': retrieved,
    'retainedLicenseUrl': 'https://creativecommons.org/licenses/by/4.0/legalcode.en',
    'sourceSha256': meta['sourceSha256'], 'archiveSha256': hashlib.sha256(archive).hexdigest(),
    'transform': 'german.data zero-based columns [1,4,7,15,12,20]; first five numeric values unchanged, risk=source class minus one; sourceRow=1-based file line ordinal',
    'files': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in DATA.iterdir() if p.is_file() and p.name != 'provenance.json'},
}
(DATA / 'provenance.json').write_text(json.dumps(provenance, indent=2) + '\n')
print(json.dumps({'records': len(records), 'bad': 300, 'sourceSha256': meta['sourceSha256'], 'archiveSha256': provenance['archiveSha256']}))
