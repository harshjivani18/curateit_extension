import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Spin } from "antd";

import ImageHighlight from "./ImageHighlight";
import TextHighlight from "./TextHighlight";
import CodeHighlight from "./CodeHighlight";
import { fetchCurrentTab } from "../../utils/fetch-current-tab";

import { addHighlight, getAllTypeHighlights } from "../../actions/highlights";
import { useNavigate } from "react-router-dom";
import session from "../../utils/session";
import { setCurrentGem } from "../../actions/gem";
import NoteHighlight from "./NoteHighlight";
import Loadingscreen from "../../components/Loadingscreen/Loadingscreen";
import { getBookmarksByMediaType } from "../../actions/collection";

const AllHighlights = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [trackMouse, setTrackMouse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const allHighlights = useSelector(
    (state) => state.highlights.allTypeHighlights
  );
  const tabDetails = useSelector((state) => state.app.tab);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [sendComment, setSendComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [optionSelected, setOptionSelected] = useState("highlights");
  const [allNotes, setAllNotes] = useState([]);
  const [page, setPerPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (allHighlights.length === 0) {
      if (tabDetails) {
        updateAllHighlights(
          tabDetails.url && tabDetails.url.endsWith("/")
            ? tabDetails.url?.slice(0, -1)
            : tabDetails.url
        );
      } else {
        fetchCurrentTab().then((res) => {
          updateAllHighlights(
            res.url && res.url.endsWith("/") ? res.url?.slice(0, -1) : res.url
          );
        });
      }
    }
  }, []);

  useEffect(() => {
    const getCall = async () => {
      if (page === 1) {
        setIsProcessing(true);
      } else {
        setIsProcessing(false);
      }
      setLoading(true);
      const res = await dispatch(getBookmarksByMediaType("Note", page));
      setAllNotes((prevData) => [
        ...prevData,
        ...(res?.payload?.data?.message || []),
      ]);
      if (
        res?.payload?.data?.totalCount <=
        allNotes.length + res?.payload?.data?.message?.length
      ) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      setLoading(false);
      setIsProcessing(false);
    };

    getCall();
  }, [page]);

  const removeDeleteNote = (obj) => {
    const filtered = allNotes?.filter(item => item?.id !== obj?.id)
    setAllNotes(filtered)
  }

  const onAddNoteClick = () => {
    dispatch(setCurrentGem(null))
    navigate("/note")
  }

  const updateAllHighlights = (url) => {
    setIsLoading(true);
    dispatch(getAllTypeHighlights(url)).then((res) => {
      setIsLoading(false);
    });
  };

  const handleComments = async () => {
    // TODO : Send Message to Content Script for creating the Comment
    const tab = await fetchCurrentTab();
    window.chrome.tabs.sendMessage(tab.id, {
      type: "ADD_FLOATING_COMMENT",
    });
  };

  const renderHighlightDetails = (obj) => {
    switch (obj.media_type) {
      case "Code":
        return <CodeHighlight obj={obj} editorClass={"w-full"} />;
      case "Image":
      case "Screenshot":
        return <ImageHighlight obj={obj} />;
      case "Highlight":
      // case "Note":
      case "Quote":
        return (
          <TextHighlight
            obj={obj}
            allHighlights={allHighlights}
            allHighlightPage={true}
          />
        );
      case "Note":
        return <NoteHighlight item={obj} />;
      default:
        return null;
    }
  };

  const renderLoader = () => {
    return (
      <div className="flex justify-center align-center pt-4">
        <Spin tip="Loading..." />
      </div>
    );
  };

  const renderAllTab = () => {
    return (
      <>
        {allHighlights.length === 0 ? (
          <h4 className="text-center mt-4">
            There are no highlights for this page.
          </h4>
        ) : (
          allHighlights.map((o) => {
            return renderHighlightDetails(o);
          })
        )}
      </>
    );
  }

  const renderNotesTab = () => {
    return (
      <>
        {isProcessing && <Loadingscreen showSpin={isProcessing} />}
        {allNotes.length === 0 && !isProcessing && (
          <div className="text-center py-10 mt-10">
            <div className="ct-relative mt-2">
              <img
                className="h-50 w-50 my-0 mx-auto"
                src="/icons/upload-error.svg"
                alt="Cloud ellipse icons"
              />
              <div className="absolute top-[85px] left-0 justify-center w-full text-xs text-gray-400">
                No data! Please add notes
              </div>
            </div>
          </div>
        )}
        {allNotes?.length > 0 &&
          !isProcessing &&
          allNotes.map((o) => {
            return (
              <NoteHighlight item={o} removeDeleteNote={removeDeleteNote} />
            );
          })}
        {!isProcessing && hasMore && allNotes?.length> 20 &&(
          <div className="my-2">
            <Button
              onClick={() => setPerPage(page + 1)}
              disabled={loading}
              size="small"
              type="link"
              className="!text-[#347AE2] hover:[#347AE2]"
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </>
    );
  }

  const renderHighlights = () => {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center font-semibold">
          <div className="w-fit flex p-1 rounded-md bg-[#F8FAFB] cursor-pointer items-center justify-between">
            <div
              className={`shareInviteBtn ${
                optionSelected === "highlights"
                  ? "rounded shadow border-[0.4px] border-solid border-[#78A6EC] bg-white"
                  : ""
              } w-fit`}
              onClick={() => {
                setOptionSelected("highlights");
              }}
            >
              <div
                className={`${
                  optionSelected === "highlights"
                    ? "text-[#347AE2]"
                    : "text-[#74778B]"
                } font-medium text-sm`}
              >
                Highlights
              </div>
            </div>

            <div
              className={`shareInviteBtn ${
                optionSelected === "note"
                  ? "rounded shadow border-[0.4px] border-solid border-[#78A6EC] bg-white"
                  : ""
              } w-fit`}
              onClick={() => setOptionSelected("note")}
            >
              <div
                className={`font-medium text-sm ${
                  optionSelected === "note"
                    ? "text-[#347AE2]"
                    : "text-[#74778B]"
                }`}
              >
                Note
              </div>
            </div>
          </div>
          <div className="p-[0.4rem] rounded-md outline outline-blue-500">
            <button className="text-[#347AE2]" onClick={onAddNoteClick}>
              + Add note
            </button>
          </div>
          {/* <div className="p-[0.4rem] rounded-md outline outline-blue-500">
            <button className="text-[#347AE2]" onClick={() => handleComments()}>
              + Add Comments
            </button>
          </div> */}
        </div>
        {/* {renderCommentBox()} */}
        {optionSelected === "highlights" && <>{renderAllTab()}</>}
        {optionSelected === "note" && <>{renderNotesTab()}</>}
      </div>
    );
  };

  return isLoading ? renderLoader() : renderHighlights();
};

export default AllHighlights;
