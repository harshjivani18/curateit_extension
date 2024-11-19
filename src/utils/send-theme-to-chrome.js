export const sendThemeToChrome = async (isDark, provider, tab) => {
    // 
    if (tab) {
        window.chrome.tabs.sendMessage(tab.id, { id: "UPDATE_THEME", type: isDark ? "CT_DARK_THEME" : "CT_LIGHT_THEME" })   
    }
}

export async function getActiveTabURL() {
    const tabs = await window.chrome.tabs.query({
        currentWindow: true,
        active: true
    });
  
    return tabs[0];
}

export const sendSidebarPositionToChrome = async (position, tab) => {
    if (tab) {
        window.chrome.tabs.sendMessage(tab.id, { id: "UPDATE_SIDEBAR_POSITION", value: position })   
    }
}

export const sendEnableFloatMenuToChrome = async (value, tab) => {
    if (tab) {
        window.chrome.tabs.sendMessage(tab.id, { id: "ENABLE_FLOAT_MENU", value: value })   
    }
}

export const sendEnableFloatImageMenuToChrome = async (value, tab) => {
  if (tab) {
    window.chrome.tabs.sendMessage(tab.id, {
      id: "ENABLE_FLOAT_IMAGE_MENU",
      value: value,
    })
  }
}

export const sendEnableFloatCodeMenuToChrome = async (value, tab) => {
  if (tab) {
    window.chrome.tabs.sendMessage(tab.id, {
      id: "ENABLE_FLOAT_CODE_MENU",
      value: value,
    })
  }
}

export const sendSidebarViewType = async (value, tab) => {
  if (tab) {
    window.chrome.tabs.sendMessage(tab.id, {
      id: "SIDEBAR_VIEW_TYPE",
      value: value,
    })
  }
}


export const sendSocialImportToChrome = async (value, tab) => {
  if (tab) {
    window.chrome.tabs.sendMessage(tab.id, {
      id: "IMPORT_SOCIAL_POSTS",
      value: value,
    })
  }
}

export const getImportType = async (tab) => {
  const importTypePromise = new Promise((resolve, reject) => {
    if (tab) {
      window.chrome.tabs.sendMessage(tab.id, {
        id: "GET_IMPORT_TYPE"
      }, (type) => resolve({type}))
    } else {
      resolve({type: ''})
    }
  })
  return importTypePromise
}