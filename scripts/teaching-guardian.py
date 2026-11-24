#!/usr/bin/env python3
"""Bounded recovery for one teaching job; never author, deploy, or advance course state."""
from __future__ import annotations

import argparse
from contextlib import nullcontext
from datetime import datetime, time, timedelta, timezone
import fcntl
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from zoneinfo import ZoneInfo

JOB = '2f1406e02689'
HOME = Path(os.environ.get('HERMES_HOME', str(Path.home() / '.hermes')))
ROOT = HOME / 'cache/teaching-guardian'
ROTATION = HOME / 'cache/teaching-course-rotation.json'
MAX_RECOVERIES = 2
COOLDOWN = timedelta(hours=1)
WIB = ZoneInfo('Asia/Jakarta')
FATAL = re.compile(r'\b401\b|\b403\b|invalidated.*token|unauthorized|quota|usage.*limit|baseline.*(?:mismatch|changed)|out-of-turn|unrelated edits|scope conflict', re.I)
RECOVERABLE = re.compile(r'HTTP 400|Bad Request|timeout|timed out|keyboard/tap|focus|preview|ECONN|connection|DNS|interrupted|worker.*(?:died|exit)', re.I)


def instant(value):
    if not value:
        return None
    result = datetime.fromisoformat(str(value).replace('Z', '+00:00'))
    if result.tzinfo is None:
        raise ValueError('Naive timestamps cannot establish a recovery window')
    return result


def slot_start(now):
    local = now.astimezone(WIB)
    slot = datetime.combine(local.date(), time(7, 30), WIB)
    return slot if local >= slot else slot - timedelta(days=1)


def decide(job, rotation, state, now):
    if not job:
        return 'missing', 'Job pengajaran tidak ditemukan; tidak dibuat ulang secara diam-diam.'
    if not job.get('enabled') or job.get('state') in ('paused', 'cancelled', 'completed'):
        return 'paused', 'Pause/penonaktifan dihormati; guardian tidak mengaktifkan ulang.'
    if job.get('fire_claim') or job.get('run_claim') or job.get('manual_run_at'):
        return 'busy', 'Run/antrean lain masih aktif; tidak membuat duplikasi.'
    slot = slot_start(now)
    failed_at = instant(job.get('last_run_at'))
    missed = (not failed_at or failed_at < slot) and now - slot >= timedelta(minutes=30)
    if job.get('last_status') in ('ok', 'skipped') and not missed:
        return 'healthy', 'Run terakhir selesai; jadwal berikutnya dipertahankan.'
    if job.get('last_status') == 'delivery_failed':
        return 'delivery', 'Kegagalan pengiriman tidak boleh mengulang publikasi.'
    if missed:
        failed_at = slot
    if not failed_at or failed_at < slot:
        return 'waiting', 'Tidak ada kegagalan pada slot pengajaran aktif.'
    if now - failed_at < timedelta(minutes=15):
        return 'cooldown', 'Memberi waktu worker/delivery menyelesaikan pencatatan.'
    if now - slot > timedelta(hours=6):
        return 'exhausted', 'Jendela pemulihan harian selesai; jadwal alami berikutnya tetap aktif.'
    if rotation.get('nextCourse') not in ('IASD', 'AiFn'):
        return 'invalid', 'Rotasi tidak valid; progres tidak ditebak.'
    released = instant((rotation.get('lastRelease') or {}).get('verifiedAt'))
    if released and released >= slot:
        return 'published', 'Sudah ada rilis terverifikasi pada slot ini; tidak menulis materi kedua.'
    record = state.get('slots', {}).get(slot.isoformat(), {})
    if record.get('attempts', 0) >= MAX_RECOVERIES:
        return 'exhausted', 'Dua upaya pemulihan telah digunakan; tidak mengulang tanpa batas.'
    queued = instant(record.get('lastQueuedAt'))
    if queued and now - queued < COOLDOWN:
        return 'cooldown', 'Cooldown pemulihan satu jam masih berlaku.'
    previous_error = str(job.get('last_error') or (job.get('last_failure') or {}).get('detail') or '')
    error = previous_error if job.get('last_status') not in ('ok', 'skipped') else ''
    if missed and not error:
        error = 'missed scheduled worker exit'
    if FATAL.search(error):
        return 'blocked', 'Autentikasi/kuota/baseline/scope perlu tindakan; tidak dibypass atau diulang terus.'
    if not RECOVERABLE.search(error):
        return 'blocked', 'Kegagalan belum terklasifikasi; perlu diagnosis, bukan retry buta.'
    return 'recover', 'Fresh recovery menginspeksi bukti/draft terlebih dahulu; bukan replay transaksi.'


def recovery_prompt(course, slot, revision):
    return f'''RECOVERY ONLY, guardian slot {slot.isoformat()}. Expected next course: {course}. Observed live revision: {revision}.
This is NOT permission to publish a second lesson, bypass a gate, or reset/stash a draft. Read automation/teaching-reliability.md first. Confirm next-course still equals {course}; if it changed or this slot already has a verified release, stop without authoring. Inspect git status, retained failure evidence and exact live manifest BEFORE acting. Recover an existing draft before selecting new material. A previous model call may already have written, committed or deployed; reconcile actual effects instead of blindly replaying them. Recoverable provider HTTP400 has an UNKNOWN cause: a fresh context is mitigation, not proof the provider is repaired. For failing tests load superior-debugging and superior-testing; for scheduler/provider issues load hermes-agent and superior-reliability. Use hicall-work-quality and existing antislop DURING / REA evidence defaults. Diagnose each focus/outline/44px assertion independently. No sleep/retry/timeout inflation to hide a genuine assertion failure. Repair only a proven in-scope defect; otherwise retain draft and report blocked. Preserve original baselines, grading, learner state, schedule and successful-release rotation. Use only the original scoped release command, never --manual or --bootstrap in this recovery. At most one selected-course refinement; all original gates and exact live read-back remain mandatory. A service outage may require an honest no-publication report. Never print old content as a new lesson.'''


