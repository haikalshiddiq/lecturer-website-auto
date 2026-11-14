#!/usr/bin/env python3
"""Scoped IASD/AiFn release and success-based teaching-course rotation."""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import fcntl
import hashlib
import json
from pathlib import Path
import re
import shlex
import shutil
import sys

import importlib.util

sys.path.insert(0, str(Path.home() / '.hermes/scripts'))
_shared_spec = importlib.util.spec_from_file_location('hicall_lecturer_auto_update', Path.home() / '.hermes/scripts/hicall_lecturer_auto_update.py')
if _shared_spec is None or _shared_spec.loader is None:
    raise RuntimeError('Canonical lecturer release helpers are unavailable')
shared = importlib.util.module_from_spec(_shared_spec)
_shared_spec.loader.exec_module(shared)

REPO = shared.REPO
STATE = Path.home() / '.hermes/cache/teaching-course-rotation.json'
MANIFEST = 'public/course-release.json'
COURSES = ('IASD', 'AiFn')
RPS_BASELINE_HASH = '0116595300a6787e8768e8a5c4b7009868addc93534ec75b53cf313330599d5c'
BOOTSTRAP_FILES = {
    '.gitignore',
    'src/data/site.ts', 'src/pages/index.astro', 'src/components/layout/Header.astro',
    'src/components/sections/Hero.astro', 'public/sw.js', 'package.json',
    'scripts/smoke-pwa.mjs', 'scripts/validate-course-visuals.mjs',
    'scripts/teaching-release.py', 'scripts/test-teaching-release.py',
    'automation/lecturer-focus.json', 'automation/teaching-maintenance.md',
}


def digest(value: object) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()


def next_course(state: dict | None = None) -> str:
    if state is None:
        loaded = json.loads(STATE.read_text()) if STATE.exists() else {}
        if not isinstance(loaded, dict):
            raise RuntimeError('Invalid course rotation record')
        state = loaded
    value = state.get('nextCourse', 'IASD')
    if value not in COURSES:
        raise RuntimeError('Invalid saved course rotation; refusing to guess learner progress')
    return value


def advance_state(state: dict, course: str, revision: str, changed: bool) -> dict:
    if not changed:
        return state
    if next_course(state) != course:
        raise RuntimeError('Release does not match the saved course turn')
    return {**state, 'version': 1, 'nextCourse': 'AiFn' if course == 'IASD' else 'IASD',
            'lastRelease': {'course': course, 'revision': revision, 'verifiedAt': datetime.now(timezone.utc).isoformat()},
            'successfulRefinements': state.get('successfulRefinements', 0) + 1}


def allowed_path(path: str, course: str, bootstrap: bool = False) -> bool:
    if path == MANIFEST or path == 'public/iasd-release.json':
        return True
    if bootstrap and path in BOOTSTRAP_FILES:
        return True
    targets = COURSES if bootstrap else (course,)
    for target in targets:
        key = target.lower()
        if path.startswith((f'src/pages/{key}/', f'src/components/{key}/', f'public/{key}/', f'automation/{key}-')):
            return True
        if path.startswith((f'src/data/{key}-', f'src/scripts/{key}-', f'src/styles/{key}-', f'scripts/test-{key}-')):
            return True
        if path in (f'scripts/smoke-{key}.mjs', f'scripts/validate-{key}.mjs'):
            return True
    return False


def changed_paths() -> list[str]:
    tracked = shared.run('git diff HEAD --no-renames --name-only -z').stdout
    untracked = shared.run('git ls-files --others --exclude-standard -z').stdout
    return sorted(set(path for path in (tracked + untracked).split('\0') if path))


def assert_scope(paths: list[str], course: str, bootstrap: bool = False) -> None:
    bad = [path for path in paths if not allowed_path(path, course, bootstrap)]
    if bad:
        raise RuntimeError('Teaching release refused out-of-turn/unrelated edits: ' + ', '.join(bad))


