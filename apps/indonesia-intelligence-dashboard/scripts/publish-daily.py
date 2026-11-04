#!/usr/bin/env python3
"""Deterministic Indonesia hot-news briefing + dashboard publisher.

Designed for Hermes no_agent cron so provider/OAuth model errors cannot break the daily report.
- Fetches fresh Google News RSS discovery results for Indonesia topics.
- Updates apps/indonesia-intelligence-dashboard/public/data/news.json.
- Builds the Vite dashboard.
- Commits and pushes through existing SSH deploy access when data changes.
- Attempts direct Cloudflare Pages deploy only when Cloudflare env vars are present.
"""
from __future__ import annotations

import email.utils
import fcntl
import hashlib
import json
import math
import os
import re
import shutil
import signal
import statistics
import subprocess
import sys
import tempfile
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from html import unescape
from contextlib import contextmanager
from pathlib import Path
from zoneinfo import ZoneInfo

SOURCE_REPO = Path("/home/ubuntu/projects/lecturer-website-auto")
REPO = SOURCE_REPO
APP = REPO / "apps" / "indonesia-intelligence-dashboard"
DATA = APP / "public" / "data" / "news.json"
WEEKLY_DATA = APP / "public" / "data" / "weekly.json"
PUBLISH_LOCK = Path("/home/ubuntu/.hermes/cache/indonesia-intelligence-publisher.lock")
GENERATED_PATHS = (
    Path("apps/indonesia-intelligence-dashboard/public/data/news.json"),
    Path("apps/indonesia-intelligence-dashboard/public/data/weekly.json"),
    Path("apps/indonesia-intelligence-dashboard/public/data/weekly"),
)
IMPECCABLE = Path("/home/ubuntu/.hermes/skills/impeccable/scripts/impeccable")
PAGES_PROJECT = "indonesia-intelligence-dashboard"
JAKARTA = ZoneInfo("Asia/Jakarta")
USER_AGENT = "Mozilla/5.0 (Hermes Indonesia Intelligence Cron; +https://github.com/haikalshiddiq/lecturer-website-auto)"

TOPIC_QUERIES = [
    ("Tech / AI", 'Indonesia (AI OR kecerdasan buatan OR teknologi OR data center OR Komdigi OR BRIN) when:2d'),
    ("Automotive / EV", 'Indonesia (mobil listrik OR motor listrik OR EV OR kendaraan listrik OR baterai OR nikel OR otomotif) when:3d'),
    ("Markets", 'Indonesia (IHSG OR rupiah OR BI Rate OR saham OR obligasi OR pasar modal OR MSCI) when:3d'),
    ("Business / Investment", 'Indonesia (investasi OR bisnis OR ekonomi OR manufaktur OR ekspor OR industri OR UMKM) when:2d'),
    ("Infrastructure", 'Indonesia (jalan tol OR infrastruktur OR IKN OR pelabuhan OR bandara OR kereta OR energi) when:3d'),
    ("Startups", 'Indonesia (startup OR fintech OR e-commerce OR modal ventura OR pendanaan startup) when:7d'),
    ("Regulation", 'Indonesia (regulasi OR aturan OR OJK OR BI OR Komdigi OR pajak OR izin usaha) when:3d'),
]

FX = [
    ("USDIDR=X", "USD", "US Dollar", "Global reserve currency, imports, debt service, and defensive cash proxy"),
    ("SGDIDR=X", "SGD", "Singapore Dollar", "Regional safe-haven proxy and travel/education exposure"),
    ("JPYIDR=X", "JPY", "Japanese Yen", "Japan travel, imported machinery, and defensive FX exposure"),
    ("EURIDR=X", "EUR", "Euro", "Europe trade and portfolio diversification exposure"),
    ("AUDIDR=X", "AUD", "Australian Dollar", "Commodity-cycle proxy and education/travel exposure"),
    ("CNYIDR=X", "CNY", "Chinese Yuan", "China trade, imports, and commodity demand proxy"),
]

STOCK_THEMES = [
    ("BBCA", "Bank Central Asia", "Banking / quality liquidity", "Benefits from resilient credit quality and digital transaction volume, but sensitive to rate and consumption slowdown."),
    ("BMRI", "Bank Mandiri", "Banking / SOE credit", "Proxy for corporate loan growth and government-linked investment cycles; watch NIM compression risk."),
    ("TLKM", "Telkom Indonesia", "Digital infrastructure", "Data-center, connectivity, and enterprise digitization exposure; execution and competition remain key."),
    ("ANTM", "Aneka Tambang", "Nickel / EV supply chain", "Linked to battery metals and EV headlines; commodity and policy volatility can be high."),
    ("ASII", "Astra International", "Automotive / diversified consumer", "Reads through to vehicle demand, financing, and commodity subsidiaries."),
    ("JSMR", "Jasa Marga", "Infrastructure / toll roads", "Potential beneficiary of toll-road traffic and tariff narratives; leverage and capex are watchpoints."),
]

US_STOCK_UNIVERSE = [
    ("MSFT", "Microsoft", "Software / cloud", "Azure, enterprise software, and AI monetization exposure."),
    ("NVDA", "NVIDIA", "Semiconductors / AI", "AI accelerator leadership with high growth and valuation sensitivity."),
    ("GOOGL", "Alphabet", "Digital ads / cloud", "Search cash flow, cloud growth, and AI product distribution."),
    ("AMZN", "Amazon", "Cloud / commerce", "AWS margin expansion and global commerce operating leverage."),
    ("META", "Meta Platforms", "Digital ads / AI", "Advertising efficiency, engagement, and AI-driven recommendation gains."),
    ("AAPL", "Apple", "Consumer technology", "Installed-base monetization, services, and premium-device ecosystem."),
    ("AVGO", "Broadcom", "Semiconductors / infrastructure", "AI networking, custom silicon, and infrastructure software cash flow."),
    ("JPM", "JPMorgan Chase", "Financials", "Scale, diversified earnings, and strong balance-sheet execution."),
    ("COST", "Costco", "Consumer staples", "Membership economics and resilient high-frequency consumer demand."),
    ("LLY", "Eli Lilly", "Healthcare", "Innovative medicine growth led by metabolic-health demand, with valuation risk."),
    ("V", "Visa", "Payments", "Global electronic-payment volume and high-margin network economics."),
    ("XOM", "Exxon Mobil", "Energy", "Cash generation and diversification when energy prices support the cycle."),
]


