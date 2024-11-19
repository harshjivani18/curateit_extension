function codeSnippetContext(){
        let selectedText = window.getSelection().getRangeAt(0).cloneContents().textContent.trim()
        if (selectedText === "") {
                const textarea = document.getElementsByTagName("textarea")
                if (textarea.length > 0) {
                        Array.from(textarea).forEach((element) => {
                                if (element.selectionStart !== element.selectionEnd) {
                                        selectedText = element.value.substring(element.selectionStart, element.selectionEnd)
                                }
                        })
                }
        }
        chrome.storage.sync.remove("codeSnippetData")
        chrome.storage.sync.set({'codeSnippetData': {
                code: selectedText,
        }})
        window.getSelection().empty();
        window.panelToggle("?add-code", true)
        // const iframe = document.createElement('iframe'); 
        // iframe.style.background = "white";
        // iframe.style.height = "100%";
        // iframe.style.width = "460px";
        // iframe.style.position = "fixed";
        // iframe.style.top = "0px";
        // iframe.style.right = "0px";
        // iframe.style.zIndex = "9000000000000000000";
        // iframe.style.border = "0px"; 
        // iframe.style.boxShadow = "0 0 0 0.5px rgb(0 0 0 / 15%), 0 0.5px 0 rgb(0 0 0 / 10%), 0 6px 12px rgb(0 0 0 / 10%), 0 10px 20px rgb(0 0 0 / 5%) !important";
        // iframe.setAttribute('id','codeSnippetSidePanelContext')
        // const src = chrome.runtime.getURL("index.html")
        // iframe.src = chrome.runtime.getURL("index.html"+'?codeSnippetPanel')

        // document.body.appendChild(iframe);

        // window.CT_CODE_FRAME = iframe

        // chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
        //     const { type, value } = obj

        //     if (type === "CLOSE_CODE_SNIPPET_PANEL") {
        //         if(iframe.style.width == "460px"){
        //             iframe.style.width="0px";
        //             iframe.remove()
        //         }
        //     }
        // })
}

codeSnippetContext()