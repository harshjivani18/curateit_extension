let linkedInUrl = "https://www.linkedin.com/my-items/saved-posts/";
let checkLinkedInFullyLoaded = null;
let userProfileUrlRegex = new RegExp("https://www.linkedin.com/in/[^]+");
let userCompanyUrlRegex = new RegExp("https://www.linkedin.com/company/[^]+");

let linkedInCollectionId = null;
let linkedInSelectedTags = [];
let linkedInRemarks = "";
let isProfileImport = false;
let linkedInCurrentPage = "";

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (
    request.tab_url &&
    (request.tab_url.indexOf(linkedInUrl) > -1 ||
      userProfileUrlRegex.test(request.tab_url) ||
      userCompanyUrlRegex.test(request.tab_url))
  ) {
    if (checkLinkedInFullyLoaded) {
      clearInterval(checkLinkedInFullyLoaded);
      checkLinkedInFullyLoaded = null;
    }
    checkLinkedInFullyLoaded = setInterval(() => {
      if (
        userProfileUrlRegex.test(request.tab_url) ||
        userCompanyUrlRegex.test(request.tab_url)
      ) {
        linkedInUtils.onReady("save_linkedin_profile");
      } else {
        linkedInUtils.onReady("save_linkedin_post");
      }
    }, 500);
  }
});

//TODO::HERE STARTS
window.grabLinkedInLikes = async (vals) => {
  linkedInCollectionId = vals?.collection_gems;
  linkedInSelectedTags = vals?.tags;
  linkedInRemarks = vals?.remarks;
  const authenticateUser = await checkIsUserLoggedIn();
  if (
    userProfileUrlRegex.test(window.location.href) ||
    userCompanyUrlRegex.test(window.location.href)
  ) {
    linkedInCurrentPage = "save_linkedin_profile";
  } else {
    linkedInCurrentPage = "save_linkedin_post";
  }
  scrapeLinkedinPosts(authenticateUser, vals?.isImportProfile);
};

//New functions start
const checkIsUserLoggedIn = async () => {
  const text = await chrome?.storage?.sync.get(["userData"]);

  if (text && text?.userData && text?.userData?.apiUrl) {
    return {
      url: text.userData.apiUrl,
      token: text.userData.token,
      collectionId: text?.userData?.unfilteredCollectionId,
    };
  } else {
    window.panelToggle(`?open-extension`, true);
    return false;
  }
};

async function scrollWithDelayLinkedin(new_height) {
  window.scrollTo(0, new_height);

  if ($(".scaffold-finite-scroll__load-button").length) {
    $(".scaffold-finite-scroll__load-button").trigger("click");
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 100);
  });
}

