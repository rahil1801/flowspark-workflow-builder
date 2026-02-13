# 🤖 AI Notes & Attribution

This project leverages AI thoughtfully as a **productivity and acceleration tool**, while core logic, customization, and validation were implemented and verified manually.

---

## 🧠 How AI Was Used

AI assisted primarily during the **early and documentation phases** of the project:

- 🏗️ Created the **initial skeleton structure** of the application
- 📝 Drafted and organized **repository documentation**
- 🔄 Converted low-level implementation details into **clear setup & run instructions**
- 🗄️ Helped migrate guidance from **PostgreSQL usage to MongoDB Compass setup**
- 📊 Generated a concise **project status summary** (what’s done vs what’s pending)

> AI was used as a *co-pilot*, not a replacement for implementation or verification.

---

## 💡 What I Personally Added & Improved

All of the following were **manually implemented or enhanced**:

- Added multiple advanced workflow steps:
  - `translation`
  - `extract hashtags`
  - `extract skills`
  - and other custom processing steps
- Fixed **Zod validation logic** in the backend to ensure:
  - A workflow must contain **at least 2 selected steps**
- Retained commented code intentionally:
  - To allow evaluators to **inspect thought process and iterations**

---

## 🔍 What Was Manually Verified

The following critical areas were **checked and validated by hand**:

- **NPM scripts** from `package.json`
  - `dev`
  - `build`
  - `start`
  - `check`
- Backend workflow & API behavior:
  - `server/routes.ts`
  - `server/workflowEngine.ts`
- LLM integration:
  - Provider wiring
  - Model configuration
  - Environment-based setup correctness

---

## 🔗 LLM / Provider Configuration

- **SDK Used:** `openai` (npm package)
- **Provider Endpoint:** OpenRouter-compatible base URL  
  (`AI_INTEGRATIONS_OPENROUTER_BASE_URL`, `AI_INTEGRATIONS_OPENROUTER_API_KEY`)
- **Configured Model:**  
  `stepfun/step-3.5-flash:free`

---

## 💡 Why This Model & Provider?

This setup was chosen intentionally for **practical development and demos**:

- Uses a **low-cost / free-tier model**
- Provider details are **environment-driven**, not hardcoded
- Easily swappable for:
  - Higher-end models
  - Different providers
  - Production-grade configurations

This keeps the app:
- Flexible
- Cost-efficient
- Future-proof

---

## Summary

-  AI accelerated scaffolding and documentation
-  Core logic, validation, and enhancements done manually
-  All critical paths verified without automation
-  Designed to be extensible, auditable, and evaluator-friendly