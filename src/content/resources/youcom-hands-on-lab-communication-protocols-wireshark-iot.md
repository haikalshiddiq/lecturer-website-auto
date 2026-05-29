---
title: 'You.com Hands-on Lab: Wireshark IoT Protocol Analysis'
summary: 'A 90-minute Communication Protocol lab where students use Wireshark to compare HTTP, DNS, TCP, UDP, TLS, and MQTT in an Indonesian smart-agriculture scenario.'
topic: 'Communication Protocol'
publishedAt: '2026-05-29'
featured: true
tags:
  - communication protocol
  - wireshark
  - mqtt
  - iot
  - packet analysis
  - you.com
level: Intermediate
format: Guide
---

## Hands-on Lab Draft: Network protocol analysis lab using Wireshark to compare HTTP, DNS, TCP, UDP, TLS, and MQTT for IoT communication reliability and security

**Course:** Communication Protocols  
**Audience:** undergraduate Information Systems students in Indonesia  
**Generated:** 2026-05-29 17:23:07 UTC  
**You.com query:** `Network protocol analysis lab using Wireshark to compare HTTP, DNS, TCP, UDP, TLS, and MQTT for IoT communication reliability and security practical case study recent examples for Communication Protocols students`

## Live Search Evidence

1. **Wireshark for Windows - Download it from Uptodown for free** (web)
   - Date: 2026-04-30T10:44:26
   - URL: https://wireshark.en.uptodown.com/windows
   - Context: Wireshark can recognize and parse thousands of network protocols, from the most common ones such as TCP, UDP, HTTP, and DNS, to specialized protocols used in telecommunications, IoT, and industrial systems.
2. **How to Use Wireshark (2026 Guide) – Step-by-Step Tutorial** (web)
   - Date: 2026-05-26T16:52:10
   - URL: https://wireshark.com/how-to-use-wireshark/
   - Context: Source and destination See which systems are communicating. Protocol Identify whether the traffic is DNS, TCP, HTTP, TLS, or something else.
3. **How to Use Wireshark for Beginners: Network Analysis Guide - BlogWolf** (web)
   - Date: 2026-05-19T12:10:05
   - URL: https://blogwolf.com/how-to-use-wireshark-for-beginners-network-analysis-guide/
   - Context: Wireshark is useful for many reasons. You do not need to be a hacker. You do not need to be a network wizard. You just need patience. ... Learn how networks work in real life. Fix slow connections or strange network problems. Check DNS issues when websites do not load. Understand HTTP, TCP, UDP, and other protocols. Spot unusual traffic on your own
4. **Exploring HTTP Protocols with WireShark: A Comprehensive Lab - ...** (web)
   - Date: 2026-05-08T12:29:20
   - URL: https://www.cliffsnotes.com/study-notes/33815086
   - Context: Computer-science document from Rowan University, 8 pages, Lab #2: HTTP Name(s): _ Date: _ Tweaked from Version: July 2005 © 2005 J.F. Kurose, K.W. Ross. All Rights Reserved Having gotten our feet wet with the WireShark packet sniffer in the introductory lab, we're now ready to use WireShark to investigate protoc
5. **Types of Network Protocols - GeeksforGeeks** (web)
   - Date: 2026-04-28T00:00:00
   - URL: https://www.geeksforgeeks.org/computer-networks/types-of-network-protocols-and-their-uses/
   - Context: Your All-in-One Learning Portal: GeeksforGeeks is a comprehensive educational platform that empowers learners across domains-spanning computer science and programming, school education, upskilling, commerce, software tools, competitive exams, and more.

## AI-Generated Lab Plan From You.com Research

# Network Protocol Analysis Lab: IoT Communication in Indonesian Smart Agriculture

## Learning Objectives
Students will: (1) Analyze packet flows for HTTP, DNS, TCP, UDP, TLS using Wireshark; (2) Evaluate MQTT QoS levels and publish-subscribe reliability mechanisms [[1]]; (3) Compare protocol overhead and security trade-offs for IoT applications; (4) Diagnose real-world IoT communication issues using display filters [[2]].

