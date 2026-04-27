# AI Release Guardrails Module

## Audience
Learners working on AI systems, prompt-based products, and MLOps foundations.

## Teaching objective
Show how AI release discipline extends beyond code passing into evaluation evidence, regression detection, and monitoring design.

## Session structure
1. Compare software CI/CD with AI-aware CI/CD.
2. Define release gates for prompts, models, and safety criteria.
3. Review rollback conditions and post-release monitoring plans.
4. Create a team checklist for trustworthy AI deployment.

## Example quality gates
```yaml
- name: Prompt regression tests
  run: npm run test:prompts
- name: Model threshold check
  run: python scripts/evaluate_model.py --threshold 0.82
```

## Discussion prompts
- When should a model release be blocked?
- What evidence is needed before AI deployment?
- Which monitoring signal matters most in week one after release?
