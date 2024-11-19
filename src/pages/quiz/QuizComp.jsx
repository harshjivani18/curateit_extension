/* global chrome */
import React, { useEffect, useState } from "react";
// import { Configuration, OpenAIApi } from "openai";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
import "../flashcards/FlashCards.css";
import Quiz from "./Quiz";
import FlashCards from "../flashcards/FlashCards";
import Summary from "../summary/Summary";
import { MdSaveAlt } from "react-icons/md";
import { TfiLayoutGrid2 } from "react-icons/tfi";
import { CiBoxList } from "react-icons/ci";
import Loader from "../../components/loader/Loader";
import Sidebar from "../../components/commonLayout/Sidebar";

import { Layout } from "antd";
import Footer from "../../components/commonLayout/Footer";
import Header from "../../components/commonLayout/Header";
import Error from "../../components/ErrorComponent/Error";

const { Content } = Layout;

// const configuration = new Configuration({
//   apiKey: process.env.REACT_APP_OPENAI_API_KEY,
// });

// const openai = new OpenAIApi(configuration);

const QuizComp = (props) => {
  const [transcript, setTranscript] = useState("");
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isYoutube, setIsYoutube] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [text, setText] = useState("");
  const [inputNumber, setInputNumber] = useState(2);
  const [timesTextExtrCalled, setTimesTextExtrCalled] = useState(1);
  const [timescreateQusCalled, setTimescreateQusCalled] = useState(1);
  const [currentIndexFlashCards, setCurrentIndexFlashCards] = useState(0);
  const [currentIndexTextExtraction, setCurrentIndexTextExtraction] =
    useState(0);
  const [hasGeneratedFlashCards, setHasGeneratedFlashCards] = useState(false);
  const [hasExtractedText, setHasExtractedText] = useState(false);
  const [endOfResult, setEndOfResult] = useState(false);
  const [radioSelection, setRadioSelection] = useState("flashCardsWrapper");
  const [transcriptError, setTranscriptError] = useState(false);
  const [isListView, setListView] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [errorValue, setErrorValue] = useState();
  const [errorCode, setErrorCode] = useState();

  const baseUrl = process.env.REACT_APP_PYTHON_API;
  const checkYoutube = async () => {
    setIsYoutube("");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      let currentUrl = tabs[0].url;
      setSiteUrl(currentUrl);
      if (currentUrl.includes("youtube.com")) {
        setIsYoutube("Yes");
      } else {
        setIsYoutube("No");
      }
    });
  };

  useEffect(() => {
    checkYoutube();
  }, []);

  function extractJSON(str) {
    // Check if the string starts with "(" and ends with ")"
    if (str.startsWith("(") && str.endsWith(")")) {
      str = str.substring(1, str.length - 1); // Remove the parentheses
    }

    let startIndex = str.indexOf("[");
    let endIndex = str.lastIndexOf("]") + 1;
    let jsonStr = str.substring(startIndex, endIndex);

    return jsonStr;
  }

  // const savePdf = () => {
  //   const doc = new jsPDF();
  //   const pageHeight = doc.internal.pageSize.getHeight() - 20; // consider some margin
  //   const pageWidth = doc.internal.pageSize.getWidth() - 20; // consider some margin
  //   let yCoordinate = 10;

  //   quizData.forEach((item, index) => {
  //     const questionLines = doc.splitTextToSize(
  //       `Question ${index + 1}: ${item.question}`,
  //       pageWidth
  //     );
  //     const answerLines = doc.splitTextToSize(
  //       `Answer ${index + 1}: ${item.answer}`,
  //       pageWidth
  //     );

  //     // Check if adding the question lines would exceed page height
  //     if (yCoordinate + questionLines.length * 7 > pageHeight) {
  //       doc.addPage();
  //       yCoordinate = 10; // Reset y coordinate to top of new page
  //     }

  //     doc.text(questionLines, 10, yCoordinate);
  //     yCoordinate = yCoordinate + questionLines.length * 7; // consider line spacing for question text

  //     // Check if adding the answer lines would exceed page height
  //     if (yCoordinate + answerLines.length * 7 > pageHeight) {
  //       doc.addPage();
  //       yCoordinate = 10; // Reset y coordinate to top of new page
  //     }

  //     doc.text(answerLines, 10, yCoordinate);
  //     yCoordinate = yCoordinate + answerLines.length * 7; // consider line spacing for answer text

  //     // Add space between different QA pairs, and check if it would exceed page height
  //     if (yCoordinate + 10 > pageHeight) {
  //       doc.addPage();
  //       yCoordinate = 10; // Reset y coordinate to top of new page
  //     } else {
  //       yCoordinate = yCoordinate + 10;
  //     }
  //   });
  //   doc.save("quiz.pdf");
  // };

  const createQuestionAnswers = async () => {
    setTimescreateQusCalled(timescreateQusCalled + 1);
    setLoading(true);
    setEndOfResult(false);
    setTranscriptError(false); // Resetting the error status before a new request

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const siteUrl = tabs[0].url;

      const url = new URL(siteUrl);
      const videoId = new URLSearchParams(url.search).get("v");

      try {
        const response = await new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            reject(new Error("Transcription fetch operation timed out"));
          }, 60000); // 60 seconds

          fetch(
            `${baseUrl}/transcript/${videoId}/${currentIndexFlashCards}/${
              currentIndexFlashCards + 3000
            }`
          ).then((response) => {
            clearTimeout(timer);
            resolve(response);
          });
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (currentIndexFlashCards + 3000 >= data.transcription.length) {
          setCurrentIndexFlashCards(0); // Reset index to 0 if we've reached the end
        } else {
          setCurrentIndexFlashCards(currentIndexFlashCards + 3000);
        }

        setTranscript(data.transcription);

        if (data.transcription == "") {
          setLoading(false);
          setEndOfResult(true);
          return;
        }

        const resp = await fetch(`${baseUrl}/ask_query/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: `Create ${
              timescreateQusCalled == 2 || timescreateQusCalled == 3 ? "5" : "2"
            } question and answer based on the following context :- 
              ${data.transcription}
            `,
          }),
        });
        let result = await resp.json();
        const parsedResult = result.message;
        setQuizData((oldQuizData) => [...oldQuizData, ...parsedResult]);
        setCurrentIndexFlashCards(currentIndexFlashCards + 3000);
      } catch (error) {
        console.error("error : ", error);
        setTranscriptError(true);
        setErrorValue(error);
      } finally {
        setLoading(false);
      }
      setHasGeneratedFlashCards(true);
    });
  };

  const handleTextExtraction = async () => {
    setTimesTextExtrCalled(timesTextExtrCalled + 1);
    setLoading(true);
    setEndOfResult(false);
    setTranscriptError(false); // Resetting the error status before a new request

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const siteUrl = tabs[0].url;
      const encodedUrl = encodeURIComponent(siteUrl);

      try {
        const response = await new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            reject(new Error("Text extraction fetch operation timed out"));
          }, 60000); // 60 seconds

          fetch(
            `${baseUrl}/extract_article/${encodedUrl}/${currentIndexTextExtraction}/${
              currentIndexTextExtraction + 3000
            }`
          ).then(
            (response) => {
              clearTimeout(timer);
              resolve(response);
            },
            (error) => {
              clearTimeout(timer);
              reject(error);
            }
          );
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        

        if (data.error) {
          setErrorCode(data.error);
          throw new Error(data.error);
        }

        if (currentIndexTextExtraction + 3000 >= data.text.length) {
          setCurrentIndexTextExtraction(0); // Reset index to 0 if we've reached the end
        } else {
          setCurrentIndexTextExtraction(currentIndexTextExtraction + 3000);
        }

        setText(data.text);
        if (data.text == "") {
          setLoading(false);
          setEndOfResult(true);
          return;
        }

        const resp = await fetch(`${baseUrl}/ask_query/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: `Create ${
              timesTextExtrCalled == 2 || timesTextExtrCalled == 3 ? "5" : "2"
            } question and answer based on the following context :- 
              ${data.text}
            `,
          }),
        });

        let result = await resp.json();

        const parsedResult = result.message;
        const parsedResultArray = Array.isArray(parsedResult)
          ? parsedResult
          : [parsedResult];
        setQuizData((oldQuizData) => [...oldQuizData, ...parsedResultArray]);
        setCurrentIndexTextExtraction(currentIndexTextExtraction + 3000);
      } catch (error) {
        console.error(error);
        setTranscriptError(true);
        setErrorValue(error);
      } finally {
        setLoading(false);
        setHasExtractedText(true);
      }
    });
  };
  const [showComp, setShowComp] = useState("Quiz");
  const [renderedSelectWrapper, setRenderedSelectWrapper] = useState(false);

  const handleSelectChange = (e) => {
    setShowComp(e.target.value);
    setRenderedSelectWrapper(true);
  };

  useEffect(() => {
    setIsYoutube(isYoutube);
    if (isYoutube === "Yes") {
      createQuestionAnswers();
      setHasGeneratedFlashCards(true);
    } else if (isYoutube === "No") {
      handleTextExtraction();
      setHasExtractedText(true);
    }
  }, [isYoutube]);

  useEffect(() => {
    if (quizData.length === 2) {
      if (isYoutube === "Yes") {
        setInputNumber(5);
        createQuestionAnswers();
      } else if (isYoutube === "No") {
        setInputNumber(5);
        handleTextExtraction();
      }
    } else if (quizData.length === 7) {
      if (isYoutube === "Yes") {
        setInputNumber(5);
        createQuestionAnswers();
      } else if (isYoutube === "No") {
        setInputNumber(5);
        handleTextExtraction();
      }
    }
  }, [quizData.length, isYoutube]);

  useEffect(() => {
    if (transcriptError) {
      console.log("transcript error occurred retrying quiz");
      setIsYoutube(isYoutube);
      if (isYoutube === "Yes") {
        createQuestionAnswers();
        setHasGeneratedFlashCards(true);
      } else if (isYoutube === "No") {
        handleTextExtraction();
        setHasExtractedText(true);
      }
    }
  }, [isYoutube]);

  return (
    <>
      <Layout
        style={{
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setTextExtract={props.setTextExtract}
        />
        {collapsed && !showMenu && <></>}

        {collapsed && showMenu && (
          <>
            <Layout
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                tooltipPlacement="top"
              />
            </Layout>
            <Footer collapsed={collapsed} setCollapsed={setCollapsed} />
          </>
        )}

        {!collapsed && (
          <>
            <Layout
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div className="overflow-y-scroll flex-1 h-full bg-white relative">
                <Content style={{ background: "#FCFCFD" }}>
                  {!renderedSelectWrapper && (
                    <div className="selectWrapper flex flex-row p-[20px] justify-between">
                      {/* <select
            value={showComp}
            onChange={handleSelectChange}
            className="outline outline-offset-2 outline-blue-500 text-black px-4 py-2 rounded-md"
          >
            <option value="" disabled>
              --Select--
            </option>
            <option value="Quiz">Quiz</option>
            <option value="FlashCards">Flashcards</option>
            <option value="Summary">Summary Highlights</option>
          </select> */}
                      <div className="layoutWrapper flex items-center gap-[10px]">
                        <div
                          onClick={() => {
                            setListView(false);
                          }}
                          className={`layout rounded-md p-[7px] cursor-pointer ${
                            !isListView ? "bg-blue-500 text-white" : ""
                          }`}
                        >
                          <TfiLayoutGrid2 size={23} />
                        </div>
                        <div
                          onClick={() => {
                            setListView(true);
                          }}
                          className={`layout rounded-md p-[7px] cursor-pointer ${
                            isListView ? "bg-blue-500 text-white" : ""
                          }`}
                        >
                          <CiBoxList size={23} />
                        </div>
                        {/* {quizData.length > 0 && (
                          <div
                            className="layout ml-[10px] rounded-md bg-white p-[7px] cursor-pointer bg-[#e1e1]"
                            onClick={savePdf}
                          >
                            <MdSaveAlt size={23} />
                          </div>
                        )} */}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-row gap-[10px] justify-between">
                    {showComp === "FlashCards" ? (
                      <FlashCards isYt={isYoutube} />
                    ) : null}
                    {showComp === "Summary" ? (
                      <Summary isYt={isYoutube} />
                    ) : null}
                    {showComp === "Quiz" ? (
                      <div
                        className="flashCardsWrapper"
                        style={{ margin: "0 auto" }}
                      >
                        <h1 className="text-center text-black">Quiz</h1>
                        {isYoutube === "" ? (
                          <button onClick={checkYoutube}>Start</button>
                        ) : null}

                        {isYoutube === "Yes" && (
                          <button
                            onClick={createQuestionAnswers}
                            disabled={loading}
                            className="p-[10px] rounded-md text-white bg-blue-500"
                            style={{ margin: "auto" }}
                          >
                            {loading && hasGeneratedFlashCards
                              ? "Generating Questions..."
                              : hasGeneratedFlashCards
                              ? "Generate More Questions"
                              : "Generate Questions"}
                          </button>
                        )}
                        {isYoutube === "No" && (
                          <button
                            onClick={handleTextExtraction}
                            disabled={loading}
                            className="p-[10px] rounded-md text-white bg-blue-500"
                            style={{ margin: "auto" }}
                          >
                            {loading && hasExtractedText
                              ? "Generating Questions..."
                              : hasExtractedText
                              ? "Get More Questions"
                              : "Get Questions"}
                          </button>
                        )}
                        {quizData.length > 0 &&
                          quizData.every(
                            (question) =>
                              question.answerOptions &&
                              Array.isArray(question.answerOptions) &&
                              question.answerOptions.length > 0
                          ) && (
                            <>
                              <Quiz
                                questions={quizData}
                                listView={isListView}
                                handleTextExtraction={handleTextExtraction}
                              />
                            </>
                          )}

                        {loading && <Loader />}
                        {endOfResult && (
                          <h3 style={{ color: "black", textAlign: "center" }}>
                            No more Content
                          </h3>
                        )}
                        {transcriptError && (
                          <Error
                            error={transcriptError}
                            errorValue={errorValue}
                            errorCode={errorCode}
                            origin={"quiz"}
                          />
                        )}
                      </div>
                    ) : null}

                    {/* <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          className="fixed top-0 right-0"
        /> */}
                  </div>
                </Content>
              </div>
              <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            </Layout>
            <Footer collapsed={collapsed} />
          </>
        )}
      </Layout>

      {/* ******** */}
    </>
  );
};

export default QuizComp;
