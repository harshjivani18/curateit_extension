

let url;
let title;
let desc;
let actorName;
let link;
let imgUrl;

function convertString(str) {
  return str?.toLowerCase().split(" ").join("-");
}

function addToCurateitTrustPilot(
  title,
  desc,
  link,
  imgUrl,
  author,
  product,
  rating,
  dateAdded,
  profilePic=""
) {
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
      platform: "Trustpilot",
      post_type: "SaveToCurateit",
      type: "Trustpilot",
      url: link,
      author: author,
      product: product,
      rating: rating,
      dateAdded: dateAdded,
      testimonialIcon,
      media: {
        covers: profilePic !== "" ? [profilePic, imgUrl] : [imgUrl],
      },
      metaData: {
        covers: profilePic !== "" ? [profilePic, imgUrl] : [imgUrl],
        docImages: profilePic !== "" ? [profilePic, imgUrl, ...images1] : [imgUrl, ...images1],
        defaultIcon: elem?.href || null,
        defaultThumbnail:profilePic !== "" ? profilePic : imgUrl,
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
        profile_image_url: profilePic !== "" ? profilePic : imgUrl,
      },
    },
  };
  chrome.storage.local.set({
    socialObject: message,
  });
  window.panelToggle(`?save-testimonial`, true);
  
}

function extractRating(str) {
  const match = str.match(/\b\d+\b/); // Regex to match an integer
  return match ? parseFloat(match[0]) : null;
}

function convertDateFormat(datetime) {
  const date = new Date(datetime);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-indexed in JavaScript, so add 1
  const year = date.getUTCFullYear();
  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
}

function addButton() {
  let bars = document.querySelectorAll("article");
  for (let bar of bars) {
    if (bar.querySelector(".Trustpilot-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "Trustpilot-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", async function (e) {
      let user = bar.querySelector("a[name='consumer-profile'] > span");
      let userName = user?.textContent?.trim();
      let titleElement = bar.querySelector("h2");
      let productName = document.querySelector("h1 > span");
      let title = `Review by ${userName} for ${productName?.textContent} on TrustPilot`;
      let desc = bar.querySelector("p")?.textContent;
      let link = titleElement?.closest("a").href;
      let imgUrl = bar.querySelector("img")?.src;
      let profilePic = bar.querySelector("img[data-consumer-avatar-image='true']")?.src || "";
      let author = userName || "";
      let product = productName?.textContent || "";
      // let ratingsElement = bar
      //   .querySelector("section img")
      //   ?.getAttribute("alt");
      let ratting = 5
      const ratingsElement = bar.querySelector("[data-service-review-rating]")?.getAttribute("data-service-review-rating");
      if (ratingsElement) {
        ratting = parseFloat(ratingsElement);
      }
      // let rating = extractRating(ratingsElement);
      let dateAdded = bar
        .querySelector('time[data-service-review-date-time-ago="true"]')
        .getAttribute("datetime");
      dateAdded = convertDateFormat(dateAdded);
      // Call your function
      addToCurateitTrustPilot(
        title,
        desc,
        link,
        imgUrl,
        author,
        product,
        ratting,
        dateAdded,
        profilePic
      );
    });

    div.appendChild(img);

    let targetContainer = bar
      .querySelector("div > button")
      ?.parentElement?.querySelector("div > span");
    if (targetContainer) {
      targetContainer.style.display = "flex";
      targetContainer.style.alignItems = "center";
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
