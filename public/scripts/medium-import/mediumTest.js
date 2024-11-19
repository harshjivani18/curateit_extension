

let url;
let title;
let desc;
let actorName;
let link;
let imgUrl;

function convertString(str) {
  return str?.toLowerCase().split(" ").join("-");
}

function addToCurateitMediumTest(title, description, url, image) {
  const importData = chrome?.storage?.sync.get(["importData"]);
  const images1    = Array.from(document?.images)?.map((img) => { return img.src }) || [];
  const icon       = document.querySelector('link[rel="icon"]')?.href || ""
  const message = {
    post: {
      title: title,
      description: description,
      media_type: "Article",
      platform: "Medium",
      post_type: "SaveToCurateit",
      type: "Medium",
      url: url,
      media: {
        covers: [image],
      },
      metaData: {
        covers: [image],
        docImages: [ image, ...images1 ],
        defaultThumbnail: image,
        defaultIcon: icon !== "" ? icon : null,
        icon: icon !== "" ? { type: "image", icon } : null,
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
  chrome.storage.local.set({
    socialObject: message,
  });
  window.panelToggle(`?save-article`, true);
  
}

function addButton() {
  let bars = document.querySelectorAll("div.s article");
  for (let bar of bars) {
    if (bar.querySelector(".Medium-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "23px";
    img.style.height = "auto";
    img.style.cursor = "pointer";
    img.className = "Medium-button";
    img.title = "Add to Feed!";
    img.addEventListener("click", function (e) {
      let title = bar.querySelector("h2")?.textContent.trim() || "";
      let desc = bar.querySelector("a div p")?.textContent.trim() || "";
      let link = bar.querySelector("a div p")?.closest("a")?.href || "";
      let imgUrl =
        bar.querySelector(
          "a[aria-label='Post Preview Image'] img[loading='lazy']"
        )?.src || "";
      addToCurateitMediumTest(title, desc, link, imgUrl);
    });
    div.appendChild(img);
    div.style.display = "flex";
    let targetContainer = bar
      .querySelectorAll(".n .di")[0]
      ?.querySelectorAll(".n .o")[1];
    if (targetContainer) {
      targetContainer.appendChild(div);
    } else {
      console.warn("Target container not found inside the bar!");
    }
  }
}

function addButtonToPage() {
  let bars = document.querySelectorAll("footer");
  for (let bar of bars) {
    bar = bar.parentNode;
    if (bar.querySelector(".Medium-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "23px";
    img.style.height = "auto";
    img.style.cursor = "pointer";
    img.className = "Medium-button";
    img.title = "Add to Feed!";
    img.addEventListener("click", function (e) {
      let commonParent = bar;
      if (commonParent) {
        let titleElement = commonParent.querySelector("h1");
        let parent = titleElement.parentNode.parentNode;
        
        if (titleElement) {
          title = titleElement.innerText || titleElement.textContent;
          title = title.trim();
        } else {
          console.warn("titleElement not Found");
        }

        let descElements = parent.querySelectorAll("p.pw-post-body-paragraph");

        if (descElements.length > 0) {
          descElements.forEach((el) => {
            let text = el.innerText || el.textContent;
            if (text) {
              // Ensure text is defined and not empty
              desc += text;
              desc += " "; // You can add a space or '\n' if you want to separate the texts
            }
          });
          desc = desc.trim(); // Trim any extra whitespace
        } else {
          console.warn("descElement not Found");
        }

        let linkElement = window.location.href;
        if (linkElement) {
          link = linkElement;
        } else {
          console.warn("linkElement not Found");
        }

        let imgUrlElement = commonParent.querySelector("figure picture img");
        if (imgUrlElement) {
          imgUrl = imgUrlElement.src;
        } else {
          console.warn("imgUrlElement not Found");
        }

        addToCurateitMediumTest(title, desc, link, imgUrl);
      } else {
        console.log("No common parent found.");
      }
    });
    // Add the image to the div
    div.appendChild(img);
    div.style.marginLeft = "24px";
    // Add the div to the action bar
    let footerDiv = bar.querySelector("footer > div > div > div > div > div");
    footerDiv.appendChild(div);
    // 
    // commentsDiv.querySelector("div").appendChild(div);
  }
}

// Run the addButton function once the page is loaded
window.addEventListener("load", function () {
  // Run the function once at the start
  addButton();
  addButtonToPage();

  // Create a MutationObserver to watch for changes in the page for addButton
  let observer1 = new MutationObserver(addButton);
  // Start observing
  observer1.observe(document.body, { childList: true, subtree: true });

  // Create a MutationObserver to watch for changes in the page for addButtonToPage
  let observer2 = new MutationObserver(addButtonToPage);
  // Start observing
  observer2.observe(document.body, { childList: true, subtree: true });
});
