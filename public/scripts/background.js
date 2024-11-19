let options = {
	deviceScaleFactor: 1,
	format: "png",
	fromSurface: true,
};

let images = []
let prompt = "";

const checkIsUserLoggedIn = async () => {
  const text = await chrome?.storage?.sync.get(["userData"]);

  if (text && text?.userData && text?.userData?.apiUrl) {
    return {
      url: text.userData.apiUrl,
      token: text.userData.token,
      collectionId: text?.userData?.unfilteredCollectionId,
    };
  } else {
    window.panelToggle(`?open-extension`, true);
    return false;
  }
};

const setupDefaultBookmarks = () => {
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    console.log("Default Bookmarks1 ===>", bookmarkTreeNodes);
    chrome.storage.local.set({ defaultBookmarks: bookmarkTreeNodes });
  });
}

// chrome.bookmarks.getTree((bookmarkTreeNodes) => {
  
//   // Process and import bookmarks
//   chrome.tabs.sendMessage(request?.tab, {
//     CAPTURED_SCREEN_SHOT: true,
//     imgSrc: imageBase64,
//   });
// });

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.message === "default-icon") {
    const img = chrome.runtime.getURL("images/default-logo.png")
    chrome.action.setIcon({
      path: img,
      tabId: sender.tab.id,
    });
    sendResponse({ status: "logout" });
  }

  if (request.message === "change-icon") {
    const img = chrome.runtime.getURL("images/tick.png")
    chrome.action.setIcon({
      path: img,
      tabId: sender.tab.id,
    });
    sendResponse({ status: "login" });
  }

  if (request.message === "getTabId") {
    if (sender.tab) {
      sendResponse({ tabId: sender.tab.id });
    }
  }

  if (request?.CAPTURE_PAGE_VISIBLE_PARTS) {
		if (request.offset === 0) images = []
		const imageBase64 = await chrome.tabs.captureVisibleTab(null, {
			format: options.format,
		});
		if (imageBase64) {
			images.push(imageBase64);
		}
		return true;
	}
	if (request.CAPTURED_FULL_PAGE) {
		if (sendResponse) {
			sendResponse([...images]);
		}
		images = [];
	}
	if (request?.OPEN_IMAGE_IN_NEW_TAB && request?.imageData?.imgSrc) {
		chrome.tabs.create(
			{
				active: true,
				url: `captured-image.html?iSrc=${request.imageData.imgSrc}`,
			},
			null
		);
	}
  if (request?.CAPTURE_VISIBLE_TAB) {
		const imageBase64 = await chrome.tabs.captureVisibleTab(null, {
			format: options.format,
		});
		if (imageBase64) {
			chrome.tabs.sendMessage(request?.tab, {
				CAPTURED_SCREEN_SHOT: true,
				imgSrc: imageBase64,
			});
		}
	}

  if (request?.GET_SELECTED_SECTION) {
		chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
			chrome.tabs.captureVisibleTab(
				tab.windowId,
				{ format: options.format },
				(tabImage) => {
					chrome.tabs.sendMessage(tab[0]?.id, {
						SELECTED_SECTION_RES: true,
						args: [
							tabImage,
							request.area,
							request.dpr,
							true,
							options.format,
						],
					});
					return true;
				}
			);
		});
	}

  if (request.message === "setPrompt") {
        prompt = request.prompt;
    } else if (request.message === "getPrompt") {
        sendResponse({ prompt: prompt });
        prompt = ""; // Reset prompt
    }

  if (typeof request === "object" && request.type === "FIND_BOOKMARK" && request.url && request.parentId) {
    chrome.bookmarks.search({ url: request.url, parentId: request.parentId }, (res) => {
      sendResponse(res)
    })
  }

  if (typeof request === "object" && request.type === "CREATE_BOOKMARK" && request.bookmark && request.parentId) {
    chrome.bookmarks.create({ title: request.bookmark.title, url: request.bookmark.url, parentId: request.parentId }, (res) => {
      sendResponse(res)
    })
  }

  if (typeof request === "object" && request.type === "CREATE_BROWSER_FOLDER" && request.title && request.index) {
    chrome.bookmarks.create({ title: request.title, index: request.index }, (res) => {
      sendResponse(res)
    })
  }

  if (typeof request === "object" && request.type === "SEARCH_INDEX_WISE_FOLDER" && request.index && request.title) {
    chrome.bookmarks.search({ index: request.index, title: request.title }, (res) => {
      sendResponse(res)
    })
  }

  // bookmarks change
  
  return true
});

