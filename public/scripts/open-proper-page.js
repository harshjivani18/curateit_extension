const validatePanel = async (type = "") => {
    try {
        const data = await new Promise((resolve, reject) => {
          chrome.storage.sync.get(["userData"], (result) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(result);
            }
          });
        });
  
        if (data?.userData?.token || data?.userData?.userData?.token) {
            chrome?.storage?.sync.get(["gemId"], function (text) {
                if (text && text?.gemId && text?.gemId?.gemId) {
                    chrome.storage.sync.set({
                    editGemData: {gemId: text?.gemId?.gemId},
                    })
                    window.panelToggle(`?open-edit-bookmark`, true)
                } else {
                    chrome.storage.sync.set({
                    editGemData: null,
                    })
                    // window.panelToggle("?add-bookmark", true);
                    const platformsArray = [
                      'Twitter', 'LinkedIn', 'Reddit', 'Medium', 
                      'Github', 'Instagram', 'Youtube',
                    ]
                    const normalizedUrl = window.location.href.toLowerCase();
                    const foundPlatform = platformsArray.find(platform => normalizedUrl.includes(platform.toLowerCase()));
                    const profileBtnFound = checkImportProfilePresence();
                    if(profileBtnFound && foundPlatform){
                      if(foundPlatform === 'Twitter'){
                        window.TwitterProfile()
                      }else if(foundPlatform === 'Github'){
                        window.GithubProfile(data?.userData || data?.userData?.userData)
                      }else if(foundPlatform === 'Instagram'){
                        window.InstagramProfile(data?.userData || data?.userData?.userData)
                      }else if(foundPlatform === 'Reddit'){
                        window.RedditProfile(data?.userData || data?.userData?.userData)
                      }else if(foundPlatform === 'LinkedIn'){
                        window.LinkedInProfile()
                      }else if(foundPlatform === 'Medium'){
                        window.MediumProfile()
                      }else if(foundPlatform === 'Youtube' && !window.location.href.startsWith("https://www.youtube.com/watch")){
                        window.YoutubeProfile()
                      }else{
                        window.panelToggle("?add-bookmark", true);
                      }
              
              // window.panelToggle(`?add-profile`, true, true)
                    }else{
                      window.panelToggle("?add-bookmark", true);
                    }
                    }
                    })
        }
        else {
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
                CT_IMAGES: document.images
              },
            });
        
            chrome.storage.local.set({
              CT_IMAGE_DATA: {
                CT_IMAGE_SRC: Array.from(document.images)?.map((img) => { return img.src }),
              }
            })
            
            window.panelToggle("?open-extension", true);
        }
  
      // const data = await new Promise((resolve, reject) => {
      //     chrome.storage.sync.get(["userData"], (result) => {
      //         if (chrome.runtime.lastError) {
      //             reject(chrome.runtime.lastError);
      //         } else {
      //             resolve(result);
      //         }
      //     });
      // });
  
      // if (data?.userData?.token) {
      
      // window.openProperTypePage()
      // iframe.style.width = "50px";
      // iframe.style.display = "block";
      // iframe.style.height = "100%"
      // iframe.contentWindow.postMessage('SHOW_MENU', chrome.runtime.getURL("index.html"))
      // } else {
      //     window.panelToggle(`?open-extension`, true)
      // window.alert('Please logged in into curateit!')
      // }
    } catch (error) {
      console.error(error);
    }
};

function checkImportProfilePresence() {
    const srcUrl = 'https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png';
    const images = document.querySelectorAll(`img[src="${srcUrl}"]`);
    
    for (let img of images) {
        const nextSibling = img.nextSibling;
        if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE && nextSibling.nodeValue.includes("Import Profile")) {
            return true; // Found the image with the "Import Profile" text
        }
    }
    return false; // The specific image or text was not found
}

window.openProperTypePage = () => {
    // const elem  = Array.from($('button:contains("Import Profile")'))
    // if (elem.length !== 0) {
    //     elem[0].click()
    // }
    // else {
    //     // window.updateRecentURLDetails()
    //     validatePanel()
    // }
    validatePanel()
}