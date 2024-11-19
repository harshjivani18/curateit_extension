

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

function addToCurateitQuoraTest(title, description, url, image) {
  const importData = chrome?.storage?.sync.get(["importData"]);
  const images1    = Array.from(document?.images)?.map((img) => { return img.src }) || [];
  const icon       = document.querySelector('link[rel="icon"]')?.href || ""
  const message = {
    post: {
      title: title,
      description: description,
      media_type: "SocialFeed",
      platform: "Quora",
      post_type: "SaveToCurateit",
      type: "Quora",
      url: url,
      media: {
        covers: [image],
      },
      metaData: {
        covers: [image],
        docImages: [ image, ...images1 ],
        defaultThumbnail: image,
        defaultIcon: icon !== "" ? icon : null,
        icon: icon !== "" ? { type: "image", icon } : null,
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
      },
    },
  };
  chrome.storage.sync.set({
    socialObject: message,
  });
  window.panelToggle(`?save-social`, true);
  
}

function addButton() {
  let bars = document.querySelectorAll(
    ".q-box.dom_annotate_multifeed_bundle_AnswersBundle, .q-box.dom_annotate_multifeed_bundle_AdBundle, .q-box.puppeteer_test_tribe_post_item_feed_story"
  );
  for (let bar of bars) {
    if (bar.querySelector(".quora-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "23px";
    img.style.height = "auto";
    img.style.cursor = "pointer";
    img.className = "quora-button";
    img.title = "Add to Feed!";
    img.addEventListener("click", function (e) {
      let commonParent = bar;
      if (commonParent) {
        let actor =
          commonParent.querySelector(".q-text.puppeteer_test_tribe_name") ||
          commonParent.querySelector("span.q-text.qu-dynamicFontSize--small");
        title =
          commonParent.querySelector(".q-box.qu-mb--tiny")?.innerText || "";
        if (actor) {
          let str = actor.innerText;
          const pos = str.indexOf("'s");
          if (pos !== -1) {
            actorName = str.substring(0, pos);
          } else {
            actorName = str; // or return an empty string, or handle it in any other desired way
          }
        } else {
          console.log(
            "No actor with .update-components-actor__name.t-14.t-bold.hoverable-link-text.t-black classes found."
          );
        }
        let child =
          commonParent.querySelector(".q-box.spacing_log_answer_content") ||
          commonParent.querySelectorAll(".q-box.qu-mb--small")[1] ||
          commonParent.querySelector(".q-box.qu-mb--tiny") ||
          commonParent.querySelector("p.qu-wordBreak--break-word");
        if (child) {
          desc = child.textContent || child.innerText;
          desc = desc.trim();
        } else {
          console.log("No child with .break-words classes found.");
        }

        let imgDivElement = commonParent?.querySelector(
          ".q-inlineBlock.qu-overflow--hidden"
        );
        let backgroundImage;
        if (imgDivElement) {
          // Assuming divElement is the outer div
          let innerDiv = imgDivElement?.querySelector("div"); // Gets the first div inside divElement

          let computedStyle = window.getComputedStyle(innerDiv);

          backgroundImage = computedStyle?.backgroundImage;
        }

        
        let imageUrl = backgroundImage?.slice(4, -1).replace(/"/g, "") || ""; // Removes url() and double quotes
        

        let imagePost = commonParent.querySelectorAll(".q-image");
        let imgUrl = "";

        if (imagePost) {
          imgUrl = imagePost[1]?.src;
        }

        if (title != "" && desc == "") {
          desc = title;
        }
        let linkElement = commonParent.querySelector(
          ".q-box.puppeteer_test_link"
        );
        if (linkElement) {
          link = linkElement.href;
        } else {
          link = "";
        }

        addToCurateitQuoraTest(title, actorName, desc, link, imageUrl);
      } else {
        console.log("No common parent found.");
      }
    });
    div.appendChild(img);
    div.style.display = "flex";
    let targetContainer = bar.querySelector(
      ".q-flex.qu-justifyContent--space-between.qu-alignItems--center.qu-flexWrap--nowrap.qu-py--tiny"
    );
    if (targetContainer) {
      let firstDivInsideTarget = targetContainer.querySelector("div");
      if (firstDivInsideTarget) {
        firstDivInsideTarget.appendChild(div);
      } else {
        console.warn("First div inside target container not found!");
      }
    } else {
      console.warn("Target container not found inside the bar!");
    }
  }
}

function addButtonToComments() {
  let bars = document.querySelectorAll(
    ".q-flex.qu-justifyContent--space-between.qu-alignItems--center.qu-flexWrap--nowrap.qu-py--tiny"
  );
  for (let bar of bars) {
    if (bar.querySelector(".quora-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "18px";
    img.style.height = "auto";
    img.style.cursor = "pointer";
    img.className = "quora-button";
    img.title = "Add to Feed!";
    img.addEventListener("click", function (e) {
      let commonParent = e.target.closest(".q-text");
      
      if (commonParent) {
        let actor = commonParent.querySelector("span");
        imgUrl = commonParent.querySelector("img").src;
        // let childSpan = actor.querySelector('span[aria-hidden="true"]');
        if (actor) {
          actorName = actor.innerText || actor.textContent;
          actorName = actorName.trim();
          // Find the closest <a> ancestor and log its href attribute
          let anchorElement = actor.querySelector("a");
          
          
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
        let child = commonParent.querySelector("p.q-text");
        if (child) {
          desc = child.innerText || child.textContent;
          desc = desc.trim();
        } else {
          console.log(
            "No child with .feed-shared-main-content--highlighted-comment classes found."
          );
        }

        addToCurateitQuoraTest(actorName, desc, link, imgUrl);
      } else {
        console.log("No common parent found.");
      }
      // let vals = { collection_gems: 'gem1', tags: 'tag1', remarks: 'remark1' };  // Just an example, adjust this to your needs
      // window.grabLinkedInLikes(vals);
    });
    // Add the image to the div
    div.appendChild(img);
    // Add the div to the action bar
    let commentsDiv = bar.querySelector(".q-flex.qu-alignItems--center");
    
    
    bar.querySelector("div").appendChild(div);
    // 
    // commentsDiv.querySelector("div").appendChild(div);
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