const menuItemClick = (info, tab) => {
  if (info.menuItemId === "addBookmark") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["scripts/bookmark.js"],
    })
  }
  if (info.menuItemId === "askAi") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["scripts/ai-chat-box/ai-popup.js"],
    })
  }
  if (info.menuItemId === "sumarizePage") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["scripts/ai-chat-box/ai-summarize.js"],
    })
  }
  if (info.menuItemId === "addArticle") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["scripts/article.js"],
    })
  }
  if (info.menuItemId === "addAIPrompt" && info.selectionText) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["scripts/ai-prompt.js"],
    })
  }
  if (info.menuItemId === "addHighlight" && info.selectionText) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["scripts/apply-highlight.js"],
    })
  }
  if (info.menuItemId === "addCodeSnippet" && info.selectionText) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["scripts/codeSnippetContext.js"],
    })
  }
  if (info.menuItemId === "speedRead" && info.selectionText) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["scripts/speed-reader/speed-menu-script.js"],
    })
  }
  if (info.menuItemId === "copyLinkToHighlight" && info.selectionText) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["scripts/copy-link-to-highlight.js"],
    })
  }
  if (info.menuItemId === "addImage") {
    chrome.tabs.sendMessage(
      tab.id,
      { type: "UPDATE_IMAGE_INFO", imageDetails: info },
      (res) => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["scripts/imageContext.js"],
        })
      }
    )
  }
  if (info.menuItemId === "addTextExpander") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["scripts/menuTextExpander.js"],
    })
  }
  if (info.menuItemId === "addNote" && info.selectionText) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["scripts/addNoteScript.js"],
    })
  }
  if (info.menuItemId === "addQuote" && info.selectionText) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["scripts/addQuoteScript.js"],
    })
  }

  // if(info.menuItemId === "addHighlight" && info.selectionText){
  //     chrome.scripting.executeScript( {
  //         target: {tabId: tab.id, allFrames: true},
  //         files: ['modify.js'],
  //     });
  //     chrome.storage.sync.set({'siteData': {
  //         urlFromSite: tab.url,
  //         tabIdFromSite: tab.id
  //     }})
  //     let url = chrome.runtime.getURL('index.html')
  //     chrome.windows.create({ url: `${url}?highlights`, width: 480, height: 590, type: "popup", focused: true });
  // }

  // if(info.menuItemId === "addCodeSnippet" && info.selectionText){
  //     chrome.scripting.executeScript( {
  //         target: {tabId: tab.id, allFrames: true},
  //         files: ['codeSnippetContext.js'],
  //     });

  //     chrome.storage.sync.set({'codeSnippetData': {
  //         code: info.selectionText.trim(),
  //     }})

  // }

  return false
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    chrome.tabs.create({
      url: "https://curateit.com/extension-onboarding",
    })
  }
  chrome.contextMenus.create({
    id: "askAi",
    title: "Ask AI",
    contexts: ["all"],
  })

  chrome.contextMenus.create({
    id: "sumarizePage",
    title: "Summarize Page",
    contexts: ["all"],
  })

  chrome.contextMenus.create({
    id: "addBookmark",
    title: "Add Bookmark",
    contexts: ["all"],
  })

  chrome.contextMenus.create({
    id: "addArticle",
    title: "Read Later",
    contexts: ["all"],
  })

  chrome.contextMenus.create({
    id: "addImage",
    title: "Save Image",
    contexts: ["image"],
  })

  chrome.contextMenus.create({
    id: "addHighlight",
    title: "Save Highlight",
    contexts: ["selection"],
  })

  chrome.contextMenus.create({
    id: "addCodeSnippet",
    title: "Save Code",
    contexts: ["selection"],
  })

  chrome.contextMenus.create({
    id: "addNote",
    title: "Save Note",
    contexts: ["selection"],
  })

  chrome.contextMenus.create({
    id: "addQuote",
    title: "Save Quote",
    contexts: ["selection"],
  })

  chrome.contextMenus.create({
    id: "addAIPrompt",
    title: "Save Ai Prompt",
    contexts: ["selection"],
  })

  chrome.contextMenus.create({
    id: "speedRead",
    title: "Speed Reading",
    contexts: ["selection"],
  })

  chrome.contextMenus.create({
    id: "copyLinkToHighlight",
    title: "Copy link to highlight",
    contexts: ["selection"],
  })

  chrome.contextMenus.create({
    id: "addTextExpander",
    title: "Add as Text expander",
    contexts: ["selection"],
  })

  setupDefaultBookmarks()
})

chrome.runtime.setUninstallURL('https://tally.so/r/w5bWqZ')

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, "toggle", (res) => {
    if (chrome.runtime.lastError) {
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('https://chrome.google.com/webstore/') || !tab?.url) {
        chrome.action.setPopup({ tabId: tab.id, popup: 'errorPopup.html' }, () => {
        });
      }
      console.log("Error Happended!", res)
    }
    return true
  })
})

chrome.contextMenus.onClicked.addListener(menuItemClick)


