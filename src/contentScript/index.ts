let previousInput: string = '';

// Function to send messages to the background script
function sendMessageToBackgroundScript(action: string, data: any) {
    chrome.runtime.sendMessage({ action, ...data });
}

// Function to get the current website link
function getCurrentWebsiteLink(): string {
    return window.location.href;
}

// Function to handle input focus events
function handleInputFocus(event: FocusEvent) {
    const inputField = event.target as HTMLInputElement;
    if (inputField.attributes.getNamedItem('type')?.value === 'password') {
        return;
    }
    const text: string = inputField.value.trim(); // Trim whitespace from the input
    const websiteLink: string = getCurrentWebsiteLink();

    if (text !== previousInput) {
        console.log("Text input:", text);
        console.log("Website link:", websiteLink);
        sendMessageToBackgroundScript('saveText', { text, websiteLink });
    }

    previousInput = text;
}

// Function to handle before unload events
function handleBeforeUnload(event: BeforeUnloadEvent) {
    const inputField = document.activeElement as HTMLInputElement;
    const text: string = inputField.value.trim(); // Trim whitespace from the input
    const websiteLink: string = getCurrentWebsiteLink();

    if (text !== previousInput) {
        sendMessageToBackgroundScript('saveText', { text, websiteLink });
    }
}

// Function to convert HTML to markdown
function htmlToMarkdown(html: string): string {
    // Basic implementation, consider using a library like turndown.js for more robust conversion
    return html
        .replace(/<h1>(.*?)<\/h1>/g, '# $1\n')
        .replace(/<h2>(.*?)<\/h2>/g, '## $1\n')
        .replace(/<h3>(.*?)<\/h3>/g, '### $1\n')
        .replace(/<p>(.*?)<\/p>/g, '$1\n')
        .replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)')
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '_$1_')
        .replace(/<ul>/g, '\n')
        .replace(/<\/ul>/g, '\n')
        .replace(/<li>(.*?)<\/li>/g, '- $1\n');
}

// Function to convert the current page to markdown and print it
function convertPageToMarkdownAndPrint() {
    const websiteLink: string = getCurrentWebsiteLink();
    const pageTitle: string = document.title;
    const pageContent: string = document.body.innerHTML;
    console.log("Website link:", websiteLink, "Page title:", pageTitle, "Page content:", pageContent);

    // Convert the HTML content to markdown
    const markdownContent: string = htmlToMarkdown(pageContent);

    // Prepare the markdown output
    const markdownOutput: string = `# ${pageTitle}\n\n${markdownContent}\n\n[Source](${websiteLink})`;

    console.log("Markdown output:\n", markdownOutput);

    // Print the markdown output
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write('<pre>' + markdownOutput + '</pre>');
        printWindow.document.close();
        printWindow.print();
    } else {
        console.error("Failed to open a new window for printing.");
    }
}

// Attach event listeners
document.addEventListener("focusout", handleInputFocus, true);
window.addEventListener("beforeunload", handleBeforeUnload);

// Wait for the DOM to be fully loaded before executing the markdown conversion and printing
window.addEventListener('load', () => {
    // Get the current website link
    const currentWebsiteLink: string = window.location.href;

    // Retrieve all keys from Chrome Storage
    chrome.storage.local.get(null, (data) => {
        // Iterate over the keys
        for (const key in data) {
            // Check if the key includes the current website link
            if (key.includes(currentWebsiteLink)) {
                // Extract the part of the key that corresponds to the current website link
                const savedText: string = data[key];
                console.log(`Saved text for key '${key}':`, savedText);
            }
        }
    });

    // Automatically convert the current page to markdown and print it
    convertPageToMarkdownAndPrint();
});
