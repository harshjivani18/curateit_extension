(() => {
  function convertString(str) {
    return str?.toLowerCase().split(" ").join("-");
  }
  function callCurateit(title, description, imgUrl) {
    // window.panelToggle(`?add-import-details`, true, true);
    const images1 = Array.from(document?.images)?.map((img) => { return img.src }) || []
    const icon    = document.querySelector("link[rel*='icon']")?.href || ""
    const message = {
      post: {
        title: title,
        description: description,
        media_type: "Profile",
        platform: "Youtube",
        post_type: "SaveToCurateit",
        type: "Youtube",
        url: window.location.href,
        media: {
          covers: [imgUrl],
        },
        metaData: {
          covers: [imgUrl],
          docImages: [imgUrl, ...images1],
          icon: icon !== "" ? { type: "image", icon } : null,
          defaultThumbnail: imgUrl,
          defaultIcon: icon !== "" ? icon : null,
        },
        collection_gems: [],
        remarks: "",
        tags: [],
        is_favourite: true,
        socialfeed_obj: {
          id: convertString(title),
          title: title,
          description: description,
          profile_url: window.location.href,
        },
      },
    };
    chrome.storage.local.set({
      socialObject: message,
    });
    
    window.panelToggle(`?add-profile`, true, true);
    // window.panelToggle(`?import-container`, true, true);
  }

  function addImportBtn() {
    let bars = document.querySelectorAll("#inner-header-container div#buttons");

    for (let bar of bars) {
      if (bar.querySelector(".bulkImportBtn")) continue;
      let div = document.createElement("div");

      let button = document.createElement("button");
      button.innerHTML = `
        <img src="https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png" width="20" style="margin-right: 5px; filter: invert(0);">
        Import Profile
      `;
      button.id = "injected-button";
      button.style = `
        font-size: 14px;
        border: 1px solid gray;
        cursor: pointer;
        background: white;
        border-radius: 16px;
        color: black;
        padding: 6px 10px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
      `;
      button.className = "bulkImportBtn";
      button.title = "Add to Feed!";

      button.addEventListener("click", async function (e) {
        e.preventDefault();
        let parentElement = bar.parentNode;
        let title = parentElement
          .querySelector("#text-container")
          .textContent.trim();
        let description = parentElement
          .querySelector("#content")
          .textContent.trim();
        let imgUrl = parentElement.parentNode.querySelector("#avatar img").src;
        callCurateit(title, description, imgUrl);
      });
      div.appendChild(button);

      let targetContainer = bar;
      if (targetContainer) {
        targetContainer.style.display = "flex";
        targetContainer.style.gap = "2px";
        targetContainer.appendChild(div);
      } else {
        console.warn("Target container not found inside the bar!");
      }
    }
  }

  function cleanup() {
    observer1.disconnect();
    document.getElementById("injected-button").removeEventListener("click");
  }

  window.addEventListener("load", function () {
    addImportBtn();

    let observer1 = new MutationObserver(addImportBtn);
    observer1.observe(document.body, { childList: true, subtree: true });

    // Assuming there's a way to detect navigating away or button removal
    window.addEventListener("beforeunload", cleanup);
  });
})();
