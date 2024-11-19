let url;
let title;
let desc;
let actorName;
let link;
let imgUrl;

function convertDateString(input) {
  // Extract the date part from the string
  const dateMatch = input.match(/^([A-Za-z]+) (\d+), (\d{4})/);
  if (!dateMatch) return null;

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames.indexOf(dateMatch[1]) + 1;
  const day = dateMatch[2];
  const year = dateMatch[3];

  // Format the date in 'DD-MM-YYYY' format
  return `${day.padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;
}

function convertString(str) {
  return str?.toLowerCase().split(" ").join("-");
}

function addToCurateitAppSumo(
  title,
  desc,
  link,
  imgUrl,
  allReviewsObject,
  author,
  product,
  rating,
  dateAdded,
  newRatingImg
) {
  const importData = chrome?.storage?.sync.get(["importData"]);
  let currentRating = allReviewsObject?.aggregateRating?.ratingValue;
  let totalReviews = allReviewsObject?.aggregateRating?.reviewCount;
  let maxRating = 5;
  const elem =
    document.querySelector("link[rel='icon']") ||
    document.querySelector("link[rel='shortcut icon']");
  const testimonialIcon = elem ? elem.href : null;
  const images1 =
    Array.from(document?.images)?.map((img) => {
      return img.src;
    }) || [];
  const icon = document.querySelector('link[rel="icon"]')?.href || null;

  const message = {
    post: {
      title: title,
      description: desc,
      media_type: "Testimonial",
      platform: "AppSumo",
      post_type: "SaveToCurateit",
      type: "AppSumo",
      url: link,
      author: author,
      product: product,
      rating: newRatingImg,
      dateAdded: dateAdded,
      testimonialIcon,
      media: {
        covers: [imgUrl],
      },
      metaData: {
        covers: [imgUrl],
        docImages: [imgUrl, ...images1],
        defaultIcon: icon ? icon : null,
        defaultThumbnail: imgUrl,
        icon: icon ? { type: "image", icon } : null,
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
  console.log("message", message);
  chrome.storage.local.set({
    socialObject: message,
  });
  window.panelToggle(`?save-testimonial`, true);
}

function addButton() {
  let bars = document.querySelectorAll(
    'div[data-testid="review-card-wrapper"]'
  );
  // Select the script tag by its specific attributes
  var scriptTag = document.querySelectorAll(
    'script[type="application/ld+json"]'
  )[2];

  // Extract the inner text, which is the JSON content
  var jsonContent = scriptTag?.textContent || scriptTag?.innerText;

  // Parse the JSON string into a JavaScript object
  var jsonObject = JSON.parse(jsonContent);

  let allReviewsObject = jsonObject;

  for (let bar of bars) {
    if (bar.querySelector(".AppSumo-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "AppSumo-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", async function (e) {
      let user = bar.querySelector("a");
      const userName = bar?.querySelector("div[data-testid='discussion-user-info'] div div div a")?.textContent?.trim();
      const reviewInfo = bar.querySelector("div[data-testid='discussion-review-info']");
      let title = `${user.textContent?.trim()} about ${
        allReviewsObject?.name
      } on AppSumo`;

      let desc = bar
        .querySelector(
          "div[data-testid='discussion-review-info'] div[data-testid]"
        )
        ?.textContent.trim();
      let link = window.location.href;
      let imgUrl = bar.querySelector("img")?.src;
      let author = userName || user?.textContent.trim() || "";
      let product = allReviewsObject?.name || "";
      let rating = parseFloat(allReviewsObject?.aggregateRating?.ratingValue);
      let newRatingImg = rating;
      Array.from(
        bar.querySelector(".break-words")?.querySelectorAll("img") || []
      ).forEach((img) => {
        if (img.alt.includes("stars")) {
          const newRating = parseFloat(img.alt.split("stars")?.[0]?.trim());
          newRatingImg = newRating && !isNaN(newRating) ? newRating : rating;
        }
      });
      // console.log("Bar ===>", bar);
      // let dateAdded =
      //   bar
      //     .querySelector("div[data-testid='discussion-review-info'] span[textContent^='Posted: ']")
      //     ?.textContent.trim() || "";
      const spanElems = reviewInfo?.querySelectorAll("div span");
      let dateAdded = "";
      
      Array.from(spanElems).forEach((span) => {
        if (span.textContent?.trim()?.startsWith("Posted:")) {
          const pDate = span?.textContent?.trim() || "";
          const pArr  = pDate.split("Posted: ");
          dateAdded   = pArr?.[1] || "";
        }
      })
      dateAdded = convertDateString(dateAdded);
      // Call your function
      addToCurateitAppSumo(
        title,
        desc,
        link,
        imgUrl,
        allReviewsObject,
        author,
        product,
        rating,
        dateAdded,
        newRatingImg
      );
    });

    div.appendChild(img);

    let targetContainer = bar.lastChild?.querySelector("div");

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
