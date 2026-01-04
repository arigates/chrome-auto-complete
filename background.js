chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "fill-form",
        title: "Fill Form",
        contexts: ["page", "editable"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "fill-form") {
        triggerFill(tab.id);
    }
});

// Also listen for messages from Popup "Fill Form" button if we wanted to route through background,
// but Popup sends directly to Content. 
// However, Content needs DATA.
// The previous Content script fetched data from storage: chrome.storage.local.get(...)
// So valid question: Does content script need changing?
// Content script was doing: chrome.storage.local.get(['name', ...]) -> matches flattened keys.
// Now it needs to get { profiles, activeProfileId } and find the right data.

function triggerFill(tabId) {
    chrome.tabs.sendMessage(tabId, { action: "fill_forms" });
}
