

let url;
let title;
let desc;
let actorName;
let link;
let imgUrl;

function convertString(str) {
  return str?.toLowerCase().split(" ").join("-");
}

function convertDateString(dateString) {
  const months = {
      "January": "01",
      "February": "02",
      "March": "03",
      "April": "04",
      "May": "05",
      "June": "06",
      "July": "07",
      "August": "08",
      "September": "09",
      "October": "10",
      "November": "11",
      "December": "12"
  };

  const parts = dateString.split(" ");
  const day = String(parts[1]).padStart(2, '0').slice(0, -1); // Remove comma and ensure two digits
  const month = months[parts[0]];
  const year = parts[2];

  return `${day}-${month}-${year}`;
}

function addToCurateitShopify(title, desc, link, imgUrl, author, product, rating, dateAdded) {
  const importData = chrome?.storage?.sync.get(["importData"]);
  const elem            = document.querySelector("link[rel='icon']") || document.querySelector("link[rel='shortcut icon']");
  const testimonialIcon = elem ? elem.href : null;
  const images1 = Array.from(document?.images)?.map((img) => { return img.src }) || []
  const icon    = document.querySelector('link[rel="icon"]')?.href || ""
  const message = {
    post: {
      title: title,
      description: desc,
      media_type: "Testimonial",
      platform: "Shopify",
      post_type: "SaveToCurateit",
      type: "Shopify",
      url: link,
      author: author,
      product: product,
      dateAdded: dateAdded,
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

function addButton() {
  let bars = document.querySelectorAll("div[data-merchant-review]");
  for (let bar of bars) {
    if (bar.querySelector(".Shopify-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "Shopify-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", async function (e) {
      let desc = bar.querySelector("p")?.textContent;
      let link = window.location.href.replace("reviews","");
      let author = bar.querySelector("div[title]")?.textContent.trim();
      let product = document.querySelector("span a span")?.textContent.trim();
      let ratingElem = bar.querySelector('div[aria-label]').getAttribute("aria-label")
      let rating = parseInt(ratingElem.match(/\d+/)[0]);
      let dateElem = bar.querySelector('div[role="img"]').nextElementSibling.textContent.trim()
      let dateAdded=convertDateString(dateElem)
      let imgUrl = document.querySelector('meta[property="og:image"]').getAttribute("content")
      let title = `${author} about ${product} on Shopify`
      // Call your function
      addToCurateitShopify(title, desc, link, imgUrl, author, product, rating, dateAdded);
    });

    div.appendChild(img);

    let targetContainer = bar.querySelector("div").querySelector("div");
    if (targetContainer) {
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