async function scrapeLinkedinPosts(authenticateUser, isProfileImport) {
  $("#injected-overlay").css({ display: "block" });
  if ($(".scaffold-finite-scroll__load-button").length) {
    $(".scaffold-finite-scroll__load-button").trigger("click");
  }
  window.scrollTo(0, 0);
  let status_bar = $("#status-bar");

  if (linkedInCurrentPage === "save_linkedin_profile") {
    let userProfileDetails = document.getElementsByClassName("ph5 ")[0];

    let userId = window?.location?.href
      ?.replace("https://www.linkedin.com/in/", "")
      ?.split("/")[0];
    let userProfileImage = document
      .getElementsByClassName(
        "pv-top-card--photo text-align-left pv-top-card--photo-resize"
      )?.[0]
      ?.querySelector("img")?.src;
    let userName = userProfileDetails.querySelector("h1")?.innerText;
    let userGender =
      userProfileDetails.getElementsByClassName("text-body-small")?.[0]
        ?.innerText;
    let userDesc =
      userProfileDetails.getElementsByClassName("text-body-medium")?.[0]
        ?.innerText;
    let userTalksAbout =
      userProfileDetails.getElementsByClassName("text-body-small")?.[1]
        ?.innerText;
    let userLocation = userProfileDetails
      .getElementsByClassName("pv-text-details__left-panel mt2")?.[0]
      ?.querySelector("span")?.innerText;
    let userFollowers = "";
    let userConnections = "";
    const userStats = userProfileDetails
      .getElementsByClassName("pv-top-card--list pv-top-card--list-bullet")?.[0]
      ?.querySelectorAll("li");

    for (const state of userStats) {
      if (state?.innerText?.includes("connections")) {
        userConnections = state.innerText.replace("connections")?.trim();
      }
      if (state?.innerText?.includes("followers")) {
        userFollowers = state.innerText.replace("followers")?.trim();
      }
    }

    let userObj = convertUserProfileCurateItFormat(
      {
        id: userId,
        title: userName,
        gender: userGender,
        description: userDesc,
        // talks_about: userTalksAbout,
        location: userLocation,
        followers: userFollowers,
        connections: userConnections,
        profile_url: window.location.href,
        profile_image_url: userProfileImage,
        openToWork:
          document
            .querySelectorAll("a[data-view-name='profile-opportunity-card']")[0]
            ?.querySelector("h3")?.innerText === "Open to work",
        providingServices: document
          .querySelectorAll("a[data-view-name='profile-opportunity-card']")[1]
          ?.querySelector("p")?.innerText,
        about: document
          .querySelector("section[data-view-name='profile-card'] #about")
          ?.parentElement?.innerText.trim(),
      },
      authenticateUser
    );

    if (userObj.length) {
      // Update progress bar
      if (status_bar) {
        status_bar.html(`Ingesting User Profile<br/> 🚀`);
      }
      setTimeout(() => {
        handleLinkedInUserProfileAPI(userObj, authenticateUser);
      }, 1000);
    } else {
      linkedInUtils.resetAfterSubmit();
      alert("No User Data found!");
    }
  } else {
    const lastId = await fetchLastPostIdLinkedIn(authenticateUser);
    // Get the initial set of tweet elements on the page
    let type = "Posts";
    stop_scrapping = false;

    parsed_bookmarks = {
      keys: [],
      values: [],
    };

    let primaryColumn = $(".reusable-search__entity-result-list");
    let new_height = 0;
    let total_height = primaryColumn.height();
    let fail_safe_counter = 0;

    let postData = [];
    let posts = [];
    let id = null;

    while (!stop_scrapping) {
      await scrollWithDelayLinkedin(new_height, null);
      new_height += 250;
      total_height = primaryColumn.height();
      if (new_height >= total_height) {
        await linkedInUtils.sleep(1000);
        fail_safe_counter += 1;
        if (fail_safe_counter > 5) {
          stop_scrapping = true;
        }
      } else {
        fail_safe_counter = 0;
        posts = primaryColumn[0].querySelectorAll(
          ".reusable-search__result-container"
        );
        for (const post of posts) {
          const entityResult = $(post).find(".entity-result");
          // id = $(entityResult)
          //   .data("chameleon-result-urn")
          //   .replace("urn:li:activity:", "");
          id = post
            ?.querySelector("div[data-chameleon-result-urn]")
            ?.getAttribute("data-chameleon-result-urn")
            ?.replace("urn:li:activity:", "");

          if (lastId == id) {
            stop_scrapping = true;
            break;
          }
          const extractPost = extractLinkedInPostData(post);
          if (extractPost != null) {
            postData.push(extractPost);
          }
        }
      }
    }

    let parsed_tweets = linkedInUtils.linkedInRemoveDuplicates(postData);

    if (parsed_tweets) {
      // Update progress bar
      if (status_bar) {
        status_bar.html(`Ingesting ${parsed_tweets.length} ${type}<br/> 🚀`);
      }
      if (parsed_tweets.length) {
        setTimeout(() => {
          addBulkPosts(
            parsed_tweets.reverse(),
            authenticateUser,
            isProfileImport
          );
        }, 1000);
      } else {
        linkedInUtils.resetAfterSubmit();
        alert("No latest post found!");
      }
    }
  }
}

