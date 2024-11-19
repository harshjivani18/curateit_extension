if (window.imageDetails) {
    chrome.storage.sync.remove("imageData")
    chrome.storage.sync.set({'imageData': {
        imageSrc: window.imageDetails.srcUrl
    }})
    window.imageDetails = null
    window.panelToggle("?image", true)
}