import * as UI from './ui.js';
import { ANATOMY_DB } from './data.js';
import { MUSCLE_DB } from './muscles_data.js';
import { NERVE_DB } from './nerve_data.js';
import { CARDIO_DB } from './cardio_data.js';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || 'your_api_key_here';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

let chatPanel, chatBtn, closeBtn, messagesContainer, inputField, sendBtn;

export function initAIChat() {
  chatPanel = document.getElementById('ai-chat-panel');
  chatBtn = document.getElementById('ai-chat-btn');
  closeBtn = document.getElementById('ai-chat-close');
  messagesContainer = document.getElementById('ai-chat-messages');
  inputField = document.getElementById('ai-chat-input');
  sendBtn = document.getElementById('ai-chat-send');

  if (!chatPanel) return;

  sendBtn.addEventListener('click', handleSend);
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });
}

function appendMessage(text, type) {
  const div = document.createElement('div');
  div.className = `ai-msg ai-msg-${type}`;
  div.textContent = text;
  messagesContainer.appendChild(div);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return div;
}

async function handleSend() {
  const text = inputField.value.trim();
  if (!text) return;

  inputField.value = '';
  appendMessage(text, 'user');

  const typingIndicator = appendMessage('Дар ҳоли ҷустуҷӯ...', 'typing');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        max_tokens: 300,
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant embedded in a 3D medical anatomy web application called OsteoVis. 
Your goal is to parse the user's natural language request (in Tajik, Russian, or English) and output ONLY a JSON object indicating the target anatomical structure and system.
Available systems: 'skeleton' (bones), 'muscles', 'nerves', 'cardio' (heart, arteries, veins).
Output JSON schema:
{
  "system": "skeleton|muscles|nerves|cardio|none",
  "target_term": "A standard English anatomical name for the requested part (e.g. 'heart', 'femur', 'biceps', 'skull'). Null if conversational.",
  "reply": "A short, friendly reply in the user's language acknowledging the action, e.g. 'Ҳозир дилро нишон медиҳам!' or answering their question."
}`
          },
          { role: 'user', content: text }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content.trim());
    
    typingIndicator.remove();
    appendMessage(result.reply, 'bot');

    if (result.system !== 'none' && result.target_term) {
      execute3DAction(result.system, result.target_term);
    }

  } catch (err) {
    console.error('Groq AI Error:', err);
    typingIndicator.remove();
    appendMessage('Бубахшед, мушкилӣ пеш омад. Лутфан бори дигар кӯшиш кунед.', 'bot');
  }
}

function execute3DAction(system, targetTerm) {
  const term = targetTerm.toLowerCase();

  if (system === 'skeleton' || system === 'bones') {
    const found = ANATOMY_DB.find(b => b.id.toLowerCase().includes(term) || b.name.toLowerCase().includes(term) || b.latinName.toLowerCase().includes(term));
    if (found) {
      UI.switchPanel('bones');
      setTimeout(() => UI.selectBone(found.id), 100);
      return;
    }
  } 
  
  if (system === 'muscles') {
    const found = MUSCLE_DB.find(m => m.id.toLowerCase().includes(term) || m.name.toLowerCase().includes(term));
    if (found) {
      UI.switchPanel('muscles');
      setTimeout(() => UI.selectMuscle(found.id), 100);
      return;
    }
  }

  if (system === 'nerves') {
    const found = NERVE_DB.find(n => n.id.toLowerCase().includes(term) || n.name.toLowerCase().includes(term));
    if (found) {
      UI.switchPanel('nerves');
      setTimeout(() => UI.selectNerve(found.id), 100);
      return;
    }
  }

  if (system === 'cardio') {
    const found = CARDIO_DB.find(c => c.id.toLowerCase().includes(term) || c.name.toLowerCase().includes(term) || c.latinName.toLowerCase().includes(term) || (c.meshKeywords && c.meshKeywords.some(k => k.includes(term))));
    if (found) {
      UI.switchPanel('cardio');
      setTimeout(() => UI.selectCardio(found.id), 100);
      return;
    }
    if (term.includes('heart')) {
      UI.switchPanel('cardio');
      setTimeout(() => UI.selectCardio('cardio_heart'), 100);
      return;
    }
  }

  const allDBs = [
    { db: ANATOMY_DB, sys: 'bones', select: UI.selectBone },
    { db: CARDIO_DB, sys: 'cardio', select: UI.selectCardio },
    { db: NERVE_DB, sys: 'nerves', select: UI.selectNerve },
    { db: MUSCLE_DB, sys: 'muscles', select: UI.selectMuscle }
  ];

  for (let collection of allDBs) {
    const found = collection.db.find(x => x.name.toLowerCase().includes(term) || x.id.toLowerCase().includes(term) || (x.latinName && x.latinName.toLowerCase().includes(term)));
    if (found) {
      UI.switchPanel(collection.sys);
      setTimeout(() => collection.select(found.id), 100);
      return;
    }
  }
}
