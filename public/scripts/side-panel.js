let isSetGPT = false;
const iframe = document.createElement("iframe");
const snackbar = document.createElement("div");
const logoBookmarkButtonWrapper = document.createElement("div");
const bookmarkButton = document.createElement("div");
const divWrapperCurateit = document.createElement("div");
const divCurateitLogo = document.createElement("div");
const dragHandle = document.createElement("div");
const moreButtonWrapper = document.createElement("div");
const ssButton = document.createElement("div");
const tabsButton = document.createElement("div");
const infoButton = document.createElement("div");
const stickyButton = document.createElement("div");
const turnOffButton = document.createElement("div");
const readerViewButton = document.createElement("div");

let hideTimer;
let isBlockedSite = false;
let comments = [];
let commentCounter = 1;
// Variables to store the current mouse coordinates
let mousePageX = 0;
let mousePageY = 0;
logoBookmarkButtonWrapper.id = "logoBookmarkButtonWrapper";
divWrapperCurateit.id = "divWrapperCurateit";

let mediumCustomUrlRegex = new RegExp("https://[^]+.medium.com/");
let sidePanelImportType = "";

let options = {
  deviceScaleFactor: 1,
  format: "png",
  fromSurface: true,
};

const savedY = window.localStorage.getItem("CT_SIDER_POSITION_Y");

const allEmojiObj = {
  People: [
    {
      emoji: "😀",
      title: "Grinning Face",
    },
    {
      emoji: "😃",
      title: "Grinning Face with Big Eyes",
    },
    {
      emoji: "😄",
      title: "Grinning Face with Smiling Eyes",
    },
  ],
  Nature: [
    {
      emoji: "🙈",
      title: "See-No-Evil Monkey",
    },
    {
      emoji: "🙉",
      title: "Hear-No-Evil Monkey",
    },
    {
      emoji: "🙊",
      title: "Speak-No-Evil Monkey",
    },
  ],
  "Food-dring": [
    {
      emoji: "🍇",
      title: "Grapes",
    },
    {
      emoji: "🍈",
      title: "Melon",
    },
    {
      emoji: "🍉",
      title: "Watermelon",
    },
    {
      emoji: "🍊",
      title: "Tangerine",
    },
  ],
};

if (savedY !== null) {
  logoBookmarkButtonWrapper.style.top = savedY + "px";
} else {
  const windowHeight = window.innerHeight;
  const initialTop = windowHeight * 0.15;
  logoBookmarkButtonWrapper.style.top = initialTop + "px";
}

let isDragging = false;
let offsetY;
let profileBtnFound = false;
// Function to create and show the loader overlay
function showLoader(msg) {
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
  loadingText.innerText = msg || "Importing Communities...";
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

function renderLoader(msg) {
  showLoader(msg);
  setTimeout(hideLoader, 2000);
}

// dragHandle?.addEventListener("mousedown", function (e) {
//   e.preventDefault();
//   e.stopPropagation();
//   isDragging = true;
//   offsetY = e.clientY - logoBookmarkButtonWrapper.getBoundingClientRect().top;
// });

// window?.addEventListener("mouseup", function () {
//   isDragging = false;
// });

// window?.addEventListener("mousemove", function (e) {
//   mousePageX = e.pageX;
//   mousePageY = e.pageY;
//   if (!isDragging) return;
//   let y = e.clientY - offsetY;
//   logoBookmarkButtonWrapper.style.top = y + "px";
//   window.localStorage.setItem("CT_SIDER_POSITION_Y", y);
// });

const getMouseCoordinates = () => {
  const res = {
    type: "CREATE_COMMENT",
    coords: {
      x: mousePageX,
      y: mousePageY,
      commentText: "Write Your Comment Here",
    },
  };
  return res;
};

const createHighlight = async () => {
  const now = new Date();
  // Format the date and time in a 'YYYY-MM-DD_HH-MM-SS' format
  const _id =
    "file_" +
    now.getFullYear() +
    "-" +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    now.getDate().toString().padStart(2, "0") +
    "_" +
    now.getHours().toString().padStart(2, "0") +
    "-" +
    now.getMinutes().toString().padStart(2, "0") +
    "-" +
    now.getSeconds().toString().padStart(2, "0");
  const result = await sendCommentPayload("Comment Added", _id);
  return result;
};

const createFloatingCommentV2 = async (createOnDefaultPosition = false) => {
  const res = await createHighlight();
  let msg;
  if (createOnDefaultPosition) {
    msg = {
      type: "CREATE_COMMENT",
      coords: {
        x: 450,
        y: 110,
        commentText: "Write Your Comment Here",
      },
    };
  } else {
    msg = getMouseCoordinates();
  }

  const x = msg?.coords?.x;
  const y = msg?.coords?.y;
  if (x && y) {
    createCommentOnScreenV2(x, y, "comment-", res, false, null);
  }
};

// document?.addEventListener("keydown", function (event) {
//   // Check for Alt+C and either Ctrl or Meta (Cmd on Mac)
//   if (event.altKey && event.key.toLowerCase() === "c") {
//     event.preventDefault();
//     createFloatingCommentV2(false);
//   }
// });

async function postHighlight(payload) {
  const userData = await chrome?.storage?.sync.get(["userData"]);
  const sessionToken = userData?.userData?.token;
  const apiUrl = userData?.userData?.apiUrl;
  const unfilteredCollectionId = userData?.userData?.unfilteredCollectionId;

  const url = `${apiUrl}/api/collections/${unfilteredCollectionId}/highlights`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error during the API call:", error);
  }
}

const sendCommentPayload = async (comment, _id) => {
  const covers = [];
  for (let i = 0; i < document.images.length; i++) {
    const img = document.images[i];
    covers.push(img.src);
  }
  const icon = document.querySelector('link[rel="icon"]')?.href || "";
  const data = await chrome?.storage?.sync.get(["userData"]);
  const heading =
    document.querySelector("h1")?.textContent || document?.title || "Heading";
  const description =
    document.querySelector('meta[name="description"]')?.content || "";
  let payload = {
    notes: "",
    color: {
      id: 4,
      border: "border-l-yellow-200",
      bg: "#FFFAB3",
      text: "text-yellow-200",
      colorCode: "#FFFAB3",
      className: "yellow-hl",
    },
    text: `<p>${comment}</p>`,
    title: document?.title?.trim() || "Title",
    heading: heading.trim(),
    description: description.trim(),
    expander: [],
    link: window.location.href,
    collections: data?.userData?.unfilteredCollectionId,
    tags: [],
    type: "Highlight",
    box: null,
    _id: _id,
    details: null,
    styleClassName: "",
    is_favourite: false,
    metaData: {
      covers: covers,
      icon: {
        type: "image",
        icon: icon,
      },
      docImages:
        Array.from(document?.images)?.map((img) => {
          return img.src;
        }) || [],
      defaultThumbnail: document.querySelector('meta[property="og:image"]')
        ?.content,
      defaultIcon: icon,
    },
    showThumbnail: true,
  };
  const res = await postHighlight(payload);
  return res;
};

function modifySiteSpecificData(currentCommentObj) {
  const commentUrl = window.location.href;
  const commentSectionKey = encodeURIComponent(commentUrl);

  // Retrieve existing comments from local storage
  const allCommentsJSON = localStorage.getItem("allComments");
  let allComments = allCommentsJSON ? JSON.parse(allCommentsJSON) : {};

  // Check if there are comments for the current section
  if (allComments[commentSectionKey]) {
    // Find the index of the comment with the same gemId
    let existingCommentIndex = allComments[commentSectionKey].allData.findIndex(
      (comment) => comment.gemId === currentCommentObj.gemId
    );

    // If the comment exists, update it
    if (existingCommentIndex !== -1) {
      allComments[commentSectionKey].allData[existingCommentIndex] =
        currentCommentObj;
    } else {
      // If the comment does not exist, log an error or handle as necessary
      console.error("Comment with gemId not found.");
      return;
    }

    // Save the updated comments back to local storage
    localStorage.setItem("allComments", JSON.stringify(allComments));
  } else {
    // If no comments for the current section, log an error or handle as necessary
    console.error("No comments section found for this URL.");
  }
}

function saveSiteSpecificData(key, currentCommentObj) {
  const commentUrl = window.location.href;
  const commentSectionKey = encodeURIComponent(commentUrl);

  const allCommentsJSON = localStorage.getItem(key);
  let allComments = allCommentsJSON ? JSON.parse(allCommentsJSON) : {};

  if (!allComments[commentSectionKey]) {
    allComments[commentSectionKey] = {
      url: commentUrl,
      allData: [],
    };
  }

  let existingCommentIndex = allComments[commentSectionKey].allData.findIndex(
    (comment) => comment.gemId === currentCommentObj.gemId
  );

  if (existingCommentIndex !== -1) {
    allComments[commentSectionKey].allData[existingCommentIndex] =
      currentCommentObj;
  } else {
    allComments[commentSectionKey].allData.push(currentCommentObj);
  }

  localStorage.setItem(key, JSON.stringify(allComments));
}

function getSiteSpecificData(key) {
  const currentUrl = window.location.href;
  const allCommentsJSON = localStorage.getItem(key);
  if (allCommentsJSON) {
    const allComments = JSON.parse(allCommentsJSON);
    const encodedUrl = encodeURIComponent(currentUrl);
    const currentPageComments = allComments[encodedUrl];
    if (currentPageComments && currentPageComments.allData) {
      return currentPageComments.allData;
    }
  }
  return null;
}

async function getBrowserData() {
  // Return a new Promise that encapsulates the asynchronous operation
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { request: "search-history", query: "", results: 10 },
      (response) => {
        if (chrome.runtime.lastError) {
          // If there's an error within the chrome API, reject the Promise
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          const pageInfo = {
            url: window.location.href,
            title: document.title,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            browser: navigator.userAgent,
            allHistory: response?.history,
          };
          // Otherwise, resolve the Promise with the necessary data
          resolve(pageInfo);
        }
      }
    );
  });
}

function prefillComments() {
  const allCommentsArr = getSiteSpecificData("allComments");
  allCommentsArr?.forEach((comment) => {
    createCommentOnScreenV2(
      comment?.coords?.x,
      comment?.coords?.y,
      comment?.commentClass,
      { parent_gem_id: { id: comment?.gemId } },
      true,
      comment
    );
  });
}

function captureConsole() {
  return () => {
    return {};
  };
  // Object to hold captured messages
  let capturedMessages = {
    log: [],
    error: [],
    warn: [],
  };

  // Save the original console functions
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
  };

  try {
    // Capture and store the console outputs
    Object.keys(originalConsole).forEach((type) => {
      console[type] = (...args) => {
        // Store the captured message
        capturedMessages[type].push(
          args
            .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
            .join(" ")
        );

        // Call the original console function (optional)
        originalConsole[type].apply(console, args);
      };
    });

    // Function to restore the original console functions and return the captured messages
    function restoreAndRetrieveConsole() {
      // Restore the original console functions
      Object.keys(originalConsole).forEach((type) => {
        console[type] = originalConsole[type];
      });

      // Return the captured messages
      return capturedMessages;
    }

    // Return the restoreAndRetrieveConsole function
    // This allows the user to restore the console and retrieve the messages at the same time
    return restoreAndRetrieveConsole;
  } catch (error) {
    return () => {
      return {};
    };
  }
}

const retrieveConsole = captureConsole();

function getImdbData() {
  let imdbDetails;
  const parsedUrl = new URL(window.location.href);
  if (parsedUrl.hostname === "www.imdb.com") {
    if (parsedUrl.pathname.startsWith("/title")) {
      let rating,
        reviewsNum,
        director,
        genres,
        releasedYear,
        date,
        length,
        ageRating;
      if (parsedUrl.pathname.includes("/reference")) {
        rating =
          document.querySelector(".ipl-rating-widget .ipl-rating-star__rating")
            ?.textContent || "0";
        const reviewsText =
          document.querySelector("ul.titlereference-overview-review-list a")
            ?.textContent || "0";
        reviewsNum = parseInt(reviewsText?.replace(/[^0-9]/g, "")) || 0;
        director = document.querySelector(
          ".titlereference-overview-section a"
        )?.textContent;
        const movieDetails = document.querySelectorAll(
          ".titlereference-header ul.ipl-inline-list  li.ipl-inline-list__item"
        );
        const genreElements = Array.from(
          movieDetails[1]?.querySelectorAll("a")
        );
        genres = genreElements?.map((element) => element.textContent.trim());
        releasedYear = document.querySelector(
          "h3[itemprop='name'] a"
        )?.textContent;
        date = movieDetails[2]?.querySelector("a")?.textContent?.trim();
        length = movieDetails[0]?.textContent?.trim();
      } else {
        rating =
          document.querySelector(
            'div[data-testid="hero-rating-bar__aggregate-rating__score"] span'
          )?.textContent || "0";
        reviewsNum = document
          .querySelector(
            'div[data-testid="hero-rating-bar__aggregate-rating__score"]'
          )
          ?.parentNode?.lastChild?.textContent.trim();
        director = document.querySelectorAll(
          'p[data-testid="plot"] ~ div ul li'
        )[1].textContent;
        const genreElements = Array.from(
          document.querySelectorAll('div[data-testid="genres"] a')
        );
        genres = genreElements?.map((element) => element.textContent.trim());
        const movieDetails = document.querySelectorAll(
          'h1[data-testid="hero__pageTitle"] ~ ul li'
        );
        const detailsCount = movieDetails.length;
        // Ensure there are enough details available
        if (detailsCount >= 3) {
          releasedYear = movieDetails[detailsCount - 3].textContent;
          ageRating = movieDetails[detailsCount - 2].textContent;
          length = movieDetails[detailsCount - 1].textContent.trim();
        } else {
          console.error("Not enough movie details available");
        }

        date = releasedYear;
      }
      imdbDetails = {
        rating,
        reviewsNum,
        director,
        genres,
        releasedYear,
        date,
        length,
        ageRating,
      };
    } else if (parsedUrl.pathname.startsWith("/name")) {
      const dob = document
        .querySelector('div[data-testid="birth-and-death-birthdate"]')
        ?.lastChild.textContent.trim();
      const actorProfessionElements = Array.from(
        document.querySelectorAll(
          'h1[data-testid="hero__pageTitle"] ~ ul > li[role="presentation"]'
        )
      );
      const professions = actorProfessionElements.map((element) =>
        element.textContent.trim()
      );
      const knownForElements = Array.from(
        document.querySelectorAll(
          'div[data-testid="Filmography"] div[data-testid="shoveler-items-container"] a.ipc-primary-image-list-card__title'
        )
      );
      const knownFor = knownForElements.map((element) =>
        element.textContent.trim()
      );
      imdbDetails = {
        dob,
        professions,
        knownFor,
      };
    }
  }
  if (imdbDetails) {
    chrome.storage.sync.set({ CT_IMDB_DETAILS: imdbDetails });
  }
}

window?.addEventListener("load", function () {
  getImdbData();
  prefillComments();
});

// Function to format the date in dd/mm/yyyy format
function formatDate(date) {
  let day = date.getDate().toString().padStart(2, "0");
  let month = (date.getMonth() + 1).toString().padStart(2, "0"); // getMonth() is zero-based
  let year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function timeAgoText(dateString) {
  // Parse the input date string
  const [day, month, year] = dateString?.split("/");
  const inputDate = new Date(year, month - 1, day);

  // Calculate the difference in days
  const today = new Date();
  const diffTime = today - inputDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Return the appropriate string
  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else {
    return `${diffDays} Days Ago`;
  }
}

function createUniqueFileName() {
  const now = new Date();
  // Format the date and time in a 'YYYY-MM-DD_HH-MM-SS' format
  const fileName =
    "file_" +
    now.getFullYear() +
    "-" +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    now.getDate().toString().padStart(2, "0") +
    "_" +
    now.getHours().toString().padStart(2, "0") +
    "-" +
    now.getMinutes().toString().padStart(2, "0") +
    "-" +
    now.getSeconds().toString().padStart(2, "0");
  return fileName;
}

async function postComment(
  floatingCommentObject,
  currentText,
  authorId,
  userName
) {
  saveSiteSpecificData("allComments", floatingCommentObject);
  const userData = await chrome?.storage?.sync.get(["userData"]);
  const sessionToken = userData?.userData?.token;
  const payload = {
    comment: `<p>${currentText}</p>`,
    comment_by: {
      id: authorId,
      username: userName,
    },
    comment_to: {
      id: floatingCommentObject?.mainComment.authorId || authorId,
      username: floatingCommentObject.mainComment.author || userName,
    },
    page_type: "gem",
    floatingCommentData: floatingCommentObject,
    page_id: floatingCommentObject.gemId,
  };
  const url = "https://curateit-dev-logs.curateit.com/api/comments";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
  } catch (error) {
    console.error("There was a problem with your fetch operation:", error);
  }
}

async function fetchUsers() {
  const userData = await chrome?.storage?.sync.get(["userData"]);
  const sessionToken = userData?.userData?.token;
  const apiUrl = userData?.userData?.apiUrl;
  const url = `${apiUrl}/api/public-users`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data; // Extract usernames and return
  } catch (error) {
    console.error("Could not fetch users:", error);
    return []; // Return an empty array in case of an error
  }
}

async function fetchHighlightGem(id) {
  const userData = await chrome?.storage?.sync.get(["userData"]);
  const sessionToken = userData?.userData?.token;
  const apiUrl = userData?.userData?.apiUrl;
  const url = `${apiUrl}/api/gems/${id}?populate=*`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data?.data?.attributes; // Extract usernames and return
  } catch (error) {
    console.error("Could not fetch gem:", error);
    return []; // Return an empty array in case of an error
  }
}

