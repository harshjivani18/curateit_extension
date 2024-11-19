import React, { useState, useEffect }                          from "react";
import { useSelector,
         useDispatch }                              from "react-redux";
import { useNavigate, useLocation }                 from "react-router-dom";

import OperationLayout                              from '../../components/layouts/OperationLayout'
import session                                      from "../../utils/session";
import { panelClose }                               from "../../utils/message-operations";

import { addGemToSharedCollection, moveGemToSharedCollection, removeGemFromCollection, updateBookmarkWithExistingCollection }     from '../../actions/collection'
import { addGem, updateGem }                        from "../../actions/gems";
import { removeDuplicates }                         from "../../utils/equalChecks";
import ComboBoxSelect from "../../components/combobox/ComboBoxSelect";
import { RiGithubLine, RiInstagramLine, RiLinkedinFill, RiMediumLine, RiProductHuntLine, RiRedditLine,  RiYoutubeLine,RiThreadsFill,
  RiFacebookLine,
  RiTwitchFill,
  RiPinterestFill,
  RiDiscordFill,
  RiWhatsappFill,
  RiTelegramFill,
  RiSteamFill,
  RiTumblrFill,
  RiGitlabFill,
  RiMastodonFill,
  RiTwitterXFill
    } from "react-icons/ri";
import { DiHackernews } from "react-icons/di";
import { getAllLevelCollectionPermissions, getBookmarkPermissions } from "../../utils/find-collection-id";
import { Avatar, message } from "antd";
import { TEXT_MESSAGE } from "../../utils/constants";
import { SiGoodreads, SiImdb, SiSubstack } from "react-icons/si";
import { PiPencilSimple } from "react-icons/pi";

let currentParentDetails            = null;
let openImg = null

const PLATFORMS = [
    {
        id: 1,
        name: "Twitter",
        value: "Twitter",
        icon: <RiTwitterXFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <RiTwitterXFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <RiTwitterXFill className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 2,
        name: "LinkedIn",
        value: "LinkedIn",
        icon: <RiLinkedinFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <RiLinkedinFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <RiLinkedinFill className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 3,
        name: "Reddit",
        value: "Reddit",
        icon: <RiRedditLine className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <RiRedditLine className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <RiRedditLine className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 4,
        name: "Producthunt",
        value: "Producthunt",
        icon: <RiProductHuntLine className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <RiProductHuntLine className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <RiProductHuntLine className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 5,
        name: "Medium",
        value: "Medium",
        icon: <RiMediumLine className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <RiMediumLine className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <RiMediumLine className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 6,
        name: "Hacker News",
        value: "Hacker News",
        icon: <DiHackernews className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <DiHackernews className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <DiHackernews className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 7,
        name: "Github",
        value: "Github",
        icon: <RiGithubLine className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <RiGithubLine className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <RiGithubLine className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 8,
        name: "Tiktok",
        value: "Tiktok",
        icon: <img src="/icons/tiktok.svg" className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <img src="/icons/tiktok.svg" className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <img src="/icons/tiktok.svg" className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 9,
        name: "Instagram",
        value: "Instagram",
        icon: <RiInstagramLine className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <RiInstagramLine className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <RiInstagramLine className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 10,
        name: "YouTube",
        value: "YouTube",
        icon: <RiYoutubeLine className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <RiYoutubeLine className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <RiYoutubeLine className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 11,
        name: "Threads",
        value: "Threads",
        icon: <RiThreadsFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <RiThreadsFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <RiThreadsFill className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 12,
        name: "Facebook",
        value: "Facebook",
        icon: <RiFacebookLine className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <RiFacebookLine className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <RiFacebookLine className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 13,
        name: "Twitch",
        value: "Twitch",
        icon: <RiTwitchFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <RiTwitchFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <RiTwitchFill className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 14,
        name: "Substack",
        value: "Substack",
        icon: <SiSubstack className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <SiSubstack className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <SiSubstack className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 15,
        name: "Pinterest",
        value: "Pinterest",
        icon: <RiPinterestFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <RiPinterestFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <RiPinterestFill className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 16,
        name: "Discord",
        value: "Discord",
        icon: <RiDiscordFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <RiDiscordFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <RiDiscordFill className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 17,
        name: "Whatsapp",
        value: "Whatsapp",
        icon: <RiWhatsappFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <RiWhatsappFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <RiWhatsappFill className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 18,
        name: "Telegram",
        value: "Telegram",
        icon: <RiTelegramFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <RiTelegramFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <RiTelegramFill className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 19,
        name: "Steam",
        value: "Steam",
        icon: <RiSteamFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <RiSteamFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <RiSteamFill className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 20,
        name: "Tumblr",
        value: "Tumblr",
        icon: <RiTumblrFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <RiTumblrFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <RiTumblrFill className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 21,
        name: "Gitlab",
        value: "Gitlab",
        icon: <RiGitlabFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <RiGitlabFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <RiGitlabFill className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 22,
        name: "Goodreads",
        value: "Goodreads",
        icon: <SiGoodreads className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <SiGoodreads className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <SiGoodreads className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
        id: 23,
        name: "Mastodon",
        value: "Mastodon",
        icon: <RiMastodonFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectOptionIcon: <RiMastodonFill className="h-4 w-4 text-gray-500" aria-hidden="true"/>,
        selectedIcon: <RiMastodonFill className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400" aria-hidden="true"/>
    },
    {
      id: 24,
      name: "Imdb",
      value: "Imdb",
      icon: (
        <SiImdb className="h-4 w-4 text-gray-500" aria-hidden="true" />
      ),
      selectOptionIcon: (
        <SiImdb className="h-4 w-4 text-gray-500" aria-hidden="true" />
      ),
      selectedIcon: (
        <SiImdb
          className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
          aria-hidden="true"
        />
      ),
    },
]

