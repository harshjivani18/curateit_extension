

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
  loadingText.innerText = "Importing Links From LinkTree...";
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

async function iframelyRes(token, link, iframelyApi) {
  try {
    const response = await fetch(
      `https://cdn.iframe.ly/api/iframely/?url=${link}&api_key=${iframelyApi}&iframe=1&omit_script=1`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Replace with your actual token
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const res = await response.json();
    hideLoader();
    return res;
  } catch (error) {
    console.log("error : ", error);
    hideLoader();
  }
}

async function fetchAllLinks() {
  const text = await chrome?.storage?.sync.get(["userData"]);
  const apiUrl = text?.userData?.apiUrl;
  const id = Number(text?.userData?.userId);
  const token = text?.userData?.token;
  const iframelyApi = text?.userData?.iframelyApi;
  const bioCollectionId = Number(text?.userData?.bioCollectionId);
  const wallOfLinks = document.querySelector("div[data-id]")?.parentNode;
  const buttons = wallOfLinks?.querySelectorAll("div[data-id]");
  buttons?.forEach((button, index) => {
    const anchorTags = button?.querySelectorAll("a");
    anchorTags.forEach(async (a) => {
      const url = a?.getAttribute("href");
      const title = a?.textContent.trim();
      if (!url) {
        hideLoader();
        return;
      } // Skip if URL is falsy
      let link = url;
      if (!link) {
        hideLoader();
        return;
      } // Skip if URL is falsy
      if (link == undefined) {
        hideLoader();
        return;
      } // Skip if URL is falsy
      const res = await iframelyRes(token, link, iframelyApi);
      if (res == undefined) {
        hideLoader();
        return;
      }
      const images1 =
        Array.from(document?.images)?.map((img) => {
          return img.src;
        }) || [];
      const payload = {
        data: {
          title: title || res?.meta?.title || "",
          description: res?.meta?.description || "",
          expander: [],
          media_type: "Link",
          author: id,
          url: link,
          media: {
            covers: [
              res?.links?.thumbnail && res.links.thumbnail.length > 0
                ? res.links.thumbnail[0].href
                : "",
            ],
            shape: "square",
            x: (index * 2) % 8,
            y: Infinity,
          },
          metaData: {
            type: "Link",
            title: title || res?.meta?.title || "",
            docImages:
              res?.links?.thumbnail && res.links.thumbnail.length > 0
                ? [res.links.thumbnail[0].href, ...images1]
                : images1,
            icon: {
              type: "image",
              icon:
                res?.links?.icon && res.links.icon.length > 0
                  ? res.links.icon[0].href
                  : "",
            },
            url: link,
            covers: [
              res?.links?.thumbnail && res.links.thumbnail.length > 0
                ? res.links.thumbnail[0].href
                : "",
            ],
            isYoutube: false,
            defaultIcon:
              res?.links?.icon && res.links.icon.length > 0
                ? res.links.icon[0].href
                : "",
            defaultThumbnail:
              res?.links?.thumbnail && res.links.thumbnail.length > 0
                ? res.links.thumbnail[0].href
                : null,
          },
          collection_gems: bioCollectionId,
          remarks: "",
          tags: [],
          is_favourite: false,
          showThumbnail: true,
        },
      };

      try {
        const response = await fetch(`${apiUrl}/api/gems?populate=tags`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Replace with your actual token
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          hideLoader();
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        hideLoader();
      } catch (error) {
        console.error("Error sending POST request:", error);
        hideLoader();
      }
    });
  });
  alert("Successfully imported Links");
  hideLoader();
}

function addImportBtn() {
  const headingElem = document.querySelector("h1");
  if (headingElem) {
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "linkTree-button";
    img.title = "Import List!";

    img.addEventListener("click", async () => {
      showLoader();
      authenticateUser = await checkIsUserLoggedIn();
      if (authenticateUser?.token) {
        fetchAllLinks();
      }
    });

    div.appendChild(img);
    let targetContainer = headingElem.parentNode;
    if (targetContainer) {
      targetContainer.style.display = "flex";
      targetContainer.style.alignItems = "center";
      targetContainer.appendChild(div);
    } else {
      console.warn("Target container not found inside the bar!");
    }
  } else {
    console.log("headingElem not found");
  }
}

setTimeout(() => {
  hideLoader();
}, 3000);

// Run the addButton function once the page is loaded
window.addEventListener("load", function () {
  addImportBtn();
});
