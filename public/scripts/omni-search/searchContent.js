// Workaround to capture Esc key on certain sites
var isOpen = false
document.onkeyup = (e) => {
  if (e.key == "Escape" && isOpen) {
    chrome.runtime.sendMessage({ request: "close-omni" })
  }
}

$(document).ready(() => {
  var actions = []
  var group = []
  var selectedGroup = []
  var isFiltered = false
  var tabIndex = ""
  var currentBookmarks = []
  var tabClickType = ""   //When gems/actions/tabs tab are clciked

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

  // Append the omni into the current page
  $.get(
    chrome.runtime.getURL("/scripts/omni-search/searchContent.html"),
    (data) => {
      $(data).appendTo("body")

      // Get checkmark image for toast
      $("#omni-extension-toast img").attr(
        "src",
        chrome.runtime.getURL("assets/check.svg")
      )

      // change - shortcut - container
      if (getOS() == "macos") {
        $("#change-shortcut-container").append(
          "<span>Change shortcut (⌘+E)</span>"
        )
      } else {
        $("#change-shortcut-container").append(
          "<span>Change shortcut (Ctrl+E)</span>"
        )
      }

      //INITIALLY SET LIGHT_DARK MODE
      const theme = window.localStorage.getItem("CT_THEME")

      if (theme == "CT_DARK_THEME") {
        $("#omni-extension").addClass("dark")
      } else {
        $("#omni-extension").removeClass("dark")
      }

      // Request actions from the background
      chrome.runtime.sendMessage({ request: "get-actions" }, (response) => {
        actions = response.actions
        getGroup(response.recentHistory)
        tabIndex = ""
      })
    }
  )

  //CREATE HISTORY GROUP
  const getGroup = (data) => {
    const sortedHistory = data.sort((a, b) => b.visitCount - a.visitCount)

    //Check index of domain
    const checkHost = (domain) => {
      if (!domain) return -1
      let index = -1
      group.map((g, idx) => {
        if (g.name == domain) index = idx
      })

      //create new group
      if (index === -1 && group.length < 10) {
        const data = {
          name: domain,
          favIconUrl: `https://www.google.com/s2/favicons?domain=${domain}`,
          emoji: false,
          urls: [],
        }
        group.push(data)
        index = group.length - 1
      }
      return index
    }

    sortedHistory.every((his) => {
      let tlds = tldjs.parse(his.url)
      const index = checkHost(tlds.domain, his.url)
      if (index != -1) {
        const newGroupHis = {
          id: his.id,
          title: his.title,
          url: his.url,
          type: "history",
          emoji: false,
          favIconUrl: `https://www.google.com/s2/favicons?domain=${his.url}`,
          // emojiChar: "🏛",
          action: "history",
          keyCheck: false,
        }
        group[index].urls.push(newGroupHis)
      }
      return true
    })
  }

  // Remove Bookmark
  function removeBookmark(gem) {
    chrome?.storage?.sync.get(["userData"], function (text) {
      fetch(`${text.userData.apiUrl}/api/gems/${gem.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${text.userData.token}`,
        },
      })
        .then((response) => {
          return response.json()
        })
        .then(async (res) => {
          if (res?.data?.id == gem.id) {
            alert("Bookmark removed succssfully.")
          }
        })
        .catch((error) => {
          console.log("search err", error)
        })
    })
  }

  function debounce(cb, timeout = 300) {
    let timer
    return (...args) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        cb(...args)
      }, timeout)
    }
  }

  const getBookmarks = debounce(async (textValue) => {

    chrome?.storage?.sync.get(["userData"], function (text) {
      if (text && text?.userData && text?.userData?.apiUrl) {
        axios.get(`${text?.userData?.apiUrl}/api/search?search=${textValue}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${text.userData.token}`,
            },
          }
        ).then((response) => {
          return response.data
        })
          .then((res) => {
            let bookmarks = []
            if (res.length > 0) {
              res.forEach((g) => {
                let gemObj = {}
                gemObj.id = g.id
                gemObj.url = g.url
                gemObj.title = g.title
                if (g.image) {
                  gemObj.favIconUrl = g.image
                } else {
                  gemObj.emoji = true
                  gemObj.emojiChar = "⭐️"
                }
                gemObj.media_type = g.media_type || ""
                gemObj.collection_name = g.collectionName || ""
                gemObj.collection_id = g.collectionId || ""
                gemObj.type = "bookmark"
                gemObj.action = "bookmark"
                gemObj.desc = "Bookmark"
                gemObj.keyCheck = false
                gemObj.obj = { ...g }
                bookmarks.push(gemObj)
              })
              currentBookmarks = bookmarks
              populateOmniFilter(bookmarks)
              // const formatBookmark = (g) => {
              //   // gem.every((g) => {
              //     let gemObj = {}
              //     gemObj.id = g.id
              //     gemObj.url = g.url
              //     gemObj.title = g.title
              //     // gemObj.favIconUrl = g.image ? g.image : 
              //     if (g.image) {
              //       gemObj.favIconUrl = g.image
              //     } else {
              //       gemObj.emoji = true
              //       gemObj.emojiChar = "⭐️"
              //     }
              //     gemObj.media_type = g.media_type || ""
              //     gemObj.collection_name = g.collectionName || ""
              //     gemObj.collection_id = g.collectionId || ""
              //     gemObj.type = "bookmark"
              //     gemObj.action = "bookmark"
              //     gemObj.desc = "Bookmark"
              //     gemObj.keyCheck = false
              //     gemObj.obj = { ...g }
              //     bookmarks.push(gemObj)
              //   // })
              // }
              // formatBookmark(res)
              // currentBookmarks = bookmarks
              // populateOmniFilter(bookmarks)
            }
          })
      }
    })

    // chrome?.storage?.sync.get(["userData"], function (text) {
    //   if (text && text?.userData && text?.userData?.apiUrl) {
    //     fetch(`${text.userData.apiUrl}/api/search?searchword=${textValue}`, {
    //       method: "GET",
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: `Bearer ${text.userData.token}`,
    //       },
    //     })
    //       .then((response) => {
    //         return response.json()
    //       })
    //       .then(async (res) => {
    //         let bookmarks = []
    //         if (res.length > 0) {
    //           const formatBookmark = async (book, gem) => {
    //             let bookObj = {}

    //             bookObj.id = book.id
    //             bookObj.url = book.url
    //             bookObj.title = book.title
    //             bookObj.media_type = book?.media_type || ""
    //             bookObj.collection_name = gem?.collection?.name || ""
    //             bookObj.collection_id = gem?.collection?.id || ""
    //             if (book?.metaData?.icon) {
    //               bookObj.favIconUrl = book?.metaData?.icon
    //             } else {
    //               bookObj.emoji = true
    //               bookObj.emojiChar = "⭐️"
    //             }
    //             bookObj.type = "bookmark"
    //             bookObj.action = "bookmark"
    //             bookObj.desc = "Bookmark"
    //             bookObj.keyCheck = false
    //             bookObj.obj = { ...book, collection_gems: gem?.collection }

    //             bookmarks.push(bookObj)
    //           }
    //           const checkBookmarks = async (bookmarks, col) => {
    //             bookmarks.every(async (book, index) => {
    //               if (index >= 19) return false
    //               if (book.docId && book.gem.gem_id) {
    //                 await formatBookmark(book.gem, book)
    //                 if (book.gem.gems && book.gem.gems.length > 0) {
    //                   await checkBookmarks(book.gem.gems, book)
    //                 }
    //               } else if (book.gem_id) {
    //                 await formatBookmark(book, col)
    //                 if (book.gems && book.gems.length > 0) {
    //                   await checkBookmarks(book.gems, col)
    //                 }
    //               }
    //               return true
    //             })
    //           }

    //           await checkBookmarks(res)
    //         }
    //         currentBookmarks = bookmarks
    //         populateOmniFilter(bookmarks)
    //       })
    //       .catch((error) => {
    //         currentBookmarks = []
    //         populateOmniFilter([])
    //       })
    //   }
    // })
  })

  const getBookmarkSearchResult = debounce(async (textValue) => {
    if (!textValue) return false

    chrome?.storage?.sync.get(["userData"], function (text) {
      if (text && text?.userData && text?.userData?.apiUrl) {
        axios.get(`${text.userData.apiUrl}/api/search?search=${textValue}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${text.userData.token}`,
            },
          }
        ).then((response) => {
          return response.data
        })
          .then((res) => {
            let bookmarks = []
            if (res.length > 0) {
              res.forEach((g) => {
                let gemObj = {}
                gemObj.id = g.id
                gemObj.url = g.url
                gemObj.title = g.title
                if (g.image) {
                  gemObj.favIconUrl = g.image
                } else {
                  gemObj.emoji = true
                  gemObj.emojiChar = "⭐️"
                }
                gemObj.media_type = g.media_type || ""
                gemObj.collection_name = g.collectionName || ""
                gemObj.collection_id = g.collectionId || ""
                gemObj.type = "bookmark"
                gemObj.action = "bookmark"
                gemObj.desc = "Bookmark"
                gemObj.keyCheck = false
                gemObj.obj = { ...g }
                bookmarks.push(gemObj)
              })
              currentBookmarks = bookmarks
              populateBookmarks(bookmarks)
              chrome.runtime.sendMessage(
                { request: "search-history", query: textValue, results: 10 },
                (response) => {
                  populateSpotlightHistory(response.history)
                }
              )
            }
          })
      } else {
        return false;
      }
    })

  });

  // const getBookmarkSearchResult = async (textValue) => {
  //   if (!textValue) return false

  //   chrome?.storage?.sync.get(["userData"], function (text) {
  //     if (text && text?.userData && text?.userData?.apiUrl) {
  //       axios.get(`${text.userData.apiUrl}/api/search?search=${textValue}`,
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${text.userData.token}`,
  //           },
  //         }
  //       ).then((response) => {
  //         return response.data
  //       })
  //         .then((res) => {
  //           let bookmarks = []
  //           currentBookmarks = bookmarks
  //           populateBookmarks(bookmarks)
  //           if (res.length > 0) {
  //             res.forEach((g) => {
  //               let gemObj = {}
  //               gemObj.id = g.id
  //               gemObj.url = g.url
  //               gemObj.title = g.title
  //               if (g.image) {
  //                 gemObj.favIconUrl = g.image
  //               } else {
  //                 gemObj.emoji = true
  //                 gemObj.emojiChar = "⭐️"
  //               }
  //               gemObj.media_type = g.media_type || ""
  //               gemObj.collection_name = g.collectionName || ""
  //               gemObj.collection_id = g.collectionId || ""
  //               gemObj.type = "bookmark"
  //               gemObj.action = "bookmark"
  //               gemObj.desc = "Bookmark"
  //               gemObj.keyCheck = false
  //               gemObj.obj = { ...g }
  //               bookmarks.push(gemObj)
  //             })
  //             currentBookmarks = bookmarks
  //             populateBookmarks(bookmarks)
  //             // const formatBookmark = (g) => {
  //             //   let gemObj = {}
  //             //   // gem.every((g) => {
  //             //     gemObj.id = g.id
  //             //     gemObj.url = g.url
  //             //     gemObj.title = g.title
  //             //     // gemObj.favIconUrl = g.image ? g.image : 
  //             //     if (g.image) {
  //             //       gemObj.favIconUrl = g.image
  //             //     } else {
  //             //       gemObj.emoji = true
  //             //       gemObj.emojiChar = "⭐️"
  //             //     }
  //             //     gemObj.media_type = g.media_type || ""
  //             //     gemObj.collection_name = g.collectionName || ""
  //             //     gemObj.collection_id = g.collectionId || ""
  //             //     gemObj.type = "bookmark"
  //             //     gemObj.action = "bookmark"
  //             //     gemObj.desc = "Bookmark"
  //             //     gemObj.keyCheck = false
  //             //     gemObj.obj = { ...g }
  //             //   // })
  //             //   bookmarks.push(gemObj)
  //             // }
  //             // formatBookmark(res)
  //             // currentBookmarks = bookmarks
  //             // // return currentBookmarks;
  //             // populateBookmarks(bookmarks)
  //             chrome.runtime.sendMessage(
  //               { request: "search-history", query: textValue, results: 10 },
  //               (response) => {
  //                 populateSpotlightHistory(response.history)
  //               }
  //             )
  //           }
  //         })
  //     } else {
  //       return false;
  //     }
  //   })


  //   // chrome?.storage?.local.get({ curateitBookmarks: [] }, function (results) {
  //   //   if (
  //   //     results &&
  //   //     results.curateitBookmarks &&
  //   //     results.curateitBookmarks.length > 0
  //   //   ) {
  //   //     let selectedBook = []
  //   //     results.curateitBookmarks.every((res) => {
  //   //       if (selectedBook.length > 10) return false
  //   //       if (
  //   //         (res.title && res.title.toLowerCase().includes(text)) ||
  //   //         (res.desc && res.desc.toLowerCase().includes(text)) ||
  //   //         (res.collection_name &&
  //   //           res.collection_name.toLowerCase().includes(text))
  //   //       ) {
  //   //         selectedBook.push(res)
  //   //       }

  //   //       return true
  //   //     })

  //   //     currentBookmarks = selectedBook
  //   //     populateBookmarks(selectedBook)
  //   //   }
  //   // })
  // }

  // const getBookmarkFromLocalStorage = async () => {
  //   chrome?.storage?.local.get({ curateitBookmarks: [] }, function (results) {
  //     if (
  //       results &&
  //       results.curateitBookmarks &&
  //       results.curateitBookmarks.length > 0
  //     ) {
  //       let selectedBook = results.curateitBookmarks.slice(0, 30);
  //       currentBookmarks = selectedBook
  //       populateOmniFilter(selectedBook)
  //     }
  //   })
  // }

  function renderAction(action, index, keys, img) {
    var skip = ""
    if (action.action == "search" || action.action == "goto") {
      skip = "style='display:none'"
    }
    if (index != 0) {
      if (action.type == "history") {
        $("#omni-extension #omni-list").append(
          "<div class='omni-item' " +
          skip +
          " data-index='" +
          index +
          "' data-type='" +
          action.type +
          "' data-url='" +
          action.url +
          "' open-url='check'>" +
          img +
          "<div class='omni-item-details'><div class='omni-item-name'>" +
          action.title +
          "</div><div class='omni-item-desc'>" +
          action.desc +
          "</div></div>" +
          keys +
          "<div class='omni-select'>Select <span class='omni-shortcut'>⏎</span></div></div>"
        )
      } else if (action.type == "bookmark") {
        $("#omni-extension #omni-list").append(
          "<div class='omni-item' " +
          skip +
          " data-index='" +
          index +
          "' data-type='" +
          action.type +
          "'>" +
          img +
          "<div class='omni-item-details'><div class='omni-item-name'>" +
          action.title +
          "</div><div class='omni-item-desc'>" +
          action.media_type +
          " | " +
          action.collection_name +
          "</div></div>" +
          keys +
          "<div class='omni-select'><div class='omni-edit'>Edit</div><div>Select <span class='omni-shortcut'>⏎</span></div></div></div>"
        )
      } else {
        $("#omni-extension #omni-list").append(
          "<div class='omni-item' " +
          skip +
          " data-index='" +
          index +
          "' data-type='" +
          action.type +
          "'>" +
          img +
          "<div class='omni-item-details'><div class='omni-item-name'>" +
          action.title +
          "</div><div class='omni-item-desc'>" +
          action.desc +
          "</div></div>" +
          keys +
          "<div class='omni-select'>Select <span class='omni-shortcut'>⏎</span></div></div>"
        )
      }
    } else {
      $("#omni-extension #omni-list").append(
        "<div class='omni-item omni-item-active' " +
        skip +
        " data-index='" +
        index +
        "' data-type='" +
        action.type +
        "'>" +
        img +
        "<div class='omni-item-details'><div class='omni-item-name'>" +
        action.title +
        "</div><div class='omni-item-desc'>" +
        action.desc +
        "</div></div>" +
        keys +
        "<div class='omni-select'>Select <span class='omni-shortcut'>⏎</span></div></div>"
      )
    }
    if (!action.emoji) {
      var loadimg = new Image()
      loadimg.src = action.favIconUrl

      // Favicon doesn't load, use a fallback
      loadimg.onerror = () => {
        $(".omni-item[data-index='" + index + "'] img").attr(
          "src",
          chrome.runtime.getURL("/assets/globe.svg")
        )
      }
    }
  }

  function renderBookmarkAction(action, index, keys, img, hasHistory) {
    var skip = ""

    // if (hasHistory) {
    // }
    $("#omni-extension #omni-list").append(
      "<div class='omni-item' " +
      skip +
      " data-index='" +
      index +
      "' data-type='" +
      action.type +
      "' data-url='" +
      action.url +
      "' open-url='check'>" +
      img +
      "<div class='omni-item-details'><div class='omni-item-name'>" +
      action.title +
      "</div><div class='omni-item-desc'>" +
      action.media_type +
      " | " +
      action.collection_name +
      "</div></div>" +
      keys +
      "<div class='omni-select'><div class='omni-edit' data-search='book'>Edit</div><div>Select <span class='omni-shortcut'>⏎</span></div></div></div>"
    )

    if (!action.emoji) {
      var loadimg = new Image()
      loadimg.src = action.favIconUrl

      // Favicon doesn't load, use a fallback
      loadimg.onerror = () => {
        $(".omni-item[data-index='" + index + "'] img").attr(
          "src",
          chrome.runtime.getURL("/assets/globe.svg")
        )
      }
    }
  }

  function renderTab(tab, index, keys, img) {
    const toolTip = "<span class='omni-tab-tooltip'>" + tab?.name + "</span>"
    $("#omni-extension #omni-tabs").append(
      "<div class='omni-tab-item' data-index='" +
      index +
      "'data-name='" +
      tab?.name +
      "'>" +
      img +
      toolTip +
      "</div>"
    )
  }

  //Add tabs
  function populateTabs() {
    $("#omni-extension #omni-tabs").html("")
    $("#omni-extension #omni-tabs").append(
      "<div class='omni-tab-item omni-tab-active omni-tab-item-selected'>All</div>"
    )
    const newGroups = group.slice(0, 6)
    newGroups.push({
      name: "Actions",
      favIconUrl: chrome.runtime.getURL("/assets/actions.png")
    })
    newGroups.push({
      name: "Bookmarks",
      favIconUrl: chrome.runtime.getURL("/assets/bookmarks.png")
    })
    newGroups.push({
      name: "Tabs",
      favIconUrl: chrome.runtime.getURL("/assets/tabs.png")
    })
    // newGroups.push({
    //   name: "Shortcuts",
    //   favIconUrl: chrome.runtime.getURL("/assets/shortcuts.png")
    // })
    newGroups.forEach((g, index) => {
      var keys = ""

      // Check if the g has an emoji or a favicon
      if (!g.emoji) {
        var onload =
          'if ("naturalHeight" in this) {if (this.naturalHeight + this.naturalWidth === 0) {this.onerror();return;}} else if (this.width + this.height == 0) {this.onerror();return;}'
        var img =
          "<img src='" +
          g.favIconUrl +
          "' alt='favicon' onload='" +
          onload +
          "' onerror='this.src=&quot;" +
          chrome.runtime.getURL("/assets/globe.svg") +
          "&quot;' class='omni-icon'>"
        renderTab(g, index, keys, img)
      } else {
        var img = "<span class='omni-emoji-g'>" + g.emojiChar + "</span>"
        renderTab(g, index, keys, img)
      }
    })
  }

  // Add actions to the omni
  function populateOmni() {
    $("#omni-extension #omni-list").html("")
    actions.forEach((action, index) => {
      var keys = ""
      if (action.keycheck) {
        keys = "<div class='omni-keys'>"
        action.keys.forEach(function (key) {
          keys += "<span class='omni-shortcut'>" + key + "</span>"
        })
        keys += "</div>"
      }

      // Check if the action has an emoji or a favicon
      if (!action.emoji) {
        var onload =
          'if ("naturalHeight" in this) {if (this.naturalHeight + this.naturalWidth === 0) {this.onerror();return;}} else if (this.width + this.height == 0) {this.onerror();return;}'
        var img =
          "<img src='" +
          action.favIconUrl +
          "' alt='favicon' onload='" +
          onload +
          "' onerror='this.src=&quot;" +
          chrome.runtime.getURL("/assets/globe.svg") +
          "&quot;' class='omni-icon'>"
        renderAction(action, index, keys, img)
      } else {
        var img =
          "<span class='omni-emoji-action'>" + action.emojiChar + "</span>"
        renderAction(action, index, keys, img)
      }
    })
    $(".omni-extension #omni-results").html(actions.length + " results")
  }

  // Populate bookmarks
  function populateBookmarks(bookmarks) {
    if (bookmarks && Array.isArray(bookmarks)) {
      // $(
      //   ".omni-item[data-index='" +
      //     actions.findIndex((x) => x.action == "bookmark") +
      //     "']"
      // ).remove();

      //Remove previous bookmarks
      let hasHistory = false
      $("#omni-list")
        .children(".omni-item")
        .each(function () {
          if ($(this).attr("data-type") == "bookmark") {
            $(this).remove()
          }
          if ($(this).attr("data-type") == "history") {
            hasHistory = true
          }
        })

      bookmarks.forEach((action, index) => {
        var keys = ""
        if (action.keycheck) {
          keys = "<div class='omni-keys'>"
          action.keys.forEach(function (key) {
            keys += "<span class='omni-shortcut'>" + key + "</span>"
          })
          keys += "</div>"
        }

        // Check if the action has an emoji or a favicon
        if (!action.emoji) {
          var onload =
            'if ("naturalHeight" in this) {if (this.naturalHeight + this.naturalWidth === 0) {this.onerror();return;}} else if (this.width + this.height == 0) {this.onerror();return;}'
          var img =
            "<img src='" +
            action.favIconUrl +
            "' alt='favicon' onload='" +
            onload +
            "' onerror='this.src=&quot;" +
            chrome.runtime.getURL("/assets/globe.svg") +
            "&quot;' class='omni-icon'>"
          renderBookmarkAction(action, index, keys, img, hasHistory)
        } else {
          var img =
            "<span class='omni-emoji-action'>" + action.emojiChar + "</span>"
          renderBookmarkAction(action, index, keys, img, hasHistory)
        }
      })
    }
    // $(".omni-extension #omni-results").html(actions.length + " results");
  }

  // Add filtered actions to the omni
  function populateOmniFilter(actions) {
    currentBookmarks = actions
    isFiltered = true
    $("#omni-extension #omni-list").html("")
    const renderRow = (index) => {
      const action = actions[index]
      var keys = ""
      if (action.keycheck) {
        keys = "<div class='omni-keys'>"
        action.keys.forEach(function (key) {
          keys += "<span class='omni-shortcut'>" + key + "</span>"
        })
        keys += "</div>"
      }
      var img =
        "<img src='" +
        action.favIconUrl +
        "' alt='favicon' onerror='this.src=&quot;" +
        chrome.runtime.getURL("/assets/globe.svg") +
        "&quot;' class='omni-icon'>"
      if (action.emoji) {
        img = "<span class='omni-emoji-action'>" + action.emojiChar + "</span>"
      }

      // if(action.type)

      if (action.type == "bookmark") {
        if (index != 0) {
          return $(
            "<div class='omni-item' data-index='" +
            index +
            "' data-type='" +
            action.type +
            "' data-url='" +
            action.url +
            "'>" +
            img +
            "<div class='omni-item-details'><div class='omni-item-name'>" +
            action.title +
            "</div><div class='omni-item-desc'>" +
            action.media_type +
            " | " +
            action.collection_name +
            " | " +
            action.url +
            "</div></div>" +
            keys +
            "<div class='omni-select'><div class='omni-edit' data-search='book'>Edit</div><div>Select <span class='omni-shortcut'>⏎</span></div></div></div>"
          )[0]
        } else {
          return $(
            "<div class='omni-item omni-item-active' data-index='" +
            index +
            "' data-type='" +
            action.type +
            "' data-url='" +
            action.url +
            "'>" +
            img +
            "<div class='omni-item-details'><div class='omni-item-name'>" +
            action.title +
            "</div><div class='omni-item-desc'>" +
            action.media_type +
            " | " +
            action.collection_name +
            " | " +
            action.url +
            "</div></div>" +
            keys +
            "<div class='omni-select'><div class='omni-edit' data-search='book'>Edit</div><div>Select <span class='omni-shortcut'>⏎</span></div></div></div>"
          )[0]
        }
      } else {
        if (index != 0) {
          return $(
            "<div class='omni-item' data-index='" +
            index +
            "' data-type='" +
            action.type +
            "' data-url='" +
            action.url +
            "'>" +
            img +
            "<div class='omni-item-details'><div class='omni-item-name'>" +
            action.title +
            "</div><div class='omni-item-desc'>" +
            action.url +
            "</div></div>" +
            keys +
            "<div class='omni-select'>Select <span class='omni-shortcut'>⏎</span></div></div>"
          )[0]
        } else {
          return $(
            "<div class='omni-item omni-item-active' data-index='" +
            index +
            "' data-type='" +
            action.type +
            "' data-url='" +
            action.url +
            "'>" +
            img +
            "<div class='omni-item-details'><div class='omni-item-name'>" +
            action.title +
            "</div><div class='omni-item-desc'>" +
            action.url +
            "</div></div>" +
            keys +
            "<div class='omni-select'>Select <span class='omni-shortcut'>⏎</span></div></div>"
          )[0]
        }
      }
    }

    actions.length &&
      new VirtualizedList.default($("#omni-extension #omni-list")[0], {
        height: 400,
        rowHeight: 60,
        rowCount: actions.length,
        renderRow,
        onMount: () =>
          $(".omni-extension #omni-results").html(actions.length + " results"),
      })
  }

  // Add actions to the omni
  function populateSpotlightHistory(data) {
    // $("#omni-extension #omni-list").html("");
    $("#omni-list")
      .children(".omni-item")
      .each(function () {
        if ($(this).attr("data-type") == "history") {
          $(this).remove()
        }
      })


    data.forEach((action, index) => {
      var keys = ""
      if (action.keycheck) {
        keys = "<div class='omni-keys'>"
        action.keys.forEach(function (key) {
          keys += "<span class='omni-shortcut'>" + key + "</span>"
        })
        keys += "</div>"
      }

      // Check if the action has an emoji or a favicon
      if (!action.emoji) {
        var onload =
          'if ("naturalHeight" in this) {if (this.naturalHeight + this.naturalWidth === 0) {this.onerror();return;}} else if (this.width + this.height == 0) {this.onerror();return;}'
        var img =
          "<img src='" +
          action.favIconUrl +
          "' alt='favicon' onload='" +
          onload +
          "' onerror='this.src=&quot;" +
          chrome.runtime.getURL("/assets/globe.svg") +
          "&quot;' class='omni-icon'>"
        renderAction(action, index + actions.length, keys, img)
      } else {
        var img =
          "<span class='omni-emoji-action'>" + action.emojiChar + "</span>"
        renderAction(action, index + actions.length, keys, img)
      }
    })
  }

  // Open the omni
  function openOmni() {
    chrome.runtime.sendMessage({ request: "get-actions" }, (response) => {
      tabIndex = ""
      tabClickType = ""
      isOpen = true
      actions = response.actions
      getGroup(response.recentHistory)
      $("#omni-extension input").val("")
      populateOmni()
      populateTabs()
      $("html, body").stop()

      $("#omni-extension").removeClass("omni-closing")
      window.setTimeout(() => {
        $("#omni-extension input").focus()
        focusLock.on($("#omni-extension input").get(0))
        $("#omni-extension input").focus()
      }, 100)
    })
  }

  // Close the omni
  function closeOmni() {
    isOpen = false
    $("#omni-extension").addClass("omni-closing")
  }

  // Hover over an action in the omni
  function hoverItem() {
    $(".omni-item-active").removeClass("omni-item-active")
    $(this).addClass("omni-item-active")
    if ($(this).attr("data-type") === "history") {
      tabIndex = $(this).attr("data-index")
    } else {
      tabIndex = ""
    }
  }

  // Hover over a tab in the omni
  function hoverTab() {
    $(".omni-tab-active").removeClass("omni-tab-active")
    $(this).addClass("omni-tab-active")
  }

  // Show a toast when an action has been performed
  function showToast(action) {
    $("#omni-extension-toast span").html(
      '"' + action.title + '" has been successfully performed'
    )
    $("#omni-extension-toast").addClass("omni-show-toast")
    setTimeout(() => {
      $(".omni-show-toast").removeClass("omni-show-toast")
    }, 3000)
  }

  // Autocomplete commands. Since they all start with different letters, it can be the default behavior
  function checkShortHand(e, value) {
    var el = $(".omni-extension input")
    if (e.keyCode != 8) {
      if (value == "/t") {
        el.val("/tabs ")
      } else if (value == "/b") {
        el.val("/gems ")
      } else if (value == "/h") {
        el.val("/history ")
        // } else if (value == "/r") {
        //     el.val("/remove ");
      } else if (value == "/g") {
        el.val("/gems ")
      } else if (value == "/a") {
        el.val("/actions ")
      }
    } else {
      if (
        value == "/tabs" ||
        value == "/bookmarks" ||
        value == "/actions" ||
        value == "/gems" ||
        value == "/history"
      ) {
        el.val("")
      }
    }
  }

  // Add protocol
  function addhttp(url) {
    if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
      url = "http://" + url
    }
    return url
  }

  // Check if valid url
  function validURL(str) {
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
      "i"
    ) // fragment locator
    return !!pattern.test(str)
  }

  // Search for an action in the omni
  async function search(e) {
    if (
      e.keyCode == 37 ||
      e.keyCode == 38 ||
      e.keyCode == 39 ||
      e.keyCode == 40 ||
      e.keyCode == 13 ||
      e.keyCode == 37
    ) {
      return
    }
    var value = $(this).val().toLowerCase();
    if (tabIndex == "" && tabClickType == "") {
      checkShortHand(e, value)
      value = $(this).val().toLowerCase()
      if (value === "" || !value) {
        populateOmni()
      }

      if (value.startsWith("/history")) {
        $(
          ".omni-item[data-index='" +
          actions.findIndex((x) => x.action == "search") +
          "']"
        ).hide()
        $(
          ".omni-item[data-index='" +
          actions.findIndex((x) => x.action == "goto") +
          "']"
        ).hide()
        var tempvalue = value.replace("/history ", "")
        var query = ""
        if (tempvalue != "/history") {
          query = value.replace("/history ", "")
        }
        chrome.runtime.sendMessage(
          { request: "search-history", query: query, results: 0 },
          (response) => {
            populateOmniFilter(response.history)
          }
        )
      } else if (value.startsWith("/bookmarks") || value.startsWith("/gems")) {
        $(
          ".omni-item[data-index='" +
          actions.findIndex((x) => x.action == "search") +
          "']"
        ).hide()
        $(
          ".omni-item[data-index='" +
          actions.findIndex((x) => x.action == "goto") +
          "']"
        ).hide()
        var tempvalue =
          value.replace("/gems ", "") || value.replace("/bookmarks ", "")
        if (
          tempvalue.trim() != "/bookmarks" &&
          tempvalue.trim() != "/gems" &&
          tempvalue.trim() != ""
        ) {
          getBookmarks(tempvalue)
        } else {
          populateOmniFilter(actions.filter((x) => x.type == "bookmark"))
        }
      } else {
        if (isFiltered) {
          populateOmni()
          isFiltered = false
        }
        $(".omni-extension #omni-list .omni-item").filter(function () {
          if (value.startsWith("/tabs")) {
            $(
              ".omni-item[data-index='" +
              actions.findIndex((x) => x.action == "search") +
              "']"
            ).hide()
            $(
              ".omni-item[data-index='" +
              actions.findIndex((x) => x.action == "goto") +
              "']"
            ).hide()
            var tempvalue = value.replace("/tabs ", "")
            if (tempvalue == "/tabs") {
              $(this).toggle($(this).attr("data-type") == "tab")
            } else {
              tempvalue = value.replace("/tabs ", "")
              $(this).toggle(
                ($(this)
                  .find(".omni-item-name")
                  .text()
                  .toLowerCase()
                  .indexOf(tempvalue) > -1 ||
                  $(this)
                    .find(".omni-item-desc")
                    .text()
                    .toLowerCase()
                    .indexOf(tempvalue) > -1) &&
                $(this).attr("data-type") == "tab"
              )
            }
          } else if (value.startsWith("/actions")) {
            $(
              ".omni-item[data-index='" +
              actions.findIndex((x) => x.action == "search") +
              "']"
            ).hide()
            $(
              ".omni-item[data-index='" +
              actions.findIndex((x) => x.action == "goto") +
              "']"
            ).hide()
            var tempvalue = value.replace("/actions ", "")
            if (tempvalue == "/actions") {
              $(this).toggle($(this).attr("data-type") == "action")
            } else {
              tempvalue = value.replace("/actions ", "")
              $(this).toggle(
                ($(this)
                  .find(".omni-item-name")
                  .text()
                  .toLowerCase()
                  .indexOf(tempvalue) > -1 ||
                  $(this)
                    .find(".omni-item-desc")
                    .text()
                    .toLowerCase()
                    .indexOf(tempvalue) > -1) &&
                $(this).attr("data-type") == "action"
              )
            }
          } else {
            $(this).toggle(
              $(this)
                .find(".omni-item-name")
                .text()
                .toLowerCase()
                .indexOf(value) > -1 ||
              $(this)
                .find(".omni-item-desc")
                .text()
                .toLowerCase()
                .indexOf(value) > -1
            )
            if (value == "") {
              $(
                ".omni-item[data-index='" +
                actions.findIndex((x) => x.action == "search") +
                "']"
              ).hide()
              $(
                ".omni-item[data-index='" +
                actions.findIndex((x) => x.action == "goto") +
                "']"
              ).hide()
            } else if (!validURL(value)) {
              $(
                ".omni-item[data-index='" +
                actions.findIndex((x) => x.action == "search") +
                "']"
              ).show()
              $(
                ".omni-item[data-index='" +
                actions.findIndex((x) => x.action == "goto") +
                "']"
              ).hide()
              $(
                ".omni-item[data-index='" +
                actions.findIndex((x) => x.action == "search") +
                "'] .omni-item-name"
              ).html('"' + value + '"')
            } else {
              $(
                ".omni-item[data-index='" +
                actions.findIndex((x) => x.action == "search") +
                "']"
              ).hide()
              $(
                ".omni-item[data-index='" +
                actions.findIndex((x) => x.action == "goto") +
                "']"
              ).show()
              $(
                ".omni-item[data-index='" +
                actions.findIndex((x) => x.action == "goto") +
                "'] .omni-item-name"
              ).html(value)
            }
          }
        })

        if (
          !value.startsWith("/tabs") &&
          !value.startsWith("/actions") &&
          value != ""
        ) {
          // const getHistoryData = async () => {
          //   chrome.runtime.sendMessage(
          //     { request: "search-history", query: value, results: 10 },
          //     (response) => {
          //       // return response.history;
          //       populateSpotlightHistory(response.history)
          //     }
          //   )
          // }
          // const bookmarks = await getBookmarkSearchResult(value)
          // const history = await getHistoryData();
          // const newArr = [...bookmarks, history];
          // populateOmniFilter(newArr);

          getBookmarkSearchResult(value)
          // const getHistoryData = () => {
          //   chrome.runtime.sendMessage(
          //     { request: "search-history", query: value, results: 10 },
          //     (response) => {
          //       populateSpotlightHistory(response.history)
          //     }
          //   )
          // }

          //Wait for bookmark load
          // setTimeout(() => getHistoryData(), 2000)
        } else {
          if (!value) {
          }
          $(".omni-extension #omni-list .omni-item").filter(function () {
            $(this).find(".omni-item-desc").text().toLowerCase() != history
          })
        }
      }
    } else if (tabIndex == "" && tabClickType) {
      if (!value) {
        if (tabClickType == "Bookmarks") {
          // getBookmarks(value)
          let bookmarks = actions.filter((x) => x.type == "bookmark");
          populateOmniFilter(bookmarks)

          // if (bookmarks.length > 0) {
          //   populateOmniFilter(bookmarks)
          // } else {
          //   getBookmarkFromLocalStorage();
          // }
        }
        else if (tabClickType === "Actions") {
          populatePerticulareAction("action")
        }
        else if (tabClickType === "Tabs") {
          populatePerticulareAction("tab")
        }
      } else {
        if (tabClickType == "Bookmarks") {
          getBookmarkSearchResult(value)
        }
        else {
          $(".omni-extension #omni-list .omni-item").filter(function () {
            $(this).toggle(
              $(this)
                .find(".omni-item-name")
                .text()
                .toLowerCase()
                .indexOf(value) > -1 ||
              $(this)
                .find(".omni-item-desc")
                .text()
                .toLowerCase()
                .indexOf(value) > -1
            )
          })
        }
      }
    }
    else {
      $(".omni-extension #omni-list .omni-item").filter(function () {
        $(this).toggle(
          $(this).find(".omni-item-name").text().toLowerCase().indexOf(value) >
          -1 ||
          $(this)
            .find(".omni-item-desc")
            .text()
            .toLowerCase()
            .indexOf(value) > -1
        )
        if (value == "") {
          populateOmniFilter(selectedGroup)
        } else {
          $(
            ".omni-item[data-index='" +
            selectedGroup.findIndex((x) => x.action == "goto") +
            "'] .omni-item-name"
          ).html(value)
        }
      })
    }

    setTimeout(() => {
      $(".omni-extension #omni-results").html(
        $("#omni-extension #omni-list .omni-item:visible").length + " results"
      )
    }, 2500)
    $(".omni-item-active").removeClass("omni-item-active")
    $(".omni-extension #omni-list .omni-item:visible")
      .first()
      .addClass("omni-item-active")
  }

  // Handle actions from the omni
  function handleAction(e) {
    var action = actions[$(".omni-item-active").attr("data-index")]
    closeOmni()
    if ($(".omni-extension input").val().toLowerCase().startsWith("/remove")) {
      if (action.type == "bookmark") {
        removeBookmark(action)
      } else {
        chrome.runtime.sendMessage({
          request: "remove",
          type: action.type,
          action: action,
        })
      }
    } else if (
      $(".omni-extension input").val().toLowerCase().startsWith("/history") ||
      tabIndex != "" ||
      $(".omni-item-active").attr("data-type") == "history" ||
      $(".omni-item-active").attr("open-url") == "check"
    ) {
      if (e.ctrlKey || e.metaKey) {
        window.open($(".omni-item-active").attr("data-url"))
      } else {
        window.open($(".omni-item-active").attr("data-url"), "_self")
      }
    } else if (
      $(".omni-extension input").val().toLowerCase().startsWith("/bookmarks") ||
      $(".omni-extension input").val().toLowerCase().startsWith("/gems")
    ) {
      // "' open-url='check'>" +
      if (e.ctrlKey || e.metaKey) {
        window.open($(".omni-item-active").attr("data-url"))
      } else {
        window.open($(".omni-item-active").attr("data-url"), "_self")
      }
    } else {
      chrome.runtime.sendMessage({
        request: action.action,
        tab: action,
        query: $(".omni-extension input").val(),
      })
      switch (action.action) {
        case "bookmark":
          if (e.ctrlKey || e.metaKey) {
            window.open(action.url)
          } else {
            window.open(action.url, "_self")
          }
          break
        case "scroll-bottom":
          window.scrollTo(0, document.body.scrollHeight)
          showToast(action)
          break
        case "scroll-top":
          window.scrollTo(0, 0)
          break
        case "navigation":
          if (e.ctrlKey || e.metaKey) {
            window.open(action.url)
          } else {
            window.open(action.url, "_self")
          }
          break
        case "fullscreen":
          var elem = document.documentElement
          elem.requestFullscreen()
          break
        case "new-tab":
          window.open("")
          break
        case "email":
          window.open("mailto:")
          break
        case "url":
          if (e.ctrlKey || e.metaKey) {
            window.open(action.url)
          } else {
            window.open(action.url, "_self")
          }
          break
        case "goto":
          if (e.ctrlKey || e.metaKey) {
            window.open(addhttp($(".omni-extension input").val()))
          } else {
            window.open(addhttp($(".omni-extension input").val()), "_self")
          }
          break
        case "print":
          window.print()
          break
        case "remove-all":
        case "remove-history":
        case "remove-cookies":
        case "remove-cache":
        case "remove-local-storage":
        case "remove-passwords":
          showToast(action)
          break
      }
    }

    // Fetch actions again
    chrome.runtime.sendMessage({ request: "get-actions" }, (response) => {
      actions = response.actions
      populateOmni()
    })
  }

  //Open edit bookmark
  function openBookmarkEdit(event) {
    event.stopPropagation()
    const isSearchResult = $(this).attr("data-search")
    if (isSearchResult) {
      var action =
        currentBookmarks[
        $(this).closest(".omni-item-active").attr("data-index")
        ]
      if (action?.obj && action?.obj?.gem_id) {
        const obj = { ...action.obj, id: action.obj.id }
        action = { ...action, obj: obj }
      }
    } else {
      var action =
        actions[$(this).closest(".omni-item-active").attr("data-index")]
    }

    closeOmni()
    chrome.storage.sync.set({
      editGemData: action.obj,
    })
    window.panelToggle(`?edit-bookmark`, true)
  }

  function setSearchItems(type) {
    if (actions.length !== 0) {
      tabIndex = ""
      selectedGroup = actions.filter((action) => { return action.type === type })
      populateOmni()
    }
    else {
      chrome.runtime.sendMessage({ request: "get-actions" }, (response) => {
        tabIndex = ""
        actions = response.actions.filter((action) => { return action.type === type })
        selectedGroup = response.actions.filter((action) => { return action.type === type })
        populateOmni()
      })
    }
  }

  function populatePerticulareAction(name) {
    var selectedAction = actions.filter(a => a.type === name);
    $("#omni-extension #omni-list").html("")
    selectedAction.forEach((action, index) => {
      var keys = ""
      if (action.keycheck) {
        keys = "<div class='omni-keys'>"
        action.keys.forEach(function (key) {
          keys += "<span class='omni-shortcut'>" + key + "</span>"
        })
        keys += "</div>"
      }

      // Check if the action has an emoji or a favicon
      if (!action.emoji) {
        var onload =
          'if ("naturalHeight" in this) {if (this.naturalHeight + this.naturalWidth === 0) {this.onerror();return;}} else if (this.width + this.height == 0) {this.onerror();return;}'
        var img =
          "<img src='" +
          action.favIconUrl +
          "' alt='favicon' onload='" +
          onload +
          "' onerror='this.src=&quot;" +
          chrome.runtime.getURL("/assets/globe.svg") +
          "&quot;' class='omni-icon'>"
        renderAction(action, index, keys, img)
      } else {
        var img =
          "<span class='omni-emoji-action'>" + action.emojiChar + "</span>"
        renderAction(action, index, keys, img)
      }
    })
    $(".omni-extension #omni-results").html(actions.length + " results")
  }



  // handle tab click
  function handleTabAction() {
    $("#omni-extension input").val("")
    let dataIndex = $(this).attr("data-index")
    const name = $(this).attr("data-name")
    $(".omni-tab-item-selected").removeClass("omni-tab-item-selected")
    $(this).addClass("omni-tab-item-selected")
    // if (name == "Bookmarks" || name === "Tabs" || name === "Shortcuts"){
    //   populateOmni();

    // }
    if (name == "Bookmarks") {
      tabClickType = "Bookmarks"
      tabIndex = "";
      let bookmarks = actions.filter((x) => x.type == "bookmark");
      populateOmniFilter(bookmarks);
      // if (bookmarks.length > 0) {
      //   populateOmniFilter(bookmarks)
      // }else{
      //   getBookmarkFromLocalStorage();
      // }
      // $(".omni-extension input").val("/b")
      // $(".omni-extension input").trigger("keyup")
    }
    else if (name === "Actions") {
      tabClickType = "Actions"
      tabIndex = "";
      populatePerticulareAction("action")
      // $(".omni-extension input").val("/a")
      // $(".omni-extension input").trigger("keyup")
    }
    else if (name === "Tabs") {
      tabClickType = "Tabs"
      tabIndex = "";
      populatePerticulareAction("tab")
      // $(".omni-extension input").val("/t")
      // $(".omni-extension input").trigger("keyup")
    }
    else if (name === "Shortcuts") {
      chrome.runtime.sendMessage({ request: "extensions/shortcuts" })
    }
    else {
      tabClickType = ""
      if (dataIndex) {
        tabIndex = dataIndex
        selectedGroup = group[dataIndex].urls
        populateOmniFilter(group[dataIndex].urls)
      } else {
        tabIndex = ""
        selectedGroup = actions
        populateOmni()
      }
    }

  }

  // Customize the shortcut to open the Omni box
  function openShortcuts() {
    chrome.runtime.sendMessage({ request: "extensions/shortcuts" })
  }

  // Check which keys are down
  var down = []

  $(document)
    .keydown((e) => {
      down[e.keyCode] = true
      if (down[38]) {
        // Up key
        if (
          $(".omni-item-active").prevAll("div").not(":hidden").first().length
        ) {
          var previous = $(".omni-item-active")
            .prevAll("div")
            .not(":hidden")
            .first()
          $(".omni-item-active").removeClass("omni-item-active")
          previous.addClass("omni-item-active")
          previous[0].scrollIntoView({ block: "nearest", inline: "nearest" })
        }
      } else if (down[40]) {
        // Down key
        if (
          $(".omni-item-active").nextAll("div").not(":hidden").first().length
        ) {
          var next = $(".omni-item-active")
            .nextAll("div")
            .not(":hidden")
            .first()
          $(".omni-item-active").removeClass("omni-item-active")
          next.addClass("omni-item-active")
          next[0].scrollIntoView({ block: "nearest", inline: "nearest" })
        }
      } else if (down[27] && isOpen) {
        // Esc key
        closeOmni()
      } else if (down[13] && isOpen) {
        // Enter key
        handleAction(e)
      }
    })
    .keyup((e) => {
      if (down[18] && down[16] && down[80]) {
        if (actions.find((x) => x.action == "pin") != undefined) {
          chrome.runtime.sendMessage({ request: "pin-tab" })
        } else {
          chrome.runtime.sendMessage({ request: "unpin-tab" })
        }
        chrome.runtime.sendMessage({ request: "get-actions" }, (response) => {
          actions = response.actions
          populateOmni()
        })
      } else if (down[18] && down[16] && down[77]) {
        if (actions.find((x) => x.action == "mute") != undefined) {
          chrome.runtime.sendMessage({ request: "mute-tab" })
        } else {
          chrome.runtime.sendMessage({ request: "unmute-tab" })
        }
        chrome.runtime.sendMessage({ request: "get-actions" }, (response) => {
          actions = response.actions
          populateOmni()
        })
      } else if (down[18] && down[16] && down[67]) {
        window.open("mailto:")
      }

      down = []
    })

  // Recieve messages from background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.request == "open-omni") {
      if (isOpen) {
        closeOmni()
      } else {
        openOmni()
      }
    } else if (message.request == "close-omni") {
      closeOmni()
    }
  })

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value } = obj

    if (type === "SHOW_OMNISEARCH" && value === true) {
      openOmni()
    }
  })

  $(document).on("click", "#open-page-omni-extension-thing", openShortcuts)
  $(document).on(
    "mouseover",
    ".omni-extension .omni-item:not(.omni-item-active)",
    hoverItem
  )
  $(document).on("keyup", ".omni-extension input", search)
  $(document).on("click", ".omni-item-active", handleAction)
  $(document).on("click", ".omni-extension #omni-overlay", closeOmni)
  $(document).on(
    "click",
    ".omni-extension #change-shortcut-container",
    openShortcuts
  )
  $(document).on("click", ".omni-extension .omni-edit", openBookmarkEdit)

  //Event handler for tabs
  $(document).on(
    "mouseover",
    ".omni-extension .omni-tab-item:not(.omni-tab-active)",
    hoverTab
  )
  $(document).on("click", ".omni-tab-active", handleTabAction)
})
