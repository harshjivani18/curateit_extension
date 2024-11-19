

function generateVideosJson() {
  const videos = [];
  if (window.location.href.includes("https://www.youtube.com/playlist")) {
    const rows = document.querySelectorAll(
      ".ytd-playlist-video-list-renderer div#content"
    );
    rows.forEach((row) => {
      const coverElement = row.querySelector("img");
      const titleElement = row.querySelector("a#video-title");
      const authorElement = row.querySelector(".ytd-channel-name a");
      const viewsElement = row.querySelectorAll("#video-info span")[0];
      const dateElement = row.querySelectorAll("#video-info span")[2];
      const playlistUrl = window.location.href;
      const images1 = Array.from(document?.images)?.map((img) => { return img.src }) || []
      const icon    = document.querySelector("link[rel*='icon']")?.href || ""

      if (titleElement && coverElement) {
        const title = titleElement.textContent.trim();
        const url =
          "https://www.youtube.com" + titleElement.getAttribute("href");
        const cover = coverElement.getAttribute("src");
        const author = authorElement.textContent.trim();
        const views = viewsElement.textContent.trim();
        const dateAdded = dateElement.textContent.trim();
        const description = `The video '${title}' was created by ${author} has received an impressive ${views}. It was added to the playlist on ${dateAdded}.`;
        const media_type = "Video";
        const platform = "LinkedIn";
        const post_type = "Post";
        const media = {
          covers: [cover],
        };
        const metaData = {
          covers: [cover],
          docImages: [cover, ...images1],
          defaultThumbnail: cover || null,
          icon: icon !== "" ? { type: "image", icon } : null,
          defaultIcon: icon !== "" ? icon : null,
        };
        const collection_gems = 504;
        const remarks = "Playlist Import";
        const tags = [1436];
        const is_favourite = true;
        const socialfeed_obj = {
          id: "testid",
          title: title,
          description: description,
          url: url,
          cover_image_url: cover,
        };
        const book = {
          title,
          description,
          media_type,
          platform,
          post_type,
          url,
          media,
          metaData,
          collection_gems,
          remarks,
          tags,
          is_favourite,
          socialfeed_obj,
          author,
          views,
          dateAdded,
          playlistUrl,
        };
        videos.push(book);
      }
    });
  }
  if (window.location.href.includes("https://www.youtube.com/watch")) {
    const rows = document.querySelectorAll(
      "#items .style-scope.ytd-playlist-panel-renderer > a"
    );
    rows.forEach((row) => {
      const coverElement = row.querySelector("img");
      const titleElement = row.querySelector("span#video-title");
      const authorElement = row.querySelector("span#byline");
      const playlistUrl = window.location.href;
      const images2 = Array.from(document?.images)?.map((img) => { return img.src }) || []
      const icon2    = document.querySelector("link[rel*='icon']")?.href || ""

      if (titleElement && coverElement) {
        const title = titleElement.textContent.trim();
        const url = "https://www.youtube.com" + row.getAttribute("href");
        const cover = coverElement.getAttribute("src");
        const author = authorElement.textContent.trim();
        const description = `The video '${title}' was created by ${author} has received an impressive views.`;
        const media_type = "Video";
        const platform = "LinkedIn";
        const post_type = "Post";
        const media = {
          covers: [cover],
        };
        const metaData = {
          covers: [cover],
          docImages: [cover, ...images2],
          defaultThumbnail: cover || null,
          icon: icon2 !== "" ? { type: "image", icon2 } : null,
          defaultIcon: icon2 !== "" ? icon2 : null,
        };
        const collection_gems = 504;
        const remarks = "Playlist Import";
        const tags = [1436];
        const is_favourite = true;
        const socialfeed_obj = {
          id: "testid",
          title: title,
          description: description,
          url: url,
          cover_image_url: cover,
        };
        const book = {
          title,
          description,
          media_type,
          platform,
          post_type,
          url,
          media,
          metaData,
          collection_gems,
          remarks,
          tags,
          is_favourite,
          socialfeed_obj,
          author,
          playlistUrl,
        };
        videos.push(book);
      }
    });
  }
  let userObj = {
    data: videos,
  };
  //   
  saveToBookmarks(userObj);
}

async function getChromeData(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(result);
    });
  });
}

