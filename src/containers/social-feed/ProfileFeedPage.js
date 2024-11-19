import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import OperationLayout from "../../components/layouts/OperationLayout";
import session from "../../utils/session";
import { panelClose } from "../../utils/message-operations";

import { addGemToSharedCollection, moveGemToSharedCollection, removeGemFromCollection, updateBookmarkWithExistingCollection } from "../../actions/collection";
import { addGem, updateGem } from "../../actions/gems";
import { removeDuplicates } from "../../utils/equalChecks";
import { useEffect } from "react";
import { FolderIcon, FolderOpenIcon } from "@heroicons/react/24/outline";
import {
  RiGithubLine,
  RiLinkedinFill,
  RiMediumLine,
  RiProductHuntLine,
  RiRedditLine,
  RiTwitterLine,
  RiInstagramLine,
  RiYoutubeLine,
  RiPinterestFill,
} from "react-icons/ri";
import { DiHackernews } from "react-icons/di";
import ComboBoxSelect from "../../components/combobox/ComboBoxSelect";
import {
  FaQuora,
  FaAppStore,
  FaProductHunt,
  FaGoodreads,
  FaShopify,
  FaAmazon,
  FaYelp,
} from "react-icons/fa";
import { BsGoogle, BsApple } from "react-icons/bs";
import { IoLogoGooglePlaystore } from "react-icons/io5";
import { getAllLevelCollectionPermissions, getBookmarkPermissions } from "../../utils/find-collection-id";
import { message } from "antd";
import { TEXT_MESSAGE } from "../../utils/constants";
import { PiNeedleBold } from "react-icons/pi";

