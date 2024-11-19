let url;
let title;
let desc;
let actorName;
let link;
let imgUrl;
let authenticateUser;

// Function to create and show the loader overlay
function showLoader() {
  const loaderOverlay = document.createElement("div");
  loaderOverlay.style.position = "fixed";
  loaderOverlay.style.top = "0";
  loaderOverlay.style.left = "0";
  loaderOverlay.style.width = "100%";
  loaderOverlay.style.height = "100%";
  loaderOverlay.style.backgroundColor = "rgba(0, 123, 255, 0.5)"; // Translucent blue
  loaderOverlay.style.display = "flex";
  loaderOverlay.style.justifyContent = "center";
  loaderOverlay.style.alignItems = "center";
  loaderOverlay.style.zIndex = "9999";
  loaderOverlay.id = "loaderOverlay";

  const loadingText = document.createElement("div");
  loadingText.innerText = "Importing Movies from Watchlist...";
  loadingText.style.color = "white";
  loadingText.style.fontSize = "2em";

  loaderOverlay.appendChild(loadingText);
  document.body.appendChild(loaderOverlay);
}

// Function to hide the loader overlay
function hideLoader() {
  const loaderOverlay = document.getElementById("loaderOverlay");
  if (loaderOverlay) {
    loaderOverlay.style.display = "none";
  }
}

async function sendData(payload) {
  const text = await chrome?.storage?.sync.get(["userData"]);
  const apiUrl = text?.userData?.apiUrl;
  const url = `${apiUrl}/api/gems?populate=tags`;
  const sessionToken = text?.userData?.token;
  const authToken = sessionToken; // Replace with your actual token
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending data:", error);
    hideLoader();
    throw error; // Rethrow to be caught by Promise.all
  }
}

async function fetchAndLogListItems() {
  const itemsList = document.querySelector("div.lister-list");
  if (!itemsList) {
    return;
  }

  let userId;
  let collectionId;
  const text = await chrome?.storage?.sync.get(["userData"]);
  userId = text?.userData?.userId;
  collectionId = text?.userData?.unfilteredCollectionId;
  userId = parseInt(userId, 10);
  collectionId = parseInt(collectionId, 10);

  const listItems = itemsList.querySelectorAll("div.lister-item");
  const promises = [];

  listItems.forEach((item) => {
    const h2Element = item.querySelector("h3 a");
    const anchorElem = item.querySelector("h3 a");
    const imageElem = item.querySelector("img");
    const descriptionElement = item.querySelectorAll(
      ".lister-item-content p"
    )[1];

    if (!h2Element || !descriptionElement) {
      console.log("h2 element or description element not found in an item.");
      return;
    }

    const title = h2Element?.textContent.trim();
    const link = `https://${window.location.hostname}${anchorElem?.getAttribute(
      "href"
    )}`;
    const imageUrl = imageElem?.src;
    const description = descriptionElement?.textContent.trim();
    const images =
      Array.from(document?.images)?.map((img) => {
        return img.src;
      }) || [];
    const payload = {
      data: {
        title: title,
        description: description,
        expander: [],
        media_type: "Movie",
        author: userId,
        url: link,
        media: {
          covers: [imageUrl],
        },
        metaData: {
          type: "Movie",
          title: title,
          docImages: [imageUrl, ...images],
          icon: {
            type: "image",
            icon: "https://m.media-amazon.com/images/G/01/imdb/images/social/imdb_logo._CB410901634_.png",
          },
          defaultIcon:
            "https://m.media-amazon.com/images/G/01/imdb/images/social/imdb_logo._CB410901634_.png",
          url: link,
          defaultThumbnail: imageUrl,
          covers: [imageUrl],
        },
        collection_gems: collectionId,
        remarks: "",
        tags: [],
        is_favourite: false,
        showThumbnail: true,
      },
    };

    // Add the sendData promise to the array
    promises.push(sendData(payload));
  });

  try {
    // Wait for all requests to complete
    const results = await Promise.all(promises);
  } catch (error) {
    console.error("One or more requests failed", error);
  }

  hideLoader();
}

