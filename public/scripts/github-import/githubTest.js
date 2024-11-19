

let url;
let title;
let desc;
let actorName;
let link;
let imgUrl;

function convertString(str) {
  return str?.toLowerCase().split(" ").join("-");
}

function addToCurateitGithubTest(title, description, url, image, languages, stars, forks) {
  const images = Array.from(document?.images)?.map((img) => { return img.src }) || []
  const icon   = document?.querySelector('link[rel="icon"]')?.href || ''
  const importData = chrome?.storage?.sync.get(["importData"]);
  const message = {
    post: {
      title: title,
      description: description,
      media_type: "SocialFeed",
      platform: "Github",
      post_type: "SaveToCurateit",
      type: "Github",
      url: url,
      media: {
        covers: [image],
      },
      metaData: {
        covers: [image],
        docImages: [ image, images ], 
        defaultIcon: icon !== "" ? icon : null, 
        defaultThumbnail: image, 
        icon: icon !== "" ? { icon, type: "image" } : null
      },
      collection_gems: importData?.importData?.data?.collection_gems,
      remarks: importData?.importData?.data?.remarks,
      tags: importData?.importData?.data?.tags,
      is_favourite: true,
      socialfeed_obj: {
        id: convertString(title),
        title: title,
        description: description,
        profile_url: url,
        profile_image_url: image,
        programmingLanguage: languages,
        starCount: stars,
        forkCount: forks,
      },
    },
  };
  chrome.storage.local.set({
    socialObject: message,
  });
  window.panelToggle(`?save-social`, true);
  
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

function addButton() {
  if (document.querySelector(".Github-button")) return;
  const fileContainer = document.querySelector(".react-directory-add-file-icon")
  const bar           = fileContainer?.parentElement
  let div             = document.createElement("div");
  let img             = document.createElement("img");
  img.src =
    "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
  img.style.width = "37px";
  img.style.height = "auto";
  img.style.margin = "0 5px";
  img.style.cursor = "pointer";
  img.className = "Github-button";
  img.title = "Add to Feed!";

  img.addEventListener("click", async function (e) {
    let pageUrl = window.location.href;
    let ogData = await fetchOpenGraphData(pageUrl);

    let title = ogData["og:title"];
    let desc = ogData["og:description"];
    let link = ogData["og:url"];
    let imgUrl = ogData["og:image"];
    let languages = "";
    let stars     = ""
    let forks     = ""

    const sidebarContainer = document.querySelector(".Layout-sidebar")
    const h2Elements       = sidebarContainer?.querySelectorAll('h2');
    const languagesHeading = Array.from(h2Elements).find(el => el.textContent.trim() === 'Languages');
    if (languagesHeading) {
      const langParent    = languagesHeading?.parentElement;
      const langList      = langParent?.querySelector("ul");
      const langlistChild = Array.from(langList?.children);
      languages           = langlistChild.map(el => el.innerText?.split("\n")?.[0] || "").join(", ");
    }

    const linkElements    = sidebarContainer?.querySelectorAll('.Link');
    const starElem        = Array.from(linkElements).find(el => el.textContent.includes('stars'));
    if (starElem) {
      stars               = starElem?.querySelector("strong")?.textContent || "";
    }

    const forkElem        = Array.from(linkElements).find(el => el.textContent.includes('forks'));
    if (forkElem) {
      forks               = forkElem?.querySelector("strong")?.textContent || "";
    }

    // Call your function
    addToCurateitGithubTest(title, desc, link, imgUrl, languages, stars, forks);
  });

  div.appendChild(img);
  div.style.display = "flex";

  let targetContainer = bar;
  if (targetContainer) {
    targetContainer.appendChild(div);
  } else {
    console.warn("Target container not found inside the bar!");
  }
}


// function addButton() {
//   let bars = document.querySelectorAll(".file-navigation");
//   for (let bar of bars) {
//     if (bar.querySelector(".Github-button")) continue;

//     let div = document.createElement("div");
//     let img = document.createElement("img");
//     img.src =
//       "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
//     img.style.width = "37px";
//     img.style.height = "auto";
//     img.style.margin = "0 5px";
//     img.style.cursor = "pointer";
//     img.className = "Github-button";
//     img.title = "Add to Feed!";

//     img.addEventListener("click", async function (e) {
//       let pageUrl = window.location.href;
//       let ogData = await fetchOpenGraphData(pageUrl);

//       let title = ogData["og:title"];
//       let desc = ogData["og:description"];
//       let link = ogData["og:url"];
//       let imgUrl = ogData["og:image"];

//       // Call your function
//       addToCurateitGithubTest(title, desc, link, imgUrl);
//     });

//     div.appendChild(img);
//     div.style.display = "flex";

//     let targetContainer = bar;
//     if (targetContainer) {
//       targetContainer.appendChild(div);
//     } else {
//       console.warn("Target container not found inside the bar!");
//     }
//   }
// }

// Run the addButton function once the page is loaded
window.addEventListener("load", function () {
  // Run the function once at the start
  addButton();

  // Create a MutationObserver to watch for changes in the page for addButton
  let observer1 = new MutationObserver(addButton);
  // Start observing
  observer1.observe(document.body, { childList: true, subtree: true });
});
