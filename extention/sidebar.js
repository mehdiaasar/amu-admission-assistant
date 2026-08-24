const apiBaseUrl = "http://127.0.0.1:8000";

const queryInput = document.getElementById("query");
const sendQueryBtn = document.getElementById("sendQuery");
const responseDiv = document.getElementById("response");
const chatHistoryDiv = document.getElementById("chat-history");
const sendSound = new Audio("sounds/send.mp3");

sendQueryBtn.addEventListener("click", async () => {

  sendSound.play(); // 🔊 Play sound

  const query = queryInput.value.trim();
  if (!query) {
    responseDiv.textContent = "Please enter a question.";
    return;
  } 
  responseDiv.textContent = "Loading...";
    await new Promise(requestAnimationFrame);
  try {
    const res = await fetch(`${apiBaseUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: query,
        model: "gpt-4o-mini"
      }) 
    });
    if (!res.ok) {
      throw new Error(`Error: ${res.statusText}`);
    }
    const data = await res.json();
    responseDiv.textContent = "";
    addToChatHistory(query, data.answer || "No answer received.");
    queryInput.value = "";
  } catch (error) {
    responseDiv.textContent = `Error: ${error.message}`;
  }
});



queryInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendSound.play(); // 🔊 Play sound
    sendQueryBtn.click();
  }
});

function parseMarkdown(text) {
  let html = text
    .replace(/&/g, '&amp;') // Encode ampersands
    .replace(/</g, '&lt;')  // Encode less-than
    .replace(/>/g, '&gt;')  // Encode greater-than
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // bold
    .replace(/\*(.+?)\*/g, '<em>$1</em>') // italic
    .replace(/`(.+?)`/g, '<code>$1</code>') // inline code
    .replace(/\n/g, '<br>') // line breaks
    .replace(/^### (.+)$/gm, '<h3>$1</h3>') // h3
    .replace(/^## (.+)$/gm, '<h2>$1</h2>') // h2
    .replace(/^# (.+)$/gm, '<h1>$1</h1>') // h1
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>'); // links
  return html;
}

function decodeHtml(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function addToChatHistory(question, answer) {
  const userBubble = document.createElement("div");
  userBubble.className = "chat-bubble user-bubble";
  userBubble.textContent = question;

  const aiBubble = document.createElement("div");
  aiBubble.className = "chat-bubble ai-bubble";
  aiBubble.innerHTML = parseMarkdown(answer);

  chatHistoryDiv.appendChild(userBubble);
  chatHistoryDiv.appendChild(aiBubble);
  chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;

  saveChatHistory(question, answer);
}

function saveChatHistory(question, answer) {
  chrome.storage.local.get({ chatHistory: [] }, (result) => {
    const chatHistory = result.chatHistory;
    // Sanitize the answer string before saving
    chatHistory.push({ question, answer: answer.replace(/</g, '&lt;').replace(/>/g, '&gt;') });
    chrome.storage.local.set({ chatHistory });
  });
}

function loadChatHistory() {
  chrome.storage.local.get({ chatHistory: [] }, (result) => {
    const chatHistory = result.chatHistory;
    chatHistoryDiv.innerHTML = "";
    chatHistory.forEach(({ question, answer }) => {
      const chatItem = document.createElement("div");
      chatItem.className = "chat-item";

      const questionDiv = document.createElement("div");
      questionDiv.className = "chat-question";
      questionDiv.textContent = "Q: " + question;

      const answerDiv = document.createElement("div");
      answerDiv.className = "chat-answer";
      try {
        answerDiv.innerHTML = "A: " + parseMarkdown(answer);
      } catch (e) {
        console.error("Parse Error:", e);
        answerDiv.textContent = "⚠️ Error rendering answer.";
      }

      chatItem.appendChild(questionDiv);
      chatItem.appendChild(answerDiv);

      chatHistoryDiv.appendChild(chatItem);
    });
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
  });
}

document.addEventListener("DOMContentLoaded", loadChatHistory);
