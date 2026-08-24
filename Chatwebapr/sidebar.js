// // Get references to the DOM elements
// const chatArea = document.getElementById('chat-area');
// const userInput = document.getElementById('user-input');
// const sendButton = document.getElementById('send-button');
// const captureButton = document.getElementById('capture-button'); // Get the new capture button
// // Corrected selector to target buttons within the 'Try asking:' section
// const suggestedButtons = document.querySelectorAll('.pb-2 .suggested-button');



// // --- Function to add a message to the chat area ---
// function addMessage(message, sender = 'bot') {
//     const messageDiv = document.createElement('div');
//     // Use Tailwind classes for layout
//     messageDiv.classList.add('flex', 'mb-4', sender === 'user' ? 'justify-end' : 'justify-start');

//     const contentDiv = document.createElement('div');
//     // Use Tailwind classes for styling and max-width
//     contentDiv.classList.add(
//         'rounded-lg',
//         'p-3',
//         'text-sm',
//         'shadow', // Added shadow for better visual separation
//         sender === 'user' ? 'bg-blue-600' : 'bg-slate-700', // Use slate-700 for bot as per HTML
//         'text-white',
//         'max-w-[85%]' // Use the utility class from your HTML
//     );

//     // Add specific rounded corner class for bot messages
//     if (sender === 'bot') {
//         contentDiv.classList.add('rounded-bl-none');
//     } else {
//          // Add specific rounded corner class for user messages
//         contentDiv.classList.add('rounded-br-none');
//     }

//     // Handle message content that might be HTML (e.g., for captured page content)
//     if (typeof message === 'string') {
//          contentDiv.textContent = message;
//     } else {
//          // If the message is not a string, assume it's structured data or HTML
//          // For displaying captured HTML, you might need a different approach
//          // or just display a confirmation message. For now, display a placeholder.
//          contentDiv.textContent = "[Captured Content Placeholder]";
//          console.log("Captured content:", message); // Log the captured content for debugging
//     }


//     messageDiv.appendChild(contentDiv);
//     chatArea.appendChild(messageDiv);

//     // Scroll to the bottom of the chat area with smooth behavior
//     chatArea.scrollTo({
//         top: chatArea.scrollHeight,
//         behavior: 'smooth'
//     });
// }

// // --- Function to handle sending a message ---
// function sendMessage() {
//     const messageText = userInput.value.trim();
//     if (messageText === '') return; // Don't send empty messages

//     // Add user message to chat
//     addMessage(messageText, 'user');

//     // Clear the input field
//     userInput.value = '';

//     // Simulate bot response (replace with actual API call)
//     simulateBotResponse(messageText);
// }

// // --- Function to simulate a bot response ---
// function simulateBotResponse(userMessage) {
//     // Add a thinking indicator (optional)
//     const thinkingDiv = document.createElement('div');
//     thinkingDiv.classList.add('flex', 'justify-start', 'mb-4', 'thinking');
//     thinkingDiv.innerHTML = `
//         <div class="bg-slate-700 rounded-lg rounded-bl-none p-3 max-w-[85%] text-sm text-slate-400 italic shadow">
//             Thinking...
//         </div>
//     `;
//     chatArea.appendChild(thinkingDiv);
//      chatArea.scrollTo({
//         top: chatArea.scrollHeight,
//         behavior: 'smooth'
//     });


//     // Simulate network delay and response
//     setTimeout(() => {
//         // Remove thinking indicator
//         const thinkingIndicator = chatArea.querySelector('.thinking');
//         if (thinkingIndicator) {
//             chatArea.removeChild(thinkingIndicator);
//         }

//         let botReply = "I'm still under development! I received: '" + userMessage + "'";

//         // Basic keyword matching for demo
//         if (userMessage.toLowerCase().includes("deadline")) {
//             botReply = "The application deadline for the Fall semester is July 15th. For Spring, it's December 1st.";
//         } else if (userMessage.toLowerCase().includes("scholarship")) {
//             botReply = "We offer various merit-based and need-based scholarships. You can find more details on the 'Financial Aid' section of our website.";
//         } else if (userMessage.toLowerCase().includes("program") || userMessage.toLowerCase().includes("course")) {
//             botReply = "We offer a wide range of undergraduate and postgraduate programs. Could you specify which field you're interested in (e.g., Engineering, Arts, Business)?";
//         } else if (userMessage.toLowerCase().includes("hello") || userMessage.toLowerCase().includes("hi")) {
//              botReply = "Hello there! How can I help you with your admission questions today?";
//         }