def run(cmd, cwd=None, timeout=180, check=False):
    """Run a bounded command and terminate every child on timeout."""
    if cwd is None:
        cwd = REPO
    proc = subprocess.Popen(
        cmd,
        cwd=str(cwd),
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        start_new_session=True,
    )
    try:
        stdout, stderr = proc.communicate(timeout=timeout)
    except subprocess.TimeoutExpired as exc:
        os.killpg(proc.pid, signal.SIGTERM)
        try:
            stdout, stderr = proc.communicate(timeout=8)
        except subprocess.TimeoutExpired:
            os.killpg(proc.pid, signal.SIGKILL)
            stdout, stderr = proc.communicate()
        detail = (stderr or stdout or "no command output")[-1200:]
        raise RuntimeError(
            f"Command timed out after {timeout}s: {cmd}; last output={detail}"
        ) from exc
    p = subprocess.CompletedProcess(cmd, proc.returncode, stdout, stderr)
    if check and p.returncode != 0:
        raise RuntimeError(f"Command failed {cmd}:\nSTDOUT={p.stdout[-1200:]}\nSTDERR={p.stderr[-1200:]}")
    return p


def set_workspace(repo: Path):
    """Point all publisher paths at one isolated repository worktree."""
    global REPO, APP, DATA, WEEKLY_DATA
    REPO = repo
    APP = REPO / "apps" / "indonesia-intelligence-dashboard"
    DATA = APP / "public" / "data" / "news.json"
    WEEKLY_DATA = APP / "public" / "data" / "weekly.json"


@contextmanager
def publisher_lock(timeout=45):
    """Serialize publishers without waiting indefinitely for a stale run."""
    PUBLISH_LOCK.parent.mkdir(parents=True, exist_ok=True)
    with PUBLISH_LOCK.open("a+", encoding="utf-8") as handle:
        deadline = time.monotonic() + timeout
        while True:
            try:
                fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
                break
            except BlockingIOError:
                if time.monotonic() >= deadline:
                    raise RuntimeError(
                        f"Another Indonesia publisher still holds {PUBLISH_LOCK}; "
                        f"bounded {timeout}s lock wait expired"
                    )
                time.sleep(1)
        handle.seek(0)
        handle.truncate()
        handle.write(f"pid={os.getpid()} started={datetime.now(timezone.utc).isoformat()}\n")
        handle.flush()
        try:
            yield
        finally:
            fcntl.flock(handle.fileno(), fcntl.LOCK_UN)


@contextmanager
def isolated_publish_worktree(include_commit=None):
    """Publish from origin/main without touching the operator's working tree."""
    fetch = run(["git", "fetch", "origin", "main"], cwd=SOURCE_REPO, timeout=180)
    if fetch.returncode != 0:
        raise RuntimeError("Unable to fetch origin/main: " + (fetch.stderr or fetch.stdout)[-1200:])
    if include_commit:
        if not re.fullmatch(r"[0-9a-f]{40}", include_commit):
            raise RuntimeError("include-commit requires an exact 40-character commit SHA")
        changed = run(["git", "diff-tree", "--no-commit-id", "--name-only", "-r", include_commit], cwd=SOURCE_REPO, check=True).stdout.splitlines()
        if not changed or any(not path.startswith("apps/indonesia-intelligence-dashboard/") for path in changed):
            raise RuntimeError("Only a dashboard-scoped commit may be included in a release")
    scratch = Path("/home/ubuntu/.hermes/cache/scratch")
    scratch.mkdir(parents=True, exist_ok=True)
    worktree = Path(tempfile.mkdtemp(prefix="indonesia-publisher-", dir=scratch))
    added = run(
        ["git", "worktree", "add", "--detach", "--force", str(worktree), "origin/main"],
        cwd=SOURCE_REPO,
        timeout=180,
    )
    if added.returncode != 0:
        shutil.rmtree(worktree, ignore_errors=True)
        raise RuntimeError("Unable to create isolated publish worktree: " + (added.stderr or added.stdout)[-1200:])
    set_workspace(worktree)
    try:
        if include_commit:
            run(["git", "cherry-pick", include_commit], check=True)
        yield worktree
    finally:
        artifacts = APP / "artifacts"
        if artifacts.is_dir():
            destination = SOURCE_REPO / "apps/indonesia-intelligence-dashboard/artifacts/publisher-latest"
            shutil.copytree(artifacts, destination, dirs_exist_ok=True)
        set_workspace(SOURCE_REPO)
        run(["git", "worktree", "remove", "--force", str(worktree)], cwd=SOURCE_REPO, timeout=120)
        shutil.rmtree(worktree, ignore_errors=True)


def snapshot_generated_data(destination: Path, paths=GENERATED_PATHS):
    """Copy generated payloads outside Git before any destructive reconciliation."""
    destination.mkdir(parents=True, exist_ok=True)
    for relative in paths:
        source = REPO / relative
        target = destination / relative
        if source.is_dir():
            shutil.copytree(source, target, dirs_exist_ok=True)
        elif source.is_file():
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)


def restore_generated_data(source: Path, paths=GENERATED_PATHS):
    for relative in paths:
        saved = source / relative
        target = REPO / relative
        if saved.is_dir():
            if target.exists():
                shutil.rmtree(target)
            shutil.copytree(saved, target)
        elif saved.is_file():
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(saved, target)


def npm_ci_self_heal():
    """Restore dependencies with bounded cache and network fallbacks."""
    base = [
        "npm", "ci", "--no-audit", "--no-fund",
        "--fetch-timeout=30000", "--fetch-retries=1",
    ]
    attempts = [
        (base + ["--prefer-offline"], 240, "prefer-offline"),
        (base + ["--offline"], 180, "offline-cache"),
        (base, 300, "bounded-network"),
    ]
    errors = []
    for command, timeout, label in attempts:
        try:
            result = run(command, cwd=APP, timeout=timeout)
            if result.returncode == 0:
                if dependency_health():
                    return f"npm dependencies restored via {label}"
                errors.append(
                    f"{label}: install succeeded but local tooling health check failed"
                )
            else:
                errors.append(
                    f"{label}: {(result.stderr or result.stdout or 'exit '+str(result.returncode))[-600:]}"
                )
        except Exception as exc:
            errors.append(f"{label}: {type(exc).__name__}: {str(exc)[-600:]}")
        try:
            run(["npm", "cache", "verify"], cwd=APP, timeout=90)
        except Exception as exc:
            errors.append(f"cache verify: {type(exc).__name__}: {str(exc)[-300:]}")
    raise RuntimeError(
        "npm dependency self-heal exhausted bounded fallbacks: "
        + " | ".join(errors)[-1800:]
    )


