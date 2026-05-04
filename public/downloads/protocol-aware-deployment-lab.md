# Protocol-Aware Deployment Lab

A guided lab for tracing the protocols involved when a GitHub-hosted site deploys to Cloudflare Pages and a Worker.

## Lab route

1. A maintainer pushes a commit to GitHub.
2. GitHub Actions installs dependencies and runs validation.
3. The deployment workflow calls the Cloudflare API.
4. Cloudflare builds or receives static assets.
5. A browser requests the updated page through DNS, TLS, and HTTP.
6. A form request reaches the Worker endpoint.

## Student trace table

| Step | Protocol or interface | Evidence to inspect | Possible failure |
| --- | --- | --- | --- |
| Git push | HTTPS or SSH | Git remote output | Authentication rejected |
| CI install | HTTPS | Package manager log | Registry or lockfile failure |
| Pages deploy | Cloudflare API over HTTPS | Workflow deploy log | Project or token permission missing |
| Browser load | DNS, TLS, HTTP | Real GET response and expected text | Old edge content or broken route |
| Worker request | HTTP POST | JSON or form response body | Runtime error or missing secret |

## Reflection prompt

Which protocol checkpoint gives the clearest early warning before users experience a broken release, and why?
