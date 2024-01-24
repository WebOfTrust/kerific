import interact from "interactjs";
import './assets/main.css'

import * as localStorageUtil from './modules/localStorageUtil';

/* 
    Use Immediately Invoked Function Expressions(IIFE): Wrap your entire code in an IIFE.This creates a new scope each time the script is run, preventing variable and function redeclarations. This is a common pattern for bookmarklets and scripts injected into pages.
*/
(function () {
    /*
     * CONFIGURATION
     */

    const glossaryJsonUrl = "https://weboftrust.github.io/WOT-terms/json/external-glosseries/glossaries-combined/all-glossaries.json";

    const versionNumberUrl = "https://weboftrust.github.io/kerific/manifest.json";//TODO: fetch it from local

    /*
     * END CONFIGURATION
     */

    let popUpLedger = [];

    /*
     * Inject CSS
     */

    // Insert https://animate.style/ via CDN
    const animateCss = document.createElement('link');
    animateCss.rel = 'stylesheet';
    animateCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
    document.head.appendChild(animateCss);

    /*
     * END Inject CSS
     */

    // In case the script runs multiple times on the same page, remove all previous popups and highlights
    // Remove all elements with class="kerific-popup" and class="kerific-term-highlight"
    document.querySelectorAll('.kerific-popup').forEach(element => {
        element.remove();
    });
    document.querySelectorAll('.kerific-term-highlight').forEach(element => {
        element.remove();
    });

    // Find every .kerific-match and remove the span around it
    document.querySelectorAll('.kerific-match').forEach(element => {
        element.outerHTML = element.innerHTML;
    }
    );

    // Add loading indicator
    const loadingIndicator = document.createElement('h1');
    loadingIndicator.id = 'loading-indicator';

    // loadingIndicator.style.cssText = cssTextLoadingIndicator;
    loadingIndicator.textContent = 'Loading glossaries…';
    document.body.appendChild(loadingIndicator);

    function removeLinks(htmlString) {
        // Parse the string into a DOM structure
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');

        // Find all <a> elements and replace them with their text content
        const links = doc.querySelectorAll('a');
        links.forEach(link => {
            link.replaceWith(link.textContent);
        });

        // Return the modified HTML as a string
        return doc.body.innerHTML;
    }

    // // Example usage
    // const stringWithLinks = '<p>This is a <a href="https://example.com">link</a> in a string.</p>';
    // const stringWithoutLinks = removeLinks(stringWithLinks);
    // console.log(stringWithoutLinks); // Output: <p>This is a link in a string.</p>

    // Combine JSON objects with identical properties.
    function combineJSONObjects(jsonArray, propertyToCombineBy) {
        const combined = {};

        jsonArray.forEach(item => {
            // Check if the property already exists in the combined object
            if (!combined[item[propertyToCombineBy]]) {
                // If not, initialize it
                combined[item[propertyToCombineBy]] = {
                    [propertyToCombineBy]: item[propertyToCombineBy],
                    anchor: item.anchor,
                    term: item.term,
                    definitions: [...item.definitions]
                };
            } else {
                // If exists, concatenate the anchor and merge the definitions
                combined[item[propertyToCombineBy]].anchor += "-" + item.anchor;
                combined[item[propertyToCombineBy]].definitions = combined[item[propertyToCombineBy]].definitions.concat(item.definitions);
            }
        });

        // Convert the combined object back to an array
        return Object.values(combined);
    }

    let glossaryPopups = new Map();
    let extensionVersionNumber;

    // Fetch and process glossary data
    // First, fetch the version number
    fetch(versionNumberUrl)
        .then(response => response.json())
        .then(versionData => {
            // Process the version data
            extensionVersionNumber = versionData.version;

            // Now that you have the version number, fetch the glossary
            return fetch(glossaryJsonUrl);
        })
        .then(response => response.json())
        .then(glossaries => {
            // Make all combinedGlossaries terms lowercase and join identical terms to one term
            glossaries.forEach(eachTerm => {
                eachTerm.termToLowerCase = eachTerm.term.toLowerCase();
            });

            // Combine JSON objects with identical terms. Needed since terms are now all lowercase.
            let combinedGlossaries = combineJSONObjects(glossaries, "termToLowerCase");

            // Loop through all terms in the glossary
            combinedGlossaries.forEach(combinedGlossariesEntry => {
                // Example glossaryEntry:
                // {
                //   "term": "aal",
                //   "anchor": "h.l6kidod3jk1m",
                //   "definitions": [
                //     {
                //       "organisation": "ToIP",
                //       "definition": "<p class=\"c2\"><span>See: <a href=\"foo\">authenticator surance level</a></p>",
                //       "url": "bar"
                //     }
                //   ]
                // }

                function wrapTextWithTreeWalker(rootElement, string, spanClass) {
                    const escapedString = string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regexPattern = `\\b${escapedString}\\b`;
                    const searchRegex = new RegExp(regexPattern, 'gi');

                    const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT, null, false);

                    let nodesToReplace = [];
                    let node;
                    while ((node = walker.nextNode())) {
                        let matches = [];
                        let match;
                        let lastOffset = 0;

                        while ((match = searchRegex.exec(node.nodeValue)) !== null) {
                            matches.push({
                                start: match.index,
                                end: searchRegex.lastIndex
                            });
                            lastOffset = searchRegex.lastIndex;
                        }

                        if (matches.length > 0) {
                            nodesToReplace.push({ node, matches });
                        }
                    }

                    nodesToReplace.forEach(({ node, matches }) => {
                        let parentNode = node.parentNode;
                        let lastOffset = 0;

                        matches.forEach(match => {
                            // Text before the match
                            if (match.start > lastOffset) {
                                parentNode.insertBefore(document.createTextNode(node.nodeValue.substring(lastOffset, match.start)), node);
                            }

                            // The match
                            const span = document.createElement('span');
                            span.className = spanClass;
                            span.textContent = node.nodeValue.substring(match.start, match.end);
                            parentNode.insertBefore(span, node);

                            lastOffset = match.end;
                        });

                        // Text after the last match
                        if (lastOffset < node.nodeValue.length) {
                            parentNode.insertBefore(document.createTextNode(node.nodeValue.substring(lastOffset)), node);
                        }

                        // Remove the original node
                        parentNode.removeChild(node);
                    });
                }

                wrapTextWithTreeWalker(document.querySelector('body'), combinedGlossariesEntry.termToLowerCase, "kerific-match");
            });

            function createButtonsInContainers() {
                // Find all elements with the class 'kerific-match'
                const matches = document.querySelectorAll('.kerific-match');

                matches.forEach(match => {
                    const text = match.innerText;

                    // Find the nearest ancestor with 'display: block'
                    let parent = match.parentElement;
                    while (parent && getComputedStyle(parent).display !== 'block') {
                        parent = parent.parentElement;
                    }

                    // Initialize uniqueButtons for each container
                    if (!parent.uniqueButtons) {
                        parent.uniqueButtons = {};
                    }

                    // Skip creating a button if one with the same text already exists in this container
                    if (parent.uniqueButtons[text]) {
                        return;
                    }

                    // Create a new button element with the same class
                    const button = document.createElement('button');
                    button.innerText = text;
                    button.className = 'kerific-match';
                    parent.uniqueButtons[text] = button;

                    // Check if the next sibling is a 'kerific-match-buttons-container'
                    let container = parent.nextSibling instanceof HTMLElement && parent.nextSibling.classList.contains('kerific-match-buttons-container')
                        ? parent.nextSibling
                        : null;

                    // Create a new container div if it doesn't exist
                    if (!container) {
                        container = document.createElement('div');
                        container.className = 'kerific-match-buttons-container';
                        parent.parentNode.insertBefore(container, parent.nextSibling);
                    }

                    // Append the button to the container
                    container.appendChild(button);
                });
            }

            createButtonsInContainers();

            return combinedGlossaries
        })
        .then((combinedGlossaries) => {
            handleMatch(combinedGlossaries, extensionVersionNumber)

            // Add glossaryPopups to body
            glossaryPopups.forEach(glossaryPopup => {
                document.body.appendChild(glossaryPopup);
            });

            // Event delegation for term highlights
            document.body.addEventListener('click', function (event) {
                // document.body.addEventListener('mouseover', function (event) {
                // if (event.target.classList.contains('kerific-term-highlight')) {
                if (event.target.classList.contains('kerific-match') && event.target.tagName === 'BUTTON') {
                    let term = event.target.innerText; // Assuming the innerText is the term
                    document.querySelectorAll('.kerific-popup').forEach(popup => {
                        popup.classList.remove('displayBlock');
                    });

                    let uniquId = event.target.innerText;
                    // replace spaces with dashes
                    uniquId = uniquId.replace(/\s+/g, '-').toLowerCase();
                    uniqueClass = 'kerific-popup-' + uniquId;
                    document.querySelector('.' + uniqueClass).classList.remove('displayNone');
                    document.querySelector('.' + uniqueClass).classList.add('displayBlock');
                    document.querySelector('.' + uniqueClass + ' h2').classList.add('animate__pulse');
                    // document.querySelector('.' + uniqueClass).style.display = 'block';
                }
            });

            // Event delegation for closing popups
            document.body.addEventListener('click', function (event) {
                if (event.target.classList.contains('close-cross')) {
                    event.target.parentElement.parentElement.classList.remove('displayBlock');
                }
            });






            document.body.addEventListener('mouseover', function (event) {
                if (event.target.classList.contains('kerific-match')) {
                    document.querySelectorAll('.kerific-match').forEach(match => {
                        if (match.innerText === event.target.innerText) {
                            match.classList.add('kerific-match-show');
                        }
                    })
                }
            });

            document.body.addEventListener('mouseout', function (event) {
                if (event.target.classList.contains('kerific-match')) {
                    document.querySelectorAll('.kerific-match').forEach(match => {
                        if (match.innerText === event.target.innerText) {
                            match.classList.remove('kerific-match-show');
                        }
                    })
                }
            });

            // Draggable configuration
            interact('.kerific-popup').draggable({
                listeners: {
                    move(event) {
                        // Update only the dragged element's position during drag
                        const x = (parseFloat(event.target.getAttribute('data-x')) || 0) + event.dx;
                        const y = (parseFloat(event.target.getAttribute('data-y')) || 0) + event.dy;
                        event.target.style.transform = `translate(${x}px, ${y}px)`;
                        event.target.setAttribute('data-x', x);
                        event.target.setAttribute('data-y', y);
                    },
                    end(event) {
                        // Update all .kerific-popup elements' positions when drag ends
                        const x = parseFloat(event.target.getAttribute('data-x')) || 0;
                        const y = parseFloat(event.target.getAttribute('data-y')) || 0;
                        const popups = document.querySelectorAll('.kerific-popup');
                        popups.forEach(popup => {
                            popup.style.transform = `translate(${x}px, ${y}px)`;
                            popup.setAttribute('data-x', x);
                            popup.setAttribute('data-y', y);
                        });
                    }
                }
            });

            interact('.kerific-popup')
                .resizable({
                    edges: { top: true, left: true, bottom: true, right: true },
                    listeners: {
                        move: function (event) {
                            let { x, y } = event.target.dataset

                            x = (parseFloat(x) || 0) + event.deltaRect.left
                            y = (parseFloat(y) || 0) + event.deltaRect.top

                            Object.assign(event.target.style, {
                                width: `${event.rect.width}px`,
                                height: `${event.rect.height}px`,
                                transform: `translate(${x}px, ${y}px)`
                            })

                            Object.assign(event.target.dataset, { x, y })
                        },
                        end(event) {
                            // Update the size of all .kerific-popup elements when resize ends
                            const width = event.rect.width;
                            const height = event.rect.height;
                            const popups = document.querySelectorAll('.kerific-popup');
                            popups.forEach(popup => {
                                popup.style.width = `${width}px`;
                                popup.style.height = `${height}px`;
                            });
                        }
                    }
                });

            // Hide loading indicator
            loadingIndicator.classList.add('displayNone');
        })

    function handleMatch(combinedGlossaries, extensionVersionNumber) {
        // Find all buttons with the class 'kerific-match' (note that we only search buttons, and not spans with the same class)
        const allKerificButtons = document.querySelectorAll('button.kerific-match');

        // Go through all buttons
        allKerificButtons.forEach(kerificButton => {
            const kerificButtonText = kerificButton.innerText;
            const kerificButtonTextLowercase = kerificButton.innerText.toLowerCase();
            let glossaryPopupHeaderContent = `<h2 class='animate__animated'>“${kerificButtonText}”</h2>`;
            let glossaryPopupBodyContent = ``;

            // Go through all terms in the glossary
            combinedGlossaries.forEach(combinedGlossariesEntry => {
                // If the term in the glossary (to lowercase) is the same as the term found in the button (to lowercase)…
                if (kerificButtonTextLowercase === combinedGlossariesEntry.termToLowerCase && !popUpLedger.includes(kerificButtonTextLowercase)) {
                    let counter = 0;

                    combinedGlossariesEntry.definitions.forEach((glossaryEntryDefinitionsEntry) => {
                        // With redirect after SEE
                        // If the definition contains a link to another term, replace the link with the definition of the other term
                        if (findLinkTextAfterSee(glossaryEntryDefinitionsEntry.definition) !== null) {
                            // Some form of "See" link is present
                            // Go through all terms in the glossary
                            combinedGlossaries.forEach(combinedGlossariesEntry2 => {
                                // If the term in the glossary (to lowercase) is the same as the term found after “See” (to lowercase)…
                                if (combinedGlossariesEntry2.termToLowerCase === findLinkTextAfterSee(glossaryEntryDefinitionsEntry.definition).toLowerCase()) {
                                    // … we have to go through all definitions of that term and add them to the popup
                                    combinedGlossariesEntry2.definitions.forEach((eachDefinitions2) => {
                                        if (eachDefinitions2.organisation === glossaryEntryDefinitionsEntry.organisation) {
                                            counter++;
                                            glossaryPopupBodyContent += `
                                                <h3>${counter}: ${eachDefinitions2.organisation}</h3>
                                                <small>Redirected to: “<strong>${combinedGlossariesEntry2.term}</strong>”:</small>
                                                <div class="definition-block">${removeLinks(eachDefinitions2.definition)}</div>
                                                <hr>
                                            `;
                                        }
                                    });
                                }
                            });
                        } else {
                            counter++;

                            glossaryPopupBodyContent += `
                                <h3>${counter}: ${glossaryEntryDefinitionsEntry.organisation}</h3>
                                <div class="definition-block">${removeLinks(glossaryEntryDefinitionsEntry.definition)}</div>
                                <hr>
                            `;
                        }
                    });

                    glossaryPopupHeaderContent += `<p>${combinedGlossariesEntry.definitions.length} definitions found.</p>`;
                }
            });

            const glossaryPopupContent =
                `
                <div class="card-header p-1" >
                    ${glossaryPopupHeaderContent}
                    <span class="close-cross">✕</span></ >
                </div >
                <div class="card-body">
                    ${glossaryPopupBodyContent}
                </div>
                <div class="card-footer p-1">
                    <small>Kerific version: ${extensionVersionNumber} – More info on <a target='_blank' rel='noopener' href='https://kerisse.org'>kerisse.org</a></small>
                </div>
                `;

            let uniquId = kerificButtonTextLowercase;
            // replace spaces with dashes
            uniquId = uniquId.replace(/\s+/g, '-');
            uniqueClass = 'kerific-popup-' + uniquId;

            let glossaryPopup = document.createElement('div');
            glossaryPopup.innerHTML = glossaryPopupContent;
            glossaryPopup.classList.add('kerific-popup', uniqueClass, 'card', 'p-0');

            // some styling needs to be done inline to get enough specificity
            glossaryPopup.style.cssText = 'display: none; position: fixed !important;top: 10px;left: calc(100vw - 25% - 1em);';

            // glossaryPopup.classList.add('displayNone');
            document.body.appendChild(glossaryPopup);

            popUpLedger.push(kerificButtonTextLowercase);

        });

    } // End function handleMatch()

    // The pattern looks for the occurrence of the word "See" followed by an optional colon and space, then a link enclosed in <a> tags. It captures the text inside the <a> tags and returns it as the result. If there is no match, it returns null.
    function findLinkTextAfterSee(str) {
        const pattern = /See\s?:? ?<.*?<a.*?>(.*?)<\/a>/is;
        const match = pattern.exec(str);
        return match ? match[1] : null;
    }
    // // Example usage:
    // const exampleString = 'Random text See <a href="link.html">Link Text</a> more text';
})();