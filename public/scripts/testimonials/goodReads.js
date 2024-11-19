

let url;
let title;
let desc;
let actorName;
let link;
let imgUrl;

function convertDateFormat(dateStr) {
  const months = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

  const dateObj = new Date(dateStr);

  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  const day = dateObj.getDate().toString().padStart(2, "0");
  const month = months[dateObj.toLocaleString("default", { month: "long" })];
  const year = dateObj.getFullYear();

  return `${day}-${month}-${year}`;
}

function convertString(str) {
  return str?.toLowerCase().split(" ").join("-");
}

function addToCurateitGoodReads(
  title,
  desc,
  link,
  imgUrl,
  author,
  product,
  rating,
  dateAdded
) {
  const importData = chrome?.storage?.sync.get(["importData"]);
  const elem =
    document.querySelector("link[rel='icon']") ||
    document.querySelector("link[rel='shortcut icon']");
  const testimonialIcon = elem ? elem.href : null;
  const images1 =
    Array.from(document?.images)?.map((img) => {
      return img.src;
    }) || [];
  const icon = document.querySelector('link[rel="icon"]')?.href || "";
  const message = {
    post: {
      title: title,
      description: desc,
      media_type: "Testimonial",
      platform: "Goodreads",
      post_type: "SaveToCurateit",
      type: "Goodreads",
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
        defaultThumbnail: imgUrl,
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
  const match = str.match(/\d+/);
  return match ? parseFloat(match[0]).toFixed(1) : null;
}

function addButton() {
  let bars = document.querySelectorAll("article.ReviewCard");
  for (let bar of bars) {
    if (bar.querySelector(".Goodreads-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "Goodreads-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", async function (e) {
      let bookElement = document.querySelector("h1");
      let titleElement = bar.getAttribute("aria-label");
      let title = `${titleElement} on ${bookElement?.textContent.trim()} on Goodreads`;
      let desc = bar.querySelector("section.ReviewText")?.textContent;
      let link = window.location.href;
      let imgUrl = bar.querySelector("img.Avatar__image")?.src;
      let author = titleElement.replace("Review by ", "") || "";
      let product = bookElement?.textContent.trim() || "";
      let numberString = bar
        .querySelector("span.RatingStars")
        .getAttribute("aria-label");
      let rating = extractFirstFloat(numberString);
      let dateAdded =
        bar.querySelector(".Text.Text__body3 a")?.textContent || "";
      dateAdded = convertDateFormat(dateAdded);

      addToCurateitGoodReads(
        title,
        desc,
        link,
        imgUrl,
        author,
        product,
        rating,
        dateAdded
      );
    });

    div.appendChild(img);
    div.classList.add("SocialFooter__action");

    let targetContainer = bar.querySelector("div[data-testid='actions']");
    targetContainer.style.display = "flex";
    targetContainer.style.alignItems = "center";
    if (targetContainer) {
      targetContainer.appendChild(div);
    } else {
      console.warn("Target container not found inside the bar!");
    }
  }
}

function addBookImportButton() {
  
  let bars = document.querySelectorAll(".BookPage__mainContent");
  for (let bar of bars) {
    if (bar.querySelector(".Goodreads-book-button")) continue;
    let div = document.createElement("div");
    div.style.width = "100%";
    div.innerHTML = `<button id="injected-button" style="font-size: 14px;margin-top: 10px;border: 1px solid gray;cursor: pointer;background: white;border-radius: 16px;color: black;padding: 6px 10px;font-weight: 600;display: inline-flex;align-items: center;width: 100%;justify-content: center;"><img src="https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png" width="20" style="margin-right: 5px;">Import Book</button>`;
    let ratingStr =
      document.querySelector(".RatingStatistics__rating")?.textContent || "0";
    let rating = parseFloat(ratingStr);

    div.addEventListener("click", async function (e) {
      e.stopPropagation();
      chrome.storage.local.set({
        gdReadsRating: rating,
      });
      window.panelToggle(`?save-book`, true);
    });

    let targetContainer = document.querySelector(
      ".BookRatingStars__message"
    )?.parentNode;
    if (targetContainer) {
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
  addBookImportButton();

  // Create a MutationObserver to watch for changes in the page for addButton
  let observer1 = new MutationObserver(addButton);
  // Start observing
  observer1.observe(document.body, { childList: true, subtree: true });
});