def refresh_weekly_if_stale(max_age_hours=144):
    """Regenerate weekly data, or preserve it explicitly in degraded mode."""
    stale = True
    if WEEKLY_DATA.is_file():
        try:
            generated = json.loads(WEEKLY_DATA.read_text()).get("generatedAt", "")
            timestamp = datetime.fromisoformat(generated.replace("Z", "+00:00"))
            if timestamp.tzinfo is None:
                timestamp = timestamp.replace(tzinfo=JAKARTA)
            age = datetime.now(JAKARTA) - timestamp.astimezone(JAKARTA)
            stale = age.total_seconds() >= max_age_hours * 3600
        except Exception:
            stale = True
    if not stale:
        return "", False
    generated = run(["npm", "run", "weekly:generate"], cwd=APP, timeout=240)
    if generated.returncode != 0:
        detail = (generated.stderr or generated.stdout)[-1200:]
        if WEEKLY_DATA.is_file() and "credible weekly items found" in detail:
            return (
                "weekly source pool was below the credible-item floor; retained the last "
                "validated weekly report in degraded mode and will retry next daily run",
                True,
            )
        raise RuntimeError(
            "Weekly intelligence data was stale and automatic regeneration failed: " + detail
        )
    return "weekly intelligence data refreshed automatically", False


def dashboard_check(allow_stale_weekly=False):
    command = ["npm", "run", "check"]
    if allow_stale_weekly:
        command = ["env", "ALLOW_STALE_WEEKLY=1", *command]
    result = run(command, cwd=APP, timeout=600)
    artifacts = APP / "artifacts"
    artifacts.mkdir(exist_ok=True)
    with (artifacts / "publisher-check.log").open("a", encoding="utf-8") as log:
        log.write(f"\nGate exit={result.returncode}\n{result.stdout}\n{result.stderr}\n")
    return result


def run_impeccable_pwa_gate():
    """Verify design integrity and the built installable-PWA contract."""
    if not IMPECCABLE.is_file():
        raise RuntimeError(f"Impeccable binary is missing: {IMPECCABLE}")
    targets = [
        APP / "src/main.jsx",
        APP / "src/styles.css",
        APP / "src/reference-theme.css",
        APP / "public/offline.html",
    ]
    scan = run([str(IMPECCABLE), "detect", "--json", *map(str, targets)], cwd=APP, timeout=180)
    if scan.returncode != 0:
        raise RuntimeError("Impeccable detector failed:\n" + (scan.stdout or scan.stderr)[-1800:])
    required = [
        APP / "dist/manifest.webmanifest",
        APP / "dist/sw.js",
        APP / "dist/offline.html",
        APP / "dist/icons/apple-touch-icon.png",
        APP / "dist/icons/icon-192.png",
        APP / "dist/icons/icon-512.png",
        APP / "dist/icons/icon-maskable-512.png",
    ]
    missing = [str(path.relative_to(APP)) for path in required if not path.is_file()]
    if missing:
        raise RuntimeError("PWA release gate is missing built artifacts: " + ", ".join(missing))
    index = (APP / "dist/index.html").read_text(encoding="utf-8")
    if "/manifest.webmanifest" not in index:
        raise RuntimeError("PWA release gate is missing `/manifest.webmanifest` in dist/index.html")
    source = (APP / "src/main.jsx").read_text(encoding="utf-8")
    if "serviceWorker" not in source or "/sw.js" not in source:
        raise RuntimeError("PWA release gate is missing service-worker registration in src/main.jsx")
    manifest = json.loads((APP / "dist/manifest.webmanifest").read_text(encoding="utf-8"))
    if manifest.get("display") != "standalone":
        raise RuntimeError("PWA manifest must declare standalone display")
    if manifest.get("start_url") != "/?source=pwa" or manifest.get("scope") != "/":
        raise RuntimeError("PWA manifest start_url/scope contract is incomplete")
    if not {"business", "news", "productivity"}.issubset(set(manifest.get("categories", []))):
        raise RuntimeError("PWA manifest categories contract is incomplete")
    icons = manifest.get("icons", [])
    required_icons = {
        ("/icons/icon-192.png", "192x192", "any"),
        ("/icons/icon-512.png", "512x512", "any"),
        ("/icons/icon-maskable-512.png", "512x512", "maskable"),
    }
    actual_icons = {(icon.get("src"), icon.get("sizes"), icon.get("purpose")) for icon in icons}
    if not required_icons.issubset(actual_icons):
        raise RuntimeError("PWA manifest must declare dedicated 192, 512, and maskable 512 PNG icons")
    if "apple-touch-icon.png" not in index:
        raise RuntimeError("PWA release gate is missing the Apple touch icon")
    worker = (APP / "dist/sw.js").read_text(encoding="utf-8")
    worker_contract = ("SW_VERSION", "matchAll", "url.pathname", "offline.html")
    if not all(marker in worker for marker in worker_contract):
        raise RuntimeError("Service worker is missing versioning, hashed warming, canonical data keys, or offline fallback")


