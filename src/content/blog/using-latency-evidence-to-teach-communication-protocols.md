---
title: Using Latency Evidence to Teach Communication Protocols
summary: >-
  Latency evidence gives protocol learners a concrete way to compare DNS, TCP,
  TLS, HTTP, and application behavior without reducing networking to memorized
  layers.
topic: Communication Protocol
publishedAt: '2026-05-03'
featured: false
tags:
  - protocols
  - latency
  - tcp
  - tls
  - http
---
Communication Protocol classes often begin with layered models, but students understand protocols faster when they can see evidence. Latency is one of the clearest evidence sources because every request leaves timing clues.

A single web page load may include DNS lookup, TCP connection setup, TLS negotiation, HTTP request handling, server processing, content download, and browser rendering. Each stage has a different teaching value.

## Evidence students can collect

Students can compare:

- DNS lookup time
- connection time
- TLS handshake time
- time to first byte
- total download time
- number of redirected requests
- cache hit or miss behavior

These measurements show that "the internet is slow" is not a diagnosis. It is the beginning of an investigation.

## Lab idea

Ask students to test three URLs:

1. a local campus system
2. a global cloud service
3. a static Cloudflare Pages site

For each URL, they should record the timing profile and explain which protocol stage dominates the delay. They should also identify whether the issue is likely network distance, DNS, TLS, server compute, payload size, or redirect policy.

## Why it matters

Latency evidence turns protocol learning into professional reasoning. Students move from naming protocols to explaining how protocol behavior affects real user experience.
