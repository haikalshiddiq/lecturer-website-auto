"""Isolated guardian fixtures; never trigger real jobs, send messages, or publish."""
import copy
from contextlib import contextmanager, redirect_stdout
from datetime import datetime, timedelta, timezone
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('guardian', Path(__file__).with_name('teaching-guardian.py'))
g = importlib.util.module_from_spec(spec)
spec.loader.exec_module(g)
NOW = datetime(2026, 11, 24, 2, 0, tzinfo=timezone.utc)
ROTATION = {'nextCourse':'IASD', 'lastRelease':{'verifiedAt':'2026-11-23T00:50:00+00:00','revision':'a'*64},'successfulRefinements':8}
JOB = {'id':g.JOB,'enabled':True,'state':'scheduled','last_status':'error','last_run_at':'2026-11-24T00:50:00+00:00','last_error':'HTTP 400: Bad Request','schedule':{'kind':'cron','expr':'30 0 * * *'},'deliver':'telegram:test:2142','next_run_at':'2026-11-25T00:30:00+00:00'}

class FakeAPI:
    def __init__(self, job, pause_at_lock=False):
        self.job=copy.deepcopy(job);self.calls=[];self.pause_at_lock=pause_at_lock
    def get_job(self, jobid):
        return copy.deepcopy(self.job)
    @contextmanager
    def _jobs_lock(self):
        if self.pause_at_lock:self.job['enabled']=False;self.job['state']='paused'
        yield
    def trigger_job(self, jobid, extra_prompt=None):
        self.calls.append((jobid,extra_prompt));self.job['manual_run_at']=NOW.isoformat();self.job['manual_run_prompt']=extra_prompt
        return copy.deepcopy(self.job)

class GuardianContract(unittest.TestCase):
    def decide(self, job=None, rotation=None, state=None, now=NOW):
        return g.decide(JOB if job is None else job,ROTATION if rotation is None else rotation,{} if state is None else state,now)[0]
    def test_healthy_run_does_not_generate_second_lesson(self):
        self.assertEqual(self.decide({**JOB,'last_status':'ok'}),'healthy')
    def test_human_pause_and_active_claim_never_rearmed(self):
        for change in [{'enabled':False},{'state':'paused'},{'run_claim':{'owner':1}},{'fire_claim':{'owner':1}},{'manual_run_at':NOW.isoformat()}]:
            self.assertIn(self.decide({**JOB,**change}),('paused','busy'))
    def test_delivery_failure_is_not_republication(self):
        self.assertEqual(self.decide({**JOB,'last_status':'delivery_failed'}),'delivery')
    def test_recoverable_failures_classified(self):
        for error in ['HTTP 400 Bad Request','IASD S05 keyboard/tap target','preview timed out','worker died']:
            self.assertEqual(self.decide({**JOB,'last_error':error}),'recover')
    def test_auth_quota_scope_or_baseline_are_not_blindly_retried(self):
        for error in ['HTTP 401 invalidated token','quota usage limit','baseline hash changed','out-of-turn unrelated edits']:
            self.assertEqual(self.decide({**JOB,'last_error':error}),'blocked')
    def test_missed_scheduled_slot_detected_even_with_yesterday_ok(self):
        self.assertEqual(self.decide({**JOB,'last_status':'ok','last_run_at':'2026-11-23T00:50:00+00:00'}),'recover')
    def test_live_release_same_slot_protects_duplicate(self):
        rotation=copy.deepcopy(ROTATION);rotation['lastRelease']['verifiedAt']='2026-11-24T00:44:00+00:00'
        self.assertEqual(self.decide(rotation=rotation),'published')
    def test_budget_cooldown_and_window_are_bounded(self):
        key=g.slot_start(NOW).isoformat()
        self.assertEqual(self.decide(state={'slots':{key:{'attempts':2}}}),'exhausted')
        self.assertEqual(self.decide(state={'slots':{key:{'attempts':1,'lastQueuedAt':(NOW-timedelta(minutes=20)).isoformat()}}}),'cooldown')
        self.assertEqual(self.decide(now=NOW+timedelta(hours=5)),'exhausted')
    def run_fixture(self, api, check=False, revision='a'*64):
        with tempfile.TemporaryDirectory() as folder:
            folder=Path(folder);state=folder/'state.json';rotation=folder/'rotation.json';rotation.write_text(json.dumps(ROTATION));before=rotation.read_bytes()
            with redirect_stdout(io.StringIO()): result=g.supervise(api,NOW,state,rotation,fetch=lambda:{'revision':revision},check=check)
            self.assertEqual(before,rotation.read_bytes())
            return result,json.loads(state.read_text()) if state.exists() else None
    def test_enqueue_retains_schedule_destination_and_rotation(self):
        api=FakeAPI(JOB);result,state=self.run_fixture(api)
        self.assertEqual(result['action'],'queued');self.assertEqual(len(api.calls),1)
        self.assertIn('Expected next course: IASD',api.calls[0][1]);self.assertIn('HTTP400 has an UNKNOWN cause',api.calls[0][1])
        self.assertEqual(api.job['schedule'],JOB['schedule']);self.assertEqual(api.job['deliver'],JOB['deliver'])
        self.assertEqual(state['slots'][g.slot_start(NOW).isoformat()]['attempts'],1)
    def test_pause_race_is_rechecked_inside_native_lock(self):
        api=FakeAPI(JOB,pause_at_lock=True);result,_=self.run_fixture(api)
        self.assertEqual(result['action'],'paused');self.assertEqual(api.calls,[])
    def test_check_mode_never_writes_budget_or_enqueues(self):
        api=FakeAPI(JOB);result,state=self.run_fixture(api,check=True)
        self.assertEqual(result['action'],'recover');self.assertIsNone(state);self.assertEqual(api.calls,[])
    def test_ambiguous_remote_write_stops_instead_of_replaying(self):
        api=FakeAPI(JOB);result,_=self.run_fixture(api,revision='b'*64)
        self.assertEqual(result['action'],'publication_review');self.assertEqual(api.calls,[])
    def test_unknown_failure_and_corrupt_rotation_stop(self):
        self.assertEqual(self.decide({**JOB,'last_error':'unclassified'}),'blocked')
        self.assertEqual(self.decide(rotation={'nextCourse':'guess'}),'invalid')
    def test_timezone_slot_uses_actual_jakarta_boundary(self):
        self.assertEqual(g.slot_start(NOW).astimezone(timezone.utc).hour,0)
        self.assertEqual(g.slot_start(NOW).minute,30)

if __name__=='__main__': unittest.main()
