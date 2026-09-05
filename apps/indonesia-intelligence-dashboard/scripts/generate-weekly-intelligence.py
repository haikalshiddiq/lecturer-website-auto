#!/usr/bin/env python3
"""Build a source-linked weekly Indonesia intelligence report.

The report is a headline-level news risk signal. It deliberately does not claim to
measure personal safety, predict political events, or recommend relocation.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import html
import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from difflib import SequenceMatcher
from email.utils import parsedate_to_datetime
from pathlib import Path

APP = Path(__file__).resolve().parents[1]
DAILY_DATA = APP / "public/data/news.json"
LATEST = APP / "public/data/weekly.json"
ARCHIVE_DIR = APP / "public/data/weekly"
ARCHIVE_INDEX = ARCHIVE_DIR / "index.json"
JAKARTA = dt.timezone(dt.timedelta(hours=7))
NOW = dt.datetime.now(JAKARTA).replace(microsecond=0)
PERIOD_END = NOW.date()
PERIOD_START = PERIOD_END - dt.timedelta(days=6)

QUERY_SPECS = [
    ("Governance", "Indonesia pemerintah kebijakan DPR hukum korupsi demokrasi when:7d"),
    ("Public Safety", "Indonesia keamanan kriminal kerusuhan konflik terorisme when:7d"),
    ("Economy & Jobs", "Indonesia ekonomi lapangan kerja PHK pengangguran upah inflasi when:7d"),
    ("Business & Investment", "Indonesia investasi industri startup bisnis ekonomi digital when:7d"),
    ("Markets", "Indonesia IHSG rupiah BI Rate obligasi pasar modal when:7d"),
    ("Tech & AI", "Indonesia AI kecerdasan buatan teknologi data center siber Komdigi when:7d"),
    ("Health & Family", "Indonesia kesehatan rumah sakit BPJS ibu anak stunting when:7d"),
    ("Climate & Disaster", "Indonesia banjir gempa kebakaran cuaca BMKG bencana when:7d"),
    ("Infrastructure", "Indonesia infrastruktur IKN jalan tol pelabuhan kereta transportasi when:7d"),
    ("Energy", "Indonesia energi listrik PLN BBM batu bara nikel migas when:7d"),
    ("Education & Talent", "Indonesia pendidikan kampus dosen guru beasiswa talenta when:7d"),
    ("Telecom", "Indonesia Telkom Indosat XLSmart telekomunikasi 5G internet when:7d"),
    ("Automotive & EV", "Indonesia mobil listrik kendaraan listrik EV baterai SPKLU when:7d"),
]

SOURCE_ALLOW = [
    "Reuters", "Bloomberg", "Associated Press", "BBC", "Channel News Asia", "CNBC Indonesia",
    "Kompas", "detik", "Tempo", "Katadata", "Bisnis.com", "Kontan", "ANTARA", "Antara",
    "CNN Indonesia", "The Jakarta Post", "Investor Daily", "Media Indonesia", "Republika",
    "Liputan6", "Merdeka", "OJK", "Bank Indonesia", "Bursa Efek Indonesia", "IDX", "BMKG",
    "BNPB", "Kementerian", "Bappenas", "BPS", "Polri", "BPJS", "WHO Indonesia", "UNICEF",
    "DealStreetAsia", "Tech in Asia", "DailySocial", "InfoBankNews", "Nikkei Asia",
]
SOURCE_BLOCK = ["Tribun", "Kompasiana", "blogspot", "WordPress", "JPNN", "Suara.com"]
INDONESIA_MARKERS = [
    "indonesia", " rupiah", " ri ", "dpr", "pemerintah", "kementerian", "ojk", "ihsg", "bursa efek",
    "bank indonesia", "bps", "bnpb", "bmkg", "bpjs", "polri", "pln", "ikn", "telkom", "indosat",
    "jakarta", "jawa", "sumatra", "sulawesi", "kalimantan", "papua", "bali", "kalbar", "kalteng",
    "demonstrasi", "demokrasi", "ajaib", "sinar mas", "garuda", "pertamina", "bi rate", "xlsmart",
    "mobil listrik", "grab",
]

POSITIVE = {
    "naik": 1, "menguat": 1, "tumbuh": 1, "peluang": 1, "investasi": 1, "ekspansi": 1,
    "membaik": 1, "turun inflasi": 1, "lapangan kerja": 1, "surplus": 1, "pulih": 1,
    "berhasil": 1, "aman": 1, "terkendali": 1, "peresmian": 1, "dukungan": 1,
}
NEGATIVE = {
    "phk": 2, "kerusuhan": 2, "konflik": 2, "teror": 2, "korupsi": 1, "krisis": 2,
    "darurat": 2, "banjir": 1, "gempa": 1, "kebakaran": 1, "meninggal": 2, "wabah": 2,
    "melemah": 1, "anjlok": 2, "pengangguran": 1, "inflasi naik": 1, "gagal": 1,
    "ancaman": 1, "risiko": 1, "kriminal": 1, "penembakan": 2, "demo ricuh": 2,
    "pelanggaran": 1, "ditangkap": 1, "defisit": 1, "pemadaman": 1,
}
CRITICAL_TOPICS = {"Governance", "Public Safety", "Economy & Jobs", "Health & Family", "Climate & Disaster"}
TOPIC_WEIGHTS = {
    "Public Safety": 1.35, "Health & Family": 1.25, "Climate & Disaster": 1.2,
    "Governance": 1.15, "Economy & Jobs": 1.15, "Infrastructure": 1.0,
    "Energy": 1.0, "Education & Talent": 0.95, "Business & Investment": 0.9,
    "Markets": 0.85, "Tech & AI": 0.8, "Telecom": 0.75, "Automotive & EV": 0.7,
}
DAILY_TOPIC_MAP = {
    "Tech / AI": "Tech & AI",
    "Automotive / EV": "Automotive & EV",
    "Business / Investment": "Business & Investment",
    "Startups": "Business & Investment",
    "Regulation": "Governance",
    "Crypto / OJK": "Governance",
    "Markets": "Markets",
    "Infrastructure": "Infrastructure",
    "Telecom": "Telecom",
    "Energy": "Energy",
}

RELOCATION_RADAR = [
    {
        "country": "Malaysia",
        "careerSignal": "Peluang regional di pendidikan, teknologi, dan jasa dengan jarak budaya serta perjalanan yang relatif dekat dari Indonesia.",
        "familySignal": "Kedekatan geografis dapat memudahkan kunjungan keluarga dan masa transisi.",
        "planningFocus": "Pastikan jalur kerja bersponsor, kelayakan tanggungan, layanan kesehatan, dan biaya hidup kota tujuan.",
        "officialLabel": "Malaysia Expatriate Services Division",
        "officialUrl": "https://esd.imi.gov.my/portal/",
    },
    {
        "country": "Taiwan",
        "careerSignal": "Ekosistem teknologi, semikonduktor, AI, dan universitas kuat; kecocokan peran sangat bergantung pada spesialisasi.",
        "familySignal": "Layanan kesehatan dan status tanggungan harus diperiksa sesuai izin kerja dan jalur tinggal yang dipilih.",
        "planningFocus": "Validasi sponsor pemberi kerja, kebutuhan bahasa Mandarin, izin tinggal tanggungan, dan akses penitipan anak.",
        "officialLabel": "EZ Work Taiwan",
        "officialUrl": "https://ezworktaiwan.wda.gov.tw/",
    },
    {
        "country": "Japan",
        "careerSignal": "Pasar riset, AI, teknik, dan pendidikan tinggi besar dengan kategori status tinggal yang spesifik terhadap pekerjaan.",
        "familySignal": "Kecocokan jangka panjang bergantung pada bahasa, hunian, penitipan anak, dan cakupan tanggungan pada status yang dipilih.",
        "planningFocus": "Cocokkan kualifikasi dengan status kerja, periksa kebutuhan bahasa Jepang, dan siapkan anggaran enam bulan pertama.",
        "officialLabel": "Ministry of Foreign Affairs of Japan visa guidance",
        "officialUrl": "https://www.mofa.go.jp/j_info/visit/visa/index.html",
    },
]


def fetch(query: str) -> list[ET.Element]:
    url = "https://news.google.com/rss/search?q=" + urllib.parse.quote(query) + "&hl=id&gl=ID&ceid=ID:id"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 IndonesiaIntelligenceWeekly/1.0"})
    with urllib.request.urlopen(req, timeout=30) as response:
        return ET.fromstring(response.read()).findall(".//item")


def clean_title(value: str) -> str:
    title = html.unescape(value or "").strip()
    return re.sub(r"\s+-\s+[^-]{2,90}$", "", title).strip() or title


def source_allowed(source: str) -> bool:
    if not source or any(block.lower() in source.lower() for block in SOURCE_BLOCK):
        return False
    return any(allowed.lower() in source.lower() for allowed in SOURCE_ALLOW)


def relevant_to_indonesia(title: str) -> bool:
    padded = f" {title.lower()} "
    return any(marker in padded for marker in INDONESIA_MARKERS)


def near_duplicate(title: str, previous_titles: list[str]) -> bool:
    stopwords = {"dan", "dari", "untuk", "yang", "dengan", "indonesia", "jadi", "ini", "itu", "pada"}
    normalized = re.sub(r"[^a-z0-9 ]+", " ", title.lower())
    tokens = {token for token in normalized.split() if len(token) > 2 and token not in stopwords}
    for previous in previous_titles:
        prior_normalized = re.sub(r"[^a-z0-9 ]+", " ", previous.lower())
        prior_tokens = {token for token in prior_normalized.split() if len(token) > 2 and token not in stopwords}
        shared = tokens & prior_tokens
        overlap = len(shared) / max(1, min(len(tokens), len(prior_tokens)))
        if SequenceMatcher(None, normalized, prior_normalized).ratio() >= 0.66 or (len(shared) >= 2 and overlap >= 0.25):
            return True
    return False


def sentiment_for(title: str) -> tuple[str, float]:
    text = title.lower()
    positive = sum(weight for term, weight in POSITIVE.items() if term in text)
    negative = sum(weight for term, weight in NEGATIVE.items() if term in text)
    raw = positive - negative
    score = max(-0.8, min(0.8, raw * 0.16))
    if score >= 0.15:
        return "Positive", round(score, 2)
    if score <= -0.15:
        return "Negative", round(score, 2)
    return "Neutral", round(score, 2)


def weighted_average(rows: list[dict]) -> float:
    if not rows:
        return 0.0
    weights = [TOPIC_WEIGHTS.get(row["topic"], 1.0) for row in rows]
    return sum(row["score"] * weight for row, weight in zip(rows, weights)) / sum(weights)


def collect_items() -> tuple[list[dict], list[str]]:
    seen: set[str] = set()
    seen_titles: list[str] = []
    rows: list[dict] = []
    errors: list[str] = []
    for topic, query in QUERY_SPECS:
        try:
            entries = fetch(query)
        except Exception as exc:
            errors.append(f"{topic}: {exc}")
            continue
        kept = 0
        for entry in entries:
            source_el = entry.find("source")
            source = ((source_el.text if source_el is not None else "") or "").strip()
            if not source_allowed(source):
                continue
            title = clean_title(entry.findtext("title") or "")
            if not relevant_to_indonesia(title):
                continue
            normalized = re.sub(r"\W+", " ", title.lower()).strip()
            if not normalized or normalized in seen or near_duplicate(title, seen_titles):
                continue
            try:
                published = parsedate_to_datetime(entry.findtext("pubDate") or "").astimezone(JAKARTA)
            except Exception:
                published = NOW
            if published.date() < PERIOD_START or published.date() > PERIOD_END:
                continue
            sentiment, score = sentiment_for(title)
            identifier = hashlib.sha1((title + source).encode()).hexdigest()[:12]
            rows.append({
                "id": f"{published.date().isoformat()}-{identifier}",
                "date": published.date().isoformat(),
                "topic": topic,
                "title": title,
                "source": source,
                "sourceUrl": entry.findtext("link") or "",
                "sentiment": sentiment,
                "score": score,
                "confidence": 0.68,
            })
            seen.add(normalized)
            seen_titles.append(title)
            kept += 1
            if kept >= 5:
                break
    if DAILY_DATA.exists():
        try:
            daily_items = json.loads(DAILY_DATA.read_text()).get("items", [])
            topic_counts = Counter(row["topic"] for row in rows)
            for item in daily_items:
                topic = DAILY_TOPIC_MAP.get(item.get("topic"))
                title = clean_title(item.get("title", ""))
                source = re.sub(r"\s+via Google News RSS discovery$", "", item.get("source", ""))
                normalized = re.sub(r"\W+", " ", title.lower()).strip()
                if not topic or not source_allowed(source) or topic_counts[topic] >= 3 or normalized in seen or near_duplicate(title, seen_titles) or not relevant_to_indonesia(title):
                    continue
                date = item.get("date", "")
                if not (PERIOD_START.isoformat() <= date <= PERIOD_END.isoformat()):
                    continue
                source_url = item.get("sourceUrl", "")
                if not source_url.startswith(("http://", "https://")):
                    continue
                sentiment, score = sentiment_for(title)
                rows.append({
                    "id": item.get("id") or f"{date}-{hashlib.sha1(title.encode()).hexdigest()[:12]}",
                    "date": date,
                    "topic": topic,
                    "title": title,
                    "source": source,
                    "sourceUrl": source_url,
                    "sentiment": sentiment,
                    "score": score,
                    "confidence": min(0.68, float(item.get("confidence", 0.62))),
                })
                seen.add(normalized)
                seen_titles.append(title)
                topic_counts[topic] += 1
        except (json.JSONDecodeError, OSError, TypeError, ValueError) as exc:
            errors.append(f"Daily supplement: {exc}")

    rows.sort(key=lambda row: (row["date"], abs(row["score"]), TOPIC_WEIGHTS.get(row["topic"], 1)), reverse=True)
    return rows, errors


def build_report(rows: list[dict], errors: list[str]) -> dict:
    if len(rows) < 18:
        raise SystemExit(f"Only {len(rows)} credible weekly items found; refusing to publish. Errors: {errors}")

    sources = Counter(row["source"] for row in rows)
    sentiments = Counter(row["sentiment"] for row in rows)
    by_topic: dict[str, list[dict]] = defaultdict(list)
    by_day: dict[str, list[dict]] = defaultdict(list)
    for row in rows:
        by_topic[row["topic"]].append(row)
        by_day[row["date"]].append(row)
    missing_critical_topics = sorted(CRITICAL_TOPICS - set(by_topic))
    data_sufficiency = "Insufficient" if missing_critical_topics or len(by_topic) < 9 else "Sufficient"

    average_score = weighted_average(rows)
    negative_share = sentiments["Negative"] / len(rows)
    condition_index = round(max(0, min(100, 50 + average_score * 45 - negative_share * 18)))
    critical_negative = [row for row in rows if row["topic"] in CRITICAL_TOPICS and row["sentiment"] == "Negative"]
    critical_sources = len({row["source"] for row in critical_negative})

    if condition_index < 30 and len(critical_negative) >= 6 and critical_sources >= 5:
        level = "act"
        label = "Pertimbangkan Bertindak"
        summary = "Sinyal negatif lintas bidang kritis cukup kuat untuk memeriksa pemicu keluarga dan meminta verifikasi profesional sebelum mengambil keputusan besar."
    elif condition_index < 43 or (len(critical_negative) >= 4 and critical_sources >= 3):
        level = "prepare"
        label = "Siapkan Opsi"
        summary = "Tekanan mingguan perlu direspons dengan persiapan terukur: dokumen, tabungan transisi, jalur kerja, dan pemicu keputusan yang jelas."
    else:
        level = "monitor"
        label = "Pantau"
        summary = "Sinyal berita minggu ini belum cukup untuk menyimpulkan kondisi nasional tidak aman. Tetap pantau bidang kritis dan siapkan opsi secara proporsional."

    if data_sufficiency == "Insufficient":
        summary = "Cakupan bidang kritis belum memadai untuk memberi kesimpulan kondisi nasional. Periksa sumber tambahan dan gunakan laporan ini hanya sebagai daftar hal yang perlu dipantau."

    if len(rows) >= 35 and len(sources) >= 10 and len(by_topic) >= 9:
        confidence = "Medium"
    else:
        confidence = "Low"

    topic_scores = []
    for topic, _query in QUERY_SPECS:
        topic_rows = by_topic.get(topic, [])
        if not topic_rows:
            topic_scores.append({
                "topic": topic,
                "count": 0,
                "score": 0,
                "sentiment": "No coverage",
                "positive": 0,
                "neutral": 0,
                "negative": 0,
                "highlightId": None,
            })
            continue
        topic_avg = weighted_average(topic_rows)
        counts = Counter(row["sentiment"] for row in topic_rows)
        strongest = sorted(topic_rows, key=lambda row: (abs(row["score"]), row["date"]), reverse=True)[0]
        topic_scores.append({
            "topic": topic,
            "count": len(topic_rows),
            "score": round(topic_avg, 3),
            "sentiment": "Positive" if topic_avg >= 0.12 else "Negative" if topic_avg <= -0.12 else "Neutral",
            "positive": counts["Positive"],
            "neutral": counts["Neutral"],
            "negative": counts["Negative"],
            "highlightId": strongest["id"],
        })
    topic_scores.sort(key=lambda row: (row["score"], row["count"]))
    topic_lookup = {row["topic"]: row for row in topic_scores}

    ranked_highlights = sorted(
        rows,
        key=lambda row: (
            abs(row["score"]) * 2 + TOPIC_WEIGHTS.get(row["topic"], 1),
            row["date"],
        ),
        reverse=True,
    )
    highlights = []
    highlighted_topics = set()
    for row in ranked_highlights:
        if row["topic"] not in highlighted_topics:
            highlights.append(row)
            highlighted_topics.add(row["topic"])
    for row in ranked_highlights:
        if len(highlights) >= 12:
            break
        if row not in highlights:
            highlights.append(row)
    highlights = highlights[:12]

    days = []
    for offset in range(7):
        date = (PERIOD_START + dt.timedelta(days=offset)).isoformat()
        day_rows = by_day.get(date, [])
        days.append({"date": date, "score": round(weighted_average(day_rows), 3) if day_rows else None, "articles": len(day_rows)})

    negative_topics = [row for row in topic_scores if row["score"] < -0.05][:3]
    positive_topics = list(reversed([row for row in topic_scores if row["score"] > 0.05][-3:]))
    drivers = [
        *[{"kind": "pressure", "topic": row["topic"], "score": row["score"]} for row in negative_topics],
        *[{"kind": "support", "topic": row["topic"], "score": row["score"]} for row in positive_topics],
    ]

    return {
        "generatedAt": NOW.isoformat(),
        "period": {
            "start": PERIOD_START.isoformat(),
            "end": PERIOD_END.isoformat(),
            "label": f"{PERIOD_START.strftime('%d %b')} - {PERIOD_END.strftime('%d %b %Y')}",
        },
        "status": {
            "level": level,
            "label": label,
            "conditionIndex": condition_index,
            "confidence": confidence,
            "dataSufficiency": data_sufficiency,
            "dataQualifier": "Data belum cukup" if data_sufficiency == "Insufficient" else "Cakupan memadai",
            "missingCriticalTopics": missing_critical_topics,
            "summary": summary,
            "drivers": drivers,
            "caveat": (
                "Data bidang kritis belum lengkap: " + ", ".join(missing_critical_topics) + ". "
                if missing_critical_topics else ""
            ) + "Status ini adalah sinyal risiko berita berbasis judul dan sumber, bukan penilaian keselamatan pribadi atau rekomendasi pindah negara.",
        },
        "metrics": {
            "articles": len(rows),
            "sources": len(sources),
            "categoriesCovered": len(by_topic),
            "categoriesTracked": len(QUERY_SPECS),
            "positive": sentiments["Positive"],
            "neutral": sentiments["Neutral"],
            "negative": sentiments["Negative"],
            "averageScore": round(average_score, 3),
            "criticalNegativeSignals": len(critical_negative),
        },
        "dailyTrend": days,
        "topicScores": topic_scores,
        "highlights": highlights,
        "decisionTriggers": [
            {
                "title": "Karier dan pendapatan",
                "state": "Unknown" if not by_topic.get("Economy & Jobs") else "Check" if topic_lookup["Economy & Jobs"]["score"] < -0.05 else "Stable",
                "instruction": "Periksa tren PHK, lowongan bidang Anda, daya beli, dan cadangan dana keluarga. Jangan bertindak dari sentimen pasar saja.",
            },
            {
                "title": "Keamanan dan tata kelola",
                "state": "Unknown" if not all(by_topic.get(topic) for topic in ("Public Safety", "Governance")) else "Check" if any(topic_lookup[topic]["score"] < -0.05 for topic in ("Public Safety", "Governance")) else "Stable",
                "instruction": "Cari konfirmasi dari sumber resmi dan beberapa media untuk gangguan keamanan, perubahan hukum, atau pembatasan yang berdampak langsung.",
            },
            {
                "title": "Kesehatan ibu dan anak",
                "state": "Unknown" if not by_topic.get("Health & Family") else "Check" if topic_lookup["Health & Family"]["score"] < -0.05 else "Stable",
                "instruction": "Pisahkan sinyal nasional dari kondisi lokal. Verifikasi fasilitas persalinan, BPJS atau asuransi, dokter, dan dukungan keluarga secara langsung.",
            },
            {
                "title": "Pemicu keputusan keluarga",
                "state": "Plan",
                "instruction": "Tetapkan pemicu tertulis, misalnya kehilangan pendapatan, gangguan keamanan lokal berulang, atau akses kesehatan yang tidak memadai, lalu tinjau bersama pasangan.",
            },
        ],
        "relocationRadar": RELOCATION_RADAR,
        "methodology": {
            "sentiment": "Penilaian kata kunci pada judul berbahasa Indonesia dari -1 sampai +1. Netral berarti tidak ada kata yang memberi arah kuat.",
            "status": "Indeks kondisi berjalan dari 0 (tekanan negatif lebih kuat) sampai 100 (judul lebih suportif). Perhitungan menggabungkan sentimen berbobot dan porsi sinyal negatif. Level tertinggi juga memerlukan konfirmasi lintas bidang kritis dan sumber independen.",
            "limitations": "Pemilihan berita, ketersediaan penerbit, pembingkaian berulang, dan bahasa judul dapat menimbulkan bias. Keamanan lokal, akses kesehatan, keuangan, kelayakan visa, dan pilihan keluarga harus diverifikasi terpisah.",
            "queryErrors": errors,
        },
    }


def save_report(report: dict) -> None:
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    serialized = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    LATEST.write_text(serialized)
    archive_path = ARCHIVE_DIR / f"{PERIOD_END.isoformat()}.json"
    archive_path.write_text(serialized)

    existing = []
    if ARCHIVE_INDEX.exists():
        try:
            existing = json.loads(ARCHIVE_INDEX.read_text()).get("reports", [])
        except (json.JSONDecodeError, OSError):
            existing = []
    current = {
        "periodEnd": report["period"]["end"],
        "periodLabel": report["period"]["label"],
        "status": report["status"]["label"],
        "conditionIndex": report["status"]["conditionIndex"],
        "url": f"/data/weekly/{PERIOD_END.isoformat()}.json",
    }
    reports = [current, *[row for row in existing if row.get("periodEnd") != current["periodEnd"]]][:104]
    ARCHIVE_INDEX.write_text(json.dumps({"generatedAt": NOW.isoformat(), "reports": reports}, ensure_ascii=False, indent=2) + "\n")
    print(f"Weekly report written: {len(report['highlights'])} highlights from {report['metrics']['articles']} articles")
    print(f"Status: {report['status']['label']} ({report['status']['conditionIndex']}/100, confidence {report['status']['confidence']})")
    print(f"Archive: {archive_path}")


def main() -> None:
    rows, errors = collect_items()
    save_report(build_report(rows, errors))


if __name__ == "__main__":
    main()
