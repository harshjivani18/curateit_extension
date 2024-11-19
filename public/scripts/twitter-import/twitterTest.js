

let url
let title
let desc
let actorName
let link
let imgUrl

function removeDuplicate(str) {
    var half = str.slice(0, str.length / 2);
    if (half + half === str) {
        return half;
    }
    else {
        return str;
    }
}

function removeExtra(str) {
    return str.replace(/View.*profile/, '');
}

function addToCurateitTwitterTest(actorName, desc, link, tweetObj) {
    
    
    
    
    let title = `${actorName} on Twitter ${desc.substring(0, 12)}`;

    const coverArr = [];
    if (tweetObj?.medias && Array.isArray(tweetObj.medias) && tweetObj.medias.length > 0) {
        tweetObj.medias.map((m => {
            coverArr.push(m.url)
        }))
    }
    const images1 = Array.from(document?.images)?.map((img) => { return img.src }) || []
    const icon = document.querySelector('link[rel="icon"]')?.href || ""
    const message = {
        title,
        description: desc,
        media_type: "SocialFeed",
        platform: "Twitter",
        post_type: "SaveToCurateit",
        type: "Twitter",
        url: link,
        metaData: {
            url: link,
            type: "Twitter",
            title: title,
            docImages: coverArr.length > 0 ? [coverArr[0], ...images1] : images1,
            defaultIcon: icon !== "" ? icon : null,
            defaultThumbnail: coverArr.length > 0 ? coverArr[0] : null,
            icon: icon !== "" ? { type: "image", icon } : null,
            covers: coverArr
        },
        media: {
            covers: coverArr
        },
        socialfeed_obj: tweetObj
    }
    console.log("message :>> ", message)
    chrome.storage.local.set({
        socialObject: { post: message },
    })
    window.panelToggle(`?save-social`, true)
    
}

