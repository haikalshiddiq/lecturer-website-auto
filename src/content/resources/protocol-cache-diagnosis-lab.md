---
title: Protocol Cache Diagnosis Lab
summary: A scenario-based lab that teaches students to separate browser cache, CDN edge cache, origin response, and Worker routing evidence during a confusing web release.
topic: Communication Protocol
level: Intermediate
format: Toolkit
featured: false
publishedAt: 2026-05-06
tags:
  - http
  - caching
  - cdn
  - cloudflare
  - troubleshooting
downloadUrl: /downloads/protocol-cache-diagnosis-lab.md
ctaLabel: Download cache diagnosis lab
---

This lab strengthens the Communication Protocol pillar by giving students a practical way to reason about HTTP caching and edge delivery when a site appears to show different versions to different users.

## Scenario brief

A lecturer publishes an updated resource page. GitHub Actions reports success, Cloudflare Pages has a recent deployment, and the page returns `200 OK`. However, one student sees the old resource title, another sees the new title, and a Worker-backed contact endpoint still responds normally.

Students must decide which protocol layer to inspect next instead of guessing that the deployment is broken.

## Evidence students collect

- Browser request headers and response headers, especially `cache-control`, `etag`, `age`, `cf-cache-status`, and content type.
- A browser-like `GET` response body sample from the live URL.
- A cache-bypassing request using a query string or explicit no-cache header.
- A separate Worker endpoint check to prove dynamic routing is not the same failure domain as static Pages delivery.
- A short explanation of whether the issue sits in browser cache, CDN edge cache, origin build output, or routing configuration.

## Classroom flow

1. Split students into release, protocol, and user-support roles.
2. Give each group the same symptom report but a different evidence card from the downloadable lab sheet.
3. Ask each group to state the strongest evidence they have and the evidence they still need.
4. Reassemble the class and build a shared diagnosis table before discussing remedies.

## Assessment prompt

> Which signal most directly proves that users received the corrected page body, and why is it stronger than only checking a status code or workflow conclusion?

A strong answer should mention a real `GET` request, expected content in the response body, and the cache or edge headers that explain whether the response was fresh, stale, or revalidated.
