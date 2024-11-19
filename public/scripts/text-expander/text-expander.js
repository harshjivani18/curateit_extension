let currTargetForms = null;
let orgTextForm = null;
const currentUrl = window.location.href;
let targetEle = null;
let hasSuggestionBoxCreated = null;
let expansions = [];
let allInputs;
const textAreaWebsites = [
  "https://chat.openai.com/",
  "https://chat.openai.com",
  "https://bard.google.com/",
  "https://bard.google.com",
  "https://www.llama2.ai/",
  "https://www.llama2.ai",
  "https://chatgpt.com/",
  "https://chatgpt.com",
  "https://chat.mistral.ai/",
  "https://chat.mistral.ai",
  "https://www.bing.com/chat/",
  "https://www.bing.com/chat",
  "https://app.writesonic.com/",
  "https://app.writesonic.com",
  "https://chat.mistral.ai/chat/",
  "https://chat.mistral.ai/chat",
  "https://claude.ai/chats/",
  "https://claude.ai/chats",
  "https://gemini.google.com/app/",
  "https://gemini.google.com/app"
];

const insertValueWebsite = [
  "https://chat.openai.com/",
  "https://chat.openai.com",
  "https://bard.google.com/",
  "https://bard.google.com",
  "https://www.llama2.ai/",
  "https://www.llama2.ai",
  "https://chatgpt.com/",
  "https://chatgpt.com",
  "https://chat.mistral.ai/",
  "https://chat.mistral.ai",
  "https://www.bing.com/chat/",
  "https://www.bing.com/chat",
  "https://app.writesonic.com/",
  "https://app.writesonic.com",
  "https://chat.mistral.ai/chat/",
  "https://chat.mistral.ai/chat",
  "https://claude.ai/chats/",
  "https://claude.ai/chats",
  "https://gemini.google.com/app/",
  "https://gemini.google.com/app"
];

function injectStyles(css) {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}

injectStyles(`
  .suggestion-box {
    position: absolute;
    z-index: 9999999;
    background-color: white;
    color: black;
    border: 1px solid #ccc;
    font-family: "Segoe UI", Arial, sans-serif;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    border-radius: 5px;
    padding: 5px;
  }
  .suggestion-list{
    max-height: 170px;
    overflow: auto;
    display: !grid;
    gap: 10px;
  }

  .suggestion-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 2px 4px;
    height: 100%;
    border-bottom: 1px solid #ccc;
    font-size: 0.9em;
    column-gap: 20px;
  }



  .suggestion-item:last-child {
    border-bottom: none;
  }

  .suggestion-item:hover {
    background-color: #f0f0f0;
  }
  .suggestion-item-active {
    background-color: #f0f0f0;
  }

  .suggestion-expansion{
    font-size: 0.8em; 
    color: #777; 
    max-width: 200px; 
    max-height: 18px; 
    overflow: hidden;
  }

  .delete-icon {
    width: 16px;
    height: 16px;
    background-image: url(${chrome.runtime.getURL("icons/link-external.svg")});
    background-size: cover;
    border: none;
    cursor: pointer;
    outline: none;
  }
  
  `);


const isUserLoggedIn = async () => {
  const text = await chrome?.storage?.sync.get(["userData"]);

  if (text && text?.userData && text?.userData?.apiUrl) {
    return {
      url: text.userData.apiUrl,
      token: text.userData.token,
      collectionId: text?.userData?.unfilteredCollectionId,
    };
  }
};

const expandText = (text, expansions) => {
  const tArr = text.split(":");
  if (tArr.length < 2) return text;
  const expandedTextIdx = expansions.findIndex(
    (expansion) => expansion.keyword === tArr[1].trim()
  );
  if (expandedTextIdx !== -1) {
    const newText = expansions[expandedTextIdx].text;
    return text.replace(/c:[^\s]+/g, newText);
  }
  return text;
};

const truncateText = (text, maxLength) => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
};

