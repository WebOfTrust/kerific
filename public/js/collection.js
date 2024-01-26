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

                domString += `
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
        }
        document.getElementById('container-collection').innerHTML = domString;
    });
}