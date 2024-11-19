import { useState, useEffect } from "react";
import AudioWaveFormTranscript from "./AudioWaveFormTranscript";
import { getAudioText } from "../../actions/gem";
import { useDispatch } from "react-redux";
import { Input } from "antd";
const { TextArea } = Input;

const TranslatorComponent = ({
  audioEnhancedText,
  setAudioEnhancedText,
  audioOriginalText,
  setAudioOriginalText,
  setAudioRecordSrc,
  showAudioTag,
  onDownloadAudio,
  showRecorder=true
}) => {
  const dispatch = useDispatch();
  const [files, setFiles] = useState();
  const [processingText, setProcessingText] = useState("");
  const [OriginalTextBox, setOriginalTextBox] = useState(false);
  const [isRecordingCanceled, setIsRecordingCanceled] = useState(false);
  const [audioKey, setAudioKey] = useState(0);
  const [playAudio, setPlayAudio] = useState("");

  const handleAudioRecorded = (audioBlob) => {
    const audioFile = new File([audioBlob], "recording.mp3", {
      type: "audio/mp3",
    });
    setFiles(audioFile);
    setAudioRecordSrc && setAudioRecordSrc(audioFile);
    setPlayAudio(URL.createObjectURL(audioFile));
    setAudioKey((prevKey) => prevKey + 1);
  };

  const handleCancelRecording = () => {
    setAudioEnhancedText("");
    setAudioOriginalText("");
    setAudioRecordSrc && setAudioRecordSrc("");
  };

  useEffect(() => {
    const fetchAudioFileData = async () => {
      if (!files || isRecordingCanceled) {
        return;
      }

      const data = await window.chrome?.storage?.sync.get(["userData"]);
      const token = data?.userData?.token || data?.userData?.userData?.token;
      const apiUrl = data?.userData?.apiUrl || data?.userData?.userData?.apiUrl;
      const formData = new FormData();
      formData.append("files", files);

      try {
        setProcessingText("Processing audio file...");
        dispatch(getAudioText(formData))
          .then((response) => {
            setProcessingText("");
            setAudioOriginalText(response?.payload?.data?.data?.originalText);
            // const textData = response?.payload?.data?.data?.enhancedText;
            setAudioEnhancedText && setAudioEnhancedText(response?.payload?.data?.data?.enhancedText);
          })
          .catch((error) => {
            setProcessingText("");
            console.error("Error while fetching audio text:", error);
          });
      } catch (error) {
        console.error("Error while dispatching getAudioText:", error);
      }
    };
    fetchAudioFileData();
  }, [files, isRecordingCanceled]);

  const handleOriginalTextBox = () => {
    setOriginalTextBox(!OriginalTextBox);
  };

  return (
    <div className="flex mb-4 flex-col">
      {showRecorder && <AudioWaveFormTranscript
        onAudioRecorded={handleAudioRecorded}
        onCancelRecording={handleCancelRecording}
        setIsRecordingCanceled={setIsRecordingCanceled}
        processingText={processingText}
        showAudioTag={showAudioTag}
      />}
      <div className="justify-end px-1 mt-2 flex items-center">
        {/* <p className="text-sm text-gray-600">Transcript</p> */}
        <button
          className="text-xs   text-blue-400"
          onClick={handleOriginalTextBox}
        >
          {OriginalTextBox ? "Hide Transcript" : "Show Transcript"}
        </button>
      </div>
      {OriginalTextBox && (
        <TextArea
          className="rounded-md mt-2 overflow-auto text-xs border-[#ABB7C9] focus:border-none hover:border-[#ABB7C9] "
          type="text"
          name="original text"
          placeholder="Original Transcript"
          size="large"
          value={audioOriginalText}
          autoSize={{ minRows: 2 }}
        />
      )}

      {showAudioTag && playAudio && (
        <div className="flex flex-col gap-y-1 ">
          <div className="flex justify-start px-2 mt-2 items-start">
            <div className="text-sm font-medium text-gray-600 ">
              Audio
            </div>
            {/* <div>
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
            </div> */}
          </div>

          <audio src={playAudio} controls className="mt-2" key={audioKey}>
            <source src={playAudio} type="audio/mp3" />
          </audio>
        </div>
      )}
    </div>
  );
};

export default TranslatorComponent;