const createSuggestionBox = () => {
  const suggestionBox = document.createElement("div");
  suggestionBox.id = "suggestion-box";
  suggestionBox.classList.add("suggestion-box");
  suggestionBox.innerHTML = `<div class="suggestion-list" id="suggestion-list"></div>
              <div class="suggestion-footer">
                    <img src="https://d3jrelxj5ogq5g.cloudfront.net/webapp/logo1sv.svg" alt="curateit" />
                </div>                
  `;
  document.body.appendChild(suggestionBox);
  return suggestionBox;
};

const emptySuggestionBox = (doc) => {
  // return doc.innerHTML = "";
  return (doc.querySelector("#suggestion-list").innerHTML = "");
};
hasSuggestionBoxCreated = document.getElementById("suggestion-box") || null;
const suggestionBox = hasSuggestionBoxCreated
  ? emptySuggestionBox(hasSuggestionBoxCreated)
  : createSuggestionBox();

const openFormsPopup = (val, target, gemId, authenticateUser) => {
  $.get(
    chrome.runtime.getURL("/scripts/text-expander/formPopup.html"),
    (data) => {
      $(data).appendTo("body");

      ////////////////////////
      var elements = document.getElementsByClassName("variable-input");

      // Convert the live HTMLCollection to an array to avoid live update issues during removal
      var elementsArray = Array.from(elements);

      // Iterate over the array and remove each element from the DOM
      for (var i = 0; i < elementsArray.length; i++) {
        var element = elementsArray[i];
        element.parentNode.removeChild(element);
      }

      //STYPE POPUP
      $(document)
        .find("#curateit-close-icons")
        .attr("src", chrome.runtime.getURL("icons/close.svg"));

      // Get the innerHTML of the element
      let html = val;

      // Define the regular expression pattern
      const pattern = /{([^}]+)}/g;

      // Replace the placeholders with editable span tags
      html = html.replace(
        pattern,
        '<span class="variable-container"><span contenteditable="true" placeholder="$1" id="variable__$1" class="variable-input" list="$1"></span><datalist id="$1"></datalist></span>'
      );

      // const formattedHtml = convertToHtml(html);
      // formattedHtml.innerHTML = html;

      document.getElementById("expander-forms-body").style.display = "flex";
      // Update the innerHTML of the element
      // document.getElementById("form-popup-div").innerHTML = formattedHtml;
      document.getElementById("form-popup-div").innerHTML = html;

      $("[contenteditable]").focusout(function () {
        var element = $(this);
        if (!element.text().trim().length) {
          element.empty();
        }
      });

      $("#slider-main-container").empty();
      allInputs = [];

      allInputs = document.getElementsByClassName("variable-input");

      //Updare header
      $("#expander-forms-body").find("#expand-vars").text(allInputs.length);

      //Add arrow icon
      $("#expander-forms-body")
        .find("#slider-btn-box-img")
        .attr(
          "src",
          chrome.runtime.getURL("icons/arrow-right-double-fill.svg")
        );

      //Add input fields in slider
      let newBody = "";

      Array.from(allInputs).forEach((ele, i) => {
        // ele.setAttribute("data-index", i);
        const newId = `"<pre>${ele.getAttribute("id")}</pre>"`;
        if (newBody.includes(newId)) return;
        const fields = `<div class="input-field">
                  <label>${ele.getAttribute("id").split("__")[1]}</label>
                  <input type="text" name=${
                    ele.getAttribute("id").split("__")[1]
                  } data-id=${newId} class="slider-input" tabindex=${i + 1} />
              </div>`;
        newBody += fields;
      });
      document.getElementById("slider-main-container").innerHTML = newBody;

      const sliderChild = document.getElementById(
        "slider-main-container"
      ).children;
      if (sliderChild.length > 0) {
        if (sliderChild[0].children.length > 1) {
          $(sliderChild[0].children[1]).focus();
        }
      }

      document
        .getElementById("insert-btn")
        .setAttribute("tabindex", allInputs.length + 1);

      //Change span text when input changes
      $(".slider-input").keyup(function () {
        let value = $(this).val();
        const attrId = $(this).attr("data-id");
        // const index = $(this).attr("data-index");
        const newId = attrId.replace("<pre>", "").replace("</pre>", "");

        const spanElem = document.getElementsByClassName("variable-input");
        Array.from(spanElem).forEach((ele) => {
          if (ele.getAttribute("id") === newId) {
            ele.innerText = value;
          }
        });
        // if (spanElem?.length > parseInt(index)) {
        //   const elm = spanElem[parseInt(index)];
        //   elm.innerText = value;
        // }
      });

      //Change input value if span value changes
      $(".variable-input").keyup(function (e) {
        let value = $(this).text();
        const attrId = $(this).attr("id");
        // const index = $(this).attr("data-index");
        //set span value to input
        const inputElem = document.querySelectorAll(`input.slider-input[data-id="<pre>${attrId}</pre>"]`);
        Array.from(inputElem).forEach((ele) => {
          ele.value = value;
        })
        const allSpans = document.getElementsByClassName("variable-input");
        Array.from(allSpans).forEach((ele) => {
          if (ele.getAttribute("id") === attrId) {
            ele.innerText = value;
          }
        })
        // if (inputElem?.length > parseInt(index)) {
        //   const elm = inputElem[parseInt(index)];
        //   elm.value = value;
        // }
        // $(`input.slider-input[data-id="<pre>${attrId}</pre>"]`).val(value);
      });

      //Hide show slider
      $("#slider-btn-box").click(() => {
        const ele = $("#curateit-slider-container")[0];
        if (!ele.classList.contains("active")) {
          ele.classList.add("active");
          $("#slider-btn-box")
            .find("#slider-btn-box-img")
            .attr(
              "src",
              chrome.runtime.getURL("icons/arrow-right-double-fill.svg")
            );
        } else {
          ele.classList.remove("active");
          $("#slider-btn-box")
            .find("#slider-btn-box-img")
            .attr(
              "src",
              chrome.runtime.getURL("icons/arrow-left-double-fill.svg")
            );
        }
      });

      $("#expander-forms-body")
        .find("#insert-btn")
        .click(() => {
          let finalHtml = document.getElementById("form-popup-div").innerHTML;
          finalHtml = finalHtml.replace('contenteditable="true"', "");
          const newFormattedHtml = convertToHtml(finalHtml);
          const inHTML = newFormattedHtml.startsWith("<") && $(newFormattedHtml)?.[0]?.innerHTML? $(newFormattedHtml)?.[0]?.innerHTML : newFormattedHtml;
          if (
            insertValueWebsite.some((substring) =>{
              return currentUrl.includes(substring)
            })
          ) {
            if (target?.parentElement?.tagName === "LABEL" && target?.parentElement?.getAttribute("is") === "cib-label" && currentUrl?.includes("bing.com")) {
              target?.parentElement?.setAttribute("data-input", inHTML);
              target?.parentElement?.setAttribute("data-suggestion", "");
              target?.parentElement?.querySelector(".autosuggest")?.remove();
              target?.setAttribute("value", inHTML);
            }
            if (target.tagName === "DIV") {
              target.innerHTML = inHTML;
            }
            else {
              target.value = inHTML;
            }
          } else {
            if (target.tagName !== "DIV") { 
              target.value = newFormattedHtml.startsWith("<") && $(newFormattedHtml)?.[0]?.outerText ? $(newFormattedHtml)?.[0]?.outerText : inHTML;
            }
            else {
              if (target.querySelector("span[data-lexical-text='true']")) {
                target.querySelector("span[data-lexical-text='true']").textContent = $(newFormattedHtml)?.[0]?.outerText;
              }
              else if (target.querySelector("span[data-text='true']")) {
                target.querySelector("span[data-text='true']").textContent = $(newFormattedHtml)?.[0]?.outerText;
              }
              else {
                target.innerHTML = inHTML;
              }
            }
          }
          target.focus();
          target.dispatchEvent ? target.dispatchEvent(new Event("input", { bubbles: true })) : target.fireEvent("oninput");
          
          fetch(
            `${authenticateUser?.url}/api/usage-count/${gemId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authenticateUser.token}`,
            }
          })

          const elem = document.getElementById("expander-forms-body")
          elem.remove()
          // document.getElementById("expander-forms-body").style.display = "none";
          targetEle?.focus();
        });

      $("#expander-forms-body")
        .find("#curateit-close-btn")
        .click(() => {
          const elem = document.getElementById("expander-forms-body")
          elem.remove()
          // document.getElementById("expander-forms-body").style.display = "none";
          targetEle?.focus();
        });
    }
  );
};

