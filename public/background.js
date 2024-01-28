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

        // Retrieve the existing data
        chrome.storage.local.get('kerificTerms', function (result) {
            let existingData = result.kerificTerms || { "terms": [] };

            // Add the new term and definition
            existingData.terms.push({
                "term": request.entry.term,
                "definition": request.entry.definition,
                "organisation": request.entry.organisation
            });

            // Store the updated data
            chrome.storage.local.set({ 'kerificTerms': existingData }, function () {
                console.log('Data is updated.');
            });

            // Send a response back
            sendResponse({ response: "Term and definition added" });
        });

        // Keep the message channel open for asynchronous response
        return true;

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