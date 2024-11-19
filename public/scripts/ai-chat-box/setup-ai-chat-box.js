const aiMessage = `<div class="message" id={promptId}>
    <div class="avatar">
        <svg
            viewBox="0 0 640 512"
            fill="currentColor"
            height="15"
            width="15"
        >
            <path d="M320 0c17.7 0 32 14.3 32 32v64h128c35.3 0 64 28.7 64 64v288c0 35.3-28.7 64-64 64H160c-35.3 0-64-28.7-64-64V160c0-35.3 28.7-64 64-64h128V32c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16h-32zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16h-32zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16h-32zM264 256c0-22.1-17.9-40-40-40s-40 17.9-40 40 17.9 40 40 40 40-17.9 40-40zm152 40c22.1 0 40-17.9 40-40s-17.9-40-40-40-40 17.9-40 40 17.9 40 40 40zM48 224h16v192H48c-26.5 0-48-21.5-48-48v-96c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48h-16V224h16z" />
        </svg>
    </div>
    <div class="ai-response">
        <span data-ai-prompt={aiPrompt}>{aiResponse}</span>
        <div class="response-actions">
            <button class="icon-button ct-ai-save-icon" data-prompt-res={promptRes} id="ct-ai-save-btn-{promptId}">
                <svg data-prompt-res={promptRes} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path data-prompt-res={promptRes} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <button class="icon-button ct-ai-clone-icon" data-prompt-res={promptRes} id="ct-ai-clone-btn-{promptId}">
                <svg
                    data-prompt-res={promptRes}
                    viewBox="0 0 512 512"
                    fill="currentColor"
                    height="16"
                    width="16"
                >
                    <path data-prompt-res={promptRes} d="M64 464h224c8.8 0 16-7.2 16-16v-64h48v64c0 35.3-28.7 64-64 64H64c-35.35 0-64-28.7-64-64V224c0-35.3 28.65-64 64-64h64v48H64c-8.84 0-16 7.2-16 16v224c0 8.8 7.16 16 16 16zm96-400c0-35.35 28.7-64 64-64h224c35.3 0 64 28.65 64 64v224c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64V64zm64 240h224c8.8 0 16-7.2 16-16V64c0-8.84-7.2-16-16-16H224c-8.8 0-16 7.16-16 16v224c0 8.8 7.2 16 16 16z" />
                </svg>
                <span class="ct-tooltip" id="ct-tooltip-text" data-tooltip="Copied">Copied!</span>
            </button>
            <button class="icon-button ct-ai-refresh-icon" data-edit-prompt={editPrompt} id="ct-ai-refresh-btn-{promptId}">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-edit-prompt={editPrompt}>
                    <path data-edit-prompt={editPrompt} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <button class="icon-button ct-ai-edit-icon" data-edit-prompt={editPrompt} id="ct-ai-edit-btn-{promptId}">
                <svg data-edit-prompt={editPrompt} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path data-edit-prompt={editPrompt} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
    </div>
</div>`

const aiUserAttempt = `<div class="message ct-ai-question">
    <div class="avatar">
        <svg height="15" width="15" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	         viewBox="0 0 60.671 60.671" xml:space="preserve">
            <g>
                <g>
                    <ellipse style="fill:white;" cx="30.336" cy="12.097" rx="11.997" ry="12.097"/>
                    <path style="fill:white;" d="M35.64,30.079H25.031c-7.021,0-12.714,5.739-12.714,12.821v17.771h36.037V42.9
                        C48.354,35.818,42.661,30.079,35.64,30.079z"/>
                </g>
            </g>
        </svg>
    </div>
    <div class="ai-response ct-ai-user-attempt">
        <span data-user-attempt-ai-prompt={userAttemptAiPrompt}>{userAttemptAiPrompt}</span>
    </div>
</div>`

const chatLoader = `<div class="ct-loader-container">
                        <div class="ct-dot-typing"></div>
                    </div>`

