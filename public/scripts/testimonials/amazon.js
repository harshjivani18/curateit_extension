

let url;
let title;
let desc;
let actorName;
let link;
let imgUrl;
let authenticateUser;
function convertDateFormat(dateStr) {
  const monthMap = {
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

  if (window.location.href.includes("https://www.amazon.com/")) {
    const parts = dateStr.replace(",", "").split(" ");
    const month = monthMap[parts[0]];
    const day = parts[1].padStart(2, "0");
    const year = parts[2];

    return `${day}-${month}-${year}`;
  } else {
    const parts = dateStr.split(" ");
    const day = parts[0].padStart(2, "0");
    const month = monthMap[parts[1]];
    const year = parts[2];

    return `${day}-${month}-${year}`;
  }
}

function convertString(str) {
  return str?.toLowerCase().split(" ").join("-");
}

function addToCurateitAmazon(
  title,
  desc,
  link,
  imgUrl,
  author,
  product,
  rating,
  dateAdded,
  profileImg,
  coverImg
) {
  const importData = chrome?.storage?.sync.get(["importData"]);
  const elem =
    document.querySelector("link[rel='icon']") ||
    document.querySelector("link[rel='shortcut icon']");
  const testimonialIcon = elem ? elem.href : null;
  const images1 = Array.from(document?.images)?.map((img) => { return img.src }) || []
  
  // const icon    = document.querySelector('link[rel="icon"]')?.href || ""
  const message = {
    post: {
      title: title,
      description: desc,
      media_type: "Testimonial",
      platform: "Amazon",
      post_type: "SaveToCurateit",
      type: "Amazon",
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
        docImages: [ imgUrl, ...images1 ],
        defaultThumbnail: imgUrl,
        defaultIcon: elem?.href || null,
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
        profileImg: profileImg,
        coverImg: coverImg
      },
    },
  };
  chrome.storage.local.set({
    socialObject: message,
  });
  window.panelToggle(`?save-testimonial`, true);
  
}

function addButton() {
  let bars = document.querySelectorAll('div[data-hook="review"]');
  for (let bar of bars) {
    if (bar.querySelector(".Amazon-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "Amazon-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", async function (e) {
      let titleElement = bar.querySelectorAll(
        "a[data-hook='review-title'] span"
      )[2];
      let desc = bar
        .querySelector("span[data-hook='review-body']")
        ?.textContent.trim();
      let link = window.location.href;
      let profileImgURL = bar?.querySelector(".a-profile-avatar img")?.src;
      let imgUrl = document.querySelector("div.imgTagWrapper img")?.src;
      let author = bar.querySelector(".a-profile-name")?.textContent || "";
      let title = `${author} on Amazon : ${titleElement?.textContent.trim()}`;
      let product =
        document.querySelector("h1 span#productTitle")?.textContent.trim() ||
        "";
      let ratingsElement = bar.querySelector(
        'i[data-hook="review-star-rating"]'
      );
      let classes = ratingsElement?.className?.split(" ");
      let starClass = classes?.find((cls) => cls?.startsWith("a-star-"));
      let numberString = starClass?.replace("a-star-", "");
      let rating = parseFloat(numberString) / 1;
      let dateElement = bar
        .querySelector('span[data-hook="review-date"]')
        ?.textContent.trim();
      let dateAdded = dateElement?.replace(/Reviewed .* on /, "");
      dateAdded = convertDateFormat(dateAdded);
      let coverElem = Array.from(bar?.querySelectorAll(".review-image-tile-section img"))?.[0]?.src
      addToCurateitAmazon(
        title,
        desc,
        link,
        imgUrl,
        author,
        product,
        rating,
        dateAdded, 
        profileImgURL,
        coverElem
      );
    });

    div.appendChild(img);

    let targetContainer =
      bar.querySelector("div[data-hook='review-comments']") ||
      bar.querySelector("span.cr-footer-line-height");
    targetContainer.style.display = "flex";
    if (targetContainer) {
      targetContainer.appendChild(div);
    } else {
      console.warn("Target container not found inside the bar!");
    }
  }
}

