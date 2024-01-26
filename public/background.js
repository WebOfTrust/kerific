chrome.action.onClicked.addListener((tab) => {
    // Ensure that the tab ID is valid
    if (tab.id) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['assets/index.js']
        });
    }
});

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: "myContextMenu",
        title: "Info Kerific",
        contexts: ["browser_action"]  // Use "browser_action" for toolbar icon
    });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "myContextMenu") {
        // Execute the action you want when the menu item is clicked
        // For example, open a new tab, show a popup, etc.
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "addTerm") {
        // Retrieve data using Chrome Storage API
        chrome.storage.local.get('kerificTerms', function (result) {
            // 'result' is an object with keys as the stored keys
            let existingData = result.kerificTerms || ""; // If no data, default to empty string
            let newData = existingData + "\n" + request.kerificTerms;

            // Store the updated data
            chrome.storage.local.set({ kerificTerms: newData }, function () {
                console.log('Data is stored.');
            });

            // Send a response back
            sendResponse({ response: "Data received" });
        });
        return true; // For asynchronous response


    } else if (request.action === "clearStorage") {
        // Handle clearing storage
        chrome.storage.local.clear(function () {
            var error = chrome.runtime.lastError;
            if (error) {
                console.error(error);
            } else {
                sendResponse({ response: "Storage cleared" });
            }
        });
        return true; // For asynchronous response
    }

    // Return true for asynchronous response, if needed
    // return true;
});