window.openAskAiPopup = (prompt) => {
    $.get(chrome.runtime.getURL("/scripts/ai-chat-box/ai-chat-box.html"), (data) => {
        $(data).appendTo("body")
        // Set position for chat box
        const mainChatDiv   = document.querySelector(".ct-chat-main")
        let isDragging      = false;
        let shiftX          = 0
        let shiftY          = 0

        if (mainChatDiv) {
            const top               = (0 + (window.innerHeight / 2)) + window.scrollY
            mainChatDiv.style.top   = `${top}px`
        }

        const setPosition = (pageX, pageY, shiftX, shiftY) => {
            const top   = pageY - shiftY 
            const left  = pageX - shiftX 
            mainChatDiv.style.top = `${top}px`
            mainChatDiv.style.left = `${left}px`
        }

        const onDocumentMouseDown = (e) => {
            e.preventDefault()
            e.stopPropagation()
            return false
        }

        const checkIsChatComponent = (target) => {
            if (target.tagName === "TEXTAREA" || target.tagName === "INPUT" || target.tagName === "BUTTON") {
                return true
            }
            return false
        }

        const onDragStart = (e) => {
            if (checkIsChatComponent(e.target)) return
            isDragging = true
            const box   = mainChatDiv.getBoundingClientRect()
            shiftX      = e.clientX - box.left
            shiftY      = e.clientY - box.top
            // setPosition(e.pageX, e.pageY, shiftX, shiftY)
            document.addEventListener("mousedown", onDocumentMouseDown)
            document.addEventListener("mousemove", onDrag)
        }

        const onDrag = (e) => {
            if (!isDragging) return
            setPosition(e.pageX, e.pageY, shiftX, shiftY)
        }

        const onDragEnd = (e) => {
            if (checkIsChatComponent(e.target)) return
            isDragging = false
            document.removeEventListener("mousedown", onDocumentMouseDown)
            document.removeEventListener("mousemove", onDrag)
        }

        mainChatDiv.addEventListener("mousedown", onDragStart)
        mainChatDiv.addEventListener("mouseup", onDragEnd)
        document.addEventListener("mouseup", onDragEnd)
        
        const showChar      = 100
        const ellipsesText  = "..."
        const moreText      = "see more"
        const lessText      = "see less"
        if (prompt) {
            const selectedPromptElem = document.querySelector("#selected-prompt")
            if (prompt.length > showChar) {
                const shownText = prompt.substr(0, showChar)
                const hiddenText = prompt.substr(showChar, prompt.length - showChar)
                const html = `${shownText}
                    <span class="moreellipses" id="ct-more-elipse">
                        ${ellipsesText}
                    </span>
                    <span class="morecontent">
                        <span style="display: none;">${hiddenText}</span>
                        &nbsp;&nbsp;<a href="" class="ct-morelink">${moreText}</a>
                    </span>
                `
                selectedPromptElem.innerHTML = html
            }
            else {
                selectedPromptElem.textContent = prompt
            }
            $(".ct-morelink").click(function(){
                const moreElipse = document.querySelector("#ct-more-elipse")
                if($(this).hasClass("less")) {
                    $(this).removeClass("less");
                    $(this).html(moreText);
                    if (moreElipse) {
                        moreElipse.style.visibility = "visible"
                    }
                } else {
                    $(this).addClass("less");
                    $(this).html(lessText);
                    if (moreElipse) {
                        moreElipse.style.visibility = "hidden"
                    }
                }
                $(this).prev('.content').prev().toggle();
                $(this).prev().toggle();
                return false;
            });
        }
        else {
            const selectedPromptElem = document.querySelector("#ct-ai-chat-selected-text-div")
            selectedPromptElem.remove()
        }

        const checkIsUserLoggedIn = async () => {
            const text = await window.chrome?.storage?.sync.get(["userData"]);
            if (text && text?.userData && text?.userData?.apiUrl) {
              return {
                url: text.userData.apiUrl,
                token: text.userData.token,
                id: text?.userData?.id,
                collectionId: text?.userData?.unfilteredCollectionId,
              };
            } else {
              window.panelToggle(`?open-extension`, true);
              return false;
            }
        };

        const saveCurrentPrompt = (prompt) => {
            chrome.storage.sync.remove("noteInfo")
            chrome.storage.sync.set({'noteInfo': {
                    text: prompt,
            }})
            window.getSelection().empty();
            window.panelToggle("?add-note", true)
        }

        const getChatResponse = async (finalPrompt) => {
            const user          = await checkIsUserLoggedIn();
            if (!user) {
                return;
            }
            const payload = {
                prompt: finalPrompt,
            }
            const response      = await fetch(`${user.url}/api/send-ai-response?platform=openai`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify(payload),
            });
    
            if (!response.ok) {
                console.error("Error sending AI prompt: ", response);
                return;
            }
    
            const responseJson  = await response.json();
            if (responseJson.data) {
                return responseJson.data
            }
            return null
        }

        const selectedCloseBtn  = document.querySelector("#ct-prompt-selected-close-btn")
        if (selectedCloseBtn) {
            selectedCloseBtn.addEventListener("click", () => {
                const aiChatBox = document.querySelector("#ct-ai-chat-selected-text-div")
                if (aiChatBox) {
                    aiChatBox.remove()
                }
            })
        }

        const mainCloseBtn      = document.querySelector("#ct-ai-close-icon-btn")
        if (mainCloseBtn) {
            mainCloseBtn.addEventListener("click", () => {
                const aiChatBox = document.querySelector(".ct-chat-container")
                if (aiChatBox) {
                    aiChatBox.remove()
                }
            })
        }

        const sendBtn = document.getElementById("ct-ask-ai-send-btn")
        if (sendBtn) {
            sendBtn.addEventListener("click", async () => {
                const promptInput = document.getElementById("ct-ask-ai-input")
                const promptChat  = document.querySelector("#ct-ai-chat-selected-text-div")
                const userMessage = promptInput?.value
                let fPrompt       = promptChat && prompt ? prompt : ""
                if (userMessage) {
                    fPrompt = `${promptChat && prompt ? prompt : ""} ${userMessage}`
                }
                const chatBox    = document.getElementById("ct-ai-chat-box-messages")
                const userAttempt = aiUserAttempt.replaceAll("{userAttemptAiPrompt}", `${userMessage}`)
                $(chatBox).append(userAttempt)
                $(chatBox).append(chatLoader)
                if (promptInput) {
                    promptInput.value = ""
                }
                const promptRes  = await getChatResponse(fPrompt)
                const loader     = document.querySelector(".ct-loader-container")
                if (loader) {
                    loader.remove()
                }
                if (!promptRes) {
                    alert("Error getting AI response")
                    return
                }
                const timestampt = new Date().getTime()
                const aiResponse = aiMessage.replaceAll("{promptId}", `${timestampt}`).replaceAll("{aiResponse}", `${promptRes}`).replaceAll("{aiPrompt}", `'${fPrompt}'`).replaceAll("{promptRes}", `'${promptRes}'`).replaceAll("{editPrompt}", `'${fPrompt}'`)
                $(chatBox).append(aiResponse)
                const saveBtn       = document.querySelector(`#ct-ai-save-btn-${timestampt}`)
                const cloneBtn      = document.querySelector(`#ct-ai-clone-btn-${timestampt}`)
                const refreshBtn    = document.querySelector(`#ct-ai-refresh-btn-${timestampt}`)
                const editBtn       = document.querySelector(`#ct-ai-edit-btn-${timestampt}`)

                const onSaveClick       = (e) => {
                    const promptRes = e.target.getAttribute("data-prompt-res")
                    if (promptRes) {
                        saveCurrentPrompt(promptRes)
                    }
                }

                const onRefreshClick    = async (e) => {
                    const editPrompt = e.target.getAttribute("data-edit-prompt")
                    $(chatBox).append(chatLoader)
                    if (editPrompt) {
                        const promptRes = await getChatResponse(editPrompt)
                        if (promptRes) {
                            const timestampt = new Date().getTime()
                            const aiResponse = aiMessage.replaceAll("{promptId}", `${timestampt}`).replaceAll("{aiResponse}", `${promptRes}`).replaceAll("{aiPrompt}", `'${editPrompt}'`).replaceAll("{promptRes}", `'${promptRes}'`).replaceAll("{editPrompt}", `'${editPrompt}'`)
                            const chatBox    = document.getElementById("ct-ai-chat-box-messages")
                            $(chatBox).append(aiResponse)
                            const saveBtn       = document.querySelector(`#ct-ai-save-btn-${timestampt}`)
                            const cloneBtn      = document.querySelector(`#ct-ai-clone-btn-${timestampt}`)
                            const refreshBtn    = document.querySelector(`#ct-ai-refresh-btn-${timestampt}`)
                            const editBtn       = document.querySelector(`#ct-ai-edit-btn-${timestampt}`)
                            if (saveBtn) {
                                saveBtn.addEventListener("click", onSaveClick)
                            }
            
                            if (cloneBtn) {
                                cloneBtn.addEventListener("click", onCloneClick)
                            }
            
                            if (refreshBtn) {
                                refreshBtn.addEventListener("click", onRefreshClick)
                            }
            
                            if (editBtn) {
                                editBtn.addEventListener("click", onEditClick)
                            }
                        }
                    }
                    const loader = document.querySelector(".ct-loader-container")
                    if (loader) {
                        loader.remove()
                    }
                }

                const onEditClick       = (e) => {
                    const editPrompt = e.target.getAttribute("data-edit-prompt")
                    if (editPrompt) {
                        const promptInput = document.getElementById("ct-ask-ai-input")
                        if (promptInput) {
                            promptInput.value = editPrompt
                        }
                    }
                }

                const onCloneClick      = (e) => {
                    const promptRes = e.target.getAttribute("data-prompt-res")
                    const tooltip   = e.target?.parentNode?.querySelector(".ct-tooltip")  
                    console.log("promptRes: ", tooltip)
                    if (promptRes) {
                        window.navigator.clipboard.writeText(promptRes)
                        if (tooltip) {
                            tooltip.style.display    = "block"
                            setTimeout(() => {
                                tooltip.style.display    = "none"
                            }, 1000)
                        }
                    }
                }

                if (saveBtn) {
                    saveBtn.addEventListener("click", onSaveClick)
                }

                if (cloneBtn) {
                    cloneBtn.addEventListener("click", onCloneClick)
                }

                if (refreshBtn) {
                    refreshBtn.addEventListener("click", onRefreshClick)
                }

                if (editBtn) {
                    editBtn.addEventListener("click", onEditClick)
                }
            })
        }

        const aiChatTextArea = document.getElementById("ct-ask-ai-input")
        if (aiChatTextArea) {
            aiChatTextArea.addEventListener("keyup", (e) => {
                aiChatTextArea.style.height = "auto"
                // this.style.height = this.scrollHeight + "px"
                if (e.key === "Enter" && e.shiftKey) return
                if (e.keyCode === 13 && !e.shiftKey && e.key === "Enter") {
                    e.preventDefault()
                    e.stopPropagation()
                    sendBtn.click()
                    aiChatTextArea.style.height = "30px"
                }
            })
        }
    })
}