def course_payload(course: str) -> dict:
    key = course.lower()
    paths = []
    for base in (f'src/pages/{key}', f'src/components/{key}', f'public/{key}'):
        folder = REPO / base
        if folder.exists():
            paths.extend(path for path in folder.rglob('*') if path.is_file())
    for folder in ('src/data', 'src/scripts', 'src/styles'):
        paths.extend(path for path in (REPO / folder).glob(key + '-*') if path.is_file())
    records = [[str(p.relative_to(REPO)), hashlib.sha256(p.read_bytes()).hexdigest()] for p in sorted(set(paths))]
    if not records:
        raise RuntimeError('Missing course implementation: ' + course)
    return {'revision': digest(records), 'sessions': 16}


def release_payload() -> dict:
    courses = {name: course_payload(name) for name in COURSES}
    shell = [[name, hashlib.sha256((REPO / name).read_bytes()).hexdigest()] for name in ('src/data/site.ts', 'src/pages/index.astro', 'public/sw.js')]
    return {'version': 1, 'activeCourses': list(COURSES), 'revision': digest([courses, shell]), 'courses': courses}


def verify_governance() -> None:
    focus = json.loads((REPO / 'automation/lecturer-focus.json').read_text())
    if focus.get('activeCourses') != list(COURSES) or focus.get('genericDailyPublishing') is not False:
        raise RuntimeError('IASD/AiFn-only governance is not active')
    baseline = json.loads((REPO / 'automation/aifn-rps-baseline.json').read_text())
    if digest(baseline) != RPS_BASELINE_HASH:
        raise RuntimeError('AiFn RPS mapping or user-confirmed grading changed without authorization')


def deploy() -> str:
    secrets = shared.load_secret_env()
    shared.ensure_vercel_link(secrets)
    framework = shared.ensure_vercel_project_framework(secrets)
    env = {k: v for k, v in secrets.items() if k.startswith('VERCEL_')}
    if 'authenticated Vercel CLI fallback' in framework:
        env.pop('VERCEL_TOKEN', None)
    if framework.startswith('API token lacks team scope'):
        raise RuntimeError('Vercel team scope unavailable; no live publication claimed')
    binary = shutil.which('vercel')
    if not binary:
        raise RuntimeError('Vercel CLI missing')
    output = REPO / '.vercel/output'
    if output.exists():
        shutil.rmtree(output)
    shutil.copytree(REPO / 'dist', output / 'static')
    (output / 'config.json').write_text('{"version":3}\n')
    scope = secrets.get('VERCEL_SCOPE', 'hicall-projects')
    result = shared.run(f'{shlex.quote(binary)} deploy --prebuilt --prod --yes --force --scope {shlex.quote(scope)}', timeout=300, env=env)
    urls = re.findall(r'https://vc-lecturer-[a-z0-9-]+-hicall-projects\.vercel\.app', result.stdout)
    return urls[-1] if urls else 'production alias'


def live_json(path: str) -> object | None:
    code, body = shared.fetch_live('https://hicall.web.id/' + path, attempts=1)
    try:
        return json.loads(body) if code == 200 else None
    except ValueError:
        return None


def verify_live(payload: dict) -> None:
    code, body = shared.fetch_live('https://hicall.web.id/course-release.json', required_markers=(payload['revision'],))
    if code != 200 or json.loads(body) != payload:
        raise RuntimeError('Production course manifest differs from the validated release')
    for course in COURSES:
        key = course.lower()
        code, body = shared.fetch_live(f'https://hicall.web.id/{key}/studio', required_markers=(f'data-{key}-studio',))
        if code != 200 or f'data-{key}-studio' not in body:
            raise RuntimeError('Course studio is not live: ' + course)
        data_path = REPO / f'src/data/{key}-course.json'
        if not data_path.exists():
            raise RuntimeError('Expected embedded course data missing: ' + str(data_path))
        expected = json.loads(data_path.read_text())
        embedded = []
        for content in re.findall(r'<script\b[^>]*>([\s\S]*?)</script>', body):
            try:
                embedded.append(json.loads(content))
            except (ValueError, TypeError):
                continue
        if expected not in embedded:
            raise RuntimeError('Live embedded course data is not identical: ' + course)
        code, overview = shared.fetch_live(f'https://hicall.web.id/{key}', required_markers=(f'data-{key}-overview',))
        if code != 200 or f'data-{key}-overview' not in overview:
            raise RuntimeError('Course overview is not live: ' + course)


