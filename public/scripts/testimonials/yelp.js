

let url;
let title;
let desc;
let actorName;
let link;
let imgUrl;

function convertString(str) {
  return str?.toLowerCase().split(" ").join("-");
}

function addToCurateitYelp(
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
  const elem            = document.querySelector("link[rel='icon']") || document.querySelector("link[rel='shortcut icon']");
  const testimonialIcon = elem ? elem.href : null;
  const images1 = Array.from(document?.images)?.map((img) => { return img.src }) || []
  const icon    = document.querySelector('link[rel="icon"]')?.href || ""
  const message = {
    post: {
      title: title,
      description: desc,
      media_type: "Testimonial",
      platform: "Yelp",
      post_type: "SaveToCurateit",
      type: "Yelp",
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
      },
    },
  };
  chrome.storage.local.set({
    socialObject: message,
  });
  window.panelToggle(`?save-testimonial`, true);
  
}

function convertDateFormat(dateString) {
  const months = {
    'Jan': '01',
    'Feb': '02',
    'Mar': '03',
    'Apr': '04',
    'May': '05',
    'Jun': '06',
    'Jul': '07',
    'Aug': '08',
    'Sep': '09',
    'Oct': '10',
    'Nov': '11',
    'Dec': '12'
};

const parts = dateString.split(' ');
if (parts.length < 3) {
    return 'Invalid date format';
}

const month = months[parts[0]];
const day = parts[1].replace(',', '').padStart(2, '0');
const year = parts[2];

if (!month) {
    return 'Invalid month name';
}

return `${day}-${month}-${year}`;

}

function extractFirstInteger(str) {
  const match = str.match(/\b\d+\b/); // Regex to match the first integer
  return match ? parseFloat(match[0]) : null;
}

function addButton() {
  let bars = document.querySelectorAll(
    "ul > li.css-1q2nwpv"
  );
  for (let bar of bars) {
    if (bar.querySelector(".Yelp-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "Yelp-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", async function (e) {
      e.preventDefault();
      let titleElement = bar.querySelector("span > a");
      let desc = bar.querySelector(
        "p"
      )?.textContent;
      let link = window.location.href
      let imgUrl = bar.querySelector("img")?.src;
      let author = bar.querySelector("span > a")?.textContent || "";
      let product = document.querySelector("h1")?.textContent || "";
      let title = `${titleElement?.textContent} about ${product} on Yelp`;
      let ratingText = bar.querySelector('span > div[role="img"]')?.getAttribute("aria-label");
      let rating = parseInt(ratingText.match(/\d+/)[0]);
      let date = bar.querySelector("span.css-chan6m")?.textContent.trim();
      let dateAdded = convertDateFormat(date)
      addToCurateitYelp(
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

    let targetContainer = bar.querySelector('div > span > button')?.parentElement
    if (targetContainer) {
      targetContainer.style.display = "flex";
      targetContainer.style.alignItems = "center";
      targetContainer.appendChild(div);
    } else {
      console.warn("Target container not found inside the bar!");
    }
  }
}

// adds btn to individual product page
function addButtonToSinglePage() {
  let bars = document.querySelectorAll(
    "ul.undefined.list__09f24__ynIEd > li.margin-b5__09f24__pTvws.border-color--default__09f24__NPAKY > .border-color--default__09f24__NPAKY"
  );
  for (let bar of bars) {
    if (bar.querySelector(".Yelp-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "Yelp-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", async function (e) {
      let titleElement = bar.querySelector("h2");
      let actorElement = bar.querySelector(".user-passport-info > span > a");
      let desc = bar.querySelector("p")?.textContent;
      let link = titleElement?.closest("a").href || window.location.href;
      let imgUrl = bar.querySelector("img")?.src;
      let author = actorElement?.textContent || "";
      let product = document.querySelector("h1")?.textContent || "";
      let title =
        titleElement?.textContent ||
        `${actorElement?.textContent} about ${product} on Yelp`;
      let dateAdded = bar.querySelector("span.css-chan6m") || "";
      let ratingsElement = dateAdded.parentElement.previousElementSibling
        .querySelector("span div")
        .getAttribute("aria-label");
      let rating = extractFirstInteger(ratingsElement);
      dateAdded = convertDateFormat(dateAdded?.textContent.trim());

      addToCurateitYelp(
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

    let targetContainer =
      bar.querySelector("span > button")?.parentElement?.parentElement;
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
  addButtonToSinglePage();

  // Create a MutationObserver to watch for changes in the page for addButton
  let observer1 = new MutationObserver(addButton);
  // Start observing
  observer1.observe(document.body, { childList: true, subtree: true });

  // Create a MutationObserver to watch for changes in the page for addButtonToSinglePage
  let observer2 = new MutationObserver(addButtonToSinglePage);
  // Start observing
  observer2.observe(document.body, { childList: true, subtree: true });
});
