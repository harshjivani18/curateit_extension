/*global chrome*/
import "./OperationLayout.css"
import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux";
import { Input, Modal, Spin } from 'antd'
import { WithContext as ReactTags } from 'react-tag-input';
import { useLocation, useNavigate } from "react-router-dom";
import session from "../../utils/session";
import { addTag } from "../../actions/tags";
import { updateUserTags } from "../../actions/user";
import { fetchCurrentTab } from "../../utils/fetch-current-tab";
import { saveSelectedCollection } from "../../actions/collection";
import { getImportType, sendSocialImportToChrome } from "../../utils/send-theme-to-chrome";
import Header from "../../components/header/Header";
import ComboBox from "../../components/combobox/ComboBox";
import { KEY_CODES } from "../../utils/constants";
import { ExclamationCircleFilled } from '@ant-design/icons';
import ButtonToggleSetting from "../../components/displaySetting/ButtonToggleSetting";
import { addGem } from "../../actions/gems";
import { checkIsImgValid } from "../../utils/equalChecks";
const AddImportDetails = (props) => {
    let timer = null
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation();
    const { confirm } = Modal;
    const collections = useSelector((state) => state.collection.collectionData)
    const savedSelectedCollection = useSelector((state) => state.collection.savedSelectedCollection)
    // const tabObj = useSelector((state) => state.app.tab)
    const userTags = useSelector((state) => state.user.userTags)
    const collectionObj = null
    const [selectedTags, setSelectedTags] = useState([])
    const [processing, setProcessing] = useState(false)
    const [remarks, setRemarks] = useState("")
    const [favorite, setFavorite] = useState(false);
    const [loader, setLoader] = useState(false)
    const [error, setError] = useState(false)
    const [showProfileSwitch, setShowProfileSwitch] = useState(true)
    const [isImportProfile, setIsImportProfile] = useState(false)
    const [selectedCollection,
        setSelectedCollection] = useState(collectionObj
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
            text: "False"
        },
        {
            id: 2,
            value: true,
            text: "True"
        },
    ]
    const [redditCommunities, setRedditCommunities] = useState()
    const [bulkReddit, setBulkReddit] = useState(false)
    useEffect(() => {
        const fetchRedditData = () => {
            window.chrome.storage.local.get("redditCommunities", (data) => {
                if (data && data.redditCommunities) {
                    setRedditCommunities(JSON.parse(data.redditCommunities));
                }
            })
        };

        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get("bulkReddit") === "true") {
            setBulkReddit(true)
            fetchRedditData();
        }
    }, [location])


    useEffect(() => {
        fetchCurrentTab().then((tab) => {
            getImportType(tab).then((res) => {
                if (res.type === 'PROFILE') {
                    setIsImportProfile(true)
                    setShowProfileSwitch(false)
                } else {
                    setIsImportProfile(false)
                    setShowProfileSwitch(true)
                }
            })
        })
    }, [])
    // const showConfirm = () => {
    //     confirm({
    //         title: 'Warning!',
    //         icon: <ExclamationCircleFilled />,
    //         content: `Are you sure you want to import this user's profile`,
    //         okButtonProps: {
    //             className: 'bg-sky-500/75'
    //         },
    //         onOk() {
    //             onBackBtnClick();
    //             onSubmitClick()
    //         },
    //         onCancel() {},
    //     });
    // };
    // useEffect(() => {
    //     return () => {
    //         dispatch(setCurrentGem(null))
    //         dispatch(setCurrentMedia(null))
    //         if (timer) {
    //             clearTimeout(timer)
    //         }
    //     }
    // }, [dispatch])
    const prepareTags = () => {
        const tagArr = []
        userTags.forEach((t) => {
            if (t.tag) {
                tagArr.push({
                    id: t.tag,
                    text: t.tag
                })
            }
        })
        return tagArr
    }
    const onTagAdd = async (tag) => {
        const existingIdx = userTags?.findIndex((t) => { return t.tag === tag.text })
        if (existingIdx !== -1) {
            setSelectedTags([...selectedTags, { id: userTags[existingIdx].id, tag: userTags[existingIdx].tag }])
        }
        else {
            const res = await dispatch(addTag({ data: { tag: tag.text, users: session.userId } }))
            if (res.error === undefined && res.payload.error === undefined) {
                setSelectedTags([...selectedTags, { id: res.payload?.data?.data?.id, tag: tag.text }])
                dispatch(updateUserTags(res.payload?.data?.data))
            }
            return res;
        }
    }
    const onTagDelete = (i) => {
        selectedTags.splice(i, 1)
        setSelectedTags([...selectedTags])
    }

    const checkImportTypeOnSubmit = async () => {
        const tabDetails = await fetchCurrentTab()
        const importType = await getImportType(tabDetails)
        // if (importType.type === 'PROFILE') {
        // showConfirm()
        // } else {
        onSubmitClick()
        // }
    }
    const onSubmitClick = async () => {
        const selectedTagArr = selectedTags.map(i => i.id);
        const data = {
            collection_gems: selectedCollection?.id,
            tags: selectedTagArr,
            remarks: remarks,
            isImportProfile
        }

        // onBackBtnClick();
        closeExtension();
        if (bulkReddit && redditCommunities) {
            bulkImportReddit(data)
        }
        sendSocialImportToChrome(data, await fetchCurrentTab());
    }

    const bulkImportReddit = async (data) => {
        const tab = await fetchCurrentTab();
        window.chrome.tabs.sendMessage(tab.id, { type: "CT_RENDER_LOADER" })
        const importPromises = redditCommunities.map(async community => { // Mark the callback as async
            const { prefixedName, styles } = community;
            let imgUrl = "https://drz68kkeltaek.cloudfront.net/common/users/911/icons/200x200/Untitled.png";
            if (styles.icon) {
                imgUrl = await checkIsImgValid(styles.icon); // Now valid to use await here
            }
            const link = `https://www.reddit.com/${prefixedName}/`;
            return importSingleRedditCommunity(data, prefixedName, imgUrl, link);
        });
        // Wait for all the import operations to complete
        await Promise.all(importPromises);
    };


    function convertString(str) {
        return str?.toLowerCase().split(" ").join("-");
    }

    const importSingleRedditCommunity = async (data, prefixedName, imgUrl, link) => {
        const title = prefixedName
        const description = `${prefixedName} on Reddit`
        const url = link
        const images1 =
            Array.from(document?.images)?.map((img) => {
                return img.src;
            }) || [];
        const icon = "https://drz68kkeltaek.cloudfront.net/common/users/911/icons/200x200/Untitled.png"
        const collection_gems = data?.collection_gems
        const tags = data?.tags
        const remarks = data?.remarks
        const payload = {
            data: {
                title: title,
                description: description,
                media_type: "Profile",
                type: "Profile",
                platform: "Reddit",
                post_type: "SaveToCurateit",
                url: url,
                media: {
                    covers: [imgUrl],
                },
                metaData: {
                    covers: [imgUrl],
                    docImages: [imgUrl, ...images1],
                    icon:
                        icon !== ""
                            ? {
                                type: "image",
                                icon,
                            }
                            : null,
                    defaultIcon: icon !== "" ? icon : null,
                    defaultThumbnail: imgUrl !== "" ? imgUrl : null,
                },
                collection_gems,
                remarks,
                tags,
                is_favourite: true,
                socialfeed_obj: {
                    id: convertString(title),
                    title,
                    description,
                    profile_image_url: imgUrl,
                },
            },
        };
        try {
            const res = await dispatch(addGem(payload));
        } catch (error) {
            console.error('Failed:', error);
        }
    }

    const closeExtension = async () => {
        const tab = await fetchCurrentTab();
        window.chrome.tabs.sendMessage(tab.id, { type: "CT_CLOSE_PANEL" })
        window.chrome.storage.sync.remove('highlightedData')
    }

    const onBackBtnClick = () => {
        dispatch(saveSelectedCollection({ id: Number(session.unfiltered_collection_id), name: "Unfiltered" }))
        navigate("/search-bookmark");
    }
    const onCollectionChange = (obj) => {
        setSelectedCollection(obj)
    }
    const renderLoader = () => {
        return (
            <div className="layout-loader-container">
                <Spin tip="Loading Site Information ..." />
            </div>
        )
    }
    const renderLayout = () => {
        return (
            <div className="flex flex-col bg-slate-50 h-[100vh]" onClick={() => setShowCollectionInput(false)}>
                <Header
                    label="Add Details"
                    isHideBackButton={false}
                    onBackBtnClick={onBackBtnClick}
                />
                <div className="bg-[#F8FBFF] p-4 rounded-t-[16px] flex-1">
                    <div>
                        <div className="pt-6 flex justify-between space-x-2">
                            <div
                                className="flex-1"
                            >
                                <h6 className="block text-xs font-medium text-gray-500 mb-1">
                                    Collections
                                </h6>
                                <div
                                    className="relative"
                                    onClick={(e) => e.stopPropagation()}
                                >
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
                                        return { id: t.tag, text: t.tag }
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
                        {/* <div className="pt-4">
                                <CheckBox
                                    label="Mark as Favorites"
                                    name="favorite"
                                    darkColor={true}
                                    value={favorite}
                                    onChange={(e) => setFavorite((prev) => !prev)}
                                />
                            </div> */}
                        {showProfileSwitch && <ButtonToggleSetting
                            title="Do you want to import profiles?"
                            options={SIDEBAR_OPTIONS}
                            mode={isImportProfile}
                            handleModeChange={(checked) => setIsImportProfile(checked)}
                        />}
                    </div>
                </div>
                <div className="mb-4 mt-4 px-[16px] flex justify-end items-center sticky bottom-5 right-0 z-5">
                    <button className="bg-blue-500 small text-xs text-white px-4 py-2" onClick={checkImportTypeOnSubmit}>
                        {processing ? "Loading" : `Import`}
                    </button>
                </div>
            </div>
        )
    }
    // return loader ? <LayoutCommon>{renderLoader()}</LayoutCommon> : <LayoutCommon >{renderLayout()}</LayoutCommon>
    return loader ? renderLoader() : renderLayout()
}
export default AddImportDetails