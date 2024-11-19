function modifySelection() {
    try {
        // const s       = window.getSelection()
        // const tRange  = s.getRangeAt(0)
        // const rect    = tRange.getClientRects()
        // const hls     = new window.Highlighter()
        // const details = hls.fromRange(tRange)

        // chrome.storage.sync.remove("promptData")
        // chrome.storage.sync.set({'promptData': {
        //     text: details.text.replace("\t", ""), 
        //     details,
        //     styleClassName: "yellow-hl",
        //     colorCode: {
        //         id:4,
        //         border: "border-l-yellow-200",
        //         bg: "#FFFAB3",
        //         text: "text-yellow-200",
        //         colorCode: '#FFFAB3',
        //         className: "yellow-hl"
        //       },
        //     box: {
        //         right: rect[0].right,
        //         left: rect[0].left,
        //         top: rect[0].top,
        //         bottom: rect[0].bottom,
        //         width: rect[0].width,
        //         height: rect[0].height,
        //         x: rect[0].x,
        //         y: rect[0].y,
        //     }
        // }})
        // chrome.storage.sync.remove("highlightedData")
        // chrome.storage.sync.set({'highlightedData': {
        //     text: details.text.replace("\t", ""), 
        //     details,
        //     styleClassName: "yellow-hl",
        //     colorCode: {
        //         id:4,
        //         border: "border-l-yellow-200",
        //         bg: "#FFFAB3",
        //         text: "text-yellow-200",
        //         colorCode: '#FFFAB3',
        //         className: "yellow-hl"
        //       },
        //     box: {
        //         right: rect[0].right,
        //         left: rect[0].left,
        //         top: rect[0].top,
        //         bottom: rect[0].bottom,
        //         width: rect[0].width,
        //         height: rect[0].height,
        //         x: rect[0].x,
        //         y: rect[0].y,
        //     }
        // }})
        chrome.storage.sync.remove("textExpanderData")
        chrome.storage.sync.set({'textExpanderData': {
            text: window.getSelection().getRangeAt(0).cloneContents().textContent.trim(),
        }})
        window.getSelection().empty();
        window.panelToggle("?add-prompt", true)
    }
    catch (e) {
        console.log("Error ==>", e)
    }
    
}

modifySelection()