//         addMessage(botReply, 'bot');
//     }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
// }

// // --- Function to handle capturing the webpage ---
// function captureWebpage() {
//     console.log("Capture button clicked.");
//     // Send a message to the background script to request page capture
//     chrome.runtime.sendMessage({ action: "capturePage" }, (response) => {
//         if (response && response.success) {
//             console.log("Page capture requested successfully.");
//             // Optionally, add a message to the chat indicating the capture is in progress or complete
//             addMessage("Attempting to capture the current page...", 'bot');

//             // If the background script sends the captured content back, handle it here
//             if (response.pageContent) {
//                  console.log("Received captured page content.");
//                  // You can now process or display response.pageContent
//                  // For this example, we'll just log it and add a confirmation message.
//                  addMessage("Page content captured!", 'bot');
//                  // If you want to display the content, you'd need to process response.pageContent
//                  // addMessage(response.pageContent, 'bot'); // Be cautious displaying raw HTML
//             } else if (response.error) {
//                  console.error("Error capturing page:", response.error);
//                  addMessage(`Error capturing page: ${response.error}`, 'bot');
//             }
//         } else {
//             console.error("Failed to request page capture from background script.");
//             addMessage("Failed to request page capture.", 'bot');
//         }
//     });
// }


// // --- Event Listeners ---

// // Send message when Send button is clicked
// sendButton.addEventListener('click', sendMessage);

// // Send message when Enter key is pressed in the input field
// userInput.addEventListener('keypress', (event) => {
//     // Check if the key pressed was 'Enter' (key code 13 is also common but 'Enter' is more readable)
//     if (event.key === 'Enter') {
//         event.preventDefault(); // Prevent default form submission behavior if applicable
//         sendMessage();
//     }
// });

// // Handle clicks on suggested prompts
// suggestedButtons.forEach(button => {
//     button.addEventListener('click', () => {
//         const promptText = button.textContent.trim();
//         userInput.value = promptText; // Put prompt in input
//         // Optionally, send the message automatically after setting the input
//         sendMessage();
//     });
// });

// // Add event listener for the new capture button
// captureButton.addEventListener('click', captureWebpage);


// // --- Initial message and focus ---
// // Add the initial bot message when the sidebar loads
// // You might already have this in your HTML, but adding it here ensures it appears
// // if the HTML is empty initially. Remove the initial message from HTML if using this.
// // addMessage("Hello! I'm the College Admission Assistant. Ask me about deadlines, programs, scholarships, or anything else related to applying!", 'bot');


// // Focus the input field when the sidebar loads
// userInput.focus();

// console.log("sidebar.js loaded.");




// Define API base URL
// const apiBaseUrl = "http://127.0.0.1:8000";

// // Get references to DOM elements
// const chatArea = document.getElementById('chat-area');
// const userInput = document.getElementById('user-input');
// const sendButton = document.getElementById('send-button');
// const captureButton = document.getElementById('capture-button');
// const clearHistoryButton = document.getElementById('clear-history-button');
// const suggestedButtons = document.querySelectorAll('.pb-2 .suggested-button');

// // --- Function to add a message to the chat area ---
// function addMessage(message, sender = 'bot') {
//     const messageDiv = document.createElement('div');
//     messageDiv.classList.add('flex', 'mb-4', sender === 'user' ? 'justify-end' : 'justify-start');

//     const contentDiv = document.createElement('div');
//     contentDiv.classList.add(
//         'rounded-lg',
//         'p-3',
//         'text-sm',
//         'shadow',
//         sender === 'user' ? 'bg-blue-600' : 'bg-slate-700',
//         'text-white',
//         'max-w-[85%]'
//     );

//     if (sender === 'bot') {
//         contentDiv.classList.add('rounded-bl-none', 'animate-fade-in-up'); // 🛠 Add animation class
//     } else {
//         contentDiv.classList.add('rounded-br-none');
//     }

