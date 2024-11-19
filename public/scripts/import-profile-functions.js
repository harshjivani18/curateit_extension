let gitCollId = null
let gitSelectedTags=[]
let gitRemarks=""

function convertString(str) {
    return str?.toLowerCase().split(" ").join("-");
  }

//twitter
window.TwitterProfile = (open=true) => {
                    function convertString(str) {
                        return str?.toLowerCase().split(" ").join("-");
                    }
                    let userObject={}
                    const primaryColumn = document?.querySelector('[data-testid="primaryColumn"]')
                    // const userData = primaryColumn?.getElementsByClassName('css-1dbjc4n r-1jgb5lz r-1ye8kvj r-13qz1uu')?.[0]?.childNodes[0]

                    userObject.description = primaryColumn?.querySelector('[data-testid="UserDescription"]')?.innerText
                    userObject.id = primaryColumn?.querySelector('[data-testid="UserName"]')?.children?.[0]?.children?.[1]?.children?.[1]?.querySelector("span").innerText
                    userObject.url = userObject?.id ? `https://twitter.com/${userObject.id.replace('@', '')}` : ''
                    userObject.image = primaryColumn?.querySelector('img[src*="profile_images/"]').src

                    userObject.name = primaryColumn?.querySelector('[data-testid="UserName"]')?.children?.[0]?.children?.[1]?.children?.[0]?.querySelector("span").innerText
                    userObject.banner_image = primaryColumn?.querySelector('img[src*="profile_banners/"]')?.src
                    userObject.location = primaryColumn?.querySelector('[data-testid="UserLocation"]')?.innerText
                    userObject.user_link = primaryColumn?.querySelector('[data-testid="UserUrl"]')?.href
                    userObject.joined = primaryColumn?.querySelector('[data-testid="UserJoinDate"]')?.innerText
                    userObject.following = primaryColumn.querySelector('a[href*="/following"]')?.querySelector("span")?.innerText
                    userObject.followers = primaryColumn.querySelector('a[href*="followers"]')?.querySelector("span")?.innerText
                    const images2 = Array.from(document?.images)?.map((img) => { return img.src }) || []
                    const icon    = document.querySelector('link[rel="mask-icon"]')?.href || ""
                    const message = {
                        post: {
                          title: userObject.name,
                          description: userObject.description,
                          media_type: "Profile",
                          platform: "Twitter",
                          post_type: "SaveToCurateit",
                          type: "Twitter",
                          url: window?.location?.href,
                          media: {
                            covers: [userObject.image],
                          },
                          metaData: {
                            covers: [userObject.image],
                            docImages: [userObject.image, ...images2],
                            defaultIcon: icon !== "" ? icon : null,
                            defaultThumbnail: userObject.image,
                            icon: icon !== "" ? { type: "image", icon } : null,
                          },
                          collection_gems: [],
                          remarks: "",
                          tags: [],
                          is_favourite: true,
                          socialfeed_obj: {
                            id: convertString(userObject.name),
                            title: userObject.name,
                            description: userObject.description,
                            profile_url: window.location.href,
                            profile_image_url: userObject.image,
                            banner_image: userObject.banner_image,
                            location: userObject.location,
                            user_link: userObject.user_link,
                            joined: userObject.joined,
                            following: userObject.following,
                            followers:userObject.followers
                          },
                        },
                      };
                      chrome.storage.local.set({
                        socialObject: message,
                      });
                      if(open){
                        window.panelToggle(`?add-profile`, true, true)
                      }
}


//github
function convertGithubProfileCurateItFormat (userDetails, authenticateUser) {
    const images = Array.from(document?.images)?.map((img) => { return img.src }) || []
    const icon   = document?.querySelector('link[rel="icon"]')?.href || ''
    let userJem = {
        title: userDetails?.name || userDetails?.username,
        description: userDetails?.description,
        platform: "Github",
        media_type: "Profile",
        post_type: "Post",
        author: authenticateUser?.userId,
        url: `https://github.com/${userDetails?.username}`,
        media: { covers: [] },
        metaData: { covers: [], docImages: images, defaultIcon: icon !== "" ? icon : null, defaultThumbnail: images.length > 0 ? images[0] : null, icon: icon !== "" ? { icon, type: "image" } : null },
        collection_gems: gitCollId,
        remarks: gitRemarks,
        tags: gitSelectedTags,
        is_favourite: true,
        socialfeed_obj: {...userDetails,
            totalContribution: document.querySelector("#user-profile-frame .js-yearly-contributions h2")?.innerText?.trim()?.replace(" contributions in the last year",""),
            totalRepositories: document.querySelector("#repositories-tab span[title]")?.getAttribute("title"),
            stars: document.querySelector("#stars-tab span[title]")?.getAttribute("title"),
        }
    }
    if (userDetails?.image) {
        userJem.media.covers.push(userDetails.image)
        userJem.metaData.covers.push(userDetails.image)
    }
    gitCollId = null;
    gitSelectedTags = [];
    gitRemarks = "";

    return [{...userJem}]
}

