function loadCollections() {
    chrome.storage.local.get(['kerificTerms'], function (result) {
        let domString = '';
        let domStringMarkdown = '';

        if (result.kerificTerms === undefined) {
            domString = '<p>No terms found</p>';
            domStringMarkdown = '<p>No terms found</p>';
        } else {
            const terms = result.kerificTerms.terms;
            for (let i = 0; i < terms.length; i++) {
                // loop through kerificTerms.terms.term and kerificTerms.terms.definition
                // create a list item for each

                domString += `
                <div class="card mb-5">
                    <div class="card-header">
                        <button type="button" class="btn btn-danger btn-sm float-end remove-button" data-term="${terms[i].term}">Remove</button>
                        <h2>${terms[i].term}</h2>
                    </div>
                    <div class="card-body">
                        <p class="card-text">
                        ${terms[i].definition}
                        </p>
                    </div>
                    <div class="card-footer">
                        <p class="card-text">
                            This definition comes from: ${terms[i].organisation}
                        </p>
                    </div>
                </div>
                `;

                domStringMarkdown += `
                <div class="card mb-5">
                    <div class="card-header">
                        <h2>${terms[i].term}</h2>
                    </div>
                    <div class="card-body">
                        <p class="card-text">
                        ${terms[i].definition}
                        </p>
                    </div>
                    <div class="card-footer">
                        <p class="card-text">
                            This definition comes from: ${terms[i].organisation}
                        </p>
                    </div>
                </div>
                `;
            }

            domString += `
            <h2 id="markdownformat">In Markdown-format:</h2>
            <div id="markdown-container"></div>`;
        }
        document.getElementById('container-collection').innerHTML = domString;
        document.getElementById('container-collection-for-markdown').innerHTML = domStringMarkdown;

        const removeButtons = document.querySelectorAll('.remove-button');
        for (var i = 0; i < removeButtons.length; i++) {
            removeButtons[i].addEventListener('click', function () {
                console.log('remove button clicked');
                chrome.runtime.sendMessage({ action: "removeTerm", entry: { term: this.dataset.term } }, function (response) {
                    console.log("Response:", response);
                    loadCollections();
                });
            });
        }

        const turndownService = new TurndownService()
        const markdown = turndownService.turndown(document.getElementById('container-collection-for-markdown'))
        const markdownContainer = document.getElementById('markdown-container');
        markdownContainer.innerHTML = `
            <textarea rows="50" cols="33" class="form-control" id="markdown" rows="3">${markdown}</textarea>
        `;

        markdownContainer.addEventListener('click', function (e) {
            e.target.select();
        });
    });

    chrome.storage.local.get(['role'], function (result) {
        let domStringRole = '';

        switch (result.role) {
            case 'decisionmaker':
                domStringRole = 'Your role: Decision maker';
                break;
            case 'normaluser':
                domStringRole = 'Your role: Normal user';
                break;
            default:
                domStringRole = 'No role found';
                break;
        }

        document.getElementById('container-role').innerHTML = domStringRole;
    });
}

// Log button
var logButton = document.getElementById('logButton');
logButton.addEventListener('click', function () {
    chrome.storage.local.get(['kerificTerms'], function (result) {
        console.log('result: ', result);
        loadCollections();
        // if (result.kerificTerms) {
        //     console.log('Value currently is ' + result.kerificTerms);
        // } else {
        //     console.log('kerificTerms not found');
        // }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    loadCollections();
});

// Clear button
var clearButton = document.getElementById('clearButton');
clearButton.addEventListener('click', function () {
    chrome.runtime.sendMessage({ action: "clearStorage" }, function (response) {
        console.log("Response:", response);
        loadCollections();
    });
});
