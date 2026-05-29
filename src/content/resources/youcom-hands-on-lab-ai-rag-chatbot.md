---
title: 'You.com Hands-on Lab: Responsible RAG Chatbot'
summary: 'A 90-minute Artificial Intelligence lab where students build a citation-aware RAG chatbot for university policy questions and evaluate hallucination risk.'
topic: 'Artificial Intelligence'
publishedAt: '2026-05-29'
featured: true
tags:
  - artificial intelligence
  - rag
  - chatbot
  - responsible ai
  - hallucination
  - you.com
level: Intermediate
format: Guide
---

## Hands-on Lab Draft: Responsible AI lab building a retrieval augmented generation chatbot for university academic policy questions with source citations and hallucination evaluation

**Course:** Artificial Intelligence  
**Audience:** undergraduate Information Systems students in Indonesia  
**Generated:** 2026-05-29 17:23:44 UTC  
**You.com query:** `Responsible AI lab building a retrieval augmented generation chatbot for university academic policy questions with source citations and hallucination evaluation practical case study recent examples for Artificial Intelligence students`

## Live Search Evidence

1. **Retrieval-augmented generation - Wikipedia** (web)
   - Date: 2026-05-29T06:36:40
   - URL: https://en.wikipedia.org/wiki/Retrieval-augmented_generation
   - Context: This method helps reduce AI hallucinations, which have caused chatbots to describe policies that don't exist, or recommend nonexistent legal cases to lawyers that are looking for citations to support their arguments. RAG also reduces the need to retrain LLMs with new data, saving on computational and financial costs. Beyond efficiency gains, RAG al
2. **Introduction - Artificial Intelligence (AI) - LibGuides at University ...** (web)
   - Date: 2026-05-11T00:00:00
   - URL: https://guides.lib.utexas.edu/AI
   - Context: Retrieval augmented generation is a process which allows an LLM to access data or documents relevant to a prompt request before providing a response. This allows the model to go beyond using just the knowledge it was trained with so that it can factor in recent or domain specific information as it formulated a prompt response. This approach can imp
3. **What is RAG (Retrieval Augmented Generation)? | IBM** (web)
   - Date: 2026-05-14T19:52:24
   - URL: https://www.ibm.com/think/topics/retrieval-augmented-generation
   - Context: While RAG can reduce the risk of hallucinations, it cannot make a model error-proof. Chatbots, a common generative AI implementation, answer questions posed by human users. For a chatbot such as ChatGPT to be successful, users need to view its output as trustworthy. RAG models can include citations to the knowledge sources in their external data as
4. **Position: Reliable AI Needs to Externalize Implicit Knowledge: ...** (web)
   - Date: 2026-05-03T18:33:01
   - URL: https://arxiv.org/html/2605.02010v1
   - Context: In knowledge-intensive domains, these failures carry real consequences: AI tops the 2025 health technology hazards list due to risks of false or misleading outputs (ECRI, 2025); even specialized legal AI tools with retrieval augmentation hallucinate in 17–34% of queries (Magesh et al., 2025); and general-purpose LLMs produce legal errors 58–88% of 
5. **What is RAG? - Retrieval-Augmented Generation AI Explained - AWS** (web)
   - Date: 2026-05-27T15:49:23
   - URL: https://aws.amazon.com/what-is/retrieval-augmented-generation/
   - Context: LLMs are a key artificial intelligence (AI) technology powering intelligent chatbots and other natural language processing (NLP) applications. The goal is to create bots that can answer user questions in various contexts by cross-referencing authoritative knowledge sources. Unfortunately, the nature of LLM technology introduces unpredictability in 

## AI-Generated Lab Plan From You.com Research

**RESPONSIBLE RAG CHATBOT LAB: University Policy Assistant**

**Learning Objectives:** Students will (1) build a retrieval-augmented generation (RAG) chatbot using Python, (2) implement source citation mechanisms, (3) evaluate hallucination types (intrinsic/extrinsic), and (4) design bias detection workflows—aligning with Indonesia's 2024 AI Ethics Guidelines emphasizing transparency and accountability. [[1, 2]]

**Scenario:** Create a chatbot answering university academic policies (grading, graduation requirements) using institutional documents, reducing hallucinations by ~40% through RAG vs. baseline LLMs. [[3, 4]]

**90-Minute Flow:**
- Minutes 0–10: Overview of RAG architecture and Indonesia's responsible AI framework
- Minutes 10–35: Build chatbot using Langchain + Ollama (free, local LLM) + university policy PDFs as vector knowledge base
- Minutes 35–55: Implement citation attribution and faithfulness checks
- Minutes 55–75: Test hallucinations; students flag unsupported claims vs. retrieved context
- Minutes 75–90: Demo and group discussion

**Deliverables:** (1) Functional chatbot code, (2) hallucination evaluation report with examples, (3) citation accuracy logs, (4) ethical risk assessment

**Rubric:** Functionality (30%), Citation accuracy (25%), Hallucination detection (25%), Ethical reflection (20%)

**Discussion Questions:** How does RAG enable "evidence-first" decision-making per Indonesia's roadmap? [[5]] What risks remain despite RAG?

## Research Sources Returned

1. Embracing a New Era: How Indonesia Regulates Artificial Intelligence ... — https://intimedia.id/read/embracing-a-new-era-how-indonesia-regulates-artificial-intelligence-ai-with-strong-ethical-guidelines
2. Indonesia Issues Joint Ministerial Decree Establishing AI Use ... — https://babl.ai/indonesia-issues-joint-ministerial-decree-establishing-ai-use-guidelines-for-education/
3. Council Post: How Retrieval-Augmented Generation Could Solve AI’s ... — https://www.forbes.com/councils/forbestechcouncil/2025/06/23/how-retrieval-augmented-generation-could-solve-ais-hallucination-problem/
4. Comprehensive Review of AI Hallucinations: Impacts and Mitigation ... — https://www.preprints.org/manuscript/202505.1405/v1
5. RAG in 2025: From Quick Fix to Core Architecture | by Harsh Kumar ... — https://medium.com/@hrk84ya/rag-in-2025-from-quick-fix-to-core-architecture-9a9eb0a42493
