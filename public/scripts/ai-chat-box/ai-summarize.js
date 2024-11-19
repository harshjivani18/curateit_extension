function setAIMessage(){
  const prompt = window.getSelection()?.getRangeAt(0)?.cloneContents()?.textContent?.trim()
  // window.openAskAiPopup(prompt)
  window.chrome.storage.local.remove("aiData");
  window.chrome.storage.local.set({
    aiData: {
      text: prompt || document.body.innerText,
      isSummarize: prompt === "" || prompt !== undefined || prompt !== null,
    },
  });
  window.panelToggle(`?add-ai`, true);
}

setAIMessage()