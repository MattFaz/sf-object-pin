chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details.tabId) {

        chrome.scripting.insertCSS({
            target: { tabId: details.tabId },
            files: ['content.css']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error injecting CSS:', chrome.runtime.lastError.message);
            } else {

                chrome.scripting.executeScript({
                    target: { tabId: details.tabId },
                    files: ['content.js']
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Error injecting script:', chrome.runtime.lastError.message);
                    } else {
                        chrome.tabs.sendMessage(details.tabId, { trigger: true });
                    }
                });
            }
        });
    }
}, { url: [{ pathContains: '/lightning/setup/ObjectManager/' }] });