const getTagForCurrentWebsite = () => {
  if (currentUrl.includes("https://www.linkedin.com/")) {
    return "p";
  } else if (currentUrl.includes("https://mail.google.com/")) {
    return "div";
  }
  return "div";
};

const formatAsPerWebsite = (expanderText) => {
  if (textAreaWebsites.some((substring) => currentUrl.includes(substring))) {
    // Create a temporary div element
    var tempDiv = document.createElement("div");
    tempDiv.innerHTML = expanderText;

    // Select all the desired HTML elements using querySelectorAll or getElementsByTagName
    var elements = tempDiv.querySelectorAll("div, p, span");

    // Retrieve the text content from parent element
    var text = elements[0].textContent;

    return text;
  } else {
    return expanderText;
  }
};

const convertToHtml = (text) => {
  const lines = text.split("\n");
  let html = "";
  const tag = getTagForCurrentWebsite();
  for (const line of lines) {
    if (line === "") {
      html += `<${tag}><br /></${tag}>`;
    } else {
      html += `<${tag}>${line}</${tag}>`;
    }
  }
  // return html;

  const newText = formatAsPerWebsite(html);
  return newText;
};

const handleSite = (target, originalText, expandedText, gemId, authenticateUser) => {
  if (
    expandedText.toString().includes("{") &&
    expandedText.toString().includes("}")
  ) {
    openFormsPopup(expandedText, target, gemId, authenticateUser);
  } else {
    if (originalText !== expandedText) {
      const formattedHtml = convertToHtml(expandedText);
      const inHTML        = formattedHtml.startsWith("<") && $(formattedHtml)?.[0]?.innerHTML ?  $(formattedHtml)?.[0]?.innerHTML : formattedHtml;
      
      if (target.value !== undefined) {
        if (target?.parentElement?.tagName === "LABEL" && target?.parentElement?.getAttribute("is") === "cib-label" && currentUrl?.includes("bing.com")) {
          target?.parentElement?.setAttribute("data-input", inHTML);
          target?.parentElement?.setAttribute("data-suggestion", "");
          target?.parentElement?.querySelector(".autosuggest")?.remove();
          // target?.setAttribute("value", inHTML);
        }
        // target.value = expandedText;
        target.value = formattedHtml.startsWith("<") && $(formattedHtml)?.[0]?.outerText ? $(formattedHtml)?.[0]?.outerText : inHTML;
      } else {
        if (target.querySelector("span[data-lexical-text='true']")) {
          target.querySelector("span[data-lexical-text='true']").textContent = $(formattedHtml)?.[0]?.outerText;
        }
        else if (target.querySelector("span[data-text='true']")) {
          target.querySelector("span[data-text='true']").textContent = $(formattedHtml)?.[0]?.outerText;
        }
        else {
          target.innerHTML = formattedHtml || inHTML;
        }
      }
      target.focus();
      target.dispatchEvent ? target.dispatchEvent(new Event("input", { bubbles: true })) : target.fireEvent("oninput");

      fetch(
        `${authenticateUser?.url}/api/usage-count/${gemId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authenticateUser.token}`,
        }
      })

      emptySuggestionBox(document.getElementById("suggestion-box"));
      targetEle.focus();
    }
  }
};