// Function to create and show the loader overlay
function showLoader() {
  const loaderOverlay = document.createElement("div");
  loaderOverlay.style.position = "fixed";
  loaderOverlay.style.top = "0";
  loaderOverlay.style.left = "0";
  loaderOverlay.style.width = "100%";
  loaderOverlay.style.height = "100%";
  loaderOverlay.style.backgroundColor = "rgba(0, 123, 255, 0.5)"; // Translucent blue
  loaderOverlay.style.display = "flex";
  loaderOverlay.style.justifyContent = "center";
  loaderOverlay.style.alignItems = "center";
  loaderOverlay.style.zIndex = "9999";
  loaderOverlay.id = "loaderOverlay";

  const loadingText = document.createElement("div");
  loadingText.innerText = "Adding Products to Wishlist...";
  loadingText.style.color = "white";
  loadingText.style.fontSize = "2em";

  loaderOverlay.appendChild(loadingText);
  document.body.appendChild(loaderOverlay);
}

// Function to hide the loader overlay
function hideLoader() {
  const loaderOverlay = document.getElementById("loaderOverlay");
  if (loaderOverlay) {
    loaderOverlay.style.display = "none";
  }
}

// Function to scroll to the bottom of the page
function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}

// Function to wait for a specified amount of time
function waitFor(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function sendData(payload) {
  const text = await chrome?.storage?.sync.get(["userData"]);
  const apiUrl = text?.userData?.apiUrl;
  const url = `${apiUrl}/api/gems?populate=tags`;
  const sessionToken = text?.userData?.token;
  const authToken = sessionToken; // Replace with your actual token
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending data:", error);
    throw error; // Rethrow to be caught by Promise.all
  }
}