const ProfileGemPage = (props) => {
    const dispatch                      = useDispatch()
    const navigate                      = useNavigate()
    const location                      = useLocation()
    const currentGem                    = useSelector((state) => state.gem.currentGem);
    const sharedCollections             = useSelector((state) => state.collection.sharedCollections)
    const [processing, setProcessing]   = useState(false)
    const [showPlatform, setShowPlatform] = useState(false)
    const [isParserCall, setIsParserCall] = useState(false)
    const [imdbdetails,setImdbDetails] = useState({})
    const [selectedPlatform, setSelectedPlatform] = useState(
        currentGem && currentGem?.platform
            ? PLATFORMS.filter((t) => t.value == currentGem.platform)[0]
            : PLATFORMS[0]
    )

    useEffect(() => {
        const fetchImdbDetails = async () => {
          try {
            const imdbDetails = await window.chrome?.storage?.sync.get(["CT_IMDB_DETAILS"]);
            setImdbDetails(imdbDetails.CT_IMDB_DETAILS)
          } catch (error) {
            console.error('Error fetching IMDB details:', error);
          }
        };
    
        fetchImdbDetails();    
    }, []);

    const onPlatformChange = (e) => {
        setSelectedPlatform(PLATFORMS.filter(platform => platform.value === e)[0])
        setShowPlatform(false);
    }
    const [socialObj, setSocialObj] = useState({});

    const [details,setDetails] = useState(null)
    useEffect(() => {
        if(currentParentDetails){
            const data = currentParentDetails()
            setDetails(data)
        }
    },[currentParentDetails])

    useEffect(() => {
        const fetchStorageData = () => {
          window.chrome.storage.local.get(["twitterObj", "socialObject"], (data) => {
            if (data?.twitterObj?.tweet) {
              setSocialObj(data?.twitterObj?.tweet);
              window.chrome.storage.local.remove("twitterObj");
            } else if (data?.socialObject?.post) {
              setSocialObj(data?.socialObject?.post);
              setSelectedPlatform(
                PLATFORMS.filter(
                  (platform) => platform.value === data?.socialObject?.post.platform
                )[0]
              );
              window.chrome.storage.local.remove("socialObject");
            }
          });
        };
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get("refreshed") === "true") {
            fetchStorageData();
            setIsParserCall(false)
            return;
        }
        if (queryParams.get("imdb") === "true") {
            setIsParserCall(true)
            setSelectedPlatform(
                PLATFORMS.filter(
                  (platform) => platform.value === 'Imdb'
                )[0]
              )
        }else{
            setIsParserCall(false)
        }
        // fetchStorageData();
    }, [location]);

    const onSubmitBookmark = async (obj) => {
        const mediaCovers  = currentGem?.metaData?.covers ? [ obj.imageUrl, ...currentGem?.metaData?.covers ] : obj.covers && obj.covers.length !== 0 ? obj.covers : [obj.imageUrl]
        const finalCovers  = removeDuplicates(mediaCovers)
        let finalObj = {
            title: obj.heading,
            description: obj.description,
            expander: obj.shortUrlObj,
            media_type: typeof obj.selectedType === "object" ? obj.selectedType?.name : obj.selectedType,
            author: session.userId ? parseInt(session.userId) : null,
            url: obj.assetUrl,
            media: {
              covers: finalCovers
            },
            metaData: {
              type: typeof obj.selectedType === "object" ? obj.selectedType?.name : obj.selectedType,
              title: obj.heading,
              icon: obj?.favIconImage || "",
              defaultIcon: obj?.defaultFavIconImage || '',
              url: obj.assetUrl,
              covers: finalCovers,
              docImages: obj.docImages,
              defaultThumbnail: obj?.defaultThumbnailImg || null,
            },
            // socialfeed_obj:{
            //     imdbdetails
            // },
            platform: selectedPlatform?.value
              ? selectedPlatform?.value
              : socialObj?.platform,
            socialfeed_obj: imdbdetails || socialObj?.socialfeed_obj || obj?.socialfeed_obj,
            collection_gems: obj.selectedCollection.id,
            remarks: obj.remarks,
            tags: obj.selectedTags?.map((t) => { return t.id }),
            is_favourite: obj.favorite,
            showThumbnail: obj?.showThumbnail
        }
        setProcessing(true)
        let isSingleBkShared = null
        let isSelectedCollectionShared = null
        let isCurrentCollectionShared = null

        if (currentGem) {
            isSingleBkShared = getBookmarkPermissions(sharedCollections,currentGem.id)
            isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,obj.selectedCollection.id)
            isCurrentCollectionShared = getAllLevelCollectionPermissions(sharedCollections,currentGem?.collection_id || currentGem?.parent?.id)
            if(isSingleBkShared && !isSelectedCollectionShared){
                message.error(TEXT_MESSAGE.SHARED_COLLECTION_GEM_ERROR_TEXT)
                setProcessing(false)
                return;
            }
            const isCollectionChanged = currentGem?.parent.id !== obj.selectedCollection.id;
            const o = {
                ...finalObj,
                tags: obj.selectedTags
            }
            if (isCollectionChanged) {
                o["collection_id"] = obj.selectedCollection.id
                o["collection_gems"] = obj.selectedCollection
            }
            if(isSelectedCollectionShared){
                finalObj ={
                    ...finalObj,
                    author: isSelectedCollectionShared?.data?.author?.id
                }
                await dispatch(updateGem(currentGem?.id, { data: finalObj }))
                dispatch(removeGemFromCollection(currentGem.id || '', currentGem?.parent?.id || '',isCurrentCollectionShared))
                dispatch(moveGemToSharedCollection(obj.selectedCollection.id,currentGem.id,(currentGem) ? { ...currentGem, ...o } : finalObj))
                setProcessing(false)
                return navigate("/search-bookmark")
            }
            await dispatch(updateGem(currentGem?.id, { data: finalObj }))
            dispatch(updateBookmarkWithExistingCollection((currentGem) ? { ...currentGem, ...o } : finalObj, obj.selectedCollection, isCollectionChanged, "update", currentGem?.parent))
            setProcessing(false)
            return navigate("/search-bookmark")
        }
        isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,obj.selectedCollection.id)
        if(isSelectedCollectionShared){
                finalObj ={
                    ...finalObj,
                    author: isSelectedCollectionShared?.data?.author?.id
                }
        }
        const gemRes      = await dispatch(addGem({ data: finalObj }))
        if (gemRes.error === undefined && gemRes.payload.error === undefined) {
            const { data } = gemRes.payload
            if (data.data) {
                const d      = data.data;
                // const gTags  = d.tags.map((t) => { return { id: t.id, tag: t.tag }})
                const g      = {
                    id: d.id,
                    title: d.title,
                    media: d.media,
                    media_type: d.media_type,
                    url: d.url,
                    remarks: d.remarks,
                    metaData: d.metaData,
                    description: d.description,
                    S3_link: d.S3_link,
                    is_favourite: d.is_favourite,
                    collection_id: obj.selectedCollection.id,
                    tags: obj.selectedTags,
                    showThumbnail: d?.showThumbnail
                }
                if(isSelectedCollectionShared){
                    dispatch(addGemToSharedCollection(obj.selectedCollection.id,g))
                    setProcessing(false)
                    return navigate("/search-bookmark")
                }
                dispatch(updateBookmarkWithExistingCollection(g, obj.selectedCollection, false, "add", null))
            }
        }
        setProcessing(false)
        return navigate("/search-bookmark")
    }

     const handleUpdateInformation = (gemObj) => {
        setDetails({...details,...gemObj})
    }

    const handleUploadInformation = (obj) => {
        setSelectedPlatform({value: obj})
    }
    
    return (
        <OperationLayout 
            currentGem={currentGem}
            processing={processing}
            onButtonClick={onSubmitBookmark}
            pageTitle={currentGem ? "Update profile" : "Add new profile"}
            isHideBackButton={false}
            isHideHeader={props.isHideHeader || false}
            mediaType={"Profile"}
            onPanelClose={panelClose}
            socialObj={socialObj}
            setCurrentDetailsFunc={(parentFunc) => { currentParentDetails = parentFunc }}
            getUpdateInformation = {handleUpdateInformation}
            getUploadInformation = {handleUploadInformation}
            onOpenDialog={(parentFunc) => { openImg = parentFunc}}
            isParserCall={isParserCall}
        >

            <div className="gradient-add-bookmark-profile-div flex h-[200px] items-center justify-center border border-solid border-[#97A0B5] rounded-md relative">
                  <Avatar
                        icon={
                            <img
                            src={details?.imageUrl || `${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`}
                            alt={details?.title || details?.description || ""} 
                            onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src=`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`
                            }}
                            />
                        }
                        className="cursor-pointer h-20 w-20 md:h-28 md:w-28 border border-solid border-[#ABB7C9] mb-1"
                    />
                    <div className='cursor-pointer rounded-full bg-[#347AE2] p-1 absolute right-[40%] z-100 bottom-[30%]'
                    onClick={() => openImg("thumbnail")}
                    style={{zIndex:100}}
                    >
                        <PiPencilSimple className="text-white h-3 w-3 aspect-square"/>
                    </div>
            </div>
            {/* <div className="pt-4">
                <div className="flex-1">
                    <h6 className="block text-xs font-medium text-gray-500 mb-1">
                        Platform
                    </h6>
                    <div className="ct-relative">
                        <div className="w-full">
                            <ComboBoxSelect
                                inputShown={showPlatform}
                                hideInput={(e) => setShowPlatform(e)}
                                tweetData={PLATFORMS}
                                onTweetChange={onPlatformChange}
                                selectedTweet={selectedPlatform}
                                error={false}
                            />
                        </div>
                    </div>
                </div>
            </div> */}
        </OperationLayout>
    )
}

export default ProfileGemPage