const onInputChange = async (e) => {
  let target = e.target;
  if (target.tagName.toLowerCase() === "cib-serp") {
    target = target?.shadowRoot?.getElementById("cib-action-bar-main")?.shadowRoot?.querySelector("cib-text-input")?.shadowRoot?.getElementById("searchbox")
  }
  if (target.tagName.toLowerCase() === "shreddit-composer") {
    target = target?.querySelector("div[contenteditable='true']")
  }
  const tagName = target.tagName.toLowerCase();
  if (
    (tagName !== "input" &&
    tagName !== "textarea" &&
    !target.isContentEditable)
    ) {
      return;
    }
    
    window.chrome.storage.local.get(["CT_SHORT_LINKS"], (items) => {
      // 
      if (items.CT_SHORT_LINKS) {
      isUserLoggedIn().then((authenticateUser) => {
        if (!authenticateUser) return false
        const originalText = target.value || target.textContent;
        const formsTriggerPattern = /::forms\/(.+)/;
        const match = originalText.match(formsTriggerPattern);
        if (match && match.length > 0) {
          const expanders = items.CT_SHORT_LINKS;
          const expandedText = expandText(
            originalText,
            expanders.filter((t) => {
              return (
                (t.type === "expander" || t.type === "prompt") &&
                t.keyword === match[1]
              );
            })
          );
          handleSite(target, originalText, expandedText, authenticateUser);
        }
      });
    }
  });
};

