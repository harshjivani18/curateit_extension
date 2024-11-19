import React, { useState, useRef } from "react";
import { getAudioMediaStream } from "../../utils/message-operations";

const AudioComp = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
      const stream = await getAudioMediaStream();
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        setAudioURL(URL.createObjectURL(audioBlob));
        audioChunks.current = [];
      };
      mediaRecorder.current.start();
      setIsRecording(true);
  };
  

  const stopRecording = () => {
    mediaRecorder.current.stop();
    setIsRecording(false);
  };

  return (
    <div>
      <button
        className="bg-red-700"
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      {audioURL && <audio src={audioURL} controls />}
    </div>
  );
};

export default AudioComp;