function addButton() {
    let bars = document.querySelectorAll('article[data-testid="tweet"]');
    for (let bar of bars) {
        if (bar.querySelector('.twitter-button')) continue;
        let div = document.createElement('div');
        let img = document.createElement('img');
        img.src = 'https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg';
        img.style.width = '23px';
        img.style.height = 'auto';
        img.style.cursor = 'pointer';
        img.className = 'twitter-button';
        img.title = 'Add to Feed!';
        img.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            let tweet = bar
            // if (commonParent) {
                // let actor = commonParent.querySelector(".css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0")
                // if (actor) {
                //     actorName = actor.innerText || actor.textContent
                //     actorName = actorName.trim()
                // } else {
                //     
                // }
                // let child = commonParent.querySelector(".css-1dbjc4n")
                // 
                // if (child) {
                //     desc = child.textContent || child.innerText
                //     desc = desc.trim()
                // } else {
                //     
                // }

                // let imgDivElement = commonParent.querySelectorAll("img")[1]
                // let imageUrl = imgDivElement.src// Removes url() and double quotes
                // link = window.location.href;
                // 
                // 
                // 
                // 
                // addToCurateitTwitterTest(actorName, desc, link, imageUrl)
            if (tweet) {
                let actor = tweet?.querySelector("div[data-testid='User-Name'] a")
                // let actor = tweet.querySelector(".css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0")
                if (actor) {
                    actorName = actor.innerText || actor.textContent
                    actorName = actorName.trim()
                } else {
                    console.log('No actor with .update-components-actor__name.t-14.t-bold.hoverable-link-text.t-black classes found.');
                }
                // const tweetUrlRegex = /^(status|home|bookmarks)(?:\/.+)?$/
                const allAnchorTagsInArticle = [...tweet.querySelectorAll("a[role=link]")]
                let tweetUrl = ""
                for (const anchorTag of allAnchorTagsInArticle) {
                    const index = Array.from(anchorTag.children).findIndex((child) => child.tagName === "TIME")
                    if (index !== -1) {
                        tweetUrl = anchorTag.href
                        break
                    }
                }
                let url = null
                try {
                    url = new URL(tweetUrl)
                } catch (error) {
                    console.log("Invalid Url :>> ", tweetUrl, error)
                    return null
                }

                const tweetId = url.pathname.split("/").reverse()[0]
                const conversation_id = tweetId

                let user = {}
                const userHandleElement = tweet
                    .querySelector('div[data-testid="Tweet-User-Avatar"]')
                    ?.querySelector("div[data-testid]")
                const userNameElement = tweet.querySelector('div[data-testid="User-Name"]')
                const userHandle = userHandleElement
                    .getAttribute("data-testid")
                    .replace("UserAvatar-Container-", "")
                const userProfile = userHandleElement
                    .querySelector(`a[href="/${userHandle}"]`)
                    .querySelector("img")?.src
                user.id = userHandle
                user.name = userNameElement.querySelector("a span span")?.textContent
                user.profile_url = "https://twitter.com/" + userHandle
                user.screen_name = userHandle
                user.profile_image_url = userProfile
                user.verified = userNameElement.querySelector(
                    'svg[data-testid="icon-verified"]'
                )
                    ? true
                    : false
                const date = userNameElement.querySelector("time")
                    ? userNameElement.querySelector("time").getAttribute("datetime")
                    : ""

                // Get the tweet text
                const text = tweet.querySelector('div[data-testid="tweetText"]')?.textContent

                // Get the reply count
                const replycountElement = tweet.querySelector('[data-testid="reply"]')
                const reply_count = replycountElement
                    ? replycountElement.getAttribute("aria-label")?.match(/\d+/)?.[0] || 0
                    : 0

                // Get the like count
                const likeCountElement = tweet.querySelector('[data-testid="like"]')
                    ? tweet.querySelector('[data-testid="like"]')
                    : tweet.querySelector('[data-testid="unlike"]')
                const likeCount = likeCountElement
                    ? likeCountElement.getAttribute("aria-label")?.match(/\d+/)?.[0] || 0
                    : 0

                // Get the retweet count
                const retweetCountElement = tweet.querySelector('[data-testid="retweet"]')
                const retweet_count = retweetCountElement
                    ? retweetCountElement.getAttribute("aria-label")?.match(/\d+/)?.[0] || 0
                    : 0

                // Get the bookmark count
                const bookmarkCountElement = tweet.querySelector('[data-testid="bookmark"]')
                const bookmarkCount = bookmarkCountElement
                    ? bookmarkCountElement.getAttribute("aria-label")?.match(/\d+/)?.[0] || 0
                    : 0

                // Get the media URLs
                const medias = []

                const mediaElements = tweet.querySelectorAll('[data-testid="tweetPhoto"]')
                for (const mediaElement of mediaElements) {
                    const mediaUrl = mediaElement
                        .querySelector("div")
                        ?.style.backgroundImage.slice(4, -1)
                        .replace(/"/g, "")
                    if (mediaUrl) {
                        medias.push({ url: mediaUrl })
                    }
                }

                const videoElements = tweet.querySelectorAll('[data-testid="videoComponent"]')
                for (const videoElement of videoElements) {
                    const mediaUrl = videoElement.querySelector("video")?.getAttribute("poster")
                    if (mediaUrl) {
                        medias.push({ url: mediaUrl })
                    }
                }

                const EmbedElements = tweet.querySelectorAll('[data-testid="card.wrapper"]')
                for (const EmbedElement of EmbedElements) {
                    const mediaUrl = EmbedElement.querySelector("img")?.getAttribute("src")
                    if (mediaUrl) {
                        medias.push({ url: mediaUrl })
                    }
                }

                // Return an object with the tweet data
                addToCurateitTwitterTest(actorName, text, tweetUrl, {
                    tweetId,
                    conversation_id,
                    date,
                    text,
                    reply_count,
                    retweet_count,
                    likeCount,
                    medias,
                    user,
                    tweetUrl,
                })
            } else {
                console.log('No common parent found.');
            }
        });
        div.appendChild(img);
        div.style.display = 'flex';
        let targetContainer = Array.from(bar.querySelectorAll('div[id^="id__"]'))?.filter((f) => { return f.getAttribute("role") === "group" })
        if (targetContainer && targetContainer.length > 0) {
            targetContainer = targetContainer[0]
            targetContainer.appendChild(div);
        } else {
            console.warn("Target container not found inside the bar!");
        }
    }
}

// Run the addButton function once the page is loaded
window.addEventListener('load', function () {
    // Run the function once at the start
    addButton();

    // Create a MutationObserver to watch for changes in the page for addButton
    let observer1 = new MutationObserver(addButton);
    // Start observing
    observer1.observe(document.body, { childList: true, subtree: true });
});

