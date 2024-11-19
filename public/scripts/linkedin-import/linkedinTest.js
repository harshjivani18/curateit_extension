let url;
let title;
let desc;
let actorName;
let link;
let imgUrl;
function removeDuplicate(str) {
  var half = str.slice(0, str.length / 2);
  if (half + half === str) {
    return half;
  } else {
    return str;
  }
}

function removeExtra(str) {
  return str.replace(/View.*profile/, "");
}

function convertString(str) {
  return str?.toLowerCase().split(" ").join("-");
}

function addToCurateitLinkedinTest(title, description, url, image, userDesc="", userImage="") {
  
  const importData = chrome?.storage?.sync.get(["importData"]);
  const images1    = Array.from(document?.images)?.map((img) => { return img.src }) || [];
  // const icon       = document.querySelector('link[rel="icon"]')?.href || ""
  const message = {
    post: {
      title: title,
      description: description,
      media_type: "SocialFeed",
      platform: "LinkedIn",
      post_type: "SaveToCurateit",
      type: "LinkedIn",
      url: url,
      media: {
        covers: [image],
      },
      metaData: {
        covers: [image],
        docImages: [ image, ...images1 ],
        icon: { type: "image", icon: "https://d3jrelxj5ogq5g.cloudfront.net/webapp/icons/linkedin.png" },
        defaultIcon: "https://d3jrelxj5ogq5g.cloudfront.net/webapp/icons/linkedin.png",
        defaultThumbnail: image,
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
        profile_image_url: userImage === "" ? image : userImage,
        text: description,
        fullText: description,
        media:image,
        user: {
          id: convertString(title),
          name: title,
          tag_line: userDesc === "" ? description : userDesc,
          description: userDesc === "" ? description : userDesc,
          profile_url: url,
          profile_image_url: userImage === "" ? image : userImage,
        }
      },
    },
  };
  chrome.storage.local.set({
    socialObject: message,
  });
  window.panelToggle(`?save-social`, true);
  
}

function addButton() {
  let bars = document.querySelectorAll(
    ".feed-shared-social-action-bar"
  );
  for (let bar of bars) {
    if (bar.querySelector(".linkedin-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "23px";
    img.style.height = "auto";
    img.style.cursor = "pointer";
    img.className = "linkedin-button";
    img.title = "Add to Feed!";
    img.addEventListener("click", function (e) {
      let commonParent = e.target.closest(
        ".feed-shared-update-v2.feed-shared-update-v2--minimal-padding"
      ); // replace '.common-parent-class' with the actual class of the common parent
      // let commonParent = e.target.closest('.feed-shared-update-v2.feed-shared-update-v2--minimal-padding.artdeco-card');  // replace '.common-parent-class' with the actual class of the common parent
      let postId = commonParent.getAttribute("data-urn") || "";
      if (commonParent) {
        let actor = commonParent.querySelector(
          ".update-components-actor__name"
        );

        if (actor) {
          actorName = removeDuplicate(
            (actor.textContent || actor.innerText).trim()
          );
        } else {
          console.log(
            "No actor with .update-components-actor__name.t-14.t-bold.hoverable-link-text.t-black classes found."
          );
        }
        let actorDesc = commonParent.querySelector(".update-components-actor__description")?.querySelector("span[aria-hidden='true']");
        if (actorDesc) {
          actorDesc = actorDesc.textContent || actorDesc.innerText || "";
        }
        let actorImage = commonParent.querySelector(".update-components-actor__avatar-image");
        if (actorImage) {
          actorImage = actorImage.src;
        }
        let child = commonParent.querySelector(
          ".update-components-text.relative.update-components-update-v2__commentary"
        );
        if (child) {
          desc = child.textContent || child.innerText;
          desc = desc.trim();
        } else {
          console.log("No child with .break-words classes found.");
        }

        let videoPost = commonParent.querySelector("video");
        let documentPost = commonParent.querySelector(
          ".carousel-slide.carousel-slide-active"
        );
        let imagePost =
          commonParent.querySelector(".update-components-image__image") ||
          commonParent.querySelector(".update-components-article__image");
        let imgUrl = "";
        if (imagePost) {
          imgUrl = imagePost.src;
          
        } else if (videoPost) {
          imgUrl = videoPost.poster;
          
        } else if (documentPost) {
          let imgElement = documentPost.querySelector("img");
          
          if (imgElement) {
            
            imgUrl = imgElement.src;
          }
        }

        link = "https://www.linkedin.com/feed/update/" + postId;
        actorName = removeExtra(actorName);
        addToCurateitLinkedinTest(actorName, desc, link, imgUrl, actorDesc, actorImage);
      } else {
        console.log("No common parent found.");
      }
      // let vals = { collection_gems: 'gem1', tags: 'tag1', remarks: 'remark1' };  // Just an example, adjust this to your needs
      // window.grabLinkedInLikes(vals);
    });
    // Add the image to the div
    div.appendChild(img);
    // Add the div to the action bar
    bar.appendChild(div);
  }
}

function addButtonToComments() {
  let bars = document.querySelectorAll(
    ".comments-comment-social-bar.display-flex"
  );
  for (let bar of bars) {
    if (bar.querySelector(".linkedin-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "18px";
    img.style.height = "auto";
    img.style.cursor = "pointer";
    img.className = "linkedin-button";
    img.title = "Add to Feed!";
    img.addEventListener("click", function (e) {
      let commonParent = e.target.closest(".comments-comment-item");
      if (commonParent) {
        let actor = commonParent.querySelector(
          ".comments-post-meta__name-text.hoverable-link-text"
        );
        imgUrl = commonParent.querySelector("img").src;
        // let childSpan = actor.querySelector('span[aria-hidden="true"]');
        if (actor) {
          actorName = actor.innerText || actor.textContent;
          actorName = actorName.trim();
          // Find the closest <a> ancestor and log its href attribute
          let anchorElement = actor.closest("a");
          if (anchorElement) {
            link = anchorElement.href;
          } else {
            console.log("No anchor element found.");
          }
        } else {
          console.log(
            "No childSpan with .comments-post-meta__name-text.hoverable-link-text.mr1 classes found."
          );
        }
        let child =
          commonParent.querySelector(
            ".feed-shared-main-content--highlighted-comment"
          ) || commonParent.querySelector(".feed-shared-main-content--comment");
        if (child) {
          desc = child.innerText || child.textContent;
          desc = desc.trim();
        } else {
          console.log(
            "No child with .feed-shared-main-content--highlighted-comment classes found."
          );
        }
        actorName = removeExtra(actorName);
        addToCurateitLinkedinTest(actorName, desc, link, imgUrl);
      } else {
        console.log("No common parent found.");
      }
      // let vals = { collection_gems: 'gem1', tags: 'tag1', remarks: 'remark1' };  // Just an example, adjust this to your needs
      // window.grabLinkedInLikes(vals);
    });
    // Add the image to the div
    div.appendChild(img);
    // Add the div to the action bar
    bar.appendChild(div);
  }
}

// Run the addButton function once the page is loaded
window.addEventListener("load", function () {
  // Run the function once at the start
  addButton();
  addButtonToComments();

  // Create a MutationObserver to watch for changes in the page for addButton
  let observer1 = new MutationObserver(addButton);
  // Start observing
  observer1.observe(document.body, { childList: true, subtree: true });

  // Create a MutationObserver to watch for changes in the page for addButtonToComments
  let observer2 = new MutationObserver(addButtonToComments);
  // Start observing
  observer2.observe(document.body, { childList: true, subtree: true });
});
