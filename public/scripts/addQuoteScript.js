function setQuoteInformation(){
    chrome.storage.sync.remove("quoteInfo")
    chrome.storage.sync.set({'quoteInfo': {
            text: window.getSelection().getRangeAt(0).cloneContents().textContent.trim(),
    }})
    window.getSelection().empty();
    window.panelToggle("?add-quote", true)
}

setQuoteInformation()