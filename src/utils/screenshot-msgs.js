export const sendCaptureVisibleTabToChrome = (tab) => {
  if (tab) {
    window.chrome.tabs.sendMessage(tab.id, {
      id: "CAPTURE_VISIBLE_TAB",
      tabId: tab.id
    })
  }
}

export const sendCaptureSelectionToChrome = (tab) => {
  if (tab) {
    window.chrome.tabs.sendMessage(tab.id, {
      id: "CAPTURE_SELECTION",
      tabId: tab.id
    })
  }
}

export const sendCaptureFullPageToChrome = (tab) => {
  if (tab) {
    window.chrome.tabs.sendMessage(tab.id, {
      id: "CAPTURE_FULL_PAGE",
      tabId: tab.id
    })
  }
}