def release(course: str, bootstrap: bool = False) -> int:
    verify_governance()
    state = json.loads(STATE.read_text()) if STATE.exists() else {'version': 1, 'nextCourse': 'IASD', 'successfulRefinements': 0}
    if not bootstrap and course != next_course(state):
        raise RuntimeError('Requested course differs from next successful-release turn')
    shared.run('git fetch origin main', timeout=120)
    paths = changed_paths()
    assert_scope(paths, course, bootstrap)
    head = shared.run('git rev-parse HEAD').stdout.strip()
    remote = shared.run('git rev-parse origin/main').stdout.strip()
    if head != remote:
        if paths:
            raise RuntimeError('Remote advanced with pending edits; preserve and reconcile the draft before release')
        shared.run('git pull --ff-only origin main', timeout=180)
    old = live_json('course-release.json')
    payload = release_payload()
    (REPO / MANIFEST).write_text(json.dumps(payload, indent=2) + '\n')
    # Keep the historical IASD revision endpoint usable by existing links and checks.
    legacy = {'focus': 'IASD', **payload['courses']['IASD'], 'courseVersion': '2026.10.17.1'}
    (REPO / 'public/iasd-release.json').write_text(json.dumps(legacy, indent=2) + '\n')
    paths = changed_paths()
    assert_scope(paths, course, bootstrap)
    shared.run('python3 scripts/test-teaching-release.py', timeout=60)
    gates = shared.run_release_gates()
    shared.run_impeccable_pwa_gate()
    if set(changed_paths()) != set(paths):
        raise RuntimeError('Release checks unexpectedly changed tracked content')
    shared.ensure_git_identity()
    if paths:
        shared.run('git add -- ' + ' '.join(shlex.quote(p) for p in paths))
        shared.run(f'git commit -m "feat(teaching): publish verified {course} course update"', timeout=120)
        shared.run('git push origin HEAD:main', timeout=240)
    deployment = deploy() if old != payload else 'already matched validated revision'
    verify_live(payload)
    meaningful = isinstance(old, dict) and old.get('courses', {}).get(course) != payload['courses'][course]
    if bootstrap:
        state = {**state, 'nextCourse': 'IASD', 'bootstrapRevision': payload['revision']}
    else:
        state = advance_state(state, course, payload['revision'], meaningful)
    STATE.parent.mkdir(parents=True, exist_ok=True)
    temp = STATE.with_suffix('.tmp')
    temp.write_text(json.dumps(state, indent=2) + '\n')
    temp.replace(STATE)
    print('## Teaching: IASD + AiFn')
    print('- Rilis terverifikasi: ' + payload['revision'])
    print('- Gate: ' + ', '.join(gates))
    print('- Deployment: ' + deployment)
    print('- Giliran berikutnya: ' + next_course(state) + '. Tidak menyatakan progres mahasiswa.')
    print('- AiFn: https://hicall.web.id/aifn/studio#1')
    print('- IASD: https://hicall.web.id/iasd/studio#1')
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--next-course', action='store_true')
    parser.add_argument('--course', choices=COURSES)
    parser.add_argument('--bootstrap', action='store_true', help='Only for the explicitly authorized initial two-course integration')
    args = parser.parse_args(argv)
    if args.next_course:
        print(next_course())
        return 0
    with (Path.home() / '.hermes/cache/hicall-teaching-release.lock').open('w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        return release(args.course or next_course(), args.bootstrap)


if __name__ == '__main__':
    raise SystemExit(main())
