let timeInterval = null
let username = null
let matchWithDomain = null
let matchWithSubdomian = null
let matchWithAllSub = null
let userboards = null
let board = null
let boards = null
let authenticationDetails = null
let ctDomain = null
let userId = null
let authenticateToken = null
// const pinterestUrlRegex       = new RegExp("/^https:\/\/www.pinterest.[a-z.]{2,5}\/([a-z0-9_]{1,30})/i");
// const pinUrlRegex             = new RegExp("https://*.pinterest.com/[^.]+");

const checkIsUserLoggedIn = async () => {
    const text = await chrome?.storage?.sync.get(["userData"]);

    if (text && text?.userData && text?.userData?.apiUrl) {
        ctDomain = text?.userData?.apiUrl;
        userId = text?.userData?.userId;
        authenticateToken = text?.userData?.token;
        return {
            url: text.userData.apiUrl,
            token: text.userData.token,
            collectionId: text?.userData?.unfilteredCollectionId,
            userId: text?.userData?.userId,
        };
    } else {
        window.panelToggle(`?open-extension`, true);
        return false;
    }
};

function getResource(resource, options, callback) {
    if (window.location.hostname.startsWith("ct")) {
        return
    }
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            callback(JSON.parse(xhr.responseText));
        } else {
            console.log("Request failed on pinterest with curateit");
            // alert('An error has occurred.')
            // console.log(JSON.parse(xhr.responseText));
        }
    };
    xhr.open('GET', window.location.origin + '/resource/' + resource + 'Resource/get/?data=' + encodeURIComponent(JSON.stringify({ options: options })));
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*, q=0.01');
    xhr.send();
}

async function done() {
    const pboverlay         = document.getElementById("pboverlay")
    const injectedOverlay   = document.getElementById("injected-overlay")
    const collectionObj = {
        name: boards?.name,
        author: userId,
    }

    try {
        const collectionResponse = await axios.post(
            `${ctDomain}/api/collections`,
            { data: collectionObj },
            {
                headers: {
                    Authorization: `Bearer ${authenticateToken}`
                },
            }
        );

        const chunkSize = 20;
        for (let i = 0; i < boards?.pins?.length; i += chunkSize) {
            const chunk = boards?.pins?.slice(i, i + chunkSize);
            const finalPayload = chunk.map((pin) => {
                return {
                    author: parseInt(userId),
                    description: pin?.description,
                    url: pin?.url || pin?.link,
                    title: pin?.title,
                    imageColor: { "url": pin.image, "imageColor": pin?.color ? [pin.color] : [] },
                    media_type: "SocialFeed",
                    platform: "Pinterest",
                    post_type: "Pin",
                    metaData: {
                        docImages: pin?.image ? [pin?.image] : [],
                        defaultIcon: pin?.image ? pin?.image : null,
                        defaultThumbnail: pin?.image ? pin?.image : null,
                        icon: pin?.image ? { type: "image", icon: pin?.image } : null,
                        type: "SocialFeed",
                        title: null,
                        covers: pin?.image ? [pin?.image] : null,
                    },
                    media: pin?.image ? { covers: [pin?.image] } : null,
                    collection_gems: collectionResponse?.data?.data?.id,
                    socialfeed_obj: pin
                };
            });

            // for (const payload of finalPayload) {
                try {
                    await axios.post(
                        // `${ctDomain}/api/gems`,
                        `${ctDomain}/api/store-gems`,
                        // { data: payload },
                        { data: finalPayload },
                        {   
                            headers: {
                                Authorization: `Bearer ${authenticateToken}`
                            },
                        }
                    );
                } catch (err) {
                    console.log("GEM ERROR ====>", err);
                    if (err?.response?.status === 429) {
                        alert("You have reached the limit of adding pins to collection. Please try again later.");
                        if (injectedOverlay) {
                            document.body.removeChild(injectedOverlay)
                        }
                        if (pboverlay) {
                            document.body.removeChild(pboverlay);
                        }
                    }
                    return;
                }
            // }
        }
        if (pboverlay) {
            document.body.removeChild(pboverlay);
        }
        if (injectedOverlay) {
            document.body.removeChild(injectedOverlay)
        }
        boards = null;
        window.panelToggle(`?refresh-gems`, true);
    } catch (err) {
        console.log("COLLECTION ERROR ====>", err);
        boards = null;
        if (err?.response?.status === 429) {
            alert("You have reached the limit of adding pins to collection. Please try again later.");
            if (pboverlay) {
                document.body.removeChild(pboverlay);
            }
            if (injectedOverlay) {
                document.body.removeChild(injectedOverlay)
            }
        }
    }
}