async function createCollection(name) {
  const text = await chrome?.storage?.sync.get(["userData"]);
  const sessionToken = text?.userData?.token;
  const authToken = sessionToken; // Replace with your actual token
  let userId = text?.userData?.userId;
  const apiUrl = text?.userData?.apiUrl
  const payload = {
    data: {
      name: name,
      author: userId,
    },
  };

  const checkUrl = `${apiUrl}/api/exist-collection?name=${name}`;
  const url = `${apiUrl}/api/collections`;
  try {
    const checkResponse = await fetch(checkUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!checkResponse.ok) {
      throw new Error(`HTTP error! status: ${checkResponse.status}`);
    }

    const checkData = await checkResponse.json();

    // If the collection exists and has an author id, return the data
    if (checkData?.data?.id) {
      return checkData;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending data:", error);
    throw error; // Rethrow to be caught by Promise.all
  }
}

async function fetchAndLogListItems() {
  const itemsList = document.getElementById("g-items");
  if (!itemsList) {
    
    hideLoader();
    return;
  }

  let userId;
  let collectionId;
  const text = await chrome?.storage?.sync.get(["userData"]);
  userId = text?.userData?.userId;
  collectionId = text?.userData?.unfilteredCollectionId;
  userId = parseInt(userId, 10);
  collectionId = parseInt(collectionId, 10);

  const listItems = itemsList.querySelectorAll("li[data-id]");
  const promises = [];
  const collectionName = document
    .querySelector("span#profile-list-name")
    ?.textContent.trim();
  const newCollection = await createCollection(collectionName);
  const collId = newCollection.data.id;
  
  listItems.forEach((item) => {
    const h2Element = item.querySelector("h2") || item.querySelector("h3");
    const anchorElem = h2Element.querySelector("a");
    const imageElem = item.querySelector("a > img");
    const descriptionElement = h2Element ? h2Element.nextElementSibling : null;
    const priceElem = item.querySelector(".a-price-whole");
    const priceSymbol = item.querySelector(".a-price-symbol")?.textContent || "$";
    const fractions = item.querySelector(".a-price-fraction")?.textContent || "";

    if (!h2Element || !descriptionElement) {
      
      return;
    }

    const title = h2Element?.textContent.trim();
    const link = `${window.location.origin}${anchorElem?.getAttribute(
      "href"
    )}`;
    const imageUrl = imageElem?.src;
    const description = descriptionElement?.textContent.trim();
    let price = priceElem?.textContent.trim() || "0";
    price = parseInt(price.replace(/,/g, ""), 10);
    const images2 = Array.from(document?.images)?.map((img) => { return img.src }) || []
    
    const icon    = document.querySelector('link[rel="icon"]')?.href || ""
    const payload = {
      data: {
        title: title,
        description: description,
        expander: [],
        media_type: "Product",
        author: userId,
        url: link,
        media: {
          covers: [imageUrl],
          price:  `${priceSymbol} ${price}.${fractions}`,
        },
        metaData: {
          type: "Product",
          title: title,
          docImages: [ imageUrl, ...images2 ],
          defaultThumbnail: imageUrl,
          icon: {
            type: "image",
            icon: "https://www.amazon.in/favicon.ico",
          },
          defaultIcon: "https://www.amazon.in/favicon.ico",
          url: link,
          covers: [imageUrl],
        },
        collection_gems: collId,
        remarks: "",
        tags: [],
        is_favourite: false,
        showThumbnail: true,
      },
    };

    

    // Add the sendData promise to the array
    promises.push(sendData(payload));
  });

  try {
    // Wait for all requests to complete
    await Promise.all(promises);
    alert('Wishlist submited successfully');
    window.panelToggle(`?refresh-gems`, true);
  } catch (error) {
    console.error("One or more requests failed", error);
    alert('Something went wrong! Please try again.');
  }

  
  hideLoader();
}

// Modified handleInfiniteScroll to call fetchAndLogListItems at the end
async function handleInfiniteScroll() {
  let previousHeight = 0;
  let currentHeight = document.body.scrollHeight;

  while (previousHeight !== currentHeight) {
    scrollToBottom();
    await waitFor(2000); // Wait for 2 seconds for new items to load
    previousHeight = currentHeight;
    currentHeight = document.body.scrollHeight;
  }

  console.log("No more items to load");
  fetchAndLogListItems(); // Fetch and log list items after all items are loaded
}

const checkIsUserLoggedIn = async () => {
  const text = await chrome?.storage?.sync.get(["userData"]);
  
  if (text && text?.userData && text?.userData?.apiUrl) {
    return {
      url: text.userData.apiUrl,
      token: text.userData.token,
      id: text?.userData?.id,
      collectionId: text?.userData?.unfilteredCollectionId,
    };
  } else {
    window.panelToggle(`?open-extension`, true);
    return false;
  }
};

function addProfileListNameButton() {
  const profileListNameSpan = document.getElementById("profile-list-name");
  // console.log("profileListNameSpan", profileListNameSpan);
  if (profileListNameSpan) {
    const parentElement = profileListNameSpan.parentNode;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "Amazon-button";
    img.title = "Import Wishlist!";

    img.addEventListener("click", async () => {
      showLoader("Adding Products to Wishlist..."); // Show loader when image is clicked
      authenticateUser = await checkIsUserLoggedIn();
      if (authenticateUser?.token) {
        handleInfiniteScroll();
      }
    });

    div.appendChild(img);
    let targetContainer = parentElement.querySelector(".a-section");
    if (targetContainer) {
      targetContainer.style.display = "flex";
      targetContainer.style.alignItems = "center";
      targetContainer.appendChild(div);
    } else {
      const newElem = document.getElementById("add-all-to-cart-section")
      if (newElem) {
        newElem.style.display = "flex";
        newElem.style.alignItems = "center";
        newElem.appendChild(div);
      }
      console.warn("Target container not found inside the bar!");
    }
  } else {
    
  }
}

// Run the addButton function once the page is loaded
window.addEventListener("load", function () {
  // Run the function once at the start
  addButton();
  addProfileListNameButton();

  // Create a MutationObserver to watch for changes in the page for addButton
  let observer1 = new MutationObserver(addButton);
  observer1.observe(document.body, { childList: true, subtree: true });
});
