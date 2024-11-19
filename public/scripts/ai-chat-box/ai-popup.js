function setAIMessage(){
  const prompt = window.getSelection()?.getRangeAt(0)?.cloneContents()?.textContent?.trim()
  // window.openAskAiPopup(prompt)
  window.chrome.storage.local.remove("aiData");
  window.chrome.storage.local.set({
    aiData: {
      text: prompt || document.body.innerText,
      isSummarize: false,
    },
  });
  window.panelToggle(`?add-ai`, true);
}

setAIMessage()