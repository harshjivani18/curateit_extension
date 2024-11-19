let redditSavedUrl = 'https://www.reddit.com/user/[^.]+/saved'
var redditSavedUrlRegex = new RegExp(redditSavedUrl)
let redditUpvotedUrl = 'https://www.reddit.com/user/[^.]+/upvoted'
var redditUpvotedUrlRegex = new RegExp(redditUpvotedUrl)
var redditUserProfileUrlRegex = new RegExp('https://www.reddit.com/user/[^.]+')
let checkRedditAreFullyLoaded = null

var replaceRedditStartUrl = 'https://www.reddit.com/user/'

let redditImportType = ''

let redditButtonId = 'injected-button-reddit'
const REDDIT_PROFILE = 'profile'

let redditCollectionId = null;
let redditSelectedTags = [];
let redditRemarks = "";
let isProfileImport = false
let redditProfileData = {}
let currentPage = ''

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.tab_url && (request.tab_url.match(redditUserProfileUrlRegex))) {
        if (checkRedditAreFullyLoaded) {
            clearInterval(checkRedditAreFullyLoaded)
            checkRedditAreFullyLoaded = null
        }
        if (request.tab_url.match(redditUserProfileUrlRegex)) {
            checkRedditAreFullyLoaded = setInterval(() => {
                if (request.tab_url.includes('saved')) {
                    currentPage = 'saved'
                    utilsReddit.onReady('saved_reddit_post')
                }
                if (request.tab_url.includes('upvoted')) {
                    currentPage = 'upvoted'
                    utilsReddit.onReady('saved_reddit_upvoted')
                }
                utilsReddit.onReady(REDDIT_PROFILE)
            }, 500)
        }
    }
    if (!window.location.href.includes('saved') && !window.location.href.includes('upvoted')) {
        checkButtonIsExistOrNot()
    }
})

//TODO::HERE STARTS
window.grabRedditStars = async (vals) => {
    redditCollectionId = vals?.collection_gems;
    redditSelectedTags = vals?.tags;
    redditRemarks = vals?.remarks;
    const authenticateUser = await checkIsUserLoggedIn()
    scrapeRedditSaved(authenticateUser, vals?.isImportProfile)
}

//New functions start
const checkIsUserLoggedIn = async () => {
    const text = await chrome?.storage?.sync.get(["userData"])
    if (text && text?.userData && text?.userData?.apiUrl) {
      return {
        url: text.userData.apiUrl,
        token: text.userData.token,
        userId: text?.userData?.userId,
        collectionId: text?.userData?.unfilteredCollectionId,
      }
    } else {
      window.panelToggle(`?open-extension`, true)
      return false
    }
  }

async function scrollWithDelayReddit(new_height) {
    window.scrollTo(0, new_height)

    if ($('.scaffold-finite-scroll__load-button').length) {
        $('.scaffold-finite-scroll__load-button').trigger('click')
    }

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, 100)
    })
}

function convertRedditUserProfileCurateItFormat(userData, authenticateUser) {
    const images1 = Array.from(document?.images)?.map((img) => { return img.src }) || [];
    const icon    = document.querySelector('link[rel="icon"]')?.href || ""
    let userJem = {
        title: userData?.title,
        description: userData?.description,
        url: userData?.title ? `https://www.reddit.com/user/${userData?.title}` : '',
        media_type: 'Profile', // SocialFeed
        platform: 'Reddit',
        post_type: 'Post',
        author: authenticateUser?.userId,
        media: {
            covers: [],
        },
        metaData: {
            covers: [],
            docImages: userData?.image ? [ userData?.image, ...images1 ] : images1,
            defaultThumbnail: userData?.image || null,
            defaultIcon: icon !== "" ? icon : null,
            icon: icon !== "" ? { type: "image", icon } : null,
        },
        collection_gems: redditCollectionId,
        remarks: redditRemarks,
        tags: redditSelectedTags,
        is_favourite: true,
        socialfeed_obj: { ...userData },
    }

    if (userData?.image) {
        userJem.media.covers.push(userData?.image)
        userJem.metaData.covers.push(userData?.image)
    }

    redditCollectionId = ''
    redditRemarks = ''
    redditSelectedTags = ''
    return [{ ...userJem }]
}

