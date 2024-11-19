import "./Home.css"
import React, { useEffect, useState }                   from 'react'
import { useNavigate }                       from 'react-router-dom'
import { useDispatch, useSelector }          from 'react-redux'
import { FileUploader }                      from 'react-drag-drop-files'
import { FiUpload }                          from "react-icons/fi"
import TextareaAutosize from "react-textarea-autosize";
import { WithContext as ReactTags } from "react-tag-input";
import { Modal, message, Button as AntdButton, Tabs, Spin }                    from 'antd'
// import { BsTwitter }                         from "react-icons/bs"

// import Loadingscreen                         from '../../components/Loadingscreen/Loadingscreen'
import Button                                from '../../components/Button/Button'
import LayoutCommon                          from "../../components/commonLayout/LayoutCommon"
import Header                                from "../../components/header/Header"
import { processBookmarkJson }               from '../../utils/process-bookmark-json'
import { IMPORT_FILE_TYPE, KEY_CODES }                  from '../../utils/constants'
import session                               from '../../utils/session'
// import { Validator }                         from "../../utils/validations"

import { getCollectionById,
         updateCollectionDataForImport,
         addImportCollection, 
         createCollectionActivity,
         setLoadedKeys,
         setExpandedKeys,
         getAllCollections,
         uploadCsvTextLinks}               from '../../actions/collection'
import { importGemsWithIcon }                from "../../actions/gem"
import { setCurrentImportStatus, setCurrentUploadItems, setIsSyncing, setPercentageData, setSyncingCollection }              from '../../actions/app'
import { fetchPocketToken }                  from "../../actions/pocket"  
import { updateUser }                        from "../../actions/user"
import store from "../../store"
import { updateScore } from "../../actions/gamification-score"
import { syncBookmarks } from "../../utils/sync-bookmarks"
import ImportProgressBar from "../../components/common/ImportProgressBar"
import { groupByParentAndCollection } from "../../utils/find-collection-id"
import { updateTags } from "../../utils/update-tags"
import ComboBox from "../../components/combobox/ComboBox"
import TypeComboBox from "../../components/combobox/TypeComboBox"
import { DocumentPlusIcon, LinkIcon } from "@heroicons/react/24/outline"


// const extractTwitterUsername = (link) => {
//     if (!link) return "";
//     const username = link.split('/').slice(-1);
//     return username;
// }

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const module = ["gem", "collection"]

const createTwitterUrl = (username) => {
    return `https://twitter.com/${username}`
}


