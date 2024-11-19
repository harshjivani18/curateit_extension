let mediumUrls = 'https://medium.com/me/(lists|list|)/(highlights|reading-history)';
let subListsUrlRegex = new RegExp('https://medium.com/[^]+/list/[^]+');
let profileUrlRegex = new RegExp('https://medium.com/@[^]+');
let customProfileUrlRegex = new RegExp('https://[^]+.medium.com/');
let customUrlSubListsUrlRegex = new RegExp('https://[^]+.medium.com/list/[^]+');

let replaceStartRegex = new RegExp('https://medium.com/');
let replaceEndRegex = new RegExp('/[^]+');

let articleReplaceStartRegex = new RegExp('https://medium.com/[^]+/');
let articleReplaceEndRegex = new RegExp('[?][^]+');

let isProfilePage = ''

let btn = 'Import Reading List'
let profileBtn = 'Import Profile'
let collection_id = ''
let collection_url = ''
let user_id = ''
let userData = {}
let collectionData = {}

let checkMediumFullyLoaded = null;
let mediumCollectionId = null;
let mediumSelectedTags = [];
let mediumRemarks = "";

const ARTICLE = "Article", HIGHLIGHTS = "Highlight", HISTORY = "Bookmark", PROFILE = "profile"

let listType = ''

let is_sub_list = false

const globalMediumRegex = new RegExp(mediumUrls, 'g');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (
        request.tab_url &&
        (
            globalMediumRegex.test(request.tab_url) ||
            request.tab_url.match(subListsUrlRegex) ||
            request.tab_url.match(customUrlSubListsUrlRegex) ||
            request?.tab_url?.match(profileUrlRegex) ||
            request?.tab_url?.match(customProfileUrlRegex)
        )
    ) {
        if (checkMediumFullyLoaded) {
            clearInterval(checkMediumFullyLoaded);
            checkMediumFullyLoaded = null;
        }
        checkMediumFullyLoaded = setInterval(() => {
            if (request?.tab_url?.match(globalMediumRegex)) {
                is_sub_list = false
                if (request?.tab_url.includes('/me/list/highlights')) {
                    utilsMedium.onReady(HIGHLIGHTS);
                }
                if (request?.tab_url.includes('/me/lists/reading-history')) {
                    utilsMedium.onReady(HISTORY);
                }
            } else if (request?.tab_url?.match(subListsUrlRegex) || request?.tab_url?.match(customUrlSubListsUrlRegex)) {
                is_sub_list = true
                utilsMedium.onReady(ARTICLE);
            } else if (request?.tab_url?.match(profileUrlRegex) || request?.tab_url?.match(customProfileUrlRegex)) {
                is_sub_list = false
                utilsMedium.onReady(PROFILE);
            }

            collection_url = request?.tab_url
            collection_id = request?.tab_url?.split('-')?.reverse()?.[0]
            user_id = request?.tab_url.replace(replaceStartRegex, '').replace(replaceEndRegex, '')
        }, 500);
    }
});