def fetch(url: str, timeout=25) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/rss+xml,application/xml,text/xml,*/*"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read(1_500_000)


def strip_html(s: str) -> str:
    s = re.sub(r"<[^>]+>", " ", s or "")
    s = unescape(s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def parse_date(s: str) -> datetime | None:
    try:
        dt = email.utils.parsedate_to_datetime(s)
        if dt.tzinfo is None:
            return None
        return dt.astimezone(JAKARTA)
    except (TypeError, ValueError, OverflowError):
        return None


def sentiment_for(title: str, topic: str):
    """Uncalibrated title-direction proxy, never an investment-impact assessment."""
    text = title.lower()
    positive = ("menguat", "tumbuh", "pertumbuhan", "ekspansi")
    negative = ("melemah", "gagal", "krisis", "rugi", "phk", "terancam", "konflik")
    def hits(words):
        return sum(bool(re.search(r"(?<!\w)" + re.escape(word) + r"(?!\w)", text)) for word in words)
    score = round(max(-0.5, min(0.5, (hits(positive) - hits(negative)) * 0.25)), 2)
    label = "Positive" if score > 0.20 else "Negative" if score < -0.20 else "Neutral"
    return label, score


def impact_for(title: str) -> str:
    """Offer source-specific verification questions, not invented article conclusions."""
    checks = (
        (r"data center|pusat data", "kapasitas, utilisasi, kontrak pelanggan, dan kebutuhan listrik"),
        (r"ihsg|rupiah|bi rate", "tanggal kuotasi, arah perubahan, dan pembanding resmi BI/BEI"),
        (r"mobil listrik|motor listrik|mpv listrik|kendaraan listrik", "harga final, jadwal distribusi, dan ketentuan insentif"),
        (r"pabrik|manufaktur", "nilai investasi, kapasitas produksi, dan jadwal operasi"),
        (r"aturan|regulasi|pajak|ojk", "dokumen resmi, tanggal berlaku, dan pihak yang terkena aturan"),
    )
    for pattern, question in checks:
        match = re.search(pattern, title, re.I)
        if match:
            return f"Judul menyebut {match.group(0)}. Yang perlu diverifikasi: {question}. Dampak belum dinilai dari artikel lengkap."
    return "Dampak belum dinilai: bukti yang tersedia hanya metadata RSS, bukan artikel lengkap."


def rss_summary(description: str, title: str, source: str) -> tuple[str, str]:
    text = strip_html(description)
    # Google discovery descriptions normally repeat the headline and publisher.
    remainder = text.replace(title, "").replace(source, "").strip(" .-:|")
    if len(remainder) >= 80 and not any(token in description.lower() for token in ("<ol", "<li", "<script")):
        return f"Cuplikan RSS {source}: {text[:500]}", "rss-excerpt"
    return f"Judul RSS {source}: {title}", "rss-headline"


def collect_news():
    seen = set()
    items = []
    now = datetime.now(JAKARTA)
    for topic, query in TOPIC_QUERIES:
        url = "https://news.google.com/rss/search?" + urllib.parse.urlencode({"q": query, "hl": "id", "gl": "ID", "ceid": "ID:id"})
        try:
            root = ET.fromstring(fetch(url))
        except Exception as e:
            print(f"WARN: RSS fetch failed for {topic}: {type(e).__name__}: {e}", file=sys.stderr)
            continue
        for node in root.findall(".//item")[:10]:
            raw_title = strip_html(node.findtext("title") or "")
            if not raw_title:
                continue
            # Google often appends " - Publisher"; source tag is cleaner.
            source = strip_html(node.findtext("source") or "")
            if not source:
                continue
            title = raw_title
            suffix = f" - {source}"
            if title.endswith(suffix):
                title = title[: -len(suffix)]
            link = node.findtext("link") or ""
            dt = parse_date(node.findtext("pubDate") or "")
            if dt is None or dt < now - timedelta(hours=48) or dt > now + timedelta(minutes=5):
                continue
            parsed_link = urllib.parse.urlparse(link)
            if parsed_link.scheme != "https" or not parsed_link.hostname:
                continue
            key = re.sub(r"\W+", " ", title.lower()).strip()[:140]
            if key in seen:
                continue
            seen.add(key)
            sentiment, score = sentiment_for(title, topic)
            date = dt.strftime("%Y-%m-%d")
            sid = hashlib.sha1((date + topic + title).encode()).hexdigest()[:10]
            summary, evidence = rss_summary(node.findtext("description") or "", title, source)
            items.append({
                "id": f"{date}-{sid}",
                "date": date,
                "topic": topic,
                "title": title[:180],
                "summary": summary,
                "sentiment": sentiment,
                "score": score,
                "confidence": 0.35,
                "impact": impact_for(title),
                "source": source,
                "sourceUrl": link,
                "discoverySource": "Google News RSS",
                "evidenceLevel": evidence,
                "publishedAt": dt.isoformat(timespec="seconds"),
                "imageUrl": "",
                "imageAlt": "",
                "_dt": dt.isoformat(),
            })
    items.sort(key=lambda x: x["publishedAt"], reverse=True)
    for x in items:
        x.pop("_dt", None)
    # Round-robin avoids dropping entire topics because another feed sorts first.
    pools = [[it for it in items if it["topic"] == topic] for topic, _ in TOPIC_QUERIES]
    diverse = []
    while any(pools) and len(diverse) < 24:
        for pool in pools:
            if pool and len(diverse) < 24:
                diverse.append(pool.pop(0))
    return diverse


def yahoo_chart(symbol: str):
    now = int(time.time())
    start = now - 370 * 86400
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(symbol)}?period1={start}&period2={now}&interval=1d"
    try:
        data = json.loads(fetch(url, timeout=20).decode())
        res = data["chart"]["result"][0]
        ts = res["timestamp"]
        close = res["indicators"]["quote"][0]["close"]
        rows = []
        for t, c in zip(ts, close):
            if c:
                rows.append((datetime.fromtimestamp(t, timezone.utc).date().isoformat(), float(c)))
        return rows
    except Exception:
        return []


def pct_return(vals, days):
    if len(vals) < 2:
        return 0.0
    last = vals[-1][1]
    idx = max(0, len(vals) - days)
    base = vals[idx][1]
    return (last / base - 1) * 100 if base else 0.0


def us_stock_insights(previous=None):
    screened = []
    for symbol, name, sector, thesis in US_STOCK_UNIVERSE:
        rows = yahoo_chart(symbol)
        if not rows and previous:
            old = next((x for x in previous if x.get("symbol") == symbol), None)
            if old:
                old = dict(old); old["stale"] = True; screened.append(old)
            continue
        vals = rows[-270:]
        prices = [v for _, v in vals]
        if len(prices) < 30:
            continue
        returns = {d: pct_return(vals, d) for d in (22, 66, 132, 264)}
        daily = [(prices[i] / prices[i-1] - 1) * 100 for i in range(1, len(prices)) if prices[i-1]]
        volatility = statistics.pstdev(daily) * math.sqrt(252) if len(daily) > 2 else 0
        peak, max_drawdown = prices[0], 0
        for price in prices:
            peak = max(peak, price)
            max_drawdown = min(max_drawdown, (price / peak - 1) * 100)
        raw = returns[22] * 0.15 + returns[66] * 0.30 + returns[132] * 0.35 + returns[264] * 0.20
        raw -= volatility * 0.10 + abs(max_drawdown) * 0.12
        score = round(max(0, min(100, 50 + raw * 1.35)), 1)
        risk = "Lower" if volatility < 24 and max_drawdown > -18 else "Moderate" if volatility < 40 and max_drawdown > -32 else "High"
        step = max(1, len(vals) // 90)
        screened.append({
            "symbol": symbol, "name": name, "sector": sector, "thesis": thesis,
            "last": round(prices[-1], 2), "date": vals[-1][0],
            "return1m": round(returns[22], 2), "return3m": round(returns[66], 2),
            "return6m": round(returns[132], 2), "return1y": round(returns[264], 2),
            "volatility": round(volatility, 2), "maxDrawdown": round(max_drawdown, 2),
            "opportunityScore": score, "risk": risk,
            "sparkline": [{"date": d, "value": round(v, 2)} for d, v in vals[::step]][-100:],
            "tradingViewUrl": f"https://www.tradingview.com/symbols/NASDAQ-{symbol}/" if symbol not in ("JPM", "LLY", "V", "XOM") else f"https://www.tradingview.com/symbols/NYSE-{symbol}/",
        })
    screened.sort(key=lambda x: x.get("opportunityScore", 0), reverse=True)
    return screened


def market_insights(items, previous=None):
    now = datetime.now(JAKARTA).isoformat(timespec="seconds")
    forex = []
    for symbol, pair, label, use_case in FX:
        rows = yahoo_chart(symbol)
        if not rows and previous:
            old = next((x for x in previous.get("forexComparison", []) if x.get("symbol") == symbol), None)
            if old:
                old = dict(old); old["stale"] = True; forex.append(old)
            continue
        vals = rows[-140:]
        prices = [v for _, v in vals]
        if not prices:
            continue
        rets = [pct_return(rows, d) for d in (22, 66, 132, 264)]
        daily = [(prices[i] / prices[i-1] - 1) * 100 for i in range(1, len(prices)) if prices[i-1]]
        vol = statistics.pstdev(daily) * math.sqrt(252) if len(daily) > 2 else 0
        peak = prices[0]; maxdd = 0
        for p in prices:
            peak = max(peak, p); maxdd = min(maxdd, (p / peak - 1) * 100)
        profit_score = round(rets[1] * 0.35 + rets[2] * 0.45 + rets[0] * 0.20 - vol * 0.08, 2)
        step = max(1, len(vals)//60)
        forex.append({
            "symbol": symbol, "label": label, "useCase": use_case, "pair": pair,
            "last": round(prices[-1], 4), "date": vals[-1][0],
            "return1m": round(rets[0], 2), "return3m": round(rets[1], 2), "return6m": round(rets[2], 2), "return1y": round(rets[3], 2),
            "volatility": round(vol, 2), "maxDrawdown": round(maxdd, 2),
            "sparkline": [{"date": d, "value": round(v, 4)} for d, v in vals[::step]][-70:],
            "profitScore": profit_score,
            "view": "strongest IDR return screen" if profit_score > 0 else "defensive/watchlist screen",
        })
    forex.sort(key=lambda x: x.get("profitScore", 0), reverse=True)
    topic_counts = {}
    for it in items:
        topic_counts[it["topic"]] = topic_counts.get(it["topic"], 0) + 1
    stocks = []
    for sym, name, theme, rationale in STOCK_THEMES:
        boost = 0
        if theme.startswith("Digital") or sym == "TLKM": boost += topic_counts.get("Tech / AI", 0)
        if sym in ("ANTM", "ASII"): boost += topic_counts.get("Automotive / EV", 0)
        if sym == "JSMR": boost += topic_counts.get("Infrastructure", 0)
        if sym in ("BBCA", "BMRI"): boost += topic_counts.get("Markets", 0) + topic_counts.get("Business / Investment", 0)
        stocks.append({
            "ticker": sym, "name": name, "theme": theme,
            "opportunityScore": min(95, 55 + boost * 4),
            "rationale": rationale,
            "risk": "Screening only, not financial advice; validate valuation, liquidity, earnings, and personal risk profile before trading.",
        })
    stocks.sort(key=lambda x: x["opportunityScore"], reverse=True)
    previous_us = (previous or {}).get("usStockOpportunities", [])
    us_stocks = us_stock_insights(previous_us)
    return {
        "generatedAt": now,
        "marketContext": "Indonesia news flow is mapped into business, FX, IDX, and US equity opportunity screens. This is analytical screening, not financial advice.",
        "forexBasis": "Starting point is IDR: ranking estimates which foreign currency would have produced stronger IDR return using Yahoo Finance daily data where available. Fees/spread/tax excluded.",
        "forexComparison": forex,
        "bestForex": forex[0] if forex else {},
        "stockBasis": "Theme-based IDX watchlist derived from the current Indonesia news mix; not a buy/sell recommendation.",
        "stockOpportunities": stocks,
        "usStockBasis": "Large-cap US watchlist ranked by weighted 1M/3M/6M/1Y price momentum with volatility and maximum-drawdown penalties. A higher score is a current quantitative screen, not a forecast or guarantee of profit.",
        "usStockOpportunities": us_stocks,
        "bestUsStock": us_stocks[0] if us_stocks else {},
        "sources": ["Google News RSS discovery", "Yahoo Finance chart API for FX pairs and US equities"],
    }


def write_dashboard(items):
    previous = json.loads(DATA.read_text()) if DATA.exists() else {}
    now = datetime.now(JAKARTA)
    payload = {
        "generatedAt": now.isoformat(timespec="seconds"),
        "briefingTitle": f"Indonesia Hot News Briefing: {now.strftime('%d %B %Y')}",
        "sentimentBasis": "Metadata penerbit via Google News RSS, maksimum 48 jam (Asia/Jakarta). Sentimen adalah heuristik kata pada judul, bukan dampak investasi terverifikasi. Confidence 0.35 menandai bukti terbatas, bukan probabilitas terkalibrasi. Artikel lengkap dan gambar belum diverifikasi; tautan discovery disimpan apa adanya.",
        "items": items,
        "marketInsights": market_insights(items, previous.get("marketInsights")),
    }
    DATA.parent.mkdir(parents=True, exist_ok=True)
    old = DATA.read_text() if DATA.exists() else ""
    new = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    DATA.write_text(new)
    return old != new, payload


def dependency_health():
    """Check installed tooling locally; npm exec can silently fetch a different Vite."""
    if not (APP / "node_modules/vite/bin/vite.js").is_file():
        return False
    probe = run(["node", "--input-type=module", "-e", "await import('./eslint.config.js'); await import('vite'); await import('playwright')"], cwd=APP, timeout=30)
    return probe.returncode == 0


def build_app():
    """Install clean-worktree tooling; retry dependencies once, never erase source."""
    repairs = []
    if not dependency_health():
        npm_ci_self_heal()
        repairs.append("Dependencies installed for isolated worktree")
    weekly_action, allow_stale_weekly = refresh_weekly_if_stale()
    if weekly_action:
        repairs.append(weekly_action)
    first = dashboard_check(allow_stale_weekly)
    if first.returncode != 0:
        npm_ci_self_heal()
        first = dashboard_check(allow_stale_weekly)
        if first.returncode != 0:
            raise RuntimeError("Dashboard gates failed after one dependency repair; source preserved: " + (first.stderr or first.stdout)[-1800:])
        repairs.append("Dependency reinstall recovered a failed gate")
    run_impeccable_pwa_gate()
    return "; ".join(repairs + ["Local gates passed: data, lint, build, desktop/mobile light-dark, offline PWA, Impeccable"])


def commit_generated_data(paths=GENERATED_PATHS):
    run(["git", "add", *map(str, paths)], timeout=60, check=True)
    if run(["git", "diff", "--cached", "--quiet"], timeout=30).returncode == 0:
        return False
    run(
        ["git", "commit", "-m", "chore: refresh Indonesia intelligence dashboard data"],
        timeout=180,
        check=True,
    )
    return True


def bounded_reconcile_push(paths=GENERATED_PATHS, verify_after_restore=build_app, max_attempts=3):
    """Push with bounded fetch/rebase recovery while preserving generated payloads."""
    errors = []
    for attempt in range(1, max_attempts + 1):
        push = run(["git", "push", "origin", "HEAD:main"], timeout=240)
        if push.returncode == 0:
            return attempt
        errors.append(f"push {attempt}: {(push.stderr or push.stdout)[-700:]}")
        fetch = run(["git", "fetch", "origin", "main"], timeout=180)
        if fetch.returncode != 0:
            errors.append(f"fetch {attempt}: {(fetch.stderr or fetch.stdout)[-700:]}")
            continue
        with tempfile.TemporaryDirectory(prefix="indonesia-reconcile-") as backup_dir:
            backup = Path(backup_dir)
            snapshot_generated_data(backup, paths)
            rebase = run(["git", "rebase", "origin/main"], timeout=240)
            if rebase.returncode == 0:
                continue
            errors.append(f"rebase {attempt}: {(rebase.stderr or rebase.stdout)[-700:]}")
            run(["git", "rebase", "--abort"], timeout=60)
            reset = run(["git", "reset", "--hard", "origin/main"], timeout=90)
            if reset.returncode != 0:
                raise RuntimeError(
                    "Git reconciliation could not reset isolated worktree: "
                    + (reset.stderr or reset.stdout)[-1000:]
                )
            restore_generated_data(backup, paths)
            if verify_after_restore:
                verify_after_restore()
            run(["git", "add", *map(str, paths)], timeout=60, check=True)
            if run(["git", "diff", "--cached", "--quiet"], timeout=30).returncode == 0:
                return attempt
            run(
                ["git", "commit", "-m", "chore: refresh Indonesia intelligence dashboard data"],
                timeout=180,
                check=True,
            )
    raise RuntimeError(
        f"Git push remained broken after {max_attempts} bounded reconciliation attempts; "
        + " | ".join(errors)[-2400:]
    )


def commit_push(changed: bool, paths=GENERATED_PATHS):
    if not changed and not any((REPO / path).exists() for path in GENERATED_PATHS):
        return "No generated data exists to commit."
    committed = commit_generated_data(paths)
    if not committed:
        return "No generated data changes to commit."
    attempts = bounded_reconcile_push(paths=paths)
    if attempts == 1:
        return "GitHub main push confirmed."
    return f"Reconciled concurrent upstream changes and pushed on bounded attempt {attempts}."


def direct_deploy_if_possible():
    if not (os.environ.get("CLOUDFLARE_API_TOKEN") and os.environ.get("CLOUDFLARE_ACCOUNT_ID")):
        return False, "Direct fallback unavailable in this environment"
    p = run(["npx", "wrangler", "pages", "deploy", "dist", f"--project-name={PAGES_PROJECT}", "--branch", "main", "--commit-dirty=true"], cwd=APP, timeout=600)
    if p.returncode != 0:
        return False, "Direct fallback failed: " + (p.stderr or p.stdout)[-800:]
    return True, "Direct Cloudflare Pages fallback completed."


def github_api_json(url: str):
    req = urllib.request.Request(url, headers={
        "User-Agent": USER_AGENT,
        "Accept": "application/vnd.github+json",
    })
    with urllib.request.urlopen(req, timeout=25) as response:
        return json.loads(response.read().decode("utf-8"))


def wait_github_release(sha: str, attempts=30, delay=10):
    """Wait for the exact dashboard workflow and return (success, detail)."""
    url = (
        "https://api.github.com/repos/haikalshiddiq/lecturer-website-auto/"
        f"actions/runs?head_sha={sha}&per_page=20"
    )
    last = "workflow not visible"
    for attempt in range(1, attempts + 1):
        try:
            data = github_api_json(url)
            runs = [r for r in data.get("workflow_runs", [])
                    if r.get("name") == "Deploy Indonesia Intelligence Dashboard" and r.get("head_sha") == sha]
            if runs:
                workflow = runs[0]
                last = f"run {workflow.get('id')} {workflow.get('status')}/{workflow.get('conclusion')}"
                if workflow.get("status") == "completed":
                    ok = workflow.get("conclusion") == "success"
                    if not ok:
                        last += github_failure_summary(workflow.get("id"))
                    return ok, f"{last} · {workflow.get('html_url')}"
        except Exception as e:
            last = f"GitHub API {type(e).__name__}: {e}"
        if attempt < attempts:
            time.sleep(delay)
    return False, last


def github_failure_summary(run_id) -> str:
    """Return public failed-step/annotation evidence without requiring gh auth."""
    if not run_id:
        return ""
    try:
        jobs = github_api_json(
            "https://api.github.com/repos/haikalshiddiq/lecturer-website-auto/"
            f"actions/runs/{run_id}/jobs"
        ).get("jobs", [])
        failed = []
        annotations = []
        for job in jobs:
            for step in job.get("steps", []):
                if step.get("conclusion") == "failure":
                    failed.append(step.get("name", "unknown step"))
            job_id = job.get("id")
            if job_id:
                rows = github_api_json(
                    "https://api.github.com/repos/haikalshiddiq/lecturer-website-auto/"
                    f"check-runs/{job_id}/annotations"
                )
                annotations.extend(
                    str(row.get("message", "")).strip()
                    for row in rows
                    if row.get("annotation_level") == "failure" and row.get("message")
                )
        detail = "; ".join(dict.fromkeys(failed + annotations))
        return f" [{detail[:600]}]" if detail else ""
    except Exception as e:
        return f" [failure-detail unavailable: {type(e).__name__}]"


def trigger_cicd_retry(reason: str):
    """One auditable retry for transient Actions/Pages failures."""
    marker = APP / ".cicd-retry"
    marker.write_text(
        f"retryAt={datetime.now(JAKARTA).isoformat(timespec='seconds')}\n"
        f"reason={reason[:500]}\n"
    )
    marker_relative = marker.relative_to(REPO)
    run(["git", "add", str(marker_relative)], check=True)
    run(["git", "commit", "-m", "ci: retry Indonesia dashboard release"], timeout=180, check=True)
    bounded_reconcile_push(paths=(*GENERATED_PATHS, marker_relative), verify_after_restore=build_app)
    return run(["git", "rev-parse", "HEAD"], check=True).stdout.strip()


def permanent_deploy_credential_failure(detail: str) -> bool:
    """Return true when retrying cannot repair a revoked/mis-scoped secret."""
    text = (detail or "").lower()
    markers = (
        "rotate cloudflare_api_token",
        "cloudflare rejected the repository credential",
        "deployment secrets are missing",
        "authentication error",
        "unauthorized",
        "invalid token",
        "code 10000",
    )
    return any(marker in text for marker in markers)


def ensure_github_release():
    """Return (verified, detail), retrying only failures automation can repair."""
    sha = run(["git", "rev-parse", "HEAD"], check=True).stdout.strip()
    ok, detail = wait_github_release(sha)
    if ok:
        return True, f"GitHub Actions production release verified: {detail}"
    if permanent_deploy_credential_failure(detail):
        return False, (
            "GitHub Actions build completed but Cloudflare rejected the stored deployment "
            "credential. Automated retry was skipped because the same revoked/mis-scoped "
            f"secret cannot self-repair: {detail}"
        )
    if "completed/failure" not in detail:
        return False, f"GitHub Actions not confirmed for {sha}: {detail}; no duplicate publication triggered"
    retry_sha = trigger_cicd_retry(detail)
    ok2, detail2 = wait_github_release(retry_sha)
    if ok2:
        return True, f"GitHub Actions self-healed after one automated retry: {detail2}"
    return False, f"GitHub Actions failed after one bounded automated retry; first={detail}; retry={detail2}"


def payload_digest(payload):
    return hashlib.sha256(json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()


def verify_live(payload, attempts=18, delay=10):
    """Verify business success, not merely git push / scheduler success."""
    url = "https://indonesia-intelligence-dashboard.pages.dev/data/news.json"
    expected = payload.get("generatedAt")
    expected_count = len(payload.get("items", []))
    last_seen = "unavailable"
    for attempt in range(1, attempts + 1):
        try:
            cache_bust = urllib.parse.urlencode({"generatedAt": expected, "attempt": attempt})
            live = json.loads(fetch(f"{url}?{cache_bust}", timeout=25).decode("utf-8"))
            last_seen = live.get("generatedAt", "missing")
            if payload_digest(live) == payload_digest(payload):
                return f"Live verified: {expected}, {expected_count} items; SHA-256 {payload_digest(payload)}"
        except Exception as e:
            last_seen = f"{type(e).__name__}: {e}"
        if attempt < attempts:
            time.sleep(delay)
    raise RuntimeError(f"CI/CD push completed but live dashboard remained stale; expected={expected}, last_seen={last_seen}")


def finish_release(payload):
    """Prefer Actions; direct deployment is fallback-only, never a parallel publish."""
    ok, detail = ensure_github_release()
    if ok:
        return [detail, verify_live(payload)]
    try:
        live = verify_live(payload, attempts=2, delay=5)
        return [f"Workflow unconfirmed: {detail}", live]
    except RuntimeError:
        pass
    deployed, fallback = direct_deploy_if_possible()
    if deployed:
        return [f"Workflow unconfirmed: {detail}", fallback, verify_live(payload)]
    raise RuntimeError(f"Release unverified: {detail}; {fallback}. Fresh data remains committed; inspect the workflow evidence before remediation.")


def telegram_report(payload, actions):
    """One compact delivery; full discovery links remain on the dashboard."""
    items = payload["items"]
    pos = sum(x["sentiment"] == "Positive" for x in items)
    neg = sum(x["sentiment"] == "Negative" for x in items)
    topics = {x["topic"] for x in items}
    def plain(text, limit):
        return re.sub(r"[\n\r`*\[\]<>]", " ", str(text)).strip()[:limit]
    lines = [
        f"## Indonesia Daily: {payload['generatedAt']}",
        "https://indonesia-intelligence-dashboard.pages.dev",
        f"{len(items)} berita RSS / 48 jam | {len(topics)} topik | judul: {pos} positif, {neg} negatif",
        "\n### Sorotan penerbit",
    ]
    # At most one headline per topic, so market warnings cannot crowd out coverage.
    selected = set()
    for item in items:
        if item["topic"] in selected:
            continue
        selected.add(item["topic"])
        lines.append(f"- {plain(item['topic'], 32)}: {plain(item['title'], 115)} ({plain(item['source'], 45)})")
        if len(selected) == 5:
            break
    best = payload.get("marketInsights", {}).get("bestForex", {})
    if best:
        stale = "; data tersimpan/stale" if best.get("stale") else ""
        lines.append(f"\nFX screen: {best.get('pair')}, {best.get('last')} IDR pada {best.get('date')}; skor {best.get('profitScore')}{stale}. Bukan prakiraan keuntungan.")
    lines.append("\n### Status akhir")
    lines.extend("- " + plain(action, 430) for action in actions)
    lines.append("\nBukti: metadata RSS, bukan verifikasi artikel lengkap. Sentimen heuristik judul; bukan rekomendasi investasi. Tautan sumber lengkap di dashboard.")
    report = "\n".join(lines)
    if len(report.encode("utf-16-le")) // 2 > 3500:
        # Status/evidence takes priority over optional headlines if diagnostics grow.
        lines = [line for line in lines if not any(line.startswith(f"- {plain(topic, 32)}:") for topic in selected)]
        report = "\n".join(lines)
    if len(report.encode("utf-16-le")) // 2 > 3500:
        raise RuntimeError("Telegram report exceeded the 3500 UTF-16 unit delivery budget")
    print(report)


def release_gate_only():
    """Run the complete local gate without collecting, committing, pushing, or deploying."""
    set_workspace(SOURCE_REPO)
    result = dashboard_check(allow_stale_weekly=True)
    if result.returncode != 0:
        npm_ci_self_heal()
        result = dashboard_check(allow_stale_weekly=True)
    if result.returncode != 0:
        raise RuntimeError("Local release gate failed after bounded dependency repair: " + (result.stderr or result.stdout)[-1800:])
    run_impeccable_pwa_gate()
    print("Release gate passed: data validation, ESLint, production build, desktop/mobile interactions, themes, PWA installability, and offline smoke.")


def reconciliation_self_test():
    """Prove a same-file non-fast-forward conflict preserves the generated payload."""
    original_repo = REPO
    with tempfile.TemporaryDirectory(prefix="indonesia-git-self-test-") as root_dir:
        root = Path(root_dir)
        remote = root / "remote.git"
        seed = root / "seed"
        worker = root / "worker"
        contender = root / "contender"
        run(["git", "init", "--bare", "--initial-branch=main", str(remote)], cwd=root, check=True)
        run(["git", "init", "--initial-branch=main", str(seed)], cwd=root, check=True)
        for repo in (seed,):
            run(["git", "config", "user.email", "publisher-test@example.invalid"], cwd=repo, check=True)
            run(["git", "config", "user.name", "Publisher Test"], cwd=repo, check=True)
        generated = seed / "generated.json"
        generated.write_text('{"value":"base"}\n', encoding="utf-8")
        run(["git", "add", "generated.json"], cwd=seed, check=True)
        run(["git", "commit", "-m", "base"], cwd=seed, check=True)
        run(["git", "remote", "add", "origin", str(remote)], cwd=seed, check=True)
        run(["git", "push", "-u", "origin", "main"], cwd=seed, check=True)
        run(["git", "clone", str(remote), str(worker)], cwd=root, check=True)
        run(["git", "clone", str(remote), str(contender)], cwd=root, check=True)
        for repo in (worker, contender):
            run(["git", "config", "user.email", "publisher-test@example.invalid"], cwd=repo, check=True)
            run(["git", "config", "user.name", "Publisher Test"], cwd=repo, check=True)
        (contender / "generated.json").write_text('{"value":"concurrent"}\n', encoding="utf-8")
        run(["git", "add", "generated.json"], cwd=contender, check=True)
        run(["git", "commit", "-m", "concurrent update"], cwd=contender, check=True)
        run(["git", "push", "origin", "main"], cwd=contender, check=True)
        expected = '{"value":"fresh-generated"}\n'
        (worker / "generated.json").write_text(expected, encoding="utf-8")
        run(["git", "add", "generated.json"], cwd=worker, check=True)
        run(["git", "commit", "-m", "generated update"], cwd=worker, check=True)
        set_workspace(worker)
        try:
            def verify_preserved():
                if (worker / "generated.json").read_text(encoding="utf-8") != expected:
                    raise RuntimeError("Generated payload changed during reconciliation")
            attempts = bounded_reconcile_push(
                paths=(Path("generated.json"),),
                verify_after_restore=verify_preserved,
                max_attempts=3,
            )
        finally:
            set_workspace(original_repo)
        inspection = run(["git", "show", "main:generated.json"], cwd=remote, check=True)
        if inspection.stdout != expected:
            raise RuntimeError("Remote result did not retain the fresh generated payload")
        print(f"Git reconciliation self-test passed after {attempts} attempts; generated payload preserved.")


def publish(include_commit=None):
    actions = []
    if not SOURCE_REPO.exists():
        raise RuntimeError(f"Repo path missing: {SOURCE_REPO}")
    with publisher_lock(), isolated_publish_worktree(include_commit):
        release_paths = GENERATED_PATHS
        if include_commit:
            added_paths = run(["git", "diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD"], check=True).stdout.splitlines()
            release_paths = (*GENERATED_PATHS, *(Path(path) for path in added_paths))
        if not APP.exists():
            raise RuntimeError(f"Dashboard app path missing in isolated worktree: {APP}")
        items = collect_news()
        if len(items) < 8:
            raise RuntimeError(f"Too few RSS items collected ({len(items)}); refusing to publish weak briefing")
        changed, payload = write_dashboard(items)
        actions.append(build_app())
        actions.append(commit_push(changed, paths=release_paths))
        actions.extend(finish_release(payload))
        sha = run(["git", "rev-parse", "HEAD"], check=True).stdout.strip()
        actions.append(f"Release commit: {sha}")
        artifacts = APP / "artifacts"
        artifacts.mkdir(exist_ok=True)
        (artifacts / "published-news.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
        (artifacts / "release-evidence.json").write_text(json.dumps({"commit": sha, "payloadSha256": payload_digest(payload), "generatedAt": payload["generatedAt"], "actions": actions}, indent=2) + "\n")
        telegram_report(payload, actions)


def main():
    if len(sys.argv) == 3 and sys.argv[1] == "--include-commit":
        publish(include_commit=sys.argv[2])
        return
    if sys.argv[1:] == ["--release-gate"]:
        release_gate_only()
        return
    if sys.argv[1:] == ["--self-test-git-reconciliation"]:
        reconciliation_self_test()
        return
    if sys.argv[1:]:
        raise RuntimeError("Usage: indonesia_hot_news_dashboard.py [--release-gate|--self-test-git-reconciliation|--include-commit SHA]")
    publish()


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("## 🔴 Indonesia briefing/dashboard auto-fix failed")
        print(f"Error: `{type(e).__name__}: {str(e)[-1600:]}`")
        sys.exit(1)