const Home = (props) => {
    let importedItems = 0;
    let totalImportItems = 0
    let processedCount = 0;
    let folderT       = null
    let bookmarkT     = null
    const dispatch                      = useDispatch()
    const navigate                      = useNavigate()
    const user                          = useSelector((state) => state?.user?.userData)
    const isSyncing                     = useSelector((state) => state.app.isSyncing)
    // const totals                        = useSelector((state) => state.app.totals)
     const collections = useSelector(
       (state) => state.collection.collectionData
     );
     const sharedCollections = useSelector(
       (state) => state.collection.sharedCollections
     );
     const userTags = useSelector((state) => state.user.userTags);

    const [loading, setLoading]         = useState(false)
    const [showSpin,setShowSpin]        = useState(false)
    const [file, setFile]               = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError]             = useState({});
    const [importType, setImportType]   = useState(null);
    // const [loading, setLoading]         = useState(false)
    const [twitterUsername, setTwitterUsername] = useState("");
    const [tabKey, setTabKey] = useState("All");
    const [amznWishlist,setAmznWishlist]=useState("https://www.amazon.com/wishlist")
    const [optionSelected, setOptionSelected] = useState("file");

    const [allCollections, setAllCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState({
      id: Number(session.unfiltered_collection_id),
      name: "Unfiltered",
    });
    const [showCollectionInput, setShowCollectionInput] = useState(false);
    const [showTypeInput, setShowTypeInput] = useState(false);
    const [selectedType, setSelectedType] = useState("Link");
    const [selectedTags, setSelectedTags] = useState([]);
    const [remarks, setRemarks] = useState("");
    const [linkPasted, setLinkPasted] = useState("");
    const [buttonLoading, setButtonLoading] = useState(false);

    useEffect(() => {
      const filtered = sharedCollections?.filter(
        (item) => item?.accessType !== "viewer"
      );
      setAllCollections([...collections, ...filtered]);
    }, [collections]);

    const handleTabChange = (key) => {
        setTabKey(key);
    };

    const onCollectionChange = (obj) => {
      setSelectedCollection(obj);
    };

    const onLayoutClick = () => {
      setShowCollectionInput(false);
      setShowTypeInput(false);
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
        setSelectedTags([...selectedTags, { id: tag?.text, tag: tag?.text }]);
      }
    };

    const onTagDelete = (i) => {
      selectedTags.splice(i, 1);
      setSelectedTags([...selectedTags]);
    };

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

    // const getTotalItems = (collectionArray) => {
    //     let total = 0;
    //     collectionArray.forEach(collection => {
    //         total += 1; // for the collection itself
    //         total += collection.bookmarks.length; // for all bookmarks
    //         total += getTotalItems(collection.folders); // for nested folders
    //     });
    //     return total;
    // };

    const getTotalFoldersAndBookmarks = (collections) => {
        let folderTotal = collections.length;
        let bookmarkTotal = 0;
        collections.forEach(collection => {
            bookmarkTotal += collection.bookmarks.length;
            const countFolders = (folders) => {
                folders.forEach(folder => {
                    folderTotal++;
                    bookmarkTotal += folder.bookmarks.length;
                    if (folder.folders.length > 0) {
                        countFolders(folder.folders);
                    }
                });
            };
            countFolders(collection.folders);
        });
        folderT = folderTotal;
        bookmarkT = bookmarkTotal;
        dispatch(setCurrentUploadItems({ totalFolders: folderTotal, totalBookmarks: bookmarkTotal }))
        return { folderTotal, bookmarkTotal };
    }

    const calculateTotalItems = (collections) => {
        let total = collections.length;
        collections.forEach(collection => {
            total += collection.bookmarks.length;
            const countFolders = (folders) => {
                folders.forEach(folder => {
                    total++;
                    total += folder.bookmarks.length;
                    if (folder.folders.length > 0) {
                        countFolders(folder.folders);
                    }
                });
            };
            countFolders(collection.folders);
        });
        return total;
    };

    const calculateProcessedItems = (collection) => {
        let count = 1; 
        count += collection.bookmarks.length;
        collection.folders.forEach(folder => {
            count += calculateProcessedItems(folder); 
        });
        return count;
    };

    const updateProgress = (processed, total) => {
        const percentage = Math.round((processed / total) * 100);
        dispatch(setPercentageData(percentage));
    };

    const sendChunkRecordsForImport = async (collection, parentId, parentCollectionName, index) => {
        let finalCollection   = {}
        let recentErrStatus   = null
        const cRes            = await dispatch(addImportCollection({
            data: {
                name: collection.title,
                is_sub_collection: parentId ? true : false,
                collection: parentId ? parentId : null,
                parent_collection_name: parentCollectionName ? parentCollectionName : null,
                isBulk: true,
                isBasicImport: true,
                author: parseInt(session.userId)
            }
        }))
        if(index === '0' && cRes){
            navigate("/search-bookmark");
        }

        if (cRes.error === undefined) {
            finalCollection = {
                ...cRes.payload.data.data,
                isPassed: true,
                bookmarks: [],
                folders: []
            }
            if (cRes.payload.data?.data?.id) {
                if (collection.bookmarks.length !== 0) {
                    const collectionGems = collection.bookmarks.map((b) => {
                        return {
                          title: b.title,
                          link: b.link || b?.url,
                          icon: b.icon,
                          tags: b?.Tags || [],
                          remarks: b?.remarks || "",
                          thumbnail: b?.thumbnail || "",
                          collection_gems: cRes.payload.data?.data?.id,
                        };
                    })
    
                    if (collectionGems.length <= 20) {
                        const res = await dispatch(importGemsWithIcon({ data: collectionGems }))
                        if (bookmarkT) {
                            bookmarkT = bookmarkT - collectionGems.length
                            importedItems += collectionGems.length
                            dispatch(setCurrentImportStatus({ processedItems: importedItems, totalItems: totalImportItems }))
                            dispatch(setCurrentUploadItems({ totalFolders: folderT, totalBookmarks: bookmarkT }))
                            updateProgress(importedItems, totalImportItems); 
                        }
                        if (res.error === undefined) {
                            finalCollection.bookmarks = res.payload.data?.data?.map((r) => { return { ...r, showThumbnail: true } }) || []
                        }
                        if (res.error?.response?.data?.error?.status === 429) {
                            return { status: 429 }
                        }
                    }
                    else if (collectionGems.length > 20) {
                        const chunkSize = 10
                        const chunks    = []
                        for (let i = 0; i < collectionGems.length; i += chunkSize) {
                            chunks.push(collectionGems.slice(i, i + chunkSize))
                        }
                        for (const index in chunks) {
                            const chunkRes = await dispatch(importGemsWithIcon({ data: chunks[index] }))
                            if (bookmarkT) {
                                bookmarkT = bookmarkT - chunks[index].length
                                dispatch(setCurrentUploadItems({ totalFolders: folderT, totalBookmarks: bookmarkT }))
                            }
                            importedItems += chunks[index].length
                            dispatch(setCurrentImportStatus({ processedItems: importedItems, totalItems: totalImportItems }))
                            updateProgress(importedItems, totalImportItems); 
                            if (chunkRes.error === undefined) {
                                const newChunk = chunkRes.payload.data?.data?.map((r) => { return { ...r, showThumbnail: true } })
                                finalCollection.bookmarks = [...finalCollection.bookmarks, ...newChunk]
                            }
                            if (chunkRes.error?.response?.data?.error?.status === 429) {
                                recentErrStatus = 429
                                break
                            }
                        }
                        if (recentErrStatus === 429) {
                            return { status: 429 }
                        }
                    }
                }

                if (collection.folders.length !== 0) {
                    for (const index in collection.folders) {
                        const folderRes = await sendChunkRecordsForImport(collection.folders[index], cRes.payload.data?.data?.id, cRes.payload.data?.data?.name, index)
                        if (folderRes.status === 429) {
                            recentErrStatus = 429
                            break
                        }
                        if (folderT) {
                            folderT = folderT - 1
                            dispatch(setCurrentUploadItems({ totalBookmarks: bookmarkT, totalFolders: folderT }))
                        }
                        importedItems += 1
                        dispatch(setCurrentImportStatus({ processedItems: importedItems, totalItems: totalImportItems }))
                        updateProgress(importedItems, totalImportItems); 
                        if (folderRes.error === undefined) {
                            finalCollection.folders = [...finalCollection.folders, folderRes]
                        }
                    }
                    if (recentErrStatus === 429) {
                        return { status: 429 }
                    }
                }
            }
        }
        else if (cRes.error?.response?.data?.error?.status === 429) {
            recentErrStatus = 429
        }

        return recentErrStatus !== null ? { status: recentErrStatus } : finalCollection
    }


    const onFileChange = async (files) => {
        if (files.type === "text/plain" || files.type === "text/csv") {
          setShowSpin(true);
          setLoading(true);

          dispatch(setSyncingCollection(true));
          dispatch(setPercentageData(0));
          const formData = new FormData();
          formData.append("file", files);

          const res = await dispatch(uploadCsvTextLinks(formData));

          const jsonObjs = groupByParentAndCollection(
            res?.payload?.data?.data || []
          );

          let totalCount = calculateTotalItems(jsonObjs);
          getTotalFoldersAndBookmarks(jsonObjs);
          totalImportItems = totalCount;
          dispatch(
            setCurrentImportStatus({
              processedItems: 0,
              totalItems: totalCount,
            })
          );
          dispatch(getCollectionById(Number(session.unfiltered_collection_id)));
          for (const index in jsonObjs) {
            const o = jsonObjs[index];
            const res = await sendChunkRecordsForImport(o, null, null, index);
            importedItems += 1;
            updateProgress(importedItems, totalCount);
            dispatch(
              setCurrentImportStatus({
                processedItems: importedItems,
                totalItems: totalCount,
              })
            );
            dispatch(updateCollectionDataForImport(res));
            dispatch(getAllCollections());
            if ((res.isPassed && !showSpin) || res.status === 429) {
              setShowSpin(false);
              setFile(null);
              setLoading(false);
              // navigate("/search-bookmark")
            }
            if (res.status === 429) {
              dispatch(setSyncingCollection(false));
              dispatch(setPercentageData(100));
              dispatch(setCurrentUploadItems(null));
              folderT = null;
              bookmarkT = null;
              dispatch(setCurrentUploadItems(null));
              break;
            } else if (folderT) {
              folderT = folderT - 1;
              dispatch(
                setCurrentUploadItems({
                  totalBookmarks: bookmarkT,
                  totalFolders: folderT,
                })
              );
            }
          }
          dispatch(setCurrentUploadItems(null));
          dispatch(setCurrentImportStatus(null));
          dispatch(
            createCollectionActivity({
              action: "Imported",
              module: "Collection",
              actionType: "Collection",
              count: jsonObjs?.length,
              author: {
                id: parseInt(session.userId),
                username: session.username,
              },
            })
          );
          module.forEach((m) => {
            store.dispatch(updateScore(m));
          });

          return;
        }

        setFile(file);
        setShowSpin(true)
        setLoading(true)
        dispatch(setSyncingCollection(true))
        dispatch(setPercentageData(0))
        const reader = new FileReader()
        reader.onload = async function (e) { 
            const parser    = new DOMParser()
            const htmlDoc   = parser.parseFromString(reader.result, "text/html")
            var htmlElement = htmlDoc.getElementsByTagName("title")[0];

          if(htmlElement.textContent === "Bookmarks"){
            const jsonObjs      = await processBookmarkJson(htmlDoc)
            let totalCount      = calculateTotalItems(jsonObjs); 
            getTotalFoldersAndBookmarks(jsonObjs);
            totalImportItems = totalCount
            dispatch(setCurrentImportStatus({ processedItems: 0, totalItems: totalCount }))
            dispatch(getCollectionById(session.unfiltered_collection_id)) 
            for (const index in jsonObjs) {
                const o = jsonObjs[index]
                const res = await sendChunkRecordsForImport(o, null, null, index)
                // processedCount += calculateProcessedItems(o); 
                importedItems += 1;
                updateProgress(importedItems, totalCount); 
                dispatch(setCurrentImportStatus({ processedItems: importedItems, totalItems: totalCount }))
                dispatch(updateCollectionDataForImport(res))
                dispatch(getAllCollections())
                dispatch(setLoadedKeys([]))
                dispatch(setExpandedKeys([]))
                if ((res.isPassed && !showSpin) || res.status === 429) {
                    setShowSpin(false)
                    setLoading(false)
                    setFile(null)
                    // navigate("/search-bookmark")
                }
                if (res.status === 429) {
                    dispatch(setSyncingCollection(false))
                    dispatch(setPercentageData(100))
                    dispatch(setCurrentUploadItems(null))
                    folderT = null
                    bookmarkT = null
                    dispatch(setCurrentUploadItems(null))
                    break
                }
                else if (folderT) {
                    folderT = folderT - 1
                    dispatch(setCurrentUploadItems({ totalBookmarks: bookmarkT, totalFolders: folderT }))
                }
            }
            dispatch(setCurrentUploadItems(null))
            dispatch(setCurrentImportStatus(null))
            dispatch(createCollectionActivity({
                action: "Imported",
                module: "Collection",
                actionType: "Collection",
                count: jsonObjs.length,
                author: { id: parseInt(session.userId), username: session.username },
            }))
            module.forEach((m) => {
                store.dispatch(updateScore(m))
            })
          }else{
            message.error("Please upload a valid bookmark file in html or csv format")
            setShowSpin(false)
            setLoading(false)
            return
          }
        }
        reader.readAsText(files)
    }

    const onSkipBtnClick = () => {
        dispatch(setLoadedKeys([]))
        dispatch(setExpandedKeys([]))
        localStorage.setItem("socialTrue",false)
        navigate("/search-bookmark")
    }

    const onImportFromPocket = async () => {
        const tokenRes       = await dispatch(fetchPocketToken())
        if (tokenRes?.payload?.status === 200 && tokenRes?.payload?.data?.code) {
            const accessToken   = tokenRes?.payload?.data?.code;
            const authToken     = session.token;
            const redirectToUrl = `https://getpocket.com/auth/authorize?request_token=${accessToken}&redirect_uri=${process.env.REACT_APP_WEBAPP_URL}/u/${session.username}/pocket/${accessToken}`;

            if (window.chrome.tabs) {
                const currentTabs = await window.chrome.tabs.query({ active: true, currentWindow: true })
                if (currentTabs.length !== 0) {
                    navigate("/search-bookmark")
                    window.chrome.tabs.sendMessage(currentTabs[0].id, { id: "CT_OPEN_WINDOW", tabURLs: [redirectToUrl], isCloseExt: true })
                }
            }
        }
    }

    const onImportFromRaindrop = async () => {
        const url = `https://raindrop.io/oauth/authorize?client_id=${process.env.REACT_APP_RAINDROP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_WEBAPP_URL}/u/${session.username}/raindrop&response_type=code`
        if (window.chrome.tabs) {
            const currentTabs = await window.chrome.tabs.query({ active: true, currentWindow: true })
            if (currentTabs.length !== 0) {
                navigate("/search-bookmark")
                window.chrome.tabs.sendMessage(currentTabs[0].id, { id: "CT_OPEN_WINDOW", tabURLs: [url], isCloseExt: true })
            }
        }
    }


    const onImportFromKindle = async () => {
      const url = `https://read.amazon.com/notebook`
      if (window.chrome.tabs) {
        const currentTabs = await window.chrome.tabs.query({
          active: true,
          currentWindow: true,
        })
        if (currentTabs.length !== 0) {
          navigate("/search-bookmark")
          window.chrome.tabs.sendMessage(currentTabs[0].id, {
            id: "CT_OPEN_WINDOW",
            tabURLs: [url],
            isCloseExt: true,
          })
        }
      }
    }


    const openTwitterLike = async (username) => {
        const url = `https://twitter.com/${username}/likes?ct-import=like`
        if (window.chrome.tabs) {
            const currentTabs = await window.chrome.tabs.query({
                active: true,
                currentWindow: true,
            })
            if (currentTabs.length !== 0) {
                navigate("/search-bookmark")
                window.chrome.tabs.sendMessage(currentTabs[0].id, {
                    id: "CT_OPEN_WINDOW",
                    tabURLs: [url],
                    isCloseExt: true,
                })
            }
        }
    }

    const onImportLikeFromTwitter = async () =>{
        const twitterUsername = user?.socialLinks?.twitter?.username
        if(twitterUsername){
            openTwitterLike(twitterUsername)
        }else{
            setIsModalOpen(true);
        }
    }

    const openPinterestProfile = async (username) => {
        const url = `https://pinterest.com/${username}`
        if (window.chrome.tabs) {
            const currentTabs = await window.chrome.tabs.query({
                active: true,
                currentWindow: true,
            })
            if (currentTabs.length !== 0) {
                navigate("/search-bookmark")
                window.chrome.tabs.sendMessage(currentTabs[0].id, {
                    id: "CT_OPEN_WINDOW",
                    tabURLs: [url],
                    isCloseExt: true,
                })
            }
        }
    }

    const onImportPinsFromPinterest= async () =>{
        const pinterestUsername = user?.socialLinks?.pinterest?.username
        if(pinterestUsername){
            openPinterestProfile(pinterestUsername)
        }else{
            setIsModalOpen(true);
            setImportType("pins")
        }
    }

    const onImportBookmarkFromTwitter = async () => {
        const url = `https://twitter.com/i/bookmarks?ct-import=bookmark`
      if (window.chrome.tabs) {
        const currentTabs = await window.chrome.tabs.query({
          active: true,
          currentWindow: true,
        })
        if (currentTabs.length !== 0) {
          navigate("/search-bookmark")
          window.chrome.tabs.sendMessage(currentTabs[0].id, {
            id: "CT_OPEN_WINDOW",
            tabURLs: [url],
            isCloseExt: true,
          })
        }
      }
    }

    const handleOk = async () =>{
        let url = ""
        let socialKey = ""
            if(!twitterUsername){
                setError({ tUsername: 'Please enter your twitter username' })
            }
            // else if (Validator.validate("namewithoutspace", twitterUsername, null, null, true)) {
            //     setError({
            //         tUsername: Validator.validate(
            //             "namewithoutspace",
            //             twitterUsername,
            //             null,
            //             null,
            //             true
            //         ),
            //     })
            // }
            else if (importType === "profile") {
                const tweetUrl = createTwitterUrl(twitterUsername)
                url = tweetUrl
                socialKey = "twitter"
                window.open(tweetUrl, "_blank")
                setIsModalOpen(false);
                setLoading(false)
            }
            else if (importType === "githubStars") {
                const githubUrl = `https://github.com/${twitterUsername}?tab=stars`
                url = githubUrl
                socialKey = "github"
                window.open(githubUrl, "_blank")
                setIsModalOpen(false);
                setLoading(false)
            }
            else if (importType === "readingList") {
                const mediumURL = `https://medium.com/@${twitterUsername}/list/reading-list`
                url = mediumURL
                socialKey = "medium"
                window.open(mediumURL, "_blank")
                setIsModalOpen(false);
                setLoading(false)
            }
            else if (importType === "redditSavedPost") {
                const redditURL = `https://www.reddit.com/user/${twitterUsername}/saved/`
                url = redditURL
                socialKey = "reddit"
                window.open(redditURL, "_blank")
                setIsModalOpen(false);
                setLoading(false)
            }
            else if (importType === "redditUpvotedPost") {
                const redditURL = `https://www.reddit.com/user/${twitterUsername}/upvoted/`
                url = redditURL
                socialKey = "reddit"
                window.open(redditURL, "_blank")
                setIsModalOpen(false);
                setLoading(false)
            }
            else if (importType === "pins") {
                const pinterestUrl = `https://in.pinterest.com/${twitterUsername}`
                url = pinterestUrl
                socialKey = "pinterest"
                window.open(pinterestUrl, "_blank")
                setIsModalOpen(false);
                setLoading(false)
            }
            else{
                setError({});
                setLoading(true)
                const tweetUrl = createTwitterUrl(twitterUsername)
                url = tweetUrl
                socialKey = "twitter"
                openTwitterLike(twitterUsername);
            }
            const socialObj = user?.socialLinks ? user?.socialLinks : {};
            const newObj = socialObj[socialKey] 
                ? { ...socialObj, [socialKey]: { ...socialObj[socialKey], username: twitterUsername, url } }
                : { ...socialObj, [socialKey]: { username: twitterUsername, url } }
            dispatch(updateUser({ socialLinks: newObj })).then((res) => {
                setIsModalOpen(false);
                setLoading(false)
            })
            setImportType(null)
            // setTwitterUsername(null)

    }

    const onAutoBookmarkClick = () => {
        dispatch(setIsSyncing(true))
        window.chrome.storage.local.get(["defaultBookmarks"], (result) => {
            if (result.defaultBookmarks) {
              syncBookmarks(result.defaultBookmarks, false, navigate, true);
            }
        })
    }

    const onTwitterProfileImport = () => {
        const username = user?.socialLinks?.twitter?.username
        if (username) {
            const tweetUrl = createTwitterUrl(username)
            window.open(tweetUrl, "_blank")
        }
        else {
            setIsModalOpen(true);
            setImportType("profile")
        }
    }

    const onImportGithubStars = () => {
        const username = user?.socialLinks?.github?.username
        if (username) {
            const githubUrl = `https://github.com/${username}?tab=stars`
            window.open(githubUrl, "_blank")
        }
        else {
            setIsModalOpen(true);
            setImportType("githubStars")
        }
    }

    const onImportReadingList = () => {
        const username = user?.socialLinks?.medium?.username
        if (username) {
            const mediumURL = `https://medium.com/@${username}/list/reading-list`
            window.open(mediumURL, "_blank")
        }
        else {
            setIsModalOpen(true);
            setImportType("readingList")
        }
    }

    const onImportLinkedInPost = () => {
        const linkedinURL = `https://linkedin.com/my-items/saved-posts`
        window.open(linkedinURL, "_blank")
        setIsModalOpen(false);
        setLoading(false)
    }

    const onImportImdb = () => {
        const imdbUrl = `https://www.imdb.com/list/watchlist`
        window.open(imdbUrl, "_blank")
        setIsModalOpen(false);
        setLoading(false)
    }

    const onImportGoodReads = () => {
        const linkedinURL = `https://www.goodreads.com/review/list/`
        window.open(linkedinURL, "_blank")
        setIsModalOpen(false);
        setLoading(false)
    }

    const [showDialog,setShowDialog]=useState(false)
    const [wishlistUrl,setWishlistUrl]=useState("")
    const [amznDomain,setAmznDomain]=useState("")
    const handleDomain = (e)=>{
        let val = e.target.value;
        val=val.trim()
        if(val==="in"){
            setAmznDomain("in")
            setWishlistUrl(`https://www.amazon.in/wishlist`)
        }
        if(val==="co.uk"){
            setAmznDomain("co.uk")
            setWishlistUrl(`https://www.amazon.co.uk/wishlist`)
        }
        if(val==="com"){
            setAmznDomain("com")
            setWishlistUrl(`https://www.amazon.com/wishlist`)
        }
    }

    const onImportAmazon = () => {
        setShowDialog(!showDialog)
    }

    const openWishlist = ()=>{
        const amazonUrl = amznWishlist
        window.open(amazonUrl, "_blank")
        setIsModalOpen(false);
        setLoading(false)
    }

    const onImportRedditSavedPost = (type) => {
        const username = user?.socialLinks?.reddit?.username
        if (username && type === "redditSavedPost") { 
            const redditURL = `https://www.reddit.com/user/${username}/saved/`
            window.open(redditURL, "_blank")
        }
        else if (username && type === "redditUpvotedPost") {
            const redditURL = `https://www.reddit.com/user/${username}/upvoted/`
            window.open(redditURL, "_blank")
        }
        else {
            setIsModalOpen(true);
            setImportType(type)
        }
    }

    const handleCancel = async () => {
        setIsModalOpen(false);
    }

    // const onSki = () => {
    //     if(session?.userId){
    //         navigate("/search-bookmark")
    //     }else{
    //         navigate('/login')
    //     }
    // }

    const renderAllTab = () => {
        return(
            <div className="">
                <div className="my-2">
                    <h4 className="font-medium mb-2 w-full text-[#7C829C] text-xs">Social</h4>
                    <div className="grid grid-cols-5 gap-4">
                            <div className="flex flex-col w-fit cursor-pointer items-center" onClick={onImportGithubStars}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px]object-contain" src="/icons/github.png" alt="pocket" />
                                </div>
                                <span className="text-[#7C829C] text-xs">Stars</span>
                            </div>
                            <div className="flex flex-col w-fit cursor-pointer items-center" onClick={onImportLinkedInPost}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px]object-contain" src="/images/linkedin-n.png
                                    " alt="pocket" />
                                </div>
                                <span className="text-[#7C829C] text-xs whitespace-nowrap">Saved Post</span>
                            </div>
                            <div className="flex flex-col w-fit cursor-pointer items-center" onClick={onImportBookmarkFromTwitter}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px]object-contain" src="/images/twitter-n.png" alt="pocket" />
                                </div>
                                <span className="text-[#7C829C] text-xs">Bookmarks</span>
                            </div>
                            <div className="flex flex-col w-fit cursor-pointer items-center" onClick={onImportLikeFromTwitter}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px]object-contain" src="/images/twitter-n.png" alt="pocket" />
                                </div>
                                <span className="text-[#7C829C] text-xs">Likes</span>
                            </div>
                            <div className="flex flex-col w-fit cursor-pointer items-center" onClick={() => onImportRedditSavedPost("redditUpvotedPost")}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px]object-contain" src="/images/reddit-n.png" alt="pocket" />
                                </div>
                                <span className="text-[#7C829C] text-xs whitespace-nowrap">Reddit Saved</span>
                            </div>
                            <div className="flex flex-col w-fit cursor-pointer items-center" onClick={onImportPinsFromPinterest}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px]object-contain" src="/images/pinterest-n.png" alt="pocket" />
                                </div>
                                <span className="text-[#7C829C] text-xs whitespace-nowrap">Pins</span>
                            </div>
                    </div>
                </div>

                <div className="my-2">
                    <h4 className="font-medium mb-2 w-full text-[#7C829C] text-xs">Highlights</h4>
                    <div className="grid grid-cols-5 gap-4">
                        <div className="flex flex-col w-fit items-center cursor-pointer" onClick={onImportFromRaindrop}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px]" src="/images/raindrop-n.png" alt="ranindrop" />
                                </div>
                                <span className="text-[#7C829C] text-xs">Raindrop</span>
                        </div>
                        <div className="flex flex-col w-fit items-center cursor-pointer" onClick={onImportFromKindle}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px] object-contain" src="/images/kindle-n.png" alt="pocket" />
                                </div>
                                <span className="text-[#7C829C] text-xs whitespace-nowrap">Kindle</span>
                        </div>
                    </div>
                </div>

                <div className="my-2">
                    <h4 className="font-medium mb-2 w-full text-[#7C829C] text-xs">Articles</h4>
                    <div className="grid grid-cols-5 gap-4">
                        <div className="flex flex-col w-fit items-center cursor-pointer" onClick={onImportFromPocket}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px]" src="/images/pocket-n.png" alt="pocket" />
                                </div>
                                <span className="text-[#7C829C] text-xs">Pocket</span>
                        </div>
                        <div className="flex flex-col w-fit items-center cursor-pointer" onClick={onImportReadingList}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px] object-contain" src="/images/medium-n.png" alt="pocket" />
                                </div>
                                <span className="text-[#7C829C] text-xs whitespace-nowrap">Medium</span>
                        </div>
                    </div>
                </div>

                <div className="my-2">
                    <h4 className="font-medium mb-2 w-full text-[#7C829C] text-xs">Other</h4>
                    <div className="grid grid-cols-5 gap-4">
                        <div className="flex flex-col w-fit items-center cursor-pointer" onClick={onImportGoodReads}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px]" src="/images/goodreads-n.png" alt="goodreads" />
                                </div>
                                <span className="text-[#7C829C] text-xs">Goodreads</span>
                        </div>
                        {/* <div className="flex flex-col w-fit items-center cursor-pointer" onClick={onImportImdb}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px]" src="https://m.media-amazon.com/images/G/01/imdb/images/social/imdb_logo.png" alt="goodreads" />
                                </div>
                                <span className="text-[#7C829C] text-xs">Imdb</span>
                        </div> */}
                        <div className="flex flex-col w-fit items-center cursor-pointer" onClick={onImportAmazon}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px]" src="https://alliedfoundation.org/wp-content/uploads/2019/10/Amazon-wishlist-icon-2.png" alt="goodreads" />
                                </div>
                                <span className="text-[#7C829C] text-xs">Amazon</span>
                        </div>
                            <div id="authentication-modal" tabindex="-1" aria-hidden="true" class={`${showDialog ? "block" : "hidden"} overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`} style={{background:"rgb(255,255,255,0.5)"}}>
                                <div class="relative p-4 w-[85%] max-w-md max-h-full" style={{top:"50%",transform:"translateY(-50%)"}}>
                                    <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                                        <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                                            <button onClick={()=>setShowDialog(false)} type="button" class="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="authentication-modal">
                                                <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                                </svg>
                                                <span class="sr-only">Close modal</span>
                                            </button>
                                        </div>
                                        <div class="p-4 md:p-5">
                                            <form class="space-y-4" action="#">
                                                <div>
                                                        {/* <label for="countries" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Choose Domain</label>
                                                        <select id="countries" value={amznDomain} onChange={handleDomain} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                                            <option value="com">Global</option>
                                                            <option value="co.uk">UK</option>
                                                            <option value="in">IN</option>
                                                        </select> */}
                                                    <input type="text" name="text" id="text" value={amznWishlist} onChange={(e)=>setAmznWishlist(e.target.value)} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Amazon Wishlist" required />
                                                </div>
                                                <button type="submit" onClick={openWishlist} class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Open Wishlist</button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div> 
                    </div>
                </div>
            </div>
        )
    }
    const renderSocialTab = () => {
        return(
            <>
            <div className="my-2">
                    <div className="grid grid-cols-5 gap-4">
                            <div className="flex flex-col w-fit cursor-pointer items-center" onClick={onImportGithubStars}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px]object-contain" src="/icons/github.png" alt="pocket" />
                                </div>
                                <span className="text-[#7C829C] text-xs">Stars</span>
                            </div>
                            <div className="flex flex-col w-fit cursor-pointer items-center" onClick={onImportLinkedInPost}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px]object-contain" src="/images/linkedin-n.png
                                    " alt="pocket" />
                                </div>
                                <span className="text-[#7C829C] text-xs whitespace-nowrap">Saved Post</span>
                            </div>
                            <div className="flex flex-col w-fit cursor-pointer items-center" onClick={onImportBookmarkFromTwitter}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px]object-contain" src="/images/twitter-n.png" alt="pocket" />
                                </div>
                                <span className="text-[#7C829C] text-xs">Bookmarks</span>
                            </div>
                            <div className="flex flex-col w-fit cursor-pointer items-center" onClick={onImportLikeFromTwitter}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px]object-contain" src="/images/twitter-n.png" alt="pocket" />
                                </div>
                                <span className="text-[#7C829C] text-xs">Likes</span>
                            </div>
                            <div className="flex flex-col w-fit cursor-pointer items-center" onClick={() => onImportRedditSavedPost("redditUpvotedPost")}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px]object-contain" src="/images/reddit-n.png" alt="pocket" />
                                </div>
                                <span className="text-[#7C829C] text-xs whitespace-nowrap">Reddit Saved</span>
                            </div>
                            <div className="flex flex-col w-fit cursor-pointer items-center" onClick={onImportPinsFromPinterest}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px]object-contain" src="/images/pinterest-n.png" alt="pocket" />
                                </div>
                                <span className="text-[#7C829C] text-xs whitespace-nowrap">Pins</span>
                            </div>
                    </div>
                </div>
            </>
        )
    }
    const renderHighlightsTab = () => {
        return(
            <>
            <div className="my-2">
                    <div className="grid grid-cols-5 gap-4">
                        <div className="flex flex-col w-fit items-center cursor-pointer" onClick={onImportFromRaindrop}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px]" src="/images/raindrop-n.png" alt="ranindrop" />
                                </div>
                                <span className="text-[#7C829C] text-xs">Raindrop</span>
                        </div>
                        <div className="flex flex-col w-fit items-center cursor-pointer" onClick={onImportFromKindle}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px] object-contain" src="/images/kindle-n.png" alt="pocket" />
                                </div>
                                <span className="text-[#7C829C] text-xs whitespace-nowrap">Kindle</span>
                        </div>
                    </div>
                </div>
            </>
        )
    }
    const renderArticlesTab = () => {
        return(
            <>
            <div>
                <div className="grid grid-cols-5 gap-4">
                        <div className="flex flex-col w-fit cursor-pointer items-center" onClick={onImportFromPocket}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px]" src="/images/pocket-n.png" alt="pocket" />
                                </div>
                                <span className="text-[#7C829C] text-xs">Pocket</span>
                        </div>
                        <div className="flex flex-col w-fit cursor-pointer items-center" onClick={onImportReadingList}>
                                <div className="bg-white p-2 flex items-center justify-center border border-solid border-[#d3d3d3] w-fit rounded-[10px] mb-1">
                                    <img className="w-[25px] h-[25px] object-contain" src="/images/medium-n.png" alt="pocket" />
                                </div>
                                <span className="text-[#7C829C] text-xs whitespace-nowrap">Medium</span>
                        </div>
                    </div>
            </div>
            </>
        )
    }

    const handleSubmit = async () => {
        if (!linkPasted) {
          message.error("Enter valid hyperlinks");
          return;
        }
      if (!selectedCollection.id) {
        setError(true);
        return;
      }

      setButtonLoading(true);

      const payload = {
        links: linkPasted,
      };

      const res = await dispatch(uploadCsvTextLinks(payload));

      if (res?.payload?.data?.status === 400) {
        message.error(
          res?.payload?.data?.message || "No valid hyperlinks found"
        );
        setButtonLoading(false);
        return;
      }

      if (res?.payload?.data?.status === 200) {
        let newTags = [];
        const filtered = selectedTags.filter(
          (item) => typeof item.id === "string"
        );
        const filteredNumber = selectedTags.filter(
          (item) => typeof item.id === "number"
        );
        const tagNames = filtered?.map((item) => item?.tag);
        if (tagNames && tagNames?.length > 0) {
          newTags = await updateTags(tagNames, userTags, tagNames?.length);
        }
        newTags = [...newTags, ...filteredNumber];

        const tagIds = newTags?.map((t) => {
          return t?.id;
        });

        const cName = selectedCollection?.name;

        const changedResponseArray = res?.payload?.data?.data?.map((item) => {
          return {
            ...item,
            Collection: cName,
            Tags: tagIds,
            remarks: remarks || item?.remarks,
            MediaType: selectedType?.name || "Link",
          };
        });

        dispatch(setSyncingCollection(true));
        dispatch(setPercentageData(0));

        const jsonObjs = groupByParentAndCollection(changedResponseArray || []);
        
        let totalCount = calculateTotalItems(jsonObjs);
        getTotalFoldersAndBookmarks(jsonObjs);
        totalImportItems = totalCount;
        dispatch(
          setCurrentImportStatus({
            processedItems: 0,
            totalItems: totalCount,
          })
        );
        dispatch(getCollectionById(Number(session.unfiltered_collection_id)));
        for (const index in jsonObjs) {
          const o = jsonObjs[index];
          const res = await sendChunkRecordsForImport(o, null, null, index);
          importedItems += 1;
          updateProgress(importedItems, totalCount);
          dispatch(
            setCurrentImportStatus({
              processedItems: importedItems,
              totalItems: totalCount,
            })
          );
          dispatch(updateCollectionDataForImport(res));
          dispatch(getAllCollections());
          if (res.isPassed || res.status === 429) {
            setShowSpin(false);
            setFile(null);
          }
          if (res.status === 429) {
            dispatch(setSyncingCollection(false));
            dispatch(setPercentageData(100));
            dispatch(setCurrentUploadItems(null));
            folderT = null;
            bookmarkT = null;
            dispatch(setCurrentUploadItems(null));
            break;
          } else if (folderT) {
            folderT = folderT - 1;
            dispatch(
              setCurrentUploadItems({
                totalBookmarks: bookmarkT,
                totalFolders: folderT,
              })
            );
          }
        }
        dispatch(setCurrentUploadItems(null));
        dispatch(setCurrentImportStatus(null));
        dispatch(
          createCollectionActivity({
            action: "Imported",
            module: "Collection",
            actionType: "Collection",
            count: jsonObjs?.length,
            author: {
              id: parseInt(session.userId),
              username: session.username,
            },
          })
        );
        module.forEach((m) => {
          store.dispatch(updateScore(m));
        });

        setButtonLoading(false);
        return;
      }
    };

    const renderLinkUpload = () => {
      return (
        <div onClick={onLayoutClick}>
          <TextareaAutosize
            value={linkPasted}
            onChange={(e) => setLinkPasted(e.target.value)}
            placeholder="Paste all your links here"
            minRows={4}
            className="w-full rounded-md resize-none !outline-none !focus:outline-none textarea-border"
          />

          <div className="mb-2 flex justify-between space-x-2">
            <div className={classNames("flex-1", showTypeInput && "hidden")}>
              <h6 className="block text-xs font-medium text-gray-500 mb-1">
                Collections
              </h6>
              <div className="ct-relative" onClick={(e) => e.stopPropagation()}>
                <div
                  onClick={() => setShowCollectionInput(true)}
                  className="w-full"
                >
                  <ComboBox
                    inputShown={showCollectionInput}
                    setShowCollectionInput={setShowCollectionInput}
                    collectionData={allCollections || []}
                    userId={session.userId}
                    setSelectedCollection={onCollectionChange}
                    selectedCollection={selectedCollection}
                    error={error}
                  />
                </div>
              </div>
            </div>
            <div
              className={classNames("flex-1", showCollectionInput && "hidden")}
            >
              <h6 className="block text-xs font-medium text-gray-500 mb-1">
                Type
              </h6>
              <div className="ct-relative" onClick={(e) => e.stopPropagation()}>
                <div onClick={() => setShowTypeInput(true)} className="w-full">
                  <TypeComboBox
                    inputShown={showTypeInput}
                    setShowTypeInput={setShowTypeInput}
                    updateInputShow={setShowTypeInput}
                    setSelectedType={setSelectedType}
                    type={selectedType}
                    disabled={true}
                  />
                </div>
              </div>
            </div>
          </div>

          <ReactTags
            tags={selectedTags?.map((t) => {
              return {
                id: t?.attributes?.tag || t?.tag,
                text: t?.attributes?.tag || t?.tag,
              };
            })}
            suggestions={prepareTags()}
            delimiters={[KEY_CODES.enter, KEY_CODES.comma]}
            handleDelete={onTagDelete}
            handleAddition={onTagAdd}
            inputFieldPosition="inline"
            placeholder="Type to enter tags"
            onClearAll={() => setSelectedTags([])}
            clearAll
            autocomplete
            inline={true}
          />

          <div className="pt-4">
            <h6 className="block text-xs font-medium text-gray-500 mb-1">
              Remarks
            </h6>
            <TextareaAutosize
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add your remarks"
              minRows={4}
              className="w-full rounded-md resize-none !outline-none !focus:outline-none textarea-border"
            />
          </div>

          <div className="w-full flex items-center justify-end">
            <AntdButton
              type="primary"
              className="bg-[#40a9ff] border-[#40a9ff]"
              onClick={handleSubmit}
              disabled={buttonLoading}
            >
              {buttonLoading ? "Loading" : "Submit"}
            </AntdButton>
          </div>
        </div>
      );
    };

    const renderFileUploader = () => {
      return (
        <>
          {isSyncing ? (
            <ImportProgressBar />
          ) : (
            <AntdButton
              className="w-full mt-4 border-[#347AE2] text-[#347AE2]"
              onClick={onAutoBookmarkClick}
              disabled={isSyncing}
            >
              Auto-Import Bookmark from browser
            </AntdButton>
          )}
          <div className="w-full flex p-1 rounded-md bg-[#F8FAFB] cursor-pointer items-center justify-between mb-6">
            <div
              className={`shareInviteBtn ${
                optionSelected === "file"
                  ? "rounded shadow border-[0.4px] border-solid border-[#78A6EC] bg-white"
                  : ""
              } w-[50%]`}
              onClick={() => {
                setOptionSelected("file");
              }}
            >
              <DocumentPlusIcon
                className={`h-5 w-5 ${
                  optionSelected === "file"
                    ? "text-[#347AE2]"
                    : "text-[#74778B]"
                }`}
              />
              <div
                className={`${
                  optionSelected === "file"
                    ? "text-[#347AE2]"
                    : "text-[#74778B]"
                } font-medium text-sm`}
              >
                File
              </div>
            </div>

            <div
              className={`shareInviteBtn ${
                optionSelected === "links"
                  ? "rounded shadow border-[0.4px] border-solid border-[#78A6EC] bg-white"
                  : ""
              } w-[50%]`}
              onClick={() => setOptionSelected("links")}
            >
              <LinkIcon
                className={`h-5 w-5 ${
                  optionSelected === "links"
                    ? "text-[#347AE2]"
                    : "text-[#74778B]"
                }`}
              />
              <div
                className={`font-medium text-sm ${
                  optionSelected === "links"
                    ? "text-[#347AE2]"
                    : "text-[#74778B]"
                }`}
              >
                Links
              </div>
            </div>
          </div>

          {optionSelected === "file" && (
            <FileUploader
              handleChange={onFileChange}
              name="drop-zone-section-file"
              types={IMPORT_FILE_TYPE}
              onTypeError={(err) => message.error(err)}
              disabled={isSyncing}
            >
              <div className="mt-4 mx-auto w-[348px] h-[140px] bg-white border-2 border-dashed border-gray-400 flex text-center justify-center align-middle items-center">
                <div>
                  <FiUpload className="h-6 w-6 text-gray-500 my-0 mx-auto mb-2" />
                  <span>Drag & drop to upload bookmark</span>
                  <div className="flex justify-center items-center gap-2 mt-2"></div>
                  <span className="underline text-sm text-[#347AE2] cursor-pointer">
                    or Browse
                  </span>
                </div>
              </div>
            </FileUploader>
          )}

          {optionSelected === "links" && <>{renderLinkUpload()}</>}

          <div className="flex justify-center items-center gap-2 my-2">
            <hr className="w-[110px]" />
            <span className="text-[#292B38] font-medium text-sm">
              or import from
            </span>
            <hr className="w-[110px]" />
          </div>

          <div>
            <Tabs
              defaultActiveKey={tabKey}
              onChange={handleTabChange}
              items={[
                {
                  label: `All`,
                  key: "All",
                  children: renderAllTab(),
                },
                {
                  label: `Social`,
                  key: "Social",
                  children: renderSocialTab(),
                },
                {
                  label: `Highlights`,
                  key: "Highlights",
                  children: renderHighlightsTab(),
                },
                {
                  label: `Articles`,
                  key: "Articles",
                  children: renderArticlesTab(),
                },
              ]}
            />
          </div>
          {/* 
                <div className='btn-center'>
                    <Button onClick={onSkipBtnClick} className={loading? "active-skip-btn": "skip-btn"}>Skip to Add Bookmarks</Button>
                </div> */}

          <Modal
            title="Enter username"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={[
              <AntdButton className="mr-4" onClick={handleCancel}>
                Cancel
              </AntdButton>,
              <AntdButton
                className="bg-blue-500"
                key="submit"
                type="primary"
                loading={loading}
                onClick={handleOk}
              >
                Submit
              </AntdButton>,
            ]}
          >
            <input
              className="w-full outline-none border border-gray-400 rounded-sm p-2 block"
              type="text"
              placeholder="Username"
              onChange={(e) => setTwitterUsername(e.target.value)}
            />
            <span className="error-label">{error?.tUsername}</span>
          </Modal>
        </>
      );
    };

    return (
        // <CommonLayout showFooter={false}>
        //     <div className="flex-1 flex flex-col justify-center items-center">
        //         {!loading &&
        //             <div className='ct-relative mt-2'>
        //                 <img className='h-50 w-50 my-0 mx-auto' src="/icons/upload-error.svg" alt="Cloud ellipse icons" />
        //                 <div className='absolute top-[85px] left-0 justify-center w-full text-xs text-gray-400 text-center'>
        //                     No data! Please add bookmark
        //                 </div>
        //             </div>
        //         }
        //         <div className='my-0 mx-auto w-[348px] h-[218px]'>
        //             {showSpin 
        //                 ? <Loadingscreen showSpin={showSpin}/>
        //                 : renderFileUploader()
        //             }                
        //         </div>
        //     </div>
        // </CommonLayout>
        <LayoutCommon>
            <Header
                // label={'Upload'}
                isHideBackButton={true}
                isMenuItemEnabled={false}
                onSkip={onSkipBtnClick}
                onBackBtnClick={false}
                menuItems={[]}
                MenuIcon={null}
                isDownloadable={false}
                // onClose={onPanelCloseClick}
                onDownload={false}
              />

            {
                isSyncing && <div className="spin-overlay h-full w-full">
                    <Spin tip={'Uploading..'} />
                </div>
            }
            <div className="flex-1 flex flex-col justify-center items-center">
                {/* {!loading &&
                    <div className='ct-relative mt-2'>
                        <img className='h-50 w-50 my-0 mx-auto' src="/icons/upload-error.svg" alt="Cloud ellipse icons" />
                        <div className='absolute top-[85px] left-0 justify-center w-full text-xs text-gray-400 text-center'>
                            No data! Please add bookmark
                        </div>
                    </div>
                } */}
                <div className='my-0 mx-auto w-[348px] h-[218px]'>
                    {renderFileUploader()}
                    {/* {showSpin 
                        ? <Loadingscreen showSpin={showSpin}/>
                        : renderFileUploader()
                    }                 */}
                </div>

                {/* imports */}
                {/* <Divider>or import from</Divider>
                <div>
                    <Tabs
                    defaultActiveKey={tabKey}
                    onChange={handleTabChange}
                    items={[
                        {
                            label: `All`,
                            key: "All",
                            children: renderAllTab(),
                        },
                        {
                            label: `Social`,
                            key: "Social",
                            children: renderSocialTab(),
                        },
                        {
                            label: `Highlights`,
                            key: "Highlights",
                            children: renderHighlightsTab(),
                        },
                        {
                            label: `Articles`,
                            key: "Articles",
                            children: renderArticlesTab(),
                        },
                    ]}
                    />
                </div> */}

                {/* <Modal 
                    title="Enter username" 
                    open={isModalOpen} 
                    onOk={handleOk} 
                    onCancel={handleCancel}
                    footer={[
                        <AntdButton className="mr-4" onClick={handleCancel}>
                            Cancel
                        </AntdButton>,
                        <AntdButton className="bg-blue-500" key="submit" type="primary" loading={loading} onClick={handleOk}>
                            Submit
                        </AntdButton>,
                    ]}
                    
                    >
                    <input className="w-full outline-none border border-gray-400 rounded-sm p-2 block" type="text" placeholder="Username" onChange={(e) => setTwitterUsername(e.target.value)} />
                    <span className="error-label">{error?.tUsername}</span>
                </Modal> */}
            </div>
        </LayoutCommon>
    )
}

export default Home