## Real-World Context
**Scenario:** Analyze network traffic from a prototype smart farming system monitoring soil moisture and climate data for Indonesian smallholder farmers growing chili or coffee [[3]] [[4]]. Students troubleshoot why sensor data reaches the cloud platform inconsistently.

## Lab Setup (Free Tools)
- **Wireshark** (packet capture/analysis)
- **Eclipse Paho MQTT client** for simulation [[5]]
- Pre-recorded packet capture files with mixed protocols

## 90-Minute Activity Flow

**Minutes 0–15 (Setup):** Install Wireshark, load sample IoT capture file, demo basic filters (tcp, dns, mqtt).

**Minutes 15–45 (Protocol Comparison):**
- Teams analyze assigned protocol: HTTP vs. MQTT message size/latency
- Document TCP/UDP reliability differences
- Compare unencrypted DNS and TLS-encrypted variants

**Minutes 45–75 (MQTT Deep Dive):**
- Examine MQTT CONNECT, PUBLISH, SUBSCRIBE packets
- Identify QoS 0, 1, 2 delivery guarantees [[1]]
- Filter MQTT topics and payloads; note TLS encryption overhead

**Minutes 75–90 (Troubleshooting Exercise):**
- Diagnose "missing sensor alerts" (dropped UDP packets, QoS mismatch)
- Propose protocol selection rationale for Indonesian farm scenario

## Student Deliverables
1. **Protocol Comparison Table:** Packet size, latency, security, reliability (HTTP/DNS/TCP/UDP/TLS/MQTT)
2. **Wireshark Packet Report:** Annotated screenshots with filter logic
3. **Recommendation Brief:** Justify protocol choice for smart agriculture scenario (1 page)

## Assessment Rubric (40 points)
- **Protocol Analysis (15pts):** Accurate identification of all 6 protocols; QoS level explanation
- **Troubleshooting (15pts):** Root-cause diagnosis; filter syntax; trade-off reasoning
- **Communication (10pts):** Clarity; citations of Wireshark dissection findings

## Discussion Questions
1. Why does MQTT require fewer bytes than HTTP for sensor readings in bandwidth-limited environments? [[1]] [[6]] 
2. How do QoS levels (0/1/2) balance reliability vs. network load for remote farms with intermittent connectivity? [[1]] 
3. Should small-scale Indonesian farmers encrypt MQTT with TLS? What are latency/power costs?
4. Compare DNS reliability (UDP) vs. guaranteed delivery; relevance to IoT device registration?
5. How would you monitor an MQTT broker handling thousands of soil-sensor publishes daily?

## Notes
Free, no licensing required. Adaptable to any IoT case (smart cities, healthcare). Students gain hands-on protocol analysis skills immediately applicable to Indonesia's digital agriculture initiatives [[7]] [[8]].

## Research Sources Returned

1. Mastering MQTT Analysis with Wireshark: A Beginner's Guide | EMQ — https://www.emqx.com/en/blog/mastering-mqtt-analysis-with-wireshark
2. “Mastering IoT Network Analysis with Wireshark: A Comprehensive ... — https://medium.com/@fasateaniket5/mastering-iot-network-analysis-with-wireshark-a-comprehensive-guide-to-monitoring-76c31d3a545b
3. (PDF) The Potential of Smart Farming IoT Implementation for Coffee ... — https://www.researchgate.net/publication/367596093_The_Potential_of_Smart_Farming_IoT_Implementation_for_Coffee_farming_in_Indonesia_A_Systematic_Review
4. The Potential of Smart Farming IoT Implementation for Coffee farming ... — https://tecnoscientifica.com/journal/gisa/article/view/95
5. An AI-Driven System for Learning MQTT Communication Protocols with ... — https://www.mdpi.com/2079-9292/14/24/4967
6. How to use Wireshark for MQTT Analysis: An in-depth guide | Cedalo — https://www.cedalo.com/blog/wireshark-mqtt-guide
7. (PDF) Enhanced IoT Solution System for Smart Agriculture in Indonesia — https://www.researchgate.net/publication/375926610_Enhanced_IoT_Solution_System_for_Smart_Agriculture_in_Indonesia
8. IoT-Based Monitoring System To Support Village Food Security In ... — https://jurnal.itscience.org/index.php/brilliance/article/view/7229
