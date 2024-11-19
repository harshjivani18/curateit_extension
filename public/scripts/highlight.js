const highlights    = new window.Highlighter()
window.highlightPage = () => {
  const highlightData = JSON.parse(window.localStorage.getItem("CT_HIGHLIGHT_DATA"))
  highlights.dispose()
  highlightData.forEach((h) => {
    // const { media }   = h
    // if (media && media.text && media.styleClassName) {
    //   const text        = document.body.innerHTML
    //   text.replace(media.text, `<span class=${media.styleClassName}>${media.text}</span>`)
    // }
    const { media } = h
    const { details, styleClassName } = media
    if (details) {
      highlights.fromStore(details.startMeta, details.endMeta, details.text, details.id)
      if (styleClassName) highlights.addClass(styleClassName, details.id)
    }
  })
}

window.deleteHighlight = () => {
  const highlights    = new window.Highlighter()
  const id = JSON.parse(window.localStorage.getItem("CT_HIGHLIGHT_DATA_DELETE"))
  highlights.remove(id)
}

window.scrollToView = (value) => {
  if (value.details) {
    const element = document.querySelector(`span[data-highlight-id="${value.details.id}"]`)
    if (element) {
      const top   = element.getBoundingClientRect().top
      window.scroll({
        top,
        behavior: "smooth"
      })
    }
  }
}

// chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
//   const { type, value } = obj
//   if (type === "CT_HIGHLIGHT_DATA") {
//     window.localStorage.setItem("CT_HIGHLIGHT_DATA", JSON.stringify(value) || [])
//     window.highlightPage()
//   }

//   if (type === "CT_HIGHLIGHT_DATA_DELETE") {
//     window.localStorage.setItem("CT_HIGHLIGHT_DATA_DELETE", JSON.stringify(value.details_id) || '')
//     window.deleteHighlight()
//   }

//   if (type === "CT_SCROLL_TO_VIEW") {
//     scrollToView(value)
//   }
// })



