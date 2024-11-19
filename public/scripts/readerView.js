const INCREASEDECRAEBY = 0.2
let isQuotaExeed = false;
let bodyCont = ""
// chrome.runtime.onMessage.addListener((obj, sender, response) => {
//     const { type, value } = obj;

//     if (type === "READER_VIEW" && value === true) {
//         showReader()
//     }
// })
window.showReader = () => {
  const article = new Readability(document).parse()

  if (article) {
    const domParser = new DOMParser()
    const doc = domParser.parseFromString(article.content, "text/html")
    const totalWords = article.textContent.split(" ").length
    const readTime = Math.floor(totalWords / 200) //200 words per minute
    const modal = document.createElement("div")
    const bodyContent = doc.body.innerHTML.replace(/\n/g, "")
    bodyCont = doc.body.textContent
    modal.classList.add("reader-modal")

    modal.innerHTML = `
            <div class='modal-inner'>
                <div></div>
                <div>
                    <div class='top-container'>
                        <div class='top-info'>
                            <span>${totalWords} Words</span>
                            <span>${readTime} min read</span>
                            <button class='show-speech-to-text-handler play-button' title='Listen content'>
                                <img src=${chrome.runtime.getURL(
                                  "icons/play-button-outline.svg"
                                )} alt="" />
                                <span>Listen</span>
                            </button>
                        </div>
                        <div class='top-actions'>
                            <button style='display:none' title='Open page'>
                                 <img src=${chrome.runtime.getURL(
                                   "icons/message-circle.svg"
                                 )} alt="" />
                            </button>
                            <button id='copy-top-clipboard' title='Copy Text'>
                                 <img src=${chrome.runtime.getURL(
                                   "icons/copy-icon.svg"
                                 )} alt="" />
                            </button>
                            <button id='add-to-bookmark' title='Save Bookmark'>
                                 <img src=${chrome.runtime.getURL(
                                   "icons/bookmark-icon-dark.svg"
                                 )} alt="" />
                            </button>
                            <button style='display:none'>
                                 <img src=${chrome.runtime.getURL(
                                   "icons/share-icon.svg"
                                 )} alt="" />
                            </button>
                        </div>
                    </div>
                    <div id="reader-container" class='contentWrapper' style="font-size:1rem; color: "#000">
                        <h2 class='modal-title'>${article.title}</h2>
                        ${bodyContent}
                    </div>
                </div>
                <div>
                </div>

                
                <div class='reader-control-container'>
                    <div class='reader-control-main'>
                        <button id='close-btn' class='close-btn'>
                            <img src=${chrome.runtime.getURL(
                              "icons/close.svg"
                            )} alt='' />
                        </button>
                        <button id='handle-full-screen' class='close-btn action-btns'>
                            <img id="arrow-out" src=${chrome.runtime.getURL(
                              "icons/arrows-pointing-out.svg"
                            )} alt='' />
                            <img id="arrow-in"  style="display:none" src=${chrome.runtime.getURL(
                              "icons/fullscreen-exit-line.svg"
                            )} alt='' />
                        </button>
                        <button id='handle-dark-mode' class='close-btn action-btns'>
                            <img id="sun-icon" src=${chrome.runtime.getURL(
                              "icons/sun.svg"
                            )} alt='' />
                            <img id="moon-icon" style="display:none" src=${chrome.runtime.getURL(
                              "icons/moon-line.svg"
                            )} alt='' />
                        </button>
                        <div style="position:relative">
                            <button id='save-handler' class='close-btn action-btns'>
                                <img src=${chrome.runtime.getURL(
                                  "icons/save-icon.svg"
                                )} alt='' />
                            </button>
                            <div style='display:none' id='save-options' class="save-options">
                                <button id='save-doc-as-text'>Text</button>
                            </div>
                        </div>
                        <div style="position:relative">
                            <button id='show-font-size-handler' class='close-btn action-btns'>
                                <img class='x-mark-red' style='display:none' src=${chrome.runtime.getURL(
                                  "icons/x-mark-red.svg"
                                )} alt='' />
                                <span class='default-btn'>T</span>
                            </button>
                            <div style='display:none' id='font-size-control' class="save-options font-control-container">
                                <button id="decrease-size" class='small-button change-font-size'>
                                    <span>T</span>
                                </button>
                                <button id="reset-size" class='small-medium change-font-size'>
                                    <span>T</span>
                                </button>
                                <button id="increase-size" class='large-button change-font-size'>
                                    <span>T</span>
                                </button>
                            </div>
                        </div>
                        <div style="position:relative">
                            <button id='show-font-family' class='close-btn action-btns'>
                                <img class='x-mark-red' style='display:none' src=${chrome.runtime.getURL(
                                  "icons/x-mark-red.svg"
                                )} alt='' />
                                <span class='default-btn'>Aa</span>
                            </button>
                            <div style='display:none' id='font-family-options' class="save-options typography-control-container">
                                <button id='change-font' style='color:black'>
                                    <span>Sans</span>
                                </button>
                                <button id='remove-font' style='color: #347AE2;'>
                                    <span>Serif</span>
                                </button>
                            </div>
                        </div>
                        <div style="position:relative">
                            <button id='show-summary' class='close-btn action-btns-robot'>
                                <img src=${chrome.runtime.getURL(
                                  "icons/robbot.svg"
                                )} alt='' />
                            </button>
                            <div style='display:none' id='summary-control' class="save-options summary">
                                <button class='summary-btn'>Summary</button>
                            </div>
                        </div>
                        <div style="position:relative">
                          <button id='speed-read' class='close-btn action-btns-robot'>
                            <img src=${chrome.runtime.getURL(
                              "icons/speed-line.svg"
                            )} alt='' />
                          </button>
                        </div>

                        <div style="position:relative">
                            <button id="show-color-picker" class='color-picker-btn'>
                                    <img src=${chrome.runtime.getURL(
                                      "icons/colors-selector.svg"
                                    )} alt='' />
                            </button>
                            <div style='display: none'  class='color-list-container'>
                                <button class='change-color' style="background-color: #FFFFFF"></button>
                                <button class='change-color' style="background-color: #FFFCEA"></button>
                                <button class='change-color' style="background-color: #CCDDFF"></button>
                                <button class='change-color' style="background-color: #FFECDD"></button>
                                <button class='change-color' style="background-color: #DBFFDA"></button>
                                <button class='change-color' style="background-color: #FFD6D3"></button>
                                <button class='change-color' style="background-color: #E0F1B0"></button>
                                <button class='change-color' style="background-color: #D8FFF2"></button>
                                <button class='change-color' style="background-color: #DBEEFB"></button>
                                <button class='change-color' style="background-color: #E3DFFF"></button>
                                <button class='change-color' style="background-color: #F7DDFF"></button>
                                <button class='change-color' style="background-color: #E4EDF3"></button>
                            </div>
                        </div>
                        <div class='lng-dropdown' style='display:none'>
                            <img class='lng-icon' src=${chrome.runtime.getURL(
                              "icons/language.svg"
                            )} alt='' />
                            <select>
                                <option>English, US</option>
                                <option>Hindi</option>
                            </select>
                        </div>
                        <div style='margin-top: 10px'>
                            <button class='show-speech-to-text-handler close-btn action-btns'>
                                <img src=${chrome.runtime.getURL(
                                  "icons/play-button-outline.svg"
                                )} alt='' />
                            </button>
                        </div>
                        <div style='display:none' id='media-player' class='media-player-container'>
                            <audio controls 
                            style='display:none' id="audio-player-html">
                                <source src="" type="audio/mpeg" />
                            </audio>
                            <button id='close-player-handler' class='close-player'>
                                <img src=${chrome.runtime.getURL(
                                  "icons/close.svg"
                                )} alt='' />
                            </button>
                            <div id='drag-controller' class='info-container'>
                                <div>
                                    <span>Word</span>
                                    <span class='info-text'>${totalWords}</span>
                                </div>
                                <div>
                                    <span>Time</span>
                                    <span id='audio-total-duration' class='info-text'>Loading audio...</span>
                                </div>
                            </div>
                            <div class='player-section'>
                                <div class='player-control'>
                                <button 
                                class='audio-ctrl-btn'
                                id='audio-ctrl-btn' play-status='pause'>
                                    <img id="play-ctrl-icon" src=${chrome.runtime.getURL(
                                      "icons/play-button-solid.svg"
                                    )} alt='' />
                                    <img id="pause-ctrl-icon" style="display:none" src=${chrome.runtime.getURL(
                                      "icons/pause-circle-fill.svg"
                                    )} alt='' />
                                </button >
                                    <span id='audio-current-time'>00:00</span>
                                </div>
                                <div class='progress-box'>
                                    <input type='range' value='0' id='audio-progress' />
                                </div>
                                <div class='player-control'>
                                    <button id='download-audio'>
                                        <img src=${chrome.runtime.getURL(
                                          "icons/download-alt.svg"
                                        )} alt='' />
                                    </button>
                                    <button id='audio-playback-control' current-speed='1'>
                                        <span id='audio-playback-speed' style='font-size: 20px'>1x</span>
                                    </button>
                                </div>
                            </div>
                            <div class='voice-setting-container' style='display:none'>
                                <div class='voice-setting'>
                                    <img src=${chrome.runtime.getURL(
                                      "icons/mdi_speak.svg"
                                    )} alt='' />
                                    <select>
                                        <option>Joey, Male</option>
                                        <option>Rachel, Female</option>
                                    </select>
                                </div>
                                <div class='voice-setting'>
                                    <img src=${chrome.runtime.getURL(
                                      "icons/language.svg"
                                    )} alt='' />
                                    <select>
                                        <option>English, US</option>
                                        <option>English, UK</option>
                                    </select>
                                </div>
                            </div>
                        </div>









                        
                        <div style="display:none" class='voice-container font-control-container'>
                            <button>
                                <img src=${chrome.runtime.getURL(
                                  "icons/play-button.svg"
                                )} alt='' />
                            </button>
                            <button>
                                <img src=${chrome.runtime.getURL(
                                  "icons/volumn-setting.svg"
                                )} alt='' />
                            </button>
                            <div>
                                <h6>Voice Speed</h6>
                                <div class='speed-slider'>
                                </div>
                                <h6>Select Voice</h6>
                                <div class='voice-gender-container'>
                                    <div class='input-box'>
                                        <input id="female" type="radio" name="voice-gender" value="female" checked="true" />
                                        <label for="female">Female</label>
                                    </div>
                                    <div class='input-box'>
                                        <input id="male" type="radio" name="voice-gender" value="male" />
                                        <label for="male">Male</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="display:none">
                            <div>
                                <p>Select Voice</p>
                                <select id="voices" ></select>
                            </div>

                            <div class='speechBtnWrapperDiv'>
                                <button id="start" >Start</button>
                                <button id="pause" >Pause</button>
                                <button id="resume" >Resume</button>
                                <button id="cancel" >Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    Array.prototype.forEach.call(
      document.querySelectorAll("link[rel=stylesheet]"),
      function (element) {
        try {
          element.parentNode.removeChild(element)
        } catch (err) {}
      }
    )
    document.body.append(modal)

    const BODY = {
      text: article.textContent,
      url: document.URL,
    }
    //Fetch request
    // fetch('https://54c2-115-96-106-229.ngrok.io/api/text-to-speechify', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${text.userData.token}`
    //     },
    //     body: JSON.stringify(BODY)
    // }).then(response => response.json())
    //     .then(data => {
    //         loadTextToSpeechAudio(data.data);
    //     })

    chrome?.storage?.sync.get(["userData"], function (text) {
      if (
        !text ||
        !text.userData ||
        !text.userData.apiUrl ||
        !text.userData.token
      ) {
        window.showMessage(
          "Please logged in into curateit to access this feature!",
          "error"
        )
        return
      }
      fetch(`${text.userData.apiUrl}/api/text-to-speechify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${text.userData.token}`,
        },
        body: JSON.stringify(BODY),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data?.error?.status === 429) {
            // alert("Text to speech Limit exceeded, please upgrade your plan, buy add-ons or earn some credits to unlock more!")
            isQuotaExeed = true
            return
          }
          if (data.msg && !data.data) {
            window.showMessage(data.msg, "error")
            return
          } else if (data.data) {
            loadTextToSpeechAudio(data.data)
          }
        })
    })
  } else {
    const modal = document.createElement("div")

    modal.classList.add("reader-modal")

    modal.innerHTML = `
            <div class='modal-inner'>
                <span id='close-btn' class='close-btn'>x</span>
                <p>Reader View cannot be enable</p>
            </div>
        `
    document.body.append(modal)
  }
  document.querySelector("#close-btn").addEventListener("click", () => {
    document.location.reload()
  })

  let myDocumet = document.querySelector(".reader-modal")
  //==============HANDLERS FOR SAVE OPTIONS=============
  //Hide show save hadler
  let saveButton = myDocumet.querySelector("#save-handler")
  if (saveButton) {
    saveButton.addEventListener("click", () => {
      const element = document.querySelector("#save-options")
      const displayValue = element.style.display
      if (displayValue == "none") {
        element.style.display = "flex"
      } else {
        element.style.display = "none"
      }
    })
  }

  //===============HANDLER FOR FONT SIZE OPTIONS=================
  //Hide show font size hadler
  let fontSizeBigButton = myDocumet.querySelector("#show-font-size-handler")
  if (fontSizeBigButton) {
    myDocumet
      .querySelector("#show-font-size-handler")
      .addEventListener("click", () => {
        const currentBtn = myDocumet.querySelector("#show-font-size-handler")
        const element = myDocumet.querySelector("#font-size-control")
        const displayValue = element.style.display
        if (displayValue == "none") {
          element.style.display = "flex"
          currentBtn.querySelector(".x-mark-red").style.display = "block"
          currentBtn.querySelector(".default-btn").style.display = "none"
        } else {
          element.style.display = "none"
          currentBtn.querySelector(".x-mark-red").style.display = "none"
          currentBtn.querySelector(".default-btn").style.display = "block"
        }
      })
  }

  //CHANGE FONT SIZE HANDLER
  let fontChangeBtn = myDocumet.querySelectorAll(".change-font-size")
  for (let i = 0; i < fontChangeBtn.length; i++) {
    fontChangeBtn[i].addEventListener("click", (e) => {
      let eleId = ""
      let size = 1
      const currentEle = e.target
      if (currentEle.hasAttribute("id")) {
        eleId = currentEle.id
      } else {
        eleId = currentEle.parentElement.id
      }

      const element = myDocumet.querySelector("#reader-container")
      const fontSize = element.style.fontSize.toString().split("rem")[0]

      if (eleId) {
        if (eleId === "decrease-size")
          size = parseFloat(fontSize) - INCREASEDECRAEBY
        else if (eleId === "increase-size")
          size = parseFloat(fontSize) + INCREASEDECRAEBY
        else size = 1
        element.style.fontSize = size + "rem"
      }
    })
  }

  //======HANDLERS FOR FONT FAMILY OPTIONS========
  //Hide show font family hadler
  const fontFamilyBtn = myDocumet.querySelector("#show-font-family")
  if (fontFamilyBtn) {
    fontFamilyBtn.addEventListener("click", () => {
      const element = myDocumet.querySelector("#font-family-options")
      const currentBtn = myDocumet.querySelector("#show-font-family")
      const displayValue = element.style.display
      if (displayValue == "none") {
        element.style.display = "flex"
        currentBtn.querySelector(".x-mark-red").style.display = "block"
        currentBtn.querySelector(".default-btn").style.display = "none"
      } else {
        element.style.display = "none"
        currentBtn.querySelector(".x-mark-red").style.display = "none"
        currentBtn.querySelector(".default-btn").style.display = "block"
      }
    })
  }

  //CHANGE FONT FAMILY
  const changeFontBtn = myDocumet.querySelector("#change-font")
  if (changeFontBtn) {
    changeFontBtn.addEventListener("click", () => {
      const element = myDocumet.querySelector("#reader-container")
      element.classList.add("helvetica-font")
    })
  }

  const removeFontBtn = myDocumet.querySelector("#remove-font")
  if (removeFontBtn) {
    removeFontBtn.addEventListener("click", () => {
      const element = myDocumet.querySelector("#reader-container")
      element.classList.remove("helvetica-font")
    })
  }

  //======HANDLERS FOR FONT COLOR OPTIONS========
  //Hide show color picker list
  const colorPickerBtn = myDocumet.querySelector("#show-color-picker")
  if (colorPickerBtn) {
    colorPickerBtn.addEventListener("click", () => {
      const element = myDocumet.querySelector(".color-list-container")
      const opacityVal = element.style.display
      if (opacityVal == "none") {
        element.style.display = "grid"
      } else {
        element.style.display = "none"
      }
    })
  }

  //CHANGE FONT COLOR HANDLER
  let colorChangeBtn = myDocumet.querySelectorAll(".change-color")
  for (let i = 0; i < colorChangeBtn.length; i++) {
    colorChangeBtn[i].addEventListener("click", (e) => {
      const currentColor = e.target.style.backgroundColor
      const element = myDocumet.querySelector("#reader-container")
      element.style.backgroundColor = currentColor
    })
  }

  //======HANDLERS FOR SUMMARY========
  //Hide show summary hadler
  const summaryBtn = myDocumet.querySelector("#show-summary")
  if (summaryBtn) {
    summaryBtn.addEventListener("click", () => {
      window.localStorage.setItem("ctSummary", bodyCont)
      document.location.reload()
      // const element = myDocumet.querySelector("#summary-control")
      // const displayValue = element.style.display
      // if (displayValue == "none") {
      //   element.style.display = "block"
      // } else {
      //   element.style.display = "none"
      // }
    })
  }

  //=========HANDLE FULLSCREEN=========
  function toggleFullScreen(elem) {
    // ## The below if statement seems to work better ## if ((document.fullScreenElement && document.fullScreenElement !== null) || (document.msfullscreenElement && document.msfullscreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if (
      (document.fullScreenElement !== undefined &&
        document.fullScreenElement === null) ||
      (document.msFullscreenElement !== undefined &&
        document.msFullscreenElement === null) ||
      (document.mozFullScreen !== undefined && !document.mozFullScreen) ||
      (document.webkitIsFullScreen !== undefined &&
        !document.webkitIsFullScreen)
    ) {
      if (elem.requestFullScreen) {
        elem.requestFullScreen()
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen()
      } else if (elem.webkitRequestFullScreen) {
        elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen()
      }
      myDocumet.querySelector("#arrow-out").style.display = "none"
      myDocumet.querySelector("#arrow-in").style.display = "block"
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
      myDocumet.querySelector("#arrow-out").style.display = "block"
      myDocumet.querySelector("#arrow-in").style.display = "none"
    }
  }

  const fullScreenBtn = myDocumet.querySelector("#handle-full-screen")
  if (fullScreenBtn) {
    fullScreenBtn.addEventListener("click", () =>
      toggleFullScreen(document.body)
    )
  }

  //===========HANDLE DARK MODE================
  function toggleDarkMode(ele) {
    if (ele.classList.contains("dark")) {
      ele.classList.remove("dark")
      ele.querySelector(".top-info").classList.remove("dark")
      ele.querySelector("#reader-container").classList.remove("dark")
      myDocumet.querySelector("#sun-icon").style.display = "block"
      myDocumet.querySelector("#moon-icon").style.display = "none"
    } else {
      ele.classList.add("dark")
      ele.querySelector(".top-info").classList.add("dark")
      ele.querySelector("#reader-container").classList.add("dark")
      myDocumet.querySelector("#sun-icon").style.display = "none"
      myDocumet.querySelector("#moon-icon").style.display = "block"
    }
  }

  // const mainContain = document.querySelector('.reader-modal');
  const darkModeBtn = myDocumet.querySelector("#handle-dark-mode")
  if (darkModeBtn) {
    darkModeBtn.addEventListener("click", () => toggleDarkMode(myDocumet))
  }

  //======HANDLERS FOR SPEECH TO TEXT========
  //Hide show summary hadler
  let hideShowVoicePlayer = myDocumet.querySelectorAll(
    ".show-speech-to-text-handler"
  )
  for (let i = 0; i < hideShowVoicePlayer.length; i++) {
    hideShowVoicePlayer[i].addEventListener("click", () => {
      if (isQuotaExeed === true) {
        alert("Text to speech Limit exceeded, please upgrade your plan, buy add-ons or earn some credits to unlock more!")
        return
      }
      const element = myDocumet.querySelector("#media-player")
      const displayValue = element.style.display
      if (displayValue == "none") {
        element.style.display = "flex"
      } else {
        element.style.display = "none"
      }
    })
  }

  //Close player
  const closePlayerBtn = myDocumet.querySelector("#close-player-handler")
  if (closePlayerBtn) {
    closePlayerBtn.addEventListener("click", () => {
      const element = myDocumet.querySelector("#media-player")
      element.style.display = "none"
      pauseAudio()
    })
  }

  //Draging voice control div
  const wrapper = myDocumet.querySelector("#media-player")
  const dragContainer = wrapper?.querySelector("#drag-controller")
  function onDrag({ movementX, movementY }) {
    let getStyle = window.getComputedStyle(wrapper)
    let left = parseInt(getStyle.left)
    let top = parseInt(getStyle.top)
    wrapper.style.left = `${left + movementX}px`
    wrapper.style.top = `${top + movementY}px`
  }

  if (dragContainer) {
    dragContainer.addEventListener("mousedown", () => {
      dragContainer.classList.add("active")
      dragContainer.addEventListener("mousemove", onDrag)
    })
  }

  if (myDocumet) {
    myDocumet.addEventListener("mouseup", () => {
      dragContainer.classList.remove("active")
      dragContainer.removeEventListener("mousemove", onDrag)
    })
  }

  //================HANDLE AUDIO PLAYER===============
  let progress = myDocumet.querySelector("#audio-progress")
  let htmlAudio = myDocumet.querySelector("#audio-player-html")
  let audioCtrlBtn = myDocumet.querySelector("#audio-ctrl-btn")
  let audioTotalDuration = myDocumet.querySelector("#audio-total-duration")
  let audioCurrentTime = myDocumet.querySelector("#audio-current-time")
  let audioPlaybackSpeed = myDocumet.querySelector("#audio-playback-control")
  let isPlaying = false
  let audioLoaded = false

  function loadTextToSpeechAudio(audio) {
    if (audio.audio_url) {
      audioLoaded = true
      htmlAudio.src = audio.audio_url
    }
  }

  function pauseAudio() {
    if (isPlaying) {
      htmlAudio.pause()
      isPlaying = false
      audioCtrlBtn.setAttribute("play-status", "pause")
      audioCtrlBtn.querySelector("#play-ctrl-icon").style.display = "block"
      audioCtrlBtn.querySelector("#pause-ctrl-icon").style.display = "none"
      updateTime()
    }
  }

  if (htmlAudio) {
    htmlAudio.onloadedmetadata = function () {
      progress.max = htmlAudio.duration
      progress.value = htmlAudio.currentTime
      audioTotalDuration.innerHTML = formatTime(htmlAudio.duration)
      audioCurrentTime.innerHTML = formatTime(htmlAudio.currentTime)
    }
  }

  if (audioCtrlBtn) {
    audioCtrlBtn.addEventListener("click", (e) => {
      if (!audioLoaded) {
        e.preventDefault()
        window.showMessage("Please wait audio is loading...", "info")
        return
      }
      const attrValue = audioCtrlBtn.getAttribute("play-status")
      if (attrValue === "pause") {
        htmlAudio.play()
        isPlaying = true
        audioCtrlBtn.setAttribute("play-status", "playing")
        audioCtrlBtn.querySelector("#play-ctrl-icon").style.display = "none"
        audioCtrlBtn.querySelector("#pause-ctrl-icon").style.display = "block"
        updateTime()
      } else {
        htmlAudio.pause()
        isPlaying = false
        audioCtrlBtn.setAttribute("play-status", "pause")
        audioCtrlBtn.querySelector("#play-ctrl-icon").style.display = "block"
        audioCtrlBtn.querySelector("#pause-ctrl-icon").style.display = "none"
        updateTime()
      }
    })
  }

  //Audio play backcontrol
  if (audioPlaybackSpeed) {
    audioPlaybackSpeed.addEventListener("click", () => {
      const currentSpeed = audioPlaybackSpeed.getAttribute("current-speed")
      let newSpeed = 1
      let speedText = "1x"
      if (currentSpeed == 1) {
        newSpeed = 1.5
        speedText = "1.5x"
      } else if (currentSpeed == 1.5) {
        newSpeed = 2.0
        speedText = "2.0x"
      } else if (currentSpeed == 2.0) {
        newSpeed = 0.5
        speedText = ".5x"
      } else {
        newSpeed = 1
        speedText = "1x"
      }
      htmlAudio.playbackRate = newSpeed
      audioPlaybackSpeed.setAttribute("current-speed", newSpeed)
      audioPlaybackSpeed.querySelector("#audio-playback-speed").innerHTML =
        speedText
    })
  }

  //Update current time
  let intervalTime = null
  function updateTime() {
    if (isPlaying) {
      intervalTime = setInterval(() => {
        progress.value = htmlAudio.currentTime
        audioCurrentTime.innerHTML = formatTime(htmlAudio.currentTime)
      }, 500)
    } else {
      audioCurrentTime.innerHTML = formatTime(htmlAudio.currentTime)
      clearInterval(intervalTime)
    }
  }

  //Update time while changing progress bar
  if (progress) {
    progress.onchange = function () {
      if (isPlaying) {
        clearInterval(intervalTime)
        htmlAudio.currentTime = progress.value
        audioCurrentTime.innerHTML = formatTime(progress.value)
        htmlAudio.play()
        updateTime()
      } else {
        htmlAudio.currentTime = progress.value
        audioCurrentTime.innerHTML = formatTime(progress.value)
      }
    }
  }

  function formatTime(currentTime) {
    let currentMinutes = Math.floor(currentTime / 60)
    let currentSeconds = Math.floor(currentTime - currentMinutes * 60)

    if (currentSeconds < 10) {
      currentSeconds = "0" + currentSeconds
    }
    if (currentMinutes < 10) {
      currentMinutes = "0" + currentMinutes
    }

    return currentMinutes + ":" + currentSeconds
  }

  //Download audio
  const downloadAudioBtn = myDocumet.querySelector("#download-audio")
  if (downloadAudioBtn) {
    downloadAudioBtn.addEventListener("click", (e) => {
      if (!audioLoaded) {
        e.preventDefault()
        window.showMessage("Please wait audio is loading...", "error")
        return
      }
      const url = htmlAudio.src
      const link = document.createElement("a")
      link.href = url
      link.target = "_blank"
      link.download = "sample.mp3"
      link.click()
      URL.revokeObjectURL(link.href)
    })
  }

  //=============DOWNLOAD DOCUMENT================
  //Save document as text
  const savaAsTextBtn = myDocumet.querySelector("#save-doc-as-text")
  if (savaAsTextBtn) {
    savaAsTextBtn.addEventListener("click", () => {
      const link = document.createElement("a")
      const file = new Blob([article.textContent], { type: "text/plian" })
      link.href = URL.createObjectURL(file)
      link.download = "sample.txt"
      link.click()
      URL.revokeObjectURL(link.href)
    })
  }

  // Save document as PDF
  // const saveAsPdfBtn = myDocumet.querySelector("#save-doc-as-pdf")
  // if (saveAsPdfBtn) {
  //   saveAsPdfBtn.addEventListener("click", () => {
  //     const element = myDocumet.querySelector("#reader-container")
  //     // 
  //     var opt = {
  //       margin: 1,
  //       filename: "sample.pdf",
  //       image: { type: "jpeg", quality: 0.98 },
  //       html2canvas: { scale: 2, useCORS: false },
  //       jsPDF: { unit: "in", format: "A4", orientation: "portrait" },
  //     }
  //     // 
  //     // html2pdf().set(opt).from(element).save()
  //   })
  // }

  //==============CP+OPY TO CLIPBOADR============
  const copyToClipboardBtn = myDocumet.querySelector("#copy-top-clipboard")
  if (copyToClipboardBtn) {
    copyToClipboardBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(article.textContent)
      myDocumet.querySelector("#copy-top-clipboard").style.backgroundColor =
        "#7eaffc"
      setTimeout(() => {
        myDocumet.querySelector("#copy-top-clipboard").style.backgroundColor =
          "transparent"
      }, 1000)
    })
  }

  //===============ADD TO BOOKMARK=============
  const addToBookmarkBtn = myDocumet.querySelector("#add-to-bookmark")
  if (addToBookmarkBtn) {
    addToBookmarkBtn.addEventListener("click", () => {
      chrome?.storage?.sync.get(["userData"], function (text) {
        if (
          !text ||
          !text.userData ||
          !text.userData.apiUrl ||
          !text.userData.token
        ) {
          window.showMessage(
            "Please logged in into curateit to access this feature!",
            "error"
          )
          return
        }
        const payload = {
          title: document.URL,
          url: document.URL,
          media_type: "Link",
          author: Number(text.userData.userId),
          collection_gems: Number(text.userData.unfilteredCollectionId),
        }
        fetch(`${text.userData.apiUrl}/api/gems`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${text.userData.token}`,
          },
          body: JSON.stringify({ data: payload }),
        })
          .then((response) => {
            return response.json()
          })
          .then((res) => {
            const parent = {
              id: text.userData.unfilteredCollectionId,
              name: "Unfiltered",
            }
            chrome.storage.sync.remove("bookmarkAddInfo")
            chrome.storage.sync.set({
              bookmarkAddInfo: {
                bookmark: {
                  ...res,

                  collection_gems: parent,
                  parent,
                  collection_id: text.userData.unfilteredCollectionId,
                },
              },
            })
            alert("Bookmark added successful")
            window.showMessage("Bookmark added successful", "success")
            // window.panelToggle("?added-bookmark-update", true)
          })
          .catch((error) => {
            console.log("Error", error)
            alert("Opp! Something went wrong. Please try again later.")
            window.showMessage(
              "Opp! Something went wrong. Please try again later.",
              "error"
            )
          })
      })
    })
  }

  let speech = new SpeechSynthesisUtterance()
  speech.lang = "en"

  let voices = []
  window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices()
    speech.voice = voices[0]
    let voiceSelect = document.querySelector("#voices")
    if (voiceSelect) {
      voices.forEach(
        (voice, i) => (voiceSelect.options[i] = new Option(voice.name, i))
      )
    }
  }

  // document.querySelector("#volume").addEventListener("input", () => {
  // const volume = document.querySelector("#volume").value;
  // speech.volume = volume;
  // document.querySelector("#volume-label").innerHTML = volume;
  // });

  document.querySelector("#voices")?.addEventListener("change", () => {
    speech.voice = voices[document.getElementsByClassName("#voices").value]
  })

  document.querySelector("#start")?.addEventListener("click", () => {
    speech.text = article.textContent
    window.speechSynthesis.speak(speech)
  })

  document.querySelector("#pause")?.addEventListener("click", () => {
    window.speechSynthesis.pause()
  })

  document.querySelector("#resume")?.addEventListener("click", () => {
    window.speechSynthesis.resume()
  })

  document.querySelector("#cancel")?.addEventListener("click", () => {
    window.speechSynthesis.cancel()
  })
  
  document.querySelector("#speed-read")?.addEventListener("click", () => {
    const text = article.title + article.textContent
    window.speedRead(text)
  })
}
