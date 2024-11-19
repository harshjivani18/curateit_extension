

let url;
let title;
let desc;
let actorName;
let link;
let imgUrl;

function convertDateFormat(dateStr) {
  const months = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  const match = /(\w+)\s(\d{2}),\s(\d{4})/.exec(dateStr);

  if (!match) {
    throw new Error("Invalid date format");
  }

  const month = months[match[1]];
  const day = match[2];
  const year = match[3];

  return `${day}-${month}-${year}`;
}

function convertString(str) {
  return str?.toLowerCase().split(" ").join("-");
}

function addToCurateitG2(
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
  // const icon    = document.querySelector('link[rel="icon"]')?.href || ""
  const message = {
    post: {
      title: title,
      description: desc,
      media_type: "Testimonial",
      platform: "G2",
      post_type: "SaveToCurateit",
      type: "G2",
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
        icon: elem?.href ? { type: "image", icon: elem?.href } : null,
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
  let bars = document.querySelectorAll(".paper.paper--white.paper--box");
  for (let bar of bars) {
    if (bar.querySelector(".G2-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "G2-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", async function (e) {
      let titleElement = bar.querySelector('a > div[itemprop="name"]');
      let desc = bar.querySelector("div[itemprop='reviewBody']")?.textContent;
      let link = titleElement?.closest("a").href;
      let imgUrl = bar.querySelector(".avatar img")?.src;
      let author =
        bar.querySelector('span[itemprop="author"]')?.textContent || "";
      let title = `${author} on G2 : ${titleElement?.textContent}`;
      let product =
        document.querySelector(".product-head__title a")?.textContent || "";
      let ratingsElement = bar.querySelector(".stars");
      let classes = ratingsElement.className.split(" ");
      let starClass = classes.find((cls) => cls.startsWith("stars-"));
      let numberString = starClass.replace("stars-", "");
      let rating = parseFloat(numberString) / 2;
      let dateAdded = bar.querySelector("span time")?.textContent || "";
      dateAdded = convertDateFormat(dateAdded);
      // Call your function
      addToCurateitG2(
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

    let targetContainer = bar.querySelector("div.text-small.full-width");
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
