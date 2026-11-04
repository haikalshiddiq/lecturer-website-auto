"""Regression contract for the no-agent daily publisher (no network/push)."""
import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import subprocess
import unittest
from datetime import datetime, timedelta
from unittest.mock import patch

RUNNER = Path(os.environ.get("DASHBOARD_RUNNER_UNDER_TEST", Path(__file__).with_name("publish-daily.py")))
spec = importlib.util.spec_from_file_location("publisher", RUNNER)
assert spec is not None and spec.loader is not None
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)


def rss(items):
    from xml.sax.saxutils import escape
    return ("<rss><channel>" + "".join(
        "<item><title>" + escape(title) + "</title><pubDate>" + date + "</pubDate>"
        "<link>https://news.google.com/rss/articles/" + str(i) + "</link>"
        '<source url="https://example.org">Publisher</source><description>' + escape(desc) + "</description></item>"
        for i, (title, date, desc) in enumerate(items)
    ) + "</channel></rss>").encode()


class NewsContract(unittest.TestCase):
    def test_snippet_and_headline_are_distinct_evidence(self):
        headline = "Pabrik baru dibuka"
        summary, evidence = p.rss_summary(f"<a>{headline}</a><font>Publisher</font>", headline, "Publisher")
        self.assertEqual(evidence, "rss-headline")
        self.assertEqual(summary, "Judul RSS Publisher: Pabrik baru dibuka")
        excerpt = "Pabrik tersebut memiliki rincian kapasitas dan jadwal operasi dalam cuplikan berita yang diterbitkan oleh sumber RSS."
        self.assertEqual(p.rss_summary(excerpt, headline, "Publisher")[1], "rss-excerpt")

    def test_forex_one_year_does_not_reuse_140_day_chart(self):
        rows = [("2026-11-03", float(i + 100)) for i in range(270)]
        with patch.object(p, "FX", [("TEST", "TST", "Test", "Test")]), patch.object(p, "yahoo_chart", return_value=rows), patch.object(p, "us_stock_insights", return_value=[]):
            result = p.market_insights([])["forexComparison"][0]
        self.assertEqual(result["return1y"], round(p.pct_return(rows, 264), 2))
        self.assertNotEqual(result["return1y"], round(p.pct_return(rows[-140:], 264), 2))

    def collect(self, rows):
        with patch.object(p, "TOPIC_QUERIES", [("Tech / AI", "test")]), patch.object(p, "fetch", return_value=rss(rows)):
            return p.collect_news()

    def test_invalid_date_is_not_fresh(self):
        self.assertIsNone(p.parse_date("not-a-date"))

    def test_expired_future_and_invalid_news_are_rejected(self):
        now = datetime.now(p.JAKARTA)
        date = lambda d: d.strftime("%a, %d %b %Y %H:%M:%S %z")
        items = self.collect([
            ("Fresh data center", date(now), "Fresh data center Publisher"),
            ("Old", date(now - timedelta(days=4)), "Old"),
            ("Future", date(now + timedelta(days=2)), "Future"),
            ("No date", "bad", "No date"),
        ])
        self.assertEqual([x["title"] for x in items], ["Fresh data center"])
        self.assertEqual(items[0]["source"], "Publisher")
        self.assertEqual(items[0]["evidenceLevel"], "rss-headline")
        self.assertIn("publishedAt", items[0])
        self.assertNotIn("surfaced this fresh item", items[0]["summary"])
        self.assertNotIn("Positive for AI adoption", items[0]["impact"])

    def test_sentiment_has_no_positive_prior_or_substring_hits(self):
        self.assertEqual(p.sentiment_for("Bilateral agenda resmi investasi", "Markets"), ("Neutral", 0.0))
        self.assertEqual(p.sentiment_for("Ongkos perawatan motor dibahas", "Tech / AI"), ("Neutral", 0.0))
        self.assertLess(p.sentiment_for("Rupiah melemah", "Markets")[1], 0)