function extractLinkedInPostData(post) {
  const entityResult = $(post).find(".entity-result");
  const entityResultDom = post.querySelector(
    ".entity-result__content-container"
  );

  // Get the post url and id
  const urn = post
    ?.querySelector("div[data-chameleon-result-urn]")
    ?.getAttribute("data-chameleon-result-urn");
  const id = urn?.replace("urn:li:activity:", "");
  let postUrl = `https://www.linkedin.com/feed/update/${urn}`;

  // Get the post user data
  let user = {};
  const userHandle = $(entityResult).find(".entity-result__content-actor");
  const userProfile = $(post)
    .find(".entity-result__content-image")
    .find("img")
    .attr("src");
  const profile_url = $(post)
    .find(".entity-result__title-text")
    .find("a")
    .attr("href");
  const userTagLine = $(post).find(".entity-result__primary-subtitle").text();
  const user_name =
    $(post).find(".entity-result__content-image").find("img").attr("alt") ||
    post?.querySelector(".entity-result__title-text a span span")?.textContent;

  if (profile_url) {
    let userUrlObj = decodeUrl(profile_url);
    user.type = userUrlObj.path.includes("company") ? "organization" : "user";
    user.id = userUrlObj.path
      .replace("/in/", "")
      .replace("/company/", "")
      .replace("/", "");
    user.name = user_name;
    user.profile_url = decodeURIComponent(profile_url);
    user.screen_name = user_name;
    user.tag_line = userTagLine
      ? removeEscapeSequences(striptags(userTagLine))
          .replace("\n", "")
          .replace("\\", "")
          .trim()
      : "";
    user.profile_image_url = decodeURIComponent(userProfile);
  }

  const timeago = $(post)
    .find(".linked-area")
    .find(".entity-result__primary-subtitle")
    .next("p")
    .text()
    .replace("\n", "")
    .trim()
    .split("•")
    .filter(Boolean);
  let createdAt = null;
  if (timeago.length == 1) {
    createdAt = getDateTimeBefore(timeago[0].trim());
  } else if (timeago.length == 2) {
    createdAt = getDateTimeBefore(timeago[1].trim());
  }

  // Get the post text
  let fullText = entityResultDom
    .querySelector(".entity-result__content-summary")
    ?.textContent.replace("…see more", "");
  if (!fullText) {
    fullText = entityResultDom
      .querySelector(".entity-result__summary")
      ?.textContent.replace("…see more", "");
  }
  fullText = fullText
    ? removeEscapeSequences(striptags(fullText))
        .replace("\n", "")
        .replace("\\", "")
        .trim()
    : "";

  let taggedPost = {};
  let tagedPostHandle = entityResultDom.querySelector(
    "a.entity-result__content-embedded-object"
  );

  if (tagedPostHandle) {
    let tagPostUrl = tagedPostHandle ? tagedPostHandle.href : "";
    let tagPostMedia = tagedPostHandle
      ? tagedPostHandle.querySelector(
          "img.entity-result__embedded-object-image"
        )?.src
      : "";
    let tagPostContent = entityResultDom
      .querySelector(".entity-result__embedded-object-title")
      ?.textContent.trim();
    let isVideo = tagedPostHandle.querySelector(".ivm-view-attr__video-icon")
      ? true
      : false;

    taggedPost.url = tagPostUrl;
    taggedPost.has_video = isVideo;
    taggedPost.media = tagPostMedia ? tagPostMedia : "";
    taggedPost.content = tagPostContent
      ? removeEscapeSequences(tagPostContent)
          .replace("\n", "")
          .replace("\\", "")
          .trim()
      : "";
  }

  let media = entityResultDom.querySelector(
    "img.entity-result__embedded-object-image"
  )
    ? entityResultDom.querySelector("img.entity-result__embedded-object-image")
        .src
    : "";
  let has_video = entityResultDom.querySelector(".ivm-view-attr__video-icon")
    ? true
    : false;

  // Return an object with the post data
  return {
    id,
    postUrl,
    createdAt,
    fullText,
    media,
    has_video,
    user,
    taggedPost,
  };
}

