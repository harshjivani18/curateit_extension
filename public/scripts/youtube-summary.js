let oldHref = "";
let orgHTML = ""
let orgTranscriptHTML = ""
let orgSummaryHTML = ""
const status_bar = document.getElementById("status-bar");

//copy code starts
function copyTextToClipboard(text) {

    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    } else {
        navigator.clipboard.writeText(text).then(function () {
        }, function (err) {
        });
    }
    function fallbackCopyTextToClipboard(text) {
        var textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
        } catch (err) {
        }

        document.body.removeChild(textArea);
    }
}

//ends

//prompt.js
function getSummaryPrompt(transcript) {
    return `Title: "${document.title
        .replace(/\n+/g, " ")
        .trim()}"\nVideo Transcript: "${transcript
            .replace(/\n+/g, " ")
            .trim()}"\nVideo Summary:`;
}

//ends

//search param starts
function getSearchParam(str) {

    const searchParam = (str && str !== "") ? str : window.location.search;

    if (!(/\?([a-zA-Z0-9_]+)/i.exec(searchParam))) return {};
    let match,
        pl = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^?&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        index = /\?([a-zA-Z0-9_]+)/i.exec(searchParam)["index"] + 1,
        query = searchParam.substring(index);

    let urlParams = {};
    while (match = search.exec(query)) {
        urlParams[decode(match[1])] = decode(match[2]);
    }
    return urlParams;

}
//search param ends


//transcript code starts

async function getLangOptionsWithLink(videoId) {

    // Get a transcript URL
    const videoPageResponse = await fetch("https://www.youtube.com/watch?v=" + videoId);

    const videoPageHtml = await videoPageResponse.text();
    const splittedHtml = videoPageHtml.split('"captions":')

    if (splittedHtml.length < 2) { return; } // No Caption Available

    const captions_json = JSON.parse(splittedHtml[1].split(',"videoDetails')[0].replace('\n', ''));
    const captionTracks = captions_json.playerCaptionsTracklistRenderer.captionTracks;
    const languageOptions = Array.from(captionTracks).map(i => { return i.name.simpleText; })

    const first = "English"; // Sort by English first
    languageOptions.sort(function (x, y) { return x.includes(first) ? -1 : y.includes(first) ? 1 : 0; });
    languageOptions.sort(function (x, y) { return x == first ? -1 : y == first ? 1 : 0; });

    return Array.from(languageOptions).map((langName, index) => {
        const link = captionTracks.find(i => i.name.simpleText === langName).baseUrl;
        return {
            language: langName,
            link: link
        }
    })

}

async function getTranscript(langOption) {
    const rawTranscript = await getRawTranscript(langOption.link);
    const transcript = rawTranscript.map((item) => { return item.text; }).join(' ');
    return transcript;
}

async function getRawTranscript(link) {

    // Get Transcript
    const transcriptPageResponse = await fetch(link); // default 0

    const transcriptPageXml = await transcriptPageResponse.text();


    // Parse Transcript
    const jQueryParse = $.parseHTML(transcriptPageXml);
    const textNodes = jQueryParse[1].childNodes;

    return Array.from(textNodes).map(i => {
        return {
            start: i.getAttribute("start"),
            duration: i.getAttribute("dur"),
            text: i.textContent
        };
    });

}

async function getTranscriptHTML(link, videoId) {

    const rawTranscript = await getRawTranscript(link);

    const scriptObjArr = [], timeUpperLimit = 60, charInitLimit = 300, charUpperLimit = 500;
    let loop = 0, chars = [], charCount = 0, timeSum = 0, tempObj = {}, remaining = {};

    // Sum-up to either total 60 seconds or 300 chars.
    Array.from(rawTranscript).forEach((obj, i, arr) => {

        // Check Remaining Text from Prev Loop
        if (remaining.start && remaining.text) {
            tempObj.start = remaining.start;
            chars.push(remaining.text);
            remaining = {}; // Once used, reset to {}
        }

        // Initial Loop: Set Start Time
        if (loop == 0) {
            tempObj.start = (remaining.start) ? remaining.start : obj.start;
        }

        loop++;

        const startSeconds = Math.round(tempObj.start);
        const seconds = Math.round(obj.start);
        timeSum = (seconds - startSeconds);
        charCount += obj.text.length;
        chars.push(obj.text);

        if (i == arr.length - 1) {
            tempObj.text = chars.join(" ").replace(/\n/g, " ");
            scriptObjArr.push(tempObj);
            resetNums();
            return;
        }

        if (timeSum > timeUpperLimit) {
            tempObj.text = chars.join(" ").replace(/\n/g, " ");
            scriptObjArr.push(tempObj);
            resetNums();
            return;
        }

        if (charCount > charInitLimit) {

            if (charCount < charUpperLimit) {
                if (obj.text.includes(".")) {

                    const splitStr = obj.text.split(".");

                    // Case: the last letter is . => Process regulary
                    if (splitStr[splitStr.length - 1].replace(/\s+/g, "") == "") {
                        tempObj.text = chars.join(" ").replace(/\n/g, " ");
                        scriptObjArr.push(tempObj);
                        resetNums();
                        return;
                    }

                    // Case: . is in the middle
                    // 1. Get the (length - 2) str, then get indexOf + str.length + 1, then substring(0,x)
                    // 2. Create remaining { text: str.substring(x), start: obj.start } => use the next loop
                    const lastText = splitStr[splitStr.length - 2];
                    const substrIndex = obj.text.indexOf(lastText) + lastText.length + 1;
                    const textToUse = obj.text.substring(0, substrIndex);
                    remaining.text = obj.text.substring(substrIndex);
                    remaining.start = obj.start;

                    // Replcae arr element
                    chars.splice(chars.length - 1, 1, textToUse)
                    tempObj.text = chars.join(" ").replace(/\n/g, " ");
                    scriptObjArr.push(tempObj);
                    resetNums();
                    return;

                } else {
                    // Move onto next loop to find .
                    return;
                }
            }

            tempObj.text = chars.join(" ").replace(/\n/g, " ");
            scriptObjArr.push(tempObj);
            resetNums();
            return;

        }

    })

    return Array.from(scriptObjArr).map(obj => {
        const t = Math.round(obj.start);
        const hhmmss = convertIntToHms(t);
        return `<div class="curateit_ai_summary_transcript_text_segment">
                  <div><a class="curateit_ai_summary_transcript_text_timestamp" style="padding-top: 16px !important;" href="/watch?v=${videoId}&t=${t}s" target="_blank" data-timestamp-href="/watch?v=${videoId}&t=${t}s" data-start-time="${t}">${hhmmss}</a></div>
                  <div class="curateit_ai_summary_transcript_text" data-start-time="${t}">${obj.text}</div>
              </div>`
    }).join("");

    function resetNums() {
        loop = 0, chars = [], charCount = 0, timeSum = 0, tempObj = {};
    }

}