const onCreateSuggestionBox = (event) => {
  let target = event.target;
  if (target.tagName.toLowerCase() === "cib-serp") {
    target = target?.shadowRoot?.getElementById("cib-action-bar-main")?.shadowRoot?.querySelector("cib-text-input")?.shadowRoot?.getElementById("searchbox")
  }
  if (target.tagName.toLowerCase() === "shreddit-composer") {
    target = target?.querySelector("div[contenteditable='true']")
  }
  const tagName = target?.tagName.toLowerCase();
  const value = target?.isContentEditable ? target?.textContent : target?.value;
  if (
    (tagName !== "input" &&
      tagName !== "textarea" &&
      !target.isContentEditable) ||
    !value?.includes("c:")
  ) {
    return;
  }
  window.chrome.storage.local.get(["CT_SHORT_LINKS"], (items) => {
    if (items.CT_SHORT_LINKS) {
      expansions = items.CT_SHORT_LINKS.filter((t) => {
        return t.type === "expander" || t.type === "prompt";
      });
      let cursorPosition;
      if (target.isContentEditable) {
        const selection = window.getSelection();
        if (selection.rangeCount) {
          const range = selection.getRangeAt(0);
          const tempRange = range.cloneRange();
          tempRange.selectNodeContents(target);
          tempRange.setEnd(range.endContainer, range.endOffset);
          cursorPosition = tempRange.toString().length;
        }
      } else {
        cursorPosition = target.selectionStart;
      }

      const textBeforeCursor = target.value
        ? target.value.substring(0, cursorPosition)
        : target.textContent.substring(0, cursorPosition);
      const lastColonIndex = textBeforeCursor.lastIndexOf(":");

      if (lastColonIndex === -1) {
        suggestionBox.style.display = "none";
        return;
      }
      const formsTriggerPattern = /::forms\/(.+)/;
      const match = textBeforeCursor.match(formsTriggerPattern);
      if (match) {
        currTargetForms = target;
        orgTextForm = currTargetForms.value || currTargetForms.textContent;
        const eIdx = items.CT_SHORT_LINKS.findIndex((t) => {
          return (
            (t.type === "expander" || t.type === "prompt") &&
            t.keyword === match[1]
          );
        });
        if (eIdx !== -1) {
          openFormsPopup(match[1], orgTextForm, expansions);
        }
        return;
      }
      const typedText = textBeforeCursor.substring(lastColonIndex + 1);
      const suggestions = expansions.filter((t) => {
        return t.keyword.startsWith(typedText);
      });

      if (suggestions.length === 0) {
        suggestionBox.style.display = "none";
        return;
      }

      const targetRect = target.getBoundingClientRect();
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      suggestionBox.style.display = "block";
      targetEle = target;

      suggestionBox.style.left = `${targetRect.left + scrollLeft}px`;
      if (targetRect?.bottom > window.innerHeight / 1.7) {
        if (
          tagName === "input" ||
          tagName === "textarea" ||
          tagName === "div"
        ) {
          suggestionBox.style.top = "revert";
          suggestionBox.style.bottom = `${
            window.innerHeight -
            (targetRect.bottom - targetRect.height - scrollTop - 10)
          }px`;
        } else {
          const range = window.getSelection().getRangeAt(0);
          const rangeRect = range.getBoundingClientRect();
          suggestionBox.style.top = "revert";
          suggestionBox.style.bottom = `${
            window.innerHeight -
            (rangeRect.bottom - targetRect.height - scrollTop - 10)
          }px`;
        }
      } else {
        if (
          tagName === "input" ||
          tagName === "textarea" ||
          tagName === "div"
        ) {
          suggestionBox.style.bottom = "revert";
          suggestionBox.style.top = `${
            targetRect.top + targetRect.height + scrollTop
          }px`;
        } else {
          const range = window.getSelection().getRangeAt(0);
          const rangeRect = range.getBoundingClientRect();
          suggestionBox.style.bottom = "revert";
          suggestionBox.style.top = `${
            rangeRect.top + rangeRect.height + scrollTop
          }px`;
        }
      }
      target.blur();
      suggestionBox.focus();

      // Update the suggestion-item template to include a delete button
      // suggestionBox.innerHTML = suggestions
      // create default option for the suggestion box
      const defaultOpt = `<div class="suggestion-item ct-ask-ai-item" data-suggestion-keyword="ask-ai" tabindex="0">
        <div class="itemWrapper">
          <div class="suggestion-key">Ask AI</div>
        </div>
      </div>`
      suggestionBox.querySelector("#suggestion-list").innerHTML = defaultOpt + suggestions
        .map((suggestion, index) => {
          const truncatedExpansion = truncateText(
            suggestion.plainText || suggestion.text,
            30
          );
          return `<div class="suggestion-item" data-suggestion-keyword=${suggestion.keyword} tabindex=${index + 1}>
                    <div class="itemWrapper">
                      <div class="suggestion-key">c:${suggestion.keyword}</div>
                      <div class="suggestion-expansion">${truncatedExpansion}</div>
                    </div>
                    <button class="delete-suggestion delete-icon" data-key="${suggestion.keyword}"></button>
                  </div>`;
        })
        .join("");

      // Update the suggestionBox.onclick function to ignore clicks on the delete button
      suggestionBox.onclick = (e) => {
        handleSuggestionSelect(e);
      };
    }
  });
};

