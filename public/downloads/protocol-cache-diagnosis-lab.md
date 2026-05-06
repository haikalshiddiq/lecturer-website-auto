# Protocol Cache Diagnosis Lab

## Purpose

Use this lab to help students diagnose a web release where the deployment pipeline is green but users report seeing inconsistent content. The goal is to read protocol evidence before choosing a fix.

## Scenario

A Cloudflare Pages site has just deployed an updated teaching resource. The release workflow is successful and the public page returns `200 OK`, but several students report different page versions.

- Student A sees the old title.
- Student B sees the new title.
- The lecturer sees the new page in an incognito window.
- The contact form Worker endpoint still returns a normal JSON response.

## Evidence cards

### Card 1: Browser response

```text
status: 200
cache-control: public, max-age=3600
age: 3420
cf-cache-status: HIT
body sample: old title still visible
```

### Card 2: Browser-like fresh GET

```bash
curl -L -A 'Mozilla/5.0' https://example.pages.dev/resources/protocol-cache-diagnosis-lab/
```

Expected evidence to record:

- HTTP status
- response body snippet containing the expected title
- `cache-control`, `age`, `etag`, and `cf-cache-status` headers from a verbose or header-preserving request

### Card 3: Cache-bypass request

```bash
curl -L -A 'Mozilla/5.0' 'https://example.pages.dev/resources/protocol-cache-diagnosis-lab/?verify=release-id'
```

If the cache-bypass request shows the new content while the normal request shows old content, the likely issue is stale edge or browser cache rather than a missing build artifact.

### Card 4: Worker endpoint control check

```bash
curl -s https://lecturer-materials.example.workers.dev/
```

If this endpoint is healthy, students should not automatically blame the Worker for a stale static page. Pages and Workers are separate deployment and routing surfaces.

## Diagnosis table

| Signal | What it can prove | What it cannot prove alone |
| --- | --- | --- |
| Workflow success | Build and deploy automation completed | User received the corrected page body |
| `200 OK` | A route responded | The response is the newest content |
| Body contains expected title | The requested URL served the intended content | All caches globally are refreshed |
| `cf-cache-status: HIT` with high `age` | Edge cache likely served the response | Whether origin content is wrong |
| Cache-bypass request shows new content | Origin or alternate cache key has the update | Browser caches are already refreshed |
| Worker health check | Dynamic endpoint route is available | Static Pages cache freshness |

## Student task

Write a five-sentence incident note:

1. State the user-visible symptom.
2. Identify the most likely protocol layer.
3. Quote the strongest response-body evidence.
4. Quote one cache-related header that supports the diagnosis.
5. Recommend the next safe action, such as waiting for TTL, purging a specific cache path, or correcting the build if origin content is also stale.

## Instructor debrief

Emphasise that protocol troubleshooting is not just memorising header names. Students should connect headers, request method, response body, and deployment architecture into one evidence-based explanation.
