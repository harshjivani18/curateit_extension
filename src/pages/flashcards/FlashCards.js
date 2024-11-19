/* global chrome */
import React, { useEffect, useState } from "react";
// import jsPDF from "jspdf";
import "./FlashCards.css";
import { MdSaveAlt } from "react-icons/md";
import { TfiLayoutGrid2 } from "react-icons/tfi";
import { CiBoxList } from "react-icons/ci";
import Loader from "../../components/loader/Loader";
import Sidebar from "../../components/commonLayout/Sidebar";
import Summary from "../summary/Summary";
import QuizComp from "../quiz/QuizComp";
import { getCurrentWindowURL } from "../../utils/message-operations";
import { Layout } from "antd";
import Footer from "../../components/commonLayout/Footer";
import Header from "../../components/commonLayout/Header";
import Error from "../../components/ErrorComponent/Error";

const { Content } = Layout;

const FlashCards = (props) => {
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
  const [transcriptError, setTranscriptError] = useState(false);
  const [isListView, setListView] = useState(true);
  const [showComp, setShowComp] = useState("FlashCards");
  const [renderedSelectWrapper, setRenderedSelectWrapper] = useState(false);
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
    const getCall = () => {
      getCurrentWindowURL().then((tab) => {
        window.chrome.tabs.sendMessage(
          tab.id,
          { type: "GET_CURRENT_IFRMAE_WIDTH" },
          (response) => {
            if (response) {
              setCollapsed(response === "50px");
            }
          }
        );
      });
    };
    getCall();
  }, []);

  // const savePdf = () => {
  //   const doc = new jsPDF();
  //   const pageHeight = doc.internal.pageSize.getHeight() - 20;
  //   const pageWidth = doc.internal.pageSize.getWidth() - 20;
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

  //     if (yCoordinate + questionLines.length * 7 > pageHeight) {
  //       doc.addPage();
  //       yCoordinate = 10;
  //     }

  //     doc.text(questionLines, 10, yCoordinate);
  //     yCoordinate = yCoordinate + questionLines.length * 7;

  //     if (yCoordinate + answerLines.length * 7 > pageHeight) {
  //       doc.addPage();
  //       yCoordinate = 10;
  //     }

  //     doc.text(answerLines, 10, yCoordinate);
  //     yCoordinate = yCoordinate + answerLines.length * 7;

  //     if (yCoordinate + 10 > pageHeight) {
  //       doc.addPage();
  //       yCoordinate = 10;
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
    setTranscriptError(false);
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
          setCurrentIndexFlashCards(0);
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
    setTranscriptError(false);
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const siteUrl = tabs[0].url;
      const encodedUrl = encodeURIComponent(siteUrl);

      try {
        const response = await new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            reject(new Error("Text extraction fetch operation timed out"));
          }, 60000);

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
                    <div className="flex flex-row p-[20px] justify-between">
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
                    {showComp === "Summary" ? (
                      <Summary isYt={isYoutube} />
                    ) : null}
                    {showComp === "Quiz" ? <QuizComp isYt={isYoutube} /> : null}
                    {showComp === "FlashCards" ? (
                      <div
                        className="flashCardsWrapper m-auto p-[7px]"
                        style={{
                          width: isListView ? "80%" : "100%",
                        }}
                      >
                        <h1 className="text-center text-black">FlashCards</h1>
                        {isYoutube === "" ? (
                          <button id="startBtn" onClick={checkYoutube}>
                            Start
                          </button>
                        ) : null}

                        {isYoutube === "Yes" && (
                          <>
                            <button
                              onClick={createQuestionAnswers}
                              disabled={loading}
                              id="isYoutubeBtn"
                              className="p-[10px] rounded-md text-white bg-blue-500"
                              style={{ margin: "auto" }}
                            >
                              {loading && hasGeneratedFlashCards
                                ? "Generating Flashcards..."
                                : hasGeneratedFlashCards
                                ? "Generate More Flashcards"
                                : "Generate Flashcards"}
                            </button>
                          </>
                        )}
                        {isYoutube === "No" && (
                          <>
                            <button
                              onClick={handleTextExtraction}
                              disabled={loading}
                              id="isSiteBtn"
                              className="p-[10px] rounded-md text-white bg-blue-500"
                              style={{ margin: "auto" }}
                            >
                              {loading && hasExtractedText
                                ? "Extracting Text..."
                                : hasExtractedText
                                ? "Extract More Text"
                                : "Extract Text"}
                            </button>
                          </>
                        )}
                        {quizData && (
                          <div
                            id="quiz-data"
                            className={`flashCards ${
                              !isListView ? "gridView" : ""
                            }`}
                          >
                            {quizData.length === 0 ? (
                              loading ? (
                                <></>
                              ) : null
                              // <Error
                              //   error={"No Quiz"}
                              //   errorValue={"No Quiz Found"}
                              //   errorCode={errorCode}
                              //   origin={"flashcards"}
                              // />
                            ) : (
                              quizData.map((item, index) => {
                                if (!item.question || !item.answer) {
                                  return null;
                                }

                                return (
                                  <label
                                    key={index}
                                    style={{ width: "100%" }}
                                    className="quiz-label"
                                  >
                                    <input type="checkbox" />
                                    <div className="flip-card">
                                      <div className="front max-w-sm p-6 border rounded-lg bg-blue-50 border-blue-300 flex flex-col justify-between">
                                        <p className="mb-3 text-md">
                                          {item.question}
                                        </p>
                                        <div className="self-end">
                                          <p
                                            className="inline-flex items-center px-3 py-1 text-sm font-medium text-center outline outline-offset-1 
    outline-blue-500 rounded-md border-2 text-blue-700 hover:bg-blue-500 hover:text-white"
                                          >
                                            Show Answer
                                          </p>
                                        </div>
                                      </div>
                                      <div className="back max-w-sm p-6 border rounded-lg bg-blue-50 border-blue-300 flex flex-col justify-between">
                                        <p className="mb-3 text-md">
                                          {item.answer}
                                        </p>
                                        <div className="self-end">
                                          <p
                                            className="inline-flex items-center px-3 py-1 text-sm font-medium text-center outline outline-offset-1 
    outline-blue-500 rounded-md border-2 text-blue-700 hover:bg-blue-500 hover:text-white"
                                          >
                                            Show Question
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </label>
                                );
                              })
                            )}
                          </div>
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
                            origin={"flashcards"}
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

export default FlashCards;
