import "./HighlightActions.css";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  RiChat3Line,
  RiHeartLine,
  RiEdit2Line,
  RiDeleteBin2Line,
  RiShareForwardLine,
  RiLinksFill,
} from "react-icons/ri";
import { BsBookmarkPlus, BsThreeDotsVertical } from "react-icons/bs";
import { message, Popover } from "antd";

import Modal from "../../components/modal/Modal";

import { deleteGem, setCurrentGem, setCurrentMedia } from "../../actions/gem";
import { updateHighlightsArr } from "../../actions/highlights";
import { removeGemFromCollection } from "../../actions/collection";

const HighlightActions = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);

  const onEditHighlightClick = () => {
    dispatch(
      setCurrentGem({ ...props.obj, parent: props.obj.collection_gems })
    );
    dispatch(setCurrentMedia(props.media));
    if (
      props.obj.collection_gems &&
      props.obj.id &&
      props.obj.media_type === "Note"
    ) {
      navigate(`/note`, { replace: true });
    }
    else if (
      props.obj.collection_gems &&
      props.obj.id &&
      props.obj.media_type === "Highlight"
    ) {
      navigate(`/highlight-panel`, { replace: true });
    } else if (
      props.obj.collection_gems &&
      props.obj.id &&
      props.obj.media_type === "Code"
    ) {
      navigate(`/codesnippet-panel`, { replace: true });
    } else if (
      props.obj.collection_gems &&
      props.obj.id &&
      props.obj.media_type === "Image"
    ) {
      navigate(`/image-panel`, { replace: true });
    } else if (
      props.obj.collection_gems &&
      props.obj.id &&
      props.obj.media_type === "Audio"
    ) {
      navigate(`/audio-panel`, { replace: true });
    } else if (
      props.obj.collection_gems &&
      props.obj.id &&
      props.obj.media_type === "Video"
    ) {
      navigate(`/video-panel`, { replace: true });
    } else if (
      props.obj.collection_gems &&
      props.obj.id &&
      props.obj.media_type === "PDF"
    ) {
      navigate(`/pdf-highlight`, { replace: true });
    } else if (
      props.obj.collection_gems &&
      props.obj.id &&
      props.obj.media_type === "Article"
    ) {
      navigate(`/article`, { replace: true });
    } else if (
      props.obj.collection_gems &&
      props.obj.id &&
      props.obj.media_type === "App"
    ) {
      navigate(`/app-gem`, { replace: true });
    } else if (
      props.obj.collection_gems &&
      props.obj.id &&
      props.obj.media_type === "Product"
    ) {
      navigate(`/product`, { replace: true });
    } else if (
      props.obj.collection_gems &&
      props.obj.id &&
      props.obj.media_type === "Book"
    ) {
      navigate(`/book`, { replace: true });
    } else if (
      props.obj.collection_gems &&
      props.obj.id &&
      props.obj.media_type === "Movie"
    ) {
      navigate(`/movie`, { replace: true });
    } else if (
      props.obj.collection_gems &&
      props.obj.id &&
      props.obj.media_type === "Profile"
    ) {
      navigate(`/profile-gem`, { replace: true });
    } else if (
      props.obj.collection_gems &&
      props.obj.id &&
      props.obj.media_type === "Ai Prompt"
    ) {
      navigate(`/ai-prompt`, { replace: true });
    } else if (
      props.obj.collection_gems &&
      props.obj.id &&
      props.obj.media_type === "Text Expander" 
    ) {
      navigate(`/text`, { replace: true });
    } else if (
      props.obj.collection_gems &&
      props.obj.id &&
      props.obj.media_type === "Quote"
    ) {
      navigate(`/quote`, { replace: true });
    } else if (
      props.obj.collection_gems &&
      props.obj.id &&
      props.obj.media_type === "Screenshot"
    ) {
      navigate(`/screenshot`, { replace: true });
    } else if (
      props.obj.collection_gems &&
      props.obj.id &&
      props.obj.media_type === "SocialFeed"
    ) {
      navigate(`/social-feed`, { replace: true });
    }
  };

  const onDeleteHighlgihtClick = () => {
    setShowModal(true);
  };

  const onCancelDelete = () => {
    setShowModal(false);
  };

  const onDeleteHighlight = async () => {
    if (!props.obj || !props.obj.id || !props.obj.collection_gems) return;
    const { obj } = props;
    const res = await dispatch(deleteGem(obj.id, obj.collection_gems.id));
    setShowModal(false);
    if (res.error === undefined && res.payload.error === undefined) {
      message.success("Gem deleted successfully");
      props.onDeleteUpdates && props.onDeleteUpdates(obj);
      dispatch(updateHighlightsArr(obj, "delete"));
      dispatch(removeGemFromCollection(obj?.id, obj.collection_gems.id));
      return;
    }
    message.error("An error occured while processing your request.");
  };

  const renderPopoverActions = () => {
    return (
      <div className="popover-container">
        {props.isTextHighlight && (
          <button onClick={() => props.openLinkToHighlight()} className={"popover-btn"}>
            <RiLinksFill className="mr-2" />
            <span>{`Open highlight`}</span>
          </button>
        )}
        <button onClick={onEditHighlightClick} className={"popover-btn"}>
          <RiEdit2Line className="mr-2" />
          <span>{`Edit`}</span>
        </button>
        {/* <div className="popover-divider"></div> */}
        <button onClick={onDeleteHighlgihtClick} className={"popover-btn"}>
          <RiDeleteBin2Line className="mr-2" color="#C85C54" />
          <span className="red-text-clr">{`Delete`}</span>
        </button>
      </div>
    );
  };
  return (
    <div className="text-gray-500 flex justify-end items-center py-2 pr-1">
      {/* <div className='flex justify-start items-center gap-2 flex-1'>
                <div className='flex justify-start items-center gap-1 text-xs'>
                    <RiHeartLine className='w-4 h-4' />
                    <span>32</span>
                </div>
                <div className='flex justify-start items-center gap-1 text-xs'>
                    <RiChat3Line className='w-4 h-4' />
                    <span>32</span>
                </div>
                <div className='flex justify-start items-center gap-1 text-xs'>
                    <BsBookmarkPlus className='w-4 h-4' />
                    <span>32</span>
                </div>
            </div> */}
      <div className="flex justify-end items-center gap-2">
        {/* <div className='flex justify-start items-center gap-1 text-xs'>
                    <RiShareForwardLine className='w-4 h-4' />
                    <span>32</span>
                </div> */}
        <Popover placement="bottomLeft" content={renderPopoverActions()}>
          <button>
            <BsThreeDotsVertical className="h-4 w-4" />
          </button>
        </Popover>
      </div>
      {showModal && (
        <div className="fixed bottom-[60px] left-0 right-5  w-full p-2 bg-white border-t-[1px]">
          <Modal
            showOpen={showModal}
            deleteCollections={onDeleteHighlight}
            cancel={onCancelDelete}
            collectionName={props.obj?.title}
          />
        </div>
      )}
    </div>
  );
};

export default HighlightActions;