function convertUserProfileCurateItFormat(userDetails, authenticateUser) {
  const images1 =
    Array.from(document?.images)?.map((img) => {
      return img.src;
    }) || [];
  // const icon    = document.querySelector('link[rel="icon"]')?.href || ""
  let userGem = {
    title: userDetails.title,
    description: userDetails.description,
    media_type: "Profile",
    platform: "LinkedIn",
    post_type: "Post",
    author: authenticateUser?.userId,
    url: userDetails.profile_url,
    media: {
      covers: userDetails?.profile_image_url
        ? [userDetails?.profile_image_url]
        : [],
    },
    metaData: {
      covers: userDetails?.profile_image_url
        ? [userDetails?.profile_image_url]
        : [],
      docImages: userDetails?.profile_image_url
        ? [userDetails?.profile_image_url, ...images1]
        : images1,
      icon: {
        type: "image",
        icon: "https://d3jrelxj5ogq5g.cloudfront.net/webapp/icons/linkedin.png",
      },
      defaultThumbnail: userDetails?.profile_image_url || null,
      defaultIcon:
        "https://d3jrelxj5ogq5g.cloudfront.net/webapp/icons/linkedin.png",
    },
    collection_gems: linkedInCollectionId,
    remarks: linkedInRemarks,
    tags: linkedInSelectedTags,
    is_favourite: true,
    socialfeed_obj: userDetails,
  };
  // if (userDetails?.profile_image_url) {
  //   userGem.media.covers.push(userDetails.profile_image_url);
  //   userGem.metaData.covers.push(userDetails.profile_image_url);
  // }
  linkedInCollectionId = null;
  linkedInSelectedTags = [];
  linkedInRemarks = "";
  return [userGem];
}

function convertCurateItFormat(posts, authenticateUser) {
  let gems = [];
  posts.forEach((post) => {
    if (post?.user?.id) {
      const images2 =
        Array.from(document?.images)?.map((img) => {
          return img.src;
        }) || [];

      let userJem = {
        title: post.user.name,
        description: "",
        media_type: "Profile", // SocialFeed
        platform: "LinkedIn",
        post_type: "Post",
        author: authenticateUser?.userId,
        url: post.user.profile_url,
        media: {
          covers: [post.user.profile_image_url],
        },
        metaData: {
          docImages: [post.user.profile_image_url, ...images2],
          icon: {
            type: "image",
            icon: "https://d3jrelxj5ogq5g.cloudfront.net/webapp/icons/linkedin.png",
          },
          covers: [post.user.profile_image_url],
          defaultThumbnail: post.user.profile_image_url,
          defaultIcon:
            "https://d3jrelxj5ogq5g.cloudfront.net/webapp/icons/linkedin.png",
        },
        collection_gems: linkedInCollectionId,
        remarks: linkedInRemarks,
        tags: linkedInSelectedTags,
        is_favourite: true,
        socialfeed_obj: {
          user: post?.user,
        },
      };
      // if (post?.user?.profile_image_url) {
      //   userJem.media.covers.push(post.user.profile_image_url);
      //   userJem.metaData.covers.push(post.user.profile_image_url);
      // }
      gems.push(userJem);

      let postGem = {
        title: post.fullText.slice(0, 50) + "...",
        description: post.fullText,
        media_type: "SocialFeed",
        platform: "LinkedIn",
        post_type: "Bookmark",
        author: authenticateUser?.userId,
        url: post.postUrl,
        media: {
          covers: post?.media ? [post.media] : [],
        },
        metaData: {
          docImages: post?.media ? [post.media, ...images2] : images2,
          covers: post?.media ? [post.media] : [],
          defaultThumbnail: post?.media ? post.media : null,
          defaultIcon:
            "https://d3jrelxj5ogq5g.cloudfront.net/webapp/icons/linkedin.png",
          icon: {
            type: "image",
            icon: "https://d3jrelxj5ogq5g.cloudfront.net/webapp/icons/linkedin.png",
          },
        },
        collection_gems: linkedInCollectionId,
        remarks: linkedInRemarks,
        tags: linkedInSelectedTags,
        is_favourite: true,
        socialfeed_obj: post,
      };
      // if (post?.media) {
      //   postGem.media.covers.push(post.media);
      // }
      gems.push(postGem);
    }
  });
  linkedInCollectionId = null;
  linkedInSelectedTags = [];
  linkedInRemarks = "";
  return gems;
}