window.GithubProfile = (authenticateUser,open=true) => {
    let mainColumn = document.querySelector("main");
    let userDetails = {};
  
    let navBar = mainColumn?.querySelector('[aria-label="User profile"]');
    let sideBar = mainColumn.getElementsByClassName(
      "js-profile-editable-replace"
    )[0];
    let socialLinks = sideBar?.querySelectorAll('[itemprop="social"]');
    let repoList = mainColumn
      ?.querySelectorAll("turbo-frame")?.[0]
      ?.querySelector("ol");
    let repos = repoList?.querySelectorAll("li");
  
    userDetails.stars = navBar
      ?.querySelectorAll('[data-tab-item="stars"]')?.[0]
      ?.querySelector("span")?.innerText;
    userDetails.repositories = navBar
      ?.querySelectorAll('[data-tab-item="repositories"]')?.[0]
      ?.querySelector("span")?.innerText;
  
    userDetails.image = sideBar?.querySelectorAll("img")?.[0]?.src;
    userDetails.name = sideBar?.querySelectorAll("span")?.[0]?.innerText;
    userDetails.screen_name = sideBar?.querySelectorAll("span")?.[0]?.innerText;
    userDetails.username = sideBar
      ?.querySelectorAll("span")?.[1]
      ?.innerText?.split(" ")?.[0];
    userDetails.description = sideBar?.getElementsByClassName(
      "p-note user-profile-bio mb-3 js-user-profile-bio f4"
    )?.[0]?.innerText;
    userDetails.followers = sideBar?.getElementsByClassName(
      "text-bold color-fg-default"
    )?.[0]?.innerText;
    userDetails.following = sideBar?.getElementsByClassName(
      "text-bold color-fg-default"
    )?.[1]?.innerText;
    userDetails.company = sideBar?.querySelector(
      '[itemprop="worksFor"]'
    )?.innerText;
    userDetails.location = sideBar?.querySelector(
      '[itemprop="homeLocation"]'
    )?.innerText;
    userDetails.localTime = sideBar?.querySelector(
      '[itemprop="localTime"]'
    )?.innerText;
    userDetails.website = sideBar?.querySelector('[itemprop="url"]')?.innerText;
    userDetails.email = sideBar?.querySelector('[itemprop="email"]')?.innerText;
    userDetails.profile_url = `https://github.com/${userDetails?.username}`;
  
    if (socialLinks?.length) {
      userDetails.socialLinks = {};
      for (const links of socialLinks) {
        let link = links?.querySelector("a")?.href;
        let platform = links?.querySelector("title")?.innerHTML;
        if (!platform) {
          platform = "social";
        }
        userDetails.socialLinks[platform] = link;
      }
    }
  
    if (repos?.length) {
      let repoKey = "";
      if (
        repoList?.parentElement
          ?.querySelector("h2")
          ?.innerText?.toLocaleLowerCase()
          .includes("popular")
      ) {
        repoKey = "popular";
      } else if (
        repoList?.parentElement
          ?.querySelector("h2")
          ?.innerText?.toLocaleLowerCase()
          .includes("pinned")
      ) {
        repoKey = "pinned";
      }
      if (repoKey) {
        userDetails[repoKey] = [];
        for (const repo of repos) {
          let repoDetails = {
            link: repo?.querySelectorAll("a")?.[0]?.href,
            name: repo?.querySelectorAll("a")?.[0]?.innerText,
            description: repo?.querySelectorAll("p")?.[0]?.innerText,
            language: repo?.querySelector('[itemprop="programmingLanguage"]')
              ?.innerText,
            forkCount: repo
              ?.querySelector('[aria-label="forks"]')
              ?.parentElement?.innerText?.trim(),
          };
          userDetails[repoKey].push({ ...repoDetails });
        }
      }
    }
  
    let userProfileGem = convertGithubProfileCurateItFormat(
      userDetails,
      authenticateUser
    );
    
    const message = {
        post: {
          title: userProfileGem[0].title,
          description: userProfileGem[0].description,
          media_type: "Profile",
          platform: "Github",
          post_type: "SaveToCurateit",
          type: "Github",
          url: userProfileGem[0].url,
          media: {
            covers: [userProfileGem[0].media.covers[0]],
          },
          metaData: {
            covers: [userProfileGem[0].media.covers[0]],
            docImages: userProfileGem[0]?.metaData?.docImages || [], 
            defaultThumbnail: userProfileGem[0]?.media?.covers[0] || "", 
            icon: userProfileGem[0]?.metaData?.icon || null,
            defaultIcon: userProfileGem[0]?.metaData?.defaultIcon || "",
          },
          collection_gems: [],
          remarks: "",
          tags: [],
          is_favourite: true,
          socialfeed_obj: userProfileGem[0].socialfeed_obj,
        },
      };
      chrome.storage.local.set({
        socialObject: message,
      });
      if(open){
        window.panelToggle(`?add-profile`, true, true)
      }
}

