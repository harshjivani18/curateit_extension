(() => {

  let collectionId = null
  let isProfileImport = false
  let remarks = ""
  let tags = []
  let observer1 = null

  function cleanup() {
    observer1?.disconnect();
    document.getElementById("injected-button").removeEventListener("click");
  }

  window.addEventListener("beforeunload", cleanup);

  window.addEventListener("load", function () {
    addBulkImportBtn();

    observer1 = new MutationObserver(addBulkImportBtn);
    observer1?.observe(document.body, { childList: true, subtree: true });

    // Assuming there's a way to detect navigating away or button removal
    if (window.location.search.includes("openCTPanel=true")) {
      window.panelToggle(`?add-import-details`, true, false);
    }
  })

  const checkIsUserLoggedIn = async () => {
    const text = await chrome?.storage?.sync.get(["userData"]);
  
    if (text && text?.userData && text?.userData?.apiUrl) {
      return {
        url: text.userData.apiUrl,
        token: text.userData.token,
        id: text?.userData?.id,
        collectionId: text?.userData?.unfilteredCollectionId,
      };
    } else {
      window.panelToggle(`?open-extension`, true);
      return false;
    }
  };

  function addBulkImportBtn() {
    let bar = document.querySelector("#header > h1 > a");

    if (bar.textContent === "My Books") {

      let div = document.createElement("div");

      let button = document.createElement("button");
      button.innerHTML = `
        <img src="https://uploads-ssl.webflow.com/630c8eb6cd033024afa8858e/63511ad74e84aab0cb60a9e4_android-chrome-256x256.png" width="20" style="margin-right: 5px; filter: invert(0);">
        Bulk Import
      `;
      button.id = "injected-button";
      button.style = `
        font-size: 14px;
        border: 1px solid gray;
        cursor: pointer;
        background: white;
        border-radius: 16px;
        color: black;
        padding: 6px 10px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
      `;
      button.className = "bulkImportBtn";
      button.title = "Add to Feed!";

      div.style =`margin-left: 10px;`

      button.addEventListener("click", async function (e) {
        e.preventDefault();
        // chrome.storage.sync.set({
        //   goodreadsData: {
        //     data: {
        //       firstPage,
        //       maxPage,
        //     },
        //   },
        // });
        const paginationElem  = document.getElementById("reviewPagination")
        if (paginationElem?.style.display !== "none") {
          window.location.search = "?utf8=✓&ref=nav_mybooks&per_page=infinite&view=table&openCTPanel=true"
          window.reload()
        }
        const authenticateUser = await checkIsUserLoggedIn();
        if (authenticateUser?.token) {
          window.panelToggle(
            `?add-import-details`,
            true,
            false
          );
        }
      });

      let is_injected_overlay_exists = document.getElementById("injected-overlay");
      if (!is_injected_overlay_exists) {
        const overlayDiv = document.createElement("div");
        overlayDiv.id    = "injected-overlay";
        overlayDiv.style = `font-size:50px;display:none;font-weight:800;position: fixed;width: 100%;height: 100%;top: 0;left: 0;right:0;bottom: 0;background: linear-gradient(90deg, rgba(16,95,211, 0.8), rgba(16,95,211, 0.8));z-index: 99; font-family: Roboto, Helvetica, Arial, sans-serif;`
        overlayDiv.innerHTML = `<div style="position: absolute;top: 50%;left: 50%;font-size: 50px;color: white;transform: translate(-50%,-50%);-ms-transform: translate(-50%,-50%);text-align: center;line-height: normal;">
            <span id="status-bar">Sit tight, we’re grabbing <br/> your good reads...<br/></span>
          </div>
          <div style="position: absolute;top: 90%;left: 90%;"></div>`
        document.body.appendChild(overlayDiv);
      }

      div.appendChild(button);

      let targetContainer = bar;
      if (targetContainer) {
        targetContainer.style.display = "flex";
        targetContainer.style.flexDirection = "row";
        targetContainer.style.alignItems = "baseline";
        targetContainer.appendChild(div);
      } else {
        console.warn("Target container not found inside the bar!");
      }
    }
  }

  function resetAfterSubmit () {
    window.scrollTo(0, 0);
    $("#injected-overlay").css({ display: "none" });

    $("#injected-button").unbind("click");

    // window.location.search = window.location.search.replace("&openCTPanel=true", "")
  }

  function smoothScrollToBottom(tableBB) {
    window.scrollBy({ top: document.body.scrollHeight - window.innerHeight, left: 0, behavior: 'smooth' });
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, 100)
    })
  }

  window.grabAllGoodReadsReviews = async (obj) => {
    collectionId    = obj?.collection_gems;
    tags            = obj?.tags;
    remarks         = obj?.remarks;
    isProfileImport = obj?.isImportProfile;

    let stopScrapping = false
    const bookArr     = []
    const totalBooks  = document.querySelector("#infiniteStatus")?.textContent?.toLowerCase()?.split("of")?.[1]?.split("loaded")?.[0]?.trim();

    const booksTable      = document.getElementById("books")
    const tableBB         = booksTable.getBoundingClientRect()
    const total           = parseInt(totalBooks)
    const status_bar      = document.getElementById("status-bar");
    const overlay         = document.getElementById("injected-overlay");

    overlay.style.display = "block";

    if (status_bar) {
      status_bar.innerHTML = `Sit tight, we’re grabbing <br/> all books from goodreads...<br/>`
    }
    
    while (!stopScrapping) {
      await smoothScrollToBottom(tableBB)
      const bookList    = document.getElementById("booksBody")
      if (bookList.children.length === total) {
        stopScrapping = true
      }
    }

    if (status_bar) {
      status_bar.innerHTML = `Sit tight, we’re processing books to save...<br/>`
    }

    const allBooks          = document.getElementById("booksBody").children
    const userInformation   = await checkIsUserLoggedIn()
    for (let i = 0, iLen = allBooks.length; i < iLen; i++) {
      const book              = allBooks[i]
      const cover             = book.querySelector(`#cover_${book.id}`)?.src?.replace("._SY75_.jpg", ".jpg").replace("._SX50_.jpg", ".jpg").replace("._SX50_SY75_.jpg", ".jpg")
      const url               = book.querySelector(`.title > .value > a`)?.href
      const title             = book.querySelector(`.title > .value > a`)?.textContent?.trim()
      const author            = book.querySelector(`.author > .value > a`)?.textContent?.trim()
      const isGoodReadAuthor  = book.querySelector(`.author > .value > span`)?.textContent === "*"
      const isbn              = book.querySelector(`.isbn > .value`)?.textContent?.trim()
      const isbn13            = book.querySelector(`.isbn13 > .value`)?.textContent?.trim()
      const asin              = book.querySelector(`.asin > .value`)?.textContent?.trim()
      const totalPages        = book.querySelector(`.num_pages > .value > nobr`)?.textContent?.trim()
      const avgRating         = book.querySelector(`.avg_rating > .value`)?.textContent?.trim()
      const numRatings        = book.querySelector(`.num_ratings > .value`)?.textContent?.trim()
      const publishDate       = book.querySelector(`.date_pub > .value`)?.textContent?.trim()
      const editionDate       = book.querySelector(`.date_pub_edition > .value`)?.textContent?.trim()
      const myRating          = book.querySelector(`.rating > .value > .stars`)?.getAttribute("data-rating")
      const votes             = book.querySelector(`.votes > .value > a`)?.textContent?.trim()
      const readCount         = book.querySelector(`.read_count > .value`)?.textContent?.trim()
      const readStart         = book.querySelector(`.date_started > .value > .date_row > .editable_date > .date_started_value`)?.textContent?.trim()
      const readEnd           = book.querySelector(`.date_read > .value > .date_row > .editable_date > .date_read_value`)?.textContent?.trim() || ""
      const addedDate         = book.querySelector(`.date_added > .value > span`)?.textContent?.trim()
      const status            = book.querySelector(".shelves > .value > span > a")?.textContent?.trim() || book.querySelector(".shelves > .value > span > span > a")?.textContent?.trim() || ""

      const media             = {
        covers: [cover],
        author,
        isbn,
        isbn13,
        asin,
        totalPages,
        avgRating,
        numRatings,
        publishDate,
        editionDate,
        myRating,
        votes,
        readCount,
        readStart,
        readEnd,
        status,
        addedDate,
        isGoodReadAuthor
      }
      const images = Array.from(document?.images)?.map((img) => { return img.src }) || []
      const icon = document.querySelector('link[rel="icon"]')?.href || ""
      bookArr.push({
        url,
        title,
        description: "",
        media_type: "Book",
        metaData: {
          covers: [cover],
          docImages: [cover],
          icon: { icon: "https://d3jrelxj5ogq5g.cloudfront.net/webapp/goodreads.png", type: "image" },
          defaultIcon: "https://d3jrelxj5ogq5g.cloudfront.net/webapp/goodreads.png",
          defaultThumbnail: cover
        },
        media,
        entityObj: {
          ...media,
          averageRating: media.avgRating,
          publishedDate: media.publishDate === "unknown" ? null : media.publishDate
        },
        collection_gems: collectionId,
        remarks,
        tags,
        is_favourite: false,
        showThumbnail: true
      })
    }

    if (status_bar) {
      status_bar.innerHTML = `Sit tight, Starting Importing...<br/>`
    }

    const chunkSize   = 20
    for (let j = 0, jLen = bookArr.length; j < jLen; j += chunkSize) {
      const chunk       = bookArr.slice(j, j + chunkSize)
      const requestObj  = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInformation.token}`,
        },
        body: JSON.stringify({ data: chunk }),
      };
      try {
        await fetch(
          `${userInformation?.url}/api/store-gems?isProfile=${isProfileImport}`,
          requestObj
        );
        if (status_bar) {
          status_bar.innerHTML = `Total ${bookArr.length} books going to save...<br/>`
        }
      } catch (error) {
        continue;
      }
    }
    fetch(
      `${userInformation?.url}/api/gamification-score?module=gem`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInformation.token}`,
      }
    })

    resetAfterSubmit()
    alert("Books submited successfully");
    window.panelToggle(`?refresh-gems`, true);
    if (window.location.search.includes("openCTPanel=true")) {
      window.location.search = window.location.search.replace("&openCTPanel=true", "")
    }
  }

})();
