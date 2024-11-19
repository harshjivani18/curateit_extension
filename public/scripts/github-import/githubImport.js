let gitHubUrl = 'https://github.com/[^.]+';
let gitHubStarUrl = new RegExp('https://github.com/[^.]+?tab=stars');
let lastStaredRepo = ''
let repos = []
let more_repos_to_scrape = false
let time = null;

let checkGitHubFullyLoaded = null;
let isProfileImport = false

let gitCollectionId = null;
let gitSelectedTags = [];
let gitRemarks = "";

const GIT_STAR = 'star', GIT_PROFILE = 'profile'

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    const globalRegex = new RegExp(gitHubUrl, 'g');
    if (request.tab_url && globalRegex.test(request.tab_url)) {
        if (checkGitHubFullyLoaded) {
            clearInterval(checkGitHubFullyLoaded);
            checkGitHubFullyLoaded = null;
        }
        checkGitHubFullyLoaded = setInterval(() => {
            if(gitHubStarUrl.test(request.tab_url)) {
                if (!!document?.querySelectorAll('[injected-button-on-page="profile"]')?.[0]) {
                    document?.querySelector('#injected-button')?.remove()
                }
                utilsGit.onReady(GIT_STAR);
            } else if (!!document.querySelector('[id="pinned-items-modal-wrapper"]')) {
                utilsGit.onReady(GIT_PROFILE);
            } else {
                document?.querySelector('#injected-button')?.remove()
            }
        }, 500);
    }
});

//TODO::HERE STARTS
window.grabGitStars = async (vals) => {
    gitCollectionId = vals?.collection_gems;
    gitSelectedTags = vals?.tags;
    gitRemarks = vals?.remarks;
    isProfileImport = vals?.isImportProfile;
    if (!!document?.querySelectorAll('[injected-button-on-page="profile"]')[0]){
        handleGithubStarReposScrap(GIT_PROFILE, vals?.isImportProfile)
    } else {
        handleGithubStarReposScrap(GIT_STAR, vals?.isImportProfile)
    }
}

//New functions start
const checkIsUserLoggedIn = async () => {
    const text = await chrome?.storage?.sync.get(["userData"])
  
    if (text && text?.userData && text?.userData?.apiUrl) {
      return {
        url: text.userData.apiUrl,
        token: text.userData.token,
        collectionId: text?.userData?.unfilteredCollectionId,
      }
    } else {
      window.panelToggle(`?open-extension`, true)
      return false
    }
  }

async function handleGithubStarReposScrap(pageType, isProfileImport, recursiveCall = false) {
    const authenticateUser = await checkIsUserLoggedIn()
    scrapGithubStarRepo(authenticateUser, pageType, recursiveCall, isProfileImport)
}

async function scrollWithDelayGithub(new_height) {
    window.scrollTo(0, new_height);

    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, 100);
    });
}