//     contentDiv.textContent = message;
//     messageDiv.appendChild(contentDiv);
//     chatArea.appendChild(messageDiv);

//     chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
// }


// // --- Function to show thinking spinner ---
// function showThinking() {
//     const thinkingDiv = document.createElement('div');
//     thinkingDiv.classList.add('flex', 'justify-start', 'mb-4', 'thinking');
//     thinkingDiv.innerHTML = `
//         <div class="flex items-center space-x-2">
//             <div class="spinner border-2 border-t-2 border-white rounded-full w-4 h-4 animate-spin"></div>
//             <div class="text-sm text-slate-400 italic">Thinking...</div>
//         </div>
//     `;
//     chatArea.appendChild(thinkingDiv);
//     chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
// }

// // --- Function to remove thinking spinner ---
// function removeThinking() {
//     const thinkingIndicator = chatArea.querySelector('.thinking');
//     if (thinkingIndicator) {
//         thinkingIndicator.remove();
//     }
// }

// // --- Function to send message to backend ---
// async function sendMessage() {
//     const messageText = userInput.value.trim();
//     if (messageText === '') return;

//     addMessage(messageText, 'user');
//     userInput.value = '';

//     // Disable input and button
//     userInput.disabled = true;
//     sendButton.disabled = true;

//     showThinking();
//     await new Promise(resolve => setTimeout(resolve, 100)); // Tiny wait for spinner

//     try {
//         const res = await fetch(`${apiBaseUrl}/chat`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ question: messageText, model: "gpt-4o-mini" })
//         });

//         if (!res.ok) {
//             throw new Error(`Server error: ${res.statusText}`);
//         }

//         const data = await res.json();
//         removeThinking();

//         const botReply = data.answer || "No answer received.";
//         await typeTextSlowly(botReply, 'bot');

//         saveChatHistory(messageText, botReply);

//     } catch (error) {
//         removeThinking();
//         addMessage(`⚠️ Error: ${error.message}`, 'bot');
//         alert(`Error: ${error.message}`);
//     } finally {
//         // Re-enable input and button after bot reply
//         userInput.disabled = false;
//         sendButton.disabled = false;
//         userInput.focus();
//     }
// }
// async function typeTextSlowly(text, sender = 'bot') {
//     const messageDiv = document.createElement('div');
//     messageDiv.classList.add('flex', 'mb-4', sender === 'user' ? 'justify-end' : 'justify-start');

//     const contentDiv = document.createElement('div');
//     contentDiv.classList.add(
//         'rounded-lg',
//         'p-3',
//         'text-sm',
//         'shadow',
//         sender === 'user' ? 'bg-blue-600' : 'bg-slate-700',
//         'text-white',
//         'max-w-[85%]'
//     );

//     if (sender === 'bot') {
//         contentDiv.classList.add('rounded-bl-none', 'animate-fade-in-up');
//     } else {
//         contentDiv.classList.add('rounded-br-none');
//     }

//     messageDiv.appendChild(contentDiv);
//     chatArea.appendChild(messageDiv);

//     chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });

//     for (let i = 0; i < text.length; i++) {
//         contentDiv.textContent += text.charAt(i);
//         await new Promise(resolve => setTimeout(resolve, 20)); // Typing speed: 20ms per character
//         chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' }); // Keep scrolling
//     }
// }



// // --- Function to save chat history to chrome.storage.local ---
// function saveChatHistory(question, answer) {
//     chrome.storage.local.get({ chatHistory: [] }, (result) => {
//         const chatHistory = result.chatHistory;
//         chatHistory.push({ question, answer });
//         chrome.storage.local.set({ chatHistory });
//     });
// }

// // --- Function to load chat history on startup ---
// function loadChatHistory() {
//     chrome.storage.local.get({ chatHistory: [] }, (result) => {
//         const chatHistory = result.chatHistory;
//         chatArea.innerHTML = '';
//         chatHistory.forEach(({ question, answer }) => {
//             addMessage(question, 'user');
//             addMessage(answer, 'bot');
//         });
//         chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
//     });
// }

