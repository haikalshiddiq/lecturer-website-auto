---
title: 'You.com Hands-on Lab: AI Incident Intelligence Dashboard'
summary: 'A 90-minute Information System Management lab where students investigate an Indonesian incident case, evaluate sources, and design an AI-supported incident intelligence dashboard.'
topic: 'Information System Management'
publishedAt: '2026-05-29'
featured: true
tags:
  - information system management
  - incident response
  - dashboard
  - source evaluation
  - you.com
level: Intermediate
format: Guide
---

## Hands-on Lab Draft: AI-powered IT incident intelligence dashboard using real-time web research and source evaluation

**Course:** Information System Management  
**Audience:** undergraduate Information Systems students in Indonesia  
**Generated:** 2026-05-29 17:19:55 UTC  
**You.com query:** `AI-powered IT incident intelligence dashboard using real-time web research and source evaluation practical case study recent examples for Information System Management students`

## Live Search Evidence

1. **GitHub - agamm/awesome-ai-sre: A curated list of 100+ AI-powered ...** (web)
   - Date: 2026-05-21T23:19:33
   - URL: https://github.com/agamm/awesome-ai-sre
   - Context: A curated list of 100+ AI-powered tools, platforms, and resources for Site Reliability Engineering (SRE) — agents, incident management, observability, AIOps, chaos engineering, and more. - agamm/awesome-ai-sre
2. **AI in Incident Management** (web)
   - Date: 2026-04-28T00:00:00
   - URL: https://safetyculture.com/topics/incident-management/ai-in-incident-management
   - Context: Start by evaluating your organization’s existing incident management processes, then identify areas where automation and AI could be beneficial. This may cover incident detection, reporting, and corrective actions. Understanding these gaps will help EHS managers map out where AI can make the most impact in terms of improving safety and compliance. 
3. **All-in-one incident management platform | incident.io** (web)
   - Date: 2026-05-25T15:40:04
   - URL: https://incident.io/
   - Context: Intelligence, context and power at the core of every incident. We’ve transformed how we work by making AI a core part of how we build and what we build.
4. **AI Report Generation: 15 Best Tools, Use Cases & Implementation ...** (web)
   - Date: 2026-05-22T03:01:23
   - URL: https://improvado.io/blog/ai-report-generation
   - Context: HubSpot, Adobe Marketo Engage, and Salesforce Marketing Cloud are recognized for their strong AI-driven analytics and reporting, providing deep insights, customizable dashboards, and real-time performance tracking to effectively optimize marketing campaigns. Platforms such as Microsoft Power BI, Tableau enhanced with Einstein Analytics, and Google 
5. **Learn about Data Security Investigations | Microsoft Learn** (web)
   - Date: 2026-05-01T00:00:00
   - URL: https://learn.microsoft.com/en-us/purview/data-security-investigations
   - Context: Microsoft Purview Data Security Investigations helps cybersecurity teams in your organization use generative artificial intelligence (AI) to analyze and respond to data security incidents, risky insiders, and data breaches. Investigations help you quickly identify risks from sensitive data exposure and more effectively collaborate with your partner

## AI-Generated Lab Plan From You.com Research

# Lab: AI-Powered IT Incident Intelligence Dashboard - Indonesia National Data Center Case Study

## Learning Objectives
1. Evaluate source credibility using MITRE ATT&CK mapping and VERIS frameworks 
2. Analyze real incident data using open-source SIEM tools (Graylog Open, Security Onion)
3. Develop incident intelligence dashboards synthesizing web research with technical data
4. Apply risk assessment to Indonesian critical infrastructure scenarios

## Real-World Scenario
June 2024: Brain Cipher ransomware disabled Indonesia's National Data Center (Surabaya), disrupting 282 government services—immigration, airports, student registration [[1]]. First-half 2025: 3.64 billion hostile incidents tracked nationally [[2]]. Students investigate attack attribution, impact scope, and response gaps.

## 90-Minute Activity Flow

**Phase 1 (20 min): Intelligence Gathering**
- Groups research incident using credibility matrix (source type, publication date, institutional authority)
- Document 5 claims with source evaluation rubric

**Phase 2 (35 min): Dashboard Construction**
- Import sample logs into Graylog Open [[3]] or Security Onion
- Create incident timeline, affected services, attacker tactics (map to MITRE ATT&CK)
- Build visualizations: impact scope, recovery timeline

**Phase 3 (25 min): Gap Analysis & Recommendations**
- Identify detection/response failures using incident response best practices
- Propose controls aligned with Indonesia's Regulation No. 2/2024 (cyber crisis management)

**Phase 4 (10 min): Presentation & Peer Review**

## Deliverables
1. Source credibility matrix (5 sources evaluated)
2. Live dashboard screenshot with 3+ visualizations
3. 2-page incident report (executive summary + recommendations)
4. Peer feedback form

## Assessment Rubric
| Criterion | Excellent | Good | Needs Work |
|-----------|-----------|------|-----------|
| Source evaluation | All sources critically appraised with methodology transparency | Most sources evaluated; some depth | Minimal evaluation; citation only |
| Dashboard design | Clear, actionable visualizations; proper metrics selection | Functional; some visual clarity issues | Missing key incident data |
| Recommendations | Specific, Indonesia context-aware, cost-feasible | General controls identified | Vague or unrealistic |
| Technical execution | Tool proficiency evident; clean workflow | Basic tool use; minor errors | Incomplete setup/errors |

## Discussion Questions
1. Why did Indonesia's 98% data backup failure occur? What system design changes prevent recurrence?
2. How should incident response teams balance speed vs. source verification when using AI-driven web research?
3. What cybersecurity regulations (Regulations 1/2024, 2/2024) should inform dashboard alert thresholds?
4. How can open-source SIEM tools democratize incident response in resource-limited Indonesian organizations?

## Tools (Free/Open-Source)
- Graylog Open [[3]]
- Security Onion (threat hunting, dashboards)
- Google Sheets (source evaluation matrix)
- LibreOffice (report writing)

---
**Classroom Notes:** Group size 3-4; one laptop/group. Pre-download tool; dataset preparation essential. Invites discussion of Indonesia's cyber sovereignty and INA Digital initiative post-incident accountability.

## Research Sources Returned

1. Indonesia’s National Data Centre Ransomware Attack: A Digital ... — https://fulcrum.sg/indonesias-national-data-centre-ransomware-attack-a-digital-governance-failure/
2. Indonesia Needs Offensive Cyber Defence Posture - Australian ... — https://www.internationalaffairs.org.au/australianoutlook/indonesia-needs-offensive-cyber-defence-posture/
3. 10 Open-Source SOC Tools | Wiz — https://www.wiz.io/academy/detection-and-response/open-source-soc-tools
