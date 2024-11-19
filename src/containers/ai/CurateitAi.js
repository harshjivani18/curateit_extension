/*global chrome*/
import "./CurateitAi.css";
import TextareaAutosize from "react-textarea-autosize";
import { v4 as uuidv4 }                         from "uuid";
import LayoutCommon from "../../components/commonLayout/LayoutCommon";
import { PiMagicWand, PiMicrophone, PiPaperclip, PiPaperPlaneRight, PiUserLight } from "react-icons/pi";
import { useEffect, useRef, useState } from "react";
import AiMessageComponent from "../../components/common/AiMessageComponent";
import { useDispatch, useSelector } from "react-redux";
import { getOpenAIResponse } from "../../actions/collection";
import { XMarkIcon } from "@heroicons/react/24/outline";
import TruncateText from "../../components/common/TruncateTextComponent";
import { useNavigate } from "react-router-dom";
import { setActiveHomeTab } from "../../actions/app";
import { fetchUserDetails, updateUser } from "../../actions/user";
import { Button, Checkbox, Dropdown, message, Select, Spin, Tooltip } from "antd";
import { deleteBrand, fetchBrandPrompts, fetchMyPrompts, fetchPersonas, fetchPublicPrompts, fetchVoices, rephraseAIPrompt, syncAiPromptAgain, updatePrompts } from "../../actions/ai-brands";
// import AISelect from "../../components/common/AISelect";
import AIDropDown from "../../components/common/AIDropDown";
import { MdAlternateEmail } from "react-icons/md";
import { FaHashtag } from "react-icons/fa";
import { RiUserVoiceLine } from "react-icons/ri";
import { CHATGPT_LANG, CLOUDE_LANG, DEFAULT_AI_OPTIONS, GEMINI_LANG, PERSONA_BRAND_TYPE, VOICE_BRAND_TYPE } from "../../utils/ai-options";
import { BsGlobeAmericas, BsRobot } from "react-icons/bs";
import AudioWaveFormTranscript from "../../components/audioTranscript/AudioWaveFormTranscript";
import { deleteGem, getAudioText, setCurrentGem } from "../../actions/gem";
import AIBrandModal from "../../components/modal/AIBrandModal";