// // --- Function to clear chat history ---
// function clearChatHistory() {
//     if (confirm("Are you sure you want to clear all chat history?")) {
//         chrome.storage.local.set({ chatHistory: [] }, () => {
//             chatArea.innerHTML = '';
//             addMessage("Chat history cleared.", 'bot');
//         });
//     }
// }

// // --- Capture Page (optional if needed) ---
// function captureWebpage() {
//     console.log("Capture button clicked.");
//     chrome.runtime.sendMessage({ action: "capturePage" }, (response) => {
//         if (response && response.success) {
//             addMessage("Page content captured successfully!", 'bot');
//         } else {
//             addMessage("⚠️ Failed to capture page.", 'bot');
//         }
//     });
// }

// // --- Event Listeners ---
// sendButton.addEventListener('click', sendMessage);
// userInput.addEventListener('keypress', (event) => {
//     if (event.key === 'Enter') {
//         event.preventDefault();
//         sendMessage();
//     }
// });

// suggestedButtons.forEach(button => {
//     button.addEventListener('click', () => {
//         const promptText = button.textContent.trim();
//         userInput.value = promptText;
//         sendMessage();
//     });
// });

// captureButton.addEventListener('click', captureWebpage);
// clearHistoryButton.addEventListener('click', clearChatHistory);

// document.addEventListener('DOMContentLoaded', loadChatHistory);
// userInput.focus();

// console.log("Admission Assistant sidebar.js upgraded successfully.");


// Define API base URL
const apiBaseUrl = "http://127.0.0.1:8000";

// Get references to DOM elements
const chatArea = document.getElementById('chat-area');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const captureButton = document.getElementById('capture-button');
const clearHistoryButton = document.getElementById('clear-history-button');
const stopTypingButton = document.getElementById('stop-typing-button');
const suggestedButtons = document.querySelectorAll('.pb-2 .suggested-button');

let typingInterrupted = false;

// Parse Markdown into HTML
function parseMarkdown(text) {
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/- (.+)/g, '<li>$1</li>');
    if (html.includes('<li>')) {
        html = '<ul>' + html + '</ul>'; // Wrap bullet points inside <ul>
    }
    return html;
}

// Function to type parsed HTML slowly
async function typeTextSlowly(text, sender = 'bot') {
    typingInterrupted = false;
    stopTypingButton.style.display = 'block';

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('flex', 'mb-4', sender === 'user' ? 'justify-end' : 'justify-start');

    const contentDiv = document.createElement('div');
    contentDiv.classList.add(
        'rounded-lg',
        'p-3',
        'text-sm',
        'shadow',
        sender === 'user' ? 'bg-blue-600' : 'bg-slate-700',
        'text-white',
        'max-w-[85%]'
    );

    if (sender === 'bot') {
        contentDiv.classList.add('rounded-bl-none', 'animate-fade-in-up');
    } else {
        contentDiv.classList.add('rounded-br-none');
    }

    messageDiv.appendChild(contentDiv);
    chatArea.appendChild(messageDiv);
    chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });

    const parsedHTML = parseMarkdown(text);
    let i = 0;
    while (i < parsedHTML.length) {
        if (typingInterrupted) {
            contentDiv.innerHTML = parsedHTML;
            break;
        }
        contentDiv.innerHTML = parsedHTML.slice(0, i + 1);
        i++;
        await new Promise(resolve => setTimeout(resolve, 15));
        chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
    }

    stopTypingButton.style.display = 'none';
}

// Function to add formatted message instantly
function addFormattedMessage(message, sender = 'bot') {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('flex', 'mb-4', sender === 'user' ? 'justify-end' : 'justify-start');

    const contentDiv = document.createElement('div');
    contentDiv.classList.add(
        'rounded-lg',
        'p-3',
        'text-sm',
        'shadow',
        sender === 'user' ? 'bg-blue-600' : 'bg-slate-700',
        'text-white',
        'max-w-[85%]'
    );

    if (sender === 'bot') {
        contentDiv.classList.add('rounded-bl-none', 'animate-fade-in-up');
        contentDiv.innerHTML = parseMarkdown(message);
    } else {
        contentDiv.classList.add('rounded-br-none');
        contentDiv.textContent = message;
    }

    messageDiv.appendChild(contentDiv);
    chatArea.appendChild(messageDiv);
    chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
}

