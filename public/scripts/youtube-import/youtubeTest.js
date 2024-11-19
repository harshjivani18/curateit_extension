

let url;
let title;
let desc;
let actorName;
let link;
let imgUrl;

function convertString(str) {
  return str?.toLowerCase().split(" ").join("-");
}

function addToCurateitYoutubeTest(title, description, url, image) {
  const importData = chrome?.storage?.sync.get(["importData"]);
  const images1 = Array.from(document?.images)?.map((img) => { return img.src }) || []
  const icon    = document.querySelector("link[rel*='icon']")?.href || ""
  const message = {
    post: {
      title: title,
      description: description,
      media_type: "Video",
      platform: "YouTube",
      post_type: "SaveToCurateit",
      type: "YouTube",
      url: url,
      media: {
        covers: [image],
      },
      metaData: {
        covers: [image],
        docImages: [image, ...images1],
        icon: icon !== "" ? { type: "image", icon } : null,
        defaultThumbnail: image,
        defaultIcon: icon !== "" ? icon : null,
      },
      collection_gems: importData?.importData?.data?.collection_gems,
      remarks: importData?.importData?.data?.remarks,
      tags: importData?.importData?.data?.tags,
      is_favourite: true,
      socialfeed_obj: {
        id: convertString(title),
        title: title,
        description: description,
        profile_url: url,
        profile_image_url: image,
      },
    },
  };
  chrome.storage.sync.set({
    socialObject: message,
  });
  window.panelToggle(`?save-video`, true);
  
}

function getVideoIdFromUrl(urlString) {
  const url = new URL(urlString);
  return url.searchParams.get("v");
}

function addButton() {
  let bars = document.querySelectorAll(
    "#actions #menu"
  );
  for (let bar of bars) {
    let parentBar =
      bar.parentElement.parentElement.parentElement.parentElement.parentElement;
    if (bar.querySelector(".YouTube-button")) continue;

    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
    chrome.runtime.getURL("images/gray-logo-icon.svg");
    // img.src =
    //   "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "YouTube-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", async function (e) {
      let pageUrl = window.location.href;
      let vidId = getVideoIdFromUrl(pageUrl);
      
      let title = parentBar?.querySelector("h1")?.textContent.trim() || "";
      let desc =
        parentBar
          ?.querySelector("yt-attributed-string span.yt-core-attributed-string")
          .textContent.trim() || "";
      
      let link = window.location.href;
      // Call your function
      addToCurateitYoutubeTest(title, desc, link, imgUrl);
    });

    div.appendChild(img);
    div.style.display = "flex";

    let targetContainer = bar;
    if (targetContainer) {
      targetContainer.style.display = "flex";
      targetContainer.style.flexFlow = "nowrap"
      targetContainer.style.justifyContent = "flex-end";
      targetContainer.prepend(div);
    } else {
      console.warn("Target container not found inside the bar!");
    }
  }
}

// Run the addButton function once the page is loaded
window.addEventListener("load", function () {
  // Run the function once at the start
  addButton();

  // Create a MutationObserver to watch for changes in the page for addButton
  let observer1 = new MutationObserver(addButton);
  // Start observing
  observer1.observe(document.body, { childList: true, subtree: true });
});
