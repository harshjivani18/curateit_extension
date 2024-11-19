function setTextExpander(){
    chrome.storage.sync.remove("textExpanderData")
    chrome.storage.sync.set({'textExpanderData': {
            text: window.getSelection().getRangeAt(0).cloneContents().textContent.trim(),
    }})
    window.getSelection().empty();
    window.panelToggle("?add-text-expander", true)
}

setTextExpander()