// Listen for the open omni shortcut
chrome.commands.onCommand.addListener(async (command) => {
  console.log("Command ===>",command)
  if (command === "open-omni") {
    const response = await getCurrentTab()
    if (
      !response.url.includes("chrome://") &&
      !response.url.includes("chrome.google.com")
    ) {
      chrome.tabs.sendMessage(response.id, { request: "open-omni" })
    } else {
      chrome.tabs
        .create({
          url: "https://www.google.com/",
        })
        .then(() => {
          newtaburl = response.url
          chrome.tabs.remove(response.id)
        })
    }
    // getCurrentTab().then((response) => {
    //   if (
    //     !response.url.includes("chrome://") &&
    //     !response.url.includes("chrome.google.com")
    //   ) {
    //     chrome.tabs.sendMessage(response.id, { request: "open-omni" })
    //   } else {
    //     chrome.tabs
    //       .create({
    //         url: "https://www.google.com/",
    //       })
    //       .then(() => {
    //         newtaburl = response.url
    //         chrome.tabs.remove(response.id)
    //       })
    //   }
    // })
  }
  else if (command === "new-bookmark") {
    createBookmark();
  }
  else if (command === "full-screenshot") {
    chrome?.storage?.sync.get(["userData"], function (text) {
      if (text && text?.userData && text?.userData?.apiUrl) {
        getCurrentTab().then((response) => {
          chrome.tabs.sendMessage(response.id, { type: "CAPTURE_FULLPAGE_SCREENSHOT" })
        })
      } else {
        createBookmark();
      }
    })
  }
  else if (command === "selected-screenshot") {
    chrome?.storage?.sync.get(["userData"], function (text) {
      if (text && text?.userData && text?.userData?.apiUrl) {
        getCurrentTab().then((response) => {
          chrome.tabs.sendMessage(response.id, { type: "CAPTURE_SCREENSHOT" })
        })
      } else {
        createBookmark();

      }
    })
  }
  else if (command === "create-comment") {
        getCurrentTab().then((response) => {
          chrome.tabs.sendMessage(response.id, { type: "CREATE_FLOATING_COMMENT" })
        })
  }
})

//On tab changed add error popup if invalid urls
chrome.tabs.onActivated.addListener(() => {
  getCurrentTab().then(tab => {
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('https://chrome.google.com/webstore/') || !tab?.url) {
      chrome.action.setPopup({ tabId: tab.id, popup: 'errorPopup.html' });
    }
    chrome.tabs.sendMessage(tab.id, { type: "FETCH_URL_AGAIN" })
  })
})

// Check if tabs have changed and actions need to be fetched again
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('https://chrome.google.com/webstore/') || !tab?.url) {
    chrome.action.setPopup({ tabId: tab.id, popup: 'errorPopup.html' });
  }
  resetOmni()
  chrome.tabs.sendMessage(tabId, { tab_url: tab.url })
})

chrome.tabs.onCreated.addListener((tab) => resetOmni())
chrome.tabs.onRemoved.addListener((tabId, changeInfo) => resetOmni(tabId))

//Backgroudn scripts for omni search
let actions = []
let recentHistory = []
let newtaburl = ""

function getOS() {
  let userAgent = navigator.userAgent.toLowerCase(),
    macosPlatforms = /(macintosh|macintel|macppc|mac68k|macos)/i,
    windowsPlatforms = /(win32|win64|windows|wince)/i,
    iosPlatforms = /(iphone|ipad|ipod)/i,
    os = null

  if (macosPlatforms.test(userAgent)) {
    os = "macos"
  } else if (iosPlatforms.test(userAgent)) {
    os = "ios"
  } else if (windowsPlatforms.test(userAgent)) {
    os = "windows"
  } else if (/android/.test(userAgent)) {
    os = "android"
  } else if (!os && /linux/.test(userAgent)) {
    os = "linux"
  }

  return os
}

