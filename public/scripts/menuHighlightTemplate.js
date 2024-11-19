const template = `
  <template id="highlightTemplate">
  </template>

  <button id="mediumHighlighter" style="background-color: white !important;">
  <span class='yellowEclipse' id='yellowEclipse' style="background:#FFFAB3 !important;"></span>
  <span class='greenEclipse' id='greenEclipse' style="background:#D2F9C8 !important;"></span>
  <span class='violetEclipse' id='violetEclipse' style="background:#C1C1FF !important;"></span>
  <span class='redEclipse' id='redEclipse' style="background:#FFAFED !important;"></span>

  <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      height="24"
      width="20"
      id="ct-ask-ai-btn"
    >
      <path stroke="none" d="M0 0h24v24H0z" />
      <path d="M7 7h10a2 2 0 012 2v1l1 1v3l-1 1v3a2 2 0 01-2 2H7a2 2 0 01-2-2v-3l-1-1v-3l1-1V9a2 2 0 012-2zM10 16h4" />
      <path
        fill="currentColor"
        d="M9 11.5 A0.5 0.5 0 0 1 8.5 12 A0.5 0.5 0 0 1 8 11.5 A0.5 0.5 0 0 1 9 11.5 z"
      />
      <path
        fill="currentColor"
        d="M16 11.5 A0.5 0.5 0 0 1 15.5 12 A0.5 0.5 0 0 1 15 11.5 A0.5 0.5 0 0 1 16 11.5 z"
      />
      <path d="M9 7L8 3M15 7l1-4" />
    </svg>
  
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="24" id='message-svg'><path fill="none" d="M0 0h24v24H0z"/><path d="M14.45 19L12 22.5 9.55 19H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-6.55zm-1.041-2H20V5H4v12h6.591L12 19.012 13.409 17z"/></svg>
  
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="24" id='tag-svg'><path fill="none" d="M0 0h24v24H0z"/><path d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z"/></svg>
  
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="24" id='copy-svg'><path fill="none" d="M0 0h24v24H0z"/><path d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zm2 0h8v10h2V4H9v2z"/></svg>
  
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="24" id='read-svg'><path d="M12 13.3332L2.77735 19.4816C2.54759 19.6348 2.23715 19.5727 2.08397 19.3429C2.02922 19.2608 2 19.1643 2 19.0656V4.93408C2 4.65794 2.22386 4.43408 2.5 4.43408C2.59871 4.43408 2.69522 4.4633 2.77735 4.51806L12 10.6665V4.93408C12 4.65794 12.2239 4.43408 12.5 4.43408C12.5987 4.43408 12.6952 4.4633 12.7774 4.51806L23.376 11.5838C23.6057 11.737 23.6678 12.0474 23.5146 12.2772C23.478 12.3321 23.4309 12.3792 23.376 12.4158L12.7774 19.4816C12.5476 19.6348 12.2372 19.5727 12.084 19.3429C12.0292 19.2608 12 19.1643 12 19.0656V13.3332ZM10.3944 11.9998L4 7.73686V16.2628L10.3944 11.9998ZM14 7.73686V16.2628L20.3944 11.9998L14 7.73686Z"></path></svg>
  
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="24" id='copy-link-to-highlight'><path d="M18.3643 15.5353L16.95 14.1211L18.3643 12.7069C20.3169 10.7543 20.3169 7.58847 18.3643 5.63585C16.4116 3.68323 13.2458 3.68323 11.2932 5.63585L9.87898 7.05007L8.46477 5.63585L9.87898 4.22164C12.6127 1.48797 17.0448 1.48797 19.7785 4.22164C22.5121 6.95531 22.5121 11.3875 19.7785 14.1211L18.3643 15.5353ZM15.5358 18.3638L14.1216 19.778C11.388 22.5117 6.9558 22.5117 4.22213 19.778C1.48846 17.0443 1.48846 12.6122 4.22213 9.87849L5.63634 8.46428L7.05055 9.87849L5.63634 11.2927C3.68372 13.2453 3.68372 16.4112 5.63634 18.3638C7.58896 20.3164 10.7548 20.3164 12.7074 18.3638L14.1216 16.9496L15.5358 18.3638ZM14.8287 7.75717L16.2429 9.17139L9.17187 16.2425L7.75766 14.8282L14.8287 7.75717Z"></path></svg>
  
  
  
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" id='robot-svg'>
  <rect width="32" height="32" rx="4" fill="#F8FBFF"/>
  <rect x="10" y="13" width="12" height="11" rx="3" fill="#DADDE0"/>
  <rect x="21" y="19" width="3" height="2" fill="#DADDE0"/>
    <rect x="8" y="19" width="3" height="2" fill="#DADDE0"/>
    <rect x="10" y="22" width="1" height="1" fill="#DADDE0"/>
    <rect x="21" y="21" width="1" height="2" fill="#DADDE0"/>
    <path d="M25.1654 18.4993V20.9993C25.1654 21.4577 24.7904 21.8327 24.332 21.8327H23.4987V22.666C23.4987 23.591 22.757 24.3327 21.832 24.3327H10.1654C9.72334 24.3327 9.29941 24.1571 8.98685 23.8445C8.67429 23.532 8.4987 23.108 8.4987 22.666V21.8327H7.66536C7.20703 21.8327 6.83203 21.4577 6.83203 20.9993V18.4993C6.83203 18.041 7.20703 17.666 7.66536 17.666H8.4987C8.4987 14.441 11.107 11.8327 14.332 11.8327H15.1654V10.7743C14.6654 10.491 14.332 9.94935 14.332 9.33268C14.332 8.41602 15.082 7.66602 15.9987 7.66602C16.9154 7.66602 17.6654 8.41602 17.6654 9.33268C17.6654 9.94935 17.332 10.491 16.832 10.7743V11.8327H17.6654C20.8904 11.8327 23.4987 14.441 23.4987 17.666H24.332C24.7904 17.666 25.1654 18.041 25.1654 18.4993ZM23.4987 19.3327H21.832V17.666C21.832 15.366 19.9654 13.4993 17.6654 13.4993H14.332C12.032 13.4993 10.1654 15.366 10.1654 17.666V19.3327H8.4987V20.166H10.1654V22.666H21.832V20.166H23.4987V19.3327Z" fill="#062046"/>
    <path d="M18.9141 20.5833C19.8391 20.5833 20.5807 19.8417 20.5807 18.9167C20.5807 18 19.8307 17.25 18.9141 17.25C17.9974 17.25 17.2474 17.9917 17.2474 18.9167C17.2474 19.8417 17.9891 20.5833 18.9141 20.5833Z" fill="#062046"/>
    <path d="M11.4141 18.9167C11.4141 18 12.1641 17.25 13.0807 17.25C14.0057 17.25 14.7474 17.9917 14.7474 18.9167C14.7474 19.8417 13.9974 20.5833 13.0807 20.5833C12.1641 20.5833 11.4141 19.8333 11.4141 18.9167Z" fill="#062046"/>
    </svg>
  <svg xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" width="10" height="10" 
      id='close-svg'
      style='position: absolute; top:1px; left:1px'
  >
    <path d="M12.0007 10.5865L16.9504 5.63672L18.3646 7.05093L13.4149 12.0007L18.3646 16.9504L16.9504 18.3646L12.0007 13.4149L7.05093 18.3646L5.63672 16.9504L10.5865 12.0007L5.63672 7.05093L7.05093 5.63672L12.0007 10.5865Z"></path>
  </svg>
    
  </button>
`;