// Add a function to remove the expansion from the storage
function openExpander(key) {
  window.chrome.storage.local.get(["CT_SHORT_LINKS"], (items) => {
    const expanders = items.CT_SHORT_LINKS;
    const currentExpander = expanders.filter((t) => {
      return (
        (t.type === "expander" || t.type === "prompt") && t.keyword === key
      );
    })[0];
    chrome.storage.sync.set({
      editGemData: currentExpander,
    });
    if (currentExpander?.type === "expander") {
      window.panelToggle(`?edit-text-expander`, true);
    } else if (currentExpander?.type === "prompt") {
      window.panelToggle(`?edit-ai-prompt`, true);
    }
  });
}

const handleSuggestionSelect = async (e) => {
  let targetElement = e.target || e;
  const target = targetEle;
  const authenticateUser = await isUserLoggedIn();
  // Check if the target or any of its parent elements has the 'suggestion-item' class
  while (targetElement != null) {
    if (
      targetElement.classList.contains("suggestion-item") ||
      targetElement.classList.contains("delete-suggestion")
    ) {
      break;
    }
    targetElement = targetElement.parentElement;
  }

  // If no parent element has the 'suggestion-item' class, return
  if (targetElement == null) {
    return;
  }

  if (targetElement.classList.contains("suggestion-item")) {
    const targetText = target.value || target.textContent;
    const isAskAiClick = targetElement.getAttribute("data-suggestion-keyword") === "ask-ai";
    if (isAskAiClick) {
      // window.openAskAiPopup();
      chrome.storage.local.remove("aiData");
      window.panelToggle(`?add-ai`, true);
    }
    const expanderIdx = expansions.findIndex((e) => {
      return (
        e.keyword === targetElement.getAttribute("data-suggestion-keyword")
      );
    });
    const expanderObj = expanderIdx !== -1 ? expansions[expanderIdx] : null;
    if (expanderObj) {
      handleSite(target, targetText, expanderObj.text, expanderObj.gemId, authenticateUser);
    }
    suggestionBox.style.display = "none";
  } else if (targetElement.classList.contains("delete-suggestion")) {
    e.stopPropagation(); // Prevent triggering the suggestion-item click event
    const key = targetElement.dataset.key;
    openExpander(key);
    // targetElement.parentElement.style.display = "none";
  }
};

