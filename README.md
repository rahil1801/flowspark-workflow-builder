# 🧠 FlowSpark - A Workflow Builder App

![FlowSpark Logo](client/public/text-logo.png)

FlowSpark is a **full-stack TypeScript application** for building and executing **text-processing workflows**.  
Design step-by-step pipelines to clean, transform, summarize, extract entities, rewrite tone, and more — powered by LLMs and modular workflow logic.

> Think of it as a **Zapier for text intelligence**, where each step transforms input into richer output.

> [!IMPORTANT]
> Live Project Link-  

## About Me
This link will take you to [ABOUTME.md](ABOUTME.md)

## AI Notes
This link will take you to [AI_NOTES.md](AI_NOTES.md) where all the information related to usage of AI is provided.

## Prompts Used
This link will take you to [PROMPTS_USED.md](PROMPTS_USED.md) where all the information related to prompts that I have used is given.

---

## ✨ Key Features

- 🔧 **Composable Workflows** – Chain multiple text-processing steps  
- ⚡ **Run Engine** – Execute workflows on user-provided input  
- 🧾 **Run History** – Persist and view recent workflow executions  
- 🤖 **LLM-Powered Steps** – Summarization, entity extraction, rewriting  
- 🧹 **Local Processing** – Non-LLM steps like text cleaning run locally  
- ❤️ **Health Checks** – Verify backend, database, and LLM connectivity  
- 🌱 **Seeded Data** – Starter workflows for instant testing  

---

## 🏗️ Tech Stack

### Frontend
- ⚛️ React + Vite  
- 🟦 TypeScript  
- 🎨 Tailwind CSS  
- 🧩 shadcn/ui  

### Backend
- 🚀 Express.js  
- 🟦 TypeScript  

### Database
- 🍃 MongoDB (via Mongoose)

### AI / LLM Integration
- 🤖 OpenAI SDK  
- 🔁 OpenRouter-compatible API endpoint  

---

## 🚀 Getting Started

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Environment Variables

Create a .env file in the project root:

```bash
PORT=5000
NODE_ENV=development

MONGODB_URI=<your mongodb connection string>
AI_INTEGRATIONS_OPENROUTER_BASE_URL=<openrouter base url>
AI_INTEGRATIONS_OPENROUTER_API_KEY=<openrouter api key>
```

### 3️⃣ Start Development Server 
```bash
npm run dev
```

Open your browser at:

```bash
http://localhost:5000
```
(Port may vary depending on your setup.)

### 4️⃣ Production Build & Start
```bash
npm run build
npm run start
```

### ✅ What’s Implemented
---
- Workflow creation and listing
- Step-by-step workflow execution
- Persistent workflow run history
- Health endpoint checking:
- Backend availability
- MongoDB connectivity
- LLM provider status
- Pre-seeded workflows for fast experimentation

### 🚧 What’s Not Implemented (Yet)
---
- 🔐 Authentication & Authorization
- 👥 User / Workspace isolation
- 📊 Advanced observability (logs, metrics, tracing)
- 🧪 Unit, integration & E2E test suites
- 🚦 Rate limiting & abuse protection
- 🔄 CI/CD pipelines & deployment configs

### 📝 Notes
---
- LLM-backed steps require valid API credentials and a reachable provider endpoint.
- The clean_text step executes locally and does not call the LLM.
- Designed with extensibility in mind — new steps can be added with minimal changes.

### 📌 Future Scope
---
- Multi-user workflow collaboration
- Workflow versioning & rollback
- Visual workflow builder
- Background job execution
- Cost tracking per workflow run