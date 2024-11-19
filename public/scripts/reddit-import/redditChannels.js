function convertString(str) {
  return str?.toLowerCase().split(" ").join("-");
}

const getUserData = async () => {
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

const checkIsImgValid = async (url) => {
  const authenticateUser = await getUserData();
  const sessionToken = authenticateUser.token;
  const apiUrl = authenticateUser.url;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      const payload = {
        base64: dataURL,
      };
      fetch(`${apiUrl}/api/upload-base64-img`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(payload),
      })
        .then((resp) => {
          return resp.json();
        })
        .then((response) => {
          resolve(response.message);
        })
        .catch((error) => {
          resolve(false);
        });
    };
    img.onerror = () => {
      resolve(false);
    };
    img.crossOrigin = "anonymous";
    img.src = url;
  });
};

async function addToCurateitRedditChannel(
  channelName,
  url,
  subredditId,
  displayName,
  description,
  subscribers,
  activeMembers,
  imgLink
) {
  const importData = await chrome?.storage?.sync.get(["importData"]);
  const userData = await chrome?.storage?.sync.get(["userData"]);
  const imgUrl = await checkIsImgValid(imgLink);
  let title = `${channelName} - ${displayName}`;
  const images1 =
    Array.from(document?.images)?.map((img) => {
      return img.src;
    }) || [];
  const icon = `${userData?.userData?.imagesCdn}/webapp/default-logo-reddit.png`;
  const message = {
    post: {
      title: title,
      description: description,
      media_type: "Profile",
      type: "Profile",
      platform: "Reddit",
      post_type: "SaveToCurateit",
      url: url,
      media: {
        covers: [imgUrl],
      },
      metaData: {
        covers: [imgUrl],
        docImages: [imgUrl, ...images1],
        icon:
          icon !== ""
            ? {
                type: "image",
                icon,
              }
            : null,
        defaultIcon: icon !== "" ? icon : null,
        defaultThumbnail: imgUrl !== "" ? imgUrl : null,
      },
      collection_gems: importData?.importData?.data?.collection_gems,
      remarks: importData?.importData?.data?.remarks,
      tags: importData?.importData?.data?.tags,
      is_favourite: true,
      socialfeed_obj: {
        id: convertString(title),
        title: title,
        description,
        profile_image_url: imgUrl,
        subredditId,
        subscribers,
        activeMembers,
      },
    },
  };
  chrome.storage.local.set({
    socialObject: message,
  });
  window.panelToggle(`?add-profile`, true, true);
}

function addChannelImportBtn() {
  let bars = document.querySelectorAll("shreddit-subreddit-header-buttons");
  for (let bar of bars) {
    // if (bar.querySelector(".reddit-btn")) continue;
    let div = document.createElement("div");
    div.style.width = "100%";
    div.style.marginRight = "0.5rem";
    div.innerHTML = `<button id="injected-button" style="font-size: 14px;border: 1px solid gray;cursor: pointer;background: white;border-radius: 16px;color: black;padding: 6px 10px;font-weight: 600;display: inline-flex;align-items: center;width: 100%;justify-content: center; gap:0.3rem; height: auto;"><img src="https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png" width="20" style="margin: 0px;">Import Channel</button>`;

    let shredditHeader = document.querySelector("shreddit-subreddit-header");
    let channel =
      shredditHeader.getAttribute("prefixed-name") ||
      document.querySelector("h1")?.textContent ||
      "";
    let channelName = channel.trim();
    let url = window.location.href;
    let subredditId = shredditHeader.getAttribute("subreddit-id");
    let displayName = shredditHeader.getAttribute("display-name");
    let description = shredditHeader.getAttribute("description");
    let subscribers = shredditHeader.getAttribute("subscribers");
    let activeMembers = shredditHeader.getAttribute("active");
    let imgElem = document.querySelector("div > faceplate-img");
    let imgUrl = imgElem.getAttribute("src") || "";
    div.addEventListener("click", async function (e) {
      e.stopPropagation();
      addToCurateitRedditChannel(
        channelName,
        url,
        subredditId,
        displayName,
        description,
        subscribers,
        activeMembers,
        imgUrl
      );
    });

    let targetContainer = bar.parentNode;
    if (targetContainer) {
      targetContainer.prepend(div);
    } else {
      console.warn("Target container not found inside the bar!");
    }
  }
}

function addBulkChannelImportBtn() {
  let bars = document.querySelectorAll("div#communities_section");
  for (let bar of bars) {
    let div = document.createElement("div");
    div.style.width = "100%";
    div.style.marginRight = "0.5rem";
    div.innerHTML = `<button id="injected-button" style="font-size: 14px;border: 1px solid gray;cursor: pointer;background: white;border-radius: 16px;color: black;padding: 6px 10px;font-weight: 600;display: inline-flex;align-items: center;width: 100%;justify-content: center; gap:0.3rem; height: auto;"><img src="https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png" width="20" style="margin: 0px;">Bulk Import Communities</button>`;

    let communities = document.querySelector("left-nav-communities-controller");
    let communitiesJson = JSON.parse(
      communities.getAttribute("initialstatejson") || ""
    );
    div.addEventListener("click", async function (e) {
      e.stopPropagation();
      chrome.storage.local.set({
        redditCommunities: JSON.stringify(communitiesJson),
      });
      window.panelToggle(`?bulk-import-reddit`, true, true);
    });

    let targetContainer = bar;
    if (targetContainer) {
      targetContainer.prepend(div);
    } else {
      console.warn("Target container not found inside the bar!");
    }
  }
}

window.addEventListener("load", function () {
  addChannelImportBtn();
  addBulkChannelImportBtn();
});
