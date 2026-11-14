"""Rotation/scope regressions. Uses isolated fixtures, never publishes or edits live state."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('teaching_release', Path(__file__).with_name('teaching-release.py'))
assert spec and spec.loader
r = importlib.util.module_from_spec(spec)
spec.loader.exec_module(r)


class RotationContract(unittest.TestCase):
    def test_sequence_follows_verified_releases_not_dates(self):
        state = {'nextCourse': 'IASD'}
        first = r.advance_state(state, 'IASD', 'revision-a', True)
        self.assertEqual(r.next_course(first), 'AiFn')
        second = r.advance_state(first, 'AiFn', 'revision-b', True)
        self.assertEqual(r.next_course(second), 'IASD')
        self.assertEqual(second['successfulRefinements'], 2)

    def test_no_change_does_not_skip_course(self):
        state = {'nextCourse': 'AiFn', 'successfulRefinements': 5}
        self.assertEqual(r.advance_state(state, 'AiFn', 'same', False), state)

    def test_wrong_turn_and_corrupt_record_block(self):
        with self.assertRaises(RuntimeError):
            r.advance_state({'nextCourse': 'IASD'}, 'AiFn', 'x', True)
        with self.assertRaises(RuntimeError):
            r.next_course({'nextCourse': 'another'})

    def test_selected_course_cannot_edit_sibling_or_generic_material(self):
        for path in ['src/scripts/iasd-studio.js', 'src/data/iasd-course.json', 'src/pages/iasd/studio.astro', 'src/content/blog/new.md', 'src/data/site.ts', 'public/sw.js', 'apps/indonesia-intelligence-dashboard/src/main.jsx']:
            with self.assertRaises(RuntimeError, msg=path):
                r.assert_scope([path], 'AiFn')
        r.assert_scope(['src/pages/aifn/studio.astro', 'public/aifn/labs.ipynb', 'src/data/aifn-course.json', 'public/course-release.json'], 'AiFn')

    def test_explicit_bootstrap_allows_only_authorized_integration(self):
        r.assert_scope(['src/data/site.ts', 'src/pages/index.astro', 'public/sw.js', 'src/scripts/iasd-studio.js', 'src/pages/aifn/index.astro'], 'AiFn', True)
        with self.assertRaises(RuntimeError):
            r.assert_scope(['src/content/resources/general-ai.md'], 'AiFn', True)

    def test_confirmed_grading_and_rps_mapping_are_immutable(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'automation').mkdir()
            (root / 'automation/lecturer-focus.json').write_text(json.dumps({'activeCourses': ['IASD','AiFn'], 'genericDailyPublishing': False}))
            data = json.loads((r.REPO / 'automation/aifn-rps-baseline.json').read_text())
            (root / 'automation/aifn-rps-baseline.json').write_text(json.dumps(data))
            with patch.object(r, 'REPO', root):
                r.verify_governance()
                data['activeGrading']['UTS'] = 15
                (root / 'automation/aifn-rps-baseline.json').write_text(json.dumps(data))
                with self.assertRaises(RuntimeError):
                    r.verify_governance()

    def test_build_failure_does_not_advance_or_publish(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder); (root / 'public').mkdir()
            state = root / 'state.json'; original = '{"nextCourse":"IASD"}'; state.write_text(original)
            fake = type('Result', (), {'stdout':'same-head\n'})()
            payload = {'revision':'x','courses':{'IASD':{'revision':'a','sessions':16},'AiFn':{'revision':'b','sessions':16}}}
            with patch.object(r,'REPO',root), patch.object(r,'STATE',state), patch.object(r,'verify_governance'), patch.object(r,'changed_paths',return_value=[]), patch.object(r,'live_json',return_value=None), patch.object(r,'release_payload',return_value=payload), patch.object(r.shared,'run',return_value=fake), patch.object(r.shared,'run_release_gates',side_effect=RuntimeError('real gate failed')), patch.object(r,'deploy') as deploy:
                with self.assertRaises(RuntimeError):
                    r.release('IASD')
                deploy.assert_not_called()
            self.assertEqual(state.read_text(),original)


if __name__ == '__main__':
    unittest.main()
