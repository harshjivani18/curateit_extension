///Main Code Starts here
let books = []
let collectionId = null;
let selectedTags = [];
let remarks = "";
let currentHighlights = [];
$(document).ready(() => {
  // Append import button in current page
  $.get(
    chrome.runtime.getURL("/scripts/kindle-highlight/import-highlight.html"),
    (data) => {
      $(data).appendTo("body");
      let is_injected_overlay_exists = $("#injected-overlay").length
      if (!is_injected_overlay_exists) {
        $("body").append(`<div id="injected-overlay" style="font-size:50px;display:none;font-weight:800;position: fixed;width: 100%;height: 100%;top: 0;left: 0;right:0;bottom: 0;background: linear-gradient(90deg, rgba(16,95,211, 0.8), rgba(16,95,211, 0.8));z-index: 1; font-family: Roboto, Helvetica, Arial, sans-serif;"><div style="position: absolute;top: 50%;left: 50%;font-size: 50px;color: white;transform: translate(-50%,-50%);-ms-transform: translate(-50%,-50%);text-align: center;"><span id="status-bar"></span></div><div style="position: absolute;top: 90%;left: 90%;"></div></div>`)
      }
    }
  )

  const getColorCode = (color) => {
    let codeObj = {}
    switch (color) {
      case "blue":
        codeObj = {
          id: 1,
          border: "border-l-violet-500",
          bg: "#C1C1FF",
          text: "text-violet-500",
          colorCode: "#C1C1FF",
          className: "violet-hl",
        }
        break

      case "pink":
        codeObj = {
          id: 2,
          border: "border-l-pink-500",
          bg: "#FFAFED",
          text: "text-pink-500",
          colorCode: "#FFAFED",
          className: "pink-hl",
        }
        break

      case "green":
        codeObj = {
          id: 3,
          border: "border-l-green-300",
          bg: "#D2F9C8",
          text: "text-green-300",
          colorCode: "#D2F9C8",
          className: "green-hl",
        }
        break

      default:
        codeObj = {
          id: 4,
          border: "border-l-yellow-200",
          bg: "#FFFAB3",
          text: "text-yellow-200",
          colorCode: "#FFFAB3",
          className: "yellow-hl",
        }
    }
    return codeObj
  }

  const checkIfHighlightExist = (highlts) => {
    let newHighlights = [];
    if (highlts.length === 0) return newHighlights;

    highlts.map(ht => {
      let indexInCurrentHighlight = currentHighlights.findIndex(currentInd => ht.highlightId === currentInd) || -1;
      if (indexInCurrentHighlight !== -1) {
        currentHighlights.splice(indexInCurrentHighlight, 1);
      } else {
        newHighlights.push(ht);
      }
    })
    return newHighlights;
  }

  const fetchMeta = (asin) =>
    new Promise((resolve) => {

      let tlds = tldjs.parse(window.location.href)
      axios
        .get(`https://${tlds.hostname}/notebook?asin=${asin}&contentLimitState=&`)
        .then((res) => {
          if (res?.status === 200) {
            const resInText = res.data
            let highlightObj = {}
            var parser = new DOMParser()
            var doc = parser.parseFromString(resInText, "text/html")
            var newDoc = doc

            const container = newDoc.querySelector(
              ".kp-notebook-annotation-container"
            )
            var titleContainer = container.querySelector(".a-spacing-base")
            var highlightContainer = container.querySelector(
              "#kp-notebook-annotations"
            )

            //Extract meta data
            const coverImage = titleContainer
              .querySelector(".kp-notebook-cover-image-border")
              .getAttribute("src")

            const bookUrl =
              titleContainer
                .querySelector("a.kp-notebook-printable")
                .getAttribute("href") || ""

            const title = titleContainer.querySelector("h3")?.textContent || "No Title"
            // const lastAccessedOn = titleContainer.querySelector(
            //   "#kp-notebook-annotated-date"
            // ).textContent
            const authorName =
              titleContainer.querySelector("h3")?.nextSibling?.textContent || "No Author"
            var highlights = []

            const images1  = Array.from(document.images).map(img => img.src);
            const icon     = document.querySelector('link[rel="shortcut icon"]')?.href || ""
            highlightContainer
              .querySelectorAll(".a-spacing-base")
              .forEach(function (ele) {
                const obj = {}
                const highlightMeta = ele.querySelector(
                  "#annotationHighlightHeader"
                )?.textContent || "";

                const highlightId = ele.getAttribute("id")
                obj.highlightId = highlightId

                if (highlightMeta.length > 0) {
                  const splitMeta = highlightMeta.split("|")

                  //Extract color
                  if (splitMeta.length > 0) {
                    const color = splitMeta[0].split(" ")[0].trim() || ""
                    let colorObj = {}
                    if (color.length > 0) {
                      colorObj = getColorCode(color.toLowerCase())
                    } else {
                      colorObj = getColorCode(color)
                    }
                    obj.color = colorObj
                  }

                  //Etract Page Number
                  if (splitMeta.length > 1) {
                    obj.pageNo = splitMeta[1].split(":")[1].trim() || ""
                  }
                }

                obj.text = ele.querySelector("#highlight")?.textContent || ""
                if (obj.text !== "") {
                  highlights.push(obj)
                }
              })

            //Filter highlights
            highlights = checkIfHighlightExist(highlights);

            highlightObj.title = title
            // highlightObj.asin = asin
            highlightObj.media_type = "Highlight"
            highlightObj.metaData = {
              covers: [coverImage],
              docImages: [coverImage],
              defaultThumbnail: coverImage,
              defaultIcon: icon,
              icon: { type: "image", icon: icon || ""}
            }
            // highlightObj.media = {
            //   covers: [coverImage],
            // }
            highlightObj.authorName = authorName
            highlightObj.url = bookUrl
            highlightObj.highlights = highlights
            // highlightObj.lastAccessedOn = lastAccessedOn
            if (highlights.length > 0) {
              books.push(highlightObj)
              resolve();
            } else {
              resolve();
            }

          } else {
            resolve();
          }
        }).catch(error => {
          resolve();
        })
    })

  //import action starts here
  function handleAction() {
    collectionId = null;
    selectedTags = [];
    remarks = "";
    window.panelToggle(`?add-import-details`, true)
  }

  //IMPORT CODE START FROM HERE
  window.importKindleHighlights = async (vals) => {
    collectionId = vals?.collection_gems;
    selectedTags = vals?.tags;
    remarks = vals?.remarks;

    //Check if current highlighsts are all prefetched
    chrome?.storage?.local.get(["allkindleHighlights"], (data) => {
      if (!data?.allkindleHighlights) {
        window.panelToggle(`?search-bookmark`, true)
      } else {
        currentHighlights = data?.allkindleHighlights?.highlights;
        importAllKindleHighlights()
      }
    });

  }

  const getStorageData = () => new Promise((resolve, reject) => {
    chrome?.storage?.sync.get(["userData"], (text) => {
      if (text?.userData?.apiUrl) {
        resolve(text)
      } else {
        reject();
      }
    });
  })

  const importAllKindleHighlights = (e) => {
    $("#curateit-hightlight-import").children("#btn-text").text("Importing...")
    $("#injected-overlay").css({ display: "block" })
    let status_bar = $("#status-bar")
    if (status_bar) {
      status_bar.html(
        `Importing highlights...`
      )
    }

    const booklistContainer = document.getElementById("kp-notebook-library")

    //Loop through all books and extract its highlights
    let itemsProcessed = 0;
    booklistContainer
      .querySelectorAll(".kp-notebook-library-each-book")
      .forEach(async function (doc) {
        var asin = doc.getAttribute("id")
        await fetchMeta(asin);
        itemsProcessed++;
        if (itemsProcessed === booklistContainer.querySelectorAll(".kp-notebook-library-each-book").length) {
          uploadHighlights();
        }
      })

    async function uploadHighlights() {
      $("#curateit-hightlight-import").children("#btn-text").text("Syncing highlights...")
      let status_bar = $("#status-bar")
      if (status_bar) {
        status_bar.html(
          `Syncing highlights...`
        )
      }
      const storageData = await getStorageData();
      if (storageData && books.length > 0) {
        let flag_ok = false

        for (var i = 0; i < books.length; i++) {
          const response = await fetch(
            `${storageData?.userData?.apiUrl}/api/kindle-highlight`,

            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${storageData.userData?.token}`,
              },
              body: JSON.stringify({
                collection_gems: collectionId,
                tags: selectedTags,
                remarks,
                books: [books[i]],
              }),
            }
          )
          flag_ok = response.ok
          if (flag_ok) {
            let percentCompleted = i / books.length * 100
            // $("#curateit-hightlight-import").children("#btn-text").text(`Syncing highlights (${Math.ceil(percentCompleted)}%) ...`)
            let status_bar = $("#status-bar")
            if (status_bar) {
              status_bar.html(
                `Syncing highlights (${Math.ceil(percentCompleted)}%) ...`
              )
            }
          }
        }

        fetch(
          `${storageData?.userData?.apiUrl}/api/gamification-score?module=gem`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storageData.userData?.token}`,
          }
        })

        if (flag_ok) {
          $("#curateit-hightlight-import")
            .children("#btn-text")
            .text("Importing successful")

          let status_bar = $("#status-bar")
          if (status_bar) {
            status_bar.html(
              `Importing successful`
            )
          }

          setTimeout(() => {
            $("#curateit-hightlight-import")
              .children("#btn-text")
              .text("Import Highlights")
            $("#injected-overlay").css({ display: "none" })
            books = [];
            window.panelToggle(`?refresh-gems`, true);
          }, 1000)

        } else {
          $("#curateit-hightlight-import")
            .children("#btn-text")
            .text("Importing unsuccessful")

          let status_bar = $("#status-bar")
          if (status_bar) {
            status_bar.html(
              `Oops! Something went wrong.Please try again.`
            )
          }

          setTimeout(() => {
            $("#curateit-hightlight-import")
              .children("#btn-text")
              .text("Import Highlights")
          }, 1000)
          books = []
        }
      }
    }
  }

  $(document).on("click", "#curateit-hightlight-import", handleAction)
})