// Clear actions and append default ones
const clearActions = () => {
  getCurrentTab().then((response) => {
    actions = []
    // const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isMac = getOS() == "macos" ? true : false
    let muteaction = {
      title: "Mute tab",
      desc: "Mute the current tab",
      type: "action",
      action: "mute",
      emoji: true,
      emojiChar: "🔇",
      keycheck: true,
      keys: ["⌥", "⇧", "M"],
    }
    let pinaction = {
      title: "Pin tab",
      desc: "Pin the current tab",
      type: "action",
      action: "pin",
      emoji: true,
      emojiChar: "📌",
      keycheck: true,
      keys: ["⌥", "⇧", "P"],
    }
    if (response && response?.mutedInfo && response?.mutedInfo?.muted) {
      muteaction = {
        title: "Unmute tab",
        desc: "Unmute the current tab",
        type: "action",
        action: "unmute",
        emoji: true,
        emojiChar: "🔈",
        keycheck: true,
        keys: ["⌥", "⇧", "M"],
      }
    }
    if (response & response?.pinned) {
      pinaction = {
        title: "Unpin tab",
        desc: "Unpin the current tab",
        type: "action",
        action: "unpin",
        emoji: true,
        emojiChar: "📌",
        keycheck: true,
        keys: ["⌥", "⇧", "P"],
      }
    }
    actions = [
      {
        title: "New tab",
        desc: "Open a new tab",
        type: "action",
        action: "new-tab",
        emoji: true,
        emojiChar: "✨",
        keycheck: true,
        keys: ["⌘", "T"],
      },
      {
        title: "Bookmark",
        desc: "Create a bookmark",
        type: "action",
        action: "create-bookmark",
        emoji: true,
        emojiChar: "📕",
        keycheck: true,
        keys: ["⌘", "⇧", "E"],
      },
      pinaction,
      {
        title: "Fullscreen",
        desc: "Make the page fullscreen",
        type: "action",
        action: "fullscreen",
        emoji: true,
        emojiChar: "🖥",
        keycheck: true,
        keys: ["⌘", "Ctrl", "F"],
      },
      muteaction,
      {
        title: "Reload",
        desc: "Reload the page",
        type: "action",
        action: "reload",
        emoji: true,
        emojiChar: "♻️",
        keycheck: true,
        keys: ["⌘", "⇧", "R"],
      },
      {
        title: "Compose email",
        desc: "Compose a new email",
        type: "action",
        action: "email",
        emoji: true,
        emojiChar: "✉️",
        keycheck: true,
        keys: ["⌥", "⇧", "C"],
      },
      {
        title: "Print page",
        desc: "Print the current page",
        type: "action",
        action: "print",
        emoji: true,
        emojiChar: "🖨️",
        keycheck: true,
        keys: ["⌘", "P"],
      },
      {
        title: "New Notion page",
        desc: "Create a new Notion page",
        type: "action",
        action: "url",
        url: "https://notion.new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-notion.png"),
        keycheck: false,
      },
      {
        title: "New Sheets spreadsheet",
        desc: "Create a new Google Sheets spreadsheet",
        type: "action",
        action: "url",
        url: "https://sheets.new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-sheets.png"),
        keycheck: false,
      },
      {
        title: "New Docs document",
        desc: "Create a new Google Docs document",
        type: "action",
        action: "url",
        emoji: false,
        url: "https://docs.new",
        favIconUrl: chrome.runtime.getURL("assets/logo-docs.png"),
        keycheck: false,
      },
      {
        title: "New Slides presentation",
        desc: "Create a new Google Slides presentation",
        type: "action",
        action: "url",
        url: "https://slides.new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-slides.png"),
        keycheck: false,
      },
      {
        title: "New form",
        desc: "Create a new Google Forms form",
        type: "action",
        action: "url",
        url: "https://forms.new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-forms.png"),
        keycheck: false,
      },
      {
        title: "New Medium story",
        desc: "Create a new Medium story",
        type: "action",
        action: "url",
        url: "https://story.new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-medium.png"),
        keycheck: false,
      },
      {
        title: "New GitHub repository",
        desc: "Create a new GitHub repository",
        type: "action",
        action: "url",
        url: "https://github.new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-github.png"),
        keycheck: false,
      },
      {
        title: "New GitHub gist",
        desc: "Create a new GitHub gist",
        type: "action",
        action: "url",
        url: "https://gist.new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-github.png"),
        keycheck: false,
      },
      {
        title: "New CodePen pen",
        desc: "Create a new CodePen pen",
        type: "action",
        action: "url",
        url: "https://pen.new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-codepen.png"),
        keycheck: false,
      },
      {
        title: "New Excel spreadsheet",
        desc: "Create a new Excel spreadsheet",
        type: "action",
        action: "url",
        url: "https://excel.new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-excel.png"),
        keycheck: false,
      },
      {
        title: "New PowerPoint presentation",
        desc: "Create a new PowerPoint presentation",
        type: "action",
        url: "https://powerpoint.new",
        action: "url",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-powerpoint.png"),
        keycheck: false,
      },
      {
        title: "New Word document",
        desc: "Create a new Word document",
        type: "action",
        action: "url",
        url: "https://word.new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-word.png"),
        keycheck: false,
      },
      {
        title: "Create a whiteboard",
        desc: "Create a collaborative whiteboard",
        type: "action",
        action: "url",
        url: "https://whiteboard.new",
        emoji: true,
        emojiChar: "🧑‍🏫",
        keycheck: false,
      },
      {
        title: "Record a video",
        desc: "Record and edit a video",
        type: "action",
        action: "url",
        url: "https://recording.new",
        emoji: true,
        emojiChar: "📹",
        keycheck: false,
      },
      {
        title: "Create a Figma file",
        desc: "Create a new Figma file",
        type: "action",
        action: "url",
        url: "https://figma.new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-figma.png"),
        keycheck: false,
      },
      {
        title: "Create a FigJam file",
        desc: "Create a new FigJam file",
        type: "action",
        action: "url",
        url: "https://figjam.new",
        emoji: true,
        emojiChar: "🖌",
        keycheck: false,
      },
      {
        title: "Hunt a product",
        desc: "Submit a product to Product Hunt",
        type: "action",
        action: "url",
        url: "https://www.producthunt.com/posts/new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-producthunt.png"),
        keycheck: false,
      },
      {
        title: "Make a tweet",
        desc: "Make a tweet on Twitter",
        type: "action",
        action: "url",
        url: "https://twitter.com/intent/tweet",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-twitter.png"),
        keycheck: false,
      },
      {
        title: "Create a playlist",
        desc: "Create a Spotify playlist",
        type: "action",
        action: "url",
        url: "https://playlist.new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-spotify.png"),
        keycheck: false,
      },
      {
        title: "Create a Canva design",
        desc: "Create a new design with Canva",
        type: "action",
        action: "url",
        url: "https://design.new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-canva.png"),
        keycheck: false,
      },
      {
        title: "Create a new podcast episode",
        desc: "Create a new podcast episode with Anchor",
        type: "action",
        action: "url",
        url: "https://episode.new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-anchor.png"),
        keycheck: false,
      },
      {
        title: "Edit an image",
        desc: "Edit an image with Adobe Photoshop",
        type: "action",
        action: "url",
        url: "https://photo.new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-photoshop.png"),
        keycheck: false,
      },
      {
        title: "Convert to PDF",
        desc: "Convert a file to PDF",
        type: "action",
        action: "url",
        url: "https://pdf.new",
        emoji: true,
        emojiChar: "📄",
        keycheck: false,
      },
      {
        title: "Scan a QR code",
        desc: "Scan a QR code with your camera",
        type: "action",
        action: "url",
        url: "https://scan.new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-qr.png"),
        keycheck: false,
      },
      {
        title: "Add a task to Asana",
        desc: "Create a new task in Asana",
        type: "action",
        action: "url",
        url: "https://task.new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-asana.png"),
        keycheck: false,
      },
      {
        title: "Add an issue to Linear",
        desc: "Create a new issue in Linear",
        type: "action",
        action: "url",
        url: "https://linear.new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-linear.png"),
        keycheck: false,
      },
      {
        title: "Add a task to WIP",
        desc: "Create a new task in WIP",
        type: "action",
        action: "url",
        url: "https://todo.new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-wip.png"),
        keycheck: false,
      },
      {
        title: "Create an event",
        desc: "Add an event to Google Calendar",
        type: "action",
        action: "url",
        url: "https://cal.new",
        emoji: false,
        favIconUrl: chrome.runtime.getURL("assets/logo-calendar.png"),
        keycheck: false,
      },
      {
        title: "Add a note",
        desc: "Add a note to Google Keep",
        type: "action",
        action: "url",
        emoji: false,
        url: "https://note.new",
        favIconUrl: chrome.runtime.getURL("assets/logo-keep.png"),
        keycheck: false,
      },
      {
        title: "New meeting",
        desc: "Start a Google Meet meeting",
        type: "action",
        action: "url",
        emoji: false,
        url: "https://meet.new",
        favIconUrl: chrome.runtime.getURL("assets/logo-meet.png"),
        keycheck: false,
      },
      {
        title: "Browsing history",
        desc: "Browse through your browsing history",
        type: "action",
        action: "history",
        emoji: true,
        emojiChar: "🗂",
        keycheck: true,
        keys: ["⌘", "Y"],
      },
      {
        title: "Incognito mode",
        desc: "Open an incognito window",
        type: "action",
        action: "incognito",
        emoji: true,
        emojiChar: "🕵️",
        keycheck: true,
        keys: ["⌘", "⇧", "N"],
      },
      {
        title: "Downloads",
        desc: "Browse through your downloads",
        type: "action",
        action: "downloads",
        emoji: true,
        emojiChar: "📦",
        keycheck: true,
        keys: ["⌘", "⇧", "J"],
      },
      {
        title: "Extensions",
        desc: "Manage your Chrome Extensions",
        type: "action",
        action: "extensions",
        emoji: true,
        emojiChar: "🧩",
        keycheck: false,
        keys: ["⌘", "D"],
      },
      {
        title: "Chrome settings",
        desc: "Open the Chrome settings",
        type: "action",
        action: "settings",
        emoji: true,
        emojiChar: "⚙️",
        keycheck: true,
        keys: ["⌘", ","],
      },
      {
        title: "Scroll to bottom",
        desc: "Scroll to the bottom of the page",
        type: "action",
        action: "scroll-bottom",
        emoji: true,
        emojiChar: "👇",
        keycheck: true,
        keys: ["⌘", "↓"],
      },
      {
        title: "Scroll to top",
        desc: "Scroll to the top of the page",
        type: "action",
        action: "scroll-top",
        emoji: true,
        emojiChar: "👆",
        keycheck: true,
        keys: ["⌘", "↑"],
      },
      {
        title: "Go back",
        desc: "Go back in history for the current tab",
        type: "action",
        action: "go-back",
        emoji: true,
        emojiChar: "👈",
        keycheck: true,
        keys: ["⌘", "←"],
      },
      {
        title: "Go forward",
        desc: "Go forward in history for the current tab",
        type: "action",
        action: "go-forward",
        emoji: true,
        emojiChar: "👉",
        keycheck: true,
        keys: ["⌘", "→"],
      },
      {
        title: "Duplicate tab",
        desc: "Make a copy of the current tab",
        type: "action",
        action: "duplicate-tab",
        emoji: true,
        emojiChar: "📋",
        keycheck: true,
        keys: ["⌥", "⇧", "D"],
      },
      {
        title: "Close tab",
        desc: "Close the current tab",
        type: "action",
        action: "close-tab",
        emoji: true,
        emojiChar: "🗑",
        keycheck: true,
        keys: ["⌘", "W"],
      },
      {
        title: "Close window",
        desc: "Close the current window",
        type: "action",
        action: "close-window",
        emoji: true,
        emojiChar: "💥",
        keycheck: true,
        keys: ["⌘", "⇧", "W"],
      },
      {
        title: "Manage browsing data",
        desc: "Manage your browsing data",
        type: "action",
        action: "manage-data",
        emoji: true,
        emojiChar: "🔬",
        keycheck: true,
        keys: ["⌘", "⇧", "Delete"],
      },
      {
        title: "Clear all browsing data",
        desc: "Clear all of your browsing data",
        type: "action",
        action: "remove-all",
        emoji: true,
        emojiChar: "🧹",
        keycheck: false,
        keys: ["⌘", "D"],
      },
      {
        title: "Clear browsing history",
        desc: "Clear all of your browsing history",
        type: "action",
        action: "remove-history",
        emoji: true,
        emojiChar: "🗂",
        keycheck: false,
        keys: ["⌘", "D"],
      },
      {
        title: "Clear cookies",
        desc: "Clear all cookies",
        type: "action",
        action: "remove-cookies",
        emoji: true,
        emojiChar: "🍪",
        keycheck: false,
        keys: ["⌘", "D"],
      },
      {
        title: "Clear cache",
        desc: "Clear the cache",
        type: "action",
        action: "remove-cache",
        emoji: true,
        emojiChar: "🗄",
        keycheck: false,
        keys: ["⌘", "D"],
      },
      {
        title: "Clear local storage",
        desc: "Clear the local storage",
        type: "action",
        action: "remove-local-storage",
        emoji: true,
        emojiChar: "📦",
        keycheck: false,
        keys: ["⌘", "D"],
      },
      {
        title: "Clear passwords",
        desc: "Clear all saved passwords",
        type: "action",
        action: "remove-passwords",
        emoji: true,
        emojiChar: "🔑",
        keycheck: false,
        keys: ["⌘", "D"],
      },
    ]

    if (!isMac) {
      for (action of actions) {
        switch (action.action) {
          case "reload":
            action.keys = ["F5"]
            break
          case "fullscreen":
            action.keys = ["F11"]
            break
          case "downloads":
            action.keys = ["Ctrl", "J"]
            break
          case "settings":
            action.keycheck = false
            break
          case "history":
            action.keys = ["Ctrl", "H"]
            break
          case "go-back":
            action.keys = ["Alt", "←"]
            break
          case "go-forward":
            action.keys = ["Alt", "→"]
            break
          case "scroll-top":
            action.keys = ["Home"]
            break
          case "scroll-bottom":
            action.keys = ["End"]
            break
        }
        for (const key in action.keys) {
          if (action.keys[key] === "⌘") {
            action.keys[key] = "Ctrl"
          } else if (action.keys[key] === "⌥") {
            action.keys[key] = "Alt"
          }
        }
      }
    }
  })
}