const CurateitAi = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const loggedInUser = useSelector((state) => state.user.userData);
  const { 
    myPrompts, 
    publicPrompts, 
    brandPrompts,
    voices,
    personas,
    syncAIPrompt
  }                   = useSelector((state) => state.aiBrands);
  const lastMessageRef = useRef(null);
  const textareaRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [promptTextFromPage, setPromptTextFromPage] = useState("");
  const [userText, setUserText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [selectedHashTag, setSelectedHashTag] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isOptimizingPrompt, setIsOptimizingPrompt] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [isRecordingCanceled, setIsRecordingCanceled] = useState(false);
  const [processingText, setProcessingText] = useState("");
  const [currentBrand,
         setCurrentBrand]             = useState(null);
  const [brandType,
        setBrandType]                = useState(PERSONA_BRAND_TYPE);
  const [currentAction,
        setCurrentAction]            = useState("create");
  const [showModal, setShowModal]    = useState(false);

  useEffect(() => {
    if (textareaRef?.current) {
      textareaRef.current.focus();
    }
  }, [])

  useEffect(() => {
    if (syncAIPrompt) {
      window.chrome.storage.local.get("aiData", (data) => {
        if (data && data.aiData) {
          setPromptTextFromPage(data?.aiData?.text || "");
          setMessages([]);
          setUserText("");
          setSelectedPrompt(null);
          setSelectedHashTag([]);
          setSelectedPersona(null);
          setSelectedVoice(null);
          setSelectedModel(null);
          setSelectedLanguage(null);
          if (data?.aiData?.isSummarize) {
            const mainID      = uuidv4();
            let newMsgArr     = [ ...messages ];
            const newMessage  = {
              type: "user",
              text: "Please summarize this content and page",
              id: mainID,
              msgArr: [],
            };
            setMessages(prev => [ ...prev, newMessage ]);
            newMsgArr = [ ...newMsgArr, newMessage ];

            let finalPrompt;

            if (data?.aiData?.text) {
              finalPrompt = `${data?.aiData?.text} Please summarize this content and page`;
            } else {
              finalPrompt = "Please summarize this content and page";
            }

            const reqestForAiResponse = async(finalPrompt) => {
              setLoading(true);
              const payload = {
                prompt: finalPrompt,
                selectedLanguage: selectedLanguage?.label,
                selectedModel: selectedModel,
                selectedPersona: selectedPersona,
                selectedVoice: selectedVoice,
                selectedHashTag: selectedHashTag,
                selectedPrompt: selectedPrompt?.id
              };
  
              const res = await dispatch(getOpenAIResponse(payload));
  
              if (res.error === undefined) {
                setLoading(false);
                const newMessage = {
                  type: "ai",
                  text: res?.payload?.data?.data || "",
                  userText: "Please summarize this content and page",
                  parentId: mainID,
                };
  
                const idx = newMsgArr.findIndex((m) => m.id && m.id === mainID);
                if (idx !== -1) {
                  newMsgArr[idx] = {
                    ...newMsgArr[idx],
                    msgArr: [ ...newMsgArr[idx].msgArr, newMessage ]
                  }
                  setMessages([...newMsgArr]);
                }
  
              }
              // setUserText("");
              setLoading(false);
            }
            reqestForAiResponse(finalPrompt)
            
          }
        }
        dispatch(syncAiPromptAgain(false))
      });
    }

    return () => {
      window.chrome.storage.sync.remove("aiData");
    };
  }, [syncAIPrompt, dispatch])

  useEffect(() => {
    dispatch(setActiveHomeTab("curateit-ai"));
  }, [dispatch])

  useEffect(() => {
    if (personas.length === 0) {
      dispatch(fetchPersonas()).then((res) => {
        if (res?.payload?.data?.data && selectedPersona === null && loggedInUser) {
          setSelectedPersona(res?.payload?.data?.data?.find((p) => p.id === loggedInUser?.ai_settings?.defaultBrandPersona))
        }
      })
    }
    if (voices.length === 0) {
      dispatch(fetchVoices()).then((res) => {
        if (res?.payload?.data?.data && selectedVoice === null && loggedInUser) {
          setSelectedVoice(res?.payload?.data?.data?.find((v) => v.id === loggedInUser?.ai_settings?.defaultBrandVoiceId))
        }
      })
    }
    dispatch(fetchMyPrompts())
    if (publicPrompts?.length === 0) {
      dispatch(fetchPublicPrompts())
    }
    if (brandPrompts?.length === 0) {
      dispatch(fetchBrandPrompts())
    }
  }, [dispatch, loggedInUser, selectedPersona, selectedVoice, personas, voices, publicPrompts, brandPrompts]);

  useEffect(() => {
    if (!loggedInUser || (Array.isArray(loggedInUser) && loggedInUser.length === 0)) {
      dispatch(fetchUserDetails()).then((res) => {
        const userDetails = res?.payload?.data
        if (userDetails) {
          setSelectedPersona(personas.find((p) => p.id === userDetails?.ai_settings?.defaultBrandPersona))
          setSelectedVoice(voices.find((v) => v.id === userDetails?.ai_settings?.defaultBrandVoiceId))
          setSelectedModel(DEFAULT_AI_OPTIONS.find((opt) => opt.model === userDetails?.ai_settings?.defaultModel && opt.name === userDetails?.ai_settings?.defaultAI))
          setSelectedLanguage(CHATGPT_LANG.find((lang) => lang.label === userDetails?.ai_settings?.defaultLanguage) 
                              || CLOUDE_LANG.find((lang) => lang.label === userDetails?.ai_settings?.defaultLanguage) 
                              || GEMINI_LANG.find((lang) => lang.label === userDetails?.ai_settings?.defaultLanguage))
        }
      })
    }
    else {
      setSelectedPersona(personas.find((p) => p.id === loggedInUser?.ai_settings?.defaultBrandPersona))
      setSelectedVoice(voices.find((v) => v.id === loggedInUser?.ai_settings?.defaultBrandVoiceId))
      setSelectedModel(DEFAULT_AI_OPTIONS.find((opt) => opt.model === loggedInUser?.ai_settings?.defaultModel && opt.name === loggedInUser?.ai_settings?.defaultAI))
      setSelectedLanguage(CHATGPT_LANG.find((lang) => lang.label === loggedInUser?.ai_settings?.defaultLanguage) 
                          || CLOUDE_LANG.find((lang) => lang.label === loggedInUser?.ai_settings?.defaultLanguage) 
                          || GEMINI_LANG.find((lang) => lang.label === loggedInUser?.ai_settings?.defaultLanguage))
    }
  }, [loggedInUser, dispatch, personas, voices]);

  const handleSubmit = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (userText.trim()) {
      let text = userText;
      let newMsgArr = [...messages];
      setLoading(true);
      setUserText("");
      const mainID = uuidv4();
      const newMessage = {
        type: "user",
        text: userText,
        id: mainID,
        msgArr: [],
      };
      setMessages((prev) => [...prev, newMessage]);
      newMsgArr = [...newMsgArr, newMessage];

      if (newMsgArr.filter((msg) => msg.type === "user").length > 1) {
        setTimeout(() => {
          if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 0);
      }

      let finalPrompt;

      if (promptTextFromPage) {
        finalPrompt = `${promptTextFromPage} ${userText}`;
      } else {
        finalPrompt = userText;
      }

      const payload = {
        prompt: finalPrompt,
        selectedLanguage: selectedLanguage?.label,
        selectedModel: selectedModel,
        selectedPersona: selectedPersona,
        selectedVoice: selectedVoice,
        selectedHashTag: selectedHashTag,
        selectedPrompt: selectedPrompt?.id,
      };

      const res = await dispatch(getOpenAIResponse(payload));

      if (res.error === undefined) {
        setLoading(false);
        const newMessage = {
          type: "ai",
          text: res?.payload?.data?.data || "",
          userText: text,
          parentId: mainID,
        };

        const idx = newMsgArr.findIndex((m) => m.id && m.id === mainID);
        if (idx !== -1) {
          newMsgArr[idx] = {
            ...newMsgArr[idx],
            msgArr: [...newMsgArr[idx].msgArr, newMessage],
          };
          setMessages([...newMsgArr]);
        }

        setTimeout(() => {
          if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
      // setUserText("");
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const handleRefresh = async (userText, item) => {
    setLoading(true);
    let finalPrompt;

    if (promptTextFromPage) {
      finalPrompt = `${promptTextFromPage} ${userText}`;
    } else {
      finalPrompt = userText;
    }

    const payload = {
      prompt: finalPrompt,
      selectedLanguage: selectedLanguage?.label,
      selectedModel: selectedModel,
      selectedPersona: selectedPersona,
      selectedVoice: selectedVoice,
      selectedHashTag: selectedHashTag,
      selectedPrompt: selectedPrompt?.id
    };

    const res = await dispatch(getOpenAIResponse(payload));

    if (res.error === undefined) {
      setLoading(false);
      const idx = messages.findIndex((m) => m.id && item.parentId === m.id);
      if (idx !== -1) {
        const aiMessage = {
          type: "ai",
          text: res?.payload?.data?.data || "",
          userText: userText,
          parentId: item.parentId,
        };
        messages[idx] = {
          ...messages[idx],
          msgArr: [ ...messages[idx].msgArr, aiMessage ]
        }
        setMessages([...messages]);
      }
      

      // setMessages((prevMessages) => [...prevMessages, aiMessage]);
      setLoading(false);
    }
  };

  const saveCurrentPrompt = (prompt) => {
    window.chrome.storage.sync.remove("noteInfo");
    window.chrome.storage.sync.set({
      noteInfo: {
        text: prompt,
      },
    });
    navigate("/note");
  };

  const handleEdit = (uText) => {
    let fText;
    
    if(promptTextFromPage){
      fText = `${promptTextFromPage} ${uText}`;
    }else{
      fText = `${uText}`;
    }

    setUserText(fText)
  }

  const onOptimizePrompt = async () => {
    setIsOptimizingPrompt(true)
    const res = await dispatch(rephraseAIPrompt(userText));
    setIsOptimizingPrompt(false)
    if (res.error === undefined) {
      setUserText(res?.payload?.data?.data || userText);
      return
    }
    message.error("Not able to rephrased the prompt!")
  }

  const onAttachFileClick = () => {

  }

  const onAudioRecordComplete = async (audioBlob) => { 
    const audioFile = new File([audioBlob], "recording.mp3", {
      type: "audio/mp3",
    });
    const formData = new FormData();
    formData.append("files", audioFile);
    setProcessingText("Processing dictation...");
    const res      = await dispatch(getAudioText(formData))
    if (res.error === undefined) {
      setUserText(res?.payload?.data?.data?.originalText);
    }
    setProcessingText("");
    setShowAudioRecorder(false);
  }

  const onDictate = () => {
    setShowAudioRecorder(!showAudioRecorder);
  }

  const onUpdateLang = async (lang) => {
    if (loggedInUser) {
      await dispatch(updateUser({
        ...loggedInUser,
        ai_settings: {
          ...loggedInUser.ai_settings,
          defaultLanguage: lang
        }
      }))
    }
  }

  const onCreatePersona = () => {
    setShowModal(true);
    setCurrentAction("create");
    setBrandType(PERSONA_BRAND_TYPE);
  }

  const onCreateVoice = () => {
    setShowModal(true)
    setCurrentAction("create")
    setBrandType(VOICE_BRAND_TYPE)
  }

  const onPersonaEditItemClick = (obj) => {
    const item = personas.find((p) => p.id === obj.id)
    setShowModal(true)
    setCurrentBrand(item)
    setCurrentAction("edit")
    setBrandType(PERSONA_BRAND_TYPE)
  }
  
  const onVoiceEditItemClick = (obj) => {
    const item = voices.find((p) => p.id === obj.id)
    setShowModal(true)
    setCurrentBrand(item)
    setCurrentAction("edit")
    setBrandType(VOICE_BRAND_TYPE)
  }

  const onDeleteItemClick = async (item) => {
    if (item.id) {
        const res = await dispatch(deleteBrand(item.id))
        if (res?.error === undefined) {
            message.success("Brand deleted successfully")
        }
    }
  } 

  const onCancelModal = () => {
    setShowModal(false)
    setCurrentBrand(null)
    setCurrentAction("create")
    setBrandType(PERSONA_BRAND_TYPE)
  }

  const onPromptEditClick = (obj) => {
    if (obj.prompt) {
      const item       = { ...obj.prompt }
      const currentObj = { ...item, parent: item.collection_gems, collection_id: item.collection_id, id: item.id, tags: item.tags }
      dispatch(setCurrentGem(currentObj))
      navigate(`/ai-prompt`)
    }
  }

  const onPromptDeleteClick = async (obj) => {
    if (obj.prompt) {
      const res = await dispatch(deleteGem(obj.prompt.id, obj.prompt.collection_gems.id))
      if (res?.error === undefined) {
        dispatch(updatePrompts(myPrompts.filter((m) => m.id !== obj.prompt.id)))
        message.success("Prompt deleted successfully")
      }
    }
  }

  const getModelLang = (defaultAI) => {
    if (defaultAI.includes("gpt")) {
      return CHATGPT_LANG.map((lang) => {
        return {
          name: lang.label,
          id: lang.label,
          icon: ""
        }
      })
    }
    if (defaultAI.includes("claude")) {
      return CLOUDE_LANG.map((lang) => {
        return {
          name: lang.label,
          id: lang.label,
          icon: ""
        }
      })
    }
    if (defaultAI.includes("gemini")) {
      return GEMINI_LANG.map((lang) => {
        return {
          name: lang.label,
          id: lang.label,
          icon: ""
        }
      })
    }
  }

  const getLanguages = () => {
    if (!loggedInUser?.ai_settings?.enableModels) {
      const langArr = []
      CHATGPT_LANG.forEach((lang) => {
        const idx = langArr.findIndex((l) => l.id === lang.label)
        if (idx === -1) {
          langArr.push({
            name: lang.label,
            id: lang.label,
            icon: ""
          })
        }
      })
      CLOUDE_LANG.forEach((lang) => {
        const idx = langArr.findIndex((l) => l.id === lang.label)
        if (idx === -1) {
          langArr.push({
            name: lang.label,
            id: lang.label,
            icon: ""
          })
        }
      })
      GEMINI_LANG.forEach((lang) => {
        const idx = langArr.findIndex((l) => l.id === lang.label)
        if (idx === -1) {
          langArr.push({
            name: lang.label,
            id: lang.label,
            icon: ""
          })
        }
      })
      return langArr
    }

    if (loggedInUser?.ai_settings?.enableModels && selectedModel) {
      const defaultAI = selectedModel.model.toLowerCase()
      return getModelLang(defaultAI)
    }

    return []
  }

  return (
    <LayoutCommon>
      <div className="h-screen p-2 relative flex flex-col">
        {/* header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex p-[6px] items-center justify-center gap-1 rounded bg-[#E5F0FF]">
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

          <div className="flex p-2 gap-2 rounded-lg bg-[#E5F0FF]">
            <div className="text-base">Welcome to Curateit AI</div>
          </div>
        </div>

        {/* selected text or prompt */}
        {promptTextFromPage && (
          <div className="bg-[#e8f4fd] p-2 rounded text-[##4b5563] flex items-start relative">
            <div className="flex items-center mr-1">
              <div className="bg-[#347AE2] w-[3px] h-3 flex mr-2"></div>
              <span className="text-[#347AE2] font-bold mr-1">
                Context:&nbsp;
              </span>
            </div>
            <div>
              <TruncateText text={promptTextFromPage} length={35} />
            </div>
            <XMarkIcon
              className="h-4 w-4 absolute top-0 right-[4px] cursor-pointer text-red-400"
              onClick={() => setPromptTextFromPage("")}
            />
          </div>
        )}

        <div className="flex-1 pb-[60px]">
          {messages?.length > 0 && (
            <div className="pb-[60px]">
              {messages?.map((item, index) => (
                <AiMessageComponent
                  item={item}
                  index={index}
                  handleRefresh={handleRefresh}
                  saveCurrentPrompt={saveCurrentPrompt}
                  loading={loading}
                  handleEdit={handleEdit}
                  user={loggedInUser}
                />
              ))}
              {loading && (
                <div className="typing-loader">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
              <div ref={lastMessageRef} />
            </div>
          )}
        </div>

        <div
          className="flex items-center gap-3 fixed bottom-[45px] justify-center bg-white"
          style={{ width: "calc(100% - 90px)" }}
        >
          <div className="flex gap-2 p-2 ct-custom-text-area">
            {showAudioRecorder && (
              <AudioWaveFormTranscript
                onAudioRecorded={onAudioRecordComplete}
                onCancelRecording={() => {
                  // setIsRecordingCanceled(true)
                  setShowAudioRecorder(false);
                  setProcessingText("");
                }}
                setIsRecordingCanceled={setIsRecordingCanceled}
                processingText={processingText}
              />
            )}
            {!showAudioRecorder && (
              <TextareaAutosize
                className="border-none rounded !outline-none !focus:outline-none"
                placeholder="Ask anything..."
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                onKeyDown={handleKeyPress}
                style={{ flex: "1", resize: "none" }}
                autoFocus={true}
                minRows={2}
                ref={textareaRef}
              />
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-between">
                {loggedInUser?.ai_settings?.enablePrompts && (
                  <AIDropDown
                    groups={["My Prompts", "Public Prompts"]}
                    selectedItem={selectedPrompt?.id}
                    items={[
                      ...myPrompts.map((m) => {
                        return {
                          name: m.title,
                          id: `my-${m.id}`,
                          group: "My Prompts",
                          icon: m?.metaData?.defaultIcon,
                          type: "my-prompt",
                          idIntial: "my",
                          prompt: m,
                          isEnableEdit: true,
                        };
                      }),
                      ...brandPrompts.map((b) => {
                        return {
                          name: b.name,
                          id: `brand-${b.id}`,
                          group: "Public Prompts",
                          icon: b?.icon,
                          type: "brand-prompt",
                          idIntial: "brand",
                        };
                      }),
                      ...publicPrompts.map((p) => {
                        return {
                          name: p.title,
                          id: `public-${p.id}`,
                          group: "Public Prompts",
                          icon: p?.metaData?.defaultIcon,
                          type: "public-prompt",
                          idIntial: "public",
                        };
                      }),
                    ]}
                    onEdit={onPromptEditClick}
                    onDelete={onPromptDeleteClick}
                    onSelect={(value) => {
                      const idArr = value.split("-");
                      if (idArr.length < 2) return;
                      const type = idArr[0];
                      const id = parseInt(idArr[1]);
                      if (type === "my") {
                        const promptObj = myPrompts.find((m) => m.id === id);
                        setSelectedPrompt(promptObj);
                        setUserText(
                          promptObj?.expander?.find(
                            (item) => item.type === "prompt"
                          )?.plainText
                        );
                      } else if (type === "public") {
                        const promptObj = publicPrompts.find(
                          (p) => p.id === id
                        );
                        setSelectedPrompt(promptObj);
                        setUserText(
                          promptObj?.expander?.find(
                            (item) => item.type === "prompt"
                          )?.plainText
                        );
                      } else if (type === "brand") {
                        const promptObj = brandPrompts.find((b) => b.id === id);
                        setSelectedPrompt(promptObj);
                        setUserText(promptObj?.description);
                      }
                    }}
                  >
                    <Tooltip title="Select Prompt">
                      <MdAlternateEmail className="h-4 w-4 mr-2 text-[#292B38]" />
                    </Tooltip>
                  </AIDropDown>
                )}
                <Dropdown
                  dropdownRender={() => {
                    return (
                      <div className="relative w-full ct-ai-dropdown-changes">
                        <Checkbox
                          checked={selectedHashTag.includes("#Tag")}
                          onChange={(checked) => {
                            if (checked && !selectedHashTag.includes("#Tag")) {
                              setSelectedHashTag([...selectedHashTag, "#Tag"]);
                            } else if (
                              !checked &&
                              selectedHashTag.includes("#Tag")
                            ) {
                              setSelectedHashTag(
                                selectedHashTag.filter((tag) => tag !== "#Tag")
                              );
                            }
                          }}
                        >
                          {"#Tag"}
                        </Checkbox>
                        <Checkbox
                          checked={selectedHashTag.includes("Emojis")}
                          onChange={(checked) => {
                            if (
                              checked &&
                              !selectedHashTag.includes("Emojis")
                            ) {
                              setSelectedHashTag([
                                ...selectedHashTag,
                                "Emojis",
                              ]);
                            } else if (
                              !checked &&
                              selectedHashTag.includes("Emojis")
                            ) {
                              setSelectedHashTag(
                                selectedHashTag.filter(
                                  (tag) => tag !== "Emojis"
                                )
                              );
                            }
                          }}
                        >
                          {"Emojis"}
                        </Checkbox>
                      </div>
                    );
                  }}
                >
                  <FaHashtag className="h-4 w-4 mr-2 text-[#292B38]" />
                </Dropdown>
                {loggedInUser?.ai_settings?.enableOptText && (
                  <Button
                    type="text"
                    onClick={onOptimizePrompt}
                    className="h-4 w-4 mr-2 p-0"
                  >
                    {isOptimizingPrompt ? (
                      <Spin />
                    ) : (
                      <PiMagicWand className="h-4 w-4 mr-2 text-[#292B38]" />
                    )}
                  </Button>
                )}
                {loggedInUser?.ai_settings?.enablePersona && (
                  <AIDropDown
                    items={[
                      ...personas
                        .filter((p) => {
                          return (
                            p.author &&
                            loggedInUser &&
                            p.author?.id === loggedInUser?.id
                          );
                        })
                        .map((p) => {
                          return {
                            name: p.name,
                            id: p.id,
                            isEnableEdit: true,
                            group: "Saved Persona",
                            icon: p.icon,
                            type: "saved-persona",
                          };
                        }),
                      ...personas
                        .filter((p) => {
                          return p.author === null;
                        })
                        .map((p) => {
                          return {
                            name: p.name,
                            id: p.id,
                            isEnableEdit: false,
                            group: "Suggested Persona",
                            icon: p.icon,
                            type: "suggested-persona",
                          };
                        }),
                    ]}
                    selectedItem={selectedPersona?.id}
                    onSelect={async (value) => {
                      const index = personas.findIndex(
                        (p) => p.id === parseInt(value)
                      );
                      if (index !== -1) {
                        const personaObj = personas[index];
                        setSelectedPersona(personaObj);
                        if (loggedInUser) {
                          await dispatch(
                            updateUser({
                              ...loggedInUser,
                              ai_settings: {
                                ...loggedInUser.ai_settings,
                                defaultBrandPersona: personaObj.id,
                                defaultBrandPersonaName: personaObj.name,
                              },
                            })
                          );
                        }
                      }
                    }}
                    createLabel="+ Create new persona"
                    onCreate={onCreatePersona}
                    onEdit={onPersonaEditItemClick}
                    onDelete={onDeleteItemClick}
                    groups={["Saved Persona", "Suggested Persona"]}
                  >
                    <Tooltip title="Select Persona">
                      <PiUserLight className="h-4 w-4 mr-2 text-[#292B38]" />
                    </Tooltip>
                  </AIDropDown>
                )}
                {loggedInUser?.ai_settings?.enableBrandVoice && (
                  <AIDropDown
                    items={[
                      ...voices
                        .filter((v) => {
                          return (
                            v.author &&
                            loggedInUser &&
                            v.author?.id === loggedInUser?.id
                          );
                        })
                        .map((v) => {
                          return {
                            name: v.name,
                            id: v.id,
                            isEnableEdit: true,
                            group: "Saved Voice",
                            icon: v.icon,
                            type: "saved-voice",
                          };
                        }),
                      ...voices
                        .filter((v) => {
                          return v.author === null;
                        })
                        .map((v) => {
                          return {
                            name: v.name,
                            id: v.id,
                            isEnableEdit: false,
                            group: "Suggested Voice",
                            icon: v.icon,
                            type: "suggested-voice",
                          };
                        }),
                    ]}
                    selectedItem={selectedVoice?.id}
                    onSelect={async (value) => {
                      const index = voices.findIndex(
                        (v) => v.id === parseInt(value)
                      );
                      if (index !== -1) {
                        const voiceObj = voices[index];
                        setSelectedVoice(voiceObj);
                        if (loggedInUser) {
                          await dispatch(
                            updateUser({
                              ...loggedInUser,
                              ai_settings: {
                                ...loggedInUser.ai_settings,
                                defaultBrandVoiceId: voiceObj.id,
                                defaultBrandVoiceName: voiceObj.name,
                              },
                            })
                          );
                        }
                      }
                    }}
                    createLabel="+ Create new voice"
                    onCreate={onCreateVoice}
                    onEdit={onVoiceEditItemClick}
                    onDelete={onDeleteItemClick}
                    groups={["Saved Voice", "Suggested Voice"]}
                  >
                    <Tooltip title="Select Brand Voice">
                      <RiUserVoiceLine className="h-4 w-4 mr-2 text-[#292B38]" />
                    </Tooltip>
                  </AIDropDown>
                )}
                {loggedInUser?.ai_settings?.enableModels && (
                  <AIDropDown
                    items={[
                      ...DEFAULT_AI_OPTIONS.map((opt) => {
                        return {
                          name: opt.name,
                          id: `${opt.name}-${opt.model}`,
                          model: opt.model,
                          icon: opt.icon,
                        };
                      }),
                    ]}
                    selectedItem={`${selectedModel?.name}-${selectedModel?.model}`}
                    onSelect={async (model, name) => {
                      const index = DEFAULT_AI_OPTIONS.findIndex(
                        (opt) => opt.model === model && opt.name === name
                      );
                      if (index !== -1) {
                        const obj = DEFAULT_AI_OPTIONS[index];
                        const modelName = obj.model.toLowerCase();
                        if (
                          modelName.includes("claude") &&
                          !loggedInUser?.ai_settings?.claudeAPIKey
                        ) {
                          message.error(
                            "Please add your Claude API Key in settings to use this model"
                          );
                          return;
                        }
                        if (
                          modelName.includes("gemini") &&
                          !loggedInUser?.ai_settings?.geminiAPIKey
                        ) {
                          message.error(
                            "Please add your Gemini API Key in settings to use this model"
                          );
                          return;
                        }
                        if (
                          modelName.includes("gpt") &&
                          !obj.name.toLowerCase().includes("curateit") &&
                          !loggedInUser?.ai_settings?.geminiAPIKey
                        ) {
                          message.error(
                            "Please add your Open API Key in settings to use this model"
                          );
                          return;
                        }
                        setSelectedModel(obj);
                        if (loggedInUser) {
                          await dispatch(
                            updateUser({
                              ...loggedInUser,
                              ai_settings: {
                                ...loggedInUser.ai_settings,
                                defaultAI: obj.name,
                                defaultModel: obj.model,
                              },
                            })
                          );
                        }
                      }
                    }}
                    dropdownType="AI Model"
                  >
                    <Tooltip title="Select Model">
                      <BsRobot className="h-4 w-4 mr-2 text-[#292B38]" />
                    </Tooltip>
                  </AIDropDown>
                )}
                {loggedInUser?.ai_settings?.enableLanguage && (
                  <AIDropDown
                    items={getLanguages()}
                    selectedItem={selectedLanguage?.label}
                    onSelect={async (value) => {
                      let lang = "";
                      const cIdx = CHATGPT_LANG.findIndex(
                        (lang) => lang.label === value
                      );
                      if (cIdx !== -1) {
                        lang = CHATGPT_LANG[cIdx].label;
                        setSelectedLanguage(CHATGPT_LANG[cIdx]);
                        await onUpdateLang(lang);
                        return;
                      }
                      const clIdx = CLOUDE_LANG.findIndex(
                        (lang) => lang.label === value
                      );
                      if (clIdx !== -1) {
                        lang = CLOUDE_LANG[clIdx].label;
                        setSelectedLanguage(CLOUDE_LANG[clIdx]);
                        await onUpdateLang(lang);
                        return;
                      }
                      const gIdx = GEMINI_LANG.findIndex(
                        (lang) => lang.label === value
                      );
                      if (gIdx !== -1) {
                        lang = GEMINI_LANG[gIdx].label;
                        setSelectedLanguage(GEMINI_LANG[gIdx]);
                        await onUpdateLang(lang);
                        return;
                      }
                    }}
                  >
                    <Tooltip title="Select Language">
                      <BsGlobeAmericas className="h-4 w-4 mr-2 text-[#292B38]" />
                    </Tooltip>
                  </AIDropDown>
                )}
                {loggedInUser?.ai_settings?.enableAttachFile && (
                  <Button
                    type="text"
                    onClick={onAttachFileClick}
                    className="h-4 w-4 p-0 mr-2"
                  >
                    <PiPaperclip className="h-4 w-4 mr-2 text-[#292B38]" />
                  </Button>
                )}
                {loggedInUser?.ai_settings?.enableDictate && (
                  <Button
                    type="text"
                    onClick={onDictate}
                    className="h-4 w-4 p-0"
                  >
                    <PiMicrophone className="h-4 w-4 text-[#292B38]" />
                  </Button>
                )}
              </div>
              <button
                className="flex items-center justify-center p-2 bg-[#347AE2] rounded cursor-pointer"
                onClick={handleSubmit}
                disabled={!userText}
              >
                <PiPaperPlaneRight className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {showModal && currentAction === "create" && brandType === "Persona" && (
        <AIBrandModal
          visible={showModal}
          onCancel={onCancelModal}
          action={currentAction}
          title={"Create new brand persona"}
          type={brandType}
          currentName=""
          currentDescription=""
          onSubmit={(persona) => {
            setSelectedPersona(persona);
          }}
          currentId={null}
        />
      )}
      {showModal && currentAction === "create" && brandType === "Voice" && (
        <AIBrandModal
          visible={showModal}
          onCancel={onCancelModal}
          action={currentAction}
          title={"Create new brand voice"}
          type={brandType}
          currentName=""
          currentDescription=""
          onSubmit={(voice) => {
            setSelectedVoice(voice);
          }}
          currentId={null}
        />
      )}
      {showModal &&
        currentAction === "edit" &&
        brandType === "Persona" &&
        currentBrand && (
          <AIBrandModal
            visible={showModal}
            onCancel={onCancelModal}
            action={currentAction}
            title={"Edit brand persona"}
            type={brandType}
            currentName={currentBrand.name}
            currentDescription={currentBrand.description}
            currentId={currentBrand.id}
          />
        )}
      {showModal &&
        currentAction === "edit" &&
        brandType === "Voice" &&
        currentBrand && (
          <AIBrandModal
            visible={showModal}
            onCancel={onCancelModal}
            action={currentAction}
            title={"Edit brand voice"}
            type={brandType}
            currentName={currentBrand.name}
            currentDescription={currentBrand.description}
            currentId={currentBrand.id}
          />
        )}
    </LayoutCommon>
  );
};

export default CurateitAi;