async function scrapGithubStarRepo(authenticateUser, pageType, recursiveCall, isProfileImport) {
    let lastId = ''
    if (!recursiveCall) {
        lastId = await fetchGithubStarRepo(authenticateUser, isProfileImport);
        lastStaredRepo = lastId
    } else {
        lastId = lastStaredRepo
    }

    // Get the initial set of tweet elements on the page
    let type = 'Star repository'
    let last_post_reached = false;
    stop_scrapping = false;

    parsed_bookmarks = {
        keys: [],
        values: []
    };

    $('#injected-overlay').css({ display: 'block' });
    
    window.scrollTo(0, 0);

    let primaryColumn = $('#user-starred-repos');
    let mainColumn = document.querySelector('main');

    let new_height = 0;
    let total_height = primaryColumn.height();
    let fail_safe_counter = 0;
    let status_bar = $('#status-bar');

    let postData = [];
    let posts = [];
    let name = null;

    let userDetails = {}

    if (pageType === GIT_PROFILE) {
        let navBar = mainColumn?.querySelector('[aria-label="User profile"]')
        let sideBar = mainColumn.getElementsByClassName('js-profile-editable-replace')[0]
        let socialLinks = sideBar?.querySelectorAll('[itemprop="social"]')
        let repoList = mainColumn?.querySelectorAll('turbo-frame')?.[0]?.querySelector('ol')
        let repos = repoList?.querySelectorAll('li')

        userDetails.stars = navBar?.querySelectorAll('[data-tab-item="stars"]')?.[0]?.querySelector('span')?.innerText
        userDetails.repositories = navBar?.querySelectorAll('[data-tab-item="repositories"]')?.[0]?.querySelector('span')?.innerText

        userDetails.image = sideBar?.querySelectorAll('img')?.[0]?.src
        userDetails.name = sideBar?.querySelectorAll('span')?.[0]?.innerText
        userDetails.screen_name = sideBar?.querySelectorAll('span')?.[0]?.innerText
        userDetails.username = sideBar?.querySelectorAll('span')?.[1]?.innerText?.split(' ')?.[0]
        userDetails.description = sideBar?.getElementsByClassName('p-note user-profile-bio mb-3 js-user-profile-bio f4')?.[0]?.innerText
        userDetails.followers = sideBar?.getElementsByClassName('text-bold color-fg-default')?.[0]?.innerText
        userDetails.following = sideBar?.getElementsByClassName('text-bold color-fg-default')?.[1]?.innerText
        userDetails.company = sideBar?.querySelector('[itemprop="worksFor"]')?.innerText
        userDetails.location = sideBar?.querySelector('[itemprop="homeLocation"]')?.innerText
        userDetails.localTime = sideBar?.querySelector('[itemprop="localTime"]')?.innerText
        userDetails.website = sideBar?.querySelector('[itemprop="url"]')?.innerText
        userDetails.email = sideBar?.querySelector('[itemprop="email"]')?.innerText
        userDetails.profile_url = `https://github.com/${userDetails?.username}`

        if(socialLinks?.length){
            userDetails.socialLinks = {}
            for (const links of socialLinks) {
                let link = links?.querySelector('a')?.href
                let platform = links?.querySelector('title')?.innerHTML
                if (!platform) {
                    platform = 'social'
                }
                userDetails.socialLinks[platform] = link
            }
        }

        if (repos?.length) {
            let repoKey = ''
            if(repoList?.parentElement?.querySelector('h2')?.innerText?.toLocaleLowerCase().includes('popular')){
                repoKey = 'popular'
            } else if (repoList?.parentElement?.querySelector('h2')?.innerText?.toLocaleLowerCase().includes('pinned')) {
                repoKey = 'pinned'
            }
            if (repoKey) {
                userDetails[repoKey] = []
                for (const repo of repos) {
                    let repoDetails = {
                        link: repo?.querySelectorAll('a')?.[0]?.href,
                        name: repo?.querySelectorAll('a')?.[0]?.innerText,
                        description: repo?.querySelectorAll('p')?.[0]?.innerText,
                        language: repo?.querySelector('[itemprop="programmingLanguage"]')?.innerText,
                        forkCount: repo?.querySelector('[aria-label="forks"]')?.parentElement?.innerText?.trim(),
                    }
                    userDetails[repoKey].push({...repoDetails})
                }
            }
        }
        let userProfileGem = convertGithubProfileCurateItFormat(userDetails, authenticateUser)
        if (userProfileGem) {
            if (status_bar) {
                status_bar.html(`Ingesting ${userProfileGem.length} ${type}<br/> 🚀`);
            }
            if (userProfileGem.length) {
                setTimeout(() => {
                    handleGithubStarRepo(userProfileGem, authenticateUser, isProfileImport);
                }, 1000);
            } else {
                utilsGit.resetAfterSubmit(GIT_PROFILE);
                alert('No User Data found!');
            }
        }
    } else if (pageType === GIT_STAR) {
        while (!stop_scrapping) {

            await scrollWithDelayGithub(new_height, null);
            new_height += 250;
            total_height = primaryColumn.height();
            if (new_height >= total_height) {
                stop_scrapping = true;
                posts = primaryColumn[0].childNodes[1].querySelectorAll('.col-12');
                for (const post of posts) {
                    const tag = post.querySelector('h3 a');
                    name = tag.innerText;
    
                    if (lastId == name) {
                        last_post_reached = true
                        stop_scrapping  = true
                        break
                    }
    
                    const link = tag.href;
                    const ddd = post.querySelectorAll('.Link--muted');
                    let forkCount = ''
                    const starCount = ddd[0].outerText?.trim();
                    if (ddd[1]) {
                        forkCount = ddd[1].outerText?.trim();
                    }
                    const description = post.querySelector('[itemprop=description]')?.innerText;
                    const programmingLanguage = post.querySelector('[itemprop=programmingLanguage]')?.innerText;
                    const updated = post.querySelector('relative-time').textContent;
                    const username = name.substring(0, name.indexOf('/')).trim();
    
                    let user = {};
                    user.name = username;
                    user.profile_url = `https://github.com/${username}`;
                    user.screen_name = username;

                    // `https://github.com/${post?.userdetails?.username}`
                    postData.push({ name, programmingLanguage, updated, description, starCount, forkCount, link, user });
                }
            }
        }
        let parsed_tweets = utilsGit.gitRepoRemoveDuplicates(postData);
    
        repos = [...repos, ...parsed_tweets]
        const btns           = document.querySelectorAll(".paginate-container > .BtnGroup > .btn")?.[1]
        more_repos_to_scrape = btns?.textContent !== "Previous" && !btns?.disabled
        if (btns && btns.textContent !== "Previous" && more_repos_to_scrape && !last_post_reached) {
            btns.click()
        } else {
            let allStaredRepos = utilsGit.gitRepoRemoveDuplicates(repos)
            if (allStaredRepos) {
                // Update progress bar
                repos = []
                more_repos_to_scrape = false
                if (time) {
                    clearTimeout(time)
                }
                if (status_bar) {
                    status_bar.html(`Ingesting ${allStaredRepos.length} ${type}<br/> 🚀`);
                }
                if (allStaredRepos.length) {
                    setTimeout(() => {
                        addGitPosts(allStaredRepos.reverse(), authenticateUser, isProfileImport);
                    }, 1000);
                } else {
                    utilsGit.resetAfterSubmit(GIT_STAR);
                    alert('No latest post found!');
                }
            }
        }
    }
}

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
        collection_gems: gitCollectionId,
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
    gitCollectionId = null;
    gitSelectedTags = [];
    gitRemarks = "";

    return [{...userJem}]
}

