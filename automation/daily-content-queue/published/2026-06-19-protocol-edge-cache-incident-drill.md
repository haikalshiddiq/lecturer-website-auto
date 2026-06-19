---
targetCollection: resources
targetSlug: protocol-edge-cache-incident-drill
title: Edge Cache Incident Drill for Communication Protocol Classes
description: A short lab resource that asks students to diagnose stale content and cache-control behaviour across browser, CDN, and origin layers.
publishOn: 2026-06-19
summary: A Communication Protocol exercise for connecting HTTP cache headers, CDN behaviour, invalidation decisions, and user-visible release symptoms.
topic: Communication Protocol
featured: false
tags:
  - communication protocol
  - http caching
  - edge delivery
  - incident response
---

Caching is one of the easiest protocol topics for students to underestimate. When a release appears correct for one user but stale for another, the problem may not be the application code. It may be the interaction between browser cache, edge cache, origin headers, and invalidation timing.

This drill gives students a practical incident-response frame for cache behaviour.

## Scenario

A campus announcement page has been updated with a new registration deadline. The editor sees the correct page in the content system, but students on several networks still see the previous deadline. The team must decide whether the issue is browser caching, CDN edge caching, origin deployment delay, or an incorrect cache-control policy.

## Evidence checklist

Ask students to collect or reason about:

1. **HTTP status and headers:** What do `cache-control`, `etag`, `last-modified`, and `age` suggest?
2. **Request path:** Is the response coming from the browser cache, an edge node, or the origin?
3. **Variation:** Do authenticated users, anonymous users, mobile clients, or different networks see different content?
4. **Invalidation:** Was a purge or versioned asset strategy used, and what risk does it introduce?
5. **Recovery communication:** What should the release team tell users while cache convergence is verified?

## Teaching note

Encourage students to avoid saying “clear the cache” as the only answer. A professional protocol diagnosis explains which cache is suspected, what evidence supports the claim, and how the fix will be verified without hiding a deeper release problem.

## Learning outcome

Students learn to read cache symptoms as protocol evidence. They practise connecting HTTP semantics and edge delivery behaviour to user trust, release governance, and incident communication.