function convertIntToHms(num) {
    const h = (num < 3600) ? 14 : 12;
    return (new Date(num * 1000).toISOString().substring(h, 19)).toString();
}


async function fetchSummary(longText) {
    try {
        const text = await chrome?.storage?.sync.get(["userData"]);
        const apiUrl = text?.userData?.apiUrl;
        const response = await fetch(`${apiUrl}/api/openai?isSummary=true`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: longText.substring(0, 700) }),
        });

        const data = await response.json()
        

        return `
          <div id="curateit_ai_summary_text" class="curateit_ai_summary_text">
              <div class="curateit_ai_summary_transcript_text_segment">
                  <div class="curateit_ai_summary_transcript_text"> 
                  ${data.message}
                  </div>
              </div>
          </div>`
    } catch (error) {
        console.log('Error:', error);
        throw error;
    }
}

// Utility function to convert HH:MM:SS or MM:SS to seconds
const convertTimestampToSeconds = (timestamp) => {
    const parts = timestamp.split(':').map(part => parseInt(part, 10));
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return parts[0] * 60 + parts[1];
};

function extractTranscriptSegments(htmlText) {
    // Parse the HTML text to a Document object
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // Get all the divs with the class "curateit_ai_summary_transcript_text_segment"
    const segments = doc.querySelectorAll('.curateit_ai_summary_transcript_text_segment');

    // Initialize an empty array to hold the JSON data
    const jsonData = [];

    // Loop through each segment to extract the required information
    segments.forEach((segment) => {
        // Extract the timestamp
        const timestamp = segment.querySelector('.curateit_ai_summary_transcript_text_timestamp').innerText;

        // Extract the text
        const text = segment.querySelector('.curateit_ai_summary_transcript_text').innerText;

        // Add the extracted information as a JSON object to jsonData array
        jsonData.push({
            timestamp,
            text
        });
    });

    // Return the JSON data
    return jsonData;
}


function secondsToHms(d) {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60);
    const s = Math.floor(d % 3600 % 60);

    const hDisplay = h > 0 ? h + ":" : "";
    const mDisplay = m > 0 ? (m < 10 && h > 0 ? "0" : "") + m + ":" : "00:";
    const sDisplay = s > 0 ? (s < 10 ? "0" : "") + s : "00";
    return hDisplay + mDisplay + sDisplay;
}

function appendToSummaryBody(imgDataUrl, timestamp) {
    let summaryBody = document.getElementById("curateit_ai_summary_body");
    if (!summaryBody) {
        console.warn("Element with ID 'curateit_ai_summary_body' not found!");
        return;
    }
    const langSelectElement = document.getElementById("curateit_ai_summary_lang_select");
    if (langSelectElement) {
        langSelectElement.remove();
    } else {
        console.warn("Element with ID 'curateit_ai_summary_lang_select' not found!");
    }
    const transcriptElement = document.getElementById("curateit_ai_summary_text");
    if (transcriptElement) {
        transcriptElement.remove();
    } else {
        console.warn("Element with ID 'curateit_ai_summary_text' not found!");
    }
    const img = document.createElement("img");
    img.src = imgDataUrl;
    img.style.width = "100%";

    const timeElement = document.createElement("p");
    timeElement.style.fontSize = "17px";
    timeElement.style.color = "#7d2e7d";
    timeElement.style.fontWeight = "bold";
    const formattedTime = secondsToHms(timestamp);
    timeElement.textContent = `${formattedTime}`;

    const breakElement = document.createElement("br");
    summaryBody.appendChild(timeElement);
    summaryBody.appendChild(img);
    summaryBody.appendChild(breakElement);
}

