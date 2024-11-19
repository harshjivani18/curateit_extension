window.updateRecentURLDetails = () => {
  let keywords = [];
  const keywordElems = document.querySelector("meta[name='keywords']");
  const keywordContent = keywordElems
    ? keywordElems.getAttribute("content")
    : null;

  if (keywordContent && keywordContent.length > 0) {
    keywords = keywordElems.getAttribute("content").split(",");
  } else {
    const bodyElement = document.querySelector("body");
    const allWords = bodyElement.outerText
      .toLowerCase()
      .replace(/[^A-Za-z]/gm, " ")
      .split(/\s+/gm);
    const wordsObj = {};
    allWords
      .filter((o) => {
        return o !== "";
      })
      .forEach((w) => {
        if (wordsObj[w]) {
          wordsObj[w]++;
        } else if (w.length > 5) {
          wordsObj[w] = 1;
        }
      });
    const sortedValues = Object.values(wordsObj).sort((a, b) => b - a);
    const maxN = sortedValues[5 - 1];
    const fiveHighest = Object.entries(wordsObj).reduce(
      (wordsObj, [k, v]) => (v >= maxN ? { ...wordsObj, [k]: v } : wordsObj),
      {}
    );
    keywords = Object.keys(fiveHighest).map((o) => {
      return o;
    });
  }
  chrome.storage.sync.set({
    CT_INITIAL_DATA: {
      CT_KEYWORDS: keywords,
      CT_URL: window.location.href,
      CT_TITLE: document.title,
      CT_IMAGES: document.images,
    },
  });
  chrome.storage.local.set({
    CT_IMAGE_DATA: {
      CT_IMAGE_SRC: Array.from(document.images)?.map((img) => { return img.src }),
    }
  })
}