function loadCollections() {
    function saveStringToFile(stringToSave, filename) {
        // Step 1: Create a Blob from the string
        const blob = new Blob([stringToSave], { type: 'text/plain' });

        // Step 2: Create a URL for the Blob
        const url = URL.createObjectURL(blob);

        // Step 3: Create an anchor (<a>) element
        const a = document.createElement('a');

        // Step 4: Set the href and download attributes of the anchor
        a.href = url;
        a.download = filename || 'default.txt'; // Default filename if none provided

        // Temporarily add the anchor to the document to trigger the click event
        document.body.appendChild(a);

        // Step 5: Trigger a click on the anchor
        a.click();

        // Clean up by revoking the Blob URL and removing the anchor from the document
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    // Example usage
    // saveStringToFile('Hello, world!', 'example.txt');


    chrome.storage.local.get(['kerificTerms'], function (result) {
        let domString = '';
        let domStringMarkdown = '';
        let domStringFullHTMLpage = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>My custom glossary</title></head><body><h1>My custom glossary</h1>`;
        let jsonTerms = '';

        if (result.kerificTerms === undefined) {
            domString = '<p>No terms found</p>';
            domStringMarkdown = '<p>No terms found</p>';
        } else {
            const terms = result.kerificTerms.terms;
            for (let i = 0; i < terms.length; i++) {
                // loop through kerificTerms.terms.term and kerificTerms.terms.definition
                // create a list item for each

                // If term is copied, add edit button
                let editButton = '';
                terms[i].status === 'copied' ? editButton = `<button type="button" class="me-3 btn btn-warning btn-sm float-end edit-button" data-term="${terms[i].term}" data-uniqueid="${terms[i].uniqueId}">Edit</button><button type="button" class="me-3 btn btn-warning btn-sm float-end save-button" data-term="${terms[i].term}" data-uniqueid="${terms[i].uniqueId}" disabled>Save</button>` : editButton = ``;

                // Add customized message depending on if term is copied or not
                let footerMessage = '';
                terms[i].status === 'copied' ? footerMessage = 'This definition is a copy.' : footerMessage = 'This definition comes from: ' + terms[i].organisation;

                // Add term to domString
                domString += `
                <div class="card mb-5 ${terms[i].status}" data-uniqueid="${terms[i].uniqueId}">
                    <div class="card-header">
                        <button type="button" class="btn btn-sm float-end copy-button" data-term="${terms[i].term}">Copy</button><button type="button" class="btn btn-danger btn-sm float-end remove-button" data-term="${terms[i].term}" data-uniqueid="${terms[i].uniqueId}">Remove</button>${editButton}
                        <h2>${terms[i].term}</h2>
                    </div>
                    <div class="card-body">
                        <p class="card-text">
                        ${terms[i].definition}
                        </p>
                    </div>
                    <div class="card-footer">
                        <p class="card-text">
                            ${footerMessage}
                        </p>
                    </div>
                </div>
                `;

                // Create separate string for markdown
                domStringMarkdown += `
                <div class="card mb-5 ${terms[i].status}">
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
                            ${footerMessage}
                        </p>
                    </div>
                </div>
                `;

                // Create separate string for full HTML page
                domStringFullHTMLpage += `              
                <h2>${terms[i].term}</h2>
                <p class="card-text">
                ${terms[i].definition}
                </p>
                <small class="card-text">
                    ${footerMessage}
                </small>
                `;
            }

            // create string with JSON.stringify(result.kerificTerms.terms)
            jsonTerms = JSON.stringify(result.kerificTerms.terms);

            // Add buttons for markdown select, markdown textarea and save to file
            domString += `
            <button id="select-markdown" type="button" class="btn btn-info btn-sm float-end">Select</button><h2 id="markdownformat">In Markdown-format:</h2>
            
            <div id="markdown-container"></div>

            <button id="save-to-markdown-file-button" type="button" class="btn btn-info btn-sm float-end mt-2">Save Markdown to file</button>
            
            <button id="save-to-full-html-page-file-button" type="button" class="btn btn-info btn-sm float-end mt-2 me-2">Save to html page</button>

            <button id="save-to-json-file-button" type="button" class="btn btn-info btn-sm float-end mt-2 me-2">Save to json page</button>
            `;

            // Add closing tags for full HTML page
            domStringFullHTMLpage += `</body></html>`
        }
        document.getElementById('container-collection').innerHTML = domString;
        document.getElementById('container-collection-for-markdown').innerHTML = domStringMarkdown;

        const removeButtons = document.querySelectorAll('.remove-button');
        for (var i = 0; i < removeButtons.length; i++) {
            removeButtons[i].addEventListener('click', function () {
                console.log('remove button clicked');
                chrome.runtime.sendMessage({ action: "removeTerm", entry: { term: this.dataset.term, uniqueId: this.dataset.uniqueid } }, function (response) {
                    console.log("Response:", response);
                    loadCollections();
                });
            });
        }

        const copyButtons = document.querySelectorAll('.copy-button');
        for (var i = 0; i < copyButtons.length; i++) {
            copyButtons[i].addEventListener('click', function () {
                console.log('copy button clicked');
                chrome.runtime.sendMessage({ action: "copyTerm", entry: { term: this.dataset.term } }, function (response) {
                    console.log("Response:", response);
                    loadCollections();
                });
            });
        }

        const editButtons = document.querySelectorAll('.edit-button');
        for (var i = 0; i < editButtons.length; i++) {
            editButtons[i].addEventListener('click', function () {
                console.log('edit button clicked');

                const editableTextarea = this.closest('.card-header').nextElementSibling;
                editableTextarea.setAttribute('contenteditable', 'true');
                editableTextarea.classList.add('editable');
                editableTextarea.focus();

                document.querySelector(`.save-button[data-uniqueid="${this.dataset.uniqueid}"]`).removeAttribute('disabled');
            });
        }

        const saveButtons = document.querySelectorAll('.save-button');
        for (var i = 0; i < saveButtons.length; i++) {
            saveButtons[i].addEventListener('click', function () {
                console.log('save button clicked');
                const editableTextarea = this.closest('.card-header').nextElementSibling;

                chrome.runtime.sendMessage({ action: "editSaveTerm", entry: { term: this.dataset.term, uniqueId: this.dataset.uniqueid, newValue: DOMPurify.sanitize(editableTextarea.innerHTML) } }, function (response) {
                    console.log("Response:", response);
                    loadCollections();
                });
            });
        }

        const saveToMarkdownFileButton = document.getElementById('save-to-markdown-file-button');
        saveToMarkdownFileButton.addEventListener('click', function () {
            const markdownContainerTextarea = document.querySelector('#markdown-container textarea');
            saveStringToFile(markdownContainerTextarea.value, 'my-custom-glossary.md');
        });

        const saveToFullHTMLFileButton = document.getElementById('save-to-full-html-page-file-button');
        saveToFullHTMLFileButton.addEventListener('click', function () {
            saveStringToFile(domStringFullHTMLpage, 'my-custom-glossary.html');
        });

        const saveToJsonFileButton = document.getElementById('save-to-json-file-button');
        saveToJsonFileButton.addEventListener('click', function () {
            saveStringToFile(jsonTerms, 'my-custom-glossary.json');
        });

        const turndownService = new TurndownService()
        const markdown = turndownService.turndown(document.getElementById('container-collection-for-markdown'))
        const markdownContainer = document.getElementById('markdown-container');
        const selectMarkdownButton = document.getElementById('select-markdown');
        markdownContainer.innerHTML = `
            <textarea rows="15" cols="33" class="form-control" id="markdown" rows="3">${markdown}</textarea>
        `;

        markdownContainer.addEventListener('click', function (e) {
            e.target.select();
        });

        selectMarkdownButton.addEventListener('click', function () {
            const markdownContainerTextarea = document.querySelector('#markdown-container textarea');
            markdownContainerTextarea.select();
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
