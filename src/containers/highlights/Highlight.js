import React, { useEffect, 
       useRef,
       useState }                               from "react";
import { useNavigate }                          from "react-router-dom";
import { useSelector,
         useDispatch }                          from "react-redux";  
import { CheckIcon }                            from "@heroicons/react/24/outline";
import { message }                              from "antd";
import { v4 as uuidv4 }                         from "uuid";

import OperationLayout                          from "../../components/layouts/OperationLayout";
import { HIGHLIGHTED_COLORS, TEXT_MESSAGE }                   from "../../utils/constants";
import { copyText,
         panelClose }                           from "../../utils/message-operations";
import { removeDuplicates }                     from "../../utils/equalChecks";
import { fetchCurrentTab }                      from "../../utils/fetch-current-tab";

import { addHighlight,
         updateHighlight,
         updateHighlightsArr,
         getAllHighlights,
         updateHighlightToGem }                 from "../../actions/highlights";
import { addGemToSharedCollection, moveGemToSharedCollection, removeGemFromCollection, updateBookmarkWithExistingCollection } from "../../actions/collection";
import { getAllLevelCollectionPermissions, getBookmarkPermissions } from "../../utils/find-collection-id";
import ReactQuill from "react-quill";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const HighlightPage = (props) => {
    const dispatch                      = useDispatch()
    const navigate                      = useNavigate()
    const highlightRef                  = useRef()
    const defaultColorObjIdx            = HIGHLIGHTED_COLORS.findIndex((h) => { return h.id === 4})
    const currentGem                    = useSelector((state) => state.gem.currentGem);
    const currentMedia                  = useSelector((state) => state.gem.currentMedia);
    const tabDetails                    = useSelector((state) => state.app.tab)
    const sharedCollections             = useSelector((state) => state.collection.sharedCollections)
    const [highlightedText, 
           setHighlightedText]          = useState(currentMedia?.text || "")
    const [highlightedColor,
           setHighlightedColor]         = useState(currentMedia?.color || HIGHLIGHTED_COLORS[defaultColorObjIdx])
    const [highlightDetails,
           setHighlightDetails]         = useState(currentMedia?.details || null)
    const [highlightClass,
           setHighlightClass]           = useState(currentMedia?.styleClassName || "")
    const [highlightBox,
           setHighlightBox]             = useState(currentMedia?.box || null)
    const [processing, setProcessing]   = useState(false)
    const [isExist, setIsExist]         = useState(false)

    useEffect(() => {
        window.chrome.storage.sync.get("highlightedData", (data) => {
            if (data && data.highlightedData) {
                setHighlightedText(data.highlightedData.text)
                setHighlightedColor(data.highlightedData.colorCode)
                setHighlightDetails(data.highlightedData.details)
                setHighlightClass(data.highlightedData.styleClassName)
                setHighlightBox(data.highlightedData.box)
                setIsExist(true)
            }
        })

        // return () => {
        //     window.chrome.storage.sync.remove("highlightedData")
        // }
    }, [])

    const removeFromStorage = (key, storageType = 'sync') => {
        window.chrome.storage.local.remove(key);
    };

    function generateHTMLFromJSON(jsonData) {
        let htmlString = "";

        jsonData.forEach(item => {
            let timestampHTML = `<p><strong style="color: rgb(125, 46, 125);">${item.timestamp}</strong></p>`;
            let textHTML = `<p>${item.text}</p>`;

            htmlString += timestampHTML + textHTML + '<br>';
        });

        return htmlString;
    }

    function concatenateTextFromJSON(jsonArray) {
        let concatenatedText = '';
        for (const obj of jsonArray) {
            concatenatedText += obj.text + ' ';
        }
        return concatenatedText.trim();
    }
    
    useEffect(() => {
        const fetchAiNotes = () => {
            if (typeof window.chrome !== 'undefined' && window.chrome.storage) {
                window.chrome.storage.local.get(["aiNotes", "transcriptHTML", "summaryHTML"], (data) => {
                    if (data?.aiNotes) {
                        handleAiNotes(data.aiNotes);
                        removeFromStorage("aiNotes", "local");
                    } else if (data?.transcriptHTML) {
                        handleTranscriptHTML(data.transcriptHTML);
                        removeFromStorage("transcriptHTML", "local");
                    } else if (data?.summaryHTML) {
                        handleSummaryHTML(data.summaryHTML);
                        removeFromStorage("summaryHTML", "local");
                    }
                });
            }
        };

        const handleAiNotes = (aiNotesStr) => {
            // notes will have timestamps, img, note of last 15/20 secs
            const aiNotesArray = JSON.parse(aiNotesStr);
            let allContent = "";
            aiNotesArray.forEach((aiNote) => {
                let content = "";

                if (aiNote?.timestamp) {
                    content += `<strong style="color: rgb(125, 46, 125);">${aiNote.timestamp}</strong></br>`;
                }

                if (aiNote?.screenshot?.url) {
                    if (aiNote?.screenshot?.timestamp) {
                        content += `<strong style="color: rgb(125, 46, 125);">${aiNote.screenshot.timestamp}</strong>`;
                        content += `<img src="${aiNote.screenshot.url}" />`;
                    }
                    content += "</br>";
                }

                if (aiNote?.text) {
                    content += `${aiNote.text}`;
                }
                content += "</br>";
                allContent += content;
            });
            setHighlightedText(allContent);
            // window.chrome.storage.local.remove("aiNotes")
        };

        const handleTranscriptHTML = (transcriptHtmlJSON) => {
            const transcriptDataHTML = generateHTMLFromJSON(transcriptHtmlJSON)
            setHighlightedText(transcriptDataHTML)
        };

        const handleSummaryHTML = async (summaryHtmlJSON) => {
            const userdata = await window?.chrome?.storage?.sync.get(["userData"]);
            const apiUrl = userdata?.userData?.apiUrl;
            const summary = concatenateTextFromJSON(summaryHtmlJSON)
            const response = await fetch(`${apiUrl}/api/openai?isSummary=true`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: summary.substring(0, 2000) }),
            });

            const data = await response.json()
            setHighlightedText(`<p>${data.message}</p>`)
        };
        fetchAiNotes();
        if (typeof window.chrome !== 'undefined' && window.chrome.storage) {
            window.chrome.storage.onChanged.addListener((changes, namespace) => {
                if (namespace === 'local' && (changes.aiNotes || changes.transcriptHTML || changes.summaryHTML)) {
                    fetchAiNotes();
                }
            });

            return () => {
                window.chrome.storage.onChanged.removeListener(fetchAiNotes);
            };
        }
    }, []);

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
      
        return { ...ogData, docTitle: doc.title };
    }

    const onSubmitHighlight = async (obj) => {
        const newLink       = (obj.assetUrl && obj.assetUrl.endsWith('/')) ? obj.assetUrl?.slice(0, -1): obj.assetUrl
        let res             = null
        setProcessing(true)
        const mediaCovers   = currentGem?.metaData?.covers ? [ obj.imageUrl, ...currentGem?.metaData?.covers ] : obj.covers && obj.covers.length !== 0 ? obj.covers : [obj.imageUrl]
        const finalCovers   = removeDuplicates(mediaCovers)
        let ogValues = await fetchOpenGraphData(newLink)
        let title = ogValues["og:title"];
        let description = ogValues["og:description"];
        let payload       = {
            notes: obj.remarks,
            color: highlightedColor,
            text: highlightedText,
            title: title || ogValues.docTitle || highlightedText,
            heading: obj.heading,
            description: description || obj.description,
            expander: obj.shortUrlObj,
            link:  newLink,
            collections: obj.selectedCollection?.id,
            tags: obj.selectedTags?.map((t) => { return t.id }),
            type: typeof obj.selectedType === "object" ? obj.selectedType?.name : obj.selectedType,
            box: highlightBox,
            _id: currentMedia?.id || highlightDetails?.id || uuidv4(),
            details: highlightDetails,
            styleClassName: highlightClass,
            is_favourite: obj.favorite,
            metaData: {
                covers: finalCovers,
                icon: obj?.favIconImage || '',
                docImages: obj.docImages,
                defaultThumbnail: obj?.defaultThumbnailImg || '',
                defaultIcon: obj?.defaultFavIconImage || ''
            },
            showThumbnail: obj?.showThumbnail
        }
        let isSingleBkShared = null
        let isSelectedCollectionShared = null
        let isCurrentCollectionShared = null

        if (currentMedia?.colorCode) { 
            payload["colorCode"] = highlightedColor
        }

        if (currentGem) {
            isSingleBkShared = getBookmarkPermissions(sharedCollections,currentGem.id)
            isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,obj.selectedCollection.id)
            isCurrentCollectionShared = getAllLevelCollectionPermissions(sharedCollections,currentGem?.collection_id || currentGem?.parent?.id)
            if(isSingleBkShared && !isSelectedCollectionShared){
                message.error(TEXT_MESSAGE.SHARED_COLLECTION_GEM_ERROR_TEXT)
                setProcessing(false)
                return;
            }
            if(isSelectedCollectionShared){
                payload ={
                    ...payload,
                    author: isSelectedCollectionShared?.data?.author?.id
                }
            }
            res = await dispatch(updateHighlightToGem(obj.selectedCollection?.id, currentGem.id, payload))
        }
        else {
            isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,obj.selectedCollection.id)
            if(isSelectedCollectionShared){
                payload ={
                    ...payload,
                    author: isSelectedCollectionShared?.data?.author?.id
                }
            }
            let parent_type = "";
            if (payload.link.includes("youtube.com")) {
            parent_type = "Video";
            }
            
            res = await dispatch(addHighlight(payload.collections, payload, parent_type))
        }

        if (res.error === undefined) {
            const { data } = res.payload
            if (currentGem) {
                const parent              = currentGem.parent || currentGem.collection_gems
                const isCollectionChanged = parent.id !== obj.selectedCollection.id;

                // Current seleted Cloned Gem Obj
                const o = {
                    ...data,
                    tags: obj.selectedTags
                }
                if (isCollectionChanged) {
                    o["collection_id"] = obj.selectedCollection.id
                    o["collection_gems"] = obj.selectedCollection
                }
                if(isSelectedCollectionShared){
                    dispatch(removeGemFromCollection(currentGem.id || '', currentGem?.parent?.id || '',isCurrentCollectionShared))
                    dispatch(moveGemToSharedCollection(obj.selectedCollection.id,currentGem.id,(currentGem) ? { ...currentGem, ...o } : data))
                    setProcessing(false)
                    return navigate("/search-bookmark")
                }
                
                dispatch(updateBookmarkWithExistingCollection((currentGem) ? { ...currentGem, ...o } : data, obj.selectedCollection, isCollectionChanged, "update", parent))
                dispatch(updateHighlightsArr((currentGem) ? { ...currentGem, ...o } : data, "edit"))
            }
            else {
                // Response Cloned Obj
                const g      = {
                    ...data,
                    id: data.id,
                    title: data.title,
                    media: data.media,
                    media_type: data.media_type,
                    url: data.url,
                    remarks: data.remarks,
                    metaData: data.metaData,
                    description: data.description,
                    S3_link: data.S3_link,
                    is_favourite: data.is_favourite,
                    collection_id: obj.selectedCollection.id,
                    collection_gems: obj.selectedCollection,
                    tags: obj.selectedTags,
                }
                if(isSelectedCollectionShared){
                    dispatch(addGemToSharedCollection(obj.selectedCollection.id,g))
                    dispatch(updateHighlightsArr(g, "add"))
                }
                if(!isSelectedCollectionShared){
                    dispatch(updateBookmarkWithExistingCollection(g, obj.selectedCollection, false, "add", null))
                    dispatch(updateHighlightsArr(g, "add"))
                }
            }
            dispatch(getAllHighlights(newLink)).then((response) => {
                if (response.error === undefined && response.payload && response.payload.data && response.payload.data.length>0) { 
                    if (tabDetails) {
                        window.chrome.tabs.sendMessage(tabDetails.id, { value: JSON.stringify(response.payload.data), type: "CT_HIGHLIGHT_DATA" })
                    }
                    else {
                        fetchCurrentTab().then((tabs) => {
                            window.chrome.tabs.sendMessage(tabs.id, { value: JSON.stringify(response.payload.data), type: "CT_HIGHLIGHT_DATA" })
                        })
                    }
                }
            })
        }
        setProcessing(false)
        setHighlightBox(null)
        setHighlightClass("")
        setHighlightedColor(HIGHLIGHTED_COLORS[defaultColorObjIdx])
        setHighlightedText("")
        setIsExist(false)
        window.chrome.storage.sync.remove('highlightedData')

        if (props.onClose) {
            props.onClose()
        }
        else {
            navigate("/search-bookmark?refetch=refetch-gem")
        }
    }

    const onTextCopy = () => {
        try {
            copyText(highlightedText);
            message.success('Highlight Copied to clipboard');
        } catch (err) {
            message.error('Not have permission')
        }
    }

    const onHighlightBlur = () => {
        if (highlightRef) {
            // setHighlightedText(highlightRef.current.innerText)
        }
    }

    const quillModules = {
        toolbar: [
          [{ 'header': [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['link']
        ]
    }

    const onTextExpanderChange = (content, delta, source, editor) => {
        setHighlightedText(content);
    }

    const updateColor = (color) => {
        setHighlightedColor(color)  
        setHighlightClass(color.className)
    }

    const setCodeReset = () => {
        setHighlightedText('')
    }

    return (
        <OperationLayout currentGem={currentGem}
                         processing={processing}
                         onButtonClick={onSubmitHighlight}
                         pageTitle={"Highlight"}
                         isHideBackButton={false}
                         isHideHeader={props.isHideHeader || false}
                         mediaType={"Highlight"}
                         onPanelClose={panelClose}
                         highlightedColor={highlightedColor}
                         updateColor={updateColor}
                         onTextCopy={onTextCopy}
                         setResetData = {setCodeReset}
                         >
            <div className="pt-4">
                <div className='bg-white rounded-md p-2 border-2'>
                                    <div>
                                        <ReactQuill theme="snow" value={highlightedText} onChange={onTextExpanderChange} modules={quillModules} style={{ backgroundColor: "white" }} />
                                    </div>
                </div>
                {/* <div className='flex justify-end items-baseline space-x-3'>
                    <div className='flex justify-end space-x-2 items-center pt-2'>
                        {HIGHLIGHTED_COLORS.map(color => (
                            <button 
                                key={color.id} 
                                style={{backgroundColor: `${color.bg}`}}
                                className={classNames('flex justify-center items-center h-4 w-4 rounded-full border-[1px] border-gray-400')}
                                onClick={() => { 
                                    setHighlightedColor(color)  
                                    setHighlightClass(color.className)
                                }}
                            >
                                <CheckIcon className={classNames(color.id === highlightedColor?.id ? "" : color.text,'h-2 w-2')} />
                            </button>
                        ))}
                    </div>
                </div> */}
            </div>
        </OperationLayout>
    )
}

export default HighlightPage