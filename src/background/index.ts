// background.ts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);
  if (message.action == 'saveText' && message.text.trim() !== '') {
    console.log(`User typed: ${message.text}`);
    console.log(`Website link: ${message.websiteLink}`);
    // if the message.websiteLink is already in the storage, add current time to the key and add it as a new key-value pair
    // if (message.websiteLink in message) {
    //   console.log('Website link already exists in storage');
    //   chrome.storage.local.set({ [`${message.websiteLink}-${Date.now()}`]: message.text });
    // } else {
      chrome.storage.local.set({ [`${message.websiteLink}-${Date.now()}`]: message.text });
    // }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getCurrentTabUrl') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const url = currentTab.url;
      sendResponse(url);
    });
    return true; // To indicate that we'll be responding asynchronously
  }
});
