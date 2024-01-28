function setRole(role) {
    chrome.runtime.sendMessage({
        action: "setRole",
        role: role

    }, function (response) {
        console.log("Response:", response);
    });
}

// Select the radio buttons
var radio1 = document.getElementById('set-role-1');
var radio2 = document.getElementById('set-role-2');

// Add event listener to the first radio button
radio1.addEventListener('change', function () {
    if (this.checked) {
        console.log('Decision maker selected');
        setRole(this.value);
        console.log('this.value: ', this.value);
        appendAlert('Role is set!', 'success');
    }
});

// Add event listener to the second radio button
radio2.addEventListener('change', function () {
    if (this.checked) {
        console.log('Normal user selected');
        setRole(this.value);
        console.log('this.value: ', this.value);
        appendAlert('Role is set!', 'success');
    }
});

const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
const appendAlert = (message, type) => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible mt-5" role="alert">`,
        `   <div>${message}</div>`,
        '</div>'
    ].join('')

    alertPlaceholder.append(wrapper);

    setTimeout(() => {
        wrapper.remove()
    }, 5000)
}