function getFeed(bookmarks) {
    if (board?.type == 'user') {
        getResource('UserPins', { username: username, page_size: 25, bookmarks: bookmarks }, parseFeed);
    } else {
        getResource('BoardFeed', { board_id: board.id, page_size: 25, bookmarks: bookmarks }, parseFeed);
    }
}

// parse incoming pins from selected board
function parseFeed(json) {
    json.resource_response.data.forEach(function (p, i) {
        if (p.type == 'pin') {
            // add board if not already
            if (!boards) boards = {
                id: p.board.id,
                name: p.board.name,
                url: `${window.location.origin}/${p.board.url}`,
                privacy: p.board.privacy,
                pins: []
            }
            // add pin to board
            const pTitlte = `${p?.grid_title && p?.grid_title !== "" ? p?.grid_title : p?.description && p?.description !== " " ? p?.description?.slice(0, 50).concat("...") : p?.pinner?.username ? `Pin by ${p?.pinner?.username}` : ""}`
            const pDesc   = `${p.description || p?.grid_description}`
            boards.pins.push({
                id: p.id,
                link: p.link,
                title: JSON.stringify(`${pTitlte}`),
                description: JSON.stringify(`${pDesc}`),
                url: `${window.location.origin}/pin/${p.id}`,
                image: p.images.orig.url,
                color: p.dominant_color,
                longitude: (p.place && p.place.longitude) || null,
                latitude: (p.place && p.place.latitude) || null,
                pinner: p.pinner.username,
                privacy: p.privacy,
                date: Date.parse(p.created_at)
            });
            // progress(pin_count++, board.pin_count);
        }
    })

    var bookmarks = json.resource.options.bookmarks;
    if (bookmarks[0] == '-end-') {
        done();
    } else {
        getFeed(bookmarks);
    }
}

function parseBoard(json) {
    board = json.resource_response.data;
    getFeed();
}

// set export status
function pbStatus(s) {
    document.querySelector('#pboverlay h1').innerText = s;
}

function setupOverlayForBoards(json) {
    // create overlay
    var overlay = document.createElement('div');
    overlay.id = 'pboverlay';
    overlay.innerHTML = '\
    <style>\
      #pboverlay { display: block; bottom: 0; left: 0; right: 0; top: 0; z-index: 9999; position: fixed; background: rgba(0, 0, 0, 0.8); color: white; text-align: center; }\
      #pboverlay .close { color: white; position: absolute; top:10px; right:20px; font-size: 30px; }\
      #pboverlay .standardForm { top: 50%; margin-top: -100px; position: absolute; width: 100%; max-width: none; }\
      #pboverlay h1 { color: white; }\
      #pboverlay .controls a { display: inline-block; }\
      #pboverlay select, #pboverlay meter { width: 100%; max-width: 300px; !important }\
      #pboverlay .btn { -webkit-box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.34) !important; box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.34) !important; margin-left: 10px;}\
    </style>\
    <a href="#" class="close">&times;</a>\
    <form class="standardForm">\
      <h1>Choose a board to export</h1>\
      <p class="controls">\
        <select  id="pbselect-box"></select>\
        <button class="Button btn rounded primary">\
          <span class="buttonText">Import</span>\
        </button>\
      </p>\
    </form>'

    document.querySelector('body').appendChild(overlay);
    var select = document.querySelector('#pboverlay select');
    // var option = document.createElement('option');
    // option.text = ' - All public pins - ';
    // option.value = 'all';
    // select.add(option);

    // add dropdown options for each board
    Array.prototype.forEach.call(json.resource_response.data, function(b, i) {
      var option = document.createElement('option');
      option.text = b.name;
      option.value = b.id;
      option.selected = (location.pathname == b.url);
      select.add(option);
    });

    // set export button
    document.querySelector('#pboverlay button').onclick = function() {
      document.querySelector('#pboverlay .controls').innerHTML = '<meter min="0" max="100" id="pb-meter"></meter>';
      pbStatus('Exporting...');
      var selected = select.querySelector('option:checked');
      if (selected.value == 'all') {
        pbStatus('Exporting all pins...');
        getResource('User', {username: username}, parseBoard);
      } else {
        const currentBoard = userboards?.resource_response?.data.find(board => board.id === selected.value);
        pbStatus('Exporting ' + selected.text + " with " + currentBoard?.pin_count + ' pins...');
        getResource('Board', {board_id: selected.value}, parseBoard);
      }
      return false;
    };

    // set up close button
    document.querySelector('#pboverlay .close').onclick = function() {
      location.href = location.pathname;
      return false;
    };
}

