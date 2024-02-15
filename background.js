chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details.tabId) {
        // First, inject the CSS file
        chrome.scripting.insertCSS({
            target: { tabId: details.tabId },
            files: ['content.css'] // Specify your CSS file here
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error injecting CSS:', chrome.runtime.lastError.message);
            } else {
                console.log("CSS injected successfully");
                // Only attempt to inject the script after the CSS has been injected successfully
                chrome.scripting.executeScript({
                    target: { tabId: details.tabId },
                    files: ['content.js']
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Error injecting script:', chrome.runtime.lastError.message);
                    } else {
                        console.log("Script injected successfully");
                        // Ensure this part runs after the successful injection of content3.js
                        chrome.tabs.sendMessage(details.tabId, { trigger: true });
                    }
                });
            }
        });
    }
}, { url: [{ pathContains: '/lightning/setup/ObjectManager/' }] });