// Get the current tab
const getCurrentTab = async () => {
  const queryOptions = { active: true, currentWindow: true }
  const [tab] = await chrome.tabs.query(queryOptions)
  return tab
}

// Restore the new tab page (workaround to show Omni in new tab page)
function restoreNewTab() {
  getCurrentTab().then((response) => {
    chrome.tabs
      .create({
        url: newtaburl,
      })
      .then(() => {
        chrome.tabs.remove(response.id)
      })
  })
}

const getRecentHistory = () => {
  chrome.history
    .search({ text: "", maxResults: 1000, startTime: 24 * 60 * 60 * 1000 })
    .then((data) => {
      recentHistory = data
    })
}

const resetOmni = async (tabId) => {
  clearActions()
  getTabs()
  getRecentHistory()
  // getGroup();
  var search = [
    {
      title: "Search",
      desc: "Search for a query",
      type: "action",
      action: "search",
      emoji: true,
      emojiChar: "🔍",
      keycheck: false,
    },
    {
      title: "Search",
      desc: "Go to website",
      type: "action",
      action: "goto",
      emoji: true,
      emojiChar: "🔍",
      keycheck: false,
    },
  ]
  actions = search.concat(actions)

  if (tabId) {
    // Get active tab
    const tab = await getCurrentTab()
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { type: "CT_REMOVE_TAB_LISTEN_SIDEPANEL", tabId: tabId })
    }
  }
  // await getBookmarks()
}

