function getShowCodeOptions(){
    return window.localStorage.getItem("CT_ENABLE_FLOAT_CODE_MENU");
}

function createButton(element){
    if (element.innerText === "") return;
    const container = element.parentElement;

    const menu = document.createElement('menu')
    const firstLi = document.createElement('li')
    const secondLi = document.createElement('li')

    menu.classList.add('menuStyle')
    firstLi.classList.add('btnLi')
    secondLi.classList.add('hideLi')

    const msgSpanCode = document.createElement('span')
    const tagSpanCode = document.createElement('span')
    const copySpanCode = document.createElement('span')

    msgSpanCode.classList.add('ct-d-flex')
    tagSpanCode.classList.add('ct-d-flex')
    copySpanCode.classList.add('ct-d-flex')

    msgSpanCode.innerHTML=`
        <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="24" id='code-message-svg'>
            <path fill="none" d="M0 0h24v24H0z" />
            <path
            d="M14.45 19L12 22.5 9.55 19H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-6.55zm-1.041-2H20V5H4v12h6.591L12 19.012 13.409 17z" />
        </svg>
    `

    msgSpanCode.addEventListener('click', () => {
        window.panelToggle("?highlight-list", true)
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
        // iframe.setAttribute('id','codeSnippetSidePanel')
        // const src = chrome.runtime.getURL("index.html")
        // iframe.src = chrome.runtime.getURL("index.html"+'?codeSnippetDetailsPanel')

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
    })
    
    tagSpanCode.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="24" id='code-tag-svg'>
            <path fill="none" d="M0 0h24v24H0z" />
            <path
                d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z" />
        </svg>
    `

    tagSpanCode.addEventListener('click', () => {
        window.panelToggle("?highlight-list", true)
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
        // iframe.setAttribute('id','codeSnippetSidePanel')
        // const src = chrome.runtime.getURL("index.html")
        // iframe.src = chrome.runtime.getURL("index.html"+'?codeSnippetDetailsPanel')

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
    })

    copySpanCode.innerHTML=`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="24" id='code-copy-svg'>
            <path fill="none" d="M0 0h24v24H0z" />
            <path
            d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zm2 0h8v10h2V4H9v2z" />
        </svg>
    `

    copySpanCode.addEventListener('click', () => {
        window.navigator.clipboard.writeText(element.innerText || element.textContent).then(() => window.showMessage('Text copied', 'success'));
    })

    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("curateit-button")

    button.innerHTML=`
     <svg width="20" height="22" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_2856_47919)">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M166.673 98.3454C170.875 101.082 174.304 103.316 178.341 106.189C184.635 110.63 188.692 115.428 190.487 119.709C191.512 122.295 192.026 125.056 191.999 127.839C191.998 131.26 191.308 134.647 189.971 137.794C189.056 140.143 187.681 142.284 185.926 144.09C184.171 145.895 182.072 147.329 179.755 148.304C177.893 149.021 175.897 149.317 173.908 149.172C171.92 149.027 169.987 148.444 168.248 147.466C166.427 146.507 164.829 145.173 163.558 143.55C162.286 141.928 161.371 140.055 160.872 138.053C160.171 135.24 160.798 127.407 164.683 127.728C166.904 127.91 167.485 130.135 167.924 131.816C168.048 132.293 168.161 132.727 168.297 133.057C169.785 136.696 173.141 137.041 175.096 135.709C178.021 133.723 176.927 129.886 176.177 128.492C174.53 125.433 171.444 122.953 165.986 119.857C163.53 118.521 160.968 117.391 158.327 116.477L158.131 116.403C156.545 115.823 154.873 115.268 153.213 114.75L151.185 114.096C151.143 116.85 151.287 119.603 151.615 122.337C152.63 130.292 155.771 137.156 157.563 141.073C158.072 142.185 158.472 143.059 158.684 143.654C161.487 151.524 161.966 156.113 161.487 161.048C160.946 166.797 158.106 176.184 149.402 180.231C146.461 181.727 143.22 182.537 139.922 182.599C136.624 182.661 133.355 181.974 130.36 180.588C123.906 177.504 122.049 173.927 120.218 168.992C119.307 166.604 118.914 164.049 119.064 161.496C119.215 158.944 119.905 156.453 121.091 154.189C122.966 150.896 126.057 148.477 129.696 147.453C134.158 146.207 137.33 148.453 137.441 150.698C137.515 152.24 135.498 154.51 134.773 155.262C133.04 157.076 131.601 163.49 135.498 165.958C139.199 168.277 146.243 165.711 146.968 159.469C147.78 152.536 145.235 138.411 134.859 123.879C129.24 115.748 126.178 106.115 126.069 96.2208V95.8014V95.382C126.178 85.4883 129.24 75.8545 134.859 67.7241C145.235 53.192 147.78 39.067 146.968 32.134C146.243 25.8919 139.186 23.3259 135.498 25.6452C131.601 28.0877 133.003 34.5272 134.773 36.3407C135.498 37.0932 137.515 39.3631 137.441 40.9051C137.33 43.1503 134.158 45.3831 129.696 44.1495C126.057 43.126 122.966 40.7064 121.091 37.4139C119.905 35.1502 119.215 32.6591 119.064 30.1066C118.914 27.554 119.307 24.9986 120.218 22.6104C122.049 17.6883 123.893 14.0984 130.36 11.0144C133.355 9.62921 136.624 8.94189 139.922 9.00385C143.22 9.0658 146.461 9.87541 149.402 11.3721C158.106 15.4184 160.946 24.8063 161.487 30.555C161.966 35.4648 161.487 40.0662 158.684 47.9491C158.471 48.5712 158.048 49.5008 157.507 50.6885C155.711 54.6357 152.617 61.4334 151.615 69.2661C151.287 72.0001 151.143 74.7533 151.185 77.5067L153.213 76.8529C154.824 76.3348 156.496 75.7797 158.131 75.1999L158.327 75.1258C160.968 74.2118 163.53 73.0813 165.986 71.7457C171.444 68.674 174.53 66.1944 176.177 63.1103C176.927 61.7163 178.021 57.8798 175.096 55.8936C173.141 54.5613 169.785 54.9191 168.297 58.5459C168.161 58.8761 168.048 59.3095 167.924 59.7868C167.485 61.4674 166.904 63.6926 164.683 63.8752C160.798 64.1959 160.171 56.3624 160.872 53.5497C161.371 51.5478 162.286 49.6744 163.558 48.0523C164.829 46.4302 166.427 45.096 168.248 44.1372C169.987 43.1585 171.92 42.576 173.908 42.4311C175.897 42.2861 177.893 42.5822 179.755 43.2983C182.072 44.2742 184.171 45.7074 185.926 47.513C187.681 49.3185 189.056 51.4595 189.971 53.8088C191.308 56.9563 191.998 60.3425 191.999 63.7642C192.025 66.5468 191.511 69.3079 190.487 71.8938C188.692 76.2238 184.635 81.0473 178.341 85.4636C173.726 88.6934 169.915 91.1847 164.819 94.5157C164.173 94.9379 163.506 95.3736 162.814 95.8261C164.187 96.7259 165.462 97.5566 166.673 98.3454ZM118.804 123.274C120.07 123.916 120.771 124.483 120.931 125.026C121.002 126.036 120.71 127.039 120.107 127.851C106.867 151.228 79.8213 163.86 52.7757 159.259C27.021 154.904 5.88856 133.637 1.41375 107.558C0.980679 105.044 0.703622 102.441 0.434041 99.9086L0.39339 99.5269L0.393384 99.5268C0.270451 98.2932 0.147519 97.0596 0 95.826C0.0758392 81.7211 4.75234 68.029 13.3147 56.8429C21.877 45.6567 33.8541 37.5918 47.4151 33.881C60.9762 30.1701 75.3751 31.0175 88.4109 36.2936C101.447 41.5696 112.402 50.9841 119.603 63.0979C120.685 64.825 121.066 66.071 120.832 66.7988C120.599 67.5266 119.652 68.2545 117.943 69.0317C108.551 73.2753 99.5892 72.5228 90.5412 66.7494C76.3423 57.6823 56.3409 58.3485 42.9902 68.3162C31.4958 76.9145 26.6399 88.3379 28.9756 101.353C31.5204 115.576 40.7774 125.334 55.7385 129.59C68.6712 133.254 80.5589 131.638 91.0452 124.767C100.056 118.858 109.141 118.34 118.804 123.274ZM70.4661 107.126H73.9451C75.2297 107.126 76.4617 107.638 77.3701 108.55C78.2784 109.461 78.7887 110.698 78.7887 111.987C78.7887 113.276 78.2784 114.512 77.3701 115.424C76.4617 116.335 75.2297 116.847 73.9451 116.847H70.4661C69.1815 116.847 67.9495 116.335 67.0411 115.424C66.1327 114.512 65.6224 113.276 65.6224 111.987C65.6224 110.698 66.1327 109.461 67.0411 108.55C67.9495 107.638 69.1815 107.126 70.4661 107.126ZM73.9451 74.7803H70.4661C69.1815 74.7803 67.9495 75.2924 67.0411 76.2039C66.1327 77.1154 65.6224 78.3517 65.6224 79.6408C65.6224 80.9299 66.1327 82.1662 67.0411 83.0777C67.9495 83.9892 69.1815 84.5013 70.4661 84.5013H73.9451C75.2297 84.5013 76.4617 83.9892 77.3701 83.0777C78.2784 82.1662 78.7887 80.9299 78.7887 79.6408C78.7887 78.3517 78.2784 77.1154 77.3701 76.2039C76.4617 75.2924 75.2297 74.7803 73.9451 74.7803Z" fill="#105FD3"/>
            </g>
            <defs>
            <clipPath id="clip0_2856_47919">
            <rect width="192" height="192" fill="white"/>
            </clipPath>
            </defs>
        </svg>
    `

    button.addEventListener('click', () => {
        navigator.clipboard.writeText(element.textContent.trim())

        chrome.storage.sync.remove("codeSnippetData")
        chrome.storage.sync.set({'codeSnippetData': {
            code: element.textContent.trim(),
        }})

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
        // iframe.setAttribute('id','codeSnippetSidePanel')
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
    })


    firstLi.append(button)
    secondLi.append(copySpanCode)
    // secondLi.append(msgSpanCode,tagSpanCode,copySpanCode)
  
    
    menu.append(firstLi,secondLi)
    menu.classList.add("code-snippet-menu")
    container.insertBefore(menu, container.firstChild);  
   
}

const removeAllCode = (menuArr) => {
    if (menuArr.length !== 0) {
        menuArr.forEach((menu) => {
            menu.remove()
        })
    }
}

window.fetchAndCreateCodeButton = () => {
    const codeBlocks    = document.querySelectorAll("pre > code, div > code");
    const codeMenuArr   = document.querySelectorAll(".code-snippet-menu");

    removeAllCode(codeMenuArr)

    const visibility    = getShowCodeOptions()
    if (visibility === null || visibility !== "HIDE") {
        for (const codeBlock of codeBlocks) {
            createButton(codeBlock)
        }
    }
}

