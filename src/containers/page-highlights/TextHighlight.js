import React from "react";
import { useSelector } from "react-redux";
import HighlightActions from "./HighlightActions";
import HighlightBody from "./HighlightBody";
import { fetchCurrentTab } from "../../utils/fetch-current-tab";
import { copyLinkToHighlight, openLinkToHighlight } from "../../utils/message-operations";
import { message } from "antd";

const TextHighlight = (props) => {
  const tabDetails = useSelector((state) => state.app.tab);
  const currentGem = useSelector((state) => state.gem.currentGem);
  const { obj } = props;
  console.log("obj", obj);
  const media =
    Array.isArray(obj.media) && obj.media.length !== 0
      ? obj.media[0]
      : typeof obj.media === "object" && obj.media["0"]
      ? obj.media["0"]
      : typeof obj.media
      ? obj.media
      : null;

  const onDeleteUpdates = async (obj) => {
    const { allHighlights } = props;
    const myHighlights = [...allHighlights];
    const index = myHighlights.findIndex((o) => {
      return o.id === obj.id;
    });
    if (index !== -1) {
      myHighlights.splice(index, 1);
      const finalArr = myHighlights.filter((o) => {
        return o.media_type === "Highlight" || o.media_type === "Note";
      });
      const tab = tabDetails || (await fetchCurrentTab());
      window.chrome.tabs.sendMessage(tab.id, {
        value: JSON.stringify(
          finalArr.map((o) => {
            return { id: o.id, media: o.media };
          })
        ),
        type: "CT_HIGHLIGHT_DATA",
      });
    }
  };

  const handleCopyLinkToHighlight = async () => {
    if (props?.allHighlightPage){
      const tab = tabDetails || (await fetchCurrentTab());
      copyLinkToHighlight(tab?.url, media.text);
    }else{
      copyLinkToHighlight(currentGem?.url, media.text);
    }
    message.success('Link Copied to clipboard');
  }

  const handleOpenLinkToHighlight = async () => {
    if (props?.allHighlightPage) {
      const tab = tabDetails || (await fetchCurrentTab());
      openLinkToHighlight(tab?.url, media.text);
    } else {
      openLinkToHighlight(currentGem?.url, media.text);
    }
  }

  if (media === null) return null;
  return (
    <div>
      <div className="border-[1px] border-gray-300 border-b-0 rounded-b-0 rounded-sm py-2 pr-2">
        <div
          className={`py-1 pl-3 border-l-4 ${
            media.color?.border || "border-pink-500"
          }`}
        >
          <HighlightBody text={media.text} color={media.color} copyLinkToHighlight={handleCopyLinkToHighlight} />
        </div>
      </div>
      <div className="pl-4 border-[1px] border-gray-300 border-t-0 rounded-t-0 rounded-sm">
        <hr className="w-full bg-gray-300 -mr-5" />
        <HighlightActions
          media={media}
          obj={obj}
          onDeleteUpdates={onDeleteUpdates}
          openLinkToHighlight={handleOpenLinkToHighlight}
          isTextHighlight={true}
        />
      </div>
    </div>
  );
};

export default TextHighlight;
