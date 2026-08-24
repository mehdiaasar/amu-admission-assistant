// background.js

console.log("Background script loaded.");

// Listener for extension icon click
chrome.action.onClicked.addListener((tab) => {
  console.log("Extension icon clicked on tab:", tab.id);
  chrome.sidePanel.open({ windowId: tab.windowId })
    .catch(error => console.error("Failed to open side panel on action click:", error));
});

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "open-admission-bot-sidebar",
    title: "Open Admission Bot",
    contexts: ["all"]
  });
  console.log("Context menu created.");
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "open-admission-bot-sidebar") {
    console.log("Context menu item clicked on tab:", tab.id);
    chrome.sidePanel.open({ windowId: tab.windowId })
      .catch(error => console.error("Failed to open side panel from context menu:", error));
  }
});

// Unified message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "capturePage") {
    // 📸 Capture screenshot
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error("Capture error:", chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log("Screenshot captured successfully!");
        sendResponse({ success: true, screenshot: dataUrl });
      }
    });
    return true; // Required to keep sendResponse async
  }

  return false; // No async response otherwise
});

// --- Optional: Keep service worker alive ---

let lifeline;
keepAlive();

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'keepAlive') {
    lifeline = port;
    setTimeout(keepAliveForced, 295e3);
    port.onDisconnect.addListener(keepAliveForced);
  }
});

function keepAliveForced() {
  lifeline?.disconnect();
  lifeline = null;
  keepAlive();
}

async function keepAlive() {
  if (lifeline) return;
  for (const tab of await chrome.tabs.query({ url: ['http://*/*', 'https://*/*', 'file://*/*'] })) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => chrome.runtime.connect({ name: 'keepAlive' }),
      });
      chrome.tabs.onUpdated.removeListener(retryOnTabUpdate);
      return;
    } catch (e) {
      console.error(`Failed to inject keep-alive script into tab ${tab.id}: ${e.message}`);
    }
  }
  chrome.tabs.onUpdated.addListener(retryOnTabUpdate);
}

async function retryOnTabUpdate(tabId, info, tab) {
  if (info.url && /^(https?|file):/.test(info.url)) {
    keepAlive();
  }
}
