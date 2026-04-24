/**
 * CONFIGURATION
 * 1. Paste your OpenRouter API Key
 * 2. Choose your model (e.g., "google/gemini-2.0-flash-001" or "openai/gpt-4o-mini")
 */
const OPENROUTER_API_KEY = 'YOUR_OPENROUTER_API_KEY';
const MODEL_ID = 'openai/gpt-4o-mini';  
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * UI ELEMENT SELECTION
 * We select these first so the event listeners have targets.
 */
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const loading = document.getElementById('loading');

/**
 * TOOLS
 */
const Tools = {
    fetchEmails: () => {
        console.log("Action: Fetching all emails...");
        return window.MOCK_EMAILS;
    },

    filterEmails: (args) => {
        const keyword = (args.keyword || "").toLowerCase();
        console.log(`Action: Filtering for "${keyword}"`);
        return window.MOCK_EMAILS.filter(e => 
            e.subject.toLowerCase().includes(keyword) || 
            e.body.toLowerCase().includes(keyword)
        );
    },

    summarizeEmails: async (args) => {
        // Check if the agent actually passed emails; if not, use the global list
        const dataToSummarize = args.emails || args.content || window.MOCK_EMAILS; 
        const stringifiedData = JSON.stringify(dataToSummarize);
        const prompt = `Provide a concise, professional bulleted summary of the following email data. Focus on action items: ${stringifiedData}`;
        return await simpleLLMCall(prompt);
    },

    draftReply: async (args) => {
        // Add args.response to the list of accepted keys
        const content = args.response || args.reply || args.body || args.emailContent || "No content provided";
        
        // Logic fix: If the agent already wrote a good draft, just return it 
        // instead of calling the LLM a second time to "reply to a reply."
        if (content !== "No content provided") {
            return `DRAFT CREATED: ${content}`;
        }
        return "Error: No draft content provided in ARGS.";
        const prompt = `Write a polite 2-line email reply to this: "${content}"`;
        return await simpleLLMCall(prompt);
    }

};

const SYSTEM_PROMPT = `You are a professional Gmail Agent.
You CANNOT see emails unless you call fetchEmails.

STRICT OUTPUT FORMAT:
THOUGHT: [your reasoning]
TOOL: [tool_name or NONE]
ARGS: {"key": "value"}

RULES:
1. ALWAYS use TOOL: fetchEmails first before summarizing or drafting.
2. For summarizeEmails, you MUST pass the fetched data: ARGS: {"emails": [...]}
3. For draftReply, you MUST pass the response text: ARGS: {"response": "your draft text"}
4. DO NOT hallucinate emails. Only use data returned from TOOL_RESULT.
5. If you have the info needed, provide the FINAL_ANSWER.`;

let conversationHistory = [{ role: "system", content: SYSTEM_PROMPT }];

/**
 * AGENT LOOP
 */
async function runAgentLoop(userQuery) {
    conversationHistory.push({ role: "user", content: userQuery });
    let loopCount = 0;

    while (loopCount < 5) {
        showLoading(true);
        const responseText = await callOpenRouter(conversationHistory);
        showLoading(false);

        const thoughtMatch = responseText.match(/THOUGHT:\s*([\s\S]*?)(?=TOOL:|$)/i);
        const toolMatch = responseText.match(/TOOL:\s*([a-zA-Z0-9_]+)/i);
        const argsMatch = responseText.match(/ARGS:\s*(\{[\s\S]*?\})/i);
        const finalMatch = responseText.match(/FINAL_ANSWER:\s*([\s\S]*)$/i);

        const thought = thoughtMatch ? thoughtMatch[1].trim() : "Processing...";
        const cleanToolName = toolMatch ? toolMatch[1].trim() : "NONE";
        const finalAnswer = finalMatch ? finalMatch[1].trim() : null;
        
        let args = {};
        if (argsMatch) {
            try { args = JSON.parse(argsMatch[1].trim()); } catch (e) { console.error("JSON Error"); }
        }

        renderStep(thought, cleanToolName, args);

        if (cleanToolName === "NONE" || finalAnswer) {
            const displayMessage = finalAnswer || responseText.split('FINAL_ANSWER:').pop().trim();
            appendMessage('assistant', displayMessage);
            conversationHistory.push({ role: "assistant", content: responseText });
            break;
        }

        let result;
        if (Tools[cleanToolName]) {
            result = await Tools[cleanToolName](args);
            renderResult(result);
        } else {
            result = `Error: Tool "${cleanToolName}" not recognized.`;
            renderResult(result);
        }

        conversationHistory.push({ role: "assistant", content: responseText });
        conversationHistory.push({ role: "user", content: `TOOL_RESULT: ${JSON.stringify(result)}` });
        loopCount++;
    }
}

/**
 * API HELPERS
 */
async function callOpenRouter(messages) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost",
                "X-Title": "Gmail Agent"
            },
            body: JSON.stringify({ model: MODEL_ID, messages: messages })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.choices[0].message.content;
    } catch (e) {
        console.error("Connection Error:", e);
        return `THOUGHT: Connection failed. TOOL: NONE FINAL_ANSWER: I can't reach OpenRouter. Error: ${e.message}`;
    }
}

async function simpleLLMCall(prompt) {
    return await callOpenRouter([{ role: "user", content: prompt }]);
}

/**
 * UI HELPERS
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
    div.innerHTML = `
        <div class="thought">
            <span style="font-size: 1.2em;">💡</span> 
            <b>Reasoning:</b> ${thought}
        </div>
        <div class="tool">
            <span style="font-size: 1.2em;">🛠️</span> 
            <b>Action:</b> ${tool} 
            <i style="color: #666;">(${JSON.stringify(args)})</i>
        </div>
    `;
    chatContainer.appendChild(div);
}

function renderResult(result) {
    const div = document.createElement('div');
    div.className = 'result';
    div.innerHTML = `📊 <b>Result:</b> <pre>${JSON.stringify(result, null, 2).substring(0, 30000)}...</pre>`;
    chatContainer.lastElementChild.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showLoading(show) {
    loading.className = show ? "" : "hidden";
}

/**
 * EVENT LISTENERS
 */
sendBtn.addEventListener('click', () => {
    const q = userInput.value; 
    if (!q) return;
    appendMessage('user', q); 
    userInput.value = '';
    runAgentLoop(q);
});

userInput.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') sendBtn.click(); 
});