class ReleaseContract(unittest.TestCase):
    def test_pending_workflow_never_creates_retry_commit(self):
        with patch.object(p, "run", return_value=subprocess.CompletedProcess([], 0, "a" * 40, "")), patch.object(p, "wait_github_release", return_value=(False, "run 123 in_progress/None")), patch.object(p, "trigger_cicd_retry") as retry:
            ok, detail = p.ensure_github_release()
        self.assertFalse(ok)
        retry.assert_not_called()
        self.assertIn("no duplicate", detail)

    def test_revoked_credential_does_not_create_retry_commit(self):
        with patch.object(p, "run", return_value=subprocess.CompletedProcess([], 0, "a" * 40, "")), patch.object(p, "wait_github_release", return_value=(False, "completed/failure invalid token")), patch.object(p, "trigger_cicd_retry") as retry:
            ok, _ = p.ensure_github_release()
        self.assertFalse(ok)
        retry.assert_not_called()

    def test_live_content_must_match_not_only_timestamp_and_count(self):
        payload = {"generatedAt": "2026-11-04T07:00:00+07:00", "items": [{"title": "correct"}]}
        bad = {**payload, "items": [{"title": "wrong"}]}
        with patch.object(p, "fetch", return_value=json.dumps(bad).encode()):
            with self.assertRaises(RuntimeError):
                p.verify_live(payload, attempts=1, delay=0)

    def test_live_exact_content_passes(self):
        payload = {"generatedAt": "2026-11-04T07:00:00+07:00", "items": [{"title": "correct"}]}
        with patch.object(p, "fetch", return_value=json.dumps(payload).encode()):
            self.assertIn("SHA-256", p.verify_live(payload, attempts=1, delay=0))

    def test_success_never_calls_direct_deploy(self):
        with patch.object(p, "ensure_github_release", return_value=(True, "Actions success")), patch.object(p, "verify_live", return_value="Live exact"), patch.object(p, "direct_deploy_if_possible") as direct:
            result = p.finish_release({})
        direct.assert_not_called()
        self.assertIn("Actions success", result)

    def test_unavailable_fallback_does_not_claim_token_revocation(self):
        with patch.object(p, "ensure_github_release", return_value=(False, "workflow timed out")), patch.object(p, "verify_live", side_effect=RuntimeError("stale")), patch.object(p, "direct_deploy_if_possible", return_value=(False, "fallback unavailable")):
            with self.assertRaises(RuntimeError) as err:
                p.finish_release({})
        self.assertNotIn("rotated", str(err.exception))
        self.assertIn("workflow timed out", str(err.exception))

    def test_workflow_lookup_checks_exact_sha(self):
        wrong = {"name": "Deploy Indonesia Intelligence Dashboard", "head_sha": "other", "status": "completed", "conclusion": "success"}
        with patch.object(p, "github_api_json", return_value={"workflow_runs": [wrong]}):
            ok, _ = p.wait_github_release("expected", attempts=1, delay=0)
        self.assertFalse(ok)

    def test_gate_failure_never_restores_source(self):
        failed = subprocess.CompletedProcess([], 1, "bad source", "")
        with patch.object(p, "dependency_health", return_value=True), patch.object(p, "refresh_weekly_if_stale", return_value=("", False)), patch.object(p, "dashboard_check", return_value=failed), patch.object(p, "npm_ci_self_heal", return_value="restored"), patch.object(p, "run") as run:
            with self.assertRaises(RuntimeError):
                p.build_app()
        self.assertFalse(any("checkout" in str(call) for call in run.call_args_list))

    def test_install_in_empty_worktree_is_not_drift(self):
        passed = subprocess.CompletedProcess([], 0, "pass", "")
        with patch.object(p, "dependency_health", return_value=False), patch.object(p, "refresh_weekly_if_stale", return_value=("", False)), patch.object(p, "dashboard_check", return_value=passed), patch.object(p, "npm_ci_self_heal", return_value="npm dependencies restored"), patch.object(p, "run_impeccable_pwa_gate"):
            detail = p.build_app()
        self.assertIn("isolated worktree", detail)
        self.assertNotIn("drift", detail)

    def test_report_fits_one_message_and_has_no_provisional_warnings(self):
        item = {"title": "A" * 180, "topic": "Tech / AI", "sentiment": "Neutral", "source": "Publisher", "sourceUrl": "https://news.google.com/" + "x" * 1800}
        payload = {"items": [item] * 24, "generatedAt": "2026-11-04T07:00:00+07:00", "marketInsights": {}}
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            p.telegram_report(payload, ["Local gates pass", "Actions verified", "Live verified"])
        text = output.getvalue()
        self.assertLessEqual(len(text.encode("utf-16-le")) // 2, 3500)
        self.assertIn("Publisher", text)
        self.assertNotIn("news.google.com", text)
        self.assertNotIn("should deploy", text)


if __name__ == "__main__":
    unittest.main()