async function onInjectClick(e) {
    // console.log("JSON =====<", userboards);
    authenticationDetails = await checkIsUserLoggedIn();
    if (!authenticationDetails) {
        return
    }
    if (!userboards) {
        alert('Log in and visit your profile (pinterest.com/username) or board to start');
        return
    }


    // boards = userboards?.resource_response?.data
    const currentBoard = userboards?.resource_response?.data.find(board => board.url === window.location.pathname);
    $(document.body).append(
        `<div id="injected-overlay" style="font-size:50px;display:block;font-weight:800;position: fixed;width: 100%;height: 100%;top: 0;left: 0;right:0;bottom: 0;background: linear-gradient(90deg, rgba(16,95,211, 0.8), rgba(16,95,211, 0.8));z-index: 1; font-family: Roboto, Helvetica, Arial, sans-serif;"><div style="position: absolute;top: 50%;left: 50%;font-size: 50px;color: white;transform: translate(-50%,-50%);-ms-transform: translate(-50%,-50%);text-align: center;"><span id="status-bar">Sit tight, we’re grabbing <br/> your total ${currentBoard?.pin_count} pins...<br/></span></div><div style="position: absolute;top: 90%;left: 90%;"></div></div>`
    );
    getResource('Board', { board_id: currentBoard.id }, parseBoard);
}

async function onProfileInjectClick(e) {
    authenticationDetails = await checkIsUserLoggedIn();
    if (!authenticationDetails) {
        return
    }
    if (!userboards) {
        alert('Log in and visit your profile (pinterest.com/username) or board to start');
        return
    }

    setupOverlayForBoards(userboards);

}


const createCurateitBtn = () => {
    const elem          = document.querySelector("[data-test-id='LegoBoardHeader__main']") || document.querySelector("[data-test-id='profile-header']") || document.querySelector("[data-test-id='board-header']");
    const isProfilePage = document.querySelector("[data-test-id='profile-header']") ? true : false;
    // console.log("Elem ===>", elem)
    $(elem).append(`<button 
                        id="injected-button" 
                        style="font-size: 14px;
                                border: 1px solid gray;
                                margin-top: 10px;
                                cursor: pointer;
                                background: white;
                                border-radius: 16px;
                                color: black;
                                padding: 6px 10px;
                                font-weight: 600;
                                display: inline-flex;
                                align-items: center;
                                top: 5px;
                                width: auto;
                                align-self: center;"
                    >
                        <img src="https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png" 
                            width="20" 
                            style="margin-right: 5px; width: 20px; height: 20px;"
                        />
                        Import Board
                    </button>`)
    document.getElementById("injected-button")?.addEventListener("click", isProfilePage ? onProfileInjectClick : onInjectClick);
}


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    matchWithSubdomian = request.tab_url?.match(/^https:\/\/www.pinterest.[a-z.]{2,5}\/([a-z0-9_]{1,30})/i)
    matchWithDomain = request.tab_url?.match(/^https:\/\/in.pinterest.[a-z.]{2,5}\/([a-z0-9_]{1,30})/i)
    matchWithAllSub = request.tab_url?.match(/^https:\/\/([a-zA-Z0-9-]+\.)?pinterest\.[a-z.]{2,5}\/([a-z0-9_]{1,30})/i)

    if (
        request.tab_url && (matchWithDomain || matchWithSubdomian || matchWithAllSub)
    ) {
        // if (timeInterval) {
        //     const injectedBtn = document.getElementById("injected-button");
        //     if (injectedBtn) {
        //         clearInterval(timeInterval);
        //         timeInterval = null;
        //     }
        // }

        // timeInterval = setInterval(() => {
        // if (!window.location.hostname.startsWith("ct")) {
        let timer = setInterval(() => {
            const btn = document.getElementById("injected-button");
            if (btn === "null") {
                createCurateitBtn();
                return
            }
            if (btn) {
                clearInterval(timer);
                return
            }
            createCurateitBtn();
        }, 500)    
        const injectedBtn = document.getElementById("injected-button");
        if (!injectedBtn) {
            createCurateitBtn();
            if (matchWithDomain || matchWithSubdomian || matchWithAllSub) {
                username = matchWithDomain?.[1] ? matchWithDomain[1] : matchWithSubdomian?.[1] ? matchWithSubdomian[1] : matchWithAllSub?.[2] ?  matchWithAllSub[2] : null;
                if (!userboards && username) {
                    getResource('Boards', { username: username, field_set_key: 'detailed' }, (json) => { userboards = json });
                }
            } else {
                alert('Log in and visit your profile (pinterest.com/username) or board to start');
                return false;
            }

        }
        // }
        // }, 500);
    }
});