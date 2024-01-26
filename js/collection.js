function loadCollections() {
    chrome.storage.local.get(['kerificTerms'], function (result) {
        let domString = '';

        if (result.kerificTerms === undefined) {
            domString = '<p>No terms found</p>';
        } else {
            const terms = result.kerificTerms.terms;
            for (let i = 0; i < terms.length; i++) {
                // loop through kerificTerms.terms.term and kerificTerms.terms.definition
                // create a list item for each
                domString += `<h2>${terms[i].term}</h2>`;
                domString += `${terms[i].definition}`;
                domString += `<p>${terms[i].organisation}</p>`;
            }
        }
        document.getElementById('container-collection').innerHTML = domString;
    });
}