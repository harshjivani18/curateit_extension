/* global chrome */
import React, { useState } from "react";
import QuizComp from "./QuizComp";

const QuizResult = (props) => {
  const [isYoutube, setIsYoutube] = useState("");
  const [shouldRenderQuizComp, setShouldRenderQuizComp] = useState(false);

  const checkYoutube = async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      let currentUrl = tabs[0].url;
      if (currentUrl.includes("youtube.com")) {
        setIsYoutube("Yes");
      } else {
        setIsYoutube("No");
      }
      setShouldRenderQuizComp(true); // Set the flag to render QuizComp after state is set
    });
  };

  const handleClick = (event) => {
    event.preventDefault(); // Prevent default navigation
    checkYoutube();
  };

  return (
    <div
      className="score-section rounded-md bg-white w-fit mt-[10px] p-[30px]"
      style={{ color: "black" }}
    >
      <h2 className="text-green-500 font-bold">Well Done!</h2>
      <h4>
        Achieved Score : {props.score}/{1 * props.totalQues}
      </h4>
      <h4>
        Correct Questions {props.CorrectAns} out of {props.totalQues}
      </h4>
      <a
        onClick={props.handlePlayAgain}  
        className="bg-blue-500 m-auto border-none rounded-md p-2"
        style={{ width: "fit-content" }}
      >
        Play Again
      </a>
      {/* {shouldRenderQuizComp && <QuizComp isYt={isYoutube} />} */}
    </div>
  );
};

export default QuizResult;
