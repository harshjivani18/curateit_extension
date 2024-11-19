let url;
let title;
let desc;
let link;
let actorName;
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

function addToCurateitRedditTest(
  title,
  description,
  url,
  image,
  replaced = false,
  socialFeed = null
) {
  
  const importData = chrome?.storage?.sync.get(["importData"]);
  const images1 =
    Array.from(document?.images)?.map((img) => {
      return img.src;
    }) || [];
  const icon = document.querySelector('link[rel="icon"]')?.href || "";
  let feed = {
    id: convertString(title),
    title: description,
    description: description,
    profile_url: url,
    profile_image_url: image,
  };
  if (socialFeed) {
    if (replaced) {
      feed = {
        ...socialFeed,
        ...feed,
      };
    } else {
      feed = { ...socialFeed };
    }
  }
  
  const message = {
    post: {
      title: title,
      description: description,
      media_type: "SocialFeed",
      platform: "Reddit",
      post_type: "SaveToCurateit",
      type: "Reddit",
      url: url,
      media: {
        covers: [image],
      },
      metaData: {
        covers: [image],
        docImages: [image, ...images1],
        defaultThumbnail: image,
        defaultIcon: icon !== "" ? icon : null,
        icon: icon !== "" ? { type: "image", icon } : null,
      },
      collection_gems: importData?.importData?.data?.collection_gems,
      remarks: importData?.importData?.data?.remarks,
      tags: importData?.importData?.data?.tags,
      is_favourite: true,
      socialfeed_obj: feed,
    },
  };
  
  chrome.storage.local.set({
    socialObject: message,
  });
  window.panelToggle(`?save-social`, true);
}

function addButton() {
  let bars = document.querySelectorAll("shreddit-post, shreddit-ad-post");
  for (let bar of bars) {
    if (bar.querySelector(".reddit-button")) continue;
    let div = document.createElement("div");
    div.style.display = "contents";
    let img = document.createElement("img");
    img.style.zIndex = "9999";
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "23px";
    img.style.height = "auto";
    img.style.cursor = "pointer";
    img.className = "reddit-button";
    img.title = "Add to Feed!";
    img.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
        let post            = bar
        let postId          = bar.id
        let id              = postId

        
        let title           = post.getAttribute("post-title")?.trim()
        let contentURL      = `${window.location.origin}/${post.getAttribute("permalink")}`
        let description     = post.querySelector("[slot='text-body']")?.innerText?.trim() || post?.querySelector("shreddit-ad-supplementary-text p")?.innerText?.trim()
        let upvote          = post.getAttribute("score")
        let postType        = post.getAttribute("post-type")
        let image_url       = postType === "gallery" ? post?.querySelector("gallery-carousel ul li figure img")?.src : postType === "image" ? (post?.querySelector("shreddit-media-lightbox-listener .media-lightbox-img .preview-img")?.src || post?.querySelector("shreddit-dynamic-ad-link .media-lightbox-img .preview-img")?.src || post?.querySelector("shreddit-dynamic-ad-link .media-lightbox-img figure img")?.src) : postType === "video" ? post?.querySelector("shreddit-player")?.getAttribute("src") : null
        let tag             = Array.from(post?.querySelectorAll('[noun="post_flair"]'))?.map((pElem) => { return pElem?.querySelector("a")?.innerText })?.join(",")
        let community_name  = post?.getAttribute("subreddit-prefixed-name")
        let community_url   = post?.querySelector('a[data-testid="subreddit-name"]')?.href

        let userDetails     = post?.querySelector('a[data-testid="subreddit-name"]') || post?.querySelector("[noun='user_profile'] a") || post?.querySelector("[data-id='user-hover-card'] a")
        let user_id         = post?.getAttribute("subreddit-id")
        let user_name       = userDetails?.innerText?.trim()
        let user_url        = userDetails?.href
        let profilePic      = userDetails?.querySelector("faceplate-img")?.getAttribute("src")
        let date_time       = post?.querySelector("[slot='credit-bar']")?.querySelector("faceplate-timeago time")?.getAttribute("datetime")
        let timeago         = post?.querySelector("[slot='credit-bar']")?.querySelector("faceplate-timeago time")?.innerText
        const comments      = post?.getAttribute("comment-count")
        const moreimages    = Array.from(post?.querySelector("gallery-carousel ul")?.querySelectorAll("li figure img") || [])?.map((i) => { return i.src }) || []


        const socialFeed = {
            id,
            upvote,
            description,
            post_url: contentURL,
            community: {
                name: community_name,
                url: community_url,
            },
            user: {
                id: user_id,
                name: user_name,
                url: user_url,
                profilePic: profilePic
            },
            image_url: image_url || '',
            title,
            tag: tag,
            date_time,
            carouselImgs: moreimages,
            timeago,
            postType,
            videoPoster: postType === "video" ? post?.querySelector("shreddit-player")?.getAttribute("poster") : null,
            comments: parseInt(comments),
        }

      addToCurateitRedditTest(title, description, contentURL, image_url || '', false, socialFeed);

      // let vals = { collection_gems: 'gem1', tags: 'tag1', remarks: 'remark1' };  // Just an example, adjust this to your needs
      // window.grabLinkedInLikes(vals);
    });
    // Add the image to the div
    div.appendChild(img);
    let parentElement = bar.querySelector("[slot='credit-bar']");
    // Add the div to the action bar
    parentElement.appendChild(div);
  }
}

function addButtonToComments() {
  let bars = document.querySelectorAll(".Comment");
  for (let bar of bars) {
    if (bar.querySelector(".reddit-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "18px";
    img.style.height = "auto";
    img.style.cursor = "pointer";
    img.className = "reddit-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", function (e) {
      let commonParent = bar;
      if (commonParent) {
        let actor = commonParent.querySelector(
          'a[data-testid="comment_author_link"]'
        );
        imgUrl =
          commonParent.querySelector("img.ScrrUjzznpAqm92uwgnvO")?.src || "";
        if (actor) {
          actorName = actor.innerText || actor.textContent;
          actorName = actorName.trim();
        } else {
          console.log(
            'No childSpan with data-testid="comment_author_link"  found.'
          );
        }
        let child = commonParent.querySelector('div[data-testid="comment"]');
        if (child) {
          desc = child.innerText || child.textContent;
          desc = desc.trim();
        } else {
          console.log('No child with data-testid="comment" classes found.');
        }
        link = "https://www.reddit.com/user/" + actorName;
        const authorImg =
          commonParent
            ?.querySelector('img[data-testid="comment_author_icon"]')
            ?.querySelector("img[alt='User avatar']")?.src || "";
        const feed = {
          user: {
            name: actorName,
            url: link,
            profile_image_url: authorImg,
          },
        };
        addToCurateitRedditTest(actorName, desc, link, imgUrl, false, feed);
      } else {
        console.log("No common parent found.");
      }

      // let vals = { collection_gems: 'gem1', tags: 'tag1', remarks: 'remark1' };  // Just an example, adjust this to your needs
      // window.grabLinkedInLikes(vals);
    });
    // Add the image to the div
    div.appendChild(img);
    // Add the div to the action bar
    let buttonsDiv = bar.querySelector("._3KgrO85L1p9wQbgwG27q4y");
    buttonsDiv.appendChild(div);
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