async function createCollection(name) {
  const text = await chrome?.storage?.sync.get(["userData"]);
  const apiUrl = text?.userData?.apiUrl;
  const sessionToken = text?.userData?.token;
  const authToken = sessionToken; // Replace with your actual token
  let userId = text?.userData?.userId;
  const payload = {
    data: {
      name: name,
      author: userId,
    },
  };

  const checkUrl = `${apiUrl}/api/exist-collection?name=${name}`;
  const url = `${apiUrl}/api/collections`;
  try {
    const checkResponse = await fetch(checkUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!checkResponse.ok) {
      throw new Error(`HTTP error! status: ${checkResponse.status}`);
    }

    const checkData = await checkResponse.json();

    // If the collection exists and has an author id, return the data
    if (checkData?.data?.id) {
      return checkData;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending data:", error);
    throw error; // Rethrow to be caught by Promise.all
  }
}

async function fetchAllMovies() {
  const scriptElement = document.querySelector(
    'script[type="application/ld+json"]'
  );
  let userId;
  const text = await chrome?.storage?.sync.get(["userData"]);

  userId = text?.userData?.userId;
  userId = parseInt(userId, 10);
  const sessionToken = text?.userData?.token;
  const apiUrl = text?.userData?.apiUrl;
  const promises = [];
  const collectionName = document
    .querySelector("h1.header.list-name")
    ?.textContent.trim();
  const newCollection = await createCollection(collectionName);
  const collId = newCollection.data.id;

  if (scriptElement) {
    const jsonData = JSON.parse(scriptElement.textContent);
    if (Array.isArray(jsonData?.about?.itemListElement)) {
      const urls = jsonData?.about?.itemListElement?.map((item) => {
        return `https://www.imdb.com${item.url}`;
      });

      for (const url of urls) {
        const imdbId = url.match(/title\/(tt\d+)/)[1];
        const apiRequestUrl = `${apiUrl}/api/movie-details?imdbId=${imdbId}`;
        try {
          const response = await fetch(apiRequestUrl, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const jsonResponse = await response.json();

          const title = jsonResponse.data.title;
          const icon =
            "https://m.media-amazon.com/images/G/01/imdb/images-ANDW73HA/android-mobile-196x196._CB479962153_.png";
          const link = jsonResponse.data.url;
          const imageUrl = jsonResponse.data.entityObj.poster;
          const description = jsonResponse.data.description;
          const ageRating = jsonResponse.data.entityObj.age_rating;
          const rating = jsonResponse.data.entityObj.score / 10;
          const entityObj = jsonResponse.data.entityObj;
          const images1 =
            Array.from(document?.images)?.map((img) => {
              return img.src;
            }) || [];
          const payload = {
            data: {
              title: title,
              description: description,
              expander: [],
              media_type: "Movie",
              author: userId,
              url: link,
              media: {
                covers: [imageUrl],
              },
              metaData: {
                type: "Movie",
                title: title,
                ageRating: ageRating,
                ratings: rating,
                rating: rating,
                docImages: [imageUrl, ...images1],
                icon: {
                  type: "image",
                  icon: icon,
                },
                defaultIcon: icon,
                url: link,
                covers: [imageUrl],
                defaultThumbnail: imageUrl,
              },
              entityObj: {
                description: description,
                image: imageUrl,
                title: title,
                url: link,
                ratings: rating,
                entityObj: entityObj,
              },
              collection_gems: collId,
              remarks: "",
              tags: [],
              is_favourite: false,
              showThumbnail: true,
            },
          };

          // delay += 300;
          promises.push(sendData(payload));
        } catch (error) {
          console.error("Error fetching data for URL:", url, error);
        }
      }
      // Fetch and log JSON response for each URL
      // urls.forEach(async (currUrl, index) => {
      //   let delay = index * 300;
      //   setTimeout(async () => {
      //     try {
      //       const imdbId = currUrl.match(/title\/(tt\d+)/)[1];
      //       const apiRequestUrl = `${apiUrl}/api/movie-details?imdbId=${imdbId}`;
      //       try {
      //         const response = await fetch(apiRequestUrl, {
      //           method: "GET",
      //           headers: {
      //             Authorization: `Bearer ${sessionToken}`,
      //           },
      //         });

      //         if (!response.ok) {
      //           throw new Error(`HTTP error! status: ${response.status}`);
      //         }

      //         const jsonResponse = await response.json();
      //
      //         const title = jsonResponse.data.title;
      //         const icon =
      //           "https://m.media-amazon.com/images/G/01/imdb/images-ANDW73HA/android-mobile-196x196._CB479962153_.png";
      //         const link = jsonResponse.data.url;
      //         const imageUrl = jsonResponse.data.entityObj.poster;
      //         const description = jsonResponse.data.description;
      //         const ageRating = jsonResponse.data.entityObj.age_rating;
      //         const rating = jsonResponse.data.entityObj.score / 10;
      //         const entityObj = jsonResponse.data.entityObj;
      //         const images1 = Array.from(document?.images)?.map((img) => { return img.src }) || [];
      //         const payload = {
      //           data: {
      //             title: title,
      //             description: description,
      //             expander: [],
      //             media_type: "Movie",
      //             author: userId,
      //             url: link,
      //             media: {
      //               covers: [imageUrl],
      //             },
      //             metaData: {
      //               type: "Movie",
      //               title: title,
      //               ageRating: ageRating,
      //               ratings: rating,
      //               rating: rating,
      //               docImages: [ imageUrl, ...images1],
      //               icon: {
      //                 type: "image",
      //                 icon: icon,
      //               },
      //               defaultIcon: icon,
      //               url: link,
      //               covers: [imageUrl],
      //               defaultThumbnail: imageUrl,
      //             },
      //             entityObj: {
      //               description: description,
      //               image: imageUrl,
      //               title: title,
      //               url: link,
      //               ratings: rating,
      //               entityObj: entityObj,
      //             },
      //             collection_gems: collId,
      //             remarks: "",
      //             tags: [],
      //             is_favourite: false,
      //             showThumbnail: true,
      //           },
      //         };
      //
      //
      //         // delay += 300;
      //         promises.push(sendData(payload));
      //       } catch (error) {
      //         console.error("Error fetching data for URL:", currUrl, error);
      //       }
      //     } catch (error) {
      //       console.error("Error fetching data for URL:", currUrl, error);
      //     }
      //   }, delay);

      // delay += 300;
      //
      // });
      try {
        // Wait for all requests to complete
        const results = await Promise.all(promises);
      } catch (error) {
        console.error("One or more requests failed", error);
      }

      hideLoader();
    } else {
      console.log("jsonData does not have the expected structure");
    }
  } else {
    console.log("Script element not found");
  }
}

async function fetchAllMoviesWatchlist(scrapeLink) {
  let response = await fetch(scrapeLink);
  let domText = await response.text();
  let parser = new DOMParser();
  let doc = parser.parseFromString(domText, "text/html");

  const scriptElement = doc.querySelector('script[type="application/ld+json"]');
  let userId;
  const text = await chrome?.storage?.sync.get(["userData"]);
  userId = text?.userData?.userId;
  userId = parseInt(userId, 10);
  const sessionToken = text?.userData?.token;
  const apiUrl = text?.userData?.apiUrl;
  const promises = [];
  const collectionName = doc
    .querySelector("h1.header.list-name")
    ?.textContent.trim();
  const newCollection = await createCollection(collectionName);
  const collId = newCollection.data.id;

  if (scriptElement) {
    const jsonData = JSON.parse(scriptElement.textContent);
    if (Array.isArray(jsonData?.about?.itemListElement)) {
      const urls = jsonData?.about?.itemListElement?.map((item) => {
        return `https://www.imdb.com${item.url}`;
      });

      for (const url of urls) {
        const imdbId = url.match(/title\/(tt\d+)/)[1];
        const apiRequestUrl = `${apiUrl}/api/movie-details?imdbId=${imdbId}`;
        try {
          const response = await fetch(apiRequestUrl, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const jsonResponse = await response.json();

          const title = jsonResponse.data.title;
          const icon =
            "https://m.media-amazon.com/images/G/01/imdb/images-ANDW73HA/android-mobile-196x196._CB479962153_.png";
          const link = jsonResponse.data.url;
          const imageUrl = jsonResponse.data.entityObj.poster;
          const description = jsonResponse.data.description;
          const ageRating = jsonResponse.data.entityObj.age_rating;
          const rating = jsonResponse.data.entityObj.score / 10;
          const entityObj = jsonResponse.data.entityObj;
          const images1 =
            Array.from(document?.images)?.map((img) => {
              return img.src;
            }) || [];
          const payload = {
            data: {
              title: title,
              description: description,
              expander: [],
              media_type: "Movie",
              author: userId,
              url: link,
              media: {
                covers: [imageUrl],
              },
              metaData: {
                type: "Movie",
                title: title,
                ageRating: ageRating,
                ratings: rating,
                rating: rating,
                docImages: [imageUrl, ...images1],
                icon: {
                  type: "image",
                  icon: icon,
                },
                defaultIcon: icon,
                url: link,
                covers: [imageUrl],
                defaultThumbnail: imageUrl,
              },
              entityObj: {
                description: description,
                image: imageUrl,
                title: title,
                url: link,
                ratings: rating,
                entityObj: entityObj,
              },
              collection_gems: collId,
              remarks: "",
              tags: [],
              is_favourite: false,
              showThumbnail: true,
            },
          };

          //
          // delay += 300;
          promises.push(sendData(payload));
        } catch (error) {
          console.error("Error fetching data for URL:", url, error);
        }
      }
      // Fetch and log JSON response for each URL
      // urls.forEach(async (currUrl, index) => {
      //   let delay = index * 300;
      //   setTimeout(async () => {
      //     try {
      //       const imdbId = currUrl.match(/title\/(tt\d+)/)[1];
      //       const apiRequestUrl = `${apiUrl}/api/movie-details?imdbId=${imdbId}`;
      //       try {
      //         const response = await fetch(apiRequestUrl, {
      //           method: "GET",
      //           headers: {
      //             Authorization: `Bearer ${sessionToken}`,
      //           },
      //         });

      //         if (!response.ok) {
      //           throw new Error(`HTTP error! status: ${response.status}`);
      //         }

      //         const jsonResponse = await response.json();
      //         if (jsonResponse) {

      //           const title = jsonResponse.data.title;
      //           const icon =
      //             "https://m.media-amazon.com/images/G/01/imdb/images-ANDW73HA/android-mobile-196x196._CB479962153_.png";
      //           const link = jsonResponse.data.url;
      //           const imageUrl = jsonResponse.data.entityObj.poster;
      //           const description = jsonResponse.data.description;
      //           const ageRating = jsonResponse.data.entityObj.age_rating;
      //           const rating = jsonResponse.data.entityObj.score / 10;
      //           const entityObj = jsonResponse.data.entityObj;
      //           const images2 = Array.from(document?.images)?.map((img) => { return img.src }) || [];
      //           const payload = {
      //             data: {
      //               title: title,
      //               description: description,
      //               expander: [],
      //               media_type: "Movie",
      //               author: userId,
      //               url: link,
      //               media: {
      //                 covers: [imageUrl],
      //               },
      //               metaData: {
      //                 type: "Movie",
      //                 title: title,
      //                 ageRating: ageRating,
      //                 ratings: rating,
      //                 rating: rating,
      //                 docImages: [ imageUrl, ...images2 ],
      //                 icon: {
      //                   type: "image",
      //                   icon: icon,
      //                 },
      //                 defaultIcon: icon,
      //                 url: link,
      //                 covers: [imageUrl],
      //                 defaultThumbnail: imageUrl,
      //               },
      //               entityObj: {
      //                 description: description,
      //                 image: imageUrl,
      //                 title: title,
      //                 url: link,
      //                 ratings: rating,
      //                 entityObj: entityObj,
      //               },
      //               collection_gems: collId,
      //               remarks: "",
      //               tags: [],
      //               is_favourite: false,
      //               showThumbnail: true,
      //             },
      //           };
      //
      //
      //           // delay += 300;
      //           promises.push(sendData(payload));
      //         }
      //       } catch (error) {
      //         console.error("Error fetching data for URL:", currUrl, error);
      //       }
      //     } catch (error) {
      //       console.error("Error fetching data for URL:", currUrl, error);
      //     }
      //   }, delay);

      //   // delay += 300;
      //
      // });
      try {
        // Wait for all requests to complete
        const results = await Promise.all(promises);
      } catch (error) {
        console.error("One or more requests failed", error);
      }

      hideLoader();
    } else {
      console.log("jsonData does not have the expected structure");
    }
  } else {
    console.log("Script element not found");
  }
}

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

function addImportBtn() {
  const listWrapper = document.querySelector("ul.ipc-metadata-list");
  if (listWrapper) {
    const parentElement = listWrapper;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "Amazon-button";
    img.title = "Import Watchlist!";

    img.addEventListener("click", async () => {
      showLoader(); // Show loader when image is clicked
      authenticateUser = await checkIsUserLoggedIn();
      if (authenticateUser?.token) {
        // fetchAndLogListItems();
        fetchAllMovies();
      }
    });

    div.appendChild(img);
    // Check if the current URL starts with the specified string
    if (!window.location.href.startsWith("https://www.imdb.com/user")) {
      let targetContainer = document.querySelector(
        'div[data-testid="list-page-mc-total-items"]'
      )?.parentNode;
      if (targetContainer) {
        // targetContainer.style.display = "flex";
        // targetContainer.style.alignItems = "center";
        targetContainer.appendChild(div);
      } else {
        console.warn("Target container not found inside the bar!");
      }
    } else {
      console.log("This script does not run on user pages.");
    }
  } else {
    console.log("Listwrapper not found");
  }
}

function addWatchlistImportBtn() {
  const scrapeUrl = document.querySelector("div.export a");
  const scrapeLinkhref = scrapeUrl.getAttribute("href");
  const scrapeLink =
    "https://www.imdb.com" +
    scrapeLinkhref.slice(0, scrapeLinkhref.indexOf("/export"));

  if (scrapeLink) {
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "Amazon-button";
    img.title = "Import Watchlist!";

    img.addEventListener("click", async () => {
      showLoader(); // Show loader when image is clicked
      authenticateUser = await checkIsUserLoggedIn();
      if (authenticateUser?.token) {
        // fetchAndLogListItems();
        fetchAllMoviesWatchlist(scrapeLink);
      }
    });

    div.appendChild(img);
    let targetContainer = document.querySelector(
      "button.lister-controls-expand"
    ).parentNode;
    if (targetContainer) {
      targetContainer.style.display = "flex";
      targetContainer.style.alignItems = "center";
      targetContainer.appendChild(div);
    } else {
      console.warn("Target container not found inside the bar!");
    }
  } else {
    console.log("scrapeLink not found");
  }
}

// Run the addButton function once the page is loaded
window.addEventListener("load", function () {
  addImportBtn();
  addWatchlistImportBtn();
});