const styled = ({ display = "none", }) => `
  #mediumHighlighter {
    align-items: center;
    background-color: white;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    display: ${display};
    
    padding: 5px 10px;
    position: fixed;
    
    width: 200px;
    z-index: 9999;
    justify-content: space-between;
    box-shadow: 0 0 0 0.5px rgb(0 0 0 / 15%), 0 0.5px 0 rgb(0 0 0 / 10%), 0 6px 12px rgb(0 0 0 / 10%), 0 10px 20px rgb(0 0 0 / 5%) !important;
  }
  #close-icon {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  #message-svg {
    display: none;
  }
  #robot-svg {
    display: none;
  }
  #tag-svg {
    display: none;
  }
  .yellowEclipse{
    width: 14px;
    height: 14px;
    left: 37px;
    top: 7px;
    background: #FFFAB3;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 50%
  }
  .greenEclipse{
    width: 14px;
    height: 14px;
    left: 37px;
    top: 7px;
    background: #D2F9C8;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 50%
  }
  .redEclipse{
    width: 14px;
    height: 14px;
    left: 37px;
    top: 7px;
    background: #FFAFED;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 50%
  }
  .violetEclipse{
    width: 14px;
    height: 14px;
    left: 37px;
    top: 7px;
    background: #C1C1FF;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 50%
  }
`;