async function handleLinkedInPostAPI(posts, authenticateUser, isProfileImport) {
  // createPayloadFile(posts, "linkedin-payload.txt")
  const dataArray = posts;
  const chunkSize = 20;
  let flag_ok = false;

  for (let i = 0; i < dataArray.length; i += chunkSize) {
    const chunk = dataArray.slice(i, i + chunkSize);

    let requestObj = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authenticateUser.token}`,
      },
      body: JSON.stringify({ data: chunk }),
    };
    try {
      const response = await fetch(
        `${authenticateUser?.url}/api/store-gems?isProfile=${isProfileImport}`,
        requestObj
      );
      // flag_ok = response.ok;
    } catch (error) {
      // flag_ok = false;
      continue;
    }
  }

  fetch(`${authenticateUser?.url}/api/gamification-score?module=gem`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authenticateUser.token}`,
    },
  });

  linkedInUtils.resetAfterSubmit();
  // if (flag_ok) {
  alert("Post submited successfully");
  window.panelToggle(`?refresh-gems`, true);
  // } else {
  //     alert('Something Went Wrong!');
  // }
}

async function handleLinkedInUserProfileAPI(userData, authenticateUser) {
  const dataArray = userData;
  let flag_ok = false;

  let requestObj = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authenticateUser.token}`,
    },
    body: JSON.stringify({ data: dataArray }),
  };
  try {
    const response = await fetch(
      `${authenticateUser?.url}/api/store-gems?isProfile=true`,
      requestObj
    );
    flag_ok = response.ok;
  } catch (error) {
    flag_ok = false;
  }
  fetch(`${authenticateUser?.url}/api/gamification-score?module=gem`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authenticateUser.token}`,
    },
  });

  linkedInUtils.resetAfterSubmit();
  if (flag_ok) {
    alert("User details submitted successfully.");
    window.panelToggle(`?refresh-gems`, true);
  } else {
    alert("Something Went Wrong!");
  }
}

