# PROMPTS USED – FlowSpark (A Workflow Builder)

## Master Build Prompt

Build a **production-ready full-stack web app** called **Workflow Builder Lite**.

### Goal
---
Create a clean, minimal app where users can:
- Create workflows (2–4 steps)
- Run workflows on input text
- View output of each step
- See last 5 runs
- View system health/status

### Tech Stack
---
**Frontend**
- React.js
- TypeScript
- TailwindCSS

**Backend**
- Express JS API routes (serverless)
- Node.js runtime
- Mongoose (MongoDB)

**Database**
- MongoDB Atlas

**LLM**
- OpenRouter API via OpenAI SDK
- Model: `stepfun/step-3.5-flash:free`
- Low temperature (0.3)

**Hosting**
- Fully deployable on Vercel  
- No external backend

### Environment Variables
- `AI_INTEGRATIONS_OPENROUTER_BASE_URL`
- `AI_INTEGRATIONS_OPENROUTER_API_KEY`
- `MONGODB_URI`
- Include `.env.example`
- No secrets hardcoded

---

## Core Features

### Workflow
- Name (required)
- Steps (min 2)
- Step types:
  - `clean_text`
  - `summarize`
  - `extract_key_points`
  - `tag_category`
  - `sentiment_analysis`
  - `rewrite_professional_tone`
  - `extract_hashtags`
  - `translate`
  - `extract_entities`
  - `extract_skills`

### Execution Logic

currentText = input

for each step:

if clean_text → local processing 
else → OpenRouter LLM call

save output


### Run History
- Store workflow runs
- Show last 5 runs (latest first)

### Health Endpoint (`/api/health`)
Returns:
```json
{
  "backend": "healthy",
  "database": "connected | error",
  "llm": "connected | error"
}
```

- DB check: mongoose connection
- LLM check: prompt → “Respond with OK only.”

### OpenRouter Integration

- Endpoint: https://openrouter.ai/api/v1
- Helper: callLlm(prompt: string): Promise<string>
- Handle:
    - Errors
    - Timeouts
    - Rate limits
- Return clean text output only

---
## Frontend Pages

- **Home**  
  Navigation links to all sections

- **Create Workflow**  
  Workflow name input, step selector, validation

- **Run Workflow**  
  Workflow selection, text input, step-wise outputs

- **History**  
  Display last 5 workflow runs

- **Status**  
  System health indicators (🟢 healthy / 🔴 error)

---

## Error Handling

- Empty input
- Invalid workflow
- No workflows available
- LLM API failure
- MongoDB connection errors
- Proper HTTP status codes for all failures

---

## Deployment Requirements

- Deployable on **Vercel serverless**
- **MongoDB Atlas** as the only database
- Mongoose connection reuse to prevent multiple connections
- No local file storage
- Build must pass:

  ```bash
  npm install
  npm run dev
  npm run build
  ```