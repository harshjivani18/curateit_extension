import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { message, Button } from "antd";

import OperationLayout from "../../components/layouts/OperationLayout";
import { panelClose, copyText } from "../../utils/message-operations";
import { removeDuplicates } from "../../utils/equalChecks";

import { createAudio, updateAudio } from "../../actions/audios/index";
import {
  addGemToSharedCollection,
  moveGemToSharedCollection,
  removeGemFromCollection,
  updateBookmarkWithExistingCollection,
} from "../../actions/collection";
import {
  getAllLevelCollectionPermissions,
  getBookmarkPermissions,
} from "../../utils/find-collection-id";
import { TEXT_MESSAGE } from "../../utils/constants";
import { fetchCurrentTab } from "../../utils/fetch-current-tab";
import TranslatorComponent from "../../components/audioTranscript/TranslatorComponent";

let currentParentDetails            = null;

const AudioPage = (props) => {
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const navigate = useNavigate();
  const currentGem = useSelector((state) => state.gem.currentGem);
  const tabDetails = useSelector((state) => state.app.tab);
  const sharedCollections = useSelector(
    (state) => state.collection.sharedCollections
  );
  const [audioFile, setAudioFile] = useState(null);
  const [audioSrc, setAudioSrc] = useState(
    currentGem && currentGem.S3_link && currentGem.S3_link.length !== 0 ? currentGem.S3_link[0] : currentGem?.media?.audioLink ? currentGem.media.audioLink : ""
  );
  const [processing, setProcessing] = useState(false);
  const [audioTitle, setAudioTitle] = useState("");
  const [fileType, setfileType] = useState(
    currentGem && currentGem?.fileType ? currentGem?.fileType : "url"
  );
  // audio type state
  const [audioRecordSrc, setAudioRecordSrc] = useState("");
  const [audioOriginalText, setAudioOriginalText] = useState(currentGem?.title || "");

  const [details,setDetails] = useState(null)
    useEffect(() => {
        if(currentParentDetails){
            const data = currentParentDetails()
            setDetails(data)
        }
    },[currentParentDetails])

  const updateFileType = (type) => {
    // if (type === "file") {
    //   setAudioSrc("");
    // }
    setfileType(type);
  };

  // useEffect(() => {
  //   const getCall = async () => {
  //     const currentTab = tabDetails || (await fetchCurrentTab());
  //     if (fileType === "url") {
  //       setAudioSrc(currentTab.url);
  //     }
  //   };
  //   getCall();
  // }, []);

  const onSubmitBookmark = async (obj) => {
    if (
      !currentGem &&
      (!audioFile || audioSrc === "" || !fileRef) &&
      obj?.fileType &&
      obj?.fileType === "file"
    ) {
      message.error("Please upload a valid audio file!");
      return;
    }

    setProcessing(true);
    const mediaCovers = currentGem?.metaData?.covers
      ? [obj.imageUrl, ...currentGem?.metaData?.covers]
      : obj.covers && obj.covers.length !== 0
      ? obj.covers
      : [obj.imageUrl];
    const finalCovers = removeDuplicates(mediaCovers);
    let isSingleBkShared = null;
    let isSelectedCollectionShared = null;
    let isCurrentCollectionShared = null;
    if (currentGem) {
      isSingleBkShared = getBookmarkPermissions(
        sharedCollections,
        currentGem.id
      );
      isSelectedCollectionShared = getAllLevelCollectionPermissions(
        sharedCollections,
        obj.selectedCollection.id
      );
      isCurrentCollectionShared = getAllLevelCollectionPermissions(
        sharedCollections,
        currentGem?.collection_id || currentGem?.parent?.id
      );
      let payload = {
        url:
          obj.assetUrl && obj.assetUrl.endsWith("/")
            ? obj.assetUrl?.slice(0, -1)
            : obj.assetUrl,
        title: obj.heading,
        description: obj.description,
        expander: obj.shortUrlObj,
        tags: obj.selectedTags.map((o) => {
          return o.id;
        }),
        collections: obj.selectedCollection.id,
        is_favourite: obj.favorite,
        notes: obj.remarks,
        metaData: {
          covers: finalCovers,
          icon: obj?.favIconImage || "",
          docImages: obj.docImages,
          defaultThumbnail: obj?.defaultThumbnailImg || null,
          defaultIcon: obj?.defaultFavIconImage || "",
        },
        showThumbnail: obj?.showThumbnail,
        fileType: obj?.fileType,
        html:obj?.html
      };

      if (isSingleBkShared && !isSelectedCollectionShared) {
        message.error(TEXT_MESSAGE.SHARED_COLLECTION_GEM_ERROR_TEXT);
        setProcessing(false);
        return;
      }
      if (isSelectedCollectionShared) {
        payload = {
          ...payload,
          author: isSelectedCollectionShared?.data?.author?.id,
        };
      }

      const audioUpdateRes = await dispatch(
        updateAudio(payload, currentGem.id)
      );
      if (
        audioUpdateRes.error === undefined &&
        audioUpdateRes.payload?.error === undefined &&
        audioUpdateRes.payload
      ) {
        const { data } = audioUpdateRes.payload;
        if (data) {
          const isCollectionChanged =
            currentGem?.parent.id !== obj.selectedCollection.id;
          const o = {
            ...data,
            tags: obj.selectedTags,
          };
          if (isCollectionChanged) {
            o["collection_id"] = obj.selectedCollection.id;
            o["collection_gems"] = obj.selectedCollection;
          }
          if (isSelectedCollectionShared) {
            dispatch(
              removeGemFromCollection(
                currentGem.id || "",
                currentGem?.parent?.id || "",
                isCurrentCollectionShared
              )
            );
            dispatch(
              moveGemToSharedCollection(
                obj.selectedCollection.id,
                currentGem.id,
                currentGem ? { ...currentGem, ...o } : data
              )
            );
            setProcessing(false);
            return navigate("/search-bookmark");
          }

          dispatch(
            updateBookmarkWithExistingCollection(
              currentGem ? { ...currentGem, ...o } : data,
              obj.selectedCollection,
              isCollectionChanged,
              "update",
              currentGem?.parent
            )
          );
        }
      }
    } else {
      const formData = new FormData();
      formData.append(
        "files",
        fileType !== "file" && fileType !== "url" ? audioRecordSrc : audioFile
      );
      formData.append(
        "title",
        fileType !== "file" && fileType !== "url"
          ? audioOriginalText
          : obj.heading
      );
      formData.append("description", obj.description);
      formData.append("expander", obj.shortUrlObj);
      formData.append(
        "metaData",
        JSON.stringify({
          covers: finalCovers,
          icon: obj?.favIconImage || null,
          defaultIcon: obj?.defaultFavIconImage || "",
          docImages: obj?.docImages,
          defaultThumbnail: obj?.defaultThumbnailImg || ''
        })
      );
      formData.append(
        "url",
        obj.assetUrl && obj.assetUrl.endsWith("/")
          ? obj.assetUrl?.slice(0, -1)
          : obj.assetUrl
      );
      formData.append(
        "tags",
        JSON.stringify(
          obj.selectedTags.map((t) => {
            return t.id;
          })
        )
      );
      formData.append("notes", obj.remarks);
      formData.append("is_favourite", obj.favorite);
      formData.append("collections", obj.selectedCollection.id);
      formData.append("showThumbnail", obj.showThumbnail);
      formData.append("fileType", obj?.fileType);
      formData.append(
        "media",
        JSON.stringify({
          html: obj?.html,
        })
      );
      if (isSelectedCollectionShared) {
        formData.append("author", isSelectedCollectionShared?.data?.author?.id);
      }

      const audio = await dispatch(createAudio(formData));
      if (
        audio.error === undefined &&
        audio.payload &&
        audio.payload.error === undefined
      ) {
        const { data } = audio.payload;
        if (data) {
          if (isSelectedCollectionShared) {
            dispatch(addGemToSharedCollection(obj.selectedCollection.id, data));
            setAudioFile(null);
            setAudioSrc("");
            setProcessing(false);
            return navigate("/search-bookmark");
          }
          dispatch(
            updateBookmarkWithExistingCollection(
              data,
              obj.selectedCollection,
              false,
              "add",
              null
            )
          );
        }
      }
    }

    setAudioFile(null);
    setAudioSrc("");
    navigate("/search-bookmark");
  };

  const onDownloadAudio = () => {
    if (audioSrc) {
      const link = document.createElement("a");
      link.href = audioSrc;
      link.download = audioSrc;

      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    }
  };

  const onCopyAudioLink = () => {
    try {
      copyText(audioSrc);
      message.success("Audio Linked Copied to clipboard");
    } catch (err) {
      message.error("Not have permission");
    }
  };

  const onFileChange = (e) => {
    const { files } = e.target;
    const file = files[0];
    const filePath = file.name;
    const allowedExtensions = /(\.mp3|\.3gp|\.aac|\.ogg|\.opus|\.webm|\.wav)$/i;
    if (!allowedExtensions.exec(filePath)) {
      message.error("File is not supported");
      return;
    }
    const fileSize = file.size / 1024 / 1024; // Convert to MB
    if (fileSize > 25) {
      message.error("File size must be less than 25MB");
      setAudioFile(null);
      return;
    }
    setAudioFile(file);
    setAudioSrc(URL.createObjectURL(file));
    const nameArr = filePath.split(".");
    nameArr.splice(-1);
    setAudioTitle(nameArr.join("."));
  };

  const onUploadFileClick = () => {
    if (fileRef) {
      fileRef.current.click();
    }
  };

  const renderFileUpload = () => {
    return (
      <>
        <input
          type={"file"}
          className={"d-none"}
          onChange={onFileChange}
          ref={fileRef}
          accept="audio/*"
        />
        <Button onClick={onUploadFileClick}>Upload Audio!</Button>
      </>
    );
  };

  const handleUpdateInformation = (gemObj) => {
        setDetails({...details,...gemObj})
    }

    const handleUploadInformation = (obj) => {
        setAudioFile(obj.audioFile)
        setAudioSrc(obj.audioSrc)
    }

  return (
    <OperationLayout
      currentGem={currentGem}
      processing={processing}
      onButtonClick={onSubmitBookmark}
      pageTitle={currentGem ? "Update Audio" : "Save Audio"}
      isHideBackButton={false}
      mediaType={"Audio"}
      onPanelClose={panelClose}
      title={audioTitle}
      updateFileType={updateFileType}
      setCurrentDetailsFunc={(parentFunc) => { currentParentDetails = parentFunc }}
      getUpdateInformation = {handleUpdateInformation}
      getUploadInformation = {handleUploadInformation}
    > 

      {fileType === 'record' && (
        <div className="pt-4">
          <TranslatorComponent
            audioRecordSrc={audioRecordSrc}
            setAudioRecordSrc={setAudioRecordSrc}
            showAudioTag={true}
            setAudioOriginalText={setAudioOriginalText}
            audioOriginalText={audioOriginalText}
            onDownloadAudio={onDownloadAudio}
            showRecorder={!currentGem}
          />
        </div>
      )}
      {
      (audioSrc && fileType === 'record' && currentGem) &&
      <div className="px-1 md:px-2 flex items-center justify-center h-[100px]">
          <audio src={audioSrc} autoPlay={false} controls>
              <source src={audioSrc} />
          </audio>
      </div>
      }

      {
        fileType === 'url' && details?.imageUrl &&
        <img src={details?.imageUrl}
              alt={details?.title || details?.description || ""} 
              className='w-full object-cover block h-[200px] rounded-lg'
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src=`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`
            }}
        />
      }

      {
      fileType === 'file' && audioSrc &&
      <div className="px-1 md:px-2 flex items-center justify-center h-[100px]">
          <audio src={audioSrc} autoPlay={false} controls>
              <source src={audioSrc} />
          </audio>
      </div>
      }

      {/* {(fileType === "file" || fileType === "url" || fileType === "record") && (
        <div className="pt-4">
          <div className="image-header">
            {(fileType === "file" || fileType === "url" || fileType === "record") && (
              <h6 className="block text-xs font-medium text-gray-500 mb-1">
                Audio
              </h6>
            )}
            {audioSrc !== "" && (
              <svg
                onClick={onDownloadAudio}
                className="dwldSvg"
                title="Download"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M3 19h18v2H3v-2zm10-5.828L19.071 7.1l1.414 1.414L12 17 3.515 8.515 4.929 7.1 11 13.17V2h2v11.172z" />
              </svg>
            )}
            
            {audioSrc !== "" && (fileType === "file" || fileType === "url" || fileType === "record") && (
              <svg
                onClick={onCopyAudioLink}
                className="linkSvg"
                title="Copy Text"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M13.06 8.11l1.415 1.415a7 7 0 0 1 0 9.9l-.354.353a7 7 0 0 1-9.9-9.9l1.415 1.415a5 5 0 1 0 7.071 7.071l.354-.354a5 5 0 0 0 0-7.07l-1.415-1.415 1.415-1.414zm6.718 6.011l-1.414-1.414a5 5 0 1 0-7.071-7.071l-.354.354a5 5 0 0 0 0 7.07l1.415 1.415-1.415 1.414-1.414-1.414a7 7 0 0 1 0-9.9l.354-.353a7 7 0 0 1 9.9 9.9z" />
              </svg>
            )}
          </div>
          <div className="bg-[#F8FBFF] rounded-t-[16px] imgWrapperContainer">
            <div>
              {audioSrc ? (
                <audio src={audioSrc} autoPlay={false} controls>
                  <source src={audioSrc} />
                </audio>
              ) : fileType === "file" ? (
                renderFileUpload()
              ) : null}
            </div>
          </div>
        </div>
      )} */}
    </OperationLayout>
  );
};

export default AudioPage;
