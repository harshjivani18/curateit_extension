(() => {
  

  function convertString(str) {
    return str?.toLowerCase().split(" ").join("-");
  }

  async function fetchOpenGraphData(url) {
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const ogData = {};

    const metaTags = doc.querySelectorAll('meta[property^="og:"]');
    metaTags.forEach((tag) => {
      ogData[tag.getAttribute("property")] = tag.getAttribute("content");
    });

    return ogData;
  }

  const checkIsImgValid = async (url) => {
    const authenticateUser = await checkIsUserLoggedIn();
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

  async function addToCurateitInstagram(followers, following, posts, url) {
    const importData = await chrome?.storage?.sync.get(["importData"]);
    let ogData = await fetchOpenGraphData(window.location.href);
    const ogDataImg = await checkIsImgValid(ogData["og:image"]);
    const images1 =
      Array.from(document?.images)?.map((img) => {
        return img.src;
      }) || [];
    const icon = document.querySelector('link[rel="icon"]')?.href || "";
    const message = {
      post: {
        title: ogData["og:title"],
        description: document.querySelector("section div h1")?.innerText.trim(),
        media_type: "Profile",
        type: "Profile",
        platform: "Instagram",
        post_type: "SaveToCurateit",
        url: ogData["og:url"],
        media: {
          covers: [ogDataImg],
        },
        metaData: {
          covers: [ogDataImg],
          docImages: [ogDataImg, ...images1],
          icon:
            icon !== ""
              ? {
                  type: "image",
                  icon,
                }
              : null,
          defaultIcon: icon !== "" ? icon : null,
          defaultThumbnail: ogDataImg !== "" ? ogDataImg : null,
        },
        collection_gems: importData?.importData?.data?.collection_gems,
        remarks: importData?.importData?.data?.remarks,
        tags: importData?.importData?.data?.tags,
        is_favourite: true,
        socialfeed_obj: {
          id: convertString(ogData["og:title"]),
          title: ogData["og:title"],
          description: document
            .querySelector("section div h1")
            ?.innerText.trim(),
          profile_image_url: ogDataImg,
          followers: followers,
          connections: following,
          posts: posts,
          profile_url: ogData["og:url"] || url,
        },
      },
    };
    chrome.storage.local.set({
      socialObject: message,
    });
    window.panelToggle(`?add-profile`, true, true);
    
  }

  function addBulkImportBtn() {
    let bars = document.querySelectorAll("header section ul");

    for (let bar of bars) {
      if (bar.querySelector(".bulkImportBtn")) continue;
      let div = document.createElement("div");

      let button = document.createElement("button");
      button.innerHTML = `
          <img src="https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png" width="20" style="margin-right: 5px; filter: invert(0);">
          Import Profile
        `;
      button.id = "injected-button";
      button.style = `
          font-size: 14px;
          border: 1px solid gray;
          cursor: pointer;
          background: white;
          border-radius: 16px;
          color: black;
          padding: 6px 10px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
        `;
      button.className = "bulkImportBtn";
      button.title = "Add to Feed!";

      let posts = bar
        .querySelectorAll("li")[0]
        ?.querySelector("span")
        ?.innerText.trim();
      let followers = bar
        .querySelectorAll("li")[1]
        ?.querySelector("span")
        ?.innerText.trim();
      let following = bar
        .querySelectorAll("li")[2]
        ?.querySelector("span")
        ?.innerText.trim();
      let url = window.location.href;

      button.addEventListener("click", async function (e) {
        e.preventDefault();
        addToCurateitInstagram(followers, following, posts, url);
      });
      div.appendChild(button);

      let targetContainer = bar;
      if (targetContainer) {
        targetContainer.style.display = "flex";
        targetContainer.style.alignItems = "center";
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
    loadingText.innerText = "Importing Wall of Links...";
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
      return res;
    } catch (error) {
      console.log("error : ", error);
      hideLoader();
    }
  }

  async function fetchAllLinks() {
    const text = await chrome?.storage?.sync.get(["userData"]);
    const apiUrl = text?.userData?.apiUrl;
    const id = text?.userData?.id;
    const token = text?.userData?.token;
    const iframelyApi = text?.userData?.iframelyApi;
    const unfilteredCollectionId = text?.userData?.unfilteredCollectionId;
    
    const wallOfLinks = document.querySelector(
      "div > button + button"
    ).parentNode;
    const buttons = wallOfLinks.querySelectorAll("button");
    buttons.forEach((button) => {
      const anchorTags = button.querySelectorAll("a");
      anchorTags.forEach(async (a) => {
        const url = a.getAttribute("href");
        if (!url) {
          hideLoader();
          return;
        } // Skip if URL is falsy
        let params = new URLSearchParams(url.split("?")[1]);
        let link = decodeURIComponent(params.get("u"));
        
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
        const images2 =
          Array.from(document?.images)?.map((img) => {
            return img.src;
          }) || [];
        // const icon    = document.querySelector('link[rel="icon"]')?.href || ""
        const payload = {
          data: {
            title: res?.meta?.title,
            description: res?.meta?.description,
            expander: [],
            media_type: "Link",
            author: parseInt(id, 10),
            url: link,
            media: {
              covers: [res?.links?.thumbnail[0]?.href],
            },
            metaData: {
              type: "Link",
              title: res?.meta?.title,
              docImages: [res?.links?.thumbnail[0]?.href, ...images2],
              icon: {
                type: "image",
                icon: res?.links?.icon[0]?.href,
              },
              url: link,
              covers: [res?.links?.thumbnail[0]?.href],
              isYoutube: false,
              defaultIcon: res?.links?.icon[0]?.href,
              defaultThumbnail: res?.links?.thumbnail[0]?.href,
            },
            collection_gems: unfilteredCollectionId,
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
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const responseData = await response.json();
          
        } catch (error) {
          console.error("Error sending POST request:", error);
          hideLoader();
        }
      });
    });
    hideLoader();
  }

  async function postGemData(title, imgSrc, desc, url) {
    const text = await chrome?.storage?.sync.get(["userData"]);
    const apiUrl = text?.userData?.apiUrl;
    const id = text?.userData?.id;
    const token = text?.userData?.token;
    const unfilteredCollectionId = text?.userData?.unfilteredCollectionId;
    const baseUrl = `${apiUrl}/api/gems`;
    const images3 =
      Array.from(document?.images)?.map((img) => {
        return img.src;
      }) || [];
    const icon = document.querySelector('link[rel="icon"]')?.href || "";
    const payload = {
      data: {
        title: title,
        description: desc,
        media_type: "Image",
        author: id,
        url: "http://link.com",
        S3_link: [imgSrc],
        media: {
          covers: [imgSrc],
        },
        metaData: {
          type: "Link",
          title: title,
          icon: { type: "image", icon: "https://static.cdninstagram.com/rsrc.php/y4/r/QaBlI0OZiks.ico" },
          url: url,
          covers: [imgSrc],
          docImages: [imgSrc, ...images3],
          defaultIcon:
            "https://static.cdninstagram.com/rsrc.php/y4/r/QaBlI0OZiks.ico",
          defaultThumbnail: imgSrc,
          isYoutube: false,
        },
        collection_gems: unfilteredCollectionId,
        remarks: "",
        tags: [],
        is_favourite: false,
        showThumbnail: true,
        fileType: "file",
      },
    };

    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function addLinksImportBtn() {
    // instagram profile bio links tree
    const btnWrapper = document.querySelector("h1 + button");
    if (btnWrapper) {
      let div = document.createElement("div");
      let img = document.createElement("img");
      img.src =
        "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
      img.style.width = "37px";
      img.style.height = "auto";
      img.style.margin = "0 5px";
      img.style.cursor = "pointer";
      img.className = "InstaLinks-button";
      img.title = "Import Links!";

      img.addEventListener("click", async () => {
        showLoader();
        authenticateUser = await checkIsUserLoggedIn();
        if (authenticateUser?.token) {
          fetchAllLinks();
          
        }
      });

      div.appendChild(img);
      let targetContainer = btnWrapper;
      if (targetContainer) {
        targetContainer.style.display = "flex";
        targetContainer.style.alignItems = "center";
        targetContainer.appendChild(div);
      } else {
        console.warn("Target container not found inside the bar!");
      }
    } else {
      console.log("btnWrapper not found");
    }
  }

  function addButtonToPosts() {
    let bars = document.querySelectorAll("article");
    for (let bar of bars) {
      if (bar.querySelector("#insta-button")) continue;
      let div = document.createElement("div");
      let img = document.createElement("img");
      img.src =
        "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
      img.style.width = "40px";
      img.style.height = "auto";
      img.style.cursor = "pointer";
      img.id = "insta-button";
      img.title = "Add to Curateit!";
      const imgElem =
        bar.querySelector("img:not([draggable]):not([id])") ||
        bar.querySelector("img:not([id])");
      const descElem = bar.querySelector("section")?.nextElementSibling;
      const urlElem = bar.querySelectorAll("a")[2];
      const titleElem = descElem.querySelector("a");
      const title = titleElem?.textContent.trim() + " on Instagram";
      const imgSrc = imgElem?.src;
      const desc = descElem?.innerText.replaceAll("\n", " ");
      const url = "https://www.instagram.com" + urlElem?.getAttribute("href");
      img.addEventListener("click", async function (e) {
        e.preventDefault();
        await postGemData(title, imgSrc, desc, url);
      });
      // Add the image to the div
      div.appendChild(img);
      const targetElem = bar.querySelector("span + span")?.parentNode;
      if (targetElem) {
        targetElem.appendChild(div);
      } else {
        console.log("targetelem not found");
      }
    }
  }

  function cleanup() {
    observer1.disconnect();
    observer2.disconnect();
    document.getElementById("injected-button").removeEventListener("click");
    document.getElementById("insta-button").removeEventListener("click");
  }

  window.addEventListener("load", function () {
    addBulkImportBtn();
    addLinksImportBtn();
    // addButtonToPosts();

    let observer1 = new MutationObserver(addBulkImportBtn);
    observer1.observe(document.body, { childList: true, subtree: true });

    // let observer2 = new MutationObserver(addButtonToPosts);
    // observer2.observe(document.body, { childList: true, subtree: true });

    // Assuming there's a way to detect navigating away or button removal
    window.addEventListener("beforeunload", cleanup);
  });
})();