async function fetchLastPostIdLinkedIn(authenticateUser) {
  let id = null;
  // let id = 7057585103396343808
  let requestObj = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authenticateUser.token}`,
    },
  };

  let url = `${authenticateUser?.url}/api/fetch-gems?type=SocialFeed&platform=LinkedIn&posttype=Bookmark&isLatest=true`;

  const response = await fetch(url, requestObj);

  const jsonData = await response.json();

  id = jsonData?.data?.socialfeed_obj?.id;

  return id;
}

function addBulkPosts(posts, authenticateUser, isProfileImport) {
  let jems = convertCurateItFormat(posts, authenticateUser);

  handleLinkedInPostAPI(jems, authenticateUser, isProfileImport);
}

function createLinkedInProfileImportBtn(html) {
  var template = document.createElement("template");
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild; // returns HTML element
}

function linkedInInit(page) {
  console.log("linkedInInit called ");
  let header = null;
  let btnLabel = null;
  let mesLabel = null;
  linkedInCurrentPage = page;
  if (page == "save_linkedin_post") {
    header = $(".workflow-results-container").find("h1");
    btnLabel = "Posts";
    mesLabel = "Your Linkedin Posts";
  }

  if (page == "save_linkedin_profile") {
    btnLabel = "Profile";
    mesLabel = "User Profile Details";
  }

  let body = $("body");
  let is_injected_button_exists =
    Array.from($("#injected-button")).length !== 0;
  if (!is_injected_button_exists) {
    if (page == "save_linkedin_profile") {
      var profileInjectedBtn = createLinkedInProfileImportBtn(
        `<button id="injected-button" style="font-size: 14px; margin-top: 10px; border: 1px solid gray;cursor: pointer;background: white;border-radius: 16px;color: black;padding: 6px 10px;font-weight: 600;display: inline-flex;align-items: center;"><img src="https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png" width="20" style="margin-right: 5px;"/>Import ${btnLabel}</button>`
      );

      // document.body.appendChild(profileInjectedBtn)

      // header.append(`<button id="injected-button" style="font-size: 14px;border: 1px solid gray;cursor: pointer;background: white;border-radius: 16px;color: black;padding: 6px 10px;font-weight: 600;display: inline-flex;align-items: center;"><img src="https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png" width="20" style="margin-right: 5px;"/>Import ${btnLabel}</button>`)

      const bodyElems = Array.from(document.getElementsByClassName("ph5"));
      if (bodyElems.length !== 0) {
        const bodyElem = bodyElems[0];
        bodyElem.appendChild(profileInjectedBtn);
      }
      console.log("profileInjectedBtn : ", profileInjectedBtn);

      // let elem = document.getElementsByClassName("pvs-profile-actions")?.[0]
      // if (!elem) {
      //   elem = document.getElementsByClassName("org-top-card__primary-actions")?.[0]?.parentElement
      // }
      // elem?.appendChild(profileInjectedBtn);
    } else {
      header.append(
        `<button id="injected-button" style="font-size: 14px;border: 1px solid gray;margin-left: 30px;margin-right: 30px;cursor: pointer;background: white;border-radius: 16px;color: black;padding: 6px 10px;font-weight: 600;display: inline-flex;align-items: center;position: absolute;top: 18px;"><img src="https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png" width="20" style="margin-right: 5px;"/>Import ${btnLabel}</button>`
      );
    }
    let is_injected_overlay_exists = $("#injected-overlay").length;
    if (!is_injected_overlay_exists) {
      body.append(
        `<div id="injected-overlay" style="font-size:50px;display:none;font-weight:800;position: fixed;width: 100%;height: 100%;top: 0;left: 0;right:0;bottom: 0;background: linear-gradient(90deg, rgba(16,95,211, 0.8), rgba(16,95,211, 0.8));z-index: 99; font-family: Roboto, Helvetica, Arial, sans-serif;"><div style="position: absolute;top: 50%;left: 50%;font-size: 50px;color: white;transform: translate(-50%,-50%);-ms-transform: translate(-50%,-50%);text-align: center;"><span id="status-bar">Sit tight, we’re grabbing <br/> ${mesLabel}...<br/></span></div><div style="position: absolute;top: 90%;left: 90%;"></div></div>`
      );
    } else {
      let status_bar = $("#status-bar");
      if (status_bar) {
        status_bar.html(`Sit tight, we’re grabbing <br/> ${mesLabel}...<br/>`);
      }
    }
    $("#injected-button").click(async function () {
      linkedInCollectionId = null;
      linkedInSelectedTags = [];
      linkedInRemarks = "";
      const authenticateUser = await checkIsUserLoggedIn();
      if (authenticateUser?.token) {
        function convertString(str) {
          return str?.toLowerCase().split(" ").join("-");
        }

        if (page == "save_linkedin_profile") {
          let userProfileDetails = document.getElementsByClassName("ph5 ")[0];
          let userId = window?.location?.href
            ?.replace("https://www.linkedin.com/in/", "")
            ?.split("/")[0];
          let userProfileImage = document
            .getElementsByClassName(
              "pv-top-card-profile-picture__container"
            )?.[0]
            ?.querySelector("img")?.src;
          let userName = userProfileDetails.querySelector("h1")?.innerText;
          let userGender =
            userProfileDetails.getElementsByClassName("text-body-small")?.[0]
              ?.innerText;
          let userDesc =
            userProfileDetails.getElementsByClassName("text-body-medium")?.[0]
              ?.innerText;
          let userTalksAbout =
            userProfileDetails.getElementsByClassName("text-body-small")?.[1]
              ?.innerText;
          let userLocation = userProfileDetails
            .getElementsByClassName("pv-text-details__left-panel mt2")?.[0]
            ?.querySelector("span")?.innerText;
          let userFollowers = "";
          let userConnections = "";
          const userStats =
            userProfileDetails
              .getElementsByClassName(
                "pv-top-card--list pv-top-card--list-bullet"
              )?.[0]
              ?.querySelectorAll("li") || [];

          for (const state of userStats) {
            if (state?.innerText?.includes("connections")) {
              userConnections = state.innerText.replace("connections")?.trim();
            }
            if (state?.innerText?.includes("followers")) {
              userFollowers = state.innerText.replace("followers")?.trim();
            }
          }
          const images3 =
            Array.from(document?.images)?.map((img) => {
              return img.src;
            }) || [];
          const message = {
            post: {
              title: userName,
              description: userDesc,
              media_type: "Profile",
              platform: "LinkedIn",
              post_type: "SaveToCurateit",
              type: "LinkedIn",
              url: window?.location?.href,
              media: {
                covers: [userProfileImage],
              },
              metaData: {
                covers: [userProfileImage],
                docImages: [userProfileImage, ...images3],
                icon: {
                  type: "image",
                  icon: "https://d3jrelxj5ogq5g.cloudfront.net/webapp/icons/linkedin.png",
                },
                defaultThumbnail: userProfileImage,
                defaultIcon:
                  "https://d3jrelxj5ogq5g.cloudfront.net/webapp/icons/linkedin.png",
              },
              collection_gems: [],
              remarks: "",
              tags: [],
              is_favourite: true,
              socialfeed_obj: {
                id: convertString(userName),
                title: userName,
                description: userDesc,
                profile_url: window.location.href,
                profile_image_url: userProfileImage,
                userGender: userGender,
                userTalksAbout: userTalksAbout,
                userLocation: userLocation,
                userFollowers: userFollowers,
                userConnections: userConnections,
                userId: userId,
              },
            },
          };

          chrome.storage.local.set({
            socialObject: message,
          });
          window.panelToggle(`?add-profile`, true, true);
        } else {
          window.panelToggle(`?add-import-details`, true, false);
        }
      }
    });
  }
}

let linkedInUtils = {
  onReady: (page) => {
    if (page) {
      clearInterval(checkLinkedInFullyLoaded);
      checkLinkedInFullyLoaded = null;

      linkedInInit(page);
    }
  },
  sleep: (timeout) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, timeout);
    });
  },
  resetAfterSubmit: (type) => {
    window.scrollTo(0, 0);
    $("#injected-overlay").css({ display: "none" });

    $("#injected-button").unbind("click");
    $("#injected-button").click(async function () {
      linkedInCollectionId = null;
      linkedInSelectedTags = [];
      linkedInRemarks = "";
      const authenticateUser = await checkIsUserLoggedIn();
      if (authenticateUser?.token) {
        window.panelToggle(
          `?add-profile`,
          true,
          linkedInCurrentPage === "save_linkedin_profile"
        );
      }
    });

    let status_bar = $("#status-bar");
    if (status_bar) {
      status_bar.html(`Sit tight, we’re grabbing <br/> your posts...<br/>`);
    }
  },
  linkedInRemoveDuplicates: (arr) => {
    const map = new Map();
    let uniqueArr = [];
    arr.forEach((post) => {
      if (!map.has(post.id)) {
        uniqueArr.push(post);
        map.set(post.id, true);
      }
    });
    return uniqueArr;
  },
};
