import { CheckIcon, TrashIcon } from "@heroicons/react/24/outline";
import { HIGHLIGHTED_COLORS } from "../../utils/constants";
import { PaintBoardIcon } from "../../hugeicons/Stroke";
import { useRef, useState } from "react";
import HighlightActions from "./HighlightActions";
import { updateGem } from "../../actions/gem";
import { useDispatch } from "react-redux";
import { RiFileCopyLine } from "react-icons/ri";
import { copyText } from "../../utils/message-operations";
import { message } from "antd";
import { updateHighlightToGem } from "../../actions/highlights";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const NoteHighlight = ({ item, removeDeleteNote=()=>{}}) => {
  console.log("item in nite", item);
  const dispatch = useDispatch();
  // const highlightRef = useRef();
  const defaultColorObjIdx = HIGHLIGHTED_COLORS.findIndex((h) => {
    return h.id === 4;
  });
  // const [highlightedText, setHighlightedText] = useState(
  //   item?.media?.text || ""
  // );
  const [highlightedColor, setHighlightedColor] = useState(
    item?.media?.color || HIGHLIGHTED_COLORS[defaultColorObjIdx]
  );
  // const [highlightDetails, setHighlightDetails] = useState(
  //   item?.media?.details || null
  // );
  // const [highlightClass, setHighlightClass] = useState(
  //   item?.media?.styleClassName || ""
  // );
  // const [highlightBox, setHighlightBox] = useState(item?.media?.box || null);
  const [showColorOptions, setShowColorOptions] = useState(false);
  //
  // const onHighlightBlur = () => {
  //   if (highlightRef) {
  //     setHighlightedText(highlightRef.current.innerText);
  //   }
  // };

  const handleColorToggle = () => {
    setShowColorOptions(!showColorOptions);
  };

  const handleUpdateNoteColor = async (color, item) => {
    const media = {
      ...item.media,
      color: color,
      styleClassName: color.className,
    };

    setHighlightedColor(media?.color);
    setShowColorOptions(false);
    dispatch(updateHighlightToGem(item?.collection_gems?.id, item?.id, media));
    // updateHighlightToGem(item?.collection_gems?.id, item?.id, payload)
  };

  const onTextCopy = () => {
    try {
      copyText(item?.media?.text);
      message.success("Text Copied to clipboard");
    } catch (err) {
      message.error("Not have permission");
    }
  };

  return (
    <>
      <div
        style={{ backgroundColor: `${highlightedColor.bg}` }}
        className=" rounded-md py-2 px-3 border border-[#ABB7C9] relative"
      >
        <div>
          <div
            style={{
              minHeight: "50px",
              overflow: "visible",
              wordBreak: "break-word",
            }}
            // ref={highlightRef}
            id="highlightbox"
            // onBlur={onHighlightBlur}
            contentEditable={false}
            className={classNames(
              highlightedColor?.border,
              "flex-1 text-xs text-black  pl-2 py-0 outline-none highlight-content-container"
            )}
          >
            {item?.media?.text}
          </div>
        </div>
        <div className="flex justify-between items-center mt-3 space-x-3">
          <div></div>
          {/* <div className={`flex space-x-4`}>
              <div
                className={`cursor-pointer select-none text-xs rounded-full p-[4px] ${
                  showColorOptions && "bg-blue-100 text-blue-500"
                }`}
                onClick={handleColorToggle}
              >
                <PaintBoardIcon height={18} width={18} />
              </div>
              {showColorOptions && (
                <div className="flex space-x-2 items-center">
                  {HIGHLIGHTED_COLORS.map((color) => (
                    <button
                      key={color.id}
                      style={{ backgroundColor: `${color.bg}` }}
                      className={classNames(
                        "flex justify-center items-center h-4 w-4 rounded-full border-[1px] border-gray-400"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateNoteColor(color, item);
                      }}
                    >
                      <CheckIcon
                        className={classNames(
                          color.id === highlightedColor?.id ? "" : color.text,
                          "h-2 w-2"
                        )}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div> */}
          <div className="flex items-center">
            <RiFileCopyLine
              className="h-4 w-4 text-gray-500 mr-1 cursor-pointer"
              onClick={onTextCopy}
            />
            <HighlightActions
              media={item?.media}
              obj={item}
              onDeleteUpdates={removeDeleteNote}
              // openLinkToHighlight={handleOpenLinkToHighlight}
              isTextHighlight={false}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default NoteHighlight;