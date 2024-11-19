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

  const parts = dateString?.split(" ");
  const day = String(parts[1]).padStart(2, "0").slice(0, -1); // Remove comma and ensure two digits
  const month = months[parts[0]];
  const year = parts[2];

  return `${day}-${month}-${year}`;
}

function addToCurateitCapterra(
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
      platform: "Capterra",
      post_type: "SaveToCurateit",
      type: "Capterra",
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

function addButton() {
  let bars = document.querySelectorAll('section div[data-entity="review"]');
  for (let bar of bars) {
    if (bar.querySelector(".Capterra-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "Capterra-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", async function (e) {
      let titleElement = bar.querySelector("h3");
      let pStr         = ""
      Array.from(bar?.querySelectorAll("p")).forEach((el) => pStr += el.textContent )
      // let descElem =
      //   titleElement?.parentNode?.querySelector(
      //     ".fw-bold.mb-2"
      //   )?.nextElementSibling;
      let desc = pStr;
      let link = window.location.href;
      let userImg = bar.querySelector("img.profile-picture");
      let imgUrl = userImg?.src;
      let productImg = document.querySelector("a img.product-header__logo");
      let author = bar?.querySelector(".h5")?.innerText.trim() || "";
      let title = `${author} on Capterra : ${titleElement?.textContent.trim()}`;
      let product = productImg?.getAttribute("alt") || "";
      let ratingsElement = bar
        ?.querySelector(".stars-wrapper")
        ?.nextElementSibling?.textContent.trim();
      let rating = parseFloat(ratingsElement || "0") / 1;
      let date = bar
        .querySelector('div[data-testid="review-written-on"]')
        ?.textContent.trim();
      let dateAdded = undefined;
      // let dateAdded = convertDateString(date);
      // Call your function
      addToCurateitCapterra(
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
    let targetContainer = bar.querySelector("h3")?.nextElementSibling;
    if (targetContainer) {
      targetContainer?.appendChild(div);
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
