let previousInput = '';

function sendMessageToBackgroundScript(action: string, data: any) {
    chrome.runtime.sendMessage({ action, ...data });
}

function getCurrentWebsiteLink(): string {
    return window.location.href;
}

function handleInputFocus(event: FocusEvent) {
    const inputField = event.target as HTMLInputElement;
    if(inputField.attributes.getNamedItem('type')?.value === 'password') {
        return;
    }
    const text = inputField.value.trim(); // Trim whitespace from the input
    const websiteLink = getCurrentWebsiteLink();

    if (text !== previousInput) {
        console.log("Text input:", text);
        console.log("Website link:", websiteLink);
        sendMessageToBackgroundScript('saveText', { text, websiteLink });
    }

    previousInput = text;
}

function handleBeforeUnload(event: BeforeUnloadEvent) {
    const inputField = document.activeElement as HTMLInputElement;
    const text = inputField.value.trim(); // Trim whitespace from the input
    const websiteLink = getCurrentWebsiteLink();

    if (text !== previousInput) {
        sendMessageToBackgroundScript('saveText', { text, websiteLink });
    }
}

document.addEventListener("focusout", handleInputFocus, true);
window.addEventListener("beforeunload", handleBeforeUnload);

// Get the current website link
const currentWebsiteLink = window.location.href;

// Retrieve all keys from Chrome Storage
chrome.storage.local.get(null, (data) => {
    // Iterate over the keys
    for (const key in data) {
        // Check if the key includes the current website link
        if (key.includes(currentWebsiteLink)) {
            // Extract the part of the key that corresponds to the current website link
            const keyWithoutTimestamp = key.replace(/-\d+$/, ''); // Remove the timestamp part
            const savedText = data[key];
            console.log(`Saved text for key '${keyWithoutTimestamp}':`, savedText);
        }
    }
});

