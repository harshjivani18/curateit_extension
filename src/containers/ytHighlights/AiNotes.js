import "../texts/TextPage.css";
import React, {
    useEffect,
    useState
} from "react";
import { useNavigate } from "react-router-dom";
import {
    useSelector,
    useDispatch
} from "react-redux";
// import { CheckIcon }                            from "@heroicons/react/24/outline";
import { message } from "antd";
import ReactQuill from "react-quill";
import { v4 as uuidv4 } from "uuid";

import OperationLayout from "../../components/layouts/OperationLayout";
import { panelClose } from "../../utils/message-operations";
import { removeDuplicates } from "../../utils/equalChecks";
import { fetchCurrentTab } from "../../utils/fetch-current-tab";

import {
    addHighlight,
    updateHighlightsArr,
    getAllHighlights,
    updateHighlightToGem
} from "../../actions/highlights";
import { addGemToSharedCollection, moveGemToSharedCollection, removeGemFromCollection, updateBookmarkWithExistingCollection } from "../../actions/collection";
import { getAllLevelCollectionPermissions, getBookmarkPermissions } from "../../utils/find-collection-id";
import { TEXT_MESSAGE } from "../../utils/constants";

const AiNotes = (props) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const status_bar = document.getElementById("status-bar");
    // const highlightRef                  = useRef()
    const currentGem = useSelector((state) => state.gem.currentGem);
    const tabDetails = useSelector((state) => state.app.tab)
    const sharedCollections = useSelector((state) => state.collection.sharedCollections)
    const expanderIdx = currentGem && currentGem.expander ? currentGem.expander.findIndex((e) => { return e.type === "expander" }) : -1
    const expanderObj = expanderIdx !== -1 ? currentGem.expander[expanderIdx] : null
    const [textExpander,
        setTextExpander] = useState(expanderObj?.text || "")

    const [expanderPlain,
        setExpanderPlain] = useState(expanderObj?.plainText || "")
    const [processing, setProcessing] = useState(false)


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
            setTextExpander(allContent);
            // window.chrome.storage.local.remove("aiNotes")
        };

        const handleTranscriptHTML = (transcriptHtmlJSON) => {
            const transcriptDataHTML = generateHTMLFromJSON(transcriptHtmlJSON)
            setTextExpander(transcriptDataHTML)
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
            setTextExpander(`<p>${data.message}</p>`)
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

    const onSubmitHighlight = async (obj) => {
        if (textExpander === "") {
            message.error("Please enter a text for text expander")
            return
        }
        const newLink = (obj.assetUrl && obj.assetUrl.endsWith('/')) ? obj.assetUrl?.slice(0, -1) : obj.assetUrl
        let res = null
        setProcessing(true)
        let isSingleBkShared = null
        let isSelectedCollectionShared = null
        let isCurrentCollectionShared = null
        const mediaCovers = currentGem?.metaData?.covers ? [obj.imageUrl, ...currentGem?.metaData?.covers] : obj.covers && obj.covers.length !== 0 ? obj.covers : [obj.imageUrl]
        const finalCovers = removeDuplicates(mediaCovers)
        let payload = {
            notes: obj.remarks,
            color: "",
            text: textExpander,
            // title: expanderPlain || textExpander || obj.heading,
            title: (expanderPlain && obj?.shortUrlObj && Array.isArray(obj?.shortUrlObj)) ?
                obj?.shortUrlObj[0]?.keyword + " " + expanderPlain.substring(0, 20) : (expanderPlain || textExpander || obj.heading),
            description: obj.description,
            expander: textExpander !== "" && obj.shortUrlObj.length > 0 ? [...obj.shortUrlObj, { type: "expander", keyword: obj.shortUrlObj[0].keyword, url: obj.assetUrl, text: textExpander, plainText: expanderPlain }] : obj.shortUrlObj,
            link: newLink,
            collections: obj.selectedCollection?.id,
            tags: obj.selectedTags?.map((t) => { return t.id }),
            type: typeof obj.selectedType === "object" ? obj.selectedType?.name : obj.selectedType,
            box: null,
            _id: uuidv4(),
            details: null,
            styleClassName: "",
            is_favourite: obj.favorite,
            metaData: {
                covers: finalCovers,
                icon: obj?.favIconImage || '',
                docImages: obj.docImages,
                defaultIcon: obj?.defaultFavIconImage || '',
                defaultThumbnail: obj?.defaultThumbnailImg || null,
            }
        }
        

        if (currentGem) {
            isSingleBkShared = getBookmarkPermissions(sharedCollections, currentGem.id)
            isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections, obj.selectedCollection.id)
            isCurrentCollectionShared = getAllLevelCollectionPermissions(sharedCollections, currentGem?.collection_id || currentGem?.parent?.id)
            if (isSingleBkShared && !isSelectedCollectionShared) {
                message.error(TEXT_MESSAGE.SHARED_COLLECTION_GEM_ERROR_TEXT)
                setProcessing(false)
                return;
            }
            if (isSelectedCollectionShared) {
                payload = {
                    ...payload,
                    author: isSelectedCollectionShared?.data?.author?.id
                }
            }
            res = await dispatch(updateHighlightToGem(obj.selectedCollection?.id, currentGem.id, payload))
        }
        else {
            isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections, obj.selectedCollection.id)
            if (isSelectedCollectionShared) {
                payload = {
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

        setProcessing(false)

        if (res.error === undefined) {
            const { data } = res.payload
            if (currentGem) {
                const parent = currentGem.parent || currentGem.collection_gems
                const isCollectionChanged = parent.id !== obj.selectedCollection.id;
                const o = {
                    ...data,
                    tags: obj.selectedTags
                }
                if (isCollectionChanged) {
                    o["collection_id"] = obj.selectedCollection.id
                    o["collection_gems"] = obj.selectedCollection
                }
                if (isSelectedCollectionShared) {
                    dispatch(removeGemFromCollection(currentGem.id || '', currentGem?.parent?.id || '', isCurrentCollectionShared))
                    dispatch(moveGemToSharedCollection(obj.selectedCollection.id, currentGem.id, (currentGem) ? { ...currentGem, ...o } : data))
                    setProcessing(false)
                    return navigate("/search-bookmark")
                }

                dispatch(updateBookmarkWithExistingCollection((currentGem) ? { ...currentGem, ...o } : data, obj.selectedCollection, isCollectionChanged, "update", parent))
                dispatch(updateHighlightsArr((currentGem) ? { ...currentGem, ...o } : data, "edit"))
            }
            else {
                const g = {
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
                    tags: obj.selectedTags
                }
                if (isSelectedCollectionShared) {
                    dispatch(addGemToSharedCollection(obj.selectedCollection.id, g))
                    dispatch(updateHighlightsArr(g, "add"))
                }
                if (!isSelectedCollectionShared) {
                    dispatch(updateBookmarkWithExistingCollection(g, obj.selectedCollection, false, "add", null))
                    dispatch(updateHighlightsArr(g, "add"))
                }
            }
            const response = await dispatch(getAllHighlights(newLink))
            if (response.error === undefined && response.payload && response.payload.data && response.payload.data.length > 0) {
                const tabs = tabDetails || await fetchCurrentTab()
                window.chrome.tabs.sendMessage(tabs.id, { value: JSON.stringify(response.payload.data), type: "CT_HIGHLIGHT_DATA" })
            }
        }
        navigate("/search-bookmark")
    }

    const onTextExpanderChange = (content, delta, source, editor) => {
        setTextExpander(content)
        setExpanderPlain(editor.getText())
    }

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link']
        ]
    }

    return (
        <OperationLayout currentGem={currentGem}
            processing={processing}
            onButtonClick={onSubmitHighlight}
            pageTitle={currentGem ? "Update Note" : "Add new Note"}
            isHideBackButton={false}
            isHideHeader={props.isHideHeader || false}
            mediaType={"Highlights"}
            onPanelClose={panelClose}>
            <div className="pt-4">
                <div className='bg-white rounded-md p-2 border-2'>
                    <div>
                        <ReactQuill theme="snow" value={textExpander} onChange={onTextExpanderChange} modules={quillModules} style={{ backgroundColor: "white" }} />
                    </div>
                </div>
            </div>
        </OperationLayout>
    )
}

export default AiNotes
