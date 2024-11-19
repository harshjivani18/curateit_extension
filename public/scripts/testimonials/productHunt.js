

let url;
let title;
let desc;
let actorName;
let link;
let imgUrl;

function convertDateFormat(str) {
  // Mapping month names to their numeric representation
  const monthNames = {
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

  // Extracting relevant parts from the string using regex
  const matches = str.match(/(\w+), (\w+) (\d+)(st|nd|rd|th) (\d+),/);

  if (!matches) {
    throw new Error("Invalid date format");
  }

  const day = String(matches[3]).padStart(2, "0");
  const month = monthNames[matches[2]];
  const year = matches[5];

  return `${day}-${month}-${year}`;
}

function convertString(str) {
  return str?.toLowerCase().split(" ").join("-");
}

function addToCurateitProductHunt(
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
  const elem = document.querySelector("link[rel='icon']") || document.querySelector("link[rel='shortcut icon']");
  const testimonialIcon = elem ? elem.href : null;
  const images1 = Array.from(document?.images)?.map((img) => { return img.src }) || []
  const icon    = document.querySelector('link[rel="icon"]')?.href || ""
  const message = {
    post: {
      title: title,
      description: desc,
      media_type: "Testimonial",
      platform: "ProductHunt",
      post_type: "SaveToCurateit",
      type: "ProductHunt",
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

function addButton() {
  if (window.location.href.includes("https://www.producthunt.com/categories/")) {
    let bars = document.querySelectorAll(".flex.direction-column.mb-mobile-10.mb-tablet-15.mb-desktop-15.mb-widescreen-15")
    for (let bar of bars) {
      if (bar.querySelector(".ProductHunt-button")) continue;
      let div = document.createElement("div");
      let img = document.createElement("img");
      img.src =
        "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
      img.style.width = "37px";
      img.style.height = "auto";
      img.style.margin = "0 5px";
      img.style.cursor = "pointer";
      img.className = "ProductHunt-button";
      img.title = "Add to Feed!";

      img.addEventListener("click", async function (e) {
        let actor = bar.querySelector("a div")
        let actorName = actor?.innerText.trim()
        let desc = bar.querySelector(".mb-6.color-lighter-grey.fontSize-mobile-14.fontSize-tablet-16.fontSize-desktop-16.fontSize-widescreen-16.fontWeight-400")?.innerText.trim()
        let link = "https://www.producthunt.com" + actor.closest("a").getAttribute("href");
        let imgUrl = bar.querySelector("a video")?.getAttribute("poster") ? bar.querySelector("a video").getAttribute("poster") : (bar.querySelector("a img")?.src ? bar.querySelector("a img").src : '');
        let author = actorName;
        let product = actorName;
        let title = `${author} on ProductHunt`;
        let rating = parseFloat(5 - bar.querySelectorAll('svg[data-test$="-not-filled"]')?.length)
        // Call your function
        addToCurateitProductHunt(
          title,
          desc,
          link,
          imgUrl,
          author,
          product,
          rating
        );
      });

      div.appendChild(img);

      let targetContainer = bar.querySelector("button");
      if (targetContainer) {
        targetContainer = targetContainer.parentElement
        targetContainer.prepend(div);
      } else {
        console.warn("Target container not found inside the bar!");
      }
    }
  } else if (window.location.href.includes("https://www.producthunt.com/products/") || window.location.href.includes("https://www.producthunt.com/posts/")) {
    let bars = document.querySelectorAll(".flex.direction-row.mt-3.align-center");
    for (let bar of bars) {
      bar = bar.parentElement.parentElement;
      if (bar.querySelector(".ProductHunt-button")) continue;
      let div = document.createElement("div");
      let img = document.createElement("img");
      img.src =
        "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
      img.style.width = "37px";
      img.style.height = "auto";
      img.style.margin = "0 5px";
      img.style.cursor = "pointer";
      img.className = "ProductHunt-button";
      img.title = "Add to Feed!";

      img.addEventListener("click", async function (e) {
        let actorName = "";
        if (
          window.location.href.includes("https://www.producthunt.com/products/")
        ) {
          actorName =
            bar
              .querySelector("a.color-darker-grey.fontSize-16.fontWeight-600")
              ?.textContent.trim() || "";
        } else if (
          window.location.href.includes("https://www.producthunt.com/posts/")
        ) {
          actorName = bar.parentElement
            .querySelector("a.color-darker-grey")
            ?.textContent.trim();
        }
        
        let desc =
          bar.querySelector(".flex.direction-row.mt-3.align-center")
            ?.previousElementSibling?.textContent ||
          bar.previousElementSibling?.textContent;
        if (
          window.location.href.includes("https://www.producthunt.com/posts/")
        ) {
          desc = bar.querySelector("div")?.innerText.trim()
        }
        let link = window.location.href;
        let imgUrl = bar.parentElement.querySelector("img")?.src;
        if (
          window.location.href.includes("https://www.producthunt.com/posts/")
        ) {
          imgUrl = bar.parentElement.parentElement.querySelector('img[loading="lazy"]')?.src;
        }
        let author = actorName;
        let product = document.querySelector("h1")?.textContent.trim() || "";
        let title = `${author} about ${product} on ProductHunt`;
        let ratingSvgs = bar.querySelectorAll("label svg");
        let notFilledCount = 0;

        ratingSvgs.forEach((svg) => {
          let dataTestValue = svg.getAttribute("data-test");
          if (dataTestValue && dataTestValue.includes("not-filled")) {
            notFilledCount++;
          }
        });
        let rating = parseFloat(5 - notFilledCount);
        let dateAdded =
          bar.querySelector("div time")?.getAttribute("title").trim() || "";
        dateAdded = convertDateFormat(dateAdded);
        // Call your function
        addToCurateitProductHunt(
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

      let targetContainer = bar.querySelector(
        ".flex.direction-row.mt-3.align-center"
      );
      if (targetContainer) {
        targetContainer.appendChild(div);
      } else {
        console.warn("Target container not found inside the bar!");
      }
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