// Get tabs to populate in the actions
const getTabs = () => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      tab.desc = "Chrome tab"
      tab.keycheck = false
      tab.action = "switch-tab"
      tab.type = "tab"
    })
    actions = tabs.concat(actions)
  })
}

// Get bookmarks to populate in the actions
// const getBookmarks = async () => {
//   chrome?.storage?.local.get({ curateitBookmarks: [] }, function (results) {
//     if (
//       results &&
//       results.curateitBookmarks &&
//       results.curateitBookmarks.length > 0
//     ) {
//       actions = [...results.curateitBookmarks.splice(0, 50), ...actions]
//     }
//   })
// }

// const getBookmarkData = async () => {
//   //Fetch new data
//   const fetchNewData = () => {
//     chrome?.storage?.sync.get(["userData"], function (text) {
//       if (text && text?.userData && text?.userData?.apiUrl) {
//         fetch(
//           `${text.userData.apiUrl}/api/get-all-bookmark?page=1&perPage=5000`,
//           {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${text.userData.token}`,
//             },
//           }
//         )
//           .then((response) => {
//             return response.json()
//           })
//           .then(async (res) => {
//             let bookData = []
//             if (res.data && res.data.bookmark && res.data.bookmark.length > 0) {
//               const formatBookmark = async (book) => {
//                 let bookObj = {}
//                 bookObj.id = book.id
//                 bookObj.url = book.url
//                 bookObj.title = book.title
//                 bookObj.media_type = book?.media_type || ""
//                 bookObj.collection_name = book?.collection_gems?.name || ""
//                 bookObj.collection_id = book?.collection_gems?.id || ""
//                 if (book?.metaData?.icon) {
//                   bookObj.favIconUrl = book?.metaData?.icon
//                 } else {
//                   bookObj.emoji = true
//                   bookObj.emojiChar = "⭐️"
//                 }
//                 bookObj.type = "bookmark"
//                 bookObj.action = "bookmark"
//                 bookObj.desc = "Bookmark"
//                 bookObj.keyCheck = false
//                 bookObj.obj = book

