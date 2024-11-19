import { PiBookmarkSimple, PiCopy } from "react-icons/pi";
import { TbRefresh } from "react-icons/tb";
import { copyText } from "../../utils/message-operations";
import { Avatar, Button, Divider, Dropdown, message, Pagination, Spin, Tooltip } from "antd";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm';
// import { BsSpeaker } from "react-icons/bs";
import { fetchChatAudio } from "../../actions/ai-brands";
import { useDispatch } from "react-redux";
import { HiSpeakerWave } from "react-icons/hi2";
import { LISTEN_VOICES } from "../../utils/ai-options";

const AiMessageComponent = ({
  item,
  index,
  user,
  handleRefresh = () => {},
  saveCurrentPrompt = () => {},
  handleEdit=()=>{},
}) => {
  const dispatch = useDispatch();
  const [currentMessageIdx, setCurrentMessageIdx] = useState(item?.msgArr?.length > 0 ? item?.msgArr?.length : 0);
  const [totalSize, setTotalSize] = useState(item?.msgArr?.length || 0);
  // const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [audioSrc, setAudioSrc] = useState(null); 
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setCurrentMessageIdx(item?.msgArr?.length > 0 ? item?.msgArr?.length : 0);
    setTotalSize(item?.msgArr?.length || 0);
  }, [item?.msgArr])

  const handleCopy = (text) => {
    try {
      copyText(text);
      message.success("Text Copied to clipboard");
    } catch (err) {
      message.error("Not have permission");
    }
  };

  const handleOpen = (flag) => {
    setOpen(flag);
  };

  const onListenTextContent = async (text, voice) => {
    setIsAudioLoading(true);
    const res = await dispatch(fetchChatAudio(text, voice))
    setIsAudioLoading(false);
    if (res?.payload?.data?.data) {
      setAudioSrc(res?.payload?.data?.data);
      const audioElem = new Audio(res?.payload?.data?.data);
      audioElem.play();
    }
  }

  const onDownloadMp3File = () => {
    const link = document.createElement('a');
    link.href = audioSrc;
    link.download = 'audio.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const dropdownnRenderUI = (text) => {
    return (
      <div className="flex flex-col gap-2 p-2 ct-ai-dropdown-changes">
        {audioSrc && 
          <>
            <Button type="text" onClick={onDownloadMp3File}>Download Recording</Button>
            <Divider className="m-0" />
          </>
        }
        {LISTEN_VOICES.map((voice) => {
          return (
            <Button type="text" key={voice} onClick={() => {
              onListenTextContent(text, voice.value);
              // setSelectedVoice(voice.value)
            }}>{voice.name}</Button>
          )
        })}
      </div>
    )
  }

  const renderReplies = (msgArr) => {
    const msg = msgArr[currentMessageIdx - 1];
    if (!msg) return null;
    // return msgArr?.map((msg, idx) => {
      return (
        <div className="flex items-center gap-2 my-2">
          <div
            className={`flex p-[6px] items-center justify-center gap-1 rounded bg-[#E5F0FF]`}
          >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
              >
                <rect
                  x="5.60156"
                  y="9.79688"
                  width="16.8"
                  height="15.4"
                  rx="3"
                  fill="#DADDE0"
                />
                <rect
                  x="21"
                  y="18.2031"
                  width="4.2"
                  height="2.8"
                  fill="#DADDE0"
                />
                <rect
                  x="2.79688"
                  y="18.2031"
                  width="4.2"
                  height="2.8"
                  fill="#DADDE0"
                />
                <rect
                  x="5.60156"
                  y="22.3984"
                  width="1.4"
                  height="1.4"
                  fill="#DADDE0"
                />
                <rect x="21" y="21" width="1.4" height="2.8" fill="#DADDE0" />
                <path
                  d="M26.8385 17.5026V21.0026C26.8385 21.6443 26.3135 22.1693 25.6719 22.1693H24.5052V23.3359C24.5052 24.6309 23.4669 25.6693 22.1719 25.6693H5.83854C5.2197 25.6693 4.62621 25.4234 4.18863 24.9859C3.75104 24.5483 3.50521 23.9548 3.50521 23.3359V22.1693H2.33854C1.69687 22.1693 1.17188 21.6443 1.17188 21.0026V17.5026C1.17188 16.8609 1.69687 16.3359 2.33854 16.3359H3.50521C3.50521 11.8209 7.15688 8.16927 11.6719 8.16927H12.8385V6.6876C12.1385 6.29094 11.6719 5.5326 11.6719 4.66927C11.6719 3.38594 12.7219 2.33594 14.0052 2.33594C15.2885 2.33594 16.3385 3.38594 16.3385 4.66927C16.3385 5.5326 15.8719 6.29094 15.1719 6.6876V8.16927H16.3385C20.8535 8.16927 24.5052 11.8209 24.5052 16.3359H25.6719C26.3135 16.3359 26.8385 16.8609 26.8385 17.5026ZM24.5052 18.6693H22.1719V16.3359C22.1719 13.1159 19.5585 10.5026 16.3385 10.5026H11.6719C8.45188 10.5026 5.83854 13.1159 5.83854 16.3359V18.6693H3.50521V19.8359H5.83854V23.3359H22.1719V19.8359H24.5052V18.6693Z"
                  fill="#062046"
                />
                <path
                  d="M18.0781 20.4167C19.3731 20.4167 20.4115 19.3783 20.4115 18.0833C20.4115 16.8 19.3615 15.75 18.0781 15.75C16.7948 15.75 15.7448 16.7883 15.7448 18.0833C15.7448 19.3783 16.7831 20.4167 18.0781 20.4167Z"
                  fill="#062046"
                />
                <path
                  d="M7.57812 18.0833C7.57812 16.8 8.62813 15.75 9.91146 15.75C11.2065 15.75 12.2448 16.7883 12.2448 18.0833C12.2448 19.3783 11.1948 20.4167 9.91146 20.4167C8.62813 20.4167 7.57812 19.3667 7.57812 18.0833Z"
                  fill="#062046"
                />
              </svg>
          </div>

          <div className="flex flex-col p-2 gap-2 rounded-lg bg-white border border-solid border-[#DFE4EC] w-[330px] break-words">
              <div className="text-sm">
                <Markdown remarkPlugins={[remarkGfm]}>
                  {msg?.text}
                </Markdown>
              </div>
              <div className={`flex items-center justify-${(totalSize > 1) ? 'between' : 'end'}`}>
                {currentMessageIdx && totalSize > 1 && <Pagination 
                  simple={{ readOnly: true }}
                  defaultCurrent={currentMessageIdx} 
                  current={currentMessageIdx}
                  total={totalSize} 
                  pageSize={1}
                  onChange={(page) => {
                    setCurrentMessageIdx(page);
                  }} 
                />}
                <div className="flex items-center justify-center gap-3">
                  <Tooltip title="Read aloud">
                    {isAudioLoading 
                      ? <Spin size="small" />
                      : <Dropdown trigger={["click"]}
                                dropdownRender={() => dropdownnRenderUI(msg.text)}
                                onOpenChange={handleOpen}
                                open={open}
                                placement="bottomRight">
                          <HiSpeakerWave className="h-4 w-4 cursor-pointer" />
                        </Dropdown>
                    }
                  </Tooltip>
                  <Tooltip title="Bookmark">
                    <PiBookmarkSimple
                      className=" h-4 w-4 cursor-pointer"
                      onClick={() => saveCurrentPrompt(msg?.text)}
                    />
                  </Tooltip>
                  <Tooltip title="Copy text">
                    <PiCopy
                      className=" h-4 w-4 cursor-pointer"
                      onClick={() => handleCopy(msg?.text)}
                    />
                  </Tooltip>
                  <Tooltip title="Regenerate">
                    <TbRefresh
                      className=" h-4 w-4 cursor-pointer"
                      onClick={() => handleRefresh(msg?.userText, msg)}
                    />
                  </Tooltip>
                </div>
            </div>
          </div>
        </div>
      )
    // })
  }
  return (
    <>
      <div className="flex items-center gap-2 my-2" key={index}>
        <div
          className={`flex p-[6px] items-center justify-center gap-1 rounded ${
            item?.type === "user"
              ? "bg-white border border-solid border-[#B8D4FE]"
              : "bg-[#E5F0FF]"
          }`}
        >
          {item?.type === "user" ? (
            user && user.profilePhoto 
              ? <Avatar src={user.profilePhoto} size={28} />
              : <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <g clip-path="url(#clip0_10835_14469)">
                    <path
                      d="M11.9966 17C15.6586 17 18.8616 18.575 20.6036 20.925L18.7616 21.796C17.3436 20.116 14.8436 19 11.9966 19C9.14962 19 6.64963 20.116 5.23163 21.796L3.39062 20.924C5.13262 18.574 8.33463 17 11.9966 17ZM11.9966 2C13.3227 2 14.5945 2.52678 15.5322 3.46447C16.4698 4.40215 16.9966 5.67392 16.9966 7V10C16.9966 11.3261 16.4698 12.5979 15.5322 13.5355C14.5945 14.4732 13.3227 15 11.9966 15C10.6705 15 9.39877 14.4732 8.46109 13.5355C7.52341 12.5979 6.99662 11.3261 6.99662 10V7C6.99662 5.67392 7.52341 4.40215 8.46109 3.46447C9.39877 2.52678 10.6705 2 11.9966 2Z"
                      fill="#347AE2"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_10835_14469">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
            >
              <rect
                x="5.60156"
                y="9.79688"
                width="16.8"
                height="15.4"
                rx="3"
                fill="#DADDE0"
              />
              <rect
                x="21"
                y="18.2031"
                width="4.2"
                height="2.8"
                fill="#DADDE0"
              />
              <rect
                x="2.79688"
                y="18.2031"
                width="4.2"
                height="2.8"
                fill="#DADDE0"
              />
              <rect
                x="5.60156"
                y="22.3984"
                width="1.4"
                height="1.4"
                fill="#DADDE0"
              />
              <rect x="21" y="21" width="1.4" height="2.8" fill="#DADDE0" />
              <path
                d="M26.8385 17.5026V21.0026C26.8385 21.6443 26.3135 22.1693 25.6719 22.1693H24.5052V23.3359C24.5052 24.6309 23.4669 25.6693 22.1719 25.6693H5.83854C5.2197 25.6693 4.62621 25.4234 4.18863 24.9859C3.75104 24.5483 3.50521 23.9548 3.50521 23.3359V22.1693H2.33854C1.69687 22.1693 1.17188 21.6443 1.17188 21.0026V17.5026C1.17188 16.8609 1.69687 16.3359 2.33854 16.3359H3.50521C3.50521 11.8209 7.15688 8.16927 11.6719 8.16927H12.8385V6.6876C12.1385 6.29094 11.6719 5.5326 11.6719 4.66927C11.6719 3.38594 12.7219 2.33594 14.0052 2.33594C15.2885 2.33594 16.3385 3.38594 16.3385 4.66927C16.3385 5.5326 15.8719 6.29094 15.1719 6.6876V8.16927H16.3385C20.8535 8.16927 24.5052 11.8209 24.5052 16.3359H25.6719C26.3135 16.3359 26.8385 16.8609 26.8385 17.5026ZM24.5052 18.6693H22.1719V16.3359C22.1719 13.1159 19.5585 10.5026 16.3385 10.5026H11.6719C8.45188 10.5026 5.83854 13.1159 5.83854 16.3359V18.6693H3.50521V19.8359H5.83854V23.3359H22.1719V19.8359H24.5052V18.6693Z"
                fill="#062046"
              />
              <path
                d="M18.0781 20.4167C19.3731 20.4167 20.4115 19.3783 20.4115 18.0833C20.4115 16.8 19.3615 15.75 18.0781 15.75C16.7948 15.75 15.7448 16.7883 15.7448 18.0833C15.7448 19.3783 16.7831 20.4167 18.0781 20.4167Z"
                fill="#062046"
              />
              <path
                d="M7.57812 18.0833C7.57812 16.8 8.62813 15.75 9.91146 15.75C11.2065 15.75 12.2448 16.7883 12.2448 18.0833C12.2448 19.3783 11.1948 20.4167 9.91146 20.4167C8.62813 20.4167 7.57812 19.3667 7.57812 18.0833Z"
                fill="#062046"
              />
            </svg>
          )}
        </div>

        <div className="flex flex-col p-2 gap-2 rounded-lg bg-white border border-solid border-[#DFE4EC] w-[330px] break-words">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <Markdown remarkPlugins={[remarkGfm]}>
                {item?.text}
              </Markdown> 
            </div>
            <PencilSquareIcon
              className=" h-4 w-4 cursor-pointer"
              onClick={() => handleEdit(item?.userText || item?.text)}
            />
          </div>

          {/* {item?.type === "user" ? (
            <></>
          ) : (
            <div className="flex items-center justify-between">
              {item.msgArr?.length > 0 && <Pagination simple={{ readOnly: true }} defaultCurrent={item?.msgArr?.length - 1} total={item?.msgArr?.length} />}
              <div className="flex items-center justify-center gap-3">
                <PiBookmarkSimple
                  className=" h-4 w-4 cursor-pointer"
                  onClick={() => saveCurrentPrompt(item?.text)}
                />
                <PiCopy
                  className=" h-4 w-4 cursor-pointer"
                  onClick={() => handleCopy(item?.text)}
                />
                <TbRefresh
                  className=" h-4 w-4 cursor-pointer"
                  onClick={() => handleRefresh(item?.userText, item)}
                />
                <PencilSquareIcon
                  className=" h-4 w-4 cursor-pointer"
                  onClick={() => handleEdit(item?.userText)}
                />
              </div>
            </div>
          )} */}
        </div>
      </div>
      {item.msgArr?.length > 0 && renderReplies(item.msgArr)}
    </>
  );
};

export default AiMessageComponent