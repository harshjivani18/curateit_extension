/*global chrome*/
import "./ImportContainer.css";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Input, Modal, Spin } from "antd";
import { WithContext as ReactTags } from "react-tag-input";
import { useNavigate } from "react-router-dom";
import session from "../../utils/session";
import { addTag } from "../../actions/tags";
import { updateUserTags } from "../../actions/user";
import { fetchCurrentTab } from "../../utils/fetch-current-tab";
import { saveSelectedCollection } from "../../actions/collection";
import {
  getImportType,
  sendSocialImportToChrome,
} from "../../utils/send-theme-to-chrome";
import Header from "../../components/header/Header";
import ComboBox from "../../components/combobox/ComboBox";
import { KEY_CODES } from "../../utils/constants";
import { ExclamationCircleFilled } from "@ant-design/icons";
import ButtonToggleSetting from "../../components/displaySetting/ButtonToggleSetting";
const ImportContainer = (props) => {
  let timer = null;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { confirm } = Modal;
  const collections = useSelector((state) => state.collection.collectionData);
  const savedSelectedCollection = useSelector(
    (state) => state.collection.savedSelectedCollection
  );
  // const tabObj = useSelector((state) => state.app.tab)
  const userTags = useSelector((state) => state.user.userTags);
  const collectionObj = null;
  const [selectedTags, setSelectedTags] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState(false);
  const [showProfileSwitch, setShowProfileSwitch] = useState(true);
  const [isImportProfile, setIsImportProfile] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(
    collectionObj
      ? { id: collectionObj.id, name: collectionObj.name }
      : savedSelectedCollection?.id === 0
      ? { id: Number(session.unfiltered_collection_id), name: "Unfiltered" }
      : savedSelectedCollection
  );
  const [showCollectionInput, setShowCollectionInput] = useState(false);
  const SIDEBAR_OPTIONS = [
    {
      id: 1,
      value: false,
      text: "False",
    },
    {
      id: 2,
      value: true,
      text: "True",
    },
  ];

  useEffect(() => {
    fetchCurrentTab().then((tab) => {
      getImportType(tab).then((res) => {
        if (res.type === "PROFILE") {
          setIsImportProfile(true);
          setShowProfileSwitch(false);
        } else {
          setIsImportProfile(false);
          setShowProfileSwitch(true);
        }
      });
    });
  }, []);

  const prepareTags = () => {
    const tagArr = [];
    userTags.forEach((t) => {
      if (t.tag) {
        tagArr.push({
          id: t.tag,
          text: t.tag,
        });
      }
    });
    return tagArr;
  };
  const onTagAdd = async (tag) => {
    const existingIdx = userTags?.findIndex((t) => {
      return t.tag === tag.text;
    });
    if (existingIdx !== -1) {
      setSelectedTags([
        ...selectedTags,
        { id: userTags[existingIdx].id, tag: userTags[existingIdx].tag },
      ]);
    } else {
      const res = await dispatch(
        addTag({ data: { tag: tag.text, users: session.userId } })
      );
      if (res.error === undefined && res.payload.error === undefined) {
        setSelectedTags([
          ...selectedTags,
          { id: res.payload?.data?.data?.id, tag: tag.text },
        ]);
        dispatch(updateUserTags(res.payload?.data?.data));
      }
      return res;
    }
  };
  const onTagDelete = (i) => {
    selectedTags.splice(i, 1);
    setSelectedTags([...selectedTags]);
  };

  const handleImportButton = async () => {
    const tabDetails = await fetchCurrentTab();
    onSubmitClick();
  };

  function convertString(str) {
    return str.toLowerCase().split(" ").join("-");
  }

  function showLoader() {
    
    let overlay = document.createElement("div");
    overlay.id = "overlay";
    overlay.style.fontSize = "50px";
    overlay.style.display = "block";
    overlay.style.fontWeight = "800";
    overlay.style.position = "fixed";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.inset = "0px";
    overlay.style.background =
      "linear-gradient(90deg, rgba(16, 95, 211, 0.8), rgba(16, 95, 211, 0.8))";
    overlay.style.zIndex = "999999";
    overlay.style.fontFamily = "Roboto, Helvetica, Arial, sans-serif";

    let loader = document.createElement("div");
    loader.id = "loader";
    loader.style.position = "absolute";
    loader.style.top = "50%";
    loader.style.left = "50%";
    loader.style.fontSize = "50px";
    loader.style.color = "white";
    loader.style.transform = "translate(-50%, -50%)";
    loader.style.msTransform = "translate(-50%, -50%)";
    loader.style.textAlign = "center";

    let loaderContent = document.createElement("span");
    loaderContent.id = "status-bar";
    loaderContent.innerHTML = "Importing in Bulk 🚀";
    loader.appendChild(loaderContent);
    overlay.appendChild(loader);
    document.body.appendChild(overlay);
    setTimeout(hideLoader, 300000);
  }

  function hideLoader() {
    
    let overlay = document.getElementById("overlay");
    if (overlay) {
      overlay.remove();
    }
  }

  // YtProfileImport functions
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

  const handleYoutube = async (url) => {
    const importData = await chrome?.storage?.sync.get(["importData"]);
    
    let ogData = await fetchOpenGraphData(url);
    let importObj = {
      data: [
        {
          title: ogData["og:title"],
          description: ogData["og:description"],
          media_type: "Profile",
          platform: "YouTube",
          post_type: "Post",
          url: ogData["og:url"],
          media: {
            covers: [ogData["og:image"]],
          },
          metaData: {
            covers: [ogData["og:image"]],
            docImages: [ogData["og:image"]],
            defaultThumbnail: ogData["og:image"],
            defaultIcon: ogData["og:image"],
            icon: { type: "image", icon: ogData["og:image"] }
          },
          collection_gems: importData?.importData?.data?.collection_gems,
          remarks: importData?.importData?.data?.remarks,
          tags: importData?.importData?.data?.tags,
          is_favourite: true,
          socialfeed_obj: {
            id: convertString(ogData["og:title"]),
            title: ogData["og:title"],
            description: ogData["og:description"],
            videoTag: ogData["og:video:tag"],
            profile_url: ogData["og:url"],
            profile_image_url: ogData["og:image"],
            totalVideos:
              document
                .querySelector("yt-formatted-string#videos-count")
                ?.textContent.split(" ")[0] || "",
            subscribers:
              document
                .querySelector("yt-formatted-string#subscriber-count")
                ?.textContent.split(" ")[0] || "",
          },
        },
      ],
    };
    saveToCurateit(importObj);
    
  };
  //

  // goodReads functions
  const books = [];

  async function generateBooksJson(domElement) {
    const importData = await chrome?.storage?.sync.get(["importData"]);
    
    const rows = domElement.querySelectorAll("#booksBody .bookalike.review");
    for (let row of rows) {
      const coverElement = row.querySelector("td.field.cover .value a img");
      const titleElement = row.querySelector("td.field.title .value a");
      const authorElement = row.querySelector("td.field.author .value a");
      const avgRatingElement = row.querySelector("td.field.avg_rating .value");
      const dateReadElement = row.querySelector("td.field.date_read .value");
      const dateAddedElement = row.querySelector("td.field.date_added .value");
      const reviewsElement = row.querySelector("td.field.actions .value a");

      if (
        titleElement &&
        coverElement &&
        authorElement &&
        avgRatingElement &&
        dateReadElement &&
        dateAddedElement &&
        reviewsElement
      ) {
        const title = titleElement.textContent.trim();
        const url =
          "https://www.goodreads.com" + titleElement.getAttribute("href");
        const cover = coverElement.getAttribute("src");
        const author = authorElement.textContent.trim();
        const rating = avgRatingElement.textContent.trim();
        const dateRead = dateReadElement.textContent.trim();
        const dateAdded = dateAddedElement.textContent.trim();
        const reviews =
          "https://www.goodreads.com" + reviewsElement.getAttribute("href");
        const description = `The book '${title}' created by ${author} has received an impressive rating of ${rating}. It was added to the reading list on ${dateAdded} and was completed in ${dateRead}.`;
        const media_type = "Book";
        const platform = "LinkedIn";
        const post_type = "Post";
        const media = {
          covers: [cover],
        };
        const metaData = {
          covers: [cover],
        };
        const collection_gems = importData?.importData?.data?.collection_gems;
        const remarks = importData?.importData?.data?.remarks;
        const tags = importData?.importData?.data?.tags;
        const is_favourite = true;
        const socialfeed_obj = {
          id: convertString(title),
          title: title,
          description: description,
          url: url,
          cover_image_url: cover,
        };
        const book = {
          title,
          description,
          media_type,
          platform,
          post_type,
          url,
          media,
          metaData,
          collection_gems,
          remarks,
          tags,
          is_favourite,
          socialfeed_obj,
          author,
          rating,
          dateAdded,
          dateRead,
          reviews,
        };
        books.push(book);
        
      }
    }
  }

  function timeout(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("Request timed out"));
      }, ms);
    });
  }

  async function fetchAndProcessDOM(url) {
    return new Promise((resolve, reject) => {
      Promise.race([fetch(url), timeout(300002)]) // 300000ms = 5 minutes
        .then((response) => response.text())
        .then((data) => {
          let parser = new DOMParser();
          let dom = parser.parseFromString(data, "text/html");
          generateBooksJson(dom);
          resolve();
        })
        .catch((error) => {
          console.error("Error fetching or parsing data:", error);
          reject(error);
        });
    });
  }

  async function fetchAllPages(url, firstPage, maxPage) {
    const newUrl = url.replace(/\?page=.*$/, "");
    
    
    for (let i = firstPage; i <= maxPage; i++) {
      
      await fetchAndProcessDOM(`${newUrl}?page=${i}`);
    }
  }

  const handleGoodreads = async (url) => {
    const importData = await chrome?.storage?.sync.get(["importData"]);
    const goodreadsData = await chrome?.storage?.sync.get(["goodreadsData"]);
    
    
    
    showLoader();
    await fetchAllPages(
      url,
      goodreadsData?.goodreadsData?.data?.firstPage,
      goodreadsData?.goodreadsData?.data?.maxPage
    );
    let userObj = {
      data: books,
    };
    
    saveToCurateit(userObj);
  };
  //----------------------------------------------------------------------------

  // instagram functions
  const handleInstagram = async (url) => {
    const importData = await chrome?.storage?.sync.get(["importData"]);
    
    let ogData = await fetchOpenGraphData(url);
    let importObj = {
      data: [
        {
          title: ogData["og:title"],
          description: ogData["og:description"],
          media_type: "Profile",
          platform: "Instagram",
          post_type: "Post",
          url: ogData["og:url"],
          media: {
            covers: [ogData["og:image"]],
          },
          metaData: {
            covers: [ogData["og:image"]],
            docImages: [ogData["og:image"]],
            defaultThumbnail: ogData["og:image"],
            defaultIcon: ogData["og:image"],
            icon: { type: "image", url: ogData["og:image"] }
          },
          collection_gems: importData?.importData?.data?.collection_gems,
          remarks: importData?.importData?.data?.remarks,
          tags: importData?.importData?.data?.tags,
          is_favourite: true,
          socialfeed_obj: {
            id: convertString(ogData["og:title"]),
            title: ogData["og:title"],
            description: ogData["og:description"],
            videoTag: ogData["og:video:tag"],
            profile_url: ogData["og:url"],
            profile_image_url: ogData["og:image"],
          },
        },
      ],
    };
    saveToCurateit(importObj);
    
  };
  //----------------------------------------------------------------------------

  // medium functions
  const handleMedium = async (url) => {
    
    const importData = await chrome?.storage?.sync.get(["importData"]);
    
    let ogData = await fetchOpenGraphData(url);
    let importObj = {
      data: [
        {
          title: ogData["og:title"],
          description: ogData["og:description"],
          media_type: "Profile",
          platform: "Medium",
          post_type: "Post",
          url: ogData["og:url"],
          media: {
            covers: [ogData["og:image"]],
          },
          metaData: {
            covers: [ogData["og:image"]],
            docImages: [ogData["og:image"]],
            defaultThumbnail: ogData["og:image"],
            defaultIcon: ogData["og:image"],
            icon: { type: "image", url: ogData["og:image"] }
          },
          collection_gems: importData?.importData?.data?.collection_gems,
          remarks: importData?.importData?.data?.remarks,
          tags: importData?.importData?.data?.tags,
          is_favourite: true,
          socialfeed_obj: {
            id: convertString(ogData["og:title"]),
            title: ogData["og:title"],
            description: ogData["og:description"],
            profile_url: ogData["og:url"],
            profile_image_url: ogData["og:image"],
          },
        },
      ],
    };
    saveToCurateit(importObj);
    
  };
  //----------------------------------------------------------------------------

  const saveToCurateit = async (importObj) => {
    try {
      showLoader();
      const data = await chrome?.storage?.sync.get(["userData"]);
      const token = data?.userData?.token || data?.userData?.userData?.token;
      const apiUrl = data?.userData?.apiUrl || data?.userData?.userData?.apiUrl;

      let requestObj = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(importObj),
      };

      try {
        const response = await fetch(
          `${apiUrl}/api/store-gems?isProfile=true`,
          requestObj
        );
        
        if (response) {
          hideLoader();
          alert("Imported successfully");
          window.chrome.storage.sync.remove("importData");
        }
      } catch (error) {
        console.log("API error : ", error);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      hideLoader();
    }
  };

  const onSubmitClick = async () => {
    const tabDetails = await fetchCurrentTab();
    const selectedTagArr = selectedTags.map((i) => i.id);
    const data = {
      collection_gems: selectedCollection?.id,
      tags: selectedTagArr,
      remarks: remarks,
      isImportProfile,
    };

    chrome.storage.sync.set({
      importData: {
        data: data,
      },
    });

    if (tabDetails.url.includes("https://www.youtube.com/")) {
      handleYoutube(tabDetails.url);
    }

    if (tabDetails.url.includes("https://www.goodreads.com/")) {
      handleGoodreads(tabDetails.url);
    }

    if (tabDetails.url.includes("https://www.instagram.com/")) {
      handleInstagram(tabDetails.url);
    }

    const mediumRegex =
      /^(https:\/\/)([\w-]+\.medium\.com|medium\.com\/@[\w-]+)\/?/;
    if (mediumRegex.test(tabDetails.url)) {
      handleMedium(tabDetails.url);
    }
    closeExtension();
    // sendSocialImportToChrome(data, await fetchCurrentTab());
  };

  const closeExtension = async () => {
    const tab = await fetchCurrentTab();
    window.chrome.tabs.sendMessage(tab.id, { type: "CT_CLOSE_PANEL" });
    window.chrome.storage.sync.remove("highlightedData");
  };

  const onBackBtnClick = () => {
    dispatch(
      saveSelectedCollection({
        id: Number(session.unfiltered_collection_id),
        name: "Unfiltered",
      })
    );
    navigate("/search-bookmark");
  };
  const onCollectionChange = (obj) => {
    setSelectedCollection(obj);
  };
  const renderLoader = () => {
    return (
      <div className="layout-loader-container">
        <Spin tip="Loading Site Information ..." />
      </div>
    );
  };
  const renderLayout = () => {
    return (
      <div
        className="flex flex-col bg-slate-50 h-[100vh]"
        onClick={() => setShowCollectionInput(false)}
      >
        <Header
          label="Add Details"
          isHideBackButton={false}
          onBackBtnClick={onBackBtnClick}
        />
        <div className="bg-[#F8FBFF] p-4 rounded-t-[16px] flex-1">
          <div>
            <div className="pt-6 flex justify-between space-x-2">
              <div className="flex-1">
                <h6 className="block text-xs font-medium text-gray-500 mb-1">
                  Collections
                </h6>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <div
                    onClick={() => setShowCollectionInput(true)}
                    className="w-full"
                  >
                    <ComboBox
                      inputShown={showCollectionInput}
                      setShowCollectionInput={setShowCollectionInput}
                      collectionData={collections || []}
                      userId={session.userId}
                      setSelectedCollection={onCollectionChange}
                      selectedCollection={selectedCollection}
                      error={error}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <h6 className="block text-xs font-medium text-gray-500 mb-1">
                Tags
              </h6>
              <div className="bg-white border-2 border-gary-400 p-2 rounded-lg">
                <ReactTags
                  tags={selectedTags?.map((t) => {
                    return { id: t.tag, text: t.tag };
                  })}
                  suggestions={prepareTags()}
                  delimiters={[KEY_CODES.enter, KEY_CODES.comma]}
                  handleDelete={onTagDelete}
                  handleAddition={onTagAdd}
                  inputFieldPosition="bottom"
                  placeholder="Enter Tag"
                  onClearAll={() => setSelectedTags([])}
                  clearAll
                  autocomplete
                />
              </div>
            </div>
            <div className="pt-4">
              <h6 className="block text-xs font-medium text-gray-500 mb-1">
                Comment
              </h6>
              <Input
                size="medium w-full mb-2 h-20"
                type="text"
                name="descriptions"
                placeholder="Add your comments"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
            {showProfileSwitch && (
              <ButtonToggleSetting
                title="Do you want to import profiles?"
                options={SIDEBAR_OPTIONS}
                mode={isImportProfile}
                handleModeChange={(checked) => setIsImportProfile(checked)}
              />
            )}
          </div>
        </div>
        <div className="mb-4 mt-4 px-[16px] flex justify-end items-center sticky bottom-5 right-0 z-5">
          <button
            className="bg-blue-500 small text-xs text-white px-4 py-2"
            onClick={handleImportButton}
          >
            {processing ? "Loading" : `Import`}
          </button>
        </div>
      </div>
    );
  };
  return loader ? renderLoader() : renderLayout();
};
export default ImportContainer;