//                 if (!bookData.includes(bookObj)) {
//                   bookData.push(bookObj)
//                 }
//               }

//               res.data.bookmark.forEach(async (book) => {
//                 await formatBookmark(book)
//               })

//               let d1 = new Date()
//               let expiryDate = new Date(d1.getTime() + 2 * 60000)
//               chrome.storage.local.set({
//                 curateitBookmarks: bookData,
//                 expires: expiryDate.toJSON(),
//               })
//             }
//           })
//           .catch((error) => {
//             return
//           })
//       }
//     })
//   }

//   chrome?.storage?.local.get(
//     { curateitBookmarks: [], expires: "" },
//     function (results) {
//       if (results.curateitBookmarks.length == 0) {
//         fetchNewData()
//       } else if (
//         results.expires &&
//         new Date(results.expires).getTime() > new Date().getTime()
//       ) {
//         return false
//       } else {
//         fetchNewData()
//       }
//     }
//   )
// }

// Lots of different actions
const switchTab = (tab) => {
  chrome.tabs.highlight({
    tabs: tab.index,
    windowId: tab.windowId,
  })
  chrome.windows.update(tab.windowId, { focused: true })
}
const goBack = (tab) => {
  chrome.tabs.goBack({
    tabs: tab.index,
  })
}
const goForward = (tab) => {
  chrome.tabs.goForward({
    tabs: tab.index,
  })
}
const duplicateTab = (tab) => {
  getCurrentTab().then((response) => {
    chrome.tabs.duplicate(response.id)
  })
}
const createBookmark = (tab) => {
  getCurrentTab().then((response) => {
    chrome.scripting.executeScript({
      target: { tabId: response.id },
      files: ["scripts/bookmark.js"],
    })
    return
  })
}
const muteTab = (mute) => {
  getCurrentTab().then((response) => {
    chrome.tabs.update(response.id, { muted: mute })
  })
}
const reloadTab = () => {
  chrome.tabs.reload()
}
const pinTab = (pin) => {
  getCurrentTab().then((response) => {
    chrome.tabs.update(response.id, { pinned: pin })
  })
}
const clearAllData = () => {
  chrome.browsingData.remove(
    {
      since: new Date().getTime(),
    },
    {
      appcache: true,
      cache: true,
      cacheStorage: true,
      cookies: true,
      downloads: true,
      fileSystems: true,
      formData: true,
      history: true,
      indexedDB: true,
      localStorage: true,
      passwords: true,
      serviceWorkers: true,
      webSQL: true,
    }
  )
}
const clearBrowsingData = () => {
  chrome.browsingData.removeHistory({ since: 0 })
}
const clearCookies = () => {
  chrome.browsingData.removeCookies({ since: 0 })
}
const clearCache = () => {
  chrome.browsingData.removeCache({ since: 0 })
}
const clearLocalStorage = () => {
  chrome.browsingData.removeLocalStorage({ since: 0 })
}
const clearPasswords = () => {
  chrome.browsingData.removePasswords({ since: 0 })
}
const openChromeUrl = (url) => {
  chrome.tabs.create({ url: "chrome://" + url + "/" })
}
const openIncognito = () => {
  chrome.windows.create({ incognito: true })
}
const closeWindow = (id) => {
  chrome.windows.remove(id)
}
const closeTab = (tab) => {
  chrome.tabs.remove(tab.id)
}
const closeCurrentTab = () => {
  getCurrentTab().then(closeTab)
}
const removeBookmark = (bookmark) => {
  chrome.bookmarks.remove(bookmark.id)
}