// Show Thinking Spinner
function showThinking() {
    const thinkingDiv = document.createElement('div');
    thinkingDiv.classList.add('flex', 'justify-start', 'mb-4', 'thinking');
    thinkingDiv.innerHTML = `
        <div class="flex items-center space-x-2">
            <div class="spinner border-2 border-t-2 border-white rounded-full w-4 h-4 animate-spin"></div>
            <div class="text-sm text-slate-400 italic">Thinking...</div>
        </div>
    `;
    chatArea.appendChild(thinkingDiv);
    chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
}

// Remove Thinking Spinner
function removeThinking() {
    const thinkingIndicators = chatArea.querySelectorAll('.thinking');
    thinkingIndicators.forEach(el => el.remove());
}

// Send Message function
// async function sendMessage() {
//     const messageText = userInput.value.trim();
//     if (messageText === '') return;

//     addMessage(messageText, 'user');
//     userInput.value = '';

//     // Disable input and send button
//     userInput.disabled = true;
//     sendButton.disabled = true;

//     showThinking();
//     await new Promise(resolve => setTimeout(resolve, 100));

//     try {
//         // Check if there is a preview image
//         const previewImage = document.getElementById('preview-image');
//         const attachedImage = previewImage.src && previewImage.src.startsWith('data:image')
//             ? previewImage.src
//             : null;

//         if (attachedImage) {
//             const payload = {
//                 question: messageText,
//                 model: "gpt-4o-mini",
//                 image: attachedImage // Include image if exists
//             };
//             const res = await fetch(`${apiBaseUrl}/chat`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(payload)
//             });
//         } else {
//             const res = await fetch(`${apiBaseUrl}/chat`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(payload)
//             });
//         }
//         if (!res.ok) {
//             throw new Error(`Server error: ${res.statusText}`);
//         }

//         const data = await res.json();
//         removeThinking();

//         const botReply = data.answer || "No answer received.";
//         await typeTextSlowly(botReply, 'bot');
//         saveChatHistory(messageText, botReply);

//         // After sending, clear preview
//         if (attachedImage) {
//             previewImage.src = '';
//             document.getElementById('image-preview').style.display = 'none';
//         }

