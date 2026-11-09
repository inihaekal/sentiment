# 🛡️ Social Intelligence AI Framework

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue?style=flat&logo=python)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

> An enterprise-grade, open-source AI framework designed to detect, analyze, and mitigate malicious digital campaigns, misinformation, and negative sentiment in real-time.

## 🚀 Overview

The **Social Intelligence AI Framework** empowers communities and organizations to safely monitor and mitigate digital crises. By orchestrating a robust pipeline of NLP models, multilingual vector embeddings, and Local LLM Agents, this system automates social listening and intelligent response generation—all while strictly enforcing human-in-the-loop guardrails.

Built primarily to handle highly sensitive issues safely, it ensures that no AI-generated response is ever published without explicit human approval and deterministic safety checks.

## ✨ Key Features

* 🧠 **Agentic AI Pipeline**: Utilizes distinct LLM agents (`Reader`, `Writer`, and `Guard`) to isolate tasks, preventing prompt injection attacks from untrusted public comments.
* 🛡️ **Ironclad AI Safety**: Deterministic rule-engines and sensitive-lexicon fallback systems guarantee that critical or sensitive issues are escalated, never auto-replied.
* 📊 **Multimodal Context & RAG**: Integrates with a Qdrant/pgvector-powered Knowledge Base to generate strictly factual, non-defensive clarifications based on official documents.
* 🌐 **Omnichannel Collectors**: Built-in, rate-limited data collectors for major platforms (Instagram, Facebook, X, YouTube, and News RSS).
* 💻 **Modern Web Console**: A sleek Next.js (App Router) dashboard for real-time KPI tracking, issue triaging, and a streamlined human-approval queue.
* 💸 **Zero-Cost Local First**: Designed to run entirely on local infrastructure using Ollama (quantized models) and Hugging Face Transformers, with modular architecture ready to scale with premium APIs (e.g., OpenAI).

## 🏗️ Architecture & Tech Stack

The platform separates data-heavy AI processing from the web presentation layer to ensure maximum security and scalability.

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Data Workers & AI** | Python 3.11, FastAPI, SQLAlchemy | Runs collectors, IndoBERT sentiment analysis, and LLM Agents. |
| **Web Console** | Next.js 16 (TypeScript), Tailwind, Drizzle | Provides the dashboard, RBAC, and approval console. |
| **Database & Vector** | PostgreSQL 16 + `pgvector` | Stores metrics, agent drafts, and document embeddings. |
| **Alerting** | Telegram Bot API | Delivers real-time critical alerts and quick-approval buttons. |

## 🛡️ Security & Prompt Injection Defense

We treat all public comments as **untrusted input**. 
1. **No Evading**: Scrapers respect platform limits. If blocked, they sleep.
2. **Strict Agent Isolation**: The `Reader` agent only outputs structured JSON classifications. The `Writer` agent generates drafts. The `Guard` agent operates on deterministic rules (not LLM assumptions) to block inappropriate outputs.
3. **Zero Secrets in Frontend**: The Next.js frontend has absolutely no direct database connection or exposed secrets. All mutations pass through strict Server Actions.

## 🛠️ Getting Started

### Prerequisites
* Docker & Docker Compose
* Node.js 20+ & `pnpm`
* Python 3.11+
* Ollama (running locally)

### Quick Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
   cd YOUR_REPO_NAME