function getS3URLfromBase64(imgURL) {
    return new Promise((resolve, reject) => {
        chrome?.storage?.sync.get(['userData'], (text) => {
            if (!text || !text.userData || !text.userData.apiUrl || !text.userData.token) {
                window.showMessage("Please logged in into curateit to access this feature!", "error")
                resolve("Not Logged In")
            }
            try {
                fetch(`${text.userData.apiUrl}/api/save-base64-to-bucket`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${text.userData.token}`
                    },
                    body: JSON.stringify({
                        key: `/users/${text.userData.userId}/ai-notes/${Date.now()}.png`,
                        base64: imgURL
                    })
                }).then((res) => res.text())
                  .then((url) => {
                    resolve(url)
                })
            }
            catch (e) {
                resolve("Error occured ===>", e)
            }
        })
    })
}

async function captureScreenshot() {
    const video = document.querySelector("video");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const timestamp = video.currentTime;
    const imgDataUrl = canvas.toDataURL("image/png", 0.5);
    const screenshot = {
        url: await getS3URLfromBase64(imgDataUrl),
        timestamp: secondsToHms(timestamp)
    };

    return screenshot
    // appendToSummaryBody(imgDataUrl, timestamp);
}

// Function to update Chrome storage
const updateChromeStorage = (newNote) => {
    chrome.storage.local.get(['aiNotes'], function (result) {  // Use local instead of sync
        let aiNotesArray = result.aiNotes ? JSON.parse(result.aiNotes) : [];
        aiNotesArray.push(newNote);
        chrome.storage.local.set({  // Use local instead of sync
            aiNotes: JSON.stringify(aiNotesArray)
        });
    });
};

function addScreenshotAndNoteBtn() {
    let bars = document.querySelectorAll(".ytp-right-controls");
    for (let bar of bars) {
        if (bar.querySelector(".Screenshot-button") || bar.querySelector(".Note-button")) continue;

        // Create div for screenshot
        let screenshotDiv = document.createElement("div");
        let screenshotImg = document.createElement("img");
        screenshotImg.src = chrome.runtime.getURL("images/white-screenshot.svg");
        screenshotImg.style.width = "100%";
        screenshotImg.style.scale = "0.7";
        screenshotImg.style.height = "auto";
        screenshotImg.style.margin = "0 5px";
        screenshotImg.style.cursor = "pointer";
        screenshotImg.className = "Screenshot-button";
        screenshotImg.title = "Take Screenshot";

        screenshotImg.addEventListener("click", function (e) {
            e.stopPropagation();
            captureScreenshot().then((screenshot) => {
                const aiNote = {
                    screenshot: screenshot
                };
                updateChromeStorage(aiNote);
                window.panelToggle(`?add-highlight`, true);
            });
        });

        screenshotDiv.appendChild(screenshotImg);

        // Create div for notes
        let noteDiv = document.createElement("div");
        let noteImg = document.createElement("img");
        noteImg.src = chrome.runtime.getURL("images/white-note.svg");
        noteImg.style.width = "100%";
        noteImg.style.scale = "0.7";
        noteImg.style.height = "auto";
        noteImg.style.margin = "0 5px";
        noteImg.style.cursor = "pointer";
        noteImg.className = "Note-button";
        noteImg.title = "Add Note";

        noteImg.addEventListener("click", async function (e) {
            e.stopPropagation();
            // document.querySelector("#curateit_ai_summary_body").innerHTML = orgHTML;
            const currentTime = document.querySelector("span.ytp-time-current")?.textContent;
            const currentTimeInSeconds = convertTimestampToSeconds(currentTime);

            const videoId = getSearchParam(window.location.href).v;
            const langOptionsWithLink = await getLangOptionsWithLink(videoId);
            if (!langOptionsWithLink) {
                showErrorAlertBox();
                return;
            }

            const transcriptHTML = await getTranscriptHTML(langOptionsWithLink[0].link, videoId);
            const transcripts = extractTranscriptSegments(transcriptHTML);
            let foundText = "";

            for (let i = 0; i < transcripts.length; i++) {
                const start = convertTimestampToSeconds(transcripts[i].timestamp);
                const end = i < transcripts.length - 1 ? convertTimestampToSeconds(transcripts[i + 1].timestamp) : Infinity;

                if (currentTimeInSeconds >= start && currentTimeInSeconds < end) {
                    foundText = transcripts[i].text;
                    const timestamp = transcripts[i].timestamp;
                    const screenshot = await captureScreenshot()
                    const aiNote = {
                        text: foundText,
                        // timestamp: timestamp,
                        screenshot: screenshot
                    };
                    updateChromeStorage(aiNote);
                    break;
                }
            }
            window.panelToggle(`?add-highlight`, true);
        });

        noteDiv.appendChild(noteImg);

        // Append both divs to the target container
        let targetContainer = bar;
        if (targetContainer) {
            screenshotDiv.classList.add("ytp-fullscreen-button", "ytp-button");
            noteDiv.classList.add("ytp-fullscreen-button", "ytp-button");
            targetContainer.prepend(screenshotDiv);
            targetContainer.prepend(noteDiv);
        } else {
            console.warn("Target container not found inside the bar!");
        }
    }
}

function addTranscriptAndSummaryBtn() {
    let bars = document.querySelectorAll("#actions #menu");
    for (let bar of bars) {
        if (bar.querySelector(".summary-button") || bar.querySelector(".transcript-button")) continue;

        // Create div for summary
        let summaryDiv = document.createElement("div");
        let summaryImg = document.createElement("img");
        summaryImg.src = chrome.runtime.getURL("images/gray-ai-summary.svg");
        summaryImg.style.width = "30px";
        summaryImg.style.height = "auto";
        summaryImg.style.margin = "0 5px";
        summaryImg.style.cursor = "pointer";
        summaryImg.className = "summary-button";
        summaryImg.title = "AI Summary";

        summaryImg.addEventListener("click", async function (e) {
            e.stopPropagation();
            if (status_bar) {
                status_bar.innerHTML = `Getting your Summary`
            }
            const videoId = getSearchParam(window.location.href).v;
            const langOptionsWithLink = await getLangOptionsWithLink(videoId);
            if (!langOptionsWithLink) {
                showErrorAlertBox();
                return;
            }

            const summaryHTML = await getTranscriptHTML(langOptionsWithLink[0].link, videoId);
            orgSummaryHTML = extractTranscriptSegments(summaryHTML)
            chrome.storage.local.set({
                summaryHTML: orgSummaryHTML
            });
            if (status_bar) {
                status_bar.innerHTML = ``
            }
            window.panelToggle(`?add-highlight`, true);
        });

        summaryDiv.appendChild(summaryImg);
        summaryDiv.style.display = "flex";

        let transcriptDiv = document.createElement("div");
        let transcriptImg = document.createElement("img");
        transcriptImg.src = chrome.runtime.getURL("images/gray-transcript.svg");
        transcriptImg.style.width = "30px";
        transcriptImg.style.height = "auto";
        transcriptImg.style.margin = "0 5px";
        transcriptImg.style.cursor = "pointer";
        transcriptImg.className = "transcript-button";
        transcriptImg.title = "Add transcript";

        transcriptImg.addEventListener("click", async function (e) {
            e.stopPropagation();
            const videoId = getSearchParam(window.location.href).v;
            const langOptionsWithLink = await getLangOptionsWithLink(videoId);
            if (!langOptionsWithLink) {
                showErrorAlertBox();
                return;
            }

            const transcriptHTML = await getTranscriptHTML(langOptionsWithLink[0].link, videoId);
            orgTranscriptHTML = extractTranscriptSegments(transcriptHTML)
            chrome.storage.local.set({
                transcriptHTML: orgTranscriptHTML
            });
            window.panelToggle(`?add-highlight`, true);
        });

        transcriptDiv.appendChild(transcriptImg);
        transcriptDiv.style.display = "flex";

        // Append both divs to the target container
        let targetContainer = bar;
        if (targetContainer) {
            // targetContainer.style.display = "flex";
            // targetContainer.style.flexDirection = "row";
            // targetContainer.style.flexWrap = "wrap";
            // targetContainer.appendChild(summaryDiv);
            targetContainer.prepend(transcriptDiv);
        } else {
            console.warn("Target container not found inside the bar!");
        }
    }
}

// youtube file code starts
function insertSummaryBtn() {
    addScreenshotAndNoteBtn();
    addTranscriptAndSummaryBtn();
    // Sanitize Transcript Div
    if (document.querySelector("#curateit_ai_summary_lang_select")) {
        document.querySelector("#curateit_ai_summary_lang_select").innerHTML = "";
    }
    if (document.querySelector("#curateit_ai_summary_summary")) {
        document.querySelector("#curateit_ai_summary_summary").innerHTML = "";
    }
    Array.from(document.getElementsByClassName("curateit_ai_summary_container")).forEach(el => { el.remove(); });

    if (!getSearchParam(window.location.href).v) { return; }

    waitForElm('#secondary.style-scope.ytd-watch-flexy').then(() => {

        // Sanitize
        Array.from(document.getElementsByClassName("curateit_ai_summary_container")).forEach(el => { el.remove(); });
        
                // Place Script Div
                document.querySelector("#secondary.style-scope.ytd-watch-flexy").insertAdjacentHTML("afterbegin", `
                <div class="curateit_ai_summary_container">
                    <div id="curateit_ai_summary_header" class="curateit_ai_summary_header">
                        <a href="https://www.curateit.com" target="_blank" style="width: 24px;height: 24px;">
                            <svg width="25" height="25" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_2856_47919)">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M166.673 98.3454C170.875 101.082 174.304 103.316 178.341 106.189C184.635 110.63 188.692 115.428 190.487 119.709C191.512 122.295 192.026 125.056 191.999 127.839C191.998 131.26 191.308 134.647 189.971 137.794C189.056 140.143 187.681 142.284 185.926 144.09C184.171 145.895 182.072 147.329 179.755 148.304C177.893 149.021 175.897 149.317 173.908 149.172C171.92 149.027 169.987 148.444 168.248 147.466C166.427 146.507 164.829 145.173 163.558 143.55C162.286 141.928 161.371 140.055 160.872 138.053C160.171 135.24 160.798 127.407 164.683 127.728C166.904 127.91 167.485 130.135 167.924 131.816C168.048 132.293 168.161 132.727 168.297 133.057C169.785 136.696 173.141 137.041 175.096 135.709C178.021 133.723 176.927 129.886 176.177 128.492C174.53 125.433 171.444 122.953 165.986 119.857C163.53 118.521 160.968 117.391 158.327 116.477L158.131 116.403C156.545 115.823 154.873 115.268 153.213 114.75L151.185 114.096C151.143 116.85 151.287 119.603 151.615 122.337C152.63 130.292 155.771 137.156 157.563 141.073C158.072 142.185 158.472 143.059 158.684 143.654C161.487 151.524 161.966 156.113 161.487 161.048C160.946 166.797 158.106 176.184 149.402 180.231C146.461 181.727 143.22 182.537 139.922 182.599C136.624 182.661 133.355 181.974 130.36 180.588C123.906 177.504 122.049 173.927 120.218 168.992C119.307 166.604 118.914 164.049 119.064 161.496C119.215 158.944 119.905 156.453 121.091 154.189C122.966 150.896 126.057 148.477 129.696 147.453C134.158 146.207 137.33 148.453 137.441 150.698C137.515 152.24 135.498 154.51 134.773 155.262C133.04 157.076 131.601 163.49 135.498 165.958C139.199 168.277 146.243 165.711 146.968 159.469C147.78 152.536 145.235 138.411 134.859 123.879C129.24 115.748 126.178 106.115 126.069 96.2208V95.8014V95.382C126.178 85.4883 129.24 75.8545 134.859 67.7241C145.235 53.192 147.78 39.067 146.968 32.134C146.243 25.8919 139.186 23.3259 135.498 25.6452C131.601 28.0877 133.003 34.5272 134.773 36.3407C135.498 37.0932 137.515 39.3631 137.441 40.9051C137.33 43.1503 134.158 45.3831 129.696 44.1495C126.057 43.126 122.966 40.7064 121.091 37.4139C119.905 35.1502 119.215 32.6591 119.064 30.1066C118.914 27.554 119.307 24.9986 120.218 22.6104C122.049 17.6883 123.893 14.0984 130.36 11.0144C133.355 9.62921 136.624 8.94189 139.922 9.00385C143.22 9.0658 146.461 9.87541 149.402 11.3721C158.106 15.4184 160.946 24.8063 161.487 30.555C161.966 35.4648 161.487 40.0662 158.684 47.9491C158.471 48.5712 158.048 49.5008 157.507 50.6885C155.711 54.6357 152.617 61.4334 151.615 69.2661C151.287 72.0001 151.143 74.7533 151.185 77.5067L153.213 76.8529C154.824 76.3348 156.496 75.7797 158.131 75.1999L158.327 75.1258C160.968 74.2118 163.53 73.0813 165.986 71.7457C171.444 68.674 174.53 66.1944 176.177 63.1103C176.927 61.7163 178.021 57.8798 175.096 55.8936C173.141 54.5613 169.785 54.9191 168.297 58.5459C168.161 58.8761 168.048 59.3095 167.924 59.7868C167.485 61.4674 166.904 63.6926 164.683 63.8752C160.798 64.1959 160.171 56.3624 160.872 53.5497C161.371 51.5478 162.286 49.6744 163.558 48.0523C164.829 46.4302 166.427 45.096 168.248 44.1372C169.987 43.1585 171.92 42.576 173.908 42.4311C175.897 42.2861 177.893 42.5822 179.755 43.2983C182.072 44.2742 184.171 45.7074 185.926 47.513C187.681 49.3185 189.056 51.4595 189.971 53.8088C191.308 56.9563 191.998 60.3425 191.999 63.7642C192.025 66.5468 191.511 69.3079 190.487 71.8938C188.692 76.2238 184.635 81.0473 178.341 85.4636C173.726 88.6934 169.915 91.1847 164.819 94.5157C164.173 94.9379 163.506 95.3736 162.814 95.8261C164.187 96.7259 165.462 97.5566 166.673 98.3454ZM118.804 123.274C120.07 123.916 120.771 124.483 120.931 125.026C121.002 126.036 120.71 127.039 120.107 127.851C106.867 151.228 79.8213 163.86 52.7757 159.259C27.021 154.904 5.88856 133.637 1.41375 107.558C0.980679 105.044 0.703622 102.441 0.434041 99.9086L0.39339 99.5269L0.393384 99.5268C0.270451 98.2932 0.147519 97.0596 0 95.826C0.0758392 81.7211 4.75234 68.029 13.3147 56.8429C21.877 45.6567 33.8541 37.5918 47.4151 33.881C60.9762 30.1701 75.3751 31.0175 88.4109 36.2936C101.447 41.5696 112.402 50.9841 119.603 63.0979C120.685 64.825 121.066 66.071 120.832 66.7988C120.599 67.5266 119.652 68.2545 117.943 69.0317C108.551 73.2753 99.5892 72.5228 90.5412 66.7494C76.3423 57.6823 56.3409 58.3485 42.9902 68.3162C31.4958 76.9145 26.6399 88.3379 28.9756 101.353C31.5204 115.576 40.7774 125.334 55.7385 129.59C68.6712 133.254 80.5589 131.638 91.0452 124.767C100.056 118.858 109.141 118.34 118.804 123.274ZM70.4661 107.126H73.9451C75.2297 107.126 76.4617 107.638 77.3701 108.55C78.2784 109.461 78.7887 110.698 78.7887 111.987C78.7887 113.276 78.2784 114.512 77.3701 115.424C76.4617 116.335 75.2297 116.847 73.9451 116.847H70.4661C69.1815 116.847 67.9495 116.335 67.0411 115.424C66.1327 114.512 65.6224 113.276 65.6224 111.987C65.6224 110.698 66.1327 109.461 67.0411 108.55C67.9495 107.638 69.1815 107.126 70.4661 107.126ZM73.9451 74.7803H70.4661C69.1815 74.7803 67.9495 75.2924 67.0411 76.2039C66.1327 77.1154 65.6224 78.3517 65.6224 79.6408C65.6224 80.9299 66.1327 82.1662 67.0411 83.0777C67.9495 83.9892 69.1815 84.5013 70.4661 84.5013H73.9451C75.2297 84.5013 76.4617 83.9892 77.3701 83.0777C78.2784 82.1662 78.7887 80.9299 78.7887 79.6408C78.7887 78.3517 78.2784 77.1154 77.3701 76.2039C76.4617 75.2924 75.2297 74.7803 73.9451 74.7803Z" fill="#105FD3"/>
        </g>
        <defs>
        <clipPath id="clip0_2856_47919">
        <rect width="192" height="192" fill="white"/>
        </clipPath>
        </defs>
        </svg>
                        </a>
                        <p class="curateit_ai_summary_header_text">Transcript</p>
                        <div class="curateit_ai_summary_header_actions">
                            
                            <div id="curateit_ai_summary_header_summary" class="curateit_ai_summary_header_action_btn curateit-summary-hover-el curateit_ai_summary_icon" data-hover-label="View AI Summary">
                                <svg style="filter: brightness(0.8);" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20.4316 10.1814C20.7051 9.33773 20.7519 8.43698 20.5673 7.56952C20.3828 6.70206 19.9732 5.89841 19.3799 5.23923C18.7866 4.58005 18.0303 4.08853 17.187 3.81399C16.3437 3.53945 15.443 3.49156 14.5753 3.67512C13.9828 3.01454 13.2267 2.52175 12.3831 2.24638C11.5396 1.97101 10.6383 1.92278 9.7702 2.10655C8.90206 2.29031 8.09768 2.69959 7.43805 3.29315C6.77842 3.88672 6.28684 4.64361 6.01282 5.48762C5.14377 5.66999 4.33818 6.07829 3.67728 6.67133C3.01638 7.26438 2.52354 8.0212 2.24845 8.86549C1.97336 9.70978 1.92575 10.6117 2.11042 11.4802C2.2951 12.3488 2.70552 13.1533 3.30032 13.8126C3.07846 14.4869 3.00273 15.2008 3.07816 15.9066C3.1536 16.6125 3.37847 17.2942 3.73782 17.9064C4.27089 18.8322 5.08384 19.5651 6.05977 19.9997C7.03569 20.4343 8.12431 20.5483 9.16907 20.3251C9.6399 20.8539 10.2177 21.2767 10.8641 21.5654C11.5106 21.8542 12.211 22.0023 12.9191 22.0001C13.989 22.0001 15.0314 21.6606 15.8962 21.0305C16.7609 20.4005 17.4036 19.5123 17.7316 18.4939C18.4262 18.351 19.0824 18.062 19.6567 17.646C20.2311 17.2301 20.7104 16.6967 21.0628 16.0814C21.5927 15.1569 21.817 14.0886 21.7037 13.029C21.5903 11.9695 21.1451 10.9728 20.4316 10.1814V10.1814ZM12.9316 20.6939C12.0546 20.6938 11.2054 20.3864 10.5316 19.8251L10.6503 19.7564L14.6316 17.4564C14.7342 17.4018 14.8196 17.3196 14.8781 17.2191C14.9366 17.1187 14.966 17.0038 14.9628 16.8876V11.2626L16.6441 12.2376C16.6529 12.2412 16.6605 12.2472 16.6661 12.2549C16.6716 12.2627 16.6748 12.2719 16.6753 12.2814V16.9314C16.677 17.4259 16.5808 17.9159 16.3923 18.3732C16.2038 18.8304 15.9267 19.2458 15.577 19.5955C15.2273 19.9452 14.8118 20.2223 14.3546 20.4108C13.8974 20.5993 13.4074 20.6955 12.9128 20.6939H12.9316ZM4.86282 17.2564C4.4287 16.5 4.27178 15.6159 4.41907 14.7564L4.53782 14.8251L8.51907 17.1251C8.61408 17.18 8.72186 17.2089 8.83157 17.2089C8.94128 17.2089 9.04905 17.18 9.14407 17.1251L14.0128 14.3189V16.2501C14.0167 16.2579 14.0187 16.2664 14.0187 16.2751C14.0187 16.2838 14.0167 16.2923 14.0128 16.3001L9.98782 18.6251C9.56146 18.8719 9.09067 19.0322 8.60233 19.097C8.11399 19.1617 7.61767 19.1297 7.14174 19.0025C6.66581 18.8754 6.21958 18.6558 5.82855 18.3562C5.43753 18.0566 5.10937 17.6828 4.86282 17.2564V17.2564ZM3.81282 8.58137C4.25703 7.81796 4.95645 7.23585 5.78782 6.93762V11.6689C5.78462 11.7828 5.81263 11.8954 5.86881 11.9945C5.92499 12.0937 6.0072 12.1756 6.10657 12.2314L10.9503 15.0251L9.26907 16.0001C9.25083 16.0063 9.23106 16.0063 9.21282 16.0001L5.18782 13.6751C4.32883 13.1783 3.70178 12.3612 3.44406 11.4029C3.18633 10.4447 3.31893 9.42331 3.81282 8.56262V8.58137ZM17.6441 11.7939L12.7816 8.96887L14.4628 8.00012C14.4711 7.99448 14.4809 7.99146 14.4909 7.99146C14.501 7.99146 14.5108 7.99448 14.5191 8.00012L18.5441 10.3251C19.1587 10.6811 19.6596 11.2043 19.9885 11.8339C20.3174 12.4635 20.4607 13.1735 20.4018 13.8813C20.3428 14.5892 20.0841 15.2657 19.6556 15.8322C19.2272 16.3988 18.6466 16.8319 17.9816 17.0814V12.3501C17.9779 12.2362 17.9449 12.1252 17.8858 12.0277C17.8267 11.9303 17.7434 11.8497 17.6441 11.7939V11.7939ZM19.3191 9.29387L19.2003 9.21887L15.2253 6.90637C15.1267 6.84553 15.0131 6.81331 14.8972 6.81331C14.7813 6.81331 14.6677 6.84553 14.5691 6.90637L9.70657 9.71262V7.75012C9.70163 7.74157 9.69903 7.73187 9.69903 7.72199C9.69903 7.71212 9.70163 7.70242 9.70657 7.69387L13.7378 5.37512C14.3547 5.01964 15.0599 4.8471 15.7712 4.87766C16.4825 4.90822 17.1704 5.14063 17.7545 5.54771C18.3385 5.95479 18.7947 6.51972 19.0695 7.17646C19.3444 7.83321 19.4266 8.55462 19.3066 9.25637L19.3191 9.29387ZM8.78782 12.7189L7.10032 11.7501C7.08443 11.7376 7.07339 11.7199 7.06907 11.7001V7.06262C7.0691 6.34996 7.2722 5.65206 7.65458 5.05068C8.03697 4.44929 8.5828 3.96931 9.22815 3.66697C9.87349 3.36463 10.5916 3.25244 11.2984 3.34354C12.0053 3.43464 12.6715 3.72527 13.2191 4.18137L13.1128 4.25012L9.11907 6.55012C9.01641 6.60472 8.93103 6.68688 8.87251 6.78736C8.81399 6.88783 8.78466 7.00264 8.78782 7.11887V12.7189ZM9.70032 10.7501L11.8628 9.50012L14.0316 10.7501V13.2501L11.8628 14.5001L9.69407 13.2501L9.70032 10.7501Z" fill="#828282"/>
                                </svg>
                            </div>
                            <div id="curateit_ai_summary_header_summary__" class="curateit_ai_summary_header_action_btn curateit-summary-hover-el curateit_ai_summary_icon curateit_ai_summary_notes" data-hover-label="Quick Note">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <g id="File / Note_Edit">
                                    <path id="Vector" d="M10.0002 4H7.2002C6.08009 4 5.51962 4 5.0918 4.21799C4.71547 4.40973 4.40973 4.71547 4.21799 5.0918C4 5.51962 4 6.08009 4 7.2002V16.8002C4 17.9203 4 18.4801 4.21799 18.9079C4.40973 19.2842 4.71547 19.5905 5.0918 19.7822C5.5192 20 6.07899 20 7.19691 20H16.8031C17.921 20 18.48 20 18.9074 19.7822C19.2837 19.5905 19.5905 19.2839 19.7822 18.9076C20 18.4802 20 17.921 20 16.8031V14M16 5L10 11V14H13L19 8M16 5L19 2L22 5L19 8M16 5L19 8" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </g>
                                </svg>
                            </div>
                            <div id="curateit_ai_summary_header_track" class="curateit_ai_summary_header_action_btn curateit-summary-hover-el" data-hover-label="Jump to Current Time">
                                <svg style="filter: brightness(0.9);" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="6.25" stroke="#828282" stroke-width="1.5"/>
                                    <rect x="3.19995" y="11.3999" width="5" height="1.2" rx="0.6" fill="#828282"/>
                                    <rect x="15.7" y="11.3999" width="5" height="1.2" rx="0.6" fill="#828282"/>
                                    <rect x="11.3999" y="8" width="5" height="1.2" rx="0.6" transform="rotate(-90 11.3999 8)" fill="#828282"/>
                                    <rect x="11.3999" y="21" width="5" height="1.2" rx="0.6" transform="rotate(-90 11.3999 21)" fill="#828282"/>
                                </svg>
                            </div>
                            <div id="curateit_ai_summary_header_copy" class="curateit_ai_summary_header_action_btn curateit-summary-hover-el" data-hover-label="Copy Transcript">
                                <svg style="filter: brightness(0.95);" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 6.6V5C7 4.44772 7.44772 4 8 4H18C18.5523 4 19 4.44772 19 5V16C19 16.5523 18.5523 17 18 17H16.2308" stroke="#828282" stroke-width="1.5"/>
                                    <rect x="4.75" y="6.75" width="11.5" height="13.5" rx="1.25" stroke="#828282" stroke-width="1.5"/>
                                </svg>
                            </div>
                            <div style="filter: brightness(0.9);" id="curateit_ai_summary_header_toggle" class="curateit_ai_summary_header_action_btn">
                                <svg width="24" height="24" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16.2447 9.9588C16.5376 9.6659 16.5376 9.19103 16.2447 8.89814C15.9518 8.60524 15.4769 8.60524 15.184 8.89814L16.2447 9.9588ZM6.81611 8.89814C6.52322 8.60524 6.04835 8.60524 5.75545 8.89814C5.46256 9.19103 5.46256 9.6659 5.75545 9.9588L6.81611 8.89814ZM11.7425 14.461L16.2447 9.9588L15.184 8.89814L10.6819 13.4003L11.7425 14.461ZM11.3183 13.4003L6.81611 8.89814L5.75545 9.9588L10.2576 14.461L11.3183 13.4003ZM10.6819 13.4003C10.8576 13.2246 11.1425 13.2246 11.3183 13.4003L10.2576 14.461C10.6677 14.871 11.3325 14.871 11.7425 14.461L10.6819 13.4003Z" fill="#8B8B8B"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div id="curateit_ai_summary_body" class="curate_ai_summary_body">
                        <div id="curateit_ai_summary_lang_select" class="curateit_ai_summary_lang_select"></div>
                        <div id="curateit_ai_summary_text" class="curateit_ai_summary_text"></div>
                    </div>
                </div>`);
        
        // Event Listener: Hover Label
        Array.from(document.getElementsByClassName("curateit-summary-hover-el")).forEach(el => {
            const label = el.getAttribute("data-hover-label");
            if (!label) { return; }
            el.addEventListener("mouseenter", (e) => {
                e.stopPropagation();
                e.preventDefault();
                Array.from(document.getElementsByClassName("curateit_ai_summary_header_hover_label")).forEach(el => { el.remove(); })
                el.insertAdjacentHTML("beforeend", `<div class="curateit_ai_summary_header_hover_label">${label.replace(/\n+/g, `<br />`)}</div>`);
            })
            el.addEventListener("mouseleave", (e) => {
                e.stopPropagation();
                e.preventDefault();
                Array.from(document.getElementsByClassName("curateit_ai_summary_header_hover_label")).forEach(el => { el.remove(); })
            })
        })

        // Event Listener: Copy Transcript
        document.querySelector("#curateit_ai_summary_header_copy").addEventListener("click", (e) => {
            e.stopPropagation();
            const videoId = getSearchParam(window.location.href).v;
            copyTranscript(videoId);
        })

        // Event Listener: AI Summary
        document.querySelector("#curateit_ai_summary_header_summary").addEventListener("click", async (e) => {
            e.stopPropagation();
            const prompt = copyTranscriptAndPrompt();
            // setTimeout(() => {
            //     window.open("https://chat.openai.com/chat", "_blank");
            // }, 500)
            setTimeout(() => {
                console.log("prompt", prompt);
                chrome.runtime.sendMessage({ message: "setPrompt", prompt: prompt });
                window.open("https://chatgpt.com/chat?ref=curateit", "_blank");
            }, 500)
            // document.querySelector("#curateit_ai_summary_body").innerHTML = orgHTML;
            // code for AI Summary
            // const transcriptElements = document.querySelectorAll('.curateit_ai_summary_transcript_text');
            // let concatenatedText = '';

            // transcriptElements.forEach((element) => {
            //     concatenatedText += element.textContent + ' ';
            // });
            // document.querySelector("#curateit_ai_summary_body").innerHTML = `<svg class="curateit_ai_summary_loading" style="display: block;width: 48px;margin: 40px auto;" width="48" height="48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            // <path d="M100 36C59.9995 36 37 66 37 99C37 132 61.9995 163.5 100 163.5C138 163.5 164 132 164 99" stroke="#5C94FF" stroke-width="6"/>
            // </svg>`
            // const summaryHTML = await fetchSummary(concatenatedText.trim());
            // document.querySelector("#curateit_ai_summary_body").innerHTML = summaryHTML;
        })

        // Function to update Chrome storage
        const updateChromeStorage = (newNote) => {
            chrome.storage.local.get(['aiNotes'], function (result) {  // Use local instead of sync
                let aiNotesArray = result.aiNotes ? JSON.parse(result.aiNotes) : [];
                aiNotesArray.push(newNote);
                chrome.storage.local.set({  // Use local instead of sync
                    aiNotes: JSON.stringify(aiNotesArray)
                });
            });
        };

        // Event listener for text and timestamp
        document.querySelector("#curateit_ai_summary_header_summary__").addEventListener("click", async (e) => {
            e.stopPropagation();
            // document.querySelector("#curateit_ai_summary_body").innerHTML = orgHTML;
            const currentTime = document.querySelector("span.ytp-time-current")?.textContent;
            const currentTimeInSeconds = convertTimestampToSeconds(currentTime);

            const videoId = getSearchParam(window.location.href).v;
            const langOptionsWithLink = await getLangOptionsWithLink(videoId);
            if (!langOptionsWithLink) {
                showErrorAlertBox();
                return;
            }

            const transcriptHTML = await getTranscriptHTML(langOptionsWithLink[0].link, videoId);
            const transcripts = extractTranscriptSegments(transcriptHTML);
            let foundText = "";

            for (let i = 0; i < transcripts.length; i++) {
                const start = convertTimestampToSeconds(transcripts[i].timestamp);
                const end = i < transcripts.length - 1 ? convertTimestampToSeconds(transcripts[i + 1].timestamp) : Infinity;

                if (currentTimeInSeconds >= start && currentTimeInSeconds < end) {
                    foundText = transcripts[i].text;
                    const timestamp = transcripts[i].timestamp;
                    const screenshot = captureScreenshot();
                    const aiNote = {
                        text: foundText,
                        screenshot: screenshot,
                    };
                    updateChromeStorage(aiNote);
                    break;
                }
            }
            window.panelToggle(`?add-highlight`, true);
        });

        // Event listener for screenshot
        // document.querySelector("#curateit_ai_summary_header_summary_").addEventListener("click", (e) => {
        //     e.stopPropagation();
        //     const screenshot = captureScreenshot();
        //     const aiNote = {
        //         screenshot: screenshot
        //     };
        //     updateChromeStorage(aiNote);
        //     window.panelToggle(`?add-highlight`, true);
        // });

        // Event Listener: Jump to Current Timestamp
        document.querySelector("#curateit_ai_summary_header_track").addEventListener("click", (e) => {
            e.stopPropagation();
            scrollIntoCurrTimeDiv();
        })

        // Event Listener: Toggle Transcript Body
        document.querySelector("#curateit_ai_summary_header").addEventListener("click", async (e) => {

            const videoId = getSearchParam(window.location.href).v;
            sanitizeWidget();

            if (!isWidgetOpen()) { return; }

            // Get Transcript Language Options & Create Language Select Btns
            const langOptionsWithLink = await getLangOptionsWithLink(videoId);
            if (!langOptionsWithLink) {
                showErrorAlertBox();
                return;
            }
            createLangSelectBtns(langOptionsWithLink);

            // Create Transcript HTML & Add Event Listener
            const transcriptHTML = await getTranscriptHTML(langOptionsWithLink[0].link, videoId);
            if (document.querySelector("#curateit_ai_summary_text")) {
                document.querySelector("#curateit_ai_summary_text").innerHTML = transcriptHTML;
            }
            orgHTML = document.querySelector("#curateit_ai_summary_body").innerHTML;
            evtListenerOnTimestamp();

            // Event Listener: Language Select Btn Click
            evtListenerOnLangBtns(langOptionsWithLink, videoId);

        })

    });

}

function sanitizeWidget() {
    // Sanitize Transcript Div
    if (document.querySelector("#curateit_ai_summary_lang_select")) {
        document.querySelector("#curateit_ai_summary_lang_select").innerHTML = "";
    }
    document.querySelector("#curateit_ai_summary_body").style.maxHeight = window.innerHeight - 160 + "px";
    if (document.querySelector("#curateit_ai_summary_text")) {
        document.querySelector("#curateit_ai_summary_text").innerHTML = "";
        // Height Adjust
        document.querySelector("#curateit_ai_summary_text").innerHTML = `
        <svg class="curateit_ai_summary_loading" style="display: block;width: 48px;margin: 40px auto;" width="48" height="48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 36C59.9995 36 37 66 37 99C37 132 61.9995 163.5 100 163.5C138 163.5 164 132 164 99" stroke="#5C94FF" stroke-width="6"/>
        </svg>`;
    }

    // Toggle Class List
    document.querySelector("#curateit_ai_summary_body").classList.toggle("curateit_ai_summary_body_show");
    document.querySelector("#curateit_ai_summary_header_copy").classList.toggle("curateit_ai_summary_header_icon_show");
    document.querySelector("#curateit_ai_summary_header_summary").classList.toggle("curateit_ai_summary_header_icon_show");
    // document.querySelector("#curateit_ai_summary_header_summary_").classList.toggle("curateit_ai_summary_header_icon_show");
    document.querySelector("#curateit_ai_summary_header_summary__").classList.toggle("curateit_ai_summary_header_icon_show");
    document.querySelector("#curateit_ai_summary_header_track").classList.toggle("curateit_ai_summary_header_icon_show");
    document.querySelector("#curateit_ai_summary_header_toggle").classList.toggle("curateit_ai_summary_header_toggle_rotate");
}

function isWidgetOpen() {
    return document.querySelector("#curateit_ai_summary_body").classList.contains("curateit_ai_summary_body_show");
}

function showErrorAlertBox() {
    alert("No Transcription Available...")
}

// function noTranscriptionAlert() {
//     document.querySelector("#curateit_ai_summary_text").innerHTML = `
//         <div style="margin: 40px auto;text-align: center;">
//             <p>No Transcription Available...</p>
//         </div>
//     `;
// }

function createLangSelectBtns(langOptionsWithLink) {
    if (document.querySelector("#curateit_ai_summary_lang_select")) {
        document.querySelector("#curateit_ai_summary_lang_select").innerHTML = Array.from(langOptionsWithLink).map((langOption, index) => {
            return `<button class="curateit_ai_summary_lang ${(index == 0) ? "curateit_ai_summary_lange_selected" : ""}" data-yt-transcript-lang="${langOption.language}">${langOption.language}</button>`;
        }).join("");
    }
}

function evtListenerOnLangBtns(langOptionsWithLink, videoId) {
    Array.from(document.getElementsByClassName("curateit_ai_summary_lang")).forEach((langBtn) => {
        langBtn.addEventListener("click", async (e) => {
            const lang = e.target.getAttribute("data-yt-transcript-lang");
            const targetBtn = document.querySelector(`.curateit_ai_summary_lang[data-yt-transcript-lang="${lang}"]`);
            const link = langOptionsWithLink.find((langOption) => langOption.language === lang).link;
            // Create Transcript HTML & Event Listener
            const transcriptHTML = await getTranscriptHTML(link, videoId);
            document.querySelector("#curateit_ai_summary_text").innerHTML = transcriptHTML;
            evtListenerOnTimestamp()
            targetBtn.classList.add("curateit_ai_summary_lange_selected");
            Array.from(document.getElementsByClassName("curateit_ai_summary_lang")).forEach((langBtn) => {
                if (langBtn !== targetBtn) { langBtn.classList.remove("curateit_ai_summary_lange_selected"); }
            })
        })
    })
}

function getTYCurrentTime() {
    return document.querySelector("#movie_player > div.html5-video-container > video").currentTime ?? 0;
}

function getTYEndTime() {
    return document.querySelector("#movie_player > div.html5-video-container > video").duration ?? 0;
}

function scrollIntoCurrTimeDiv() {
    const currTime = getTYCurrentTime();
    Array.from(document.getElementsByClassName("curateit_ai_summary_transcript_text_timestamp")).forEach((el, i, arr) => {
        const startTimeOfEl = el.getAttribute("data-start-time");
        const startTimeOfNextEl = (i === arr.length - 1) ? getTYEndTime() : arr[i + 1].getAttribute("data-start-time") ?? 0;
        if (currTime >= startTimeOfEl && currTime < startTimeOfNextEl) {
            el.scrollIntoView({ behavior: 'auto', block: 'start' });
            document.querySelector("#secondary > div.curateit_ai_summary_container").scrollIntoView({ behavior: 'auto', block: 'end' });
        }
    })
}

function evtListenerOnTimestamp() {
    Array.from(document.getElementsByClassName("curateit_ai_summary_transcript_text_timestamp")).forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const starttime = el.getAttribute("data-start-time");
            const ytVideoEl = document.querySelector("#movie_player > div.html5-video-container > video");
            ytVideoEl.currentTime = starttime;
            ytVideoEl.play();
        })
    })
}