// Function to handle the gem update
async function updateHighlightGem(newPayload, gemId) {
  const userData = await chrome?.storage?.sync.get(["userData"]);
  const sessionToken = userData?.userData?.token;
  const apiUrl = userData?.userData?.apiUrl;
  try {
    const response = await fetch(`${apiUrl}/api/gems/${gemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify(newPayload),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.text();
    alert("Gem Updated");
    return data;
  } catch (error) {
    console.error("Gem Update error:", error);
    alert("Error Updating Gem");
    return null;
  }
}

async function fetchUserDetails() {
  const userData = await chrome?.storage?.sync.get(["userData"]);
  const sessionToken = userData?.userData?.token;
  const apiUrl = userData?.userData?.apiUrl;
  const url = `${apiUrl}/api/users/me?populate=tags`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data; // Extract usernames and return
  } catch (error) {
    console.error("Could not fetch users:", error);
    return {}; // Return an empty array in case of an error
  }
}

async function fetchUserCollections() {
  const userData = await chrome?.storage?.sync.get(["userData"]);
  const sessionToken = userData?.userData?.token;
  const apiUrl = userData?.userData?.apiUrl;
  const url = `${apiUrl}/api/collection-wise-counts`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data; // Extract usernames and return
  } catch (error) {
    console.error("Could not fetch users:", error);
    return {}; // Return an empty array in case of an error
  }
}

// Function to handle the file upload
async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const userData = await chrome?.storage?.sync.get(["userData"]);
  const sessionToken = userData?.userData?.token;
  const apiUrl = userData?.userData?.apiUrl;
  try {
    const response = await fetch(`${apiUrl}/api/upload-all-file`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.text();
    return data;
  } catch (error) {
    console.error("File upload error:", error);
    return null;
  }
}

function generateUniqueId() {
  const now = new Date();
  const timestamp = now.getTime().toString(36);
  const randomComponent = Math.random().toString(36).substring(2, 15);
  return timestamp + randomComponent;
}

async function createCommentOnScreenV2(
  x,
  y,
  baseClass,
  highlightRes,
  renderOnLoad,
  commentObj
) {
  if (highlightRes === null) {
    highlightRes = await createHighlight();
  }
  console.log("highlightRes : ", highlightRes);
  const gemId = highlightRes?.parent_gem_id?.id;
  let mentionedUsersArray = [];
  let mentionedTagsArray = [];
  let selectedTagsArray = [];
  let reactedEmoji = "";
  let mentionedCollArray = [];
  let selectedCollectionId = null;
  let allUserTags = [];
  let allUserColls = [];
  let attachedFiles = [];
  let currentStatus = commentObj?.currentStatus || "";
  let currentPriority = commentObj?.currentPriority || "";
  let currentFeedbackType = commentObj?.currentFeedbackType || "";
  let currentAssignee = commentObj?.currentAssignee || "";
  let screenRecordUrlData = commentObj?.screenRecordUrlData;
  let audioRecordUrlData = commentObj?.audioRecordUrlData;

  // Retrieve and restore console, capturing all messages
  const captured = retrieveConsole();
  let box =
    document.querySelector(`.${baseClass}.commentBoxCard`) ||
    document.createElement("div");
  let _id = renderOnLoad ? baseClass : `${baseClass}${gemId}`;

  if (renderOnLoad) {
    allUserTags = commentObj.mentionedUsers;
    attachedFiles = commentObj.filesAttached;
  }

  let floatingCommentObject = {
    url: window.location.href,
    gemId,
    mentionedUsers: allUserTags,
    commentClass: _id,
    coords: { x: x, y: y },
    currentStatus,
    currentPriority,
    currentFeedbackType,
    currentAssignee,
    screenRecordUrl: screenRecordUrlData,
    mainComment: commentObj?.mainComment || {},
    replies: commentObj?.replies || [],
    reactedEmoji,
  };

  box.className = _id;
  box.classList.add("commentBoxCard");
  box.style.cssText = `position: absolute; left: ${x}px; top: ${y}px; border-radius: 0.375rem;display: none;flex-direction: column;transition: all 0.5s ease 0s;z-index: 9;opacity: 1; width: 420px; z-index: 999;`;
  let previewCircle;

  let tmpPreviewCircle = document.querySelector(`#commentIcon-${_id}`);
  if (tmpPreviewCircle) {
    previewCircle = tmpPreviewCircle;
  } else {
    previewCircle = document.createElement("div");
    previewCircle.id = `commentIcon-${_id}`;
    previewCircle.style.cssText = `width: 50px; height: 50px; border-radius: 50%; border: 1px solid black; background-image: url('https://drz68kkeltaek.cloudfront.net/common/base64-converted-imgs/1710539807457.png'); background-size: cover; position: absolute; left: ${x}px; top: ${y}px; cursor: grab; z-index: 9;`;
    document.body.appendChild(previewCircle);
  }

  // Function to show the full comment
  const showComment = () => {
    box.style.display = "flex";
    previewCircle.style.display = "none";
  };

  // Function to hide the full comment
  const hideComment = () => {
    box.style.display = "none";
    previewCircle.style.display = "block";
  };

  previewCircle?.addEventListener("click", showComment);

  // Dragging functionality for both box and previewCircle
  let isDragging = false;
  let dragStartX, dragStartY;

  const startDrag = (e) => {
    isDragging = true;
    dragStartX = e.clientX - parseInt(box.style.left, 10);
    dragStartY = e.clientY - parseInt(box.style.top, 10);
    box.style.opacity = "0.5";
    previewCircle.style.opacity = "0.5";
  };

  const doDrag = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStartX;
      const newY = e.clientY - dragStartY;
      box.style.left = `${newX}px`;
      box.style.top = `${newY}px`;
      previewCircle.style.left = `${newX}px`;
      previewCircle.style.top = `${newY}px`;
    }
  };

  const stopDrag = () => {
    if (isDragging) {
      isDragging = false;
      box.style.opacity = "1";
      previewCircle.style.opacity = "1";
    }
  };

  previewCircle?.addEventListener("mousedown", startDrag);
  document?.addEventListener("mousemove", doDrag);
  document?.addEventListener("mouseup", stopDrag);

  document?.addEventListener("mousemove", function (e) {
    if (isDragging) {
      const newX = e.clientX - dragStartX;
      const newY = e.clientY - dragStartY;
      box.style.left = `${newX}px`;
      box.style.top = `${newY}px`;
    }
  });

  document?.addEventListener("mouseup", function (e) {
    if (isDragging) {
      isDragging = false;
      box.style.opacity = "1";
    }
  });

  box.innerHTML = `
  <div class="ct-frame-parent">
    <div class="ct-frame-group" style="display: flex;">
      <div style="width: 100%; display: flex; flex-direction: column; gap: 5px;">
          <div class="selectWrapperDiv" style="display: flex; flex-direction: row;gap: 10px;"> </div>
          <div id="comment-custom-select" class="ct-custom-select-container" style="display: none; border: none;position: absolute;background: white;z-index: 2;left: 100%;top: 0;padding: 10px;box-shadow: rgba(0, 0, 0, 0.1) 4px 10px 8px; width: auto;">
            <div class="ct-tags-container"></div>
            <div class="ct-custom-select-search" style="gap:5px;">
              <button class="ct-arrowright-wrapper addTagBtn" title="Add Them" style="border: 1px solid black;height: auto;background: white;border-radius: 50%;">
                <svg width="15" height="15" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.25 3C5.25 3.04973 5.23025 3.09742 5.19508 3.13258C5.15992 3.16775 5.11223 3.1875 5.0625 3.1875H3.1875V5.0625C3.1875 5.11223 3.16775 5.15992 3.13258 5.19508C3.09742 5.23025 3.04973 5.25 3 5.25C2.95027 5.25 2.90258 5.23025 2.86742 5.19508C2.83225 5.15992 2.8125 5.11223 2.8125 5.0625V3.1875H0.9375C0.887772 3.1875 0.840081 3.16775 0.804918 3.13258C0.769754 3.09742 0.75 3.04973 0.75 3C0.75 2.95027 0.769754 2.90258 0.804918 2.86742C0.840081 2.83225 0.887772 2.8125 0.9375 2.8125H2.8125V0.9375C2.8125 0.887772 2.83225 0.840081 2.86742 0.804918C2.90258 0.769754 2.95027 0.75 3 0.75C3.04973 0.75 3.09742 0.769754 3.13258 0.804918C3.16775 0.840081 3.1875 0.887772 3.1875 0.9375V2.8125H5.0625C5.11223 2.8125 5.15992 2.83225 5.19508 2.86742C5.23025 2.90258 5.25 2.95027 5.25 3Z" fill="#7C829C"/>
                </svg>              
              </button>
              <input type="text" placeholder="Type to Enter Tags..." style="background: white;color: black;">
            </div>
            <div class="ct-dropdown-container" style="display: none;"></div>
          </div>

          <div id="comment-custom-select" class="custom-collections-container" style="display: none; border: none;position: absolute;background: white;z-index: 2;left: 100%;top: 50%;padding: 10px;box-shadow: rgba(0, 0, 0, 0.1) 4px 10px 8px; width: auto;">
          <div class="ct-tags-container"></div>
          <div class="ct-custom-select-search" style="gap:5px;">
            <input type="text" placeholder="Type to Enter Collections..." style="background: white;color: black;">
          </div>
          <div class="ct-dropdown-container" style="display: none;"></div>
          </div>
      </div>
      <div style="display: flex; gap: 10px;">
      <svg class="ct-x-icon" style="cursor: pointer; scale: 1.2;" title="Browser Info" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 256 256" height="200px" width="40px" xmlns="http://www.w3.org/2000/svg"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"></path></svg>
        <img class="ct-x-icon" style="cursor: pointer;" title="Close" loading="lazy" src="https://d3jrelxj5ogq5g.cloudfront.net/icons/x_xawx75.svg">
      </div>
    </div>
    <div class="browserDataElement" style="display:none;font-family: Arial, sans-serif;border: 1px solid rgb(221, 221, 221);padding: 20px;border-radius: 8px;max-width:100%;width:100%;"></div>
    <video class="recordedVideo" src="" controls="" style="display: none; width: 100%;"></video>
    <div class="recordedAudioWrapper" id="recordedAudioWrapper" style="display: none; flex-direction: column; gap: 10px; margin: auto; align-items: center;width:100%;">
        <div id="audioIconContainer" style="display: inline-block; position: relative; width: fit-content;">
          <img id="playRecordButton" src="https://d3jrelxj5ogq5g.cloudfront.net/icons/microphone_cq1eyi.svg" style="display: block; cursor: pointer; margin: auto; padding: 10px; border: 1px solid rgb(83, 86, 255); border-radius: 50%;">
          <img id="stopRecordButton" src="https://d3jrelxj5ogq5g.cloudfront.net/icons/stop-svgrepo-com_gyvesv.svg" style="display: none; cursor: pointer; margin: auto; padding: 10px; border: 1px solid rgb(83, 86, 255); border-radius: 50%;max-width: 42px;">
          <span class="ct-ripple" style="height: 43px; width: 43px; top: 0; left: 0; scale: 0.7; animation: auto ease 0s 1 normal none running none;"></span>
        </div>
    </div>
    <section class="ct-frame-container">
        <div class="ct-frame-div"> </div>
    </section>
    <div class="ct-frame-parent4">
        <div class="ct-at-parent" style="padding: 0;width: 100%;">
          <div title="Screen Record"><img loading="lazy" src="https://d3jrelxj5ogq5g.cloudfront.net/icons/videocamera_kqkv9n.svg" style="height: 20px; width: 20px; position: relative; min-height: 16px; padding: 2px; cursor: pointer;"></div>
          <div title="Record Audio"><img loading="lazy" src="https://d3jrelxj5ogq5g.cloudfront.net/icons/microphone_cq1eyi.svg" style="height: 20px;width: 20px;position: relative;min-height: 16px;padding: 2px;cursor: pointer;"></div>
          <div title="Attach File"><img loading="lazy" src="https://d3jrelxj5ogq5g.cloudfront.net/icons/paperclip_en40r4.svg" style="height: 20px; width: 20px; position: relative; min-height: 16px; padding: 2px; cursor: pointer;"></div>
          <div title="Screenshot"><img loading="lazy" src="https://d3jrelxj5ogq5g.cloudfront.net/icons/screenshot-svgrepo-com_hul3xl.svg" style="height: 20px; width: 20px; position: relative; min-height: 16px; padding: 2px; cursor: pointer;"></div>
          <div style="display: flex;gap: 16px;margin-left: 8.7rem;" class="optionsWrapper">
            <div title="Tags" style="cursor: pointer;">
              <svg width="16" height="16" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.4052 5.375L5.75 0.719847C5.68061 0.6499 5.59801 0.594444 5.507 0.556703C5.41598 0.518962 5.31838 0.499689 5.21985 0.500004H0.875004C0.775548 0.500004 0.680165 0.539513 0.609839 0.609839C0.539513 0.680165 0.500004 0.775548 0.500004 0.875004V5.21985C0.499689 5.31838 0.518962 5.41598 0.556703 5.507C0.594444 5.59801 0.6499 5.68061 0.719847 5.75L5.375 10.4052C5.44465 10.4748 5.52734 10.5301 5.61834 10.5678C5.70935 10.6055 5.80689 10.6249 5.90539 10.6249C6.0039 10.6249 6.10144 10.6055 6.19245 10.5678C6.28345 10.5301 6.36614 10.4748 6.43579 10.4052L10.4052 6.43579C10.4748 6.36614 10.5301 6.28345 10.5678 6.19245C10.6055 6.10144 10.6249 6.0039 10.6249 5.90539C10.6249 5.80689 10.6055 5.70935 10.5678 5.61834C10.5301 5.52734 10.4748 5.44465 10.4052 5.375ZM5.90516 9.875L1.25 5.21985V1.25H5.21985L9.875 5.90516L5.90516 9.875ZM3.5 2.9375C3.5 3.04876 3.46701 3.15751 3.40521 3.25001C3.3434 3.34251 3.25555 3.41461 3.15276 3.45719C3.04998 3.49976 2.93688 3.5109 2.82777 3.4892C2.71865 3.46749 2.61842 3.41392 2.53976 3.33525C2.46109 3.25658 2.40752 3.15636 2.38581 3.04724C2.36411 2.93813 2.37525 2.82503 2.41782 2.72224C2.4604 2.61946 2.53249 2.53161 2.625 2.4698C2.7175 2.40799 2.82625 2.375 2.9375 2.375C3.08669 2.375 3.22976 2.43427 3.33525 2.53976C3.44074 2.64525 3.5 2.78832 3.5 2.9375Z" fill="#343330"></path>
              </svg>
            </div>
            <div title="Collection" style="cursor: pointer;">
              <svg width="16" height="16" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.125 3.375H6.15516L4.875 2.09485C4.80561 2.0249 4.72301 1.96944 4.63199 1.9317C4.54098 1.89396 4.44337 1.87469 4.34484 1.875H1.875C1.67609 1.875 1.48532 1.95402 1.34467 2.09467C1.20402 2.23533 1.125 2.42609 1.125 2.625V9.40407C1.12525 9.59519 1.20128 9.77842 1.33643 9.91357C1.47158 10.0487 1.65481 10.1248 1.84594 10.125H10.1667C10.3545 10.1248 10.5345 10.0501 10.6673 9.91728C10.8 9.7845 10.8748 9.60449 10.875 9.41672V4.125C10.875 3.92609 10.796 3.73533 10.6553 3.59467C10.5147 3.45402 10.3239 3.375 10.125 3.375ZM1.875 2.625H4.34484L5.09484 3.375H1.875V2.625ZM10.125 9.375H1.875V4.125H10.125V9.375Z" fill="#4B4F5D"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="ct-reply-parent" style="display: block !important;">
          <div class="filePreview" style="width: 100%; display: flex; flex-wrap: wrap;gap:10px;"></div>
          <div style="display: flex; flex-direction: row;">
            <div class="emojiContainer" style="position: absolute; bottom: 0px; left: 50%; transform: translateX(-50%); display: none; flex-wrap: wrap; padding: 5px; background-color: white; border: 1px solid rgb(226, 226, 226); border-radius: 4px; max-height: 250px; overflow-y: auto; z-index: 99;">
            <input placeholder="Search emojis..." style="margin-bottom: 5px; padding: 4px 8px; width: calc(100% - 16px); background-color: rgb(226, 226, 226); border-radius: 10px; color: black;">
            </div>
            <textarea class="ct-reply" id="emojionearea1" placeholder="Comment or type @ to tag Curators" style="height: 100%; box-shadow: none; width: 100%; resize: none;"></textarea>
            <div id="userSuggestions" class="ct-dropdown" style="display: none; position: absolute; left: 0px; top: 100%; width: 100%; max-height: 200px; overflow-y: scroll; background: white; box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 8px; border-radius: 10px;"></div>
            <button class="ct-replyBtn ct-arrowright-wrapper"><img class="ct-arrowright-icon" src="https://d3jrelxj5ogq5g.cloudfront.net/icons/arrowright_sa8ron.svg"></button>
          </div>
        </div>
        <div class="fileUploadContainer" style="padding-top: 0.5rem; display: none; flex-direction: column; gap: 10px; align-items: center; width: 100%;">
          <div style="display: flex;align-items: center;gap: 5px;width: 100%;"><input class="fileInput" type="file" multiple="" style="color: black;">
            <button class="saveFileBtn ct-arrowright-wrapper"><img class="ct-arrowright-icon" src="https://d3jrelxj5ogq5g.cloudfront.net/icons/arrowright_sa8ron.svg"></button>
          </div>
        </div>
    </div>
</div>
  `;

  const xWrapperButton = box.querySelector("img[title='Close']");
  const browserInfoButton = box.querySelector("svg[title='Browser Info']");
  const recordScreenButton = box.querySelector("div[title='Screen Record']");
  const tagsButton = box.querySelector("div[title='Tags']");
  const collectionButton = box.querySelector("div[title='Collection']");
  const recordAudioButton = box.querySelector("div[title='Record Audio']");
  const fileUploadButton = box.querySelector("div[title='Attach File']");
  const pickEmojiButton = box.querySelector("div[title='Pick Emoji']");
  const screenshotButton = box.querySelector("div[title='Screenshot']");
  const replyBtn = box.querySelector(".ct-replyBtn");
  const replyInput = box.querySelector("textarea.ct-reply");
  const frameDiv = box.querySelector(".ct-frame-div");
  const audioIconContainer = box.querySelector("#audioIconContainer");
  const selectWrapperDiv = box.querySelector(".selectWrapperDiv");
  const fileInput = box.querySelector("input.fileInput");
  const optionsWrapper = box.querySelector("optionsWrapper");
  let userSuggestions = box.querySelector("#userSuggestions");
  let addTagBtn = box.querySelector("button.addTagBtn");

  addTagBtn?.addEventListener("click", (e) => {
    const searchInput = box.querySelector(
      ".ct-custom-select-container .ct-custom-select-search input"
    );
    const searchValue = searchInput.value;
    if (searchValue) {
      addTag(searchValue);
    }
  });

  tagsButton?.addEventListener("click", (e) => {
    const customSelectContainer = box.querySelector(
      ".ct-custom-select-container"
    );
    customSelectContainer.style.display =
      customSelectContainer.style.display === "block" ? "none" : "block";
  });

  collectionButton?.addEventListener("click", (e) => {
    const customCollectionsContainer = box.querySelector(
      ".custom-collections-container"
    );
    customCollectionsContainer.style.display =
      customCollectionsContainer.style.display === "block" ? "none" : "block";
  });

  function createImageDropdown(type, options) {
    let currentChosenStatus;
    if (type === "status") {
      currentChosenStatus = floatingCommentObject.currentStatus;
    }
    if (type === "priority") {
      currentChosenStatus = floatingCommentObject.currentPriority;
    }
    if (type === "type") {
      currentChosenStatus = floatingCommentObject.currentFeedbackType;
    }

    // Create the dropdown container elements
    const container = document.createElement("div");
    const dropdownMenu = document.createElement("div");
    const imageWrapper = document.createElement("div");
    const imageDisplay = document.createElement("img");
    const dropdownIcon = document.createElement("div");
    dropdownIcon.style.height = "25px";
    dropdownIcon.innerHTML = `
      <svg width="25px" height="25px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
        <g id="SVGRepo_iconCarrier">
          <path fill-rule="evenodd" clip-rule="evenodd"
            d="M12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L6.29289 9.70711C5.90237 9.31658 5.90237 8.68342 6.29289 8.29289C6.68342 7.90237 7.31658 7.90237 7.70711 8.29289L12 12.5858L16.2929 8.29289C16.6834 7.90237 17.3166 7.90237 17.7071 8.29289C18.0976 8.68342 18.0976 9.31658 17.7071 9.70711L12.7071 14.7071Z"
            fill="#000000"></path>
        </g>
      </svg>
    `;

    // Set up the default display image based on the current status
    imageDisplay.style.cssText = "height: 15px;width: 15px;margin-right: 2px;";
    const currentOption = options.find(
      (opt) => opt.label === currentChosenStatus
    );
    imageDisplay.src = currentOption ? currentOption.image : options[0].image; // Fallback to the first option if no match
    imageDisplay.classList.add("ct-dropdown-image");

    // Set up the image wrapper styles
    imageWrapper.style.cssText =
      "padding: 5px;border-radius: 14px; height: 25px;outline: #ABB7C9 solid 1px;display: flex;align-items: center;width: fit-content;box-shadow: rgba(0, 0, 0, 0.15) 2px 3px 6px";

    // Configure the dropdown menu styles
    dropdownMenu.className = "ct-dropdown-menu";
    dropdownMenu.style.display = "none";
    dropdownMenu.style.maxHeight = "200px";
    dropdownMenu.style.overflowY = "scroll";
    options.forEach((opt) => {
      const optionDiv = document.createElement("div");
      const img = document.createElement("img");
      img.src = opt.image;
      img.className = "ct-dropdown-image";
      optionDiv.appendChild(img);
      optionDiv.append(opt.label);
      optionDiv.style.width = "auto";
      optionDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        imageDisplay.src = opt.image;
        if (type === "status") {
          floatingCommentObject.currentStatus = opt.label;
        }
        if (type === "priority") {
          floatingCommentObject.currentPriority = opt.label;
        }
        if (type === "type") {
          floatingCommentObject.currentFeedbackType = opt.label;
        }
        imageDisplay.classList.add("ct-dropdown-image");
        dropdownMenu.style.display = "none";
      });
      dropdownMenu.appendChild(optionDiv);
    });

    container.onclick = () => {
      dropdownMenu.style.display =
        dropdownMenu.style.display === "none" ? "block" : "none";
    };

    container.appendChild(dropdownMenu);
    imageWrapper.appendChild(imageDisplay);
    imageWrapper.appendChild(dropdownIcon);
    container.appendChild(imageWrapper);
    return container;
  }

  function createImageDropdownUsers(options) {
    const container = document.createElement("div");
    const dropdownMenu = document.createElement("div");
    const imageWrapper = document.createElement("div");
    const imageDisplay = document.createElement("img");
    const dropdownIcon = document.createElement("div");
    const searchWrapper = document.createElement("div");
    const searchInput = document.createElement("input");
    // const searchButton = document.createElement("button");

    // Styling for the search wrapper
    searchWrapper.style.cssText =
      "display: flex; align-items: center; padding: 5px;";

    // Styling for the search input
    searchInput.placeholder = "Search...";
    searchInput.style.cssText =
      "flex-grow: 1; padding: 5px; margin-right: 5px; box-sizing: border-box;";
    searchInput.addEventListener("click", function (event) {
      event.stopPropagation(); // This stops the click event from bubbling up to the container
    });

    // Adding search button
    // searchButton.className = "ct-arrowright-wrapper";
    // searchButton.title = "Save Tags";
    // searchButton.innerHTML = `<img class="arrowright-icon" src="https://d3jrelxj5ogq5g.cloudfront.net/icons/arrowright_sa8ron.svg">`;
    // searchButton.style.cssText = "padding: 5px; cursor: pointer;";
    // searchButton.addEventListener("click", function (event) {
    //   event.stopPropagation(); // Prevent the button click from closing the dropdown
    // });

    // Appending search input and button to the wrapper
    searchWrapper.appendChild(searchInput);
    // searchWrapper.appendChild(searchButton);

    // Dropdown menu setup
    dropdownMenu.appendChild(searchWrapper);
    dropdownIcon.style.height = "25px";
    dropdownIcon.innerHTML = `
    <svg width="25px" height="25px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L6.29289 9.70711C5.90237 9.31658 5.90237 8.68342 6.29289 8.29289C6.68342 7.90237 7.31658 7.90237 7.70711 8.29289L12 12.5858L16.2929 8.29289C16.6834 7.90237 17.3166 7.90237 17.7071 8.29289C18.0976 8.68342 18.0976 9.31658 17.7071 9.70711L12.7071 14.7071Z" fill="#000000"></path> </g></svg>
    `;
    imageDisplay.style.cssText = "height: 15px;width: 15px;margin-right: 2px;";
    imageWrapper.style.cssText =
      "padding: 5px;border-radius: 14px;height: 25px;outline: #ABB7C9 solid 1px;display: flex;align-items: center;width: fit-content;box-shadow: rgba(0, 0, 0, 0.15) 2px 3px 6px";
    imageDisplay.src = options[0].image;
    imageDisplay.classList.add("ct-dropdown-image");
    imageDisplay.style.borderRadius = "10px";
    dropdownMenu.className = "ct-dropdown-menu";
    dropdownMenu.style.display = "none";
    dropdownMenu.style.maxHeight = "200px";
    dropdownMenu.style.overflowY = "scroll";

    // Create dropdown options
    const optionElements = options.map((opt) => {
      const optionDiv = document.createElement("div");
      const img = document.createElement("img");
      img.src = opt.image;
      img.className = "ct-dropdown-image";
      img.style.borderRadius = "10px";
      optionDiv.appendChild(img);
      optionDiv.append(opt.label);
      optionDiv.style.width = "auto";
      optionDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        imageDisplay.src = opt.image;
        imageDisplay.classList.add("ct-dropdown-image");
        imageDisplay.style.borderRadius = "10px";
        dropdownMenu.style.display = "none";
      });
      return optionDiv;
    });

    // Append all options to the dropdown initially
    optionElements.forEach((optionElement) =>
      dropdownMenu.appendChild(optionElement)
    );

    // Filter function for the search
    searchInput.addEventListener("input", (e) => {
      const searchValue = e.target.value.toLowerCase();
      optionElements.forEach((element) => {
        const label = element.textContent.toLowerCase();
        if (label.includes(searchValue)) {
          dropdownMenu.appendChild(element);
        } else {
          if (element.parentNode === dropdownMenu) {
            dropdownMenu.removeChild(element);
          }
        }
      });
    });

    container.onclick = () => {
      dropdownMenu.style.display =
        dropdownMenu.style.display === "none" ? "block" : "none";
    };

    container.appendChild(dropdownMenu);
    imageWrapper.appendChild(imageDisplay);
    imageWrapper.appendChild(dropdownIcon);
    container.appendChild(imageWrapper);
    return container;
  }

  selectWrapperDiv.appendChild(
    createImageDropdown("status", [
      { label: "Open", image: "https://www.colorhexa.com/FF0400.png" },
      { label: "In Progress", image: "https://www.colorhexa.com/FFA500.png" },
      { label: "In Review", image: "https://www.colorhexa.com/FFF500.png" },
      { label: "Completed", image: "https://www.colorhexa.com/2AF902.png" },
    ])
  );

  fetchUsers().then((usersArray) => {
    const dropdownOptions = usersArray.map((user) => ({
      label: user.username,
      image:
        user.profilePhoto ||
        "https://d3jrelxj5ogq5g.cloudfront.net/webapp/curateit-logo.png",
    }));
    mentionedUsersArray = usersArray?.map((user) => user.username);
    selectWrapperDiv.appendChild(createImageDropdownUsers(dropdownOptions));
  });

  selectWrapperDiv.appendChild(
    createImageDropdown("priority", [
      {
        label: "Low",
        image: "https://d3jrelxj5ogq5g.cloudfront.net/icons/low_u5p5dw.svg",
      },
      {
        label: "Medium",
        image: "https://d3jrelxj5ogq5g.cloudfront.net/icons/medium_qtdgkv.svg",
      },
      {
        label: "High",
        image: "https://d3jrelxj5ogq5g.cloudfront.net/icons/high_mhrptj.svg",
      },
      {
        label: "Urgent",
        image: "https://d3jrelxj5ogq5g.cloudfront.net/icons/urgent_zb08kn.svg",
      },
    ])
  );

  selectWrapperDiv.appendChild(
    createImageDropdown("type", [
      {
        label: "Idea",
        image:
          "https://d3jrelxj5ogq5g.cloudfront.net/icons/Lightbulb_kcodnl.svg",
      },
      {
        label: "Feedback",
        image: "https://d3jrelxj5ogq5g.cloudfront.net/icons/Checks_hrqoeq.svg",
      },
      {
        label: "Bug",
        image: "https://d3jrelxj5ogq5g.cloudfront.net/icons/Bug_freot5.svg",
      },
    ])
  );

  xWrapperButton?.addEventListener("click", (e) => {
    hideComment();
  });

  // Function to change the background color
  function showBrowserDataOnScreen() {
    const browserDataElement = box.querySelector(".browserDataElement");

    function renderSection(sectionName) {
      const captured = retrieveConsole();
      // Validate section name
      if (!captured.hasOwnProperty(sectionName)) {
        console.error("Invalid section name provided.");
        return null;
      }

      // Create a section div
      const section = document.createElement("div");
      section.style.marginBottom = "20px";

      // Title for the section
      const title = document.createElement("h2");
      title.textContent = sectionName.toUpperCase();
      title.style.textTransform = "uppercase";
      const color =
        sectionName === "log"
          ? "blue"
          : sectionName === "error"
          ? "red"
          : "orange";
      title.style.color = color;
      section.appendChild(title);

      // Append each entry as a paragraph
      captured[sectionName].forEach((entry) => {
        const p = document.createElement("p");
        p.textContent = entry;
        p.style.background = "#f0f0f0";
        p.style.borderLeft = `5px solid ${color}`;
        p.style.padding = "10px";
        p.style.margin = "5px 0";
        section.appendChild(p);
      });

      // Return the section as HTML string
      return section.outerHTML;
    }

    function parseUserAgent(uaString) {
      // Define regex patterns for browser and OS detection
      const browserRegex =
        /(firefox|msie|trident|edge|edg|chrome|safari)[\/\s]?(?:(\d+)(?:\.(\d+))?)?/i;
      const osRegex = /(windows nt|mac os x|android|linux)/i;

      // Default object to hold our detected info
      const detected = {
        browserName: "Unknown",
        browserVersion: "Unknown",
        operatingSystem: "Unknown",
      };

      // Detecting Browser Name and Version
      const browserMatches = browserRegex.exec(uaString);
      if (browserMatches) {
        detected.browserName = browserMatches[1]
          .replace("edg", "edge")
          .replace("trident", "msie");
        detected.browserVersion = browserMatches[2] || "Unknown";
      }

      // Detecting Operating System
      const osMatches = osRegex.exec(uaString);
      if (osMatches) {
        detected.operatingSystem = osMatches[1]
          .replace("windows nt", "Windows")
          .replace("mac os x", "macOS")
          .replace("android", "Android")
          .replace("linux", "Linux");
      }

      return detected;
    }

    // Example usage
    const userAgentString = navigator.userAgent;
    const browserData = parseUserAgent(userAgentString);

    browserDataElement.innerHTML = `
    <!-- ERROR DIV -->
    <div
    class="ErrorDiv"
      style="
        width: 100%;
        position: relative;
        background-color: rgba(0, 0, 0, 0);
        overflow: hidden;
        display: none;
        flex-direction: row;
        align-items: flex-start;
        justify-content: flex-start;
        line-height: normal;
        letter-spacing: normal;
      "
    >
    ${renderSection("error")}
    </div>
    <!-- LOGS DIV -->
    <div
    class="LogsDiv"
    style="
        width: 100%;
        position: relative;
        background-color: rgba(0, 0, 0, 0);
        overflow: hidden;
        display: none;
        flex-direction: row;
        align-items: flex-start;
        justify-content: flex-start;
        line-height: normal;
        letter-spacing: normal;
      "
    >
    ${renderSection("log")}
    </div>
    <!-- WARNINGS DIV -->
    <div
    class="WarningsDiv"
    style="
        width: 100%;
        position: relative;
        background-color: rgba(0, 0, 0, 0);
        overflow: hidden;
        display: none;
        flex-direction: row;
        align-items: flex-start;
        justify-content: flex-start;
        line-height: normal;
        letter-spacing: normal;
      "
    >
    ${renderSection("warn")}
    </div>
    <!-- INFO DIV -->
    <div
    class="InfoDiv"
    style="
        width: 100%;
        position: relative;
        background-color: rgba(0, 0, 0, 0);
        overflow: hidden;
        display: none;
        flex-direction: row;
        align-items: flex-start;
        justify-content: flex-start;
        line-height: normal;
        letter-spacing: normal;
      "
    >
      <section
        style="
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          box-sizing: border-box;
          gap: 26px;
          background-image: url('542x318x-544915118');
          background-size: cover;
          background-repeat: no-repeat;
          background-position: top;
          max-width: 100%;
          text-align: left;
          font-size: 15px;
          color: black;
          font-family: Inter;
        "
      >
        <div
          style="
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            justify-content: flex-start;
            padding: 0px 1px;
            box-sizing: border-box;
            max-width: 100%;
          "
        >
          <div
            style="
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              justify-content: flex-start;
              gap: 8px;
              max-width: 100%;
            "
          >
            <div
              style="
                width: 100%;
                display: flex;
                flex-direction: row;
                align-items: flex-end;
                justify-content: flex-start;
                gap: 14px;
              "
            >
              <div
                style="
                  display: flex;
                  flex-direction: column;
                  align-items: flex-start;
                  justify-content: flex-end;
                  padding: 0px 0px 3px;
                "
              >
                <img
                  style="
                    width: 15px;
                    height: 10px;
                    position: relative;
                    object-fit: cover;
                    z-index: 1;
                  "
                  loading="lazy"
                  alt=""
                  src="https://d1xzdqg8s8ggsr.cloudfront.net/6605e4c66db0794105cc1041/be50aafe-942b-4010-881f-396e9d2a965f_1712660050385109664?Expires=-62135596800&Signature=e7iZ-N8KxZNTLHi8YWVMmfs4FqQ9loG3Q2Y6m2fySFmMS~31wBwecOBbLryIGVeJPmQVQ0DNUygJpH3MUjjFRs~XRQh0bQKKVVsd0IieurxqVdhs2xUav6vf9WKCJQ5PO6dUnNypF6yTS78dIv-TO8SMd9~S8nSGgudkF-izkWHHLEiWc60Cn5zWUAkX-A-iBdJrWi1WVLHZTXJ3DfGUatBMeU9W3y-l1AtA6Lm~ECnzxgpy2Ju34-6eTKjw9~4ClhAxDcgCy~aPeehVEyEsz2lh-3tkU~cK~LAGT2qOnUkAXkyY0~29ZqmP4iBWIHHPOEC4unNJEUD5~6nVAvb~QQ__&Key-Pair-Id=K1P54FZWCHCL6J"
                />
              </div>
              <div style="flex: 1; position: relative; z-index: 1">Description</div>
            </div>
            <div
              style="
                align-self: stretch;
                display: flex;
                flex-direction: row;
                align-items: flex-start;
                justify-content: flex-start;
                padding: 0px 0px 0px 28px;
                box-sizing: border-box;
                max-width: 100%;
                color: #abacad;
              "
            >
              <div
                style="
                  flex: 1;
                  position: relative;
                  display: inline-block;
                  max-width: 100%;
                  z-index: 1;
                "
              >
                ${
                  document.querySelector("meta[name='description']")?.content ||
                  document.title
                }
              </div>
            </div>
          </div>
        </div>
        <div
          style="
            width: 327px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            gap: 10px;
            max-width: 100%;
            color: #72757a;
          "
        >
          <div
            style="
              width: 72px;
              display: flex;
              flex-direction: row;
              align-items: flex-start;
              justify-content: flex-start;
              gap: 13px;
            "
          >
            <img
              style="
                height: 17px;
                width: 17px;
                position: relative;
                object-fit: cover;
                min-height: 17px;
                z-index: 1;
              "
              loading="lazy"
              alt=""
              src="https://d1xzdqg8s8ggsr.cloudfront.net/6605e4c66db0794105cc1041/ae8c5023-8bf3-42c2-8d55-b603ac2628fb_1712660061137518083?Expires=-62135596800&Signature=W3u-~UHmemTgs7Ucuz1hlv4xqaFEqFpXK9MOOYkcPQ0fIK3Xb0kcFu6L3RMJtaHwUBjh0j66sCIhC8LSyFOuz1lrJ3Za84XbiUGLeiNUT95UkblwaK2hwpGmUmi73K6TuzOPKFeUc4VFZkV0bAFNI~nZnYDbIVauGVRf6YDiIrQ7mCLf44Co4lVBqUHeU0FqiWUjiofqs4cXAQ-Y5-Ct3Ek-m0VKkzVv5yGucMa8~gd9CriL69EDXvkwZuiJpbIECCp-~ETVgRoTxqNapVcHen7GNEnUAUyMWi23PE9sA0LMBksLBw5miGj3NTEsxjPZ7qfjRn8d9uo6qbD8zmymmw__&Key-Pair-Id=K1P54FZWCHCL6J"
            />

            <div style="flex: 1; position: relative; z-index: 1">Page</div>
          </div>
          <div
            style="
              align-self: stretch;
              display: flex;
              flex-direction: row;
              align-items: flex-start;
              justify-content: flex-start;
              padding: 0px 0px 0px 30px;
              color: #abadae;
            "
          >
            <div style="flex: 1; position: relative; z-index: 1">
              ${window.location.href}
            </div>
          </div>
        </div>
        <div
          style="
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            gap: 11px;
            font-size: 16px;
            color: #7b7d80;
          "
        >
          <div
            style="
              width: 193px;
              display: flex;
              flex-direction: row;
              align-items: flex-start;
              justify-content: flex-start;
              gap: 13px;
            "
          >
            <div
              style="
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-start;
                padding: 2px 0px 0px;
              "
            >
              <img
                style="
                  width: 16px;
                  height: 17px;
                  position: relative;
                  object-fit: cover;
                  z-index: 1;
                "
                loading="lazy"
                alt=""
                src="https://d1xzdqg8s8ggsr.cloudfront.net/6605e4c66db0794105cc1041/4de5f4a4-612a-4879-8e1b-73b4deb722a2_1712660061137607921?Expires=-62135596800&amp;Signature=T3IeEdzcP0pa-ID770vAp6UlmU6tKUNR~sTfSo1Z0jtPhO1ThD6rFm-vTnb~BqMai8Ee0~Ag~c0ZWJKyFg5CHbj6KhLozfX8Bzav7PqI3q0Py0khlXycb5SRIefvCedYqqsbdNG7hHoFGPd52E9vt-89DAVf0htVTYO4iJ~8V6TTB8XCbuIQ2JQOJblOMVpqQyXg3Q1LBdwf5cJTULSJ~rldG-185uWbkoFAVGGWWmZ~zIko4ae0vIRiXXVZ0FkIVhidS1v7xGtyxism5Iek5ynzoL4lLM2PGSDjPrDA4ZbWHRYooi~SKJtkx9Jy7dnbQigTWB942vOxPjLVpWuZ6A__&amp;Key-Pair-Id=K1P54FZWCHCL6J"
              />
            </div>
            <div style="flex: 1; position: relative; z-index: 1">
              Session information
            </div>
          </div>
          <div
            style="
              width: 100%;
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: center;
              padding: 0px 30px;
              box-sizing: border-box;
              color: #a8a9ab;
            "
          >
            <div
              style="
                flex: 1;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
              "
            >
              <div
                style="
                  position: relative;
                  line-height: 15px;
                  display: inline-block;
                  min-width: 60px;
                  z-index: 1;
                "
              >
                Device:
              </div>
              <div
                style="
                  display: flex;
                  flex-direction: row;
                  align-items: flex-start;
                  justify-content: flex-start;
                  gap: 7px;
                  font-size: 15px;
                  color: #abacae;
                "
              >
                <div
                  style="
                    position: relative;
                    display: inline-block;
                    min-width: 68px;
                    z-index: 1;
                  "
                >
                  Desktop
                </div>
              </div>
            </div>
          </div>

          <div
            style="
              width: 100%;
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: center;
              padding: 0px 30px;
              box-sizing: border-box;
              color: #a8a9ab;
            "
          >
            <div
              style="
                flex: 1;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
              "
            >
              <div
                style="
                  position: relative;
                  line-height: 15px;
                  display: inline-block;
                  min-width: 60px;
                  z-index: 1;
                "
              >
                System:
              </div>
              <div
                style="
                  display: flex;
                  flex-direction: row;
                  align-items: flex-start;
                  justify-content: flex-start;
                  gap: 7px;
                  font-size: 15px;
                  color: #abacae;
                "
              >
                <div
                  style="
                    position: relative;
                    display: inline-block;
                    min-width: 68px;
                    z-index: 1;
                  "
                >
                  ${browserData.operatingSystem}
                </div>
              </div>
            </div>
          </div>
          <div
            style="
              width: 100%;
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: center;
              padding: 0px 30px;
              box-sizing: border-box;
              color: #a8a9ab;
            "
          >
            <div
              style="
                flex: 1;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
              "
            >
              <div
                style="
                  position: relative;
                  line-height: 15px;
                  display: inline-block;
                  min-width: 60px;
                  z-index: 1;
                "
              >
                Browser:
              </div>
              <div
                style="
                  display: flex;
                  flex-direction: row;
                  align-items: flex-start;
                  justify-content: flex-start;
                  gap: 7px;
                  font-size: 15px;
                  color: #abacae;
                "
              >
                <div
                  style="
                    position: relative;
                    display: inline-block;
                    min-width: 68px;
                    z-index: 1;
                  "
                >
                  ${browserData.browserName}${browserData.browserVersion}
                </div>
              </div>
            </div>
          </div>
          <div
            style="
              width: 100%;
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: center;
              padding: 0px 30px;
              box-sizing: border-box;
              color: #a8a9ab;
            "
          >
            <div
              style="
                flex: 1;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
              "
            >
              <div
                style="
                  position: relative;
                  line-height: 15px;
                  display: inline-block;
                  min-width: 60px;
                  z-index: 1;
                "
              >
                Resolution:
              </div>
              <div
                style="
                  display: flex;
                  flex-direction: row;
                  align-items: flex-start;
                  justify-content: flex-start;
                  gap: 7px;
                  font-size: 15px;
                  color: #abacae;
                "
              >
                <div
                  style="
                    position: relative;
                    display: inline-block;
                    min-width: 68px;
                    z-index: 1;
                  "
                >
                  ${window.screen.width}x${window.screen.height}
                </div>
              </div>
            </div>
          </div>
          <div
            style="
              width: 100%;
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: center;
              padding: 0px 30px;
              box-sizing: border-box;
              color: #a8a9ab;
            "
          >
            <div
              style="
                flex: 1;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
              "
            >
              <div
                style="
                  position: relative;
                  line-height: 15px;
                  display: inline-block;
                  min-width: 60px;
                  z-index: 1;
                "
              >
                Other Data:
              </div>
              <div
                style="
                  display: flex;
                  flex-direction: row;
                  align-items: flex-start;
                  justify-content: flex-start;
                  gap: 7px;
                  font-size: 15px;
                  color: #abacae;
                "
              >
                <div
                  style="
                    position: relative;
                    display: inline-block;
                    min-width: 68px;
                    z-index: 1;
                  "
                >
                  ${userAgentString}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
<!--  -->
    `;
    initializeInfoDivs();
  }

  // Function to initialize the application
  function initializeInfoDivs() {
    const mainComment = floatingCommentObject.mainComment;
    const options = ["Error", "Logs", "Warnings", "Info"];
    const container = document.createElement("div");
    container.innerHTML = `
    <h2>Created By @${mainComment.author || "NA"} on ${
      mainComment.timestamp || "NA"
    }</h2>
    `;
    // Create a div to hold the radio buttons
    const radioContainer = document.createElement("div");
    radioContainer.style.cssText =
      "display: flex; justify-content: space-evenly;";
    container.appendChild(radioContainer);

    // Function to hide all content divs
    function hideAllContent() {
      options.forEach((option) => {
        const div = box.querySelector(`.${option}Div`);
        if (div) {
          div.style.display = "none";
        }
      });
    }

    // Create radio buttons and corresponding divs
    options.forEach((option) => {
      // Create the radio button
      const radioButton = document.createElement("input");
      radioButton.type = "radio";
      radioButton.name = "infoOptions";
      radioButton.value = option;
      radioButton.id = `radio-${option}`;
      radioButton.addEventListener("change", function () {
        hideAllContent();
        const contentDiv = box.querySelector(`.${option}Div`);
        if (contentDiv) {
          contentDiv.style.display = "flex";
        }
      });

      // Create a label for the radio button
      const label = document.createElement("label");
      label.htmlFor = `radio-${option}`;
      label.textContent = option;

      // Append the radio button and label to the radio container
      radioContainer.appendChild(radioButton);
      radioContainer.appendChild(label);
    });

    // Append the entire structure to the body
    const browserDataElement = box.querySelector(".browserDataElement");
    browserDataElement.prepend(container);
    // Initially hide all content divs
    hideAllContent();
  }

  function showFileUploadPreview(fileObj) {
    const { fileType, fileUrl, fileName } = fileObj;

    // Create a container div for the preview
    let container = document.createElement("div");
    container.classList.add("preview-container"); // Add class for styling or selection if needed
    container.style = "position: relative; width: 100%;"; // Ensure this container is relatively positioned

    // Create the delete button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "X";
    deleteButton.style =
      "position: absolute;top: 0px;right: 0px;z-index: 3;padding: 0;height: 25px;width: 23px;"; // Ensure it is on top of other elements

    // Attach event listener to delete button
    deleteButton.addEventListener("click", function () {
      // Remove the preview element
      container.remove();
      // Find and remove the fileObj from the attachedFiles array
      const index = attachedFiles.findIndex(
        (f) =>
          f.fileName === fileObj.fileName && f.fileType === fileObj.fileType
      );
      if (index > -1) {
        attachedFiles.splice(index, 1);
      }
    });

    // Append the delete button to the container
    container.appendChild(deleteButton);

    if (fileType === "images") {
      const img = document.createElement("img");
      img.loading = "lazy";
      img.src = fileUrl;
      img.style =
        "height: 100px; width: 100px; padding: 5px; border-radius: 15px; position: relative;";
      container.appendChild(img);

      // Enlarge image on click
      img.addEventListener("click", function () {
        // Create overlay
        const overlay = document.createElement("div");
        overlay.style = `
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.8);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
          `;
        document.body.appendChild(overlay);

        // Create enlarged image
        const enlargedImg = document.createElement("img");
        enlargedImg.src = img.src;
        enlargedImg.style = `
              max-width: 80%;
              max-height: 80%;
              transition: transform 0.25s ease;
          `;
        overlay.appendChild(enlargedImg);

        // Handle zoom on scroll
        let scale = 1;
        overlay.addEventListener("wheel", function (e) {
          e.preventDefault();
          scale += e.deltaY * -0.01;
          scale = Math.min(Math.max(1, scale), 3); // Limit zoom between 1x and 3x
          enlargedImg.style.transform = `scale(${scale})`;
        });

        // Double-tap to zoom in and out
        let lastTap = 0;
        enlargedImg.addEventListener("click", function (event) {
          const currentTime = new Date().getTime();
          const tapLength = currentTime - lastTap;
          if (tapLength < 300 && tapLength > 0) {
            // Toggle zoom between 1x and 2x
            scale = scale === 1 ? 2 : 1;
            enlargedImg.style.transform = `scale(${scale})`;
          }
          lastTap = currentTime;
        });

        // Close button
        const closeButton = document.createElement("button");
        closeButton.textContent = "×";
        closeButton.style = `
              position: absolute;
              top: 20px;
              right: 20px;
              font-size: 24px;
              color: white;
              background: none;
              border: none;
              cursor: pointer;
              outline: none;
          `;
        overlay.appendChild(closeButton);

        closeButton.addEventListener("click", function () {
          overlay.remove();
        });
      });
    } else if (fileType === "audio") {
      const audioPreview = document.createElement("div");
      audioPreview.style = `width: 100%;display: flex;flex-direction: column;gap: 5px;`;
      audioPreview.innerHTML = `
      <div class="audio-controls" style="display: flex; justify-content: space-between; border-width: 1px; width: auto; background-color: white; border-color: #ABB7C9; border-radius: 0.25rem; padding: 0.25rem; align-items: center; gap: 0.5rem;">
          <button class="btn-toggle-pause" style="border-width: 1px;background-color: #1D4ED8;color: white;border-color: #1D4ED8;padding: 0.25rem;border-radius: 50%;outline: 2px solid transparent;outline-offset: 2px;width: 35px;height: 35px;">
          <svg class="playSvg" title="Play" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.4086 9.35258C22.5305 10.5065 22.5305 13.4935 20.4086 14.6474L7.59662 21.6145C5.53435 22.736 3 21.2763 3 18.9671L3 5.0329C3 2.72368 5.53435 1.26402 7.59661 2.38548L20.4086 9.35258Z" stroke="#ffffff" stroke-width="1.5"></path> </g></svg>
          <svg class="pauseSvg" title="Pause" width="24" height="24" viewBox="-1 0 8 8" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>pause [#fffffffffff]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-227.000000, -3765.000000)" fill="#ffffff"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M172,3605 C171.448,3605 171,3605.448 171,3606 L171,3612 C171,3612.552 171.448,3613 172,3613 C172.552,3613 173,3612.552 173,3612 L173,3606 C173,3605.448 172.552,3605 172,3605 M177,3606 L177,3612 C177,3612.552 176.552,3613 176,3613 C175.448,3613 175,3612.552 175,3612 L175,3606 C175,3605.448 175.448,3605 176,3605 C176.552,3605 177,3605.448 177,3606" id="pause-[#fffffffffff]"> </path> </g> </g> </g> </g></svg>
          </button>
          <div id="audiowave" style="width: 100%;"></div>
      </div>
      `;
      const audiowaveElement = audioPreview.querySelector("#audiowave");
      var wavesurfer = WaveSurfer.create({
        container: audiowaveElement,
        waveColor: "#347AE2",
        barWidth: 2,
        barHeight: 2,
        barGap: 2,
        progressColor: "rgb(100, 0, 100)",
        height: 30,
        responsive: true,
        hideScrollbar: true,
        cursorColor: "#5df9de",
        cursorWidth: 2,
        skipLength: 5,
      });

      wavesurfer.load(fileUrl);

      audioPreview
        .querySelector(".btn-toggle-pause")
        ?.addEventListener("click", (e) => {
          wavesurfer.playPause();
          // Toggle button text based on whether the audio is playing
          if (wavesurfer.isPlaying()) {
            audioPreview.querySelector(".playSvg").style.display = "none";
            audioPreview.querySelector(".pauseSvg").style.display = "block";
          } else {
            audioPreview.querySelector(".pauseSvg").style.display = "none";
            audioPreview.querySelector(".playSvg").style.display = "block";
          }
        });
      container.appendChild(audioPreview);
    } else if (fileType === "video") {
      const video = document.createElement("video");
      video.src = fileUrl;
      video.controls = true;
      video.style = "width: 100%;max-height:200px";
      container.appendChild(video);
    } else if (fileType === "file") {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.textContent = fileName;
      container.appendChild(link);
      container.style =
        "display: flex; align-items: center; position: relative;";
    }

    // Return the container element
    return container;
  }

  showBrowserDataOnScreen();
  browserInfoButton?.addEventListener("click", (e) => {
    const browserDataElement = box.querySelector(".browserDataElement");
    browserDataElement.style.display =
      browserDataElement.style.display === "block" ? "none" : "block";
  });

  fileInput.addEventListener("change", async function () {
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0]; // If multiple files are allowed, you might want to iterate over fileInput.files
      const resp = await uploadFile(file);
      if (resp) {
        const uploadedUrl = resp;

        // Determine the file's category
        const category = getCategoryByMimeType(file.type);
        // Update attachedFiles and refresh the displayed content
        const fileObj = {
          fileType: category,
          fileUrl: uploadedUrl,
          fileName: file.name,
        };
        const fileUploadPreview = showFileUploadPreview(fileObj);
        const filePreview = box.querySelector(".filePreview");
        filePreview.appendChild(fileUploadPreview);
        attachedFiles.push(fileObj);
      } else {
        console.log("Upload failed or no URL returned.");
      }
    } else {
      console.log("No file selected.");
    }
  });

  // Function to determine the category based on the MIME type
  function getCategoryByMimeType(mimeType) {
    if (mimeType.startsWith("image/")) return "images";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.startsWith("video/")) return "video";
    return "file"; // Default category
  }

  async function handleCreateUserComment(attachedFiles) {
    const userData = await chrome?.storage?.sync.get(["userData"]);
    const userName = userData?.userData?.username;
    const authorId = userData?.userData?.userId;
    const currentText = replyInput.value;
    const currentDate = formatDate(new Date());
    const id = generateUniqueId();
    await createUserCommentOnBoxV2(
      userName,
      currentDate,
      currentText,
      authorId,
      attachedFiles,
      id
    );
    replyInput.value = "";
  }

  replyBtn?.addEventListener("click", async (e) => {
    await handleCreateUserComment(attachedFiles);
    attachedFiles = [];
    box.querySelector(".filePreview").innerHTML = "";
  });

  replyInput?.addEventListener("keydown", async (e) => {
    if (e.key === "Enter" && e.altKey) {
      e.preventDefault();
      const startPos = replyInput.selectionStart;
      const endPos = replyInput.selectionEnd;
      replyInput.value =
        replyInput.value.substring(0, startPos) +
        "\n" +
        replyInput.value.substring(endPos);
      replyInput.selectionStart = replyInput.selectionEnd = startPos + 1;
    } else if (e.key === "Enter") {
      const active = userSuggestions.querySelector(".ct-active");

      if (active) {
        // e.preventDefault();
        // e.stopPropagation();
        return;
      }
      e.preventDefault();
      await handleCreateUserComment(attachedFiles);
      attachedFiles = [];
      box.querySelector(".filePreview").innerHTML = "";
    }
  });

  pickEmojiButton?.addEventListener("click", (e) => {
    const emojiContainer = box.querySelector(".emojiContainer");
    emojiContainer.style.display =
      emojiContainer.style.display === "block" ? "none" : "block";
  });

  screenshotButton?.addEventListener("click", (e) => {
    // Create the main overlay without a background
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.cursor = "crosshair";
    document.body.appendChild(overlay);

    let startX, startY, endX, endY;
    let rect = { top: null, right: null, bottom: null, left: null };

    function createRectDiv() {
      const div = document.createElement("div");
      div.style.position = "fixed";
      div.style.backgroundColor = "rgba(0,0,0,0.5)";
      return div;
    }

    function updateRect() {
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      const minY = Math.min(startY, endY);
      const maxY = Math.max(startY, endY);

      // Create divs for the first time
      if (!rect.top) {
        rect.top = createRectDiv();
        rect.right = createRectDiv();
        rect.bottom = createRectDiv();
        rect.left = createRectDiv();
        document.body.appendChild(rect.top);
        document.body.appendChild(rect.right);
        document.body.appendChild(rect.bottom);
        document.body.appendChild(rect.left);
      }

      // Adjust the divs to create the "window"
      rect.top.style.width = "100vw";
      rect.top.style.height = `${minY}px`;
      rect.top.style.top = "0";
      rect.top.style.left = "0";

      rect.right.style.width = `calc(100vw - ${maxX}px)`;
      rect.right.style.height = `${maxY - minY}px`;
      rect.right.style.top = `${minY}px`;
      rect.right.style.left = `${maxX}px`;

      rect.bottom.style.width = "100vw";
      rect.bottom.style.height = `calc(100vh - ${maxY}px)`;
      rect.bottom.style.top = `${maxY}px`;
      rect.bottom.style.left = "0";

      rect.left.style.width = `${minX}px`;
      rect.left.style.height = `${maxY - minY}px`;
      rect.left.style.top = `${minY}px`;
      rect.left.style.left = "0";
    }

    function clearRect() {
      rect.top.remove();
      rect.right.remove();
      rect.bottom.remove();
      rect.left.remove();
      rect = { top: null, right: null, bottom: null, left: null };
    }

    overlay.addEventListener("mousedown", function (e) {
      startX = e.pageX - window.scrollX;
      startY = e.pageY - window.scrollY;
      let moving = false;

      function mouseMoveHandler(e) {
        moving = true;
        endX = e.pageX - window.scrollX;
        endY = e.pageY - window.scrollY;
        updateRect();
      }

      async function mouseUpHandler(e) {
        if (moving) {
          endX = e.pageX - window.scrollX;
          endY = e.pageY - window.scrollY;
          updateRect(); // Final update for the rect
          document.removeEventListener("mousemove", mouseMoveHandler);
          document.removeEventListener("mouseup", mouseUpHandler);

          clearRect(); // Clear the "window" divs
          overlay.remove(); // Remove the main overlay

          // Use html2canvas to capture the selected area
          const canvas = await html2canvas(document.body, {
            x: startX,
            y: startY,
            width: Math.abs(endX - startX),
            height: Math.abs(endY - startY),
            windowWidth: document.documentElement.offsetWidth,
            windowHeight: document.documentElement.offsetHeight,
            scrollX: window.scrollX,
            scrollY: window.scrollY,
          });

          // Convert canvas to a Blob
          const blob = await new Promise((resolve) => canvas.toBlob(resolve));

          // Create an image element to display the captured area
          const fileName = createUniqueFileName();
          const file = new File([blob], `${fileName}.png`, {
            type: blob.type,
            lastModified: new Date(),
          });
          const resp = await uploadFile(file);
          const fileObj = {
            fileType: "images",
            fileUrl: resp,
            fileName: `${fileName}.png`,
          };
          const fileUploadPreview = showFileUploadPreview(fileObj);
          const filePreview = box.querySelector(".filePreview");
          filePreview.appendChild(fileUploadPreview);
          attachedFiles.push(fileObj);
        }
      }

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    });
  });

  recordScreenButton?.addEventListener("click", (e) => {
    recordScreen();
  });

  recordAudioButton?.addEventListener("click", (e) => {
    const recordedAudioWrapper = box.querySelector(".recordedAudioWrapper");
    const stopButton = box.querySelector("#stopRecordButton");
    const playButton = box.querySelector("#playRecordButton");
    playButton.style.display = "block";
    stopButton.style.display = "none";
    recordedAudioWrapper.style.display =
      recordedAudioWrapper.style.display === "flex" ? "none" : "flex";
    recordedAudioWrapper.style.marginBottom =
      recordedAudioWrapper.style.marginBottom === "-20px" ? "0" : "-20px";
    audioIconContainer.click();
  });

  audioIconContainer?.addEventListener("click", (e) => {
    recordAudio();
  });

  fileUploadButton?.addEventListener("click", (e) => {
    fileInput.click();
  });

  const createUserCommentOnBoxV2 = async (
    parentName,
    currentDate,
    currentText,
    authorId,
    attachedFiles,
    id
  ) => {
    let uid = id;
    if (!uid) {
      uid = generateUniqueId();
    }
    const userData = await chrome?.storage?.sync.get(["userData"]);
    let browserData = await getBrowserData();
    const userName = userData?.userData?.username;
    let renderedName;
    let renderThreeDots = false;
    if (parentName === userName) {
      renderedName = "Me";
      renderThreeDots = true;
    } else {
      renderedName = parentName;
    }

    function textToHtml(text) {
      // Split text into paragraphs by two or more newline characters
      const paragraphs = text.split(/\n{2,}/g);
      return paragraphs
        .map((paragraph) => {
          // Replace single newlines within each paragraph with <br> for line breaks
          // Trim each paragraph to remove leading/trailing whitespace
          return `<p>${paragraph.trim().replace(/\n/g, "<br>")}</p>`;
        })
        .join("");
    }

    const frameParent1 = document.createElement("div");
    frameParent1.classList.add("ct-frame-parent1");
    frameParent1.innerHTML = `
              <div class="ct-user-profile-and-time-parent" style="width:100%;">
                <div class="ct-user-profile-and-time">
                    <div class="ct-me">${renderedName}</div>
                    <div class="ct-day-ago">${timeAgoText(currentDate)}</div>
                </div>
                <div class="ct-this-is-a">${textToHtml(currentText)}</div>
                <div class="filePreviewComment" style="width: 100%; display: flex; flex-wrap: wrap;gap:10px"></div>
                <div class="picked-emoji" style="font-size: 20px;"></div>
              </div>
              `;

    const filePreviewComment = frameParent1.querySelector(
      ".filePreviewComment"
    );

    attachedFiles?.forEach((fileObj) => {
      const fileUploadPreview = showFileUploadPreview(fileObj);
      fileUploadPreview.querySelector("button").style.display = "none";
      filePreviewComment.appendChild(fileUploadPreview);
    });

    if (renderThreeDots) {
      const dotsthreeParent = document.createElement("div");
      dotsthreeParent.classList.add("ct-dotsthree-parent");
      dotsthreeParent.innerHTML = `<img class="ct-dotsthree-icon" loading="lazy" src="https://d3jrelxj5ogq5g.cloudfront.net/icons/dotsthree_gmol45.svg" style="width: 50px; cursor: pointer; margin-left: 65%;">`;

      const optionsMenu = document.createElement("div");
      optionsMenu.style.display = "none"; // Initially hidden
      optionsMenu.innerHTML = `
        <ul style="list-style: none; padding: 0; margin: 0; background: #fff; border: 1px solid #ccc;">
          <li style="padding: 8px 12px; cursor: pointer;">Edit</li>
          <li style="padding: 8px 12px; cursor: pointer;">Delete</li>
        </ul>
      `;
      dotsthreeParent.appendChild(optionsMenu);

      // Create the default emoji icon
      const defaultEmojiIcon = document.createElement("span");
      defaultEmojiIcon.className = "default-emoji-icon";
      defaultEmojiIcon.textContent = "😀"; // You can choose any emoji
      defaultEmojiIcon.style.cursor = "pointer";
      dotsthreeParent.appendChild(defaultEmojiIcon);

      const emojiReactions = document.createElement("div");
      emojiReactions.className = "emojiReactions";
      emojiReactions.innerHTML = `
          <ul style="list-style: none;display: flex;margin: 0;cursor: pointer;padding: 0;">
            <li style="padding: 0 5px 0 0;">👍</li>
            <li style="padding: 0 5px 0 0;">👎</li>
            <li style="padding: 0 5px 0 0;">😍</li>
            <li style="padding: 0 5px 0 0;">😀</li>
            <li style="padding: 0 5px 0 0;">😔</li>
            <li style="padding: 0 5px 0 0;">🎉</li>
          </ul>
      `;
      emojiReactions.style.display = "none"; // Initially hidden
      emojiReactions.style.transition = "opacity 0.4s ease"; // Transition effect
      dotsthreeParent.appendChild(emojiReactions);

      // Toggle visibility of the emoji reactions
      defaultEmojiIcon.addEventListener("click", () => {
        const isVisible = emojiReactions.style.display === "block";
        emojiReactions.style.display = isVisible ? "none" : "block";
        emojiReactions.style.opacity = isVisible ? 0 : 1;
        defaultEmojiIcon.style.display = "none";
      });

      // Toggle visibility of the options menu
      dotsthreeParent
        .querySelector("img.ct-dotsthree-icon")
        ?.addEventListener("click", () => {
          optionsMenu.style.display =
            optionsMenu.style.display === "none" ? "block" : "none";
        });

      // Function to handle emoji clicks
      function handleEmojiClick(event) {
        const clickedEmoji = event.target.textContent;
        const pickedEmoji = frameParent1.querySelector(".picked-emoji"); // Ensure this element exists in your HTML
        if (pickedEmoji) {
          pickedEmoji.textContent = clickedEmoji;
          floatingCommentObject.reactedEmoji = clickedEmoji;
          defaultEmojiIcon.style.display = "block";
          emojiReactions.style.display = "none";
        }
      }

      // Add event listener to each emoji
      const emojis = emojiReactions.querySelectorAll("li");
      emojis.forEach((emoji) => {
        emoji.addEventListener("click", handleEmojiClick);
      });

      // Append dotsthreeParent to frameParent1
      frameParent1.appendChild(dotsthreeParent);

      // Get edit and delete options
      const editOption = optionsMenu.querySelector("li:nth-child(1)");
      const deleteOption = optionsMenu.querySelector("li:nth-child(2)");

      // Edit functionality
      editOption.addEventListener("click", () => {
        let allCommentsArr = getSiteSpecificData("allComments");
        const textDiv = frameParent1.querySelector(".ct-this-is-a");
        textDiv.contentEditable = "true";
        textDiv.style.border = "1px solid #ccc";
        textDiv.focus();

        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.style.display = "block";
        saveButton.style.marginTop = "10px";
        textDiv.parentNode.appendChild(saveButton);

        saveButton.addEventListener("click", () => {
          textDiv.contentEditable = "false";
          textDiv.style.border = "none";
          const editedText = textDiv.innerText;

          // Update the allCommentsArr with the new text where the uid matches
          allCommentsArr.forEach((comment) => {
            if (comment.mainComment.id === uid) {
              comment.mainComment.text = editedText;
            }
            comment.replies.forEach((reply) => {
              if (reply.id === uid) {
                reply.text = editedText;
              }
            });
          });
          allCommentsArr.forEach((comment) => {
            modifySiteSpecificData(comment);
          });
          saveButton.remove();
        });
      });

      // Delete functionality
      deleteOption.addEventListener("click", () => {
        let allCommentsArr = getSiteSpecificData("allComments");

        // Clear the mainComment or any replies with the matching id
        allCommentsArr.forEach((comment) => {
          if (comment.mainComment.id === uid) {
            Object.keys(comment.mainComment).forEach((key) => {
              delete comment.mainComment[key];
            });
          }
          comment.replies.forEach((reply) => {
            if (reply.id === uid) {
              Object.keys(reply).forEach((key) => {
                delete reply[key];
              });
            }
          });
        });

        // Save the modified data back to the site specific storage
        allCommentsArr.forEach((comment) => {
          modifySiteSpecificData(comment);
        });

        // Assuming frameParent1 is a reference to an element that needs to be removed
        frameParent1.remove();
      });
    }

    const newReply = {
      text: currentText,
      author: parentName,
      authorId: authorId,
      timestamp: currentDate,
      id: uid,
      filesAttached: attachedFiles,
      browserData,
    };

    // Check if newReply is a duplicate of mainComment
    const isDuplicateMainComment =
      floatingCommentObject.mainComment?.text === newReply?.text &&
      floatingCommentObject.mainComment?.authorId === newReply?.authorId &&
      floatingCommentObject.mainComment?.timestamp === newReply?.timestamp;

    // Check if there's already a reply with the same text, authorId, and timestamp
    const isDuplicateReply = floatingCommentObject.replies?.some(
      (reply) =>
        reply?.text === newReply?.text &&
        reply?.authorId === newReply?.authorId &&
        reply?.timestamp === newReply?.timestamp
    );

    if (
      floatingCommentObject.mainComment &&
      floatingCommentObject.mainComment.text !== null &&
      floatingCommentObject.mainComment.text !== undefined &&
      floatingCommentObject.mainComment.text.trim() !== ""
    ) {
      if (!isDuplicateMainComment && !isDuplicateReply) {
        floatingCommentObject.replies.push(newReply);
      } else {
      }
    } else {
      floatingCommentObject.mainComment = newReply;
    }
    if (!isDuplicateMainComment && !isDuplicateReply) {
      await postComment(
        floatingCommentObject,
        currentText,
        authorId,
        parentName
      );
    } else {
    }
    frameDiv.appendChild(frameParent1);
  };

  floatingCommentObject?.replies?.forEach((reply) => {
    createUserCommentOnBoxV2(
      reply.author,
      reply.timestamp,
      reply.text,
      reply.authorId,
      reply.filesAttached,
      reply?.id
    )
      .then(() => console.log("Reply Added successfully"))
      .catch((error) => console.error("Error adding reply:", error));
  });

  if (
    floatingCommentObject.mainComment &&
    floatingCommentObject.mainComment.text !== null &&
    floatingCommentObject.mainComment.text !== undefined &&
    floatingCommentObject.mainComment.text.trim() !== ""
  ) {
    createUserCommentOnBoxV2(
      floatingCommentObject.mainComment.author,
      floatingCommentObject.mainComment.timestamp,
      floatingCommentObject.mainComment.text,
      floatingCommentObject.mainComment.authorId,
      floatingCommentObject.mainComment.filesAttached,
      floatingCommentObject.mainComment.id
    )
      .then(() => console.log("mainComment Added successfully"))
      .catch((error) => console.error("Error adding mainComment:", error));
  }

  const searchInput = box.querySelector(
    ".ct-custom-select-container .ct-custom-select-search input"
  );
  const dropdownContainer = box.querySelector(
    ".ct-custom-select-container .ct-dropdown-container"
  );
  const tagsContainer = box.querySelector(
    ".ct-custom-select-container .ct-tags-container"
  );

  // Function to modify mentionedTagsArray
  function modifyTagsArray(newUserTags) {
    mentionedTagsArray = newUserTags;
    // Call updateDropdownItems to reflect changes in the UI
    updateDropdownItems();
  }

  // Your existing function to update dropdown items based on search input
  function updateDropdownItems() {
    const searchValue = searchInput.value.toLowerCase();
    dropdownContainer.style.display = "none";
    dropdownContainer.innerHTML = ""; // Clear existing items

    if (searchValue) {
      mentionedTagsArray.forEach((user) => {
        if (user.toLowerCase().includes(searchValue)) {
          dropdownContainer.style.display = "block";
          const item = document.createElement("div");
          item.textContent = user;
          item.className = "ct-dropdown-item";
          item.onclick = function () {
            addTag(user);
            dropdownContainer.style.display = "none";
          };
          dropdownContainer.appendChild(item);
        }
      });
    }
  }

  // Example usage of modifyTagsArray
  // This could be called whenever you need to add new users to mentionedTagsArray
  fetchUserDetails().then((userInfo) => {
    const tagsArray = userInfo?.tags?.map((item) => item?.tag);
    modifyTagsArray(tagsArray);
  });

  // Ensure the rest of your component setup remains as is

  searchInput.oninput = updateDropdownItems; // Use oninput for immediate response

  // Function to add tag

  function addTag(user) {
    if (!tagsContainer.textContent.includes(user)) {
      // Prevent duplicate tags
      const tag = document.createElement("span");
      tag.className = "ct-tag";
      tag.textContent = user;
      const removeBtn = document.createElement("span");
      removeBtn.textContent = "×";
      removeBtn.className = "ct-remove-tag";
      removeBtn.onclick = function () {
        tagsContainer.removeChild(tag);
        const index = allUserTags.indexOf(user);
        if (index > -1) {
          allUserTags.splice(index, 1);
        }
      };
      tag.appendChild(removeBtn);
      tagsContainer.appendChild(tag);
      allUserTags.push(user);
    }
    searchInput.value = "";
    updateDropdownItems();
  }

  allUserTags.forEach((tag) => addTag(tag));

  searchInput.onkeyup = updateDropdownItems;
  updateDropdownItems();

  const searchInputCollections = box.querySelector(
    ".custom-collections-container .ct-custom-select-search input"
  );
  const dropdownContainerCollections = box.querySelector(
    ".custom-collections-container .ct-dropdown-container"
  );
  const tagsContainerCollections = box.querySelector(
    ".custom-collections-container .ct-tags-container"
  );

  // Function to modify mentionedTagsArray
  function modifyCollArray(newUserColls) {
    const tmpArray = newUserColls?.map((coll) => ({
      name: coll.name,
      id: coll.id,
    })); // Store both name and ID
    mentionedCollArray = tmpArray;
    updateDropdownItemsColl();
  }

  // Your existing function to update dropdown items based on search input
  function updateDropdownItemsColl() {
    const searchValue = searchInputCollections.value.toLowerCase();
    dropdownContainerCollections.innerHTML = ""; // Clear existing items
    dropdownContainerCollections.style.display = "none";
    dropdownContainerCollections.style.border = "none";
    dropdownContainerCollections.style.width = "max-content";

    const createCollElem = document.createElement("div");
    createCollElem.className = "ct-dropdown-item";
    if (searchValue) {
      dropdownContainerCollections.style.display = "block";
      createCollElem.innerHTML = `<div class="flex items-center" style="color: rgb(59 130 246/1);"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="h-4 w-4 text-blue-500" style="width: 16px;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"></path></svg><span class="ml-3 truncate text-sm text-blue-500">Create '${searchValue}' Collection</span></div>`;
      createCollElem.onclick = async function () {
        await createNewCollection(searchValue);
      };
    } else {
      createCollElem.innerHTML = `<div class="flex items-center" style="color: rgb(59 130 246/1);"><span class="ml-3 truncate text-sm text-blue-500">Type to create new collection</span></div>`;
    }
    dropdownContainerCollections.appendChild(createCollElem);

    if (searchValue) {
      mentionedCollArray.forEach((collection) => {
        if (collection.name.toLowerCase().includes(searchValue)) {
          dropdownContainerCollections.style.display = "block";
          const item = document.createElement("div");
          item.className = "ct-dropdown-item";
          item.innerHTML = `<div class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="h-4 w-4 text-gray-500" style="width: 16px;"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"></path></svg><span class="ml-3 truncate text-sm">${collection.name}</span></div>`;
          item.onclick = async function () {
            await addColl(collection);
            selectedCollectionId = collection.id; // Store the ID in the global variable when clicked
            dropdownContainerCollections.style.display = "none";
          };
          dropdownContainerCollections.appendChild(item);
        }
      });
    }
  }

  async function createNewCollection(name) {
    const userData = await chrome?.storage?.sync.get(["userData"]);
    const authorId = userData?.userData?.userId;
    const sessionToken = userData?.userData?.token;
    const apiUrl = userData?.userData?.apiUrl;

    const url = `${apiUrl}/api/collections`;
    const payload = {
      data: {
        name: name,
        author: authorId,
      },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      fetch(`${apiUrl}/api/gamification-score?module=gem`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      selectedCollectionId = data?.data?.id;
      const orgGemData = await fetchHighlightGem(gemId);
      const updatedPayload = {
        data: {
          title: orgGemData?.title,
          description: orgGemData?.description,
          media_type: orgGemData?.media_type,
          author: orgGemData?.author?.data?.id,
          url: orgGemData?.url,
          metaData: {
            icon: orgGemData?.metaData?.icon,
            covers: orgGemData?.metaData?.covers,
            docImages: orgGemData?.metaData?.docImages,
            defaultIcon: orgGemData?.metaData?.defaultIcon,
            defaultThumbnail: orgGemData?.metaData?.defaultThumbnail,
            type: orgGemData?.media_type,
            title: orgGemData?.title,
            url: orgGemData?.url,
          },
          collection_gems: selectedCollectionId,
          remarks: orgGemData?.remarks,
          tags: orgGemData?.tags?.data,
          is_favourite: orgGemData?.is_favourite,
          custom_fields_obj: orgGemData?.custom_fields_obj || [],
          media: {
            _id: orgGemData?.media?._id,
            box: orgGemData?.media?.box || "",
            link: orgGemData?.media?.link,
            tags: orgGemData?.media?.tags,
            text: orgGemData?.media?.text,
            type: orgGemData?.media?.type,
            color: orgGemData?.media?.color,
            notes: orgGemData?.media?.notes,
            details: orgGemData?.media?.details || "",
            heading: orgGemData?.media?.heading,
            expander: orgGemData?.media?.expander,
            collections: selectedCollectionId,
            showThumbnail: orgGemData?.media?.showThumbnail,
            styleClassName: orgGemData?.media?.styleClassName,
          },
          isPublicPrompt: orgGemData?.isPublicPrompt,
          expander: orgGemData?.expander,
        },
      };
      const updatedGemData = await updateHighlightGem(updatedPayload, gemId);
      const customCollectionsContainer = box.querySelector(
        ".custom-collections-container"
      );
      customCollectionsContainer.style.display = "none";
    } catch (error) {
      console.error("Error during the API call:", error);
    }
  }

  // Example usage of modifyCollArray
  // This could be called whenever you need to add new users to mentionedTagsArray
  fetchUserCollections().then((collInfo) => {
    const collArray = collInfo?.map((coll) => ({
      name: coll.name,
      id: coll.id,
    }));
    modifyCollArray(collArray);
  });

  // Ensure the rest of your component setup remains as is

  searchInputCollections.oninput = updateDropdownItemsColl; // Use oninput for immediate response

  // Function to add tag

  async function addColl(collection) {
    const userData = await chrome?.storage?.sync.get(["userData"]);
    const authorId = userData?.userData?.userId;
    const sessionToken = userData?.userData?.token;
    const apiUrl = userData?.userData?.apiUrl;
    const url = `${apiUrl}/api/collections`;
    const payload = {
      data: {
        name: collection.name,
        author: authorId,
      },
    };
    selectedCollectionId = collection.id;
    const orgGemData = await fetchHighlightGem(gemId);
    const updatedPayload = {
      data: {
        title: orgGemData?.title,
        description: orgGemData?.description,
        media_type: orgGemData?.media_type,
        author: orgGemData?.author?.data?.id,
        url: orgGemData?.url,
        metaData: {
          icon: orgGemData?.metaData?.icon,
          covers: orgGemData?.metaData?.covers,
          docImages: orgGemData?.metaData?.docImages,
          defaultIcon: orgGemData?.metaData?.defaultIcon,
          defaultThumbnail: orgGemData?.metaData?.defaultThumbnail,
          type: orgGemData?.media_type,
          title: orgGemData?.title,
          url: orgGemData?.url,
        },
        collection_gems: selectedCollectionId,
        remarks: orgGemData?.remarks,
        tags: orgGemData?.tags?.data,
        is_favourite: orgGemData?.is_favourite,
        custom_fields_obj: orgGemData?.custom_fields_obj || [],
        media: {
          _id: orgGemData?.media?._id,
          box: orgGemData?.media?.box || "",
          link: orgGemData?.media?.link,
          tags: orgGemData?.media?.tags,
          text: orgGemData?.media?.text,
          type: orgGemData?.media?.type,
          color: orgGemData?.media?.color,
          notes: orgGemData?.media?.notes,
          details: orgGemData?.media?.details || "",
          heading: orgGemData?.media?.heading,
          expander: orgGemData?.media?.expander,
          collections: selectedCollectionId,
          showThumbnail: orgGemData?.media?.showThumbnail,
          styleClassName: orgGemData?.media?.styleClassName,
        },
        isPublicPrompt: orgGemData?.isPublicPrompt,
        expander: orgGemData?.expander,
      },
    };
    const updatedGemData = await updateHighlightGem(updatedPayload, gemId);
    const customCollectionsContainer = box.querySelector(
      ".custom-collections-container"
    );
    customCollectionsContainer.style.display = "none";
    searchInput.value = "";
    updateDropdownItemsColl();
  }

  allUserColls.forEach((collection) => addColl(collection));

  searchInputCollections.onkeyup = updateDropdownItemsColl;
  updateDropdownItemsColl();

  async function recordScreen() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: "screen",
        },
      });

      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const tracks = [
        ...screenStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ];
      const combinedStream = new MediaStream(tracks);

      const data = [];
      const mediaRecorder = new MediaRecorder(combinedStream);

      mediaRecorder.ondataavailable = (e) => {
        data.push(e.data);
      };

      mediaRecorder.start();

      // When the screen sharing is stopped by the user
      screenStream.getVideoTracks()[0].onended = () => {
        // Stop the media recorder
        mediaRecorder.stop();
        // Stop all audio tracks
        audioStream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.onstop = async () => {
        const recordedVideo = box.querySelector("video.recordedVideo");
        const blobData = new Blob(data, { type: data[0].type });
        const fileName = createUniqueFileName();
        const file = new File([blobData], `${fileName}.mp4`, {
          type: blobData.type,
          lastModified: new Date(),
        });
        const resp = await uploadFile(file);
        screenRecordUrlData = resp;
        recordedVideo.src = screenRecordUrlData;
        recordedVideo.style.display = "block";
      };
    } catch (error) {
      console.error("Error capturing screen and audio", error);
    }
  }

  const recordAudio = async () => {
    let tmpPlayerWrap = box.querySelector(".player-wrap");
    const ripple = box.querySelector("span.ct-ripple");
    ripple.style.animation = "ripple-animation 600ms linear infinite";
    let playerWrap;
    if (tmpPlayerWrap) {
      playerWrap = tmpPlayerWrap;
    } else {
      playerWrap = document.createElement("div");
    }
    playerWrap.style.cssText =
      "width: 100%;display: flex;flex-direction: column;gap: 10px;";
    playerWrap.className = "player-wrap";
    playerWrap.innerHTML = `
    <div class="audio-controls" style="display: none; justify-content: space-between; border-width: 1px; width: auto; background-color: white; border-color: #ABB7C9; border-radius: 0.25rem; padding: 0.25rem; align-items: center; gap: 0.5rem;">
        <button class="btn-toggle-pause" style="border-width: 1px;background-color: #1D4ED8;color: white;border-color: #1D4ED8;padding: 0.25rem;border-radius: 50%;outline: 2px solid transparent;outline-offset: 2px;width: 35px;height: 35px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.25 4C3.25 3.58579 3.58579 3.25 4 3.25H20C20.4142 3.25 20.75 3.58579 20.75 4V20C20.75 20.4142 20.4142 20.75 20 20.75H4C3.58579 20.75 3.25 20.4142 3.25 20V4Z" fill="#FFFFFF"></path>
            </svg>
        </button>
        <div id="audiowave" style="width: 100%;"></div>
    </div>
    `;
    if (!tmpPlayerWrap) {
      box.querySelector(".recordedAudioWrapper").appendChild(playerWrap);
    }
    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true, // Specify audio to capture microphone input
    });

    const data = [];
    const mediaRecorder = new MediaRecorder(stream);

    // Collect audio data chunks
    mediaRecorder.ondataavailable = (e) => {
      data.push(e.data);
    };

    mediaRecorder.start();

    const stopButton = box.querySelector("#stopRecordButton");
    const playButton = box.querySelector("#playRecordButton");
    if (stopButton) {
      playButton.style.display = "none";
      stopButton.style.display = "block";
    }

    // const stopButton = box.querySelector("#audioIconContainer");
    // if (stopButton) {
    //   stopButton.querySelector("img").src = "https://d3jrelxj5ogq5g.cloudfront.net/icons/stop-svgrepo-com_gyvesv.svg";
    //   stopButton.querySelector("img").style.maxWidth = "42px";
    // }

    // Stop recording when the button is clicked
    stopButton.onclick = () => {
      mediaRecorder.stop(); // Stop recording
      // Stop all tracks on the stream to stop the recording indicator
      stream.getTracks().forEach((track) => track.stop());
      stopButton.style.display = "none"; // Hide the stop button
      const ripple = box.querySelector("span.ct-ripple");
      ripple.style.animation = "none";
      const recordedAudioWrapper = box.querySelector(".recordedAudioWrapper");
      recordedAudioWrapper.style.display = "none";
    };

    // Handle the stop event
    mediaRecorder.onstop = async (e) => {
      const blobData = new Blob(data, { type: data[0].type });
      // const blobDataUrl = URL.createObjectURL(blobData);
      const fileName = createUniqueFileName();
      const file = new File([blobData], `${fileName}.mp3`, {
        type: blobData.type,
        lastModified: new Date(),
      });
      const resp = await uploadFile(file);
      audioRecordUrlData = resp;
      const fileObj = {
        fileType: "audio",
        fileUrl: audioRecordUrlData,
        fileName: fileName,
      };
      const fileUploadPreview = showFileUploadPreview(fileObj);
      const filePreview = box.querySelector(".filePreview");
      filePreview.appendChild(fileUploadPreview);
      attachedFiles.push(fileObj);
    };
  };

  replyInput.addEventListener("keyup", (e) => {
    // Do not execute this logic if one of the navigation keys is pressed
    if (!["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) {
      let inputText = replyInput.value;
      let lastAtPos = inputText.lastIndexOf("@");

      if (lastAtPos === -1 || inputText.charAt(lastAtPos + 1) === " ") {
        userSuggestions.style.display = "none";
        userSuggestions.innerHTML = "";
        return;
      }

      let postAtString = inputText.substring(lastAtPos + 1);

      if (!postAtString.includes(" ")) {
        let currentToken = postAtString.split(" ")[0];
        let filteredUsers = mentionedUsersArray.filter((user) =>
          user.toLowerCase().startsWith(currentToken.toLowerCase())
        );

        userSuggestions.innerHTML = ""; // Clear current suggestions

        if (filteredUsers.length) {
          filteredUsers.forEach((user, index) => {
            let div = document.createElement("div");
            div.textContent = user;
            div.onclick = function () {
              replyInput.value =
                inputText.substring(0, lastAtPos + 1) + user + " ";
              userSuggestions.style.display = "none";
              userSuggestions.innerHTML = "";
            };

            // Highlight the first suggestion as active
            if (index === 0) {
              div.classList.add("ct-active");
            }

            userSuggestions.appendChild(div);
          });
          userSuggestions.style.display = "block";
        } else {
          userSuggestions.style.display = "none";
        }
      } else {
        userSuggestions.style.display = "none";
        userSuggestions.innerHTML = "";
      }
    }
  });

  replyInput.addEventListener("keydown", (e) => {
    let active = userSuggestions.querySelector(".ct-active");
    let divs = [...userSuggestions.getElementsByTagName("div")];

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (active && active.nextElementSibling) {
          active.classList.remove("ct-active");
          active.nextElementSibling.classList.add("ct-active");
          scrollToActiveItem(active.nextElementSibling);
        } else if (!active && divs.length > 0) {
          divs[0].classList.add("ct-active");
          scrollToActiveItem(divs[0]);
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (active && active.previousElementSibling) {
          active.classList.remove("ct-active");
          active.previousElementSibling.classList.add("ct-active");
          scrollToActiveItem(active.previousElementSibling);
        }
        break;

      case "Enter":
        e.preventDefault();
        if (active) {
          active.click();
        }
        break;
    }
  });

  function scrollToActiveItem(activeItem) {
    // Check if the active item is fully visible in the dropdown
    const isVisible =
      activeItem.offsetTop >= userSuggestions.scrollTop &&
      activeItem.offsetTop + activeItem.offsetHeight <=
        userSuggestions.scrollTop + userSuggestions.offsetHeight;

    if (!isVisible) {
      // Scrolls the active item into view with smooth scrolling
      activeItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  document.body.appendChild(box);
  commentCounter++;
}

chrome.runtime.onMessage.addListener(async (msg, sender, cb) => {
  try {
    if (typeof msg === "object" && msg.type === "OPEN_ASK_AI_POPUP" && msg.aiMessage) {
      window.openAskAiPopup(msg.aiMessage);
      return
    }
    if (typeof msg === "object" && msg.type === "CT_REMOVE_TAB_LISTEN_SIDEPANEL" && msg.tabId && iframe) {
      iframe.contentWindow.postMessage(JSON.stringify({ type: "CT_REMOVE_TAB_LISTEN", tabId: msg.tabId }), chrome.runtime.getURL("index.html"));
    }
    if (typeof msg === "object" && msg.id === "GET_IMPORT_TYPE") {
      if (cb) {
        cb(sidePanelImportType);
      }
    }
    if (typeof msg === "object" && msg.type === "COPY_TAB_LINKS_TEXT") {
      window.copyAllTabLinksText(msg.copyLinkText)
    }
    if (typeof msg === "object" && msg.type === "DOWNLOAD_HTML") {
      window.downloadCurrentHtml()
    }
    if (typeof msg === "object" && msg.type === "GET_TAB_DETAILS") {
      if (cb) {
        cb(window.getCurrentTab());
      }
    }
    if (typeof msg === "object" && msg.type === "FETCH_URL_AGAIN") {
      chrome.storage.sync.remove("gemId");
      checkURL();
    }
    if (typeof msg === "object" && msg.typw === "FETCH_FAVICON") {
      if (cb) {
        cb(await window.getFavIconURL(msg.url));
      }
    }
    if (typeof msg === "object" && msg.type === "CT_SYNC_DATA" && msg.data) {
      await window.syncWithCurrentBrowser(msg.data);
      if (cb) {
        cb();
      }
      return;
    }
    if (typeof msg === "object" && msg.type === "CT_SAVE_TAB_DETAILS") {
      if (cb) {
        const images = document.querySelectorAll("img");
        const description = document.querySelector(
          "meta[name='description']"
        )?.content;
        const imgArr = [];
        Array.from(images).forEach((i) => {
          if (i.width > 200 && i.height > 200) {
            imgArr.push(i.src);
          }
        });
        cb({
          images:
            imgArr.length === 0 && images.length !== 0
              ? [Array.from(images)[0].src]
              : imgArr,
          description,
        });
      }
    }
    if (typeof msg === "string" && msg === "CT_SHOW_CAPTURE_IMAGE_LOADER") {
      window.showCTLoader();
    }
    if (typeof msg === "string" && msg === "CT_HIDE_CAPTURE_IMAGE_LOADER") {
      window.hideCTLoader();
    }
    if (
      typeof msg === "object" &&
      (msg.type === "USER_LOGIN" || msg.type === "CHECK_GEM_URL")
    ) {
      checkURL();
    }
    if (typeof msg === "object" && msg.type === "ADD_FLOATING_COMMENT") {
      createFloatingCommentV2(true);
    }
    if (msg === "toggle") {
      window.panelToggle();
    }
    if (msg === "open-bookmark") {
      window.panelToggle("?add-bookmark", true);
    }
    if (typeof msg === "object" && msg.type === "CT_CLOSE_PANEL" && iframe) {
      const sidebarType = window.localStorage.getItem("CT_SIDEBAR_VIEW_TYPE");
      if (sidebarType === "pinned") {
        chrome?.storage?.sync.get(["userData"], function (text) {
          if (
            text &&
            text.userData &&
            text.userData.apiUrl &&
            text.userData.token
          ) {
            iframe.style.width = "50px";
            iframe.style.display = "block";
            iframe.style.height = "100%";
            iframe.contentWindow.postMessage(
              "SHOW_MENU",
              chrome.runtime.getURL("index.html")
            );
          }
        });
      } else {
        iframe.style.display = "none";
        iframe.style.width = "470px";
      }
    }
    if (typeof msg === "object" && msg.type === "GET_CURRENT_IFRMAE_WIDTH") {
      if (cb) {
        cb(iframe.style.width);
      }
    }
    if (typeof msg === "object" && msg.type === "CT_RENDER_LOADER") {
      renderLoader();
    }
    if (
      typeof msg === "object" &&
      msg.type === "COPY_TEXT" &&
      msg.copyImgText
    ) {
      window.navigator.clipboard.writeText(msg.copyImgText);
    }
    if (
      typeof msg === "object" &&
      msg.type === "CT_HIGHLIGHT_DATA" &&
      msg.value
    ) {
      window.localStorage.setItem("CT_HIGHLIGHT_DATA", msg.value);
      window.highlightPage();
    }
    if (typeof msg === "object" && msg.type === "READER_VIEW" && msg.value) {
      iframe.style.display = "none";
      logoBookmarkButtonWrapper.style.display = "none";
      window.showReader();
      const saveBtn = document.querySelector(".imageSave-button");
      const optContainer = document.querySelector(".ct-option-container");
      if (saveBtn === null || optContainer === null) {
        window.setupImageElements();
      }
    }
    if (typeof msg === "object" && msg.id === "CT_OPEN_WINDOW" && msg.tabURLs) {
      msg.tabURLs.forEach((t) => {
        window.open(t, "_blank");
      });
      if (msg.isCloseExt) {
        iframe.style.display = "none";
      }
    }
    if (
      typeof msg === "object" &&
      msg.id === "UPDATE_THEME" &&
      msg.type === "CT_DARK_THEME"
    ) {
      window.localStorage.setItem("CT_THEME", "CT_DARK_THEME");
    } else if (
      typeof msg === "object" &&
      msg.id === "UPDATE_THEME" &&
      msg.type === "CT_LIGHT_THEME"
    ) {
      window.localStorage.setItem("CT_THEME", "CT_LIGHT_THEME");
    }

    if (
      typeof msg === "object" &&
      msg.id === "UPDATE_THEME" &&
      window.setTheme
    ) {
      window.setTheme();
    }

    if (
      typeof msg === "object" &&
      msg.type === "UPDATE_IMAGE_INFO" &&
      msg.imageDetails
    ) {
      window.imageDetails = msg.imageDetails;
    }

    if (typeof msg === "object" && msg.type === "CT_PANEL_COLLAPSE" && iframe) {
      window.localStorage.setItem("CT_PANEL_COLLAPSE_EXPAND", "collapse");
      const sidebarType = window.localStorage.getItem("CT_SIDEBAR_VIEW_TYPE");
      if (sidebarType === "pinned") {
        iframe.style.height = "100%";
        iframe.style.width = "50px";
        iframe.style.display = "block";
        iframe.contentWindow.postMessage(
          "SHOW_MENU",
          chrome.runtime.getURL("index.html")
        );
      } else {
        iframe.style.height = "100%";
        iframe.style.width = "50px";
      }
    }
    if (typeof msg === "object" && msg.type === "CT_PANEL_EXPAND" && iframe) {
      iframe.style.width = "470px";
      iframe.style.height = "100%";
    }
    if (
      typeof msg === "object" &&
      msg.type === "CT_SHOW_MESSAGE" &&
      msg.text &&
      msg.msgType
    ) {
      window.showMessage(msg.text, msg.msgType);
    }

    if (
      typeof msg === "object" &&
      msg.id === "UPDATE_SIDEBAR_POSITION" &&
      msg.value === "right"
    ) {
      iframe.style.left = "auto";
      iframe.style.right = "0px";
      const logoBookmarkButtonWrapper = document.body.querySelector(
        "#logoBookmarkButtonWrapper"
      );
      const divWrapperCurateit = document.body.querySelector(
        "#divWrapperCurateit"
      );

      logoBookmarkButtonWrapper.style.left = "auto";
      logoBookmarkButtonWrapper.style.right = "0px";
      divWrapperCurateit.style.justifyContent = "left";
      divWrapperCurateit.style.marginRight = "-21px";
      divWrapperCurateit.style.marginLeft = "0px";
      window.localStorage.setItem("CT_SIDER_POSITION", "right");
    } else if (
      typeof msg === "object" &&
      msg.id === "UPDATE_SIDEBAR_POSITION" &&
      msg.value === "left"
    ) {
      iframe.style.right = "auto";
      iframe.style.left = "0px";
      const logoBookmarkButtonWrapper = document.body.querySelector(
        "#logoBookmarkButtonWrapper"
      );
      const divWrapperCurateit = document.body.querySelector(
        "#divWrapperCurateit"
      );

      logoBookmarkButtonWrapper.style.left = "0px";
      logoBookmarkButtonWrapper.style.right = "auto";
      divWrapperCurateit.style.justifyContent = "right";
      divWrapperCurateit.style.marginRight = "0px";
      divWrapperCurateit.style.marginLeft = "-21px";
      window.localStorage.setItem("CT_SIDER_POSITION", "left");
    }

    if (
      typeof msg === "object" &&
      msg.id === "ENABLE_FLOAT_MENU" &&
      msg.value
    ) {
      window.localStorage.setItem("CT_ENABLE_FLOAT_MENU", msg.value);
      // window.localStorage.setItem("CT_ENABLE_FLOAT_CODE_MENU", msg.value);
      // window.localStorage.setItem("CT_ENABLE_FLOAT_IMAGE_MENU", msg.value);
      window.enableFloatMenu();
      // window.fetchAndCreateCodeButton();
      // if (msg.value === "SHOW") {
      //   window.showSaveImageIcon();
      // } else {
      //   window.removeSaveImageIcons();
      // }
    }

    if (
      typeof msg === "object" &&
      msg.type === "LOGOUT_EXPAND_IFRAME" &&
      iframe
    ) {
      chrome.runtime.sendMessage(
        { message: "default-icon" },
        function (response) {}
      );
      if (iframe.width < 100) {
        iframe.style.width = "470px";
        iframe.style.height = "100%";
      }
    }

    if (
      typeof msg === "object" &&
      msg.type === "CT_OPEN_SIDEBAR_APP" &&
      iframe
    ) {
      window.open(msg.url, "_self");
    }

    if (typeof msg === "object" && msg.type === "CAPTURE_SCREENSHOT") {
      iframe.style.display = "none";
      iframe.style.width = "470px";
      logoBookmarkButtonWrapper.style.display = "none";
      window.showScreenshotArea();
    }

    if (typeof msg === "object" && msg.type === "CAPTURE_FULLPAGE_SCREENSHOT") {
      window.takeFullPageScreenshotv2();
    }

    if (
      typeof msg === "object" &&
      msg.id === "ENABLE_FLOAT_IMAGE_MENU" &&
      msg.value
    ) {
      window.localStorage.setItem("CT_ENABLE_FLOAT_IMAGE_MENU", msg.value);
      if (msg.value === "SHOW") {
        window.showSaveImageIcon();
      } else {
        window.removeSaveImageIcons();
      }
    }

    if (
      typeof msg === "object" &&
      msg.id === "ENABLE_FLOAT_CODE_MENU" &&
      msg.value
    ) {
      window.localStorage.setItem("CT_ENABLE_FLOAT_CODE_MENU", msg.value);
      window.fetchAndCreateCodeButton();
    }

    if (
      typeof msg === "object" &&
      msg.id === "SIDEBAR_VIEW_TYPE" &&
      msg.value &&
      iframe
    ) {
      window.localStorage.setItem("CT_SIDEBAR_VIEW_TYPE", msg.value);
      if (iframe.style.width !== "470px" && msg.value === "pinned") {
        iframe.style.width = "50px";
        iframe.style.display = "block";
        iframe.style.height = "100%";
        iframe.contentWindow.postMessage(
          "SHOW_MENU",
          chrome.runtime.getURL("index.html")
        );
      }
    }

    if (
      typeof msg === "object" &&
      msg.id === "IMPORT_SOCIAL_POSTS" &&
      msg.value
    ) {
      //Check current active tab url
      const currentUrl = window.location.href;
      chrome.runtime.sendMessage({ request: "close-extension" });
      if (
        currentUrl.includes("https://twitter.com") ||
        currentUrl.includes("https://www.twitter.com") ||
        currentUrl.includes("https://www.x.com") ||
        currentUrl.includes("https://x.com")
      ) {
        window.grabTwitterPosts(msg.value);
      } else if (
        currentUrl.includes("https://linkedin.com") ||
        currentUrl.includes("https://www.linkedin.com")
      ) {
        window.grabLinkedInLikes(msg.value);
      } else if (
        currentUrl.includes("https://medium.com") ||
        currentUrl.includes("https://www.medium.com") ||
        currentUrl.includes(".medium.com")
      ) {
        window.grabMediumLists(msg.value);
      } else if (
        currentUrl.includes("https://reddit.com") ||
        currentUrl.includes("https://www.reddit.com")
      ) {
        window.grabRedditStars(msg.value);
      } else if (
        currentUrl.includes("https://github.com") ||
        currentUrl.includes("https://www.github.com")
      ) {
        window.grabGitStars(msg.value);
      } else if (
        currentUrl.includes("https://read.amazon.in") ||
        currentUrl.includes("https://read.amazon.com")
      ) {
        window.importKindleHighlights(msg.value);
      } else if (
        currentUrl.includes("https://www.goodreads.com/") ||
        currentUrl.includes("https://goodreads.com/") ||
        currentUrl.includes("goodreads.com")
      ) {
        window.grabAllGoodReadsReviews(msg.value);
      }
    }
    if (
      typeof msg === "object" &&
      msg.id === "CT_SET_SHORT_LINKS" &&
      msg.links
    ) {
      chrome.storage.local.set({ CT_SHORT_LINKS: msg.links });
    }
    if (
      typeof msg === "object" &&
      msg.action === "insertFormData" &&
      msg.data
    ) {
    }

    //Get amazon item image url
    if (typeof msg === "object" && msg.type === "GET_AMAZON_ITEM_URL") {
      const imageContainer =
        document.getElementById("imgTagWrapperId") ||
        document.getElementById("ebooksImageBlockContainer");
      const imgUrl = imageContainer.getElementsByTagName("img")[0].src;
      let priceSymbol = "$";
      let wholePrice = "";
      let fractions = "";
      const corePriceDiv =
        document.getElementById("corePrice_feature_div") ||
        document.querySelector("div[id^='corePrice']");
      const fallbackPriceDiv = document.querySelector(
        "span[id^='tp_price_block_total_price']"
      );
      if (corePriceDiv) {
        priceSymbol =
          corePriceDiv.querySelector(".a-price-symbol")?.textContent ||
          document
            .querySelector("div[id^='tp-tool-tip-price-block']")
            ?.querySelector(".a-price-symbol")?.textContent ||
          "$";
        wholePrice =
          corePriceDiv.querySelector(".a-price-whole")?.textContent ||
          fallbackPriceDiv?.querySelector(".a-price-whole")?.textContent ||
          "";
        fractions =
          corePriceDiv.querySelector(".a-price-fraction")?.textContent ||
          fallbackPriceDiv?.querySelector(".a-price-fraction")?.textContent ||
          "";
      }
      cb({ imgUrl, priceSymbol, price: `${wholePrice}${fractions}` });
    }

    if (typeof msg === "object" && msg.id === "CAPTURE_VISIBLE_TAB") {
      let captureTime = null;
      window.panelToggle();
      if (captureTime) {
        clearTimeout(captureTime);
      }
      captureTime = setTimeout(() => {
        window.captureVisibleTab(msg.tabId);
      }, 500);
    }

    if (typeof msg === "object" && msg.id === "CAPTURE_SELECTION") {
      let captureTime = null;
      window.panelToggle();
      if (captureTime) {
        clearTimeout(captureTime);
      }
      captureTime = setTimeout(() => {
        window.captureSelection(msg.tabId);
      }, 500);
    }

    if (typeof msg === "object" && msg.id === "CAPTURE_FULL_PAGE") {
      let captureTime = null;
      window.panelToggle();
      if (captureTime) {
        clearTimeout(captureTime);
      }
      captureTime = setTimeout(() => {
        window.captureFullPage(msg.tabId);
      }, 500);
    }

    if (
      typeof msg === "object" &&
      msg.type === "SHOW_TUTORIAL_MODAL" &&
      msg.userConfig
    ) {
      window.panelToggle();
      window.showTutorialModal(msg.userConfig);
    }

    if (
      typeof msg === "object" &&
      msg.type === "SET_CT_COOKIE" &&
      msg.cookieObj &&
      msg.webappURL
    ) {
      window.openWebappWithNewCred(msg.cookieObj, msg.webappURL);
    }
    if (
      typeof msg === "object" &&
      msg.type === "SET_CT_COOKIE_REGISTER" &&
      msg.cookieObj &&
      msg.webappURL
    ) {
      window.openWebappWithNewCred(msg.cookieObj, msg.webappURL,true);
    }

    if (
      typeof msg === "object" &&
      msg.type === "CT_UPDATE_RECENT_URL_DETAILS"
    ) {
      window.updateRecentURLDetails();
    }

    if (
      typeof msg === "object" &&
      msg.type === "SCREENSHOT_VIEW" &&
      msg.value
    ) {
      window.panelToggle();
      window.showScreenshotView(msg.tabId);
    }

    if (typeof msg === "object" && msg.type === "CT_OPEN_PROPER_PAGE") {
      window.openProperTypePage();
    }
  } catch (e) {
    console.log("Error on message", e);
  }

  if (cb) cb();
});

const position = window.localStorage.getItem("CT_SIDER_POSITION") || "right";
const sidebarType = window.localStorage.getItem("CT_SIDEBAR_VIEW_TYPE");

iframe.id = "curateit-iframe";
iframe.style.height = "100%";
iframe.style.width = "470px";
iframe.style.display = "none";
iframe.style.position = "fixed";
iframe.style.top = "0px";
iframe.style.right = position === "right" ? "0px" : "auto";
iframe.style.left = position === "left" ? "0px" : "auto";
iframe.style.zIndex = "9000000000000000000";
iframe.style.outline = "1px solid lightgrey";
iframe.style.border = "0px";
iframe.allow = "microphone";
// iframe.sandbox = "allow-same-origin"
// iframe.sandbox = "allow-scripts allow-same-origin allow-modals allow-forms allow-popups allow-popups-to-escape-sandbox"
iframe.src = chrome.runtime.getURL("index.html");

snackbar.classList.add("ct-snackbar");
document.body.appendChild(iframe);
document.body.appendChild(snackbar);

// document?.addEventListener("click", (event) => {
//   if (event.target.id === "injected-button") return;
//   const iframe = document.getElementById("curateit-iframe"); // Ensure your iframe has a specific ID
//   if (iframe) {
//     // Capture the click coordinates
//     const coords = { x: event.pageX, y: event.pageY };
//     iframe.contentWindow.postMessage({ type: "mouseClick", coords }, "*"); // Adjust target origin as needed for security
//   }
// });

window.showMessage = (message, type) => {
  snackbar.innerHTML = `<div class="${type}"></div>${message}`;
  snackbar.classList.add("ct-show");
  setTimeout(() => {
    snackbar.classList.remove("ct-show");
  }, 3000);
};

window.panelToggle = (url, isOpen, isProfileImport = false) => {
  if (isProfileImport) {
    sidePanelImportType = "PROFILE";
  } else {
    sidePanelImportType = "POSTS";
  }
  let keywords = [];
  const keywordElems = document.querySelector("meta[name='keywords']");
  const keywordContent = keywordElems
    ? keywordElems.getAttribute("content")
    : null;

  if (keywordContent && keywordContent.length > 0) {
    keywords = keywordElems.getAttribute("content").split(",");
  } else {
    const bodyElement = document.querySelector("body");
    const allWords = bodyElement.outerText
      .toLowerCase()
      .replace(/[^A-Za-z]/gm, " ")
      .split(/\s+/gm);
    const wordsObj = {};
    allWords
      .filter((o) => {
        return o !== "";
      })
      .forEach((w) => {
        if (wordsObj[w]) {
          wordsObj[w]++;
        } else if (w.length > 5) {
          wordsObj[w] = 1;
        }
      });
    const sortedValues = Object.values(wordsObj).sort((a, b) => b - a);
    const maxN = sortedValues[5 - 1];
    const fiveHighest = Object.entries(wordsObj).reduce(
      (wordsObj, [k, v]) => (v >= maxN ? { ...wordsObj, [k]: v } : wordsObj),
      {}
    );
    keywords = Object.keys(fiveHighest).map((o) => {
      return o;
    });
  }
  chrome.storage.sync.set({
    CT_INITIAL_DATA: {
      CT_KEYWORDS: keywords,
      CT_URL: window.location.href,
      CT_TITLE: document.title,
      CT_IMAGES: document.images,
    },
  });
  chrome.storage.local.set({
    CT_IMAGE_DATA: {
      CT_IMAGE_SRC: Array.from(document.images)?.map((img) => {
        return img.src;
      }),
    },
  });
  // iframe.contentWindow.currentKeywordList = keywordsStr

  if (url) {
    // if (iframe.style.width === "0px") {
    //     iframe.src = `${chrome.runtime.getURL("index.html")}${url}`
    // }
    // else {
    // }
    console.log("URL", iframe, iframe.contentWindow);
    iframe.contentWindow.postMessage(url, chrome.runtime.getURL("index.html"));
    // iframe.src = `${chrome.runtime.getURL("index.html")}${url}`
  }

  if (isOpen) {
    const sidebarType = window.localStorage.getItem("CT_SIDEBAR_VIEW_TYPE");
    if (sidebarType === "pinned") {
      iframe.style.display = "block";
      iframe.style.width = "470px";
      iframe.contentWindow.postMessage(
        "HIDE_MENU",
        chrome.runtime.getURL("index.html")
      );
    } else {
      iframe.style.display = "block";
      iframe.style.width = "470px";
    }
  } else {
    if (iframe.style.display === "none") {
      iframe.style.display = "block";
      // iframe.style.top = "0px";
    } else {
      iframe.style.display = "none";
    }
    // if(iframe.style.width == "0px"){
    //     iframe.style.width="470px";
    // }
    // else {
    //     iframe.style.width="0px";
    // }
  }
};

divCurateitLogo.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg" title="Save Image">
            <g clip-path="url(#clip0_2856_47919)">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M166.673 98.3454C170.875 101.082 174.304 103.316 178.341 106.189C184.635 110.63 188.692 115.428 190.487 119.709C191.512 122.295 192.026 125.056 191.999 127.839C191.998 131.26 191.308 134.647 189.971 137.794C189.056 140.143 187.681 142.284 185.926 144.09C184.171 145.895 182.072 147.329 179.755 148.304C177.893 149.021 175.897 149.317 173.908 149.172C171.92 149.027 169.987 148.444 168.248 147.466C166.427 146.507 164.829 145.173 163.558 143.55C162.286 141.928 161.371 140.055 160.872 138.053C160.171 135.24 160.798 127.407 164.683 127.728C166.904 127.91 167.485 130.135 167.924 131.816C168.048 132.293 168.161 132.727 168.297 133.057C169.785 136.696 173.141 137.041 175.096 135.709C178.021 133.723 176.927 129.886 176.177 128.492C174.53 125.433 171.444 122.953 165.986 119.857C163.53 118.521 160.968 117.391 158.327 116.477L158.131 116.403C156.545 115.823 154.873 115.268 153.213 114.75L151.185 114.096C151.143 116.85 151.287 119.603 151.615 122.337C152.63 130.292 155.771 137.156 157.563 141.073C158.072 142.185 158.472 143.059 158.684 143.654C161.487 151.524 161.966 156.113 161.487 161.048C160.946 166.797 158.106 176.184 149.402 180.231C146.461 181.727 143.22 182.537 139.922 182.599C136.624 182.661 133.355 181.974 130.36 180.588C123.906 177.504 122.049 173.927 120.218 168.992C119.307 166.604 118.914 164.049 119.064 161.496C119.215 158.944 119.905 156.453 121.091 154.189C122.966 150.896 126.057 148.477 129.696 147.453C134.158 146.207 137.33 148.453 137.441 150.698C137.515 152.24 135.498 154.51 134.773 155.262C133.04 157.076 131.601 163.49 135.498 165.958C139.199 168.277 146.243 165.711 146.968 159.469C147.78 152.536 145.235 138.411 134.859 123.879C129.24 115.748 126.178 106.115 126.069 96.2208V95.8014V95.382C126.178 85.4883 129.24 75.8545 134.859 67.7241C145.235 53.192 147.78 39.067 146.968 32.134C146.243 25.8919 139.186 23.3259 135.498 25.6452C131.601 28.0877 133.003 34.5272 134.773 36.3407C135.498 37.0932 137.515 39.3631 137.441 40.9051C137.33 43.1503 134.158 45.3831 129.696 44.1495C126.057 43.126 122.966 40.7064 121.091 37.4139C119.905 35.1502 119.215 32.6591 119.064 30.1066C118.914 27.554 119.307 24.9986 120.218 22.6104C122.049 17.6883 123.893 14.0984 130.36 11.0144C133.355 9.62921 136.624 8.94189 139.922 9.00385C143.22 9.0658 146.461 9.87541 149.402 11.3721C158.106 15.4184 160.946 24.8063 161.487 30.555C161.966 35.4648 161.487 40.0662 158.684 47.9491C158.471 48.5712 158.048 49.5008 157.507 50.6885C155.711 54.6357 152.617 61.4334 151.615 69.2661C151.287 72.0001 151.143 74.7533 151.185 77.5067L153.213 76.8529C154.824 76.3348 156.496 75.7797 158.131 75.1999L158.327 75.1258C160.968 74.2118 163.53 73.0813 165.986 71.7457C171.444 68.674 174.53 66.1944 176.177 63.1103C176.927 61.7163 178.021 57.8798 175.096 55.8936C173.141 54.5613 169.785 54.9191 168.297 58.5459C168.161 58.8761 168.048 59.3095 167.924 59.7868C167.485 61.4674 166.904 63.6926 164.683 63.8752C160.798 64.1959 160.171 56.3624 160.872 53.5497C161.371 51.5478 162.286 49.6744 163.558 48.0523C164.829 46.4302 166.427 45.096 168.248 44.1372C169.987 43.1585 171.92 42.576 173.908 42.4311C175.897 42.2861 177.893 42.5822 179.755 43.2983C182.072 44.2742 184.171 45.7074 185.926 47.513C187.681 49.3185 189.056 51.4595 189.971 53.8088C191.308 56.9563 191.998 60.3425 191.999 63.7642C192.025 66.5468 191.511 69.3079 190.487 71.8938C188.692 76.2238 184.635 81.0473 178.341 85.4636C173.726 88.6934 169.915 91.1847 164.819 94.5157C164.173 94.9379 163.506 95.3736 162.814 95.8261C164.187 96.7259 165.462 97.5566 166.673 98.3454ZM118.804 123.274C120.07 123.916 120.771 124.483 120.931 125.026C121.002 126.036 120.71 127.039 120.107 127.851C106.867 151.228 79.8213 163.86 52.7757 159.259C27.021 154.904 5.88856 133.637 1.41375 107.558C0.980679 105.044 0.703622 102.441 0.434041 99.9086L0.39339 99.5269L0.393384 99.5268C0.270451 98.2932 0.147519 97.0596 0 95.826C0.0758392 81.7211 4.75234 68.029 13.3147 56.8429C21.877 45.6567 33.8541 37.5918 47.4151 33.881C60.9762 30.1701 75.3751 31.0175 88.4109 36.2936C101.447 41.5696 112.402 50.9841 119.603 63.0979C120.685 64.825 121.066 66.071 120.832 66.7988C120.599 67.5266 119.652 68.2545 117.943 69.0317C108.551 73.2753 99.5892 72.5228 90.5412 66.7494C76.3423 57.6823 56.3409 58.3485 42.9902 68.3162C31.4958 76.9145 26.6399 88.3379 28.9756 101.353C31.5204 115.576 40.7774 125.334 55.7385 129.59C68.6712 133.254 80.5589 131.638 91.0452 124.767C100.056 118.858 109.141 118.34 118.804 123.274ZM70.4661 107.126H73.9451C75.2297 107.126 76.4617 107.638 77.3701 108.55C78.2784 109.461 78.7887 110.698 78.7887 111.987C78.7887 113.276 78.2784 114.512 77.3701 115.424C76.4617 116.335 75.2297 116.847 73.9451 116.847H70.4661C69.1815 116.847 67.9495 116.335 67.0411 115.424C66.1327 114.512 65.6224 113.276 65.6224 111.987C65.6224 110.698 66.1327 109.461 67.0411 108.55C67.9495 107.638 69.1815 107.126 70.4661 107.126ZM73.9451 74.7803H70.4661C69.1815 74.7803 67.9495 75.2924 67.0411 76.2039C66.1327 77.1154 65.6224 78.3517 65.6224 79.6408C65.6224 80.9299 66.1327 82.1662 67.0411 83.0777C67.9495 83.9892 69.1815 84.5013 70.4661 84.5013H73.9451C75.2297 84.5013 76.4617 83.9892 77.3701 83.0777C78.2784 82.1662 78.7887 80.9299 78.7887 79.6408C78.7887 78.3517 78.2784 77.1154 77.3701 76.2039C76.4617 75.2924 75.2297 74.7803 73.9451 74.7803Z" fill="#105FD3"/>
            </g>
            <defs>
            <clipPath id="clip0_2856_47919">
            <rect width="192" height="192" fill="white"/>
            </clipPath>
            </defs>
        </svg>
`;
bookmarkButton.innerHTML = `
<svg style="width:20px;height:20px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
</svg>
`;
// dragHandle.innerHTML = `
//   <svg style="width:20px;height:20px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//     <path d="M8.5 7C9.32843 7 10 6.32843 10 5.5C10 4.67157 9.32843 4 8.5 4C7.67157 4 7 4.67157 7 5.5C7 6.32843 7.67157 7 8.5 7ZM8.5 13.5C9.32843 13.5 10 12.8284 10 12C10 11.1716 9.32843 10.5 8.5 10.5C7.67157 10.5 7 11.1716 7 12C7 12.8284 7.67157 13.5 8.5 13.5ZM10 18.5C10 19.3284 9.32843 20 8.5 20C7.67157 20 7 19.3284 7 18.5C7 17.6716 7.67157 17 8.5 17C9.32843 17 10 17.6716 10 18.5ZM15.5 7C16.3284 7 17 6.32843 17 5.5C17 4.67157 16.3284 4 15.5 4C14.6716 4 14 4.67157 14 5.5C14 6.32843 14.6716 7 15.5 7ZM17 12C17 12.8284 16.3284 13.5 15.5 13.5C14.6716 13.5 14 12.8284 14 12C14 11.1716 14.6716 10.5 15.5 10.5C16.3284 10.5 17 11.1716 17 12ZM15.5 20C16.3284 20 17 19.3284 17 18.5C17 17.6716 16.3284 17 15.5 17C14.6716 17 14 17.6716 14 18.5C14 19.3284 14.67157 20 15.5 20Z">
//     </path>
// </svg>`;
//more buttons
ssButton.innerHTML = `
<svg style="width:20px;height:20px;" title='Screenshot' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3H5V5H3V3ZM7 3H9V5H7V3ZM11 3H13V5H11V3ZM15 3H17V5H15V3ZM19 3H21V5H19V3ZM19 7H21V9H19V7ZM3 19H5V21H3V19ZM3 15H5V17H3V15ZM3 11H5V13H3V11ZM3 7H5V9H3V7ZM10.6667 11L11.7031 9.4453C11.8886 9.1671 12.2008 9 12.5352 9H15.4648C15.7992 9 16.1114 9.1671 16.2969 9.4453L17.3333 11H20C20.5523 11 21 11.4477 21 12V20C21 20.5523 20.5523 21 20 21H8C7.44772 21 7 20.5523 7 20V12C7 11.4477 7.44772 11 8 11H10.6667ZM9 19H19V13H16.263L14.9296 11H13.0704L11.737 13H9V19ZM14 18C12.8954 18 12 17.1046 12 16C12 14.8954 12.8954 14 14 14C15.1046 14 16 14.8954 16 16C16 17.1046 15.1046 18 14 18Z"></path></svg>
`;
ssButton.style.width = "20px";

tabsButton.innerHTML = `
<svg style="width:20px;height:20px;" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.12" d="M2 5.86602C2 4.74591 2 4.18586 2.21799 3.75803C2.40973 3.38171 2.71569 3.07575 3.09202 2.884C3.51984 2.66602 4.0799 2.66602 5.2 2.66602H10.8C11.9201 2.66602 12.4802 2.66602 12.908 2.884C13.2843 3.07575 13.5903 3.38171 13.782 3.75803C14 4.18586 14 4.74591 14 5.86602V6.66602H2V5.86602Z" fill="#062046" stroke="#062046" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 7.66602V5.86602C14 4.74591 14 4.18586 13.782 3.75803C13.5903 3.38171 13.2843 3.07575 12.908 2.884C12.4802 2.66602 11.9201 2.66602 10.8 2.66602H5.2C4.0799 2.66602 3.51984 2.66602 3.09202 2.884C2.71569 3.07575 2.40973 3.38171 2.21799 3.75803C2 4.18586 2 4.74591 2 5.86602V11.466C2 12.5861 2 13.1462 2.21799 13.574C2.40973 13.9503 2.71569 14.2563 3.09202 14.448C3.51984 14.666 4.0799 14.666 5.2 14.666H8.33333M14 6.66602H2M12 13.9993V9.99935M10 11.9993H14" stroke="#062046" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="4.66667" cy="4.66667" r="0.666667" fill="#062046"/>
<circle cx="6.66667" cy="4.66667" r="0.666667" fill="#062046"/>
<ellipse cx="8.66667" cy="4.66667" rx="0.666667" ry="0.666667" fill="#062046"/>
</svg>

`;
tabsButton.style.width = "20px";

infoButton.innerHTML = `
<svg style="width:20px;height:20px;" title='Information' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
</svg>

`;
infoButton.style.width = "20px";

stickyButton.innerHTML = `
<svg style="width:20px;height:20px;" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M13.5 10.5V4.5H9.75V10.5L11.625 9.375L13.5 10.5Z" fill="#4B4F5D"/>
  <path d="M15 1.5H3C2.175 1.5 1.5 2.175 1.5 3V16.5L4.5 13.5H15C15.825 13.5 16.5 12.825 16.5 12V3C16.5 2.175 15.825 1.5 15 1.5ZM15 12H4.5L3 13.5V3H15V12Z" fill="#4B4F5D" title='Sticky notes'/>
</svg>
`;
stickyButton.style.width = "20px";

turnOffButton.innerHTML = `
<svg style="width:20px;height:20px;" title='Turn off sidebar' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M9.375 10V3.75C9.375 3.58424 9.44085 3.42527 9.55806 3.30806C9.67527 3.19085 9.83424 3.125 10 3.125C10.1658 3.125 10.3247 3.19085 10.4419 3.30806C10.5592 3.42527 10.625 3.58424 10.625 3.75V10C10.625 10.1658 10.5592 10.3247 10.4419 10.4419C10.3247 10.5592 10.1658 10.625 10 10.625C9.83424 10.625 9.67527 10.5592 9.55806 10.4419C9.44085 10.3247 9.375 10.1658 9.375 10ZM14.0914 3.85156C13.9526 3.76383 13.7848 3.73425 13.6244 3.76922C13.4639 3.80419 13.3237 3.9009 13.234 4.03844C13.1443 4.17599 13.1123 4.34331 13.145 4.50424C13.1777 4.66516 13.2724 4.80677 13.4086 4.89844C15.2141 6.07578 16.25 7.93516 16.25 10C16.25 11.6576 15.5915 13.2473 14.4194 14.4194C13.2473 15.5915 11.6576 16.25 10 16.25C8.3424 16.25 6.75269 15.5915 5.58058 14.4194C4.40848 13.2473 3.75 11.6576 3.75 10C3.75 7.93516 4.78594 6.07578 6.59141 4.89844C6.72765 4.80677 6.82234 4.66516 6.85502 4.50424C6.88769 4.34331 6.85571 4.17599 6.766 4.03844C6.67629 3.9009 6.53606 3.80419 6.37561 3.76922C6.21517 3.73425 6.0474 3.76383 5.90859 3.85156C3.74219 5.26406 2.5 7.50469 2.5 10C2.5 11.9891 3.29018 13.8968 4.6967 15.3033C6.10322 16.7098 8.01088 17.5 10 17.5C11.9891 17.5 13.8968 16.7098 15.3033 15.3033C16.7098 13.8968 17.5 11.9891 17.5 10C17.5 7.50469 16.2578 5.26406 14.0914 3.85156Z" fill="#C85C54"/>
</svg>
`;

turnOffButton.style.width = "20px";

readerViewButton.innerHTML = `
<svg style="width:20px;height:20px;" title='Reader view' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
</svg>

`;
readerViewButton.style.width = "20px";

divCurateitLogo.style.display = "flex";
divCurateitLogo.style.alignItems = "center";
divCurateitLogo.style.justifyContent = "center";

bookmarkButton.classList.add("bookmark-btn");
divCurateitLogo.classList.add("divCurateitLogo");
dragHandle.classList.add("dragHandle");
moreButtonWrapper.classList.add("more-btn-wrapper");

const positionSider =
  window.localStorage.getItem("CT_SIDER_POSITION") || "right";

divWrapperCurateit.classList.add("divWrapperCurateit");
logoBookmarkButtonWrapper.style.right =
  positionSider === "right" ? "0px" : "auto";
divWrapperCurateit.style.justifyContent =
  positionSider === "right" ? "left" : "right";
divWrapperCurateit.style.marginRight =
  positionSider === "right" ? "-21px" : "0px";
divWrapperCurateit.style.marginLeft =
  positionSider === "right" ? "0px" : "-21px";

divCurateitLogo?.addEventListener("mousedown", function (e) {
  e.preventDefault();
  e.stopPropagation();
  isDragging = true;
  offsetY = e.clientY - logoBookmarkButtonWrapper.getBoundingClientRect().top;
});

window?.addEventListener("mouseup", function () {
  isDragging = false;
});

window?.addEventListener("mousemove", function (e) {
  mousePageX = e.pageX;
  mousePageY = e.pageY;
  if (!isDragging) return;
  let y = e.clientY - offsetY;
  logoBookmarkButtonWrapper.style.top = y + "px";
  window.localStorage.setItem("CT_SIDER_POSITION_Y", y);
});

divCurateitLogo?.addEventListener("click", async function (event) {
  chrome?.storage?.sync.get(["gemId"], function (text) {
    if (text && text?.gemId && text?.gemId?.gemId) {
      chrome.storage.sync.set({
        editGemData: { gemId: text?.gemId?.gemId },
      });
      window.panelToggle(`?open-edit-bookmark`, true);
    } else {
      chrome.storage.sync.set({
        editGemData: null,
      });
      showSidePanel();
    }
  });
});

const showSidePanel = async (type = "") => {
  try {
    if (type === "checkLogin") {
      const data = await new Promise((resolve, reject) => {
        chrome.storage.sync.get(["userData"], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      });

      if (data?.userData?.token || data?.userData?.userData?.token) {
        chrome?.storage?.sync.get(["gemId"], function (text) {
          if (text && text?.gemId && text?.gemId?.gemId) {
            chrome.storage.sync.set({
              editGemData: { gemId: text?.gemId?.gemId },
            });
            window.panelToggle(`?open-edit-bookmark`, true);
          } else {
            chrome.storage.sync.set({
              editGemData: null,
            });
            const platformsArray = [
              "Twitter",
              "LinkedIn",
              "Reddit",
              "Medium",
              "Github",
              "Instagram",
              "Youtube",
            ];
            const normalizedUrl = window.location.href.toLowerCase();

            const foundPlatform = platformsArray.find((platform) =>
              normalizedUrl.includes(platform.toLowerCase())
            );
            const profileBtnFound = checkImportProfilePresence();
            if (profileBtnFound && foundPlatform) {
              if (foundPlatform === "Twitter") {
                window.TwitterProfile(false);
                showSaveCollectionUI("Profile", foundPlatform);
              } else if (foundPlatform === "Github") {
                window.GithubProfile(
                  data?.userData || data?.userData?.userData,
                  false
                );
                showSaveCollectionUI("Profile", foundPlatform);
              } else if (foundPlatform === "Instagram") {
                window.InstagramProfile(
                  data?.userData || data?.userData?.userData,
                  false
                );
                showSaveCollectionUI("Profile", foundPlatform);
              } else if (foundPlatform === "Reddit") {
                window.RedditProfile(
                  data?.userData || data?.userData?.userData,
                  false
                );
                showSaveCollectionUI("Profile", foundPlatform);
              } else if (foundPlatform === "LinkedIn") {
                window.LinkedInProfile(false);
                showSaveCollectionUI("Profile", foundPlatform);
              } else if (foundPlatform === "Medium") {
                window.MediumProfile(false);
                showSaveCollectionUI("Profile", foundPlatform);
              } else if (
                foundPlatform === "Youtube" &&
                !window.location.href.startsWith(
                  "https://www.youtube.com/watch"
                )
              ) {
                window.YoutubeProfile(false);
                showSaveCollectionUI("Profile", foundPlatform);
              } else {
                // window.panelToggle("?add-bookmark", true);
                showSaveCollectionUI();
              }
            } else {
              // window.panelToggle("?add-bookmark", true);
              showSaveCollectionUI();
            }
          }
        });
        return;
      } else {
        iframe.style.display = "block";
        iframe.style.width = "470px";
        iframe.style.height = "100%";
        window.panelToggle(`?open-extension`, true);
        // iframe.contentWindow.postMessage(
        //   "HIDE_MENU",
        //   chrome.runtime.getURL("index.html")
        // );
        return;
      }
    }

    // const data = await new Promise((resolve, reject) => {
    //     chrome.storage.sync.get(["userData"], (result) => {
    //         if (chrome.runtime.lastError) {
    //             reject(chrome.runtime.lastError);
    //         } else {
    //             resolve(result);
    //         }
    //     });
    // });

    // if (data?.userData?.token) {
    let keywords = [];
    const keywordElems = document.querySelector("meta[name='keywords']");
    const keywordContent = keywordElems
      ? keywordElems.getAttribute("content")
      : null;

    if (keywordContent && keywordContent.length > 0) {
      keywords = keywordElems.getAttribute("content").split(",");
    } else {
      const bodyElement = document.querySelector("body");
      const allWords = bodyElement.outerText
        .toLowerCase()
        .replace(/[^A-Za-z]/gm, " ")
        .split(/\s+/gm);
      const wordsObj = {};
      allWords
        .filter((o) => {
          return o !== "";
        })
        .forEach((w) => {
          if (wordsObj[w]) {
            wordsObj[w]++;
          } else if (w.length > 5) {
            wordsObj[w] = 1;
          }
        });
      const sortedValues = Object.values(wordsObj).sort((a, b) => b - a);
      const maxN = sortedValues[5 - 1];
      const fiveHighest = Object.entries(wordsObj).reduce(
        (wordsObj, [k, v]) => (v >= maxN ? { ...wordsObj, [k]: v } : wordsObj),
        {}
      );
      keywords = Object.keys(fiveHighest).map((o) => {
        return o;
      });
    }
    chrome.storage.sync.set({
      CT_INITIAL_DATA: {
        CT_KEYWORDS: keywords,
        CT_URL: window.location.href,
        CT_TITLE: document.title,
        CT_IMAGES: document.images,
      },
    });

    chrome.storage.local.set({
      CT_IMAGE_DATA: {
        CT_IMAGE_SRC: Array.from(document.images)?.map((img) => {
          return img.src;
        }),
      },
    });

    window.panelToggle("?open-extension", true);
    // window.openProperTypePage()
    // iframe.style.width = "50px";
    // iframe.style.display = "block";
    // iframe.style.height = "100%"
    // iframe.contentWindow.postMessage('SHOW_MENU', chrome.runtime.getURL("index.html"))
    // } else {
    //     window.panelToggle(`?open-extension`, true)
    // window.alert('Please logged in into curateit!')
    // }
  } catch (error) {
    console.error(error);
  }
};

const fetchSeoOverviewData = () => {
  const metaTags = document.querySelectorAll("meta");
  const metaDetails = {};

  const countWordsInNode = (node) => {
    // Skip certain elements that don't contribute to main content
    const tagName = node.nodeName.toLowerCase();
    const tagsToIgnore = ["script", "style"];
    if (tagsToIgnore.includes(tagName)) {
      return 0;
    }

    let wordCount = 0;
    if (node.nodeType === 3) {
      // Node type 3 is a text node
      const text = node.nodeValue;
      wordCount = text.trim().split(/\s+/).filter(Boolean).length; // Split text into words, filter out empty strings
    }

    node.childNodes.forEach((child) => {
      wordCount += countWordsInNode(child);
    });

    return wordCount;
  };

  for (let i = 0; i < metaTags?.length; i++) {
    const tag = metaTags[i];
    if (tag.getAttribute("name") || tag.getAttribute("property")) {
      const nameValue =
        tag.getAttribute("name") || tag.getAttribute("property");
      const contentValue = tag.getAttribute("content");
      metaDetails[`name="${nameValue}"`] = contentValue;
    }
  }

  const headings = ["h1", "h2", "h3", "h4", "h5", "h6"].reduce((acc, tag) => {
    acc[tag] = document.querySelectorAll(tag).length;
    return acc;
  }, {});

  const imagesWithSrc = document.querySelectorAll("img[src]")?.length;
  const anchorsWithHref = document.querySelectorAll("a[href]")?.length;
  const words = countWordsInNode(document.body);
  const lang = document.querySelector("html[lang]")?.getAttribute("lang");
  const canonical = document
    .querySelector("link[rel='canonical']")
    ?.getAttribute("href");

  chrome.storage.local.set({
    CT_SEO_OVERVIEW: {
      metaDetails: metaDetails,
      headings: headings,
      imagesWithSrc: imagesWithSrc,
      anchorsWithHref: anchorsWithHref,
      words: words,
      lang: lang,
      canonical: canonical,
    },
  });
};
fetchSeoOverviewData();

const fetchSeoHeadingsData = () => {
  const headingsList = [];
  // Query all headings at once to maintain their order in the DOM
  const headingElements = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  headingElements.forEach((heading) => {
    headingsList.push({
      level: heading.tagName.toLowerCase(), // h1, h2, etc.
      text: heading.textContent.trim(),
    });
  });

  // Object to hold counts of each heading type
  const headings = ["h1", "h2", "h3", "h4", "h5", "h6"].reduce((acc, tag) => {
    acc[tag] = document.querySelectorAll(tag).length;
    return acc;
  }, {});

  const imagesWithSrc = document.querySelectorAll("img[src]")?.length;
  const anchorsWithHref = document.querySelectorAll("a[href]")?.length;
  chrome.storage.local.set({
    CT_SEO_HEADINGS: {
      headings: headings,
      imagesWithSrc: imagesWithSrc,
      anchorsWithHref: anchorsWithHref,
      headingsList: headingsList,
    },
  });
};
fetchSeoHeadingsData();

const fetchSeoLinksData = () => {
  const linkElements = document.querySelectorAll("a");
  let internalLinksTemp = [];
  let externalLinksTemp = [];

  const extractDomain = (url) => {
    const urlObj = new URL(url);
    return urlObj.protocol + "//" + urlObj.hostname;
  };

  const pageDomain = extractDomain(window.location.href);

  linkElements.forEach((link) => {
    let href = link.getAttribute("href");
    const text = link?.textContent.trim();
    if (href) {
      if (href.startsWith("/")) {
        href = `${pageDomain}${href}`;
      }
      const linkInfo = { url: href, anchorText: text };
      // Use a simplified check since we've normalized hrefs
      if (href.startsWith(pageDomain)) {
        internalLinksTemp.push(linkInfo);
      } else {
        externalLinksTemp.push(linkInfo);
      }
    }
  });
  chrome.storage.local.set({
    CT_SEO_LINKS: {
      linkElements: linkElements?.length,
      uniqueLinks: new Set(linkElements).size,
      internalLinksTemp: internalLinksTemp,
      externalLinksTemp: externalLinksTemp,
    },
  });
};
fetchSeoLinksData();

const fetchSeoImagesData = () => {
  const imageElements = document.querySelectorAll("img");
  const extractDomain = (url) => {
    const urlObj = new URL(url);
    return urlObj.protocol + "//" + urlObj.hostname;
  };

  const domain = extractDomain(window.location.href);
  const fetchedImages = [];
  let withoutAltCount = 0;
  let withoutTitleCount = 0;

  imageElements.forEach((img) => {
    let src = img?.getAttribute("src"); // Use getAttribute to ensure we get the exact value
    if (src?.startsWith("//")) {
      src = "https:" + src; // Prepend domain if src starts with "/"
    }
    if (src?.startsWith("/") && !src?.startsWith("//")) {
      src = domain + src; // Prepend domain if src starts with "/"
    }
    fetchedImages.push({
      src,
      alt: img.alt || "",
      title: img.title || "",
    }); // Store object with src, alt, and title
    if (!img.alt) withoutAltCount++;
    if (!img.title) withoutTitleCount++;
  });

  chrome.storage.local.set({
    CT_SEO_IMAGES: {
      fetchedImages: fetchedImages,
      withoutAltCount: withoutAltCount,
      withoutTitleCount: withoutTitleCount,
    },
  });
};
fetchSeoImagesData();

const fetchSeoSchemaData = () => {
  const scriptElements = document.querySelectorAll(
    "script[type='application/ld+json']"
  );
  let scriptsData = {};
  scriptElements.forEach((element, index) => {
    const parsedContent = JSON.parse(
      JSON.stringify(element.textContent) || "{}"
    );
    if (Array.isArray(parsedContent)) {
      parsedContent.forEach((content, arrayIndex) => {
        scriptsData[`script${index + 1}_${arrayIndex + 1}`] = content;
      });
    } else {
      scriptsData[`script${index + 1}`] = parsedContent;
    }
  });
  chrome.storage.local.set({
    CT_SEO_SCHEMA: {
      scriptElement: scriptsData,
    },
  });
};
fetchSeoSchemaData();

function seoFunctions() {
  fetchSeoOverviewData();
  fetchSeoHeadingsData();
  fetchSeoLinksData();
  fetchSeoImagesData();
  fetchSeoSchemaData();
  fetchSeoSocialsData();
  window.chrome.storage.local.remove("aiData");
  const ctSummary = window.localStorage.getItem("ctSummary");
  if (ctSummary) {
    window.localStorage.removeItem("ctSummary");
    window.chrome.storage.local.remove("aiData");
    window.chrome.storage.local.set({
      aiData: {
        text: ctSummary,
      },
    });
    window.panelToggle(`?add-ai`, true);
  }
}

// Call SEO functions on page load
window.onload = seoFunctions;

// Setup an event listener for when the tab's visibility changes
document?.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    seoFunctions();
  }
});

