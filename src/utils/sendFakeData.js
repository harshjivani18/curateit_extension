export const sendFakeData = async (data, callback) => {
    const tabs        = await window.chrome.tabs.query({ active: true, currentWindow: true })
    if (tabs.length !== 0) {
        window.chrome.tabs.sendMessage(tabs[0].id, { value: data, type: "CT_HIGHLIGHT_DATA" }, callback)   
    }
}

export const getTab = async() => {
    if (window.chrome.tabs) {
        const tabs = await window.chrome.tabs.query({ active: true, currentWindow: true })
        return tabs
    }
    return []
}