function convertGithubCurateItFormat(posts, authenticateUser) {
    let gems = [];
    posts.forEach((post) => {
        if (post) {
            const images = Array.from(document?.images)?.map((img) => { return img.src }) || []
            const icon   = document?.querySelector('link[rel="mask-icon"]')?.href || ''
            let userJem = {
                title: post?.user?.name,
                description: '',
                platform: "Github",
                media_type: "Profile",
                post_type: "Post",
                author: authenticateUser?.userId,
                url: `https://github.com/${post?.user?.name}`,
                media: { covers: [] },
                metaData: { covers: [], docImages: images, defaultIcon: icon !== "" ? icon : null, defaultThumbnail: images.length > 0 ? images[0] : null, icon: icon !== "" ? { icon, type: "image" } : null },
                collection_gems: gitCollectionId,
                remarks: gitRemarks,
                tags: gitSelectedTags,
                is_favourite: true,
                socialfeed_obj: { 
                    user: post.user 
                }
            }
            gems.push(userJem);

            let postGem = {
                title: post.name,
                description: post.description,
                platform: "Github",
                media_type: "SocialFeed",
                post_type: "Bookmark",
                author: authenticateUser?.userId,
                url: post.link,
                media: { covers: [] },
                metaData: { 
                    covers: [], 
                    docImages: images, 
                    defaultIcon: icon !== "" ? icon : null, 
                    defaultThumbnail: images.length > 0 ? images[0] : null, 
                    icon: icon !== "" ? { icon, type: "image" } : null 
                },
                collection_gems: gitCollectionId,
                remarks: gitRemarks,
                tags: gitSelectedTags,
                is_favourite: true,
                socialfeed_obj: post
            }
            gems.push(postGem);
        }
    });
    gitCollectionId = null;
    gitSelectedTags = [];
    gitRemarks = "";
    return gems;
}

async function handleGithubStarRepo(posts, authenticateUser, isProfileImport) {
    const dataArray = posts;
    const chunkSize = 20;
    let flag_ok = false;
    for (let i = 0; i < dataArray.length; i += chunkSize) {
        const chunk = dataArray.slice(i, i + chunkSize);

        let requestObj = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authenticateUser.token}`,
            },
            body: JSON.stringify({ "data": chunk })
        };
        try {
            const response = await fetch(`${authenticateUser?.url}/api/store-gems?isProfile=${isProfileImport}`, requestObj);
            flag_ok = response.ok;
        } catch (error) {
            flag_ok = false;
            break;
        }
    }
    fetch(
        `${authenticateUser?.url}/api/gamification-score?module=gem`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authenticateUser.token}`,
        }
      })

    utilsGit.resetAfterSubmit(GIT_STAR);
    if (flag_ok) {
        alert('Post submited successfully');
        window.panelToggle(`?refresh-gems`, true);
        window.location.search = "?tab=stars"
    } else {
        alert('Something Went Wrong!');
    }
}