function showLoader() {
  // Create overlay div
  let overlay = document.createElement("div");
  overlay.id = "overlay"; // Keeping the original ID
  overlay.style.fontSize = "50px";
  overlay.style.display = "block";
  overlay.style.fontWeight = "800";
  overlay.style.position = "fixed";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.inset = "0px";
  overlay.style.background =
    "linear-gradient(90deg, rgba(16, 95, 211, 0.8), rgba(16, 95, 211, 0.8))";
  overlay.style.zIndex = "99";
  overlay.style.fontFamily = "Roboto, Helvetica, Arial, sans-serif";

  // Create loader div
  let loader = document.createElement("div");
  loader.id = "loader"; // Keeping the original ID
  loader.style.position = "absolute";
  loader.style.top = "50%";
  loader.style.left = "50%";
  loader.style.fontSize = "50px";
  loader.style.color = "white";
  loader.style.transform = "translate(-50%, -50%)";
  loader.style.msTransform = "translate(-50%, -50%)";
  loader.style.textAlign = "center";

  let loaderContent = document.createElement("span");
  loaderContent.id = "status-bar";
  loaderContent.innerHTML = "Importing in Bulk 🚀";

  // Append loaderContent to loader
  loader.appendChild(loaderContent);

  // Append loader to overlay
  overlay.appendChild(loader);

  // Append overlay to body
  document.body.appendChild(overlay);
}

function hideLoader() {
  let overlay = document.getElementById("overlay");
  if (overlay) {
    overlay.remove();
  }
}

async function saveToBookmarks(userObj) {
  // Show loader
  if (window.location.href.includes("https://www.youtube.com/playlist")) {
    showLoader();

    try {
      const data = await getChromeData(["userData"]);
      const token = data?.userData?.token || data?.userData?.userData?.token;
      const apiUrl = data?.userData?.apiUrl || data?.userData?.userData?.apiUrl;
      const collectionId = data?.userData?.unfilteredCollectionId || data?.userData?.userData?.unfilteredCollectionId;

      let requestObj = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: userObj.data.map((u) => ({ ...u, collection_gems: collectionId, tags: [] })) }),
      };

      try {
        const response = await fetch(
          `${apiUrl}/api/store-gems?isProfile=true`,
          requestObj
        );
        
        if (response) {
          hideLoader();
        }
        // If successful, maybe do something with the response.
      } catch (error) {
        console.log("API error : ", error);
      }
      fetch(
        `${apiUrl}/api/gamification-score?module=gem`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      })
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      // Hide loader in any case
      hideLoader();
    }
  } else {
    alert("Importing in Bulk");
  }
}

function addPlaylistImportBtn() {
  if (window.location.href.includes("https://www.youtube.com/playlist")) {
    let bars = document.querySelectorAll(
      "div.metadata-wrapper.style-scope.ytd-playlist-header-renderer"
    );
    for (let bar of bars) {
      if (bar.querySelector(".playlistImportBtn")) continue;
      let div = document.createElement("div");

      let button = document.createElement("button");
      button.innerHTML = `
      <img src="https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png" width="20" style="margin-right: 5px; filter: invert(0);">
    Import Playlist
    `;
      button.id = "injected-button";
      button.style = `
      font-size: 14px;
      width: 100%;
      border: 1px solid gray;
      cursor: pointer;
      background: white;
      border-radius: 16px;
      color: black;
      padding: 6px 10px;
      font-weight: 600;
      display: inline-flex;
      justify-content: center;
      align-items: center;
    `;
      button.className = "playlistImportBtn";
      button.title = "Add to Feed!";
      button.addEventListener("click", async function (e) {
        e.preventDefault();
        generateVideosJson();
      });
      div.appendChild(button);

      let targetContainer = bar;
      if (targetContainer) {
        targetContainer.style.display = "flex";
        targetContainer.style.flexDirection = "column";
        div.style.display = "flex";
        div.style.justifyContent = "center";
        targetContainer.appendChild(div);
      } else {
        console.warn("Target container not found inside the bar!");
      }
    }
  }

  if (window.location.href.includes("https://www.youtube.com/watch")) {
    let bars = document.querySelectorAll("div#playlist-actions");
    for (let bar of bars) {
      bar = bar.parentElement;
      if (bar.querySelector(".playlistImportBtn")) continue;
      let div = document.createElement("div");

      let button = document.createElement("button");
      button.innerHTML = `
      <img src="https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png" width="20" style="margin-right: 5px; filter: invert(0);">
    Import Playlist
    `;
      button.id = "injected-button";
      button.style = `
      font-size: 14px;
      width: 100%;
      border: 1px solid gray;
      cursor: pointer;
      background: white;
      border-radius: 16px;
      color: black;
      padding: 6px 10px;
      font-weight: 600;
      display: inline-flex;
      justify-content: center;
      align-items: center;
    `;
      button.className = "playlistImportBtn";
      button.title = "Add to Feed!";
      button.addEventListener("click", async function (e) {
        e.preventDefault();
        generateVideosJson();
      });
      div.appendChild(button);

      let targetContainer = bar;
      if (targetContainer) {
        targetContainer.style.display = "flex";
        targetContainer.style.flexDirection = "column";
        div.style.display = "flex";
        div.style.justifyContent = "center";
        targetContainer.appendChild(div);
      } else {
        console.warn("Target container not found inside the bar!");
      }
    }
  }
}

window.addEventListener("load", function () {
  addPlaylistImportBtn();

  let observer1 = new MutationObserver(addPlaylistImportBtn);
  observer1.observe(document.body, { childList: true, subtree: true });
});
