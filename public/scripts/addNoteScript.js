function setNoteInformation(){
    chrome.storage.sync.remove("noteInfo")
    chrome.storage.sync.set({'noteInfo': {
            text: window.getSelection().getRangeAt(0).cloneContents().textContent.trim(),
    }})
    window.getSelection().empty();
    window.panelToggle("?add-note", true)
}

setNoteInformation()