//TODO::HERE STARTS
window.grabMediumLists = async (vals) => {
    mediumCollectionId = vals?.collection_gems;
    mediumSelectedTags = vals?.tags;
    mediumRemarks = vals?.remarks;
    const authenticateUser = await checkIsUserLoggedIn()

    if (globalMediumRegex.test(window.location.href) || window.location.href.match(subListsUrlRegex) || window.location.href.match(customUrlSubListsUrlRegex)){
        isProfilePage = false
    } else if (profileUrlRegex.test(window.location.href) || customProfileUrlRegex.test(window.location.href)) {
        isProfilePage = true
    }
    scrapMediumArticles(authenticateUser, vals?.isImportProfile);
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

async function handleMediumUserProfileAPI(userData, authenticateUser, isProfileImport) {
    const dataArray = userData;
    let flag_ok = false;

    let requestObj = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authenticateUser.token}`,
        },
        body: JSON.stringify({ "data": dataArray })
    };
    try {
        const response = await fetch(`${authenticateUser?.url}/api/store-gems?isProfile=${isProfileImport}`, requestObj);
        flag_ok = response.ok;
    } catch (error) {
        flag_ok = false;
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

    mediumCollectionId = null;
    mediumSelectedTags = [];
    mediumRemarks = "";

    utilsMedium.resetAfterSubmit();
    if (flag_ok) {
        alert('User details submitted successfully.');
        window.panelToggle(`?refresh-gems`, true);
    } else {
        alert('Something Went Wrong!');
    }
}

async function handleMediumListAPI(lists, authenticateUser, isProfileImport) {
    let currentUrl = window.location.href;
    // Iterate backwards through the list to avoid index shifting issues when removing items
    for (let i = lists.length - 1; i >= 0; i--) {
        if (!lists[i].url || lists[i].url === currentUrl) {
            lists.splice(i, 1);
        }
    }
    
    const dataArray = lists
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
            const response = await fetch(`${authenticateUser?.url}/api/store-gems?isProfile=${isProfileImport}`, requestObj)
            flag_ok = response.ok
        } catch (error) {
            flag_ok = false
            break
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

    utilsMedium.resetAfterSubmit()
    if (flag_ok) {
        alert('Post submitted successfully')
        window.panelToggle(`?refresh-gems`, true);
    } else {
        alert('Something Went Wrong!')
    }
}

function addBulkMediumLists (lists, authenticateUser, isProfileImport) {
    let gems = convertMediumCurateItFormat(lists, authenticateUser);
    
    let newGems = insertUserAndCollectionGems(gems, authenticateUser)
    

    mediumCollectionId = null;
    mediumSelectedTags = [];
    mediumRemarks = "";

    handleMediumListAPI(newGems, authenticateUser, isProfileImport)
}

async function scrapMediumArticles(authenticateUser, isProfileImport) {
    userData = {}
    collectionData = {}
    stop_scrapping = false;

    const mainColumn = document.querySelector('main')
    console.log("Injected ===>",$('#injected-overlay'), mainColumn)
    $('#injected-overlay').css({ display: 'block' });
    
    window.scrollTo(0, 0);

    let new_height = 0;
    let total_height = mainColumn.scrollHeight;
    let fail_safe_counter = 0;
    let status_bar = $('#status-bar');

    let historyArticlesHr = [];
    let postData = [];
    let articles = [];
    let marks = [];

    if (isProfilePage) {
        const mainColumn = document.querySelector('main')
        userData.url = mainColumn?.nextSibling?.querySelector('a')?.href?.replace(articleReplaceEndRegex, '')
        userData.image = mainColumn?.nextSibling?.querySelector('img')?.src
        userData.name = mainColumn?.nextSibling?.querySelector('span')?.innerText
        userData.followers = mainColumn?.nextSibling?.querySelectorAll('span')?.[1]?.innerText.replace('Lists', '')
        if (mainColumn?.nextSibling?.querySelectorAll('span')?.[1].parentElement.nextElementSibling?.querySelectorAll('span').length >= 2){
            userData.user_tag = mainColumn?.nextSibling?.querySelectorAll('span')?.[1].parentElement.nextElementSibling?.querySelectorAll('p')[1]?.innerText.replace('Edit profile', '')
        } else {
            userData.user_tag = mainColumn?.nextSibling?.querySelectorAll('span')?.[1].parentElement.nextElementSibling?.querySelectorAll('p')[0]?.innerText.replace('Edit profile', '')
        }
        userData.id = user_id

        const userObj = convertMediumUserProfileCurateItFormat(userData, authenticateUser)

        if (userObj.length) {
            // Update progress bar
            if (status_bar) {
                status_bar.html(`Ingesting User Profile<br/> 🚀`);
            }
            setTimeout(() => {
                handleMediumUserProfileAPI(userObj, authenticateUser, isProfileImport);
            }, 1000);
        } else {
            utilsMedium.resetAfterSubmit();
            alert('No User Data found!');
        }
    } else {
        while (!stop_scrapping) {

            await scrollWithDelayMedium(new_height, null);
    
            new_height += 250;
            total_height = mainColumn.scrollHeight;
    
            if (new_height >= total_height) {
                await utilsMedium.sleep(1000);
                fail_safe_counter += 1;
                if (fail_safe_counter > 5) {
                    stop_scrapping = true;
                }
            } else {
                fail_safe_counter = 0;
                if (listType === HIGHLIGHTS) {
                    marks =  mainColumn.querySelectorAll('mark')
                    for (const mark of marks) {
                        try {
                            let postTitle = "", postLink = "", postDescription = "", userName = "", userProfileLink = "", postId = ""

                            postTitle = mark.parentNode.parentNode.parentNode.childNodes[0]?.querySelectorAll('a')[0]?.innerText
                            postLink = mark.parentNode.parentNode.parentNode.childNodes[0]?.querySelectorAll('a')[0]?.href?.replace(articleReplaceEndRegex, '')
                            postId = postLink.replace(articleReplaceStartRegex, '').replace(articleReplaceEndRegex, '')
                            postDescription = mark.innerText
                            userName = mark.parentNode.parentNode.parentNode.childNodes[0]?.querySelectorAll('a')[1]?.innerText
                            userProfileLink = mark.parentNode.parentNode.parentNode.childNodes[0]?.querySelectorAll('a')[1]?.href?.replace(articleReplaceEndRegex, '')

                            postData.push({
                                user: {
                                    name: userName,
                                    profileUrl: userProfileLink,
                                },
                                title: postTitle,
                                postUrl: postLink,
                                id: postId,
                                description: postDescription,
                            })
                        } catch (err) {
                            console.log(err)
                        }
                    }
                } else if (listType === HISTORY) {
                    historyArticlesHr = mainColumn.childNodes[0].childNodes[0].childNodes[0].childNodes[1].querySelectorAll('hr')
                    for (const historyArticle of historyArticlesHr) {
                        try {
                            let postImage = "", postDate = "", postLink = "", postTitle = "", postDescription = "", postTimeToRead = "", postId = ""

                            postLink = historyArticle.parentElement.querySelectorAll('a')?.[0]?.href?.replace(articleReplaceEndRegex, '')
                            postId = postLink.replace(articleReplaceStartRegex, '').replace(articleReplaceEndRegex, '')
                            postTitle = historyArticle.parentElement.querySelectorAll('a')?.[0].childNodes?.[0]?.innerText
                            postDescription = historyArticle.parentElement.querySelectorAll('a')?.[0].childNodes?.[1]?.innerText
                            postImage = historyArticle.parentElement.querySelector('img')?.src
                            postDate = historyArticle.parentElement.querySelectorAll('span')?.[0]?.innerText?.replace('.', '')
                            postTimeToRead = historyArticle.parentElement.querySelectorAll('span')?.[1]?.innerText

                            postData.push({
                                postUrl: postLink,
                                id: postId,
                                title: postTitle,
                                description: postDescription,
                                image: postImage,
                                postedOn: postDate,
                                timeToRead: postTimeToRead,
                            })
                        } catch (err) {
                            console.log(err)
                        }
                    }
                } else if (listType === ARTICLE) {
                    let articlesHeader = document.querySelector('header')
                    userData.url = mainColumn?.nextSibling?.querySelector('a')?.href?.replace(articleReplaceEndRegex, '')
                    userData.image = mainColumn?.nextSibling?.querySelector('img')?.src
                    userData.name = mainColumn?.nextSibling?.querySelector('span')?.innerText
                    userData.followers = mainColumn?.nextSibling?.querySelectorAll('span')?.[1]?.innerText.replace('Lists', '')
                    if (mainColumn?.nextSibling?.querySelectorAll('span')?.[1]?.parentElement.nextElementSibling?.querySelectorAll('span').length >= 2){
                        userData.user_tag = mainColumn?.nextSibling?.querySelectorAll('span')?.[1]?.parentElement.nextElementSibling?.querySelectorAll('p')[1]?.innerText.replace('Edit profile', '')
                    } else {
                        userData.user_tag = mainColumn?.nextSibling?.querySelectorAll('span')?.[1]?.parentElement.nextElementSibling?.querySelectorAll('p')[0]?.innerText.replace('Edit profile', '')
                    }
                    userData.id = user_id
    
                    collectionData.name = document.getElementById('injected-button').parentNode.innerText.replace(`\n${btn}`, '')
                    collectionData.stories = articlesHeader.querySelectorAll('p')?.[1]?.innerText
                    collectionData.save = articlesHeader.querySelectorAll('p')?.[2]?.innerText
                    collectionData.url = collection_url
                    collectionData.id = collection_id
    
                    articles = mainColumn.querySelectorAll('article')
                    for (const article of articles) {
                        try {
                            const articleHead = article.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes[0]
                            const articleDetails = article.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes[1]
                            const imgTags = article?.querySelectorAll('img'); // 0.profilePicture, 1.articleImage

                            let userName = "", postImage = "", postDate = "", postLink = "", postTitle = "", postDescription = "",
                                postTag = "" ,postTimeToRead = "", userProfileImage = "", userProfileLink = "", postId
                            // console.log(article, articleHead, articleDetails)
                            postDate = articleHead.querySelectorAll('span')?.[1]?.querySelectorAll('p')?.[0].innerText?.replace('.', '')
                            userName = articleHead.querySelectorAll('a')?.[1].innerText
                            userProfileLink = articleHead.querySelector('a')?.href?.replace(articleReplaceEndRegex, '')

                            postLink = articleDetails.querySelectorAll('a')[0]?.href?.replace(articleReplaceEndRegex, '')
                            postId = postLink.replace(articleReplaceStartRegex, '').replace(articleReplaceEndRegex, '')
                            postTitle = articleDetails.querySelectorAll('a')[0]?.childNodes[0]?.innerText
                            postDescription = articleDetails.querySelectorAll('a')[0]?.childNodes[1]?.innerText
                            postTag = articleDetails.querySelectorAll('a')[1]?.innerText
                            postTimeToRead = articleDetails.querySelectorAll('a')[2]?.innerText

                            userProfileImage = imgTags?.[0]?.src
                            const imgIdx  = Array.from(imgTags)?.findIndex((img) => { return img.alt.includes(postTitle) }) 
                            postImage     = (imgIdx !== -1) ? imgTags?.[imgIdx]?.src : imgTags?.[1]?.src
                            // postImage = imgTags?.[1]?.src

                            // 

                            postData.push({
                                user: {
                                    name: userName,
                                    image: userProfileImage,
                                    profileUrl: userProfileLink,
                                },
                                postUrl: extractUrlWithoutQueryParams(postLink),
                                id: postId,
                                title: postTitle,
                                description: postDescription,
                                image: postImage,
                                postedOn: postDate,
                                postTag,
                                timeToRead: postTimeToRead,
                            });
                        } catch (err) {
                            console.log(err)
                        }
                    }
                }
            }
        }

        let uniqueArticles = utilsMedium.mediumArticlesRemoveDuplicates(postData);
        
        if (uniqueArticles) {
            // Update progress bar
            if (status_bar) {
                status_bar.html(`Ingesting ${uniqueArticles.length} articles<br/> 🚀`);
            }
            if (uniqueArticles.length > 0) {
                setTimeout(() => {
                    addBulkMediumLists(uniqueArticles.reverse(), authenticateUser, isProfileImport);
                }, 1000);
            } else {
                utilsMedium.resetAfterSubmit();
                alert('No latest post found!');
            }
        }
    }
}

async function scrollWithDelayMedium(new_height) {
    window.scrollTo(0, new_height);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, 100);
    });
}

function insertUserAndCollectionGems(array, authenticateUser) {
    let userAndCollectionGem = [...array]
    let collectionGem = {
        id: collectionData?.id,
        title: collectionData?.name,
        url: collectionData?.url,
        description: collectionData?.user_tag,
        author: authenticateUser?.userId,
        platform: "Medium",
        media_type: "SocialFeed",
        post_type: "Collection",
        collection_gems: mediumCollectionId,
        remarks: mediumRemarks,
        tags: mediumSelectedTags,
        is_favourite: true,
        media: {
            covers: []
        },
        socialfeed_obj: {...collectionData, user: {...userData}}
    }
    userAndCollectionGem.unshift(collectionGem)
    const images1 = Array.from(document?.images)?.map((img) => { return img.src }) || [];
    const icon    = document.querySelector('link[rel="icon"]')?.href || ""
    let collectionUserGem = {
        author: authenticateUser?.userId,
        title: userData?.name,
        url: userData?.url,
        description: userData?.user_tag,
        platform: "Medium",
        media_type: "Profile",
        post_type: "Post",
        collection_gems: mediumCollectionId,
        remarks: mediumRemarks,
        tags: mediumSelectedTags,
        is_favourite: true,
        media: {
            covers: []
        },
        metaData: {
            covers: [],
            docImages: userData?.image ? [ userData?.image, ...images1 ] : images1,
            icon: icon !== "" ? { type: "image", icon } : null,
            defaultIcon: icon !== "" ? icon : null,
            defaultThumbnail: userData?.image || null,
        },
        socialfeed_obj: userData
    }
    if (userData?.image) {
        collectionUserGem.media.covers.push(userData.image)
        collectionUserGem.metaData.covers.push(userData.image)
    }
    userAndCollectionGem.unshift(collectionUserGem)

    return userAndCollectionGem
}

function convertMediumUserProfileCurateItFormat (userData, authenticateUser) {
    const images2 = Array.from(document?.images)?.map((img) => { return img.src }) || [];
    const icon    = document.querySelector('link[rel="icon"]')?.href || ""
    let collectionUserGem = {
        author: authenticateUser?.userId,
        title: userData?.name,
        url: userData?.url,
        description: userData?.user_tag,
        platform: "Medium",
        media_type: "Profile",
        post_type: "Post",
        collection_gems: mediumCollectionId,
        remarks: mediumRemarks,
        tags: mediumSelectedTags,
        is_favourite: true,
        media: {
            covers: []
        },
        metaData: {
            covers: [],
            docImages: userData?.image ? [ userData?.image, ...images2 ] : images2,
            icon: icon !== "" ? { type: "image", icon } : null,
            defaultIcon: icon !== "" ? icon : null,
            defaultThumbnail: userData?.image || null,
        },
        socialfeed_obj: userData
    }
    if (userData?.image) {
        collectionUserGem.media.covers.push(userData.image)
        collectionUserGem.metaData.covers.push(userData.image)
    }
    return [collectionUserGem]
}

function convertMediumCurateItFormat(posts, authenticateUser) {
    let gems = [];
    const images3 = Array.from(document?.images)?.map((img) => { return img.src }) || [];
    const icon    = document.querySelector('link[rel="icon"]')?.href || ""
    posts.forEach((post) => {
        if (post) {
            if (post?.user?.name){
                let userJem = {
                    title: post?.user?.name,
                    description: '',
                    platform: "Medium",
                    media_type: "Profile",
                    post_type: "Post",
                    author: authenticateUser?.userId,
                    url: post?.user?.profileUrl,
                    media: {
                        covers: post.user.image ? [post.user.image] : []
                    },
                    metaData: {
                        covers: post.user.image ? [post.user.image] : [],
                        docImages: post?.user?.image ? [ post?.user?.image, ...images3 ] : images3,
                        icon: icon !== "" ? { type: "image", icon } : null,
                        defaultIcon: icon !== "" ? icon : null,
                        defaultThumbnail: post?.user?.image || null,
                    },
                    collection_gems: mediumCollectionId,
                    remarks: mediumRemarks,
                    tags: [...mediumSelectedTags],
                    is_favourite: true,
                    socialfeed_obj: post.user
                }
                // if (post?.user?.image) {
                //     userJem.media.covers.push(post.user.image)
                //     userJem.metaData.covers.push(post.user.image)
                // }
                gems.push(userJem);
            }

            let postGem = {
                title: post.title,
                description: post.description,
                platform: "Medium",
                media_type: "Article",
                post_type: listType,
                author: authenticateUser?.userId,
                url: post.postUrl,
                media: {
                    covers: post.image ? [post.image] : []
                },
                metaData: {
                    covers: post.image ? [post.image] : [],
                    docImages: post?.image ? [ post?.image, ...images3 ] : images3,
                    icon: icon !== "" ? { type: "image", icon } : null,
                    defaultIcon: icon !== "" ? icon : null,
                    defaultThumbnail: post?.image || null,
                },
                collection_gems: mediumCollectionId,
                remarks: mediumRemarks,
                tags: [...mediumSelectedTags],
                is_favourite: true,
                socialfeed_obj: {...post, collection_gem: {
                    id: collectionData.id,
                    url: collectionData.url,
                    name: collectionData.name,
                }}
            }
            // if(post?.postTag){
            //     postGem.tags.push({
            //         data: {
            //             tag: post.postTag
            //         }
            //     })
            // }
            // if (post?.image) {
            //     postGem.media.covers.push(post.image)
            // }
            gems.push(postGem);
        }
    });
    return gems;
}

function createMediumImportBtn(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild; // returns HTML element 
}

function initMedium(page) {
    listType = page
    let header = null;
    let btnLabel = null;
    let mesLabel = null;
    
    header = $('h1');
    btnLabel = btn
    mesLabel = btn
    if(is_sub_list){
        header = document?.querySelector('main');
    } else if (page === PROFILE) {
        btnLabel = profileBtn
        header = document?.querySelector('main');
    } else {
        header = $('h1');
    }
    
    let body = $('body');
    let is_injected_button_exists = $('#injected-button').length;
    if (!is_injected_button_exists && !!header) {
        if(is_sub_list){
            let subListInjectedBtn = createMediumImportBtn(`<button id="injected-button" style="font-size: 14px;border: 1px solid gray;margin-top: 18px;cursor: pointer;background: white;border-radius: 16px;color: black;padding: 6px 10px;font-weight: 600;display: inline-flex;align-items: center;"><img src="https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png" width="20" style="margin-right: 5px;"/>${btnLabel}</button>`)
            header?.childNodes[0]?.childNodes[2]?.childNodes[0]?.childNodes[0]?.querySelector('h2')?.parentElement?.append(subListInjectedBtn)
        } else if (page === PROFILE) {
            let profileInjectedBtn = createMediumImportBtn(`<button id="injected-button" style="font-size: 14px;border: 1px solid gray;margin-top: 12px;cursor: pointer;background: white;border-radius: 16px;color: black;padding: 6px 10px;font-weight: 600;display: inline-flex;align-items: center;"><img src="https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png" width="20" style="margin-right: 5px;"/>${btnLabel}</button>`)
            header?.nextElementSibling?.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes[0]?.insertBefore(profileInjectedBtn, header?.nextElementSibling?.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes?.[3])
        } else {
            header.append(
                `<button id="injected-button" style="font-size: 14px;border: 1px solid gray;margin-left: 30px;margin-right: 30px;cursor: pointer;background: white;border-radius: 16px;color: black;padding: 6px 10px;font-weight: 600;display: inline-flex;align-items: center;"><img src="https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png" width="20" style="margin-right: 5px;"/>${btnLabel}</button>`
            );
        }
        if (page !== PROFILE && document.getElementById('injected-button-p') === null) {
            let profileInjectedBtn = createMediumImportBtn(`<button id="injected-button-p" style="font-size: 14px;border: 1px solid gray;margin-top: 12px;cursor: pointer;background: white;border-radius: 16px;color: black;padding: 6px 10px;font-weight: 600;display: inline-flex;align-items: center;"><img src="https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png" width="20" style="margin-right: 5px;"/>Import Profile</button>`)
            header?.nextElementSibling?.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes[0]?.insertBefore(profileInjectedBtn, header?.nextElementSibling?.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes?.[3])
        }
        let is_injected_overlay_exists = $('#injected-overlay').length;
        if (!is_injected_overlay_exists) {
            body.append(
                `<div id="injected-overlay" style="font-size:50px;display:none;font-weight:800;position: fixed;width: 100%;height: 100%;top: 0;left: 0;right:0;bottom: 0;background: linear-gradient(90deg, rgba(16,95,211, 0.8), rgba(16,95,211, 0.8));z-index: 500; font-family: Roboto, Helvetica, Arial, sans-serif;"><div style="position: absolute;top: 50%;left: 50%;font-size: 50px;color: white;transform: translate(-50%,-50%);-ms-transform: translate(-50%,-50%);text-align: center;"><span id="status-bar">Sit tight, we’re grabbing <br/> your ${mesLabel}...<br/></span></div><div style="position: absolute;top: 90%;left: 90%;"></div></div>`
            );
        } else {
            let status_bar = $('#status-bar');
            if (status_bar) {
                status_bar.html(`Sit tight, we’re grabbing <br/> your ${mesLabel}...<br/>`);
            }
        }
        $('#injected-button,#injected-button-p').click(async function (e) {
            mediumCollectionId = null;
            mediumSelectedTags = [];
            mediumRemarks = "";
            const authenticateUser = await checkIsUserLoggedIn()
            if (authenticateUser?.token) {
                function convertString(str) {
                    return str?.toLowerCase().split(" ").join("-");
                }
                if (page == PROFILE || e.target.id === 'injected-button-p') {
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
                        userData.user_tag = mainColumn?.nextSibling?.querySelectorAll('span')?.[1]?.parentElement?.nextElementSibling?.querySelectorAll('p')?.[1]?.innerText?.replace('Edit profile', '')
                    } else {
                        userData.user_tag = mainColumn?.nextSibling?.querySelectorAll('span')?.[1]?.parentElement?.nextElementSibling?.querySelectorAll('p')?.[0]?.innerText?.replace('Edit profile', '')
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
                    window.panelToggle(`?add-profile`, true, listType === PROFILE)
                }
                else {
                    window.panelToggle(`?add-import-details`, true, false)
                }
            }
        })
    }
};

let utilsMedium = {
    onReady: (page) => {
        if (page) {
            clearInterval(checkMediumFullyLoaded);
            checkMediumFullyLoaded = null;
            initMedium(page);
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
            mediumCollectionId = null;
            mediumSelectedTags = [];
            mediumRemarks = "";
            const authenticateUser = await checkIsUserLoggedIn()
            if (authenticateUser?.token) {
                window.panelToggle(`?add-import-details`, true, listType === PROFILE)
            }
        });

        let status_bar = $('#status-bar');
        if (status_bar) {
            status_bar.html(`Sit tight, we’re grabbing <br/> your posts...<br/>`);
        }
    },
    mediumArticlesRemoveDuplicates: arr => {
        const map = new Map();
        const uniqueArr = arr.filter(obj => {
            if (obj.postUrl) {
                const isDuplicate = map.has(obj.postUrl);
                map.set(obj.postUrl, true);
                return !isDuplicate;
            } else {
                return true;
            }
        });
        return uniqueArr;
    }
};