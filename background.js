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

            // Check if the term is already in the collection…
            if (existingData.terms.some(obj => obj.term === request.entry.term) === false) {
                // … if not, add the new term and definition
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
                // sendResponse({ response: "Term and definition added" });
                sendResponse({ response: "termAdded" });
            } else {
                // … if so, send a response back without adding the term
                sendResponse({ response: "termNotAdded" });
            }
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
    } else if (request.action === "setRole") {
        sendResponse({ response: "dit is wat ik stuurde" + request.role });

        chrome.storage.local.set({ 'role': request.role }, function (result) {
            console.log();
        });
    }

    // Return true for asynchronous response, if needed
    // return true;
});
