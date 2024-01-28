function setRole(role) {
    chrome.runtime.sendMessage({
        action: "setRole",
        role: role

    }, function (response) {
        console.log("Response:", response);
    });
}