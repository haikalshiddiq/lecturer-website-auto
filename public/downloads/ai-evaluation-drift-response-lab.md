# AI Evaluation Drift Response Lab

## Purpose
Use this worksheet to teach AI release governance as an evidence-based CI/CD decision, not a simple pass/fail habit.

## Scenario
A student team maintains an AI-assisted academic advising prototype. The last approved model version passed the evaluation suite with stable results. A new daily release candidate now shows different behaviour after routine prompt and retrieval-context updates.

| Signal | Previous approved release | Current candidate | Teaching question |
| --- | --- | --- | --- |
| Factual answer score | 91% | 86% | Is this inside the expected tolerance? |
| Refusal quality | 94% | 93% | Is safety stable enough to continue? |
| Citation coverage | 88% | 75% | Could retrieval or formatting have changed? |
| Average response latency | 1.8s | 2.7s | Does the release still meet user expectations? |
| High-risk complaint samples | 1 of 50 | 5 of 50 | Should automation pause before deploy? |

## Student task 1: classify the release decision
Choose one decision and justify it with evidence.

- Continue deployment
- Continue with canary release
- Hold deployment and investigate
- Roll back to the previous approved version

Decision:  
Evidence used:  
Evidence missing:  

## Student task 2: trace likely causes
For each suspected cause, write the verification step and owner.

| Suspected cause | Verification step | Owner | Evidence artifact |
| --- | --- | --- | --- |
| Prompt change |  |  |  |
| Retrieval data change |  |  |  |
| Evaluation dataset change |  |  |  |
| Model/provider change |  |  |  |
| Pipeline/configuration change |  |  |  |

## Student task 3: design the CI/CD gate
Define the minimum gate that would prevent unsafe deployment without blocking normal improvement.

- Required metric threshold:
- Required reviewer or approval note:
- Artifact that must be saved:
- Rollback trigger:
- Post-release observation window:

## Student task 4: write the incident memo
Use five sentences.

1. What changed?
2. Why does it matter to users?
3. What decision did the team make?
4. What evidence supports the decision?
5. What condition allows the next release?

## Facilitator notes
A strong answer does not automatically reject every metric drop. It explains whether the change affects user trust, identifies the weakest evidence path, and ties the release decision to a specific verification or rollback condition.