function copyTranscript(videoId) {
    let contentBody = "";
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    contentBody += `# ${document.title}\n`;
    contentBody += `${url}\n`;
    contentBody += `![](${url})\n`;
    contentBody += `## Transcript:\n`;
    Array.from(document.getElementById("curateit_ai_summary_text").children).forEach(el => {
        if (!el) { return; }
        if (el.children.length < 2) { return; }
        const timestamp = el.querySelector(".curateit_ai_summary_transcript_text_timestamp").innerText;
        const timestampHref = el.querySelector(".curateit_ai_summary_transcript_text_timestamp").getAttribute("data-timestamp-href");
        const text = el.querySelector(".curateit_ai_summary_transcript_text").innerText;
        contentBody += `- ([${timestamp}](${`https://www.youtube.com${timestampHref}`})) ${text}\n`;
    })
    copyTextToClipboard(contentBody);
}

function copyTranscriptAndPrompt() {
    const textEls = document.getElementsByClassName("curateit_ai_summary_transcript_text");
    const text = Array.from(textEls).map((textEl) => { return textEl.textContent.trim(); }).join(" ");
    const prompt = getSummaryPrompt(text);
    copyTextToClipboard(prompt);
    return prompt;
}

function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

// youtube file code ends

window.onload = async () => {

    if (window.location.hostname === "www.youtube.com") {

        if (window.location.search !== "" && window.location.search.includes("v=")) {
            insertSummaryBtn();
        }

        const bodyList = document.querySelector("body");
        let observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (oldHref !== document.location.href) {
                    oldHref = document.location.href;
                    insertSummaryBtn();
                }
            });
        });
        observer.observe(bodyList, { childList: true, subtree: true });

    }

    if (window.location.hostname === "chat.openai.com") {
        if (document.getElementsByTagName("textarea")[0]) {
            document.getElementsByTagName("textarea")[0].focus();
        }
    }
}