

let url;
let title;
let desc;
let actorName;
let link;
let imgUrl;

function convertString(str) {
  return str?.toLowerCase().split(" ").join("-");
}

function convertDateFormat(dateStr) {
  // const monthMap = {
  //   January: "01",
  //   February: "02",
  //   March: "03",
  //   April: "04",
  //   May: "05",
  //   June: "06",
  //   July: "07",
  //   August: "08",
  //   September: "09",
  //   October: "10",
  //   November: "11",
  //   December: "12",
  // };
  // 
  // const parts = dateStr.split(" ");
  // 
  // const day = parts[0].padStart(2, "0");
  // const month = monthMap[parts[1]];
  // const year = parts[2];
  const d = new Date(dateStr);
  return `${d.getDay()}-${d.getMonth() + 1}-${d.getFullYear()}`;
}

function addToCurateitPlayStore(
  title,
  desc,
  link,
  imgUrl,
  allReviewsObject,
  author,
  product,
  rating,
  dateAdded
) {
  const importData = chrome?.storage?.sync.get(["importData"]);
  
  let currentRating = allReviewsObject?.aggregateRating?.ratingValue;
  let totalReviews = allReviewsObject?.aggregateRating?.ratingCount;
  let maxRating = 5;
  const elem            = document.querySelector("link[rel='icon']") || document.querySelector("link[rel='shortcut icon']");
  const testimonialIcon = elem ? elem.href : null;
  const images1 = Array.from(document?.images)?.map((img) => { return img.src }) || []
  const icon    = document.querySelector('link[rel="icon"]')?.href || ""
  const message = {
    post: {
      title: title,
      description: desc,
      media_type: "Testimonial",
      platform: "PlayStore",
      post_type: "SaveToCurateit",
      type: "PlayStore",
      url: link,
      author: author,
      product: product,
      rating: rating,
      dateAdded: dateAdded,
      testimonialIcon,
      media: {
        covers: [imgUrl],
      },
      metaData: {
        covers: [imgUrl],
        docImages: [imgUrl, ...images1],
        defaultIcon: elem?.href || null,
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
        allReviews: allReviewsObject,
        currentRating: currentRating,
        maxRating: maxRating,
        totalReviews: totalReviews,
      },
    },
  };
  chrome.storage.local.set({
    socialObject: message,
  });
  window.panelToggle(`?save-testimonial`, true);
  
}

function extractFirstFloat(str) {
  const match = str.match(/\d+/);
  return match ? parseFloat(match[0]).toFixed(1) : null;
}

function addButton() {
  let bars = document.querySelectorAll('div[data-g-id="reviews"] div.EGFGHd');
  // Select the script tag by its specific attributes
  var scriptTag = document.querySelector('script[type="application/ld+json"]');

  // Extract the inner text, which is the JSON content
  var jsonContent = scriptTag.textContent || scriptTag.innerText;

  // Parse the JSON string into a JavaScript object
  var jsonObject = JSON.parse(jsonContent);

  let allReviewsObject = jsonObject;

  for (let bar of bars) {
    if (bar.querySelector(".PlayStore-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "PlayStore-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", async function (e) {
      let userName = bar
        .querySelector("img")
        ?.nextElementSibling?.textContent.trim();
      let title = `${userName} about ${allReviewsObject?.name} on Playstore`;
      let desc = bar.querySelector(":scope  > div:first-of-type")?.textContent;
      let link = window.location.href;
      let imgUrl = bar.querySelector("img")?.src;
      let author = userName || "";
      let product = allReviewsObject?.name || "";

      let spanElements = bar.querySelectorAll("header div span");
      let dateAdded = spanElements[spanElements.length - 1];
      let numberString =
        dateAdded.previousElementSibling.getAttribute("aria-label");
      let rating = extractFirstFloat(numberString);
      dateAdded = convertDateFormat(dateAdded?.textContent.trim());
      // Call your function
      addToCurateitPlayStore(
        title,
        desc,
        link,
        imgUrl,
        allReviewsObject,
        author,
        product,
        rating,
        dateAdded
      );
    });

    div.appendChild(img);
    div.style.display = "flex";

    let targetContainer = bar.querySelector("footer");
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
