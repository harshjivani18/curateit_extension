

let url;
let title;
let desc;
let actorName;
let link;
let imgUrl;

function convertDateFormat(dateStr) {
  const replacedStr = dateStr.replace(/\//g, "-");
  return replacedStr;
}

function convertString(str) {
  return str?.toLowerCase().split(" ").join("-");
}

function addToCurateitAppStore(
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
  let totalReviews = allReviewsObject?.aggregateRating?.reviewCount;
  let maxRating = 5;
  const elem            = document.querySelector("link[rel='icon']") || document.querySelector("link[rel='shortcut icon']");
  const testimonialIcon = elem ? elem.href : null;
  const images1 = Array.from(document?.images)?.map((img) => { return img.src }) || []
  
  // const icon    = document.querySelector('link[rel="icon"]')?.href || ""
  const message = {
    post: {
      title: title,
      description: desc,
      media_type: "Testimonial",
      platform: "AppStore",
      post_type: "SaveToCurateit",
      type: "AppStore",
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

function addButton() {
  let bars = document.querySelectorAll(".we-customer-review.lockup");
  var scriptTag = document.querySelector('script[type="application/ld+json"]');
  var jsonContent = scriptTag.textContent || scriptTag.innerText;
  var jsonObject = JSON.parse(jsonContent);
  let allReviewsObject = jsonObject;

  for (let bar of bars) {
    if (bar.querySelector(".AppStore-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "AppStore-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", async function (e) {
      let titleElement = bar.querySelector("h3");
      let title = titleElement?.textContent.trim();
      let desc = bar.querySelector("blockquote")?.textContent.trim();
      let link = window.location.href;
      let imgUrl = document
        .querySelector("picture.product-hero__artwork source")
        ?.srcset.match(/([^\s,]+)\s+460w/)[1];
      let author =
        bar
          .querySelector("span.we-customer-review__user")
          ?.textContent.trim() || "";
      let product = allReviewsObject?.name || "";
      let ratingsElement = bar.querySelector(".we-star-rating-stars");
      let classes = ratingsElement?.className.split(" ");
      let starClass = classes?.find((cls) =>
        cls.startsWith("we-star-rating-stars-")
      );
      let numberString = starClass?.replace("we-star-rating-stars-", "");
      let rating = parseFloat(numberString) / 1;
      let dateAdded = bar.querySelector("time").textContent.trim() || "";
      dateAdded = convertDateFormat(dateAdded);
      // Call your function
      addToCurateitAppStore(
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

    let targetContainer = bar.querySelector("figure");
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