function smoothScrollToBottom() {
    window.scrollBy({ top: document.body.scrollHeight - window.innerHeight, left: 0, behavior: 'smooth' });
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, 100)
    })
}

async function scrapeRedditSaved(authenticateUser, isProfileImport) {
    // const lastId        = await fetchLastPostIdReddit(authenticateUser)
    // Get the initial set of reddit elements on the page
    let type            = 'Posts'
    // let stop_scrapping  = document.querySelector("#partial-more-post")

    parsed_bookmarks = {
        keys: [],
        values: [],
    }

    $('#injected-overlay').css({ display: 'block' })
    if ($('.scaffold-finite-scroll__load-button').length) {
        $('.scaffold-finite-scroll__load-button').trigger('click')
    }
    window.scrollTo(0, 0)

    // let new_height = 0
    // let fail_safe_counter = 0
    let status_bar = $('#status-bar')
    // let trigger_submit = false

    // =============================================================================
    // profile data
    // =============================================================================
    // let profileColumn = ''
    // =============================================================================

    let rUser = {}
    // let postData = []
    // let posts = []

    const profileElem       = document.querySelector("aside[aria-label='Profile information']")
    const profileImageUrl   = document.querySelector("img[data-testid='profile-icon']")?.src 
    const mainProfile       = document.querySelector("div[data-testid='profile-main']")
    const socialLinks       = profileElem?.querySelectorAll("[noun='social_link'] a")
    const bannerImg         = profileElem?.querySelector("shreddit-profile-banner div")?.style?.backgroundImage?.replace("url('", '')?.replace("')", '') 
    const title             = mainProfile?.querySelector("p")?.innerText
    const display_name      = mainProfile?.querySelector("h1")?.innerText
    const description       = profileElem?.querySelector("p[data-testid='profile-description']")?.innerText
    const karma             = profileElem?.querySelector("span[data-testid='karma-number']")?.innerText
    const cake_day          = profileElem?.querySelector("p time[data-testid='cake-day']")?.innerText

    if (redditImportType === REDDIT_PROFILE) {
        rUser.image = profileImageUrl

        rUser.banner_image = bannerImg;
        rUser.title = title;
        rUser.description = description;
        rUser.display_name = display_name;
        rUser.karma = karma
        rUser.cake_day = cake_day

        if (socialLinks?.length) {
            rUser.social_media = []
            for (const link of socialLinks) {
                rUser.social_media.push({
                    site: link?.host,
                    url: link?.href,
                    username: link?.innerText,
                })
            }
        }

        const userDataObj = convertRedditUserProfileCurateItFormat(rUser, authenticateUser)
        if (userDataObj?.length) {
            if (status_bar) {
                status_bar.html(`Ingesting User Profile<br/> 🚀`);
            }
            setTimeout(() => {
                handleRedditPostAPI(userDataObj, authenticateUser, isProfileImport);
            }, 1000);
        } else {
            utilsReddit.resetAfterSubmit()
            alert('No User Data found!');
        }
    } else {
        // scroll and fetch all posts using stop element
        let stopElem = document.querySelector("faceplate-partial[id^='partial-more-posts']")
        while (stopElem) {
            stopElem = document.querySelector("faceplate-partial[id^='partial-more-posts']")
            await smoothScrollToBottom()
        }

        if ((currentPage === 'saved' || currentPage === 'upvoted') && profileElem && mainProfile) {
            redditProfileData.username = title
            redditProfileData.karma_points = karma
            redditProfileData.creation_date = cake_day
            redditProfileData.profile_url = profileImageUrl
            redditProfileData.social_media = []
        }

        if (socialLinks?.length !== 0) {
            for (const link of socialLinks) {
                redditProfileData.social_media.push({
                    site: link?.host,
                    url: link?.href,
                    username: link?.innerText,
                })
            }
        }

        const allArticlesElems  = document.querySelectorAll("shreddit-post")
        const postData          = []
        Array.from(allArticlesElems).forEach((article) => {
            const post = extractRedditPostData(article, article.id)
            if (post) {
                postData.push(post)
            }
        })

        
        let parsed_reddits = utilsReddit.redditRemoveDuplicates(postData)
        const newArray     = []
        const reversedArr  = parsed_reddits.reverse()
        if (status_bar) {
            status_bar.html(`Sit tight, we’re grabbing <br/> your data is migrating for tags...<br/>`)
        }
        for (const p of reversedArr) {
            const tArr = []
            if (p.tag !== undefined && p.tag !== null && p.tag !== "") {
                const tags = p.tag.split(',').filter((tag) => tag !== "")
                if (tags.length > 0) {
                    for (const tag of tags) {
                        let requestObj = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${authenticateUser.token}`,
                            },
                            body: JSON.stringify({ data: { tag: tag, users: parseInt(authenticateUser.userId) } }),
                        }
                        try {
                            const res       = await fetch(`${authenticateUser?.url}/api/tags`, requestObj)
                            const jsonData  = await res.json()
                            tArr.push(jsonData?.data?.id)
                        } catch (error) {
                            continue;
                        }
                    }
                }
            }
            newArray.push({ ...p, tags: tArr })
        }

        if (parsed_reddits) {
            // Update progress bar
            if (status_bar) {
                status_bar.html(`Ingesting ${parsed_reddits.length} ${type}<br/> 🚀`)
            }
            if (parsed_reddits.length) {
                setTimeout(() => {
                    addBulkRedditPosts(newArray, authenticateUser, isProfileImport)
                    // addBulkRedditPosts(parsed_reddits);
                }, 1000)
            } else {
                utilsReddit.resetAfterSubmit()
                alert('No latest post found!')
            }
        }
        // let primaryColumn = document?.querySelector('[data-scroller-first]')?.parentNode
        // let total_height = primaryColumn?.scrollHeight

        // if (currentPage == 'saved' || currentPage == 'upvoted')
        //     profileColumn = document?.getElementsByClassName('_3Im6OD67aKo33nql4FpSp_')?.[0]
        // if (profileColumn) {
        //     redditProfileData.username = profileColumn?.querySelector('._1LCAhi_8JjayVo7pJ0KIh0')?.innerText || profileColumn?.querySelector('h1')?.innerText
        //     redditProfileData.karma_points = profileColumn?.querySelector('#profile--id-card--highlight-tooltip--karma')?.innerText
        //     redditProfileData.creation_date = profileColumn?.querySelector('#profile--id-card--highlight-tooltip--cakeday')?.innerText
        //     redditProfileData.profile_url = profileColumn?.querySelector('img')?.src
        //     redditProfileData.social_media = []
        // }

        // for (const social_account of profileColumn?.querySelector('[aria-label="Social Links"]')?.querySelectorAll('a')) {
        //     redditProfileData.social_media.push({
        //         site: social_account?.host,
        //         url: social_account?.href,
        //         username: social_account?.innerText,
        //     })
        // }

        // while (stop_scrapping) {

        //     await scrollWithDelayReddit(new_height, null, trigger_submit)

        //     new_height += 250
        //     total_height = primaryColumn.scrollHeight
        //     if (new_height >= total_height) {
        //         await utilsReddit.sleep(1000)
        //         fail_safe_counter += 1
        //         if (fail_safe_counter > 5) {
        //             stop_scrapping = true
        //         }
        //     } else {
        //         fail_safe_counter = 0
        //         posts = primaryColumn.childNodes

        //         for (const post of posts) {
        //             if (!post?.querySelector('.Comment')) {
        //                 let id = post?.querySelector('[data-testid="post-container"]')?.id
    
        //                 if (id) {
        //                     if (lastId == id) {
        //                         stop_scrapping = true
        //                         break
        //                     }

        //                     const extractPost = extractRedditPostData(post, id)
        //                     if (extractPost != null) {
        //                         postData.push(extractPost)
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }

        // let parsed_reddits = utilsReddit.redditRemoveDuplicates(postData)

        // if (parsed_reddits) {
        //     // Update progress bar
        //     if (status_bar) {
        //         status_bar.html(`Ingesting ${parsed_reddits.length} ${type}<br/> 🚀`)
        //     }
        //     if (parsed_reddits.length) {
        //         setTimeout(() => {
        //             addBulkRedditPosts(parsed_reddits.reverse(), authenticateUser, isProfileImport)
        //             // addBulkRedditPosts(parsed_reddits);
        //         }, 1000)
        //     } else {
        //         utilsReddit.resetAfterSubmit()
        //         alert('No latest post found!')
        //     }
        // }
    }

}

function extractRedditPostData(post, postId) {
    try {
        let id              = postId

        let title           = post.getAttribute("post-title")?.trim()
        let contentURL      = `${window.location.origin}${post.getAttribute("permalink")}`
        let description     = post.querySelector("[slot='text-body']")?.innerText?.trim()  || post?.querySelector("shreddit-ad-supplementary-text p")?.innerText?.trim()
        let upvote          = post.getAttribute("score")
        let postType        = post.getAttribute("post-type")
        let image_url       = postType === "gallery" ? post?.querySelector("gallery-carousel ul li figure img")?.src : postType === "image" ? (post?.querySelector("shreddit-media-lightbox-listener .media-lightbox-img .preview-img")?.src || post?.querySelector("shreddit-dynamic-ad-link .media-lightbox-img .preview-img")?.src || post?.querySelector("shreddit-dynamic-ad-link .media-lightbox-img figure img")?.src) : postType === "video" ? post?.querySelector("shreddit-player")?.getAttribute("src") : null
        let tag             = Array.from(post?.querySelectorAll('[noun="post_flair"]'))?.map((pElem) => { return pElem?.querySelector("a")?.innerText })?.join(",")
        let community_name  = post?.getAttribute("subreddit-prefixed-name")
        let community_url   = post?.querySelector('a[data-testid="subreddit-name"]')?.href

        let userDetails     = post?.querySelector('a[data-testid="subreddit-name"]')  || post?.querySelector("[noun='user_profile'] a") || post?.querySelector("[data-id='user-hover-card'] a")
        let user_id         = post?.getAttribute("subreddit-id")
        let user_name       = userDetails?.innerText?.trim()
        let user_url        = userDetails?.href
        let profilePic      = userDetails?.querySelector("faceplate-img")?.getAttribute("src")
        let date_time       = post?.querySelector("[slot='credit-bar']")?.querySelector("faceplate-timeago time")?.getAttribute("datetime")
        let timeago         = post?.querySelector("[slot='credit-bar']")?.querySelector("faceplate-timeago time")?.innerText
        const comments      = post?.getAttribute("comment-count")
        const moreimages    = Array.from(post?.querySelector("gallery-carousel ul")?.querySelectorAll("li figure img") || [])?.map((i) => { return i.src }) || []

        const data = {
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
            carouselImgs: moreimages,
            title,
            tag: tag,
            date_time,
            timeago,
            postType,
            videoPoster: postType === "video" ? post?.querySelector("shreddit-player")?.getAttribute("poster") : null,
            comments: parseInt(comments),
        }
        return data
    } catch (err) {
        return null
    }
}

// function extractRedditPostData(post, postId) {
//     try {
//         let id = postId
//         const contentDiv = post?.querySelector('[data-click-id="background"]')

//         let title = contentDiv?.querySelector('a[data-click-id="body"]')

//         let upvote = post?.querySelector('[aria-label="upvote"]')?.parentElement?.innerText?.trim()
//         let detailDiv = contentDiv?.querySelector('div[data-click-id="body"]')
//         let postImage = contentDiv?.querySelector('[data-click-id="image"]')
//         let image_url = postImage?.parentElement?.localName == 'a'
//             ? postImage?.parentElement?.href?.trim()
//             : postImage?.style?.backgroundImage?.split('"')?.[1]

//         let tag = contentDiv?.querySelector('[data-adclicklocation="title"]')?.querySelectorAll('[data-ignore-click="false"]')?.[0]?.innerText?.trim()
//         let community_name = detailDiv?.querySelector('[data-click-id="subreddit"]')?.innerText
//         let community_url = detailDiv?.querySelector('[data-click-id="subreddit"]')?.href

//         let user_id = contentDiv?.querySelector('[data-click-id="user"]')?.parentElement?.id
//         let user_name = contentDiv?.querySelector('[data-click-id="user"]')?.innerText?.trim()
//         let user_url = contentDiv?.querySelector('[data-click-id="user"]')?.href
//         let date_time = contentDiv?.querySelector('[data-click-id="timestamp"]')?.innerText?.trim()

//         const comments = contentDiv?.querySelector('[data-click-id="comments"]')?.innerText?.trim()

//         date_time = getDateTimeBeforeReddit(date_time)

//         const data = {
//             id,
//             upvote,
//             post_url: title?.href,
//             community: {
//                 name: community_name,
//                 url: community_url,
//             },
//             user: {
//                 id: user_id,
//                 name: user_name,
//                 url: user_url,
//             },
//             image_url: image_url || '',
//             title: title?.innerText?.trim(),
//             tag: tag,
//             date_time,
//             comments: parseInt(comments.replace('Comments', '').replace('Comment', '')),
//         }
//         return data
//     } catch (err) {
//         console.log('Error : ', err)
//         return null
//     }
// }

function convertCurateItRedditFormat(posts, authenticateUser) {
    let gems = []
    posts.forEach((post) => {
        const images2  = Array.from(document?.images)?.map((img) => { return img.src }) || [];
        const icon     = document.querySelector('link[rel="icon"]')?.href || ""
        if (post?.user?.id) {
            let userJem = {
                title: post.user.name,
                description: '',
                media_type: 'Profile', // SocialFeed
                platform: 'Reddit',
                post_type: 'Post',
                type: 'Link',
                author: authenticateUser?.userId,
                url: post.user.url,
                media: {
                    covers: post?.user?.profilePic ? [post?.user?.profilePic] : [],
                },
                metaData: {
                    covers: post?.user?.profilePic ? [post?.user?.profilePic] : [],
                    docImages: post?.user?.profilePic ? [ post.user.profilePic, images2 ] : images2,
                    defaultThumbnail: post?.user?.profilePic || null,
                    defaultIcon: icon !== "" ? icon : null,
                    icon: icon !== "" ? { type: "image", icon } : null,
                },
                collection_gems: redditCollectionId,
                remarks: redditRemarks,
                tags: redditSelectedTags,
                is_favourite: true,
                socialfeed_obj: {
                    user: post?.user,
                },
            }
            // if (post?.user?.url) {
            //     userJem.media.covers.push(post.user.url)
            //     userJem.metaData.covers.push(post.user.url)
            // }
            gems.push(userJem)
            let postGem = {
                title: post.title.length >= 50 ? `${post.title.slice(0, 50)}...` : post.title,
                description: post.description,
                media_type: 'SocialFeed',
                platform: 'Reddit',
                post_type: currentPage == 'saved' ? 'Bookmark' : 'Like',
                type: 'Link',
                author: authenticateUser?.userId,
                url: post.post_url,
                media: {
                    covers: post?.image_url ? [post?.image_url] : [],
                },
                metaData: { 
                    covers: post?.image_url ? [post?.image_url] : [],
                    docImages: [ post?.image_url, ...images2 ],
                    defaultThumbnail: post?.image_url || null,
                    defaultIcon: icon !== "" ? icon : null,
                    icon: icon !== "" ? { type: "image", icon } : null,
                },
                collection_gems: redditCollectionId,
                remarks: redditRemarks,
                tags: redditSelectedTags && post?.tags ? [...redditSelectedTags, ...post?.tags] : post?.tags ? [ ...post.tags ] : redditSelectedTags,
                is_favourite: true,
                socialfeed_obj: post,
            }
            // if (post?.image_url) {
            //     postGem.media.covers.push(post.image_url)
            // }
            gems.push(postGem)
        }
    })

    return gems
}

function createPayloadFile (payload, name) {
    const fileContent = JSON.stringify(payload)
    const link = document.createElement("a");
    const file = new Blob([fileContent], { type: 'text/plain' });

    link.href = URL.createObjectURL(file);
    link.download = name;

    link.click();
    URL.revokeObjectURL(link.href);
}

async function handleRedditPostAPI(posts, authenticateUser, isProfileImport) {
    // createPayloadFile(posts, "reddit-payload.txt")
    const dataArray = posts
    const chunkSize = 20
    let flag_ok = false

    for (let i = 0; i < dataArray.length; i += chunkSize) {
        const chunk = dataArray.slice(i, i + chunkSize)

        let requestObj = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authenticateUser.token}`,
            },
            body: JSON.stringify({ data: chunk }),
        }
        try {
            // const response = await fetch('https://development-api.curateit.com/api/gems', requestObj);
            const response = await fetch(`${authenticateUser?.url}/api/store-gems?isProfile=${isProfileImport}`, requestObj)
            flag_ok = response.ok
        } catch (error) {
            continue;
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

    utilsReddit.resetAfterSubmit()
    alert('Post submitted successfully')
    window.panelToggle(`?refresh-gems`, true);
}

async function fetchLastPostIdReddit(authenticateUser) {
    let type = currentPage == 'saved' ? 'Bookmark' : 'Like'
    let id = null
    let requestObj = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authenticateUser.token}`,
        },
    }

    let url = `${authenticateUser?.url}/api/fetch-gems?type=SocialFeed&platform=Reddit&posttype=${type}&isLatest=true`
    const response = await fetch(url, requestObj)
    const jsonData = await response.json()

    id = jsonData?.data?.socialfeed_obj?.id

    return id
}

function prependRedditUser(value, array) {
    var newArray = array.slice();
    newArray.unshift(value);
    return newArray;
}

function addBulkRedditPosts(posts, authenticateUser, isProfileImport) {
    let gems = convertCurateItRedditFormat(posts, authenticateUser)
    const images3 = Array.from(document?.images)?.map((img) => { return img.src }) || [];
    const icon    = document.querySelector('link[rel="icon"]')?.href || ""
    let userProfileGem = {
        title: redditProfileData.username,
        url: `https://www.reddit.com/user${redditProfileData.username.replace('u', '')}/`,
        karma_points: redditProfileData.karma_points,
        social_media: redditProfileData.social_media,
        description: '',
        media_type: 'Profile', // SocialFeed
        platform: 'Reddit',
        post_type: 'Post',
        type: 'Link',
        author: authenticateUser?.userId,
        media: {
            covers: [redditProfileData.profile_url],
        },
        metaData: {
            covers: [redditProfileData.profile_url],
            docImages: [ redditProfileData.profile_url, ...images3 ],
            defaultThumbnail: redditProfileData.profile_url,
            defaultIcon: icon !== "" ? icon : null,
            icon: icon !== "" ? { type: "image", icon } : null,
        },
        collection_gems: redditCollectionId,
        remarks: redditRemarks,
        tags: redditSelectedTags,
        is_favourite: true,
        socialfeed_obj: {},
    }

    redditCollectionId = null;
    redditSelectedTags = [];
    redditRemarks = "";
    var newGems = gems.length ? prependRedditUser(userProfileGem, gems) : gems

    handleRedditPostAPI(newGems, authenticateUser, isProfileImport)
}

function checkButtonIsExistOrNot() {
    let is_injected_button_exists = $(`#${redditButtonId}`).length
    if (is_injected_button_exists) {
        document.getElementById(redditButtonId).remove()
        // is_injected_button_exists = 0
        return false
    }
}

function createRedditImportBtn(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild; // returns HTML element 
}

function initReddit(page) {
    let userProfileFollowBtn = document?.getElementsByClassName('_3lhzE6Cg3SSeQGIHuLjILb GQV0F7lQiMOV6EofzopdJ')?.[0]
    let trophyCaseElement = document.querySelector("shreddit-profile-trophy-list")
    let header = null
    let btnLabel = null
    let mesLabel = null
    header = document?.querySelector('div[data-testid="profile-main"]')
    if (page == 'saved_reddit_post') {
        btnLabel = 'Saved'
        mesLabel = 'Reddit Posts'
    } else {
        btnLabel = 'Upvoted'
        mesLabel = 'Reddit Upvoted'
    }
    let body = $('body')
    let is_injected_button_p_exists = $("#injected-button-p").length
    let is_injected_button_exists = page === REDDIT_PROFILE ? true : checkButtonIsExistOrNot()

        if (!is_injected_button_p_exists && page === REDDIT_PROFILE && trophyCaseElement) {
        const profileBtn = createRedditImportBtn(
            `<button id="injected-button-p" style="margin-top: 8px;font-size: 14px;border: 1px solid gray;cursor: pointer;background: white;border-radius: 16px;color: black;padding: 6px 10px;font-weight: 600;display: inline-flex;align-items: center;"><img src="https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png" width="20" style="margin: 0 5px 0px 0;"/>Import Profile</button>`
        )
        trophyCaseElement.querySelector('ul[role="menu"]').appendChild(profileBtn)
        // userProfileFollowBtn?.parentElement?.insertBefore(profileBtn, userProfileFollowBtn)
        if ($("#injected-button-p")?.length && page === REDDIT_PROFILE) {
            $("#injected-button-p").click(async function () {
                redditCollectionId = null;
                redditSelectedTags = [];
                redditRemarks = "";
                redditImportType = REDDIT_PROFILE;
                const authenticateUser = await checkIsUserLoggedIn()
                if (authenticateUser?.token) {
                    function convertString(str) {
                        return str?.toLowerCase().split(" ").join("-");
                    }
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
                      
                    window.panelToggle(`?add-profile`, true, true)
                }
            })
        }
    }
    if (!is_injected_button_exists) {
        $(header).append(
            `<a 
                id="${redditButtonId}" 
                style="font-size: 12px; width: 220px; border: 1px solid gray;margin-left: 30px;margin-right: 30px;cursor: pointer;background: white;border-radius: 16px;color: black;padding: 3px 10px;font-weight: 600;display: inline-flex;align-items: center;top: 5px;"
            ><img src="https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png" width="20" style="margin-right: 5px; margin-bottom:0px;"/>Import ${btnLabel}</a>`
        )
        $(`#${redditButtonId}`).click(async function () {
            redditCollectionId = null;
            redditSelectedTags = [];
            redditRemarks = "";
            redditImportType = "";
            const authenticateUser = await checkIsUserLoggedIn()
            if (authenticateUser?.token) {
                window.panelToggle(`?add-import-details`, true)
            }
        })
    }

    let is_injected_overlay_exists = $('#injected-overlay').length
    if (!is_injected_overlay_exists) {
        body.append(
            `<div id="injected-overlay" style="font-size:50px;display:none;font-weight:800;position: fixed;width: 100%;height: 100%;top: 0;left: 0;right:0;bottom: 0;background: linear-gradient(90deg, rgba(16,95,211, 0.8), rgba(16,95,211, 0.8));z-index: 99; font-family: Roboto, Helvetica, Arial, sans-serif;"><div style="position: absolute;top: 50%;left: 50%;font-size: 50px;color: white;transform: translate(-50%,-50%);-ms-transform: translate(-50%,-50%);text-align: center;"><span id="status-bar">Sit tight, we’re grabbing <br/> your ${mesLabel}...<br/></span></div><div style="position: absolute;top: 90%;left: 90%;"></div></div>`
        )
    } else {
        let status_bar = $('#status-bar')
        if (status_bar) {
            status_bar.html(`Sit tight, we’re grabbing <br/> your ${mesLabel}...<br/>`)
        }
    }
}

let utilsReddit = {
    onReady: (page) => {
        clearInterval(checkRedditAreFullyLoaded)
        checkRedditAreFullyLoaded = null
        if (page == 'saved_reddit_post') {
            initReddit('saved_reddit_post')
        }
        if (page == 'saved_reddit_upvoted') {
            initReddit('saved_reddit_upvoted')
        }
        if (page == REDDIT_PROFILE) {
            initReddit(page)
        }
    },
    sleep: (timeout) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            }, timeout)
        })
    },
    resetAfterSubmit: (type) => {
        window.scrollTo(0, 0)
        $('#injected-overlay').css({ display: 'none' })

        $(`#${redditButtonId}`).unbind('click')
        $(`#${redditButtonId}`).click(async function () {
            redditCollectionId = null;
            redditSelectedTags = [];
            redditRemarks = "";
            redditImportType = "";
            const authenticateUser = await checkIsUserLoggedIn()
            if (authenticateUser?.token) {
                window.panelToggle(`?add-profile`, true)
            }
        })

        $("#injected-button-p").unbind('click')
        $("#injected-button-p").click(async function () {
            redditCollectionId = null;
            redditSelectedTags = [];
            redditRemarks = "";
            redditImportType = REDDIT_PROFILE;
            const authenticateUser = await checkIsUserLoggedIn()
            if (authenticateUser?.token) {
                window.panelToggle(`?add-import-details`, true, true)
            }
        })

        let status_bar = $('#status-bar')
        if (status_bar) {
            status_bar.html(`Sit tight, we’re grabbing <br/> your posts...<br/>`)
        }
    },
    redditRemoveDuplicates: arr => {
        const map = new Map()
        const uniqueArr = arr.filter((obj) => {
            if (obj.id) {
                const isDuplicate = map.has(obj.id)
                map.set(obj.id, true)
                return !isDuplicate
            } else {
                return true
            }
        })
        return uniqueArr
    }
}
