import React, { useState, useRef,useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record";
import { Mic02Icon, StopIcon } from "../../hugeicons/Solid";
import { Cancel01Icon } from "../../hugeicons/Stroke";
import { getAudioMediaStream } from "../../utils/message-operations";
import { useDispatch } from "react-redux";
import { getPlanService } from "../../actions/plan-service";
import { Spin } from "antd";


const AudioWaveFormTranscript = ({ onAudioRecorded, onCancelRecording, setIsRecordingCanceled, processingText="", showAudioTag }) => {
  const dispatch = useDispatch();
  const [wavesurfer, setWaveSurfer] = useState(null);
  const [record, setRecord] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  // const initialCountdown = showAudioTag ? 360 : 180; 
  const initialCountdown = 180; 

  const [countdown, setCountdown] = useState(initialCountdown);
  const [isAudioLimitLoading, setIsAudioLimitLoading] = useState(false);
  const [currentAudioTime, setCurrentAudioTime] = useState(null)

  // const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    const createWaveSurfer = async () => {
      if (wavesurfer) {
        wavesurfer.destroy();
      }
      // create a new waveform & size can be changed here
      const newWaveSurfer = WaveSurfer.create({
        container: "#mic",
        waveColor: "#347AE2",
        barWidth: 2,
        barHeight: 2,
        barGap: 2,
        progressColor: "rgb(100, 0, 100)",
        height: 30,
        width: document.getElementById("mic").offsetWidth,
      });

      const newRecord = newWaveSurfer.registerPlugin(
        RecordPlugin.create({
          renderRecordedAudio: false,
        })
      );

      newRecord.on("record-start", () => {
        setCountdown(currentAudioTime);
      });

      newRecord.on("record-end", (blob) => {

        onAudioRecorded(blob);

      });

      setWaveSurfer(newWaveSurfer);
      setRecord(newRecord);
    };
    if (currentAudioTime) {
      createWaveSurfer();
    }
  }, [onAudioRecorded,currentAudioTime]);

  useEffect(() => {
    let timerId;

    if (isRecording) {
      timerId = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    }

    return () => {
      clearInterval(timerId);
    };
  }, [isRecording]);

  useEffect(() => {
    if(!currentAudioTime){
      setIsAudioLimitLoading(true)
      dispatch(getPlanService())
      .then((res) => {
        setIsAudioLimitLoading(false)
        setCountdown(parseInt(res?.payload?.data?.data?.audio_recording))
        setCurrentAudioTime(parseInt(res?.payload?.data?.data?.audio_recording))
      })
    }
  }, [countdown,currentAudioTime])

  //this function is needed in future
  const handlePauseClick = () => {
    if (record.isPaused()) {
      record.resumeRecording();
    } else {
      record.pauseRecording();
    }
  };

  const handleRecordClick = async() => {
    if (record && record.isRecording()) {
      record.stopRecording();
      setCountdown(currentAudioTime);
      setIsRecording(false);
      setIsRecordingCanceled(false);
    } else if (record) {
      record.startRecording();
      setIsRecording(true);
    }
  };

  const handlCancelClick = () => {
    record.stopRecording();
    setCountdown(currentAudioTime);
    setIsRecording(false);
    onCancelRecording();
    setIsRecordingCanceled(true);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="flex block-box justify-between border w-auto bg-white border-[#ABB7C9] rounded-md p-1 items-center gap-2">
      <button
        className={`border ${
          isRecording ? "bg-blue-700 text-white " : " text-blue-700 bg-white"
        } border-blue-700 p-1 rounded-full focus:outline-none hover:border-blue-700`}
        onClick={handleRecordClick}
      >
        {isRecording ? <StopIcon /> : <Mic02Icon />}
      </button>
      {/* waveform container */}
      <div
        id="mic"
        style={{
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          width: "50%",
        }}
      >{processingText}</div>

      <div className={`flex justify-between items-center gap-x-2`}>
        <div className="text-blue-500 rounded-2xl bg-blue-100 px-[10px] py-[2px] text-sm">
          {isAudioLimitLoading ? <Spin tip={''} /> : formatTime(countdown) }
        </div>
        <button
          onClick={handlCancelClick}
          className={`border text-red-600 bg-red-100 ${
            isRecording ? "flex" : "hidden"
          } border-red-600 p-1 rounded-full focus:outline-none hover:border-red-600`}
        >
          <Cancel01Icon />
        </button>
      </div>
    </div>
  );
};

export default AudioWaveFormTranscript;
