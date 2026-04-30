# Protocol Edge Verification Drill

## Audience
Advanced Communication Protocol learners studying release verification at the edge.

## Teaching objective
Show students how to prove that a GitHub-to-Cloudflare release is live by reading HTTP responses, content evidence, and XML-safe asset checks.

## Drill flow
1. Confirm CI and deploy checks completed successfully.
2. Fetch the live page with a browser-like user agent and inspect expected content strings.
3. Fetch a Worker endpoint with the request format the real form uses.
4. Validate a static SVG asset locally and again from the live URL.
5. Decide whether the release is truly complete or only superficially green.

## Example verification commands
```bash
HTML=$(curl -L -A 'Mozilla/5.0' https://lecturer-materials.pages.dev/resources/protocol-edge-verification-drill/)
printf '%s' "$HTML" | grep -q "Protocol Edge Verification Drill"
printf '%s' "$HTML" | grep -q "edge verification sequence map"

curl -L https://lecturer-materials.hicall.workers.dev/api/contact   -H 'Content-Type: application/x-www-form-urlencoded'   --data 'name=Protocol+Lab&email=lab%40example.com&message=Verification+drill&formLoadedAt=2026-04-30T00:00:00Z'

python3 - <<'PY2'
from xml.etree import ElementTree as ET
import urllib.request
ET.parse('public/downloads/protocol-edge-verification-sequence-map.svg')
svg = urllib.request.urlopen('https://lecturer-materials.pages.dev/downloads/protocol-edge-verification-sequence-map.svg').read()
ET.fromstring(svg)
print('SVG validated locally and remotely')
PY2
```

## Discussion prompts
- Which proof is strongest for a user-facing HTML release?
- Why can a status code be correct while the content is still stale or wrong?
- What makes XML asset validation different from checking a generic binary file?
- Which protocol or verification signal would you automate first in CI?