// Check which keys are down
var down = [];

const handleKeyDown = (e) => {
  down[e.keyCode] = true;
  //On up key press
  if (down[38] && suggestionBox.style.display === "block") {
    if ($(".suggestion-item-active").prevAll("div").first().length) {
      var previous = $(".suggestion-item-active").prevAll("div").first();
      $(".suggestion-item-active").removeClass("suggestion-item-active");
      previous.addClass("suggestion-item-active");
      previous[0].scrollIntoView({ block: "nearest", inline: "nearest" });
    } else {
      var last = $(".suggestion-item").not(".suggestion-footer").last();

      $(".suggestion-item-active").removeClass("suggestion-item-active");
      last.addClass("suggestion-item-active");
      last[0].scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    e.stopPropagation();
    e.preventDefault();
  } else if (down[40] && suggestionBox.style.display === "block") {
    // Down key
    e.preventDefault();

    if (
      $(".suggestion-item-active")
        .nextAll("div")
        .not(".suggestion-footer")
        .first().length
    ) {
      var next = $(".suggestion-item-active")
        .nextAll("div")
        .not(".suggestion-footer")
        .first();
      $(".suggestion-item-active").removeClass("suggestion-item-active");
      next.addClass("suggestion-item-active");
      next[0].scrollIntoView({ block: "nearest", inline: "nearest" });
    } else {
      var first = $(".suggestion-item").not(".suggestion-footer").first();
      $(".suggestion-item-active").removeClass("suggestion-item-active");
      first.addClass("suggestion-item-active");
      first[0].scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    e.stopPropagation();
  } else if (down[27] && suggestionBox.style.display === "block") {
    // Esc key
    e.preventDefault();
    e.stopPropagation();
    $(".suggestion-item-active").removeClass("suggestion-item-active");
    suggestionBox.style.display = "none";
    targetEle.focus();
    down = [];
  } else if (down[13] && suggestionBox.style.display === "block") {
    // Enter key
    e.preventDefault();
    e.stopPropagation();
    const activeEle = suggestionBox.querySelector(".suggestion-item-active");
    $(".suggestion-item-active").removeClass("suggestion-item-active");
    if (activeEle) {
      handleSuggestionSelect(activeEle);
    } else {
      suggestionBox.style.display = "none";
      targetEle.focus();
    }
  }
};

const handleKeyUp = (e) => {
  fired = false;
  down = [];
  e.stopPropagation();
  e.preventDefault();
};

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

document.addEventListener("input", onCreateSuggestionBox);
document.addEventListener("input", onInputChange);
document.addEventListener("click", (event) => {
  if (!event.target.closest("#suggestion-box")) {
    suggestionBox.style.display = "none";
  }
});
