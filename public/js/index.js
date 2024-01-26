// document.addEventListener('DOMContentLoaded', function () {

// Options page, log button
var logButton = document.getElementById('logButton');
logButton.addEventListener('click', function () {
    console.log("loglog");
    chrome.storage.local.get(['kerificTerms'], function (result) {
        console.log('result: ', result);
        // if (result.kerificTerms) {
        //     console.log('Value currently is ' + result.kerificTerms);
        // } else {
        //     console.log('kerificTerms not found');
        // }
    });
});

// Options page, clear button
var clearButton = document.getElementById('clearButton');
clearButton.addEventListener('click', function () {
    chrome.runtime.sendMessage({ action: "clearStorage" }, function (response) {
        console.log("Response:", response);
    });
});

// });