const fetchSeoSocialsData = () => {
  const ogMetaList = [];
  const twitterMetaList = [];
  // Query all OG and Twitter meta at once to maintain their order in the DOM
  const ogMetaElements = document.querySelectorAll(
    'meta[property^="og:"], meta[name^="og:"]'
  );
  const ogTwitterElements = document.querySelectorAll('meta[name^="twitter:"]');
  ogMetaElements.forEach((ogMeta) => {
    ogMetaList.push({
      property: ogMeta.getAttribute("property") || ogMeta.getAttribute("name"),
      content: ogMeta.getAttribute("content"),
    });
  });
  ogTwitterElements.forEach((ogTwitter) => {
    twitterMetaList.push({
      name: ogTwitter.getAttribute("name"),
      content: ogTwitter.getAttribute("content"),
    });
  });

  chrome.storage.local.set({
    CT_SEO_SOCIALS: {
      ogMetaList: ogMetaList,
      twitterMetaList: twitterMetaList,
    },
  });
};
fetchSeoSocialsData();

function clearHideTimer() {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

function hideButtons() {
  divWrapperCurateit.style.borderLeft = "none";
  divWrapperCurateit.style.borderRight = "none";
  bookmarkButton.style.display = "none";
  moreButtonWrapper.style.display = "none";
}

logoBookmarkButtonWrapper.classList.add("logoBookmarkButtonWrapperClass");
logoBookmarkButtonWrapper?.addEventListener("mouseover", function (event) {
  clearHideTimer();
  event.stopPropagation();
  const position = window.localStorage.getItem("CT_SIDER_POSITION") || "right";
  divWrapperCurateit.style.borderLeft =
    position === "right" ? "6px solid #105FD3" : "none";
  divWrapperCurateit.style.borderRight =
    position === "left" ? "6px solid #105FD3" : "none";
  divWrapperCurateit.style.justifyContent =
    position === "right" ? "left" : "right";
  divWrapperCurateit.style.marginRight = position === "right" ? "-21px" : "0px";
  divWrapperCurateit.style.marginLeft = position === "right" ? "0px" : "-21px";
  bookmarkButton.style.display = "flex";
  // dragHandle.style.display = "flex";
  moreButtonWrapper.style.display = "flex";

  if (position === "right") {
    // divCurateitLogo.style.marginRight = "5px";
    divWrapperCurateit.style.marginRight = '-21px'
    divWrapperCurateit.style.marginLeft = "0px";
    divCurateitLogo.style.marginLeft = "0px";
    divCurateitLogo.style.height = "20px";
    bookmarkButton.style.marginLeft = "0px";
    moreButtonWrapper.style.marginLeft = "0px";
    divWrapperCurateit.append(divCurateitLogo);
  } else {
    divWrapperCurateit.style.marginLeft = "-21px";
    divWrapperCurateit.style.marginRight = "0px";
    divCurateitLogo.style.marginRight = "0px";
    // divCurateitLogo.style.marginLeft = "5px";
    divCurateitLogo.style.height = "20px";
    bookmarkButton.style.marginLeft = "5px";
    moreButtonWrapper.style.marginLeft = "5px";
    divWrapperCurateit.append(divCurateitLogo);
  }
});

divWrapperCurateit?.addEventListener("mouseover", function (event) {
  hideTimer = setTimeout(function () {
    if (!logoBookmarkButtonWrapper.matches(":hover")) {
      hideButtons();
    }
  }, 500);
  moreButtonWrapper.style.display = "flex";
  bookmarkButton.style.display = "flex";
});

bookmarkButton?.addEventListener("mouseover", function (event) {
  clearHideTimer();
  event.stopPropagation();
  this.style.display = "flex";
  this.style.backgroundColor = "#576BFF";
  this.style.color = "white";
  moreButtonWrapper.style.display = "flex";
});

moreButtonWrapper.addEventListener("mouseover", function (event) {
  clearHideTimer();
  event.stopPropagation();
  this.style.display = "flex";
  bookmarkButton.style.display = "flex";
});

logoBookmarkButtonWrapper?.addEventListener("mouseleave", function (event) {
  hideTimer = setTimeout(function () {
    if (!logoBookmarkButtonWrapper.matches(":hover")) {
      hideButtons();
    }
  }, 500);
  event.stopPropagation();
  divWrapperCurateit.style.borderLeft = "none";
  divWrapperCurateit.style.borderRight = "none";
  // dragHandle.style.display = "none";
  // const position = window.localStorage.getItem("CT_SIDER_POSITION") || "right";
  if (position === "left") {
    bookmarkButton.style.marginLeft = "5px";
    moreButtonWrapper.style.marginLeft = "5px";
  }
});

bookmarkButton?.addEventListener("mouseleave", function (event) {
  hideTimer = setTimeout(function () {
    if (!logoBookmarkButtonWrapper.matches(":hover")) {
      hideButtons();
    }
  }, 500);
  event.stopPropagation();
  // bookmarkButton.style.display = "none";
  this.style.backgroundColor = "white";
  this.style.color = "black";
});

moreButtonWrapper?.addEventListener("mouseleave", function (event) {
  hideTimer = setTimeout(function () {
    if (!logoBookmarkButtonWrapper.matches(":hover")) {
      hideButtons();
    }
  }, 500);
});

if (positionSider === "right") {
  divWrapperCurateit.style.marginRight = "-21px";
  divWrapperCurateit.style.marginLeft = "0px";
  // divCurateitLogo.style.marginRight = "5px";
  divCurateitLogo.style.marginLeft = "0px";
  divCurateitLogo.style.height = "20px";
  bookmarkButton.style.marginLeft = "0px";
  moreButtonWrapper.style.marginLeft = "0px";
  divWrapperCurateit.append(divCurateitLogo);
} else {
  divWrapperCurateit.style.marginRight = "0px";
  divCurateitLogo.style.marginRight = "-21px";
  // divCurateitLogo.style.marginLeft = "5px";
  divCurateitLogo.style.height = "20px";
  bookmarkButton.style.marginLeft = "5px";
  moreButtonWrapper.style.marginLeft = "5px";
  divWrapperCurateit.append(divCurateitLogo);
}

//bookmarkButton
bookmarkButton?.addEventListener("click", async function (e) {
  showSidePanel("checkLogin");
});

//buttons eventlistener
ssButton.addEventListener("click", async function () {
  showSidePanelForMoreButton("screenshot");
});

tabsButton.addEventListener("click", async function () {
  showSidePanelForMoreButton("tabs");
});

infoButton.addEventListener("click", async function () {
  showSidePanelForMoreButton("info");
});

turnOffButton.addEventListener("click", async function () {
  showSidePanelForMoreButton("turnOff");
});

stickyButton.addEventListener("click", async function () {
  showSidePanelForMoreButton("sticky");
});

readerViewButton.addEventListener("click", async function () {
  showSidePanelForMoreButton("readerView");
});
moreButtonWrapper.append(
  ssButton,
  tabsButton,
  infoButton,
  // dragHandle,
  // stickyButton,
  readerViewButton,
  turnOffButton
);

logoBookmarkButtonWrapper.append(
  bookmarkButton,
  divWrapperCurateit,
  moreButtonWrapper
);
document.body.appendChild(logoBookmarkButtonWrapper);

iframe?.addEventListener("mouseout", (event) => {
  event.stopPropagation();
  const position = window.localStorage.getItem("CT_SIDER_POSITION") || "right";
  const sidebarType = window.localStorage.getItem("CT_SIDEBAR_VIEW_TYPE");
  if (sidebarType === "pinned") return false;

  const mouseX = event.clientX;

  const screenWidth = window.innerWidth;
  const edgeDistance = 50;

  if (position === "left" && iframe.offsetWidth <= 50) {
    iframe.style.width = "470px";
    iframe.style.display = "none";
    iframe.style.height = "100%";
    iframe.contentWindow.postMessage(
      "HIDE_MENU",
      chrome.runtime.getURL("index.html")
    );
    return;
  }

  if (
    position === "right" &&
    iframe.offsetWidth <= 50 &&
    mouseX < screenWidth - edgeDistance
  ) {
    iframe.style.width = "470px";
    iframe.style.display = "none";
    iframe.style.height = "100%";
    iframe.contentWindow.postMessage(
      "HIDE_MENU",
      chrome.runtime.getURL("index.html")
    );
    return;
  }
});

async function checkUserLogin() {
  try {
    const data = await new Promise((resolve, reject) => {
      chrome.storage.sync.get(["userData"], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });
    return data;
  } catch (error) {
    console.error(error);
  }
}
async function checkURL() {
  const data = await checkUserLogin();
  const url = window.location.href;

  if (data?.userData?.token || data?.userData?.userData?.token) {
    fetch(`${data.userData.apiUrl}/api/fetch-bookmarks?url=${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          data.userData.token || data?.userData?.userData?.token
        }`,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((res) => {
        if (res) {
          if (res?.blockedSite === true) {
            isBlockedSite = true;
            window.localStorage.setItem("CT_ENABLE_FLOAT_MENU", "HIDE");
            window.localStorage.setItem("CT_ENABLE_FLOAT_CODE_MENU", "HIDE");
            window.localStorage.setItem("CT_ENABLE_FLOAT_IMAGE_MENU", "HIDE");
            window.enableFloatMenu();
            window.fetchAndCreateCodeButton();
            window.removeSaveImageIcons();
            const iframe = document.getElementById("curateit-iframe");
            if (iframe) {
              iframe.contentWindow.postMessage(
                "CT_HIDE_MY_HIGHLIGHT",
                chrome.runtime.getURL("index.html")
              );
            }
            window.getSelection()?.removeAllRanges();
          } else {

            // image
            if (data?.userData?.showImageMenu === 'HIDE') {
              window.localStorage.setItem("CT_ENABLE_FLOAT_IMAGE_MENU", "HIDE");
              window.removeSaveImageIcons();
            } else {
              window.localStorage.setItem("CT_ENABLE_FLOAT_IMAGE_MENU", "SHOW");
              window.removeSaveImageIcons();
            }
            // code
            if (data?.userData?.showCodeMenu === "HIDE") {
              window.localStorage.setItem("CT_ENABLE_FLOAT_CODE_MENU", "HIDE");
              window.fetchAndCreateCodeButton();
            } else {
              window.localStorage.setItem("CT_ENABLE_FLOAT_CODE_MENU", "SHOW");
              window.fetchAndCreateCodeButton();
            }
            // highlight
            if (data?.userData?.showHighlightMenu === "HIDE") {
              window.localStorage.setItem("CT_ENABLE_FLOAT_MENU", "HIDE");
              window.enableFloatMenu();
            } else {
              window.localStorage.setItem("CT_ENABLE_FLOAT_MENU", "SHOW");
              window.enableFloatMenu();
            }
            isBlockedSite = false;
          }

          if (res?.message === true) {
            chrome.runtime.sendMessage(
              { message: "change-icon" },
              function (response) {}
            );
            chrome.storage.sync.set({
              gemId: {
                gemId: res?.gemId || "",
              },
            });
            bookmarkButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22" fill="none">
            <path d="M12.9375 6.25H5.0625C4.76413 6.25 4.47798 6.36853 4.267 6.5795C4.05603 6.79048 3.9375 7.07663 3.9375 7.375V19.75C3.93755 19.8504 3.96446 19.9489 4.01545 20.0354C4.06643 20.1219 4.13963 20.1931 4.22744 20.2418C4.31525 20.2904 4.41448 20.3147 4.51483 20.312C4.61519 20.3094 4.713 20.2799 4.79812 20.2267L9 17.6005L13.2026 20.2267C13.2877 20.2797 13.3854 20.309 13.4857 20.3116C13.5859 20.3142 13.685 20.2899 13.7727 20.2412C13.8604 20.1926 13.9335 20.1214 13.9845 20.0351C14.0354 19.9487 14.0624 19.8503 14.0625 19.75V7.375C14.0625 7.07663 13.944 6.79048 13.733 6.5795C13.522 6.36853 13.2359 6.25 12.9375 6.25ZM12.9375 18.7354L9.29742 16.4608C9.20802 16.4049 9.10472 16.3753 8.9993 16.3753C8.89387 16.3753 8.79057 16.4049 8.70117 16.4608L5.0625 18.7354V7.375H12.9375V18.7354Z" fill="#323543"/>
            <path d="M15 0.9375C14.1965 0.9375 13.4111 1.17576 12.743 1.62215C12.0749 2.06855 11.5542 2.70302 11.2467 3.44535C10.9393 4.18767 10.8588 5.00451 11.0156 5.79255C11.1723 6.5806 11.5592 7.30447 12.1274 7.87262C12.6955 8.44077 13.4194 8.82769 14.2074 8.98444C14.9955 9.14119 15.8123 9.06074 16.5547 8.75326C17.297 8.44578 17.9315 7.92508 18.3778 7.257C18.8242 6.58893 19.0625 5.80349 19.0625 5C19.0614 3.92291 18.633 2.89026 17.8714 2.12863C17.1097 1.36701 16.0771 0.938637 15 0.9375ZM16.7836 4.28359L14.5961 6.47109C14.5671 6.50015 14.5326 6.5232 14.4947 6.53893C14.4567 6.55465 14.4161 6.56275 14.375 6.56275C14.3339 6.56275 14.2933 6.55465 14.2553 6.53893C14.2174 6.5232 14.1829 6.50015 14.1539 6.47109L13.2164 5.53359C13.1578 5.47496 13.1248 5.39543 13.1248 5.3125C13.1248 5.22957 13.1578 5.15004 13.2164 5.09141C13.275 5.03277 13.3546 4.99983 13.4375 4.99983C13.5204 4.99983 13.6 5.03277 13.6586 5.09141L14.375 5.8082L16.3414 3.84141C16.3704 3.81237 16.4049 3.78934 16.4428 3.77363C16.4808 3.75791 16.5214 3.74983 16.5625 3.74983C16.6036 3.74983 16.6442 3.75791 16.6822 3.77363C16.7201 3.78934 16.7546 3.81237 16.7836 3.84141C16.8126 3.87044 16.8357 3.90491 16.8514 3.94284C16.8671 3.98078 16.8752 4.02144 16.8752 4.0625C16.8752 4.10356 16.8671 4.14422 16.8514 4.18216C16.8357 4.22009 16.8126 4.25456 16.7836 4.28359Z" fill="#347AE2"/>
          </svg>
            `;
          } else {
            chrome.runtime.sendMessage(
              { message: "default-icon" },
              function (response) {}
            );
            chrome.storage.sync.set({
              gemId: {
                gemId: null,
              },
            });
            bookmarkButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
          </svg>
          `;
          }
        } else {
          chrome.runtime.sendMessage(
            { message: "default-icon" },
            function (response) {}
          );
          chrome.storage.sync.set({
            gemId: {
              gemId: null,
            },
          });
          bookmarkButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
          </svg>
          `;

          // window.localStorage.setItem("CT_ENABLE_FLOAT_MENU", "SHOW");
          // // window.localStorage.setItem("CT_ENABLE_FLOAT_CODE_MENU", "SHOW");
          // // window.localStorage.setItem("CT_ENABLE_FLOAT_IMAGE_MENU", "SHOW");
          // window.enableFloatMenu();
          // window.fetchAndCreateCodeButton();
          // window.removeSaveImageIcons();
          isBlockedSite = false;
        }
      })
      .catch((error) => {
        return;
      });
  } else {
    chrome.runtime.sendMessage({ message: "default-icon" });
  }
}
checkURL();

function checkImportProfilePresence() {
  const srcUrl =
    "https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png";
  const images = document.querySelectorAll(`img[src="${srcUrl}"]`);

  for (let img of images) {
    const nextSibling = img.nextSibling;
    if (
      nextSibling &&
      nextSibling.nodeType === Node.TEXT_NODE &&
      nextSibling.nodeValue.includes("Import Profile")
    ) {
      return true; // Found the image with the "Import Profile" text
    }
  }
  return false; // The specific image or text was not found
}

// Function to track and return mouse coordinates when type is "sticky"
function trackMouseCoordinates() {
  return new Promise((resolve) => {
    // Change cursor to "crosshair"
    document.body.style.cursor = "crosshair";

    // Function to capture and resolve click coordinates
    function logClickAndResolve(event) {
      // Get coordinates relative to the viewport
      const { clientX, clientY } = event;

      // Stop tracking and clean up
      document.body.style.cursor = "default";
      document.removeEventListener("click", logClickAndResolve);

      // Return the coordinates
      resolve({ x: clientX, y: clientY });
    }

    // Start listening for a click event to capture coordinates
    document.addEventListener("click", logClickAndResolve, { once: true });
  });
}

const showSidePanelForMoreButton = async (type = "") => {
  try {
    const data = await new Promise((resolve, reject) => {
      chrome.storage.sync.get(["userData"], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });

    if (data?.userData?.token || data?.userData?.userData?.token) {
      if (type === "screenshot") {
        chrome.runtime.sendMessage(
          { message: "getTabId" },
          function (response) {
            window.showScreenshotView(response.tabId);
          }
        );
      }

      if (type === "tabs") {
        window.panelToggle("?open-save-tabs", true);
      }

      if (type === "info") {
        window.panelToggle("?open-info", true);
      }
      if (type === "turnOff") {
        showTurnOffUI();
      }
      if (type === "sticky") {
        try {
          const coords = await trackMouseCoordinates();
          const x = coords?.x;
          const y = coords?.y;
          if (x && y) {
            createCommentOnScreenV2(x, y, "comment-", null, false, null);
          }
        } catch (error) {
          console.error("Error in sticky highlight creation:", error);
        }
      }
      if (type === "readerView") {
        iframe.style.display = "none";
        logoBookmarkButtonWrapper.style.display = "none";
        window.showReader();
        const saveBtn = document.querySelector(".imageSave-button");
        const optContainer = document.querySelector(".ct-option-container");
        if (saveBtn === null || optContainer === null) {
          window.setupImageElements();
        }
      }
    } else {
      iframe.style.display = "block";
      iframe.style.width = "470px";
      iframe.style.height = "100%";
      window.panelToggle(`?open-extension`, true);
      return;
    }
  } catch (error) {
    console.error(error);
  }
};

function showTurnOffUI() {
  const existingWrapper = document.body.querySelector(
    ".turnOffWrapperOverlayDiv"
  );
  if (existingWrapper) {
    existingWrapper.remove();
  }

  const wrapperOverlayDiv = document.createElement("div");
  wrapperOverlayDiv.className = "turnOffWrapperOverlayDiv";
  wrapperOverlayDiv.id = "turnOffWrapperOverlayDiv";

  const contentWrapperDiv = document.createElement("div");
  contentWrapperDiv.className = "contentWrapperTurnOff";

  const domainName = window.location.hostname;

  if (isBlockedSite) {
    contentWrapperDiv.innerHTML = `
    <div class="titleWrapperTurnOff">
                <div class="titleTurnOff">
                    This <span class='domainNameClass'>${domainName}</span> domain is already blocked.
                </div>
                <svg class="turnOffCancel" id='turnOff-cancel' xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                    viewBox="0 0 16 16" fill="none">
                    <path
                        d="M13.0306 11.97C13.1715 12.1109 13.2506 12.302 13.2506 12.5012C13.2506 12.7005 13.1715 12.8916 13.0306 13.0325C12.8897 13.1734 12.6986 13.2525 12.4993 13.2525C12.3001 13.2525 12.109 13.1734 11.9681 13.0325L7.99997 9.0631L4.0306 13.0312C3.8897 13.1721 3.69861 13.2513 3.49935 13.2513C3.30009 13.2513 3.10899 13.1721 2.9681 13.0312C2.8272 12.8903 2.74805 12.6992 2.74805 12.5C2.74805 12.3007 2.8272 12.1096 2.9681 11.9687L6.93747 8.0006L2.96935 4.03122C2.82845 3.89033 2.7493 3.69923 2.7493 3.49997C2.7493 3.30072 2.82845 3.10962 2.96935 2.96872C3.11024 2.82783 3.30134 2.74867 3.5006 2.74867C3.69986 2.74867 3.89095 2.82783 4.03185 2.96872L7.99997 6.9381L11.9693 2.9681C12.1102 2.8272 12.3013 2.74805 12.5006 2.74805C12.6999 2.74805 12.891 2.8272 13.0318 2.9681C13.1727 3.10899 13.2519 3.30009 13.2519 3.49935C13.2519 3.69861 13.1727 3.8897 13.0318 4.0306L9.06247 8.0006L13.0306 11.97Z"
                        fill="#343330" />
                </svg>
            </div>
            
            <div class="bottomWrapperTurnOff">Go to <span class='domainNameClass'>Settings</span> to turn it on anytime</div>
    `;
  } else {
    contentWrapperDiv.innerHTML = `
  <div class="titleWrapperTurnOff">
                <div class="titleTurnOff">
                    Turn off Curateit in-page button for <span class='domainNameClass'>${domainName}</span>
                </div>
                <svg class="turnOffCancel" id='turnOff-cancel' xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                        d="M13.0306 11.97C13.1715 12.1109 13.2506 12.302 13.2506 12.5012C13.2506 12.7005 13.1715 12.8916 13.0306 13.0325C12.8897 13.1734 12.6986 13.2525 12.4993 13.2525C12.3001 13.2525 12.109 13.1734 11.9681 13.0325L7.99997 9.0631L4.0306 13.0312C3.8897 13.1721 3.69861 13.2513 3.49935 13.2513C3.30009 13.2513 3.10899 13.1721 2.9681 13.0312C2.8272 12.8903 2.74805 12.6992 2.74805 12.5C2.74805 12.3007 2.8272 12.1096 2.9681 11.9687L6.93747 8.0006L2.96935 4.03122C2.82845 3.89033 2.7493 3.69923 2.7493 3.49997C2.7493 3.30072 2.82845 3.10962 2.96935 2.96872C3.11024 2.82783 3.30134 2.74867 3.5006 2.74867C3.69986 2.74867 3.89095 2.82783 4.03185 2.96872L7.99997 6.9381L11.9693 2.9681C12.1102 2.8272 12.3013 2.74805 12.5006 2.74805C12.6999 2.74805 12.891 2.8272 13.0318 2.9681C13.1727 3.10899 13.2519 3.30009 13.2519 3.49935C13.2519 3.69861 13.1727 3.8897 13.0318 4.0306L9.06247 8.0006L13.0306 11.97Z"
                        fill="#343330" />
                </svg>
            </div>

            <div class="buttonWrapperTunrOff" id='buttonWrapperTunrOff'>
                <div class="buttonWrapperTunrOffIn">
                    <div class="buttonTurnOffText">Always for this domain</div>
                </div>
            </div>

            <div class="onlyForText" id='onlyForText'>Only this time</div>

            <div class="bottomWrapperTurnOff">Go to <span class='domainNameClass'>Settings</span> to turn it on anytime</div>
  `;
  }
  wrapperOverlayDiv.append(contentWrapperDiv);

  document.body.append(wrapperOverlayDiv);

  document.body
    .querySelector("#turnOff-cancel")
    .addEventListener("click", function () {
      const modal = document.body.querySelector("#turnOffWrapperOverlayDiv");
      modal.remove();
    });

  document.body
    .querySelector("#buttonWrapperTunrOff")
    .addEventListener("click", async function () {
      const textDiv = document.querySelector(".buttonTurnOffText");

      // Update the text to 'Loading...'
      textDiv.textContent = "Loading...";

      // Disable the button by adding a CSS class or directly manipulating the style
      this.style.pointerEvents = "none";
      this.style.opacity = "0.6";

      const userData = await chrome?.storage?.sync.get(["userData"]);
      const sessionToken = userData?.userData?.token;
      const apiUrl = userData?.userData?.apiUrl;
      const modal = document.body.querySelector("#turnOffWrapperOverlayDiv");

      const url = `${apiUrl}/api/block-sites`;

      const payload = {
        sites: {
          domain: domainName,
          id: Date.now(),
        },
      };
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // return data;
        window.showMessage("Domain blocked successfully", "success");
        modal.remove();
        await checkURL();
      } catch (error) {
        window.showMessage("Error during the API call", "error");
        modal.remove();
      }
    });

  document.body
    .querySelector("#onlyForText")
    .addEventListener("click", async function () {
      window.localStorage.setItem("CT_ENABLE_FLOAT_MENU", "HIDE");
      window.localStorage.setItem("CT_ENABLE_FLOAT_CODE_MENU", "HIDE");
      window.localStorage.setItem("CT_ENABLE_FLOAT_IMAGE_MENU", "HIDE");
      window.enableFloatMenu();
      window.fetchAndCreateCodeButton();
      window.removeSaveImageIcons();
      const iframe = document.getElementById("curateit-iframe");
      if (iframe) {
        iframe.contentWindow.postMessage(
          "CT_HIDE_MY_HIGHLIGHT",
          chrome.runtime.getURL("index.html")
        );
      }
      window.getSelection()?.removeAllRanges();
      const modal = document.body.querySelector("#turnOffWrapperOverlayDiv");
      modal.remove();
    });
}

function classifyIMDbURL(url) {
  const parsedUrl = new URL(url);
  if (parsedUrl.hostname === "www.imdb.com") {
    if (parsedUrl.pathname.startsWith("/title")) {
      return "Movie";
    } else if (parsedUrl.pathname.startsWith("/name")) {
      return "Profile";
    }
  }
  return null;
}

async function iframelyApiCall(token, link, apiUrl) {
  try {
    const response = await fetch(`${apiUrl}/api/cache-details?url=${link}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const res = await response.json();
    return res;
  } catch (error) {
    console.log("error : ", error);
  }
}

async function saveGems(mediaType, collectionId, platform) {
  const userData = await chrome?.storage?.sync.get(["userData"]);
  const sessionToken = userData?.userData?.token;
  const apiUrl = userData?.userData?.apiUrl;
  const authorId = userData?.userData?.userId;

  if (mediaType === "Profile" && platform) {
    const socialData = await window.chrome.storage.local.get(["socialObject"]);
    if (socialData?.socialObject?.post) {
      const socialObj = socialData?.socialObject?.post;
      let payload = {
        data: {
          title: socialObj?.title,
          description: socialObj?.description,
          expander: [],
          media_type: mediaType,
          author: authorId,
          url: socialObj?.url.endsWith("/")
            ? socialObj?.url.slice(0, -1)
            : socialObj?.url,
          media: {
            covers: socialObj?.media?.covers,
          },
          metaData: {
            type: mediaType,
            title: socialObj?.title,
            icon: socialObj?.metaData?.icon || "",
            defaultIcon: socialObj?.metaData?.defaultIcon || "",
            url: socialObj?.url,
            covers: socialObj?.metaData?.covers,
            docImages: socialObj?.metaData?.docImages
              ?.filter((r) => !r.startsWith("data:"))
              ?.slice(0, 5),
            defaultThumbnail: socialObj?.metaData?.defaultThumbnail || null,
          },
          // socialfeed_obj:{
          //     imdbdetails
          // },
          platform: socialObj?.platform,
          socialfeed_obj: socialObj?.socialfeed_obj,
          collection_gems: collectionId,
          remarks: "",
          tags: [],
          is_favourite: false,
          showThumbnail: true,
        },
      };

      const url = `${apiUrl}/api/gems?populate=tags`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        window.showMessage("Bookmark created successfully", "success");
      } catch (error) {
        window.showMessage("Error during the API call", "error");
      }
      return;
    }
  }

  if (!platform && mediaType) {
    let payload = null;
    const link = window.location.href;
    const res = await iframelyApiCall(sessionToken, link, apiUrl);

    if (
      res?.data?.iframely ||
      (res?.data?.microlink && res?.data?.microlink?.status === "success")
    ) {
      const { meta, links } = res?.data?.iframely;
      const imgData =
        links?.thumbnail && links?.thumbnail?.length > 0
          ? links?.thumbnail[0]?.href
          : links?.icon && links?.icon?.length > 0
          ? links?.icon[0]?.href
          : "";
      const favIconData =
        links?.icon && links?.icon?.length > 0 ? links?.icon[0]?.href : "";

      const data = res?.data?.microlink && res?.data?.microlink?.data;

      const images2 =
        Array.from(document?.images)?.map((img) => {
          return img.src;
        }) || [];

      if (
        mediaType === "Link" ||
        mediaType === "Video" ||
        mediaType === "Profile"
      ) {
        payload = {
          data: {
            title: meta?.title || data?.title || "",
            description: meta?.description || data?.description || "",
            expander: [],
            media_type: mediaType,
            author: authorId,
            url: link,
            media: {
              covers: [imgData || data?.image?.url || ""],
              html:
                mediaType === "Video"
                  ? res?.data?.iframely?.html || null
                  : null,
            },
            metaData: {
              type: mediaType,
              title: meta?.title || data?.title || "",
              docImages: [imgData || data?.image?.url || "", ...images2]
                ?.filter((r) => !r.startsWith("data:"))
                ?.slice(0, 5),
              icon: {
                type: "image",
                icon: favIconData || data?.logo?.url || "",
              },
              url: link,
              covers: [imgData || data?.image?.url || ""],
              isYoutube: false,
              defaultIcon: favIconData || data?.logo?.url || "",
              defaultThumbnail: imgData || data?.image?.url || "",
            },
            collection_gems: collectionId,
            remarks: "",
            tags: [],
            is_favourite: false,
            showThumbnail: true,
            platform: "Imdb",
          },
        };
      }

      if (mediaType === "Movie") {
        payload = {
          data: {
            title: meta?.title || data?.title || "",
            description: meta?.description || data?.description || "",
            expander: [],
            media_type: "Movie",
            author: authorId,
            url: link,
            media: {
              covers: [imgData || data?.image?.url || ""],
              myRating: 0,
              myStatus: "to-watch",
              dateRead: new Date().toISOString().slice(0, 10),
              readStart: new Date().toISOString().slice(0, 10),
              status: "to-watch",
            },
            metaData: {
              type: "Movie",
              title: meta?.title || data?.title || "",
              docImages: [imgData || data?.image?.url || "", ...images2]
                ?.filter((r) => !r.startsWith("data:"))
                ?.slice(0, 5),
              icon: {
                type: "image",
                icon: favIconData || data?.logo?.url || "",
              },
              url: link,
              covers: [imgData || data?.image?.url || ""],
              isYoutube: false,
              defaultIcon: favIconData || data?.logo?.url || "",
              defaultThumbnail: imgData || data?.image?.url || "",
            },
            collection_gems: collectionId,
            remarks: "",
            tags: [],
            is_favourite: false,
            showThumbnail: true,
          },
        };
      }

      if (mediaType === "Product") {
        const imageContainer =
          document.getElementById("imgTagWrapperId") ||
          document.getElementById("ebooksImageBlockContainer");
        const imgUrl = imageContainer.getElementsByTagName("img")[0].src;
        let priceSymbol = "$";
        let wholePrice = "";
        let fractions = "";
        const corePriceDiv =
          document.getElementById("corePrice_feature_div") ||
          document.querySelector("div[id^='corePrice']");
        const fallbackPriceDiv = document.querySelector(
          "span[id^='tp_price_block_total_price']"
        );
        if (corePriceDiv) {
          priceSymbol =
            corePriceDiv.querySelector(".a-price-symbol")?.textContent ||
            document
              .querySelector("div[id^='tp-tool-tip-price-block']")
              ?.querySelector(".a-price-symbol")?.textContent ||
            "$";
          wholePrice =
            corePriceDiv.querySelector(".a-price-whole")?.textContent ||
            fallbackPriceDiv?.querySelector(".a-price-whole")?.textContent ||
            "";
          fractions =
            corePriceDiv.querySelector(".a-price-fraction")?.textContent ||
            fallbackPriceDiv?.querySelector(".a-price-fraction")?.textContent ||
            "";
        }

        payload = {
          data: {
            title: meta?.title || data?.title || "",
            description: meta?.description || data?.description || "",
            expander: [],
            media_type: "Product",
            author: authorId,
            url: link,
            media: {
              covers: [imgUrl || imgData || data?.image?.url || ""],
              price: `${priceSymbol}${wholePrice}${fractions}` || "",
            },
            metaData: {
              type: "Product",
              title: meta?.title || data?.title || "",
              docImages: [imgData || data?.image?.url || "", ...images2]
                ?.filter((r) => !r.startsWith("data:"))
                ?.slice(0, 5),
              icon: {
                type: "image",
                icon: favIconData || data?.logo?.url || "",
              },
              url: link,
              covers: [imgUrl || imgData || data?.image?.url || ""],
              isYoutube: false,
              defaultIcon: favIconData || data?.logo?.url || "",
              defaultThumbnail: imgData || data?.image?.url || "",
            },
            collection_gems: collectionId,
            remarks: "",
            tags: [],
            is_favourite: false,
            showThumbnail: true,
          },
        };
      }

      const url = `${apiUrl}/api/gems?populate=tags`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        window.showMessage("Bookmark created successfully", "success");
      } catch (error) {
        window.showMessage("Error during the API call", "error");
      }
    }
    return;
  }
}

async function showSaveCollectionUI(type = "Link", platform = null) {
  const existingSaveWrapperOverlay = document.body.querySelector(
    ".saveWrapperOverlay"
  );
  if (existingSaveWrapperOverlay) {
    existingSaveWrapperOverlay.remove();
  }

  //get collections
  const cData = await chrome?.storage?.local.get(["collectionData"]);
  const collectionData = cData?.collectionData?.data?.filter(
    (item) =>
      item?.name?.toLowerCase() !== "bio" &&
      item?.name?.toLowerCase() !== "bio contact"
  );
  const unfilteredCollectionId = cData?.collectionData?.unfilteredCollectionId;

  const saveWrapperOverlay = document.createElement("div");
  saveWrapperOverlay.className = "saveWrapperOverlay";
  saveWrapperOverlay.id = "saveWrapperOverlay";

  const saveCollectionWrapper = document.createElement("div");
  saveCollectionWrapper.className = "saveCollectionWrapper";
  saveCollectionWrapper.id = "saveCollectionWrapper";

  saveCollectionWrapper.innerHTML = `
  <div class="saveWrapper">
            <div id="saveProgressBarContainer">
                <div id="saveProgressBar"></div>
            </div>
            
            <div class="saveTextEditWrapper">
            <div class="savedTextWrapper">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                        <path
                            d="M18 3.375C15.1075 3.375 12.2799 4.23274 9.87479 5.83976C7.46972 7.44677 5.5952 9.73089 4.48827 12.4033C3.38134 15.0756 3.09171 18.0162 3.65602 20.8532C4.22033 23.6902 5.61323 26.2961 7.65857 28.3414C9.70391 30.3868 12.3098 31.7797 15.1468 32.344C17.9838 32.9083 20.9244 32.6187 23.5968 31.5117C26.2691 30.4048 28.5532 28.5303 30.1602 26.1252C31.7673 23.7201 32.625 20.8926 32.625 18C32.6209 14.1225 31.0788 10.4049 28.3369 7.66309C25.5951 4.92125 21.8775 3.37909 18 3.375ZM24.4209 15.4209L16.5459 23.2959C16.4415 23.4005 16.3174 23.4835 16.1808 23.5401C16.0442 23.5967 15.8978 23.6259 15.75 23.6259C15.6022 23.6259 15.4558 23.5967 15.3192 23.5401C15.1826 23.4835 15.0586 23.4005 14.9541 23.2959L11.5791 19.9209C11.368 19.7098 11.2494 19.4235 11.2494 19.125C11.2494 18.8265 11.368 18.5402 11.5791 18.3291C11.7902 18.118 12.0765 17.9994 12.375 17.9994C12.6735 17.9994 12.9598 18.118 13.1709 18.3291L15.75 20.9095L22.8291 13.8291C22.9336 13.7245 23.0577 13.6416 23.1942 13.5851C23.3308 13.5285 23.4772 13.4994 23.625 13.4994C23.7728 13.4994 23.9192 13.5285 24.0558 13.5851C24.1923 13.6416 24.3164 13.7245 24.4209 13.8291C24.5255 13.9336 24.6084 14.0577 24.6649 14.1942C24.7215 14.3308 24.7506 14.4772 24.7506 14.625C24.7506 14.7728 24.7215 14.9192 24.6649 15.0558C24.6084 15.1923 24.5255 15.3164 24.4209 15.4209Z"
                            fill="#347AE2" />
                    </svg>
                </div>
            
                <div class="savedText" id='savedText'>Saving</div>
            </div>
            <div class="pencilWrapper" id='pencilWrapper'>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                        d="M17.7586 5.73262L14.268 2.24122C14.1519 2.12511 14.0141 2.03301 13.8624 1.97018C13.7107 1.90734 13.5482 1.875 13.384 1.875C13.2198 1.875 13.0572 1.90734 12.9056 1.97018C12.7539 2.03301 12.6161 2.12511 12.5 2.24122L2.86641 11.8756C2.74983 11.9912 2.65741 12.1289 2.59451 12.2806C2.5316 12.4323 2.49948 12.595 2.50001 12.7592V16.2506C2.50001 16.5821 2.6317 16.9001 2.86612 17.1345C3.10054 17.3689 3.41849 17.5006 3.75001 17.5006H7.24141C7.40563 17.5011 7.5683 17.469 7.71999 17.4061C7.87168 17.3432 8.00935 17.2508 8.12501 17.1342L17.7586 7.50059C17.8747 7.38452 17.9668 7.2467 18.0296 7.09503C18.0925 6.94335 18.1248 6.78078 18.1248 6.61661C18.1248 6.45243 18.0925 6.28986 18.0296 6.13819C17.9668 5.98651 17.8747 5.8487 17.7586 5.73262ZM7.24141 16.2506H3.75001V12.7592L10.625 5.88419L14.1164 9.37559L7.24141 16.2506ZM15 8.49122L11.5086 5.00059L13.3836 3.12559L16.875 6.61622L15 8.49122Z"
                        fill="#74778B" />
                </svg>
            </div>
        </div>
        </div>
  `;

  saveWrapperOverlay.append(saveCollectionWrapper);
  document.body.append(saveWrapperOverlay);

  //populate options
  // const collectionDropDown = document.body.querySelector("#saveCollectionType");
  // collectionDropDown.innerHTML = "";
  // collectionData.forEach((item) => {
  //   const option = document.createElement("option");
  //   option.value = item.id;
  //   option.innerHTML = item.name;
  //   collectionDropDown.appendChild(option);
  // });
  // collectionDropDown.value = unfilteredCollectionId;

  //pouplate media options
  let mediaType = type;
  if (
    window?.location?.href?.startsWith("https://www.youtube.com/watch") ||
    window?.location?.href.startsWith("https://vimeo.com/")
  ) {
    mediaType = "Video";
  } else if (
    window?.location?.href.startsWith("https://www.amazon.in/") ||
    window?.location?.href.startsWith("https://www.amazon.com/") ||
    window?.location?.href.startsWith("https://www.amazon.co.uk/") ||
    window?.location?.href.startsWith("https://www.amazon.co.in/")
  ) {
    mediaType = "Product";
  } else if (window?.location?.href.startsWith("https://www.imdb.com/")) {
    const type = classifyIMDbURL(window?.location?.href);
    if (type === "Profile") {
      mediaType = "Profile";
    } else if (type === "Movie") {
      mediaType = "Movie";
    } else {
      mediaType = "Link";
    }
  }

  // const mediaDivWrapper = document.body.querySelector("#mediaDivWrapper");
  // if (mediaType === "Link") {
  //   mediaDivWrapper.innerHTML = `<div class="cl-label">Type</div>
  //           <div class='lng-dropdown' style="width: 100%">
  //             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" style="color: #74778B">
  //               <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
  //             </svg>
  //             <select id='saveMediaType' style="width: 100%">
  //               <option value='Link'>Link</option>
  //             </select>
  //         </div>`;
  // }
  // if (mediaType === "Video") {
  //   mediaDivWrapper.innerHTML = `<div class="cl-label">Type</div>
  //           <div class='lng-dropdown' style="width: 100%">
  //             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" style="color: #74778B">
  //               <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
  //             </svg>
  //             <select id='saveMediaType' style="width: 100%">
  //               <option value='Video'>Video</option>
  //             </select>
  //         </div>`;
  // }
  // if (mediaType === "Product") {
  //   mediaDivWrapper.innerHTML = `<div class="cl-label">Type</div>
  //           <div class='lng-dropdown' style="width: 100%">
  //             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" style="color: #74778B">
  //               <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  //             </svg>
  //             <select id='saveMediaType' style="width: 100%">
  //               <option value='Product'>Product</option>
  //             </select>
  //         </div>`;
  // }
  // if (mediaType === "Profile") {
  //   mediaDivWrapper.innerHTML = `<div class="cl-label">Type</div>
  //           <div class='lng-dropdown' style="width: 100%">
  //             <svg style="color: #74778B" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="M12 2A10.13 10.13 0 0 0 2 12a10 10 0 0 0 4 7.92V20h.1a9.7 9.7 0 0 0 11.8 0h.1v-.08A10 10 0 0 0 22 12 10.13 10.13 0 0 0 12 2zM8.07 18.93A3 3 0 0 1 11 16.57h2a3 3 0 0 1 2.93 2.36 7.75 7.75 0 0 1-7.86 0zm9.54-1.29A5 5 0 0 0 13 14.57h-2a5 5 0 0 0-4.61 3.07A8 8 0 0 1 4 12a8.1 8.1 0 0 1 8-8 8.1 8.1 0 0 1 8 8 8 8 0 0 1-2.39 5.64z"></path><path d="M12 6a3.91 3.91 0 0 0-4 4 3.91 3.91 0 0 0 4 4 3.91 3.91 0 0 0 4-4 3.91 3.91 0 0 0-4-4zm0 6a1.91 1.91 0 0 1-2-2 1.91 1.91 0 0 1 2-2 1.91 1.91 0 0 1 2 2 1.91 1.91 0 0 1-2 2z"></path></svg>
  //             <select id='saveMediaType' style="width: 100%">
  //               <option value='Profile'>Profile</option>
  //             </select>
  //         </div>`;
  // }
  // if (mediaType === "Movie") {
  //   mediaDivWrapper.innerHTML = `<div class="cl-label">Type</div>
  //           <div class='lng-dropdown' style="width: 100%">
  //             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" style="color: #74778B">
  //             <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0 1 18 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 0 1 6 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
  //           </svg>
  //             <select id='saveMediaType' style="width: 100%">
  //               <option value='Movie'>Movie</option>
  //             </select>
  //         </div>`;
  // }

  const pencilWrapper = document.querySelector(".pencilWrapper");

  pencilWrapper.addEventListener("click", async function () {
    const Wrapper = document.body.querySelector(".saveWrapperOverlay");
    Wrapper.remove();

    const userData = await chrome?.storage?.sync.get(["userData"]);

    const platformsArray = [
      "Twitter",
      "LinkedIn",
      "Reddit",
      "Medium",
      "Github",
      "Instagram",
      "Youtube",
    ];
    const normalizedUrl = window.location.href.toLowerCase();

    const foundPlatform = platformsArray.find((platform) =>
      normalizedUrl.includes(platform.toLowerCase())
    );
    const profileBtnFound = checkImportProfilePresence();
    if (profileBtnFound && foundPlatform) {
      if (foundPlatform === "Twitter") {
        window.TwitterProfile();
      } else if (foundPlatform === "Github") {
        window.GithubProfile(userData);
      } else if (foundPlatform === "Instagram") {
        window.InstagramProfile(userData);
      } else if (foundPlatform === "Reddit") {
        window.RedditProfile(userData);
      } else if (foundPlatform === "LinkedIn") {
        window.LinkedInProfile();
      } else if (foundPlatform === "Medium") {
        window.MediumProfile();
      } else if (
        foundPlatform === "Youtube" &&
        !window.location.href.startsWith("https://www.youtube.com/watch")
      ) {
        window.YoutubeProfile();
      } else {
        window.panelToggle("?add-bookmark", true);
      }
    } else {
      window.panelToggle("?add-bookmark", true);
    }
  });

  // const collectionWrapper = document.body.querySelector("#collectionWrapper");
  const progressBar = document.body.querySelector("#saveProgressBar");
  const saveMediaType = mediaType;
  const saveCollectionType = unfilteredCollectionId;
  let startTime = null;
  let lastPauseTime = 0;
  let totalPausedTime = 0;
  let animationFrameRequest;
  let isPaused = false;
  let animationComplete = false; // Flag to ensure the completion action is triggered once

  function animateProgress(timestamp) {
    if (!startTime) startTime = timestamp;
    const totalElapsedTime = timestamp - startTime - totalPausedTime;
    const progress = Math.min(totalElapsedTime / 3000, 1); // Normalize the progress to not exceed 100%
    progressBar.style.width = `${progress * 100}%`;

    if (progress < 1) {
      animationFrameRequest = requestAnimationFrame(animateProgress);
    } else if (!animationComplete) {
      completeAnimation(); // Call when animation completes
    }
  }

  async function completeAnimation() {
    animationComplete = true;
    // const collectionValue = saveCollectionType.value;
    // const mediaTypeValue = saveMediaType.value;

    // const savedText = document.body.querySelector('#savedText')
    // savedText.textContent='Saved'
    // const cWrapper = document.body.querySelector(".collectionWrapper");
    // cWrapper.style.display = "none";
    // const pencilWrapper = document.body.querySelector(".pencilWrapper");
    // pencilWrapper.style.display = "none";

    await saveGems(saveMediaType, saveCollectionType, platform);
    const Wrapper = document.body.querySelector(".saveWrapperOverlay");
    Wrapper.remove();
    await checkURL();
  }

  function pauseAnimation() {
    isPaused = true;
    lastPauseTime = performance.now();
    cancelAnimationFrame(animationFrameRequest); // Cancel the ongoing animation frame request
  }

  function resumeAnimation() {
    if (isPaused) {
      totalPausedTime += performance.now() - lastPauseTime;
      isPaused = false;
      animationFrameRequest = requestAnimationFrame(animateProgress);
    }
  }

  // collectionWrapper.addEventListener("mouseenter", pauseAnimation);
  // collectionWrapper.addEventListener("mouseleave", resumeAnimation);
  pencilWrapper.addEventListener("mouseenter", pauseAnimation);
  pencilWrapper.addEventListener("mouseleave", resumeAnimation);

  animationFrameRequest = requestAnimationFrame(animateProgress);
}

const checkGPT = () => {
  if (window.location.hostname === "chatgpt.com" && !isSetGPT) {
    // console.log('here', document.getElementsByTagName("textarea")[0])
    if (document.getElementsByTagName("textarea")[0]) {
      document.getElementsByTagName("textarea")[0].focus();
      // If search query is "?ref=glasp"
      if (window.location.search === "?ref=curateit") {
        // get prompt from background.js
        chrome.runtime.sendMessage({ message: "getPrompt" }, (response) => {
          setTimeout(() => {
            if (response.prompt !== "") {
              const element = document.getElementById("prompt-textarea");
              if (element) {
                isSetGPT = true;
                element.value = response.prompt;
                element?.blur();
                element?.focus();
                element?.dispatchEvent
                  ? element?.dispatchEvent(
                      new Event("input", { bubbles: true })
                    )
                  : element?.fireEvent("oninput");
              }
            }
          }, 1000);
        });
      }
    }
  }
};

checkGPT();
