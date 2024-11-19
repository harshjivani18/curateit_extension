

let url;
let title;
let desc;
let actorName;
let link;
let imgUrl;

function convertString(str) {
  return str?.toLowerCase().split(" ").join("-");
}

function addToCurateitGglReviews(title, desc, link, imgUrl, author, product, rating) {
  const importData = chrome?.storage?.sync.get(["importData"]);
  const elem            = document.querySelector("link[rel='icon']") || document.querySelector("link[rel='shortcut icon']");
  const testimonialIcon = elem ? elem.href : null;
  const images1 = Array.from(document?.images)?.map((img) => { return img.src }) || []
  // const icon    = document.querySelector('link[rel="icon"]')?.href || ""
  const message = {
    post: {
      title: title,
      description: desc,
      media_type: "Testimonial",
      platform: "Google",
      post_type: "SaveToCurateit",
      type: "Google",
      url: link,
      author: author,
      product: product,
      rating: rating,
      testimonialIcon,
      media: {
        covers: [imgUrl],
      },
      metaData: {
        covers: [imgUrl],
        docImages: [imgUrl, ...images1],
        defaultIcon: elem?.href ||null,
        defaultThumbnail:imgUrl,
        icon: elem ? { type: "image", icon: elem?.href } : null,
      },
      collection_gems: importData?.importData?.data?.collection_gems,
      remarks: importData?.importData?.data?.remarks,
      tags: importData?.importData?.data?.tags,
      is_favourite: true,
      socialfeed_obj: {
        id: convertString(title),
        title: title,
        description: desc,
        profile_url: link,
        profile_image_url: imgUrl,
      },
    },
  };
  chrome.storage.local.set({
    socialObject: message,
  });
  window.panelToggle(`?save-testimonial`, true);
  
}

function extractFirstFloat(str) {
  const regex = /\d+(\.\d+)?/;
  const match = str.match(regex);
  return match ? parseFloat(match[0]) : null;
}

function addButton() {
  let bars = document.querySelectorAll("div.gws-localreviews__google-review");
  for (let bar of bars) {
    if (bar.querySelector(".Google-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "Google-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", async function (e) {
      let desc = bar
        .querySelector("span[data-expandable-section]")
        ?.textContent.trim();
      let imgUrl = bar.querySelector("div a img")?.src;
      let authorElem = bar.querySelector(
        ".gws-localreviews__google-review div >div> div> a"
      );
      let author = authorElem?.textContent.trim();
      let link = authorElem.getAttribute("href");
      let title = `${author} on Google Reviews`;
      let product = document
        .querySelector(".review-dialog-top > div>div>div")
        ?.textContent.trim();
      let ratingElem = bar
        .querySelector("span[role='img']")
        .getAttribute("aria-label");
      let rating = extractFirstFloat(ratingElem);
      // Call your function
      addToCurateitGglReviews(title, desc, link, imgUrl, author, product, rating);
    });

    div.appendChild(img);

    let targetContainer = bar.querySelector("button")?.parentElement;
    if (targetContainer) {
      targetContainer.style.display = "flex";
      targetContainer.appendChild(div);
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