// Receive messages from any tab
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.request) {
    case "get-actions":
      resetOmni()
      // getBookmarkData()
      getCurrentTab().then((response) => {
        chrome.tabs.sendMessage(response?.id, { type: "CT_CLOSE_PANEL" })
      })
      sendResponse({ actions: actions, recentHistory })
      break
    case "switch-tab":
      switchTab(message.tab)
      break
    case "go-back":
      goBack(message.tab)
      break
    case "go-forward":
      goForward(message.tab)
      break
    case "duplicate-tab":
      duplicateTab(message.tab)
      break
    case "create-bookmark":
      createBookmark(message.tab)
      break
    case "mute":
      muteTab(true)
      break
    case "unmute":
      muteTab(false)
      break
    case "reload":
      reloadTab()
      break
    case "pin":
      pinTab(true)
      break
    case "unpin":
      pinTab(false)
      break
    case "remove-all":
      clearAllData()
      break
    case "remove-history":
      clearBrowsingData()
      break
    case "remove-cookies":
      clearCookies()
      break
    case "remove-cache":
      clearCache()
      break
    case "remove-local-storage":
      clearLocalStorage()
      break
    case "remove-passwords":
      clearPasswords()
    case "history": // Fallthrough
    case "downloads":
    case "extensions":
    case "settings":
    case "extensions/shortcuts":
      openChromeUrl(message.request)
      break
    case "manage-data":
      openChromeUrl("settings/clearBrowserData")
      break
    case "incognito":
      openIncognito()
      break
    case "close-window":
      closeWindow(sender.tab.windowId)
      break
    case "close-tab":
      closeCurrentTab()
      break
    case "search-history":
      chrome.history
        .search({
          text: message.query,
          maxResults: message.results || 0,
          startTime: 0,
        })
        .then((data) => {
          data.forEach((action, index) => {
            action.type = "history"
            action.emoji = true
            action.emojiChar = "🏛"
            action.action = "history"
            action.keyCheck = false
            action.action = "history"
            action.desc = "History"
          })
          sendResponse({ history: data })
        })
      return true
    case "remove":
      if (message.type == "bookmark") {
        removeBookmark(message.action)
      } else {
        closeTab(message.action)
      }
      break
    case "search":
      chrome.search.query({ text: message.query })
      break
    case "restore-new-tab":
      restoreNewTab()
      break
    case "close-omni":
      getCurrentTab().then((response) => {
        chrome.tabs.sendMessage(response.id, { request: "close-omni" })
      })
      break
    case "close-extension":
      getCurrentTab().then((response) => {
        chrome.tabs.sendMessage(response.id, { type: "CT_CLOSE_PANEL" })
      })
      break
  }
  
})

// Get actions
resetOmni()

// Short link code
const VARIABLE_PLACEHOLDER = /{([^}]+)}/g;

chrome.omnibox.onInputEntered.addListener((text) => {
  const [shortcutText, ...rest] = text.split("/");
  const variableValue = rest.join("/");
  chrome.storage.local.get(["CT_SHORT_LINKS"], (result) => {
    if (result.CT_SHORT_LINKS) {
      const urlArr = result.CT_SHORT_LINKS.filter((shortcut) => { return shortcut.keyword === shortcutText })
      if (urlArr.length > 0) {
        let url = urlArr[0].url;

        checkIsUserLoggedIn()
          .then((authenticateUser) => {
            fetch(
              `${authenticateUser?.url}/api/usage-count/${urlArr[0].gemId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authenticateUser.token}`,
              }
            })
          })
        url = url.replace(VARIABLE_PLACEHOLDER, (match, variable) => {
          return variableValue;
        })
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.update(tabs[0].id, { url });
        });
      }
    }
  });
})

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  chrome.storage.local.get(["CT_SHORT_LINKS"], (result) => {
    if (result.CT_SHORT_LINKS) {
      const suggestions = result.CT_SHORT_LINKS.filter((shortcut) => {
        return !text || shortcut?.keyword?.split("/")?.[0]?.startsWith(text?.split("/")?.[0])
      })
        .map((linkObj) => {
          return {
            content: linkObj.keyword,
            description: `<match>${linkObj.keyword}</match> - <url>${linkObj.url}</url>`,
          }
        })
      suggest(suggestions)
    }
  })
  // chrome.storage.local.get(null, (items) => {
  //   const savedShortcuts = Object.entries(items)
  //     .filter(([key]) => key.startsWith(STORAGE_LINKS_PREFIX))
  //     .map(([key, value]) => ({
  //       text: key.replace(STORAGE_LINKS_PREFIX, ""),
  //       url: value,
  //     }));

  //   const suggestions = savedShortcuts
  //     .filter(
  //       (shortcut) =>
  //         !text || shortcut.text.split("/")[0].startsWith(text.split("/")[0])
  //     )
  //     .map((shortcut) => ({
  //       content: shortcut.text,
  //       description: `<match>${shortcut.text}</match> - <url>${shortcut.url}</url>`,
  //     }));

  //   suggest(suggestions);
  // });
})
