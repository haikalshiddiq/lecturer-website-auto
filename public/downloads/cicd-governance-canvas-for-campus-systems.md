# CI/CD Governance Canvas for Campus Systems

A classroom-ready canvas for mapping automated delivery to Information System Management controls.

## 1. Service context

- Campus service or digital product:
- Primary users:
- Owner / approving unit:
- Production channel:

## 2. Release flow evidence

| Stage | Evidence students should collect | Governance question |
| --- | --- | --- |
| Content or code change | Commit, issue, or queued item | Is the change traceable to a real teaching or service need? |
| Validation | Build, content validation, link check, and review result | Is there objective evidence that the change is safe? |
| Deployment | Cloudflare Pages or Worker deploy log | Who can verify that the approved version reached production? |
| Post-release check | Live URL, expected content string, endpoint response | Did the release improve the user-facing service without regression? |

## 3. Risk controls

- Define one rollback path before release.
- Identify one stakeholder who must be informed if validation fails.
- Record one metric that proves the service is still healthy after deployment.

## 4. Student reflection

1. Which governance control prevented the highest-risk failure?
2. Which evidence item would be hardest to fake or misunderstand?
3. How would the release process change if the service handled sensitive student data?