// menu 
function showMenuOnHighlights () {
  const highlights    = new window.Highlighter()

  highlights
    .on(window.Highlighter.event.CLICK, (data,inst,e) => {

        const highlightData = JSON.parse(window.localStorage.getItem("CT_HIGHLIGHT_DATA"))

        let found = highlightData &&  highlightData.filter(item => item.media?.details?.id === data.id)

        if (found.length !== 0) {
          found = found[0]
          const button = document.createElement('button')

        button.classList.add('button-menu-edit')

        const yellowSpan = document.createElement('span')
        const greenSpan = document.createElement('span')
        const violetSpan = document.createElement('span')
        const redSpan = document.createElement('span')

        yellowSpan.classList.add('yellowSpan')
        greenSpan.classList.add('greenSpan')
        violetSpan.classList.add('violetSpan')
        redSpan.classList.add('redSpan')

        const msgSpan = document.createElement('span')
        const tagSpan = document.createElement('span')
        const copySpan = document.createElement('span')
        const editSpan = document.createElement('span')
        const aiSpan = document.createElement('span')
        const deleteSpan = document.createElement('span')

        msgSpan.classList.add('span-flex')
        tagSpan.classList.add('span-flex')
        copySpan.classList.add('span-flex')
        editSpan.classList.add('span-flex')
        aiSpan.classList.add('span-flex')
        deleteSpan.classList.add('span-flex')

        msgSpan.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" id='message-svg' title="Open Highlights"> 
            <path fill="none" d="M0 0h24v24H0z"/>
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"/>
          </svg>
        `

        editSpan.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M15.7279 9.57629L14.3137 8.16207L5 17.4758V18.89H6.41421L15.7279 9.57629ZM17.1421 8.16207L18.5563 6.74786L17.1421 5.33365L15.7279 6.74786L17.1421 8.16207ZM7.24264 20.89H3V16.6474L16.435 3.21233C16.8256 2.8218 17.4587 2.8218 17.8492 3.21233L20.6777 6.04075C21.0682 6.43128 21.0682 7.06444 20.6777 7.45497L7.24264 20.89Z"></path></svg>
        `
        // editSpan.innerHTML = `
        // <svg xmlns="http://www.w3.org/2000/svg" id='edit-svg' width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="black" class="w-6 h-6" >
        //   <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
        // </svg>
        // `

        // msgSpan.innerHTML= `
        //   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="24" id='message-svg'>
        //     <path fill="none" d="M0 0h24v24H0z" />
        //     <path
        //         d="M14.45 19L12 22.5 9.55 19H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-6.55zm-1.041-2H20V5H4v12h6.591L12 19.012 13.409 17z" />
        // </svg>
        // `

        tagSpan.innerHTML= `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="24" id='tag-svg'>
            <path fill="none" d="M0 0h24v24H0z" />
            <path
                d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z" />
        </svg>`

        copySpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="24" id='copy-svg'>
            <path fill="none" d="M0 0h24v24H0z" />
            <path
                d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zm2 0h8v10h2V4H9v2z" />
        </svg>`

        aiSpan.innerHTML = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" id='robot-svg'>
            <rect width="32" height="32" rx="4" fill="#F8FBFF" />
            <rect x="10" y="13" width="12" height="11" rx="3" fill="#DADDE0" />
            <rect x="21" y="19" width="3" height="2" fill="#DADDE0" />
            <rect x="8" y="19" width="3" height="2" fill="#DADDE0" />
            <rect x="10" y="22" width="1" height="1" fill="#DADDE0" />
            <rect x="21" y="21" width="1" height="2" fill="#DADDE0" />
            <path
                d="M25.1654 18.4993V20.9993C25.1654 21.4577 24.7904 21.8327 24.332 21.8327H23.4987V22.666C23.4987 23.591 22.757 24.3327 21.832 24.3327H10.1654C9.72334 24.3327 9.29941 24.1571 8.98685 23.8445C8.67429 23.532 8.4987 23.108 8.4987 22.666V21.8327H7.66536C7.20703 21.8327 6.83203 21.4577 6.83203 20.9993V18.4993C6.83203 18.041 7.20703 17.666 7.66536 17.666H8.4987C8.4987 14.441 11.107 11.8327 14.332 11.8327H15.1654V10.7743C14.6654 10.491 14.332 9.94935 14.332 9.33268C14.332 8.41602 15.082 7.66602 15.9987 7.66602C16.9154 7.66602 17.6654 8.41602 17.6654 9.33268C17.6654 9.94935 17.332 10.491 16.832 10.7743V11.8327H17.6654C20.8904 11.8327 23.4987 14.441 23.4987 17.666H24.332C24.7904 17.666 25.1654 18.041 25.1654 18.4993ZM23.4987 19.3327H21.832V17.666C21.832 15.366 19.9654 13.4993 17.6654 13.4993H14.332C12.032 13.4993 10.1654 15.366 10.1654 17.666V19.3327H8.4987V20.166H10.1654V22.666H21.832V20.166H23.4987V19.3327Z"
                fill="#062046" />
            <path
                d="M18.9141 20.5833C19.8391 20.5833 20.5807 19.8417 20.5807 18.9167C20.5807 18 19.8307 17.25 18.9141 17.25C17.9974 17.25 17.2474 17.9917 17.2474 18.9167C17.2474 19.8417 17.9891 20.5833 18.9141 20.5833Z"
                fill="#062046" />
            <path
                d="M11.4141 18.9167C11.4141 18 12.1641 17.25 13.0807 17.25C14.0057 17.25 14.7474 17.9917 14.7474 18.9167C14.7474 19.8417 13.9974 20.5833 13.0807 20.5833C12.1641 20.5833 11.4141 19.8333 11.4141 18.9167Z"
                fill="#062046" />
        </svg>`

        deleteSpan.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z"/></svg>
        `

        yellowSpan.addEventListener('click', () => {
          // updateHighlight('#FFFAB3')
          chrome.storage.sync.remove("highlightUpdate")
          chrome.storage.sync.set({"highlightUpdate": {
            current: getUpdateHighlight('#FFFAB3', found)
          }})
          window.panelToggle("?edit-highlight", true)
        })

        greenSpan.addEventListener('click', () => {
          // updateHighlight('#D2F9C8')
          chrome.storage.sync.remove("highlightUpdate")
          chrome.storage.sync.set({"highlightUpdate": {
            current: getUpdateHighlight('#D2F9C8', found)
          }})
          window.panelToggle("?edit-highlight", true)
        })
        violetSpan.addEventListener('click', () => {
          // updateHighlight('#C1C1FF')
          chrome.storage.sync.remove("highlightUpdate")
          chrome.storage.sync.set({"highlightUpdate": {
            current: getUpdateHighlight('#C1C1FF', found)
          }})
          window.panelToggle("?edit-highlight", true)
        })
        redSpan.addEventListener('click', () => {
          // updateHighlight('#FFAFED')
          chrome.storage.sync.remove("highlightUpdate")
          chrome.storage.sync.set({"highlightUpdate": {
            current: getUpdateHighlight('#FFAFED', found)
          }})
          window.panelToggle("?edit-highlight", true)
        })

        msgSpan.addEventListener('click', (e) => {
          window.panelToggle("?highlight-list", true)
          // window.panelToggle(`?update-highlight&collectionId=${found[0].collections}&gemId=${highlightData[0].id}&highlightId=${found[0]._id}`, true)
          // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          //   if (tabs.length !== 0) {
          //     chrome.runtime.sendMessage(tabs[0].id, { type: "update-highlight", url: `?update-highlight&collectionId=${found[0].collections}&gemId=${highlightData[0].id}&highlightId=${found[0]._id}` }, (res) => {
          //       if (chrome.runtime.lastError) {
          //         console.log("Error Happended!", res)
          //       }
          //       return true
          //     })
          //   }
          // })
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
          // iframe.setAttribute('id','highlightSidePanel')
          // iframe.src = chrome.runtime.getURL("index.html"+`?highlightPanel&collectionId=${found[0].collections}&gemId=${highlightData[0].id}&highlightId=${found[0]._id}`)

          // document.body.appendChild(iframe);

          // window.CT_HIGHLIGHT_FRAME = iframe
          // chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
          //   const { type, value } = obj

          //       if (type === "CLOSE_HIGHLIGHT_PANEL") {
          //         if(iframe.style.width == "460px"){
          //           iframe.style.width="0px";
          //           iframe.remove()
          //       }
          //       }
          // })

        })

        tagSpan.addEventListener('click', () => {
          button.remove()
          window.panelToggle(`?update-highlight&collectionId=${found[0].collections}&gemId=${highlightData[0].id}&highlightId=${found[0]._id}`, true)
          // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          //   if (tabs.length !== 0) {
          //     chrome.runtime.sendMessage(tabs[0].id, { type: "update-highlight", url: `?update-highlight&collectionId=${found[0].collections}&gemId=${highlightData[0].id}&highlightId=${found[0]._id}` }, (res) => {
          //       if (chrome.runtime.lastError) {
          //         console.log("Error Happended!", res)
          //       }
          //       return true
          //     })
          //   }
          // })
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
          // iframe.setAttribute('id','highlightSidePanel')
          // iframe.src = chrome.runtime.getURL("index.html"+`?highlightPanel&collectionId=${found[0].collections}&gemId=${highlightData[0].id}&highlightId=${found[0]._id}`)

          // document.body.appendChild(iframe);
          // window.CT_HIGHLIGHT_FRAME = iframe
          // chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
          //   const { type, value } = obj

          //       if (type === "CLOSE_HIGHLIGHT_PANEL") {
          //         if(iframe.style.width == "460px"){
          //           iframe.style.width="0px";
          //           iframe.remove()
          //       }
          //       }
          // })

        })

        deleteSpan.addEventListener('click', () => {
          chrome?.storage?.sync.get(['userData'], (text) => {
            if (!text || !text.userData || !text.userData.apiUrl || !text.userData.token) {
              window.showMessage("Please logged in into curateit to access this feature!", "error")
              return
            }
            if (found && found.media) {
              fetch(`${text.userData.apiUrl}/api/gems/${found.id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${text.userData.token}`
                },
              })
              .then(resp => {
                if (highlightData) {
                  const index = highlightData.findIndex((h) => { return h.id === found.id })
                  if (index !== -1) {
                    highlightData.splice(index, 1)
                    button.remove()
                    window.localStorage.setItem("CT_HIGHLIGHT_DATA_DELETE", JSON.stringify(found.id) || '')
                    window.deleteHighlight()
                    window.localStorage.setItem("CT_HIGHLIGHT_DATA", JSON.stringify(highlightData) || [])
                    window.highlightPage()
                    chrome.storage.sync.remove("highlightDelete")
                    chrome.storage.sync.set({
                      "highlightDelete": {
                        id: found.id,
                        parent: found.media.collections
                      }
                    })
                    window.panelToggle("?delete-highlight", true)
                  }
                }
              })
            }
          })
        })

        copySpan.addEventListener('click', () => {
          window.navigator.clipboard.writeText(found?.media?.text).then(() => window.showMessage('Text copied', 'success'));

          button.remove()
        })

        editSpan.addEventListener('click', () => {
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()
          button.remove()
          chrome.storage.sync.remove("highlightUpdate")
          chrome.storage.sync.set({"highlightUpdate": {
            current: found
          }})
          window.panelToggle("?edit-highlight", true)
          return false
        })

        function getUpdateHighlight(colorCode, obj){
          const hightlightColors = [
            {
              id:1,
              border: "border-l-violet-500",
              bg: "#C1C1FF",
              text: "text-violet-500",
              colorCode: '#C1C1FF',
              className: "violet-hl"
            },
            {
              id:2,
              border: "border-l-pink-500",
              bg: "#FFAFED",
              text: "text-pink-500",
              colorCode: '#FFAFED',
              className: "pink-hl"
            },
            {
              id:3,
              border: "border-l-green-300",
              bg: "#D2F9C8",
              text: "text-green-300",
              colorCode: '#D2F9C8',
              className: "green-hl"
            },
            {
              id:4,
              border: "border-l-yellow-200",
              bg: "#FFFAB3",
              text: "text-yellow-200",
              colorCode: '#FFFAB3',
              className: "yellow-hl"
            }
          ]

          const foundColor = hightlightColors.filter(item => item.colorCode === colorCode)

          return {
            ...obj,
            media: {
              ...obj.media,
              color: foundColor.length !== 0 ? foundColor[0] : null,
              styleClassName: foundColor.length !== 0 ? foundColor[0].className : ""
            }
          }
        }
        // function updateHighlight(colorCode){
        //   const hightlightColors = [
        //           {
        //             id:1,
        //             border: "border-l-violet-500",
        //             bg: "#C1C1FF",
        //             text: "text-violet-500",
        //             colorCode: '#C1C1FF',
        //             className: "violet-hl"
        //           },
        //           {
        //             id:2,
        //             border: "border-l-pink-500",
        //             bg: "#FFAFED",
        //             text: "text-pink-500",
        //             colorCode: '#FFAFED',
        //             className: "pink-hl"
        //           },
        //           {
        //             id:3,
        //             border: "border-l-green-300",
        //             bg: "#D2F9C8",
        //             text: "text-green-300",
        //             colorCode: '#D2F9C8',
        //             className: "green-hl"
        //           },
        //           {
        //             id:4,
        //             border: "border-l-yellow-200",
        //             bg: "#FFFAB3",
        //             text: "text-yellow-200",
        //             colorCode: '#FFFAB3',
        //             className: "yellow-hl"
        //           }
        //         ]

        //   const foundColor = hightlightColors.filter(item => item.colorCode === colorCode)

        //   const payload = {
        //     note: found[0].note,
        //     color: foundColor.length !== 0 ? foundColor[0] : "",
        //     text: found[0].text,
        //     link:  found[0].link,
        //     collections: found[0].collections,
        //     details: found[0].details,
        //     styleClassName: foundColor.length !== 0 ? foundColor[0].className : "",
        //     tags: found[0].tags,
        //     type: 'Highlight',
        //     box: found[0].box,
        //     _id: found[0]._id
        //   }

        //   chrome?.storage?.sync.set({
        //     'highlightedData': payload
        //   })

        //   window.panelToggle(`?update-highlight&collectionId=${found[0].collections}&gemId=${highlightData[0].id}&highlightId=${found[0]._id}`, true)
        // }
        

        // button.append(yellowSpan,greenSpan,violetSpan,redSpan,msgSpan,tagSpan,copySpan,aiSpan,deleteSpan)

        button.append(msgSpan,editSpan,copySpan,deleteSpan)


        button.style.display='flex'
        button.style.position = 'absolute'
        button.style.left = `0px`
        button.style.top = `0px`
        e.target.classList.add('ct-relative')
        e.target.appendChild(button)

        document.addEventListener("selectionchange", () => {
         button.remove()
        });

        document.addEventListener("click", (e) => {
         const isButtonClicked = button.contains(e.target)
         if(!isButtonClicked){
          button.remove()
         }
        });

        }

        
    })
}

showMenuOnHighlights()