class MediumHighlighter extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  get markerPosition() {
    return JSON.parse(this.getAttribute("markerPosition") || "{}");
  }

  get styleElement() {
    return this.shadowRoot.querySelector("style");
  }

  get highlightTemplate() {
    return this.shadowRoot.getElementById("highlightTemplate");
  }

  static get observedAttributes() {
    return ["markerPosition"];
  }

  render() {
    this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = styled({});
    this.shadowRoot.appendChild(style);
    this.shadowRoot.innerHTML += template;
    // this.shadowRoot
    //   .getElementById("close-icon")
    //   .addEventListener("click", (e) => this.handleClose(e));
    this.shadowRoot
      .getElementById("yellowEclipse")
      .addEventListener("click", () => this.handleSendHighlightData('#FFFAB3'));
    this.shadowRoot
      .getElementById("greenEclipse")
      .addEventListener("click", () => this.handleSendHighlightData('#D2F9C8'));
    this.shadowRoot
      .getElementById("violetEclipse")
      .addEventListener("click", () => this.handleSendHighlightData('#C1C1FF'));
    this.shadowRoot
      .getElementById("redEclipse")
      .addEventListener("click", () => this.handleSendHighlightData('#FFAFED'));
    this.shadowRoot
      .getElementById("ct-ask-ai-btn")
      .addEventListener("click", (e) => this.handleAskAi(e));
    this.shadowRoot
      .getElementById("message-svg")
      .addEventListener("click", () => this.handleMessagePanel());
    this.shadowRoot
      .getElementById("copy-svg")
      .addEventListener("click", () => this.handleCopy());
    this.shadowRoot
      .getElementById("tag-svg")
      .addEventListener("click", () => this.handleMessagePanel());
    this.shadowRoot
      .getElementById("read-svg")
      .addEventListener("click", () => this.speedRead());
    this.shadowRoot
      .getElementById("copy-link-to-highlight")
      .addEventListener("click", () => this.copyLinkToHighlight());
    this.shadowRoot
      .getElementById("close-svg")
      .addEventListener("click", () => this.hideMediumHighlight());
  }









  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "markerPosition") {
      // this.styleElement.textContent = styled(this.markerPosition);
      const mediumHighlighter = this.shadowRoot.getElementById("mediumHighlighter")
      mediumHighlighter.style.display = this.markerPosition.display
      mediumHighlighter.style.left = `${this.markerPosition.left}px`
      mediumHighlighter.style.top = `${this.markerPosition.top}px`
    }
  }

  handleSendHighlightData(colorCode) {
    const s = window.getSelection()
    const tRange = s.getRangeAt(0)
    const rect = tRange.getClientRects()

    const hightlightColors = [
      {
        id: 1,
        border: "border-l-violet-500",
        bg: "#C1C1FF",
        text: "text-violet-500",
        colorCode: '#C1C1FF',
        className: "violet-hl"
      },
      {
        id: 2,
        border: "border-l-pink-500",
        bg: "#FFAFED",
        text: "text-pink-500",
        colorCode: '#FFAFED',
        className: "pink-hl"
      },
      {
        id: 3,
        border: "border-l-green-300",
        bg: "#D2F9C8",
        text: "text-green-300",
        colorCode: '#D2F9C8',
        className: "green-hl"
      },
      {
        id: 4,
        border: "border-l-yellow-200",
        bg: "#FFFAB3",
        text: "text-yellow-200",
        colorCode: '#FFFAB3',
        className: "yellow-hl"
      }
    ]

    const defaultC = {
      id: 4,
      border: "border-l-yellow-200",
      bg: "#FFFAB3",
      text: "text-yellow-200",
      colorCode: '#FFFAB3',
      className: "yellow-hl"
    }
    const foundColor = hightlightColors.filter(item => item.colorCode === colorCode)
    const hls = new window.Highlighter()
    const details = hls.fromRange(tRange)
    if (foundColor.length !== 0) hls.addClass(foundColor[0].className, details.id)

    // let newLink = window.location.href.endsWith('/') ? window.location.href.slice(0, -1) : window.location.href
    chrome.storage.sync.remove("highlightedData")
    chrome.storage.sync.set({
      'highlightedData': {
        text: details.text.replace("\t", ""),
        details,
        styleClassName: (foundColor.length !== 0) ? foundColor[0].className : defaultC.className,
        colorCode: foundColor.length !== 0 ? foundColor[0] : defaultC,
        box: {
          right: rect[0].right,
          left: rect[0].left,
          top: rect[0].top,
          bottom: rect[0].bottom,
          width: rect[0].width,
          height: rect[0].height,
          x: rect[0].x,
          y: rect[0].y,
        }
      }
    })
    window.panelToggle(`?add-highlight`, true)
    // this.styleElement.textContent = styled({ display: "none" })
    const mediumHighlighter = this.shadowRoot.getElementById("mediumHighlighter")
    mediumHighlighter.style.display = 'none'
    // chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    //   if (tabs.length !== 0) {

    //     // chrome.runtime.sendMessage(tabs[0].id, "add-highlight", (res) => {
    //     //   if (chrome.runtime.lastError) {
    //     //     console.log("Error Happended!", res)
    //     //   }
    //     //   return true
    //     // })
    //   }
    // })

    // chrome?.storage?.sync.get(['userData'],function(text){

    //   fetch(`${text.userData.apiUrl}/api/highlights?url=${encodeURIComponent(newLink)}`,{
    //         method:"GET",
    //         headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${text.userData.token}`
    //       },
    //       })
    //         .then(response => {    
    //           return response.json()
    //         })
    //         .then(data => {

    //           if(data.length >0){
    //             const payload = {
    //               note: '',
    //               color: foundColor.length !== 0 ? foundColor[0] : "",
    //               link: newLink,
    //               collections: text.userData.unfilteredCollectionId,
    //               tags: [],
    //               type:'Highlight',
    //               text: details.text.replace("\t", ""), 
    //               details,
    //               styleClassName: foundColor.length !== 0 ? foundColor[0].className : "",
    //               box: {
    //                   right: rect[0].right,
    //                   left: rect[0].left,
    //                   top: rect[0].top,
    //                   bottom: rect[0].bottom,
    //                   width: rect[0].width,
    //                   height: rect[0].height,
    //                   x: rect[0].x,
    //                   y: rect[0].y,
    //               },
    //               _id: details.id
    //             }

    //             fetch(`${text.userData.apiUrl}/api/collections/${payload.collections}/highlights/${data[0].id}`, {
    //               method: 'PUT',
    //               headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${text.userData.token}`
    //               },
    //               body: JSON.stringify(payload)  
    //             })
    //             .then(resp => {
    //               fetch(`${text.userData.apiUrl}/api/highlights?url=${encodeURIComponent(payload.link)}`,{
    //                 method:"GET",
    //                 headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${text.userData.token}`
    //               },
    //               })
    //                 .then(response => {    
    //                   return response.json()
    //                 })
    //                 .then(data => {
    //                   // window.getSelection().empty();
    //                   window.localStorage.setItem("CT_HIGHLIGHT_DATA", JSON.stringify(data) || [])
    //                   window.highlightPage()
    //                 })
    //                 .catch(error => {
    //                   console.log(error);
    //                 });
    //             })
    //           }else{


    //     const payload = {
    //       note: '',
    //       color: foundColor.length !== 0 ? foundColor[0] : "",
    //       link: newLink,
    //       collections: text.userData.unfilteredCollectionId,
    //       tags: [],
    //       type:'Highlight',
    //       text: details.text.replace("\t", ""), 
    //       details,
    //       styleClassName: foundColor.length !== 0 ? foundColor[0].className : "",
    //       box: {
    //           right: rect[0].right,
    //           left: rect[0].left,
    //           top: rect[0].top,
    //           bottom: rect[0].bottom,
    //           width: rect[0].width,
    //           height: rect[0].height,
    //           x: rect[0].x,
    //           y: rect[0].y,
    //       },
    //       _id: details.id
    //     }

    //     fetch(`${text.userData.apiUrl}/api/collections/${payload.collections}/highlights`, {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${text.userData.token}`
    //       },
    //       body: JSON.stringify([payload])  
    //     })
    //     .then(resp => {
    //       if(resp){

    //         return resp.json()
    //       }
    //     })
    //     .then( json => {
    //       // window.getSelection().empty();

    //       fetch(`${text.userData.apiUrl}/api/highlights?url=${encodeURIComponent(newLink)}`,{
    //         method:"GET",
    //         headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${text.userData.token}`
    //       },
    //       })
    //         .then(response => {    
    //           return response.json()
    //         })
    //         .then(data => {
    //           window.localStorage.setItem("CT_HIGHLIGHT_DATA", JSON.stringify(data) || [])
    //           window.highlightPage()
    //         })
    //         .catch(error => {
    //           console.log(error);
    //         });
    //     })
    //           }
    //         })

    //     });
  }

  handleClose(e) {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    const mediumHighlighter = this.shadowRoot.getElementById("mediumHighlighter")
    mediumHighlighter.style.display = 'none'
    return false
  }

  handleAskAi(e) {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    const prompt = window.getSelection().getRangeAt(0).cloneContents().textContent.trim()
    // window.openAskAiPopup(prompt)
    chrome.storage.local.remove("aiData");
    chrome.storage.local.set({
      aiData: {
        text: prompt,
      },
    });
    window.panelToggle(`?add-ai`, true);
    const mediumHighlighter =
      this.shadowRoot.getElementById("mediumHighlighter");
    mediumHighlighter.style.display = "none";
    return false
  }

  handleMessagePanel() {
    window.panelToggle("?highlight-list", true)
    // this.styleElement.textContent = styled({ display: "none" })
    const mediumHighlighter = this.shadowRoot.getElementById("mediumHighlighter")
    mediumHighlighter.style.display = 'none'
    // chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    //   if (tabs.length !== 0) {
    //     chrome.runtime.sendMessage(tabs[0].id, "open-highlight-list", (res) => {
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
    // // const src = chrome.runtime.getURL("index.html")
    // iframe.src = chrome.runtime.getURL("index.html"+'?highlightPanel')

    // document.body.appendChild(iframe);

    // // window.getSelection().empty();

    // window.CT_HIGHLIGHT_FRAME     = iframe
    // window.HIGHLIGHT_CLOSE_TOGGLE = this.toggle

    //     chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
    //       const { type, value } = obj

    //       if (type === "CLOSE_HIGHLIGHT_PANEL") {
    //         this.toggle(iframe)
    //       }
    // })
  }

  handleCopy() {
    const s = window.getSelection()
    const text = s.toString()
    window.navigator.clipboard.writeText(text).then(() => window.showMessage('Text copied', 'success'));

    window.getSelection().empty();
  }

  toggle(iframe) {
    if (iframe.style.width == "460px") {
      iframe.style.width = "0px";
      iframe.remove()
    }
  }

  speedRead() {
    // chrome.tabs.sendMessage(e[0].id,{type:"click"})
    const s = window.getSelection()
    if (s) {
      window.createPopupOnScreen()
    }
    // const text = s.toString()
    // window.navigator.clipboard.writeText(text).then(() => window.showMessage('Text', 'success'));
    // window.speedRead()
  }


  copyLinkToHighlight() {
    window.copyLinkToHighlight();
  }

  hideMediumHighlight() {
    window.showTurnOffUI()
    // window.localStorage.setItem("CT_ENABLE_FLOAT_MENU","HIDE")
    // window.localStorage.setItem("CT_ENABLE_FLOAT_CODE_MENU","HIDE")
    // window.localStorage.setItem("CT_ENABLE_FLOAT_IMAGE_MENU","HIDE")
    // window.enableFloatMenu()
    // window.fetchAndCreateCodeButton()
    // window.removeSaveImageIcons()
    // const iframe = document.getElementById("curateit-iframe")
    // if (iframe) {
    //   iframe.contentWindow.postMessage("CT_HIDE_MY_HIGHLIGHT", chrome.runtime.getURL("index.html"))
    // }
    // window.getSelection()?.removeAllRanges();
  }


}

window.customElements.define("medium-highlighter", MediumHighlighter);