def atomic_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(prefix=path.name + '.', dir=path.parent)
    try:
        with os.fdopen(fd, 'w') as stream:
            json.dump(value, stream, ensure_ascii=False, indent=2)
            stream.write('\n')
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def live_manifest():
    response = subprocess.run(['curl', '--fail', '--silent', '--show-error', '--location', '--max-time', '20', '-H', 'Cache-Control: no-cache', 'https://hicall.web.id/course-release.json'], capture_output=True, text=True, timeout=25)
    if response.returncode:
        raise RuntimeError('Live manifest unavailable; no recovery queued under ambiguous publication state')
    data = json.loads(response.stdout)
    if data.get('activeCourses') != ['IASD', 'AiFn'] or not re.fullmatch(r'[0-9a-f]{64}', str(data.get('revision', ''))):
        raise ValueError('Live teaching manifest is malformed')
    return data


def load_api():
    sys.path.insert(0, str(HOME / 'hermes-agent'))
    from cron import jobs
    return jobs


def supervise(api, now, state_path, rotation_path, fetch=live_manifest, check=False):
    state = json.loads(state_path.read_text()) if state_path.exists() else {'version': 1, 'slots': {}}
    rotation = json.loads(rotation_path.read_text())
    action, reason = decide(api.get_job(JOB), rotation, state, now)
    revision = None
    if action == 'recover':
        revision = fetch()['revision']
        # Serialize the final pause/claim checks with Hermes' own reentrant store lock.
        with api._jobs_lock():
            rotation = json.loads(rotation_path.read_text())
            job = api.get_job(JOB)
            action, reason = decide(job, rotation, state, now)
            expected = (rotation.get('lastRelease') or {}).get('revision') or rotation.get('bootstrapRevision')
            if action == 'recover' and (not expected or revision != expected):
                action, reason = 'publication_review', 'Live revision berbeda dari checkpoint rotasi; mungkin sudah terbit sebelum worker gagal. Tidak mengulang publikasi yang ambigu.'
            if action == 'recover' and not check:
                slot = slot_start(now)
                key = slot.isoformat()
                entry = state.setdefault('slots', {}).setdefault(key, {'attempts': 0})
                # Persist a reservation before enqueue. A crash may spend a recovery budget, never duplicate a queue.
                entry.update(attempts=entry['attempts'] + 1, lastQueuedAt=now.isoformat(), failedRunAt=job.get('last_run_at'), course=rotation['nextCourse'], liveRevision=revision)
                atomic_json(state_path, state)
                updated = api.trigger_job(JOB, extra_prompt=recovery_prompt(rotation['nextCourse'], slot, revision))
                if not updated or updated.get('schedule') != job.get('schedule') or updated.get('deliver') != job.get('deliver') or not updated.get('manual_run_prompt'):
                    raise RuntimeError('Queued recovery could not be verified; reserved budget retained')
                action = 'queued'
    result = {'at': now.isoformat(), 'jobId': JOB, 'action': action, 'reason': reason, 'nextCourse': rotation.get('nextCourse'), 'liveRevision': revision, 'checkOnly': check}
    if not check:
        state['latest'] = result
        # Keep bounded per-slot budget, not a growing transcript of private/tool output.
        state['slots'] = {k: v for k, v in state.get('slots', {}).items() if instant(k) >= now - timedelta(days=8)}
        notice = f"{slot_start(now).isoformat()}:{action}"
        emit = action in ('queued', 'missing', 'delivery', 'invalid', 'published', 'blocked', 'exhausted', 'publication_review') and state.get('lastNotice') != notice
        if emit:
            state['lastNotice'] = notice
        atomic_json(state_path, state)
        if emit:
            print(f"**Teaching guardian: {action}**\n{reason}\nGiliran: {rotation.get('nextCourse')}. Jadwal utama tetap 07.30 WIB. Antrean pemulihan bukan bukti materi baru terbit.")
    return result


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Read-only health/decision check; never queue or persist a recovery')
    args = parser.parse_args(argv)
    ROOT.mkdir(parents=True, exist_ok=True)
    with (ROOT / 'worker.lock').open('a') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return 0
        try:
            result = supervise(load_api(), datetime.now(timezone.utc), ROOT / 'state.json', ROTATION, check=args.check)
            if args.check:
                print(json.dumps(result, ensure_ascii=False))
            return 0
        except Exception as error:
            # Error type is useful; provider payloads and credentials never enter Telegram stdout.
            print(f'Teaching guardian stopped safely: {type(error).__name__}. Tidak ada bypass/kemajuan rotasi; periksa log lokal.', file=sys.stderr)
            return 1


if __name__ == '__main__':
    raise SystemExit(main())