async function fetchGithubStarRepo(authenticateUser) {
    let id = null
    let requestObj = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authenticateUser.token}`,
        }
    };

    let url = `${authenticateUser?.url}/api/fetch-gems?type=SocialFeed&platform=Github&posttype=Bookmark&isLatest=true`;
    
    const response = await fetch(url, requestObj);
    const jsonData = await response.json();

    id = jsonData?.data?.socialfeed_obj?.name

    return id
}

function addGitPosts(posts, authenticateUser, isProfileImport) {
    let jems = convertGithubCurateItFormat(posts, authenticateUser);
    handleGithubStarRepo(jems, authenticateUser, isProfileImport);
}


function createGitHubImportBtn(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild; // returns HTML element 
}

function convertString(str) {
    return str?.toLowerCase().split(" ").join("-");
  }

async function importProfileToCurateit() {
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
    const authenticateUser = await checkIsUserLoggedIn();
  
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
      window.panelToggle(`?add-profile`, true, true);
}

async function initGithub(page, isProfileImport) {
    let header = null;
    let btnLabel = null;
    let mesLabel = null;
    if (page == GIT_STAR) {
        header = $('#user-starred-repos h2')[0];
        btnLabel = 'Star'
        mesLabel = 'Your Star Repo'
        if (more_repos_to_scrape) {
            if (time) {
                clearTimeout(time)
            }
            time = setTimeout(() => {
                handleGithubStarReposScrap(GIT_STAR, isProfileImport)
            }, 2000)
        }
    } else if (page == GIT_PROFILE) {
        header = document?.querySelector('main')
        btnLabel = 'Profile'
        mesLabel = "User's Profile"
        document?.querySelector('#injected-button')?.remove()
    }

    let body = $('body');
    let is_injected_button_exists = $('#injected-button').length;
    if (!is_injected_button_exists) {
        if (page == GIT_PROFILE) {
            let gitProfileInjectedBtn = createGitHubImportBtn(
                `<button id="injected-button" injected-button-on-page="profile" style="font-size: 14px;margin-top: 12px;border: 1px solid gray;cursor: pointer;background: white;border-radius: 16px;color: black;padding: 6px 10px;font-weight: 600;display: inline-flex;align-items: center;"><img src="https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png" width="20" style="margin-right: 5px;"/>Import ${btnLabel}</button>`
            )
            header?.getElementsByClassName('vcard-names')?.[0]?.append(gitProfileInjectedBtn)
        }
        if (page == GIT_STAR) {
            $(header).append(
                `<button id="injected-button" style="font-size: 14px;border: 1px solid gray;margin-left: 30px;margin-right: 30px;cursor: pointer;background: white;border-radius: 16px;color: black;padding: 6px 10px;font-weight: 600;display: inline-flex;align-items: center;position: absolute;"><img src="https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png" width="20" style="margin-right: 5px;"/>Import ${btnLabel}</button>`
            );
        }
        let is_injected_overlay_exists = $('#injected-overlay').length;
        if (!is_injected_overlay_exists) {
            body.append(
                `<div id="injected-overlay" style="font-size:50px;display:none;font-weight:800;position: fixed;width: 100%;height: 100%;top: 0;left: 0;right:0;bottom: 0;background: linear-gradient(90deg, rgba(16,95,211, 0.8), rgba(16,95,211, 0.8));z-index: 99; font-family: Roboto, Helvetica, Arial, sans-serif;"><div style="position: absolute;top: 50%;left: 50%;font-size: 50px;color: white;transform: translate(-50%,-50%);-ms-transform: translate(-50%,-50%);text-align: center;"><span id="status-bar">Sit tight, we’re grabbing <br/> your ${mesLabel}...<br/></span></div><div style="position: absolute;top: 90%;left: 90%;"></div></div>`
            );
        } else {
            let status_bar = $('#status-bar');
            if (status_bar) {
                status_bar.html(`Sit tight, we’re grabbing <br/>${mesLabel}...<br/>`);
            }
        }

        $('#injected-button').click(async function () {
            gitCollectionId = null;
            gitSelectedTags = [];
            gitRemarks = "";
            const authenticateUser = await checkIsUserLoggedIn()
            if (authenticateUser?.token) {
                if (page === GIT_STAR) {
                    window.panelToggle(`?add-import-details`, true, false)
                } else if (page === GIT_PROFILE) {
                    await importProfileToCurateit()
                }
                // await importProfileToCurateit()
                // window.panelToggle(`?add-profile`, true, page === GIT_PROFILE)
            }
        });
    }
};

let utilsGit = {
    onReady: (page) => {
        if (page) {
            clearInterval(checkGitHubFullyLoaded);
            checkGitHubFullyLoaded = null;

            initGithub(page, isProfileImport);
        }
    },
    sleep: timeout => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, timeout);
        });
    },
    resetAfterSubmit: type => {
        window.scrollTo(0, 0);
        $('#injected-overlay').css({ display: 'none' });

        $('#injected-button').unbind('click');
        $('#injected-button').click(async function () {
            gitCollectionId = null;
            gitSelectedTags = [];
            gitRemarks = "";
            const authenticateUser = await checkIsUserLoggedIn()
            if (authenticateUser?.token) {
                window.panelToggle(`?add-profile`, true, type === GIT_PROFILE)
            }
        });

        let status_bar = $('#status-bar');
        if (status_bar) {
            status_bar.html(`Sit tight, we’re grabbing <br/> your posts...<br/>`);
        }
    },
    gitRepoRemoveDuplicates: arr => {
        const map = new Map();
        const uniqueArr = arr.filter(obj => {
            if (obj.link) {
                const isDuplicate = map.has(obj.link);
                map.set(obj.link, true);
                return !isDuplicate;
            } else {
                return true;
            }
        });
        return uniqueArr;
    }
};
