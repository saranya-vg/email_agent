# 📩 AI Email Agent: Reasoning-Based Agentic Workflow

A lightweight, browser-based AI agent that utilizes a **Reasoning-Action (ReAct)** loop to manage emails. Unlike traditional chatbots, this agent "thinks" through user requests, determines which tools are necessary, and observes results to provide accurate, data-driven responses.

---

## 📺 Project Demo
> **[Watch the Demo on YouTube](https://youtu.be/tb46BW7Av-w)**

---

## 🚀 Key Features

- **Agentic Reasoning Loop**: Transparent `THOUGHT -> ACTION -> RESULT` workflow visible in the UI.
- **Email Operations**:
    - **Fetch & Filter**: Dynamically retrieves and searches through email data.
    - **Summarize**: Uses LLM integration to condense messy threads into professional bullet points.
    - **Drafting**: Generates context-aware, polite replies based on specific email content.
- **Smart Key Mapping**: Robust tool definitions that handle varying AI-generated argument keys (e.g., `response`, `body`, `reply`).
- **Modern UI**: Clean interface with specialized styling for reasoning steps and tool outputs.

## ⚠️ Current Limitations

* **Mock Data Dependency**: Operates on a static `emails.js` file; not yet connected to live Gmail API/OAuth2.
* **Token Consumption**: The ReAct loop sends full conversation history with every "thought," increasing token usage as chats grow.
* **Statelessness**: Refreshing the browser clears the conversation history and all generated drafts.
* **Read-Only**: The agent can generate drafts but cannot physically "send" emails to a recipient.

## 🚀 Future Improvements

* **Live Gmail Integration**: Implementing Google OAuth2 to allow the agent to manage real-world inboxes.
* **Calendar Awareness**: Adding a `checkCalendar` tool to allow the agent to verify availability before drafting meeting confirmations.
* **Memory Optimization**: Implementing a sliding-window memory to reduce token costs and handle long-running conversations.
* **Human-in-the-Loop**: Adding a UI feature to allow users to edit and "Approve" drafts before a simulated send.

## 🛠️ Technical Architecture

- **Engine**: Vanilla JavaScript (ES6+)
- **Brain**: OpenRouter API (Default: `openai/gpt-4o-mini`)
- **Styling**: CSS3 with custom variables for easy theme management.
- **Data**: JSON-based mock email database (`emails.js`).

## ⚙️ How to Get Started

1. **Clone the project** to your local machine.
2. **API Key**: Open `script.js` and paste your [OpenRouter API Key](https://openrouter.ai/keys) into the `OPENROUTER_API_KEY` constant.
3. **Run**: Simply open `index.html` in your browser. No server-side setup required.

## 🤖 Example Queries

* *"Summarize my latest emails and find the one about the Pondicherry trip."*
* *"Draft a polite reply to the Data Science interview invitation."*
* *"Check my inbox and tell me if I have any urgent bills due."*

---
*Developed for MLOps and Data Science workflows.*
