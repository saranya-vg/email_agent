/**
 * CONFIGURATION
 * 1. Paste your OpenRouter API Key
 * 2. Choose your model (e.g., "google/gemini-2.0-flash-001" or "openai/gpt-4o-mini")
 */
const OPENROUTER_API_KEY = 'YOUR_OPENROUTER_API_KEY';
const MODEL_ID = 'openai/gpt-4o-mini';  
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const loading = document.getElementById('loading');

/**
 * TOOLS - Fixed to handle both string and object inputs
 */
const Tools = {
    fetchEmails: () => {
        console.log("EXECUTION: fetchEmails called");
        return window.MOCK_EMAILS;
    },

    filterEmails: (args) => {
        const keyword = (args.keyword || args.query || "").toLowerCase();
        console.log(`EXECUTION: filterEmails called for: ${keyword}`);
        return window.MOCK_EMAILS.filter(e => 
            e.subject.toLowerCase().includes(keyword) || 
            e.body.toLowerCase().includes(keyword)
        );
    },

    summarizeEmails: async (args) => {
        console.log("EXECUTION: summarizeEmails called");
        // Logic: if no emails are passed in args, it summarizes everything it 'knows'
        const emails = args.emails || window.MOCK_EMAILS;
        const prompt = `Summarize these emails concisely: ${JSON.stringify(emails)}`;
        return await simpleLLMCall(prompt);
    },

    draftReply: async (args) => {
        console.log("EXECUTION: draftReply called");
        const content = args.emailContent || args.text || "General inquiry";
        const prompt = `Draft a short, professional 2-line reply to this: "${content}"`;
        return await simpleLLMCall(prompt);
    }
};

/**
 * SYSTEM PROMPT - Force structured thinking
 */
const SYSTEM_PROMPT = `You are a professional Email Agent. 
You MUST use tools to see or process data. 

STRICT FORMAT:
THOUGHT: [reasoning]
TOOL: [fetchEmails, filterEmails, summarizeEmails, draftReply, or NONE]
ARGS: {"key": "value"}

If you have all the information, use TOOL: NONE and FINAL_ANSWER: [your response].`;

let conversationHistory = [{ role: "system", content: SYSTEM_PROMPT }];
let isProcessing = false;

async function runAgentLoop(userQuery) {
    if (isProcessing) return;
    isProcessing = true;
    
    conversationHistory.push({ role: "user", content: userQuery });
    appendMessage('user', userQuery);
    userInput.value = '';

    let loopCount = 0;
    while (loopCount < 5) {
        showLoading(true);
        const responseText = await callOpenRouter(conversationHistory);
        showLoading(false);

        // Advanced Regex to capture arguments across multiple lines
        const thoughtMatch = responseText.match(/THOUGHT:\s*([\s\S]*?)(?=TOOL:|$)/i);
        const toolMatch = responseText.match(/TOOL:\s*(\w+)/i);
        const argsMatch = responseText.match(/ARGS:\s*({[\s\S]*?})/i);
        const finalMatch = responseText.match(/FINAL_ANSWER:\s*([\s\S]*)$/i);

        const thought = thoughtMatch ? thoughtMatch[1].trim() : "Processing...";
        const toolName = toolMatch ? toolMatch[1].trim() : "NONE";
        let args = {};
        
        if (argsMatch) {
            try { 
                // Remove potential trailing commas or junk before parsing
                const cleanArgs = argsMatch[1].replace(/,\s*}/, '}');
                args = JSON.parse(cleanArgs); 
            } catch (e) { console.warn("Arg Parse Fail, using empty object"); }
        }

        renderStep(thought, toolName, args);

        if (toolName === "NONE" || finalMatch) {
            const displayMessage = finalMatch ? finalMatch[1].trim() : responseText;
            appendMessage('assistant', displayMessage);
            conversationHistory.push({ role: "assistant", content: responseText });
            break;
        }

        // TOOL EXECUTION
        if (Tools[toolName]) {
            const result = await Tools[toolName](args);
            renderResult(result);
            
            // FEEDBACK LOOP: This is what makes it 'Agentic'
            conversationHistory.push({ role: "assistant", content: responseText });
            conversationHistory.push({ role: "user", content: `TOOL_RESULT: ${JSON.stringify(result)}` });
        } else {
            conversationHistory.push({ role: "user", content: `ERROR: Tool ${toolName} not found.` });
        }
        
        loopCount++;
    }
    isProcessing = false;
}

/**
 * CORE API CALLS
 */
async function callOpenRouter(messages) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL_ID, messages: messages })
    });
    const data = await response.json();
    return data.choices[0].message.content;
}

async function simpleLLMCall(prompt) {
    const response = await callOpenRouter([{ role: "user", content: prompt }]);
    return response;
}

/**
 * UI & EVENT HANDLERS
 */
function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.innerText = text;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function renderStep(thought, tool, args) {
    const div = document.createElement('div');
    div.className = 'step-block';
    div.innerHTML = `<div class="thought">🧠 <b>Thought:</b> ${thought}</div>
                     <div class="tool">🔧 <b>Tool:</b> ${tool}(${JSON.stringify(args)})</div>`;
    chatContainer.appendChild(div);
}

function renderResult(result) {
    const div = document.createElement('div');
    div.className = 'result';
    div.innerHTML = `<pre>${JSON.stringify(result, null, 2).substring(0, 250)}...</pre>`;
    chatContainer.lastElementChild.appendChild(div);
}

function showLoading(show) { loading.className = show ? "" : "hidden"; }

sendBtn.addEventListener('click', () => { if (userInput.value) runAgentLoop(userInput.value); });
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendBtn.click(); });