//instagram

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

const checkIsImgValidImportProfile = async (url,authenticateUser) => {
    const sessionToken = authenticateUser.token;
    const apiUrl = authenticateUser.apiUrl;
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

window.InstagramProfile = async (authenticateUser,open=true) => {
  let bars = document.querySelectorAll("header section ul");

  let posts;
  let followers;
  let following;
  let url;

  for (let bar of bars) {
      if (bar.querySelector(".bulkImportBtn")) continue;
      posts = bar
        .querySelectorAll("li")[0]
        ?.querySelector("span")
        ?.innerText.trim();
      followers = bar
        .querySelectorAll("li")[1]
        ?.querySelector("span")
        ?.innerText.trim();
      following = bar
        .querySelectorAll("li")[2]
        ?.querySelector("span")
        ?.innerText.trim();
      url = window.location.href;
  }

    const importData = await chrome?.storage?.sync.get(["importData"]);
    let ogData = await fetchOpenGraphData(window.location.href);
    const ogDataImg = await checkIsImgValidImportProfile(ogData["og:image"],authenticateUser);
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
    if(open){
        window.panelToggle(`?add-profile`, true, true)
      }
}


//linkedin

window.LinkedInProfile = async (open=true) => {
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
          const images3 = Array.from(document?.images)?.map((img) => { return img.src }) || [];
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
                docImages: [ userProfileImage, ...images3 ],
                icon: { type: "image", icon: "https://d3jrelxj5ogq5g.cloudfront.net/webapp/icons/linkedin.png" },
                defaultThumbnail: userProfileImage,
                defaultIcon: "https://d3jrelxj5ogq5g.cloudfront.net/webapp/icons/linkedin.png"
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
          if(open){
        window.panelToggle(`?add-profile`, true, true)
      }
}

//medium

window.MediumProfile = async (open=true) => {
  const images4 = Array.from(document?.images)?.map((img) => { return img.src }) || [];
                    const icon    = document.querySelector('link[rel="icon"]')?.href || ""
                    let userData={}
                    const mainColumn = document.querySelector('main')
                    userData.url = mainColumn?.nextSibling?.querySelector('a')?.href?.replace(articleReplaceEndRegex, '')
                    userData.image = mainColumn?.nextSibling?.querySelector('img')?.src
                    userData.name = mainColumn?.nextSibling?.querySelector('span')?.innerText
                    userData.description = mainColumn?.nextSibling?.querySelector('div p')?.innerText
                    userData.followers = mainColumn?.nextSibling?.querySelectorAll('span')?.[1]?.innerText.replace('Lists', '')
                    if (mainColumn?.nextSibling?.querySelectorAll('span')?.[1]?.parentElement.nextElementSibling?.querySelectorAll('span').length >= 2){
                        userData.user_tag = mainColumn?.nextSibling?.querySelectorAll('span')?.[1].parentElement.nextElementSibling?.querySelectorAll('p')[1]?.innerText.replace('Edit profile', '')
                    } else {
                        userData.user_tag = mainColumn?.nextSibling?.querySelectorAll('span')?.[1].parentElement.nextElementSibling?.querySelectorAll('p')[0]?.innerText.replace('Edit profile', '')
                    }
                    userData.id = user_id
                    const message = {
                        post: {
                            title: userData.name,
                            description: userData.description,
                            media_type: "Profile",
                            platform: "Medium",
                            post_type: "SaveToCurateit",
                            type: "Medium",
                            url: window?.location?.href,
                            media: {
                                covers: [userData.image],
                            },
                            metaData: {
                                covers: [userData.image],
                                docImages: [ userData.image, ...images4 ],
                                icon: icon !== "" ? { type: "image", icon } : null,
                                defaultIcon: icon !== "" ? icon : null,
                                defaultThumbnail: userData.image,
                            },
                            collection_gems: [],
                            remarks: "",
                            tags: [],
                            is_favourite: true,
                            socialfeed_obj: {
                                id: convertString(userData.name),
                                title: userData.name,
                                description: userData.description,
                                profile_url: window.location.href,
                                profile_image_url: userData.image,
                                user_tag: userData.user_tag,
                                followers:userData.followers
                            },
                        },
                    };
                    chrome.storage.local.set({
                        socialObject: message,
                    });
                    if(open){
        window.panelToggle(`?add-profile`, true, true)
      }
}

//youtube

window.YoutubeProfile = async (open=true) => {
    let bars = document.querySelectorAll("#inner-header-container div#buttons");

    let bar = bars[0]
    let parentElement = bar.parentNode

    let title = parentElement
          .querySelector("#text-container")
          .textContent.trim();
    let description = parentElement
          .querySelector("#content")
          .textContent.trim();
    let imgUrl = parentElement.parentNode.querySelector("#avatar img").src;
    const images1 = Array.from(document?.images)?.map((img) => { return img.src }) || []
    const icon    = document.querySelector("link[rel*='icon']")?.href || ""
    const message = {
      post: {
        title: title,
        description: description,
        media_type: "Profile",
        platform: "Youtube",
        post_type: "SaveToCurateit",
        type: "Youtube",
        url: window.location.href,
        media: {
          covers: [imgUrl],
        },
        metaData: {
          covers: [imgUrl],
          docImages: [imgUrl, ...images1],
          icon: icon !== "" ? { type: "image", icon } : null,
          defaultThumbnail: imgUrl,
          defaultIcon: icon !== "" ? icon : null,
        },
        collection_gems: [],
        remarks: "",
        tags: [],
        is_favourite: true,
        socialfeed_obj: {
          id: convertString(title),
          title: title,
          description: description,
          profile_url: window.location.href,
        },
      },
    };
    chrome.storage.local.set({
      socialObject: message,
    });
    if(open){
        window.panelToggle(`?add-profile`, true, true)
      }
  }

window.RedditProfile = async (authenticateUser,open=true) => {
  let redditCollectionId = null;
  let redditSelectedTags = [];
  let redditRemarks = "";
  let redditImportType = "profile";
  if (authenticateUser?.token) {
      let rUser={}
      const uContainer = document?.getElementsByClassName('_3Im6OD67aKo33nql4FpSp_')?.[0];
      const uSocialLinks = uContainer?.querySelector('[aria-label="Social Links"]')?.querySelectorAll('a')

      let userProfilePicture = document.querySelector('img[data-testid="profile-icon"]')?.src
      let userProfileNftDoodle = document.querySelectorAll("img.absolute")[1]?.src
      if (userProfilePicture) {
          rUser.image = userProfilePicture;
      } else if (userProfileNftDoodle) {
          rUser.image = userProfileNftDoodle;
      }

      rUser.banner_image = uContainer?.querySelector('._2ZyL7luKQghNeMnczY3gqW')?.style?.backgroundImage?.replace('url("', '')?.replace('")', '');
      rUser.title = document.querySelector('h1')?.textContent?.trim();
      rUser.description = document.querySelector('p[data-testid="profile-description"]')?.textContent?.trim();
      rUser.display_name = document.querySelectorAll("main p")[0]?.textContent?.trim()
      rUser.karma = document.querySelectorAll('span[data-testid="karma-number"]')[0]?.textContent?.trim().replaceAll(",","")
      rUser.commentKarma = document.querySelectorAll('span[data-testid="karma-number"]')[1]?.textContent?.trim().replaceAll(",","")
      rUser.cake_day = document.querySelector('p time[datetime]')?.textContent?.trim()

      if (uSocialLinks?.length) {
          rUser.social_media = []
          for (const link of uSocialLinks) {
              rUser.social_media.push({
                  site: link?.host,
                  url: link?.href,
                  username: link?.innerText,
              })
          }
      }
      const images4 = Array.from(document?.images)?.map((img) => { return img.src }) || [];
      const icon    = "https://www.redditstatic.com/shreddit/assets/favicon/64x64.png"
      const message = {
          post: {
            title: rUser.display_name,
            description: rUser.description,
            media_type: "Profile",
            platform: "Reddit",
            post_type: "SaveToCurateit",
            type: "Reddit",
            url: window.location.href,
            media: {
              covers: [rUser.image],
            },
            metaData: {
              covers: [rUser.image],
              docImages: [rUser.image, ...images4],
              defaultThumbnail: rUser.image,
              defaultIcon: icon !== "" ? icon : null,
              icon: icon !== "" ? { type: "image", icon } : null,
            },
            collection_gems: [],
            remarks: "",
            tags: [],
            is_favourite: true,
            socialfeed_obj: {
              id: convertString(rUser.display_name),
              title: rUser.display_name,
              description: rUser.description,
              profile_url: window.location.href,
              profile_image_url: rUser.image,
              banner_image_url: rUser.banner_image,
              cake_day: rUser.cake_day,
              karma: rUser.karma,
            },
          },
        };
        chrome.storage.local.set({
          socialObject: message,
        });
      if(open){
        window.panelToggle(`?add-profile`, true, true)
      }
  }
}