//     } catch (error) {
//         removeThinking();
//         addMessage(`⚠️ Error: ${error.message}`, 'bot');
//         alert(`Error: ${error.message}`);
//     } finally {
//         userInput.disabled = false;
//         sendButton.disabled = false;
//         userInput.focus();
//     }
// }
async function sendMessage() {
    const messageText = userInput.value.trim();
    if (messageText === '') return;

    addMessage(messageText, 'user');
    userInput.value = '';

    userInput.disabled = true;
    sendButton.disabled = true;

    showThinking();
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        const previewImage = document.getElementById('preview-image');
        const attachedImage = previewImage.src && previewImage.src.startsWith('data:image')
            ? previewImage.src
            : null;

        const payload = {
            // session_id: null,
            question: messageText,
            model: "gpt-4o-mini",
            image: attachedImage
        };

        const endpoint = attachedImage ? "/vision-chat" : "/chat";  // Smart switch
        const res = await fetch(`${apiBaseUrl}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`Server error: ${res.statusText}`);
        }

        const data = await res.json();
removeThinking();

let botReply = data.answer || "No answer received.";

// Only Caption Smart Summary
if (data.caption) {
    botReply += "🖼️ Image Caption:";
    botReply += `• ${data.caption}`;
}

await typeTextSlowly(botReply, 'bot');
saveChatHistory(messageText, botReply);

// After sending, clear preview
if (attachedImage) {
    previewImage.src = '';
    document.getElementById('image-preview').style.display = 'none';
}

    } catch (error) {
        removeThinking();
        addMessage(`⚠️ Error: ${error.message}`, 'bot');
        alert(`Error: ${error.message}`);
    } finally {
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus();
    }
}


// Save chat history
function saveChatHistory(question, answer) {
    chrome.storage.local.get({ chatHistory: [] }, (result) => {
        const chatHistory = result.chatHistory;
        chatHistory.push({ question, answer });
        chrome.storage.local.set({ chatHistory });
    });
}

// Load chat history
function loadChatHistory() {
    chrome.storage.local.get({ chatHistory: [] }, (result) => {
        const chatHistory = result.chatHistory;
        chatArea.innerHTML = '';
        chatHistory.forEach(({ question, answer }) => {
            addMessage(question, 'user');
            addFormattedMessage(answer, 'bot');
        });
    });
}

// Clear chat history
function clearChatHistory() {
    if (confirm("Are you sure you want to clear all chat history?")) {
        chrome.storage.local.set({ chatHistory: [] }, () => {
            chatArea.innerHTML = '';
            addMessage("Chat history cleared.", 'bot');
        });
    }
}

// Add message instantly (for user messages)
function addMessage(message, sender = 'bot') {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('flex', 'mb-4', sender === 'user' ? 'justify-end' : 'justify-start');

    const contentDiv = document.createElement('div');
    contentDiv.classList.add(
        'rounded-lg',
        'p-3',
        'text-sm',
        'shadow',
        sender === 'user' ? 'bg-blue-600' : 'bg-slate-700',
        'text-white',
        'max-w-[85%]'
    );

    if (sender === 'bot') {
        contentDiv.classList.add('rounded-bl-none', 'animate-fade-in-up');
    } else {
        contentDiv.classList.add('rounded-br-none');
    }

    contentDiv.textContent = message;
    messageDiv.appendChild(contentDiv);
    chatArea.appendChild(messageDiv);

    chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
}

function captureWebpage() {
    console.log("Capture button clicked.");

    // 1️⃣ Start Loading Spinner
    const originalIcon = captureButton.innerHTML; // Save old button content
    captureButton.disabled = true;
    captureButton.innerHTML = `
      <div class="spinner border-2 border-t-2 border-white rounded-full w-4 h-4 animate-spin"></div>
    `;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
            addMessage("⚠️ Cannot capture screenshots on Chrome internal pages.", 'bot');
            
            // 2️⃣ Stop Loading Spinner
            captureButton.disabled = false;
            captureButton.innerHTML = originalIcon;
            return;
        }

        chrome.runtime.sendMessage({ action: "capturePage" }, (response) => {
            // 2️⃣ Stop Loading Spinner
            captureButton.disabled = false;
            captureButton.innerHTML = originalIcon;

            if (response && response.success) {
                console.log("Screenshot captured!");

                const previewDiv = document.getElementById('image-preview');
                const previewImage = document.getElementById('preview-image');

                previewImage.src = response.screenshot;
                previewImage.style.display = 'block';
                previewDiv.style.display = 'flex';

            } else {
                console.error("Capture failed:", response.error);
                addMessage(`⚠️ Capture failed: ${response.error}`, 'bot');
            }
        });
    });
}

document.getElementById('remove-preview').addEventListener('click', () => {
    const previewDiv = document.getElementById('image-preview');
    const previewImage = document.getElementById('preview-image');
    previewImage.src = '';
    previewDiv.style.display = 'none';
});




// Close fullscreen if clicking outside image
document.addEventListener('click', function(event) {
    const modal = document.getElementById('fullscreen-modal');
    const image = document.getElementById('fullscreen-image');
    if (event.target === modal) {
        modal.style.display = 'none';
        image.src = '';
    }
});

// Open Flask App Button
const navigateToFlaskButton = document.getElementById('navigate-to-flask');

navigateToFlaskButton.addEventListener('click', () => {
    const flaskUrl = "http://127.0.0.1:5000/";  // <-- You will update it based on your Flask URL
    chrome.tabs.create({ url: flaskUrl });
});




// Event listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});
suggestedButtons.forEach(button => {
    button.addEventListener('click', () => {
        const promptText = button.textContent.trim();
        userInput.value = promptText;
        sendMessage();
    });
});
captureButton.addEventListener('click', captureWebpage);
clearHistoryButton.addEventListener('click', clearChatHistory);
stopTypingButton.addEventListener('click', () => { typingInterrupted = true; });

document.addEventListener('DOMContentLoaded', loadChatHistory);
userInput.focus();

console.log("Final corrected sidebar.js with Stop Typing feature loaded!");