const TWEETTYPE = [
  {
    id: 1,
    name: "Post",
    value: "SavedToCurateit",
    icon: <FolderIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <FolderIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <FolderOpenIcon
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 2,
    name: "Bookmark",
    value: "Bookmark",
    icon: <FolderIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <FolderIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <FolderOpenIcon
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 3,
    name: "Like",
    value: "Like",
    icon: <FolderIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <FolderIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <FolderOpenIcon
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 4,
    name: "Saved Post",
    value: "SavedPost",
    icon: <FolderIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <FolderIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <FolderOpenIcon
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 5,
    name: "Upvoted",
    value: "Upvoted",
    icon: <FolderIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <FolderIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <FolderOpenIcon
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 6,
    name: "Star",
    value: "Star",
    icon: <FolderIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <FolderIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <FolderOpenIcon
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 7,
    name: "Pin",
    value: "Pin",
    icon: <PiNeedleBold className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <PiNeedleBold className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <PiNeedleBold
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
];

const PLATFORMS = [
  {
    id: 1,
    name: "Twitter",
    value: "Twitter",
    icon: (
      <RiTwitterLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectOptionIcon: (
      <RiTwitterLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <RiTwitterLine
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 2,
    name: "LinkedIn",
    value: "LinkedIn",
    icon: (
      <RiLinkedinFill className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectOptionIcon: (
      <RiLinkedinFill className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <RiLinkedinFill
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 3,
    name: "Reddit",
    value: "Reddit",
    icon: <RiRedditLine className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <RiRedditLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <RiRedditLine
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 4,
    name: "Producthunt",
    value: "Producthunt",
    icon: (
      <RiProductHuntLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectOptionIcon: (
      <RiProductHuntLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <RiProductHuntLine
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 5,
    name: "Medium",
    value: "Medium",
    icon: <RiMediumLine className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <RiMediumLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <RiMediumLine
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 6,
    name: "Hacker News",
    value: "Hacker News",
    icon: <DiHackernews className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <DiHackernews className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <DiHackernews
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 7,
    name: "Github",
    value: "Github",
    icon: <RiGithubLine className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <RiGithubLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <RiGithubLine
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 8,
    name: "Tiktok",
    value: "Tiktok",
    icon: (
      <img
        src="/icons/tiktok.svg"
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectOptionIcon: (
      <img
        src="/icons/tiktok.svg"
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectedIcon: (
      <img
        src="/icons/tiktok.svg"
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 9,
    name: "Instagram",
    value: "Instagram",
    icon: (
      <RiInstagramLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectOptionIcon: (
      <RiInstagramLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <RiInstagramLine
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 10,
    name: "YouTube",
    value: "YouTube",
    icon: (
      <RiYoutubeLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectOptionIcon: (
      <RiYoutubeLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <RiYoutubeLine
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 11,
    name: "Quora",
    value: "Quora",
    icon: <FaQuora className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <FaQuora className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <FaQuora
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 12,
    name: "PlayStore",
    value: "PlayStore",
    icon: (
      <IoLogoGooglePlaystore
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectOptionIcon: (
      <IoLogoGooglePlaystore
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectedIcon: (
      <IoLogoGooglePlaystore
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 13,
    name: "AppStore",
    value: "AppStore",
    icon: <FaAppStore className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <FaAppStore className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <FaAppStore
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 14,
    name: "G2",
    value: "G2",
    icon: (
      <img
        src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/g2.png`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectOptionIcon: (
      <img
        src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/g2.png`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectedIcon: (
      <img
        src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/g2.png`}
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 15,
    name: "Pinterest",
    value: "Pinterest",
    icon: (
      <RiPinterestFill className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectOptionIcon: (
      <RiPinterestFill className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <RiPinterestFill
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 16,
    name: "Capterra",
    value: "Capterra",
    icon: (
      <img
        src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/capterra.png`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectOptionIcon: (
      <img
        src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/capterra.png`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectedIcon: (
      <img
        src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/capterra.png`}
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 17,
    name: "Trustpilot",
    value: "Trustpilot",
    icon: (
      <img
        src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/trustpilot.svg`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectOptionIcon: (
      <img
        src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/trustpilot.svg`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectedIcon: (
      <img
        src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/trustpilot.svg`}
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 18,
    name: "Google",
    value: "Google",
    icon: <BsGoogle className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <BsGoogle className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <BsGoogle
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 19,
    name: "ProductHunt",
    value: "ProductHunt",
    icon: (
      <FaProductHunt className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectOptionIcon: (
      <FaProductHunt className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <FaProductHunt
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 20,
    name: "AppSumo",
    value: "AppSumo",
    icon: (
      <img
        src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/appsumo.webp`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectOptionIcon: (
      <img
        src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/appsumo.webp`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectedIcon: (
      <img
        src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/appsumo.webp`}
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 21,
    name: "Goodreads",
    value: "Goodreads",
    icon: <FaGoodreads className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <FaGoodreads className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <FaGoodreads
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 22,
    name: "TripAdvisor",
    value: "TripAdvisor",
    icon: (
      <img
        src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/tripadvisor.svg`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectOptionIcon: (
      <img
        src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/tripadvisor.svg`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectedIcon: (
      <img
        src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/tripadvisor.svg`}
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 23,
    name: "AppStore",
    value: "AppStore",
    icon: <BsApple className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <BsApple className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <BsApple
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 24,
    name: "Yelp",
    value: "Yelp",
    icon: <FaYelp className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <FaYelp className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <FaYelp
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 25,
    name: "Shopify",
    value: "Shopify",
    icon: <FaShopify className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <FaShopify className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <FaShopify
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 26,
    name: "Amazon",
    value: "Amazon",
    icon: <FaAmazon className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <FaAmazon className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <FaAmazon
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
];

const ProfileFeedPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentGem = useSelector((state) => state.gem.currentGem);
  const sharedCollections             = useSelector((state) => state.collection.sharedCollections)
  const [showTweetType, setShowTweetType] = useState(false);
  const [showPlatform, setShowPlatform] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedTweet, setSelectedTweet] = useState(
    currentGem && currentGem?.post_type
      ? TWEETTYPE.filter((t) => t.value == currentGem.post_type)[0]
      : TWEETTYPE[0]
  );
  const [selectedPlatform, setSelectedPlatform] = useState(
    currentGem && currentGem?.platform
      ? PLATFORMS.filter((t) => t.value == currentGem.platform)[0]
      : PLATFORMS[0]
  );
  const [socialObj, setSocialObj] = useState({});

  useEffect(() => {
    const fetchStorageData = () => {
      window.chrome.storage.sync.get(["twitterObj", "socialObject"], (data) => {
        if (data?.twitterObj?.tweet) {
          setSocialObj(data?.twitterObj?.tweet);
          
          window.chrome.storage.sync.remove("twitterObj");
        } else if (data?.socialObject?.post) {
          setSocialObj(data?.socialObject?.post);
          setSelectedPlatform(
            PLATFORMS.filter(
              (platform) => platform.value === data?.socialObject?.post.platform
            )[0]
          );
          window.chrome.storage.sync.remove("socialObject");
        }
      });
    };
    fetchStorageData();
  });

  const onSubmitBookmark = async (obj) => {
    const mediaCovers = currentGem?.metaData?.covers
      ? [obj.imageUrl, ...currentGem?.metaData?.covers]
      : obj.covers && obj.covers.length !== 0
      ? obj.covers
      : [obj.imageUrl];
    const finalCovers = removeDuplicates(mediaCovers);
    let finalObj = {
      title: obj.heading,
      description: obj.description,
      expander: obj.shortUrlObj,
      media_type:
        typeof obj.selectedType === "object"
          ? obj.selectedType?.name
          : obj.selectedType,
      author: session.userId ? parseInt(session.userId) : null,
      url: obj.assetUrl,
      media: {
        covers: finalCovers,
      },
      metaData: {
        type:
          typeof obj.selectedType === "object"
            ? obj.selectedType?.name
            : obj.selectedType,
        title: obj.heading,
        icon: obj?.favIconImage || null,
        url: obj.assetUrl,
        covers: finalCovers,
        docImages: obj.docImages,
        defaultIcon: obj?.defaultFavIconImage || null,
        defaultThumbnail: obj?.defaultThumbnailImg || null,
      },
      platform: selectedPlatform?.value
        ? selectedPlatform?.value
        : socialObj?.platform,
      post_type: selectedTweet?.value ? selectedTweet?.value : obj.post_type,
      socialfeed_obj: socialObj?.socialfeed_obj || obj?.socialfeed_obj,
      collection_gems: obj.selectedCollection.id,
      remarks: obj.remarks,
      tags: obj.selectedTags?.map((t) => {
        return t.id;
      }),
      is_favourite: obj.favorite,
      showThumbnail: obj?.showThumbnail,
    };
    setProcessing(true);
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
            const isCollectionChanged =
        currentGem?.parent.id !== obj.selectedCollection.id;
        const o = {
        ...finalObj,
        tags: obj.selectedTags,
      };
      if (isCollectionChanged) {
        o["collection_id"] = obj.selectedCollection.id;
        o["collection_gems"] = obj.selectedCollection;
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
      
      await dispatch(updateGem(currentGem?.id, { data: finalObj }));
      
      dispatch(
        updateBookmarkWithExistingCollection(
          currentGem ? { ...currentGem, ...o } : finalObj,
          obj.selectedCollection,
          isCollectionChanged,
          "update",
          currentGem?.parent
        )
      );
      setProcessing(false);
      return navigate("/search-bookmark");
    }
    isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,obj.selectedCollection.id)
        if(isSelectedCollectionShared){
                finalObj ={
                    ...finalObj,
                    author: isSelectedCollectionShared?.data?.author?.id
                }
        }
    const gemRes = await dispatch(addGem({ data: finalObj }));
    if (gemRes.error === undefined && gemRes.payload.error === undefined) {
      const { data } = gemRes.payload;
      if (data.data) {
        const d = data.data;
        const g = {
          ...d,
          id: d.id,
          title: d.title,
          media: d.media,
          media_type: d.media_type,
          url: d.url,
          remarks: d.remarks,
          metaData: d.metaData,
          post_type: d.post_type,
          platfrom: d.platfrom,
          description: d.description,
          S3_link: d.S3_link,
          is_favourite: d.is_favourite,
          collection_id: obj.selectedCollection.id,
          tags: obj.selectedTags,
          socialfeed_obj: d?.socialfeed_obj,
          showThumbnail: d?.showThumbnail,
        };
        if(isSelectedCollectionShared){
          dispatch(addGemToSharedCollection(obj.selectedCollection.id,g))
          setProcessing(false)
          return navigate("/search-bookmark")
        }
        dispatch(
          updateBookmarkWithExistingCollection(
            g,
            obj.selectedCollection,
            false,
            "add",
            null
          )
        );
      }
    }
    setProcessing(false);
    return navigate("/search-bookmark");
  };

  const onTweetChange = (e) => {
    setSelectedTweet(TWEETTYPE.filter((tweet) => tweet.value === e)[0]);
    setShowTweetType(false);
  };

  const onPlatformChange = (e) => {
    setSelectedPlatform(
      PLATFORMS.filter((platform) => platform.value === e)[0]
    );
    setShowPlatform(false);
    setSelectedTweet(null);
  };
  const getPostTypes = () => {
    if (
      selectedPlatform.name === "Producthunt" ||
      selectedPlatform.name === "LinkedIn" ||
      selectedPlatform.name === "Medium" ||
      selectedPlatform.name === "YouTube" ||
      selectedPlatform.name === "Quora" ||
      selectedPlatform.name === "Hacker News" ||
      selectedPlatform.name === "PlayStore" ||
      selectedPlatform.name === "AppStore" ||
      selectedPlatform.name === "G2" ||
      selectedPlatform.name === "Capterra" ||
      selectedPlatform.name === "Trustpilot" ||
      selectedPlatform.name === "Google" ||
      selectedPlatform.name === "ProductHunt" ||
      selectedPlatform.name === "AppSumo" ||
      selectedPlatform.name === "Goodreads" ||
      selectedPlatform.name === "TripAdvisor" ||
      selectedPlatform.name === "AppStore" ||
      selectedPlatform.name === "Yelp" ||
      selectedPlatform.name === "Shopify" ||
      selectedPlatform.name === "Amazon" 
    ) {
      return TWEETTYPE.filter((t) => {
        return t.name === "Post";
      });
    } else if (selectedPlatform.name === "Twitter") {
      return TWEETTYPE.filter((t) => {
        return t.name === "Post" || t.name === "Bookmark" || t.name === "Like";
      });
    } else if (selectedPlatform.name === "Reddit") {
      return TWEETTYPE.filter((t) => {
        return (
          t.name === "Saved Post" ||
          t.name === "Bookmark" ||
          t.name === "Upvoted"
        );
      });
    } else if (selectedPlatform.name === "Github") {
      return TWEETTYPE.filter((t) => {
        return t.name === "Star";
      });
    }
    else if (selectedPlatform.name === "Pinterest") {
      return TWEETTYPE.filter((t) => {
        return t.name === "Pin";
      });
    }
    return TWEETTYPE;
  };

  return (
    <OperationLayout
      currentGem={currentGem}
      processing={processing}
      onButtonClick={onSubmitBookmark}
      pageTitle={currentGem ? "Update feed" : "Add new feed"}
      isHideBackButton={false}
      isMenuItemEnabled={false}
      isScreenshotAdd={true}
      isFavouriteEnable={true}
      isAssetURLChangeable={currentGem ? false : true}
      onPanelClose={panelClose}
      mediaType={"Profile"}
      socialObj={socialObj}
    >
      <div className="pt-4">
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
      </div>
      <div className="pt-4">
        <div className="flex-1">
          <h6 className="block text-xs font-medium text-gray-500 mb-1">
            Post Type
          </h6>
          <div className="ct-relative">
            <div className="w-full">
              <ComboBoxSelect
                inputShown={showTweetType}
                hideInput={(e) => setShowTweetType(e)}
                // tweetData={TWEETTYPE}
                tweetData={getPostTypes()}
                onTweetChange={onTweetChange}
                selectedTweet={selectedTweet}
                error={false}
              />
            </div>
          </div>
        </div>
      </div>
    </OperationLayout>
  );
};

export default ProfileFeedPage;
