/* global chrome */
import React, { useEffect, useState } from "react";
// import { Configuration, OpenAIApi } from "openai";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
import "../flashcards/FlashCards.css";
// import Quiz from "../quiz/Quiz";
import Loader from "../../components/loader/Loader";
import QuizComp from "../quiz/QuizComp";
import FlashCards from "../flashcards/FlashCards";
import { MdSaveAlt } from "react-icons/md";
import { TfiLayoutGrid2 } from "react-icons/tfi";
import { CiBoxList } from "react-icons/ci";
import "./summary.css";
import Sidebar from "../../components/commonLayout/Sidebar";
import { getCurrentWindowURL } from "../../utils/message-operations";
import { Layout } from "antd";
import Footer from "../../components/commonLayout/Footer";
import Header from "../../components/commonLayout/Header";
import Error from "../../components/ErrorComponent/Error";

const { Content } = Layout;

// const configuration = new Configuration({
//   apiKey: process.env.REACT_APP_OPENAI_API_KEY,
// });

// const openai = new OpenAIApi(configuration);

const Summary = (props) => {
  const [transcript, setTranscript] = useState("");
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isYoutube, setIsYoutube] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [text, setText] = useState("");
  const [inputNumber, setInputNumber] = useState(2);
  const [timesCreateHighSiteCalled, setTimesCreateHighSiteCalled] = useState(1);
  const [timesCreateHighYtCalled, setTimesCreateHighYtCalled] = useState(1);
  const [currentIndexFlashCards, setCurrentIndexFlashCards] = useState(0);
  const [currentIndexTextExtraction, setCurrentIndexTextExtraction] =
    useState(0);
  const [hasGeneratedFlashCards, setHasGeneratedFlashCards] = useState(false);
  const [hasExtractedText, setHasExtractedText] = useState(false);
  const [endOfResult, setEndOfResult] = useState(false);
  const [radioSelection, setRadioSelection] = useState("flashCardsWrapper");
  const [transcriptError, setTranscriptError] = useState(false);
  const [isListView, setListView] = useState(true);
  const [highlight, setHighlight] = useState("");
  const [summaryData, setSummaryData] = useState({});
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

  const createHighlightsYt = async () => {
    setTimesCreateHighYtCalled(timesCreateHighYtCalled + 1);
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

          fetch(`${baseUrl}/transcript/${videoId}/0/8000`).then((response) => {
            clearTimeout(timer);
            resolve(response);
          });
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        setTranscript(data.transcription);
        
        setHighlight(data.transcription);
        if (data.transcription == "") {
          setLoading(false);
          setEndOfResult(true);
          return;
        }

        const resp = await fetch(`${baseUrl}/create_highlight/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: `Create the summary of the following text :-
              ${data.transcription}
            `,
          }),
        });

        let result = await resp.json();

        const parsedResult = result.message;
        
        setSummaryData(parsedResult);
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

  const createHighlightsSite = async () => {
    setTimesCreateHighSiteCalled(timesCreateHighSiteCalled + 1);
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

          fetch(`${baseUrl}/extract_article/${encodedUrl}/0/8000`).then(
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

        setText(data.text);
        setHighlight(data.text);
        if (data.text == "") {
          setLoading(false);
          setEndOfResult(true);
          return;
        }

        const resp = await fetch(`${baseUrl}/create_highlight/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: `Create the summary of the following text :-
              ${data.text}
            `,
          }),
        });

        let result = await resp.json();

        const parsedResult = result.message;
        
        setSummaryData(parsedResult);
      } catch (error) {
        setTranscriptError(true);
        setErrorValue(error);
      } finally {
        setLoading(false);
        setHasExtractedText(true);
      }
    });
  };

  const [showComp, setShowComp] = useState("Summary");
  const [renderedSelectWrapper, setRenderedSelectWrapper] = useState(false);

  const handleSelectChange = (e) => {
    setShowComp(e.target.value);
    setRenderedSelectWrapper(true);
  };

  useEffect(() => {

    setIsYoutube(isYoutube);

    if (isYoutube === "Yes") {
      createHighlightsYt();
      setHasGeneratedFlashCards(true);
    } else if (isYoutube === "No") {
      createHighlightsSite();
      setHasExtractedText(true);
    }
  }, [isYoutube]);

  useEffect(() => {
    if (transcriptError) {
      setIsYoutube(isYoutube);
      if (isYoutube === "Yes") {
        createHighlightsYt();
        setHasGeneratedFlashCards(true);
      } else if (isYoutube === "No") {
        createHighlightsSite();
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
                    <div className="flex flex-row p-[20px] justify-between ">
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
                    {showComp === "Quiz" ? <QuizComp isYt={isYoutube} /> : null}
                    {showComp === "FlashCards" ? (
                      <FlashCards isYt={isYoutube} />
                    ) : null}
                    {showComp === "Summary" ? (
                      <div
                        className="flashCardsWrapper"
                        style={{
                          width: isListView ? "" : "100%",
                          padding: "20px",
                          margin: "0 auto",
                        }}
                      >
                        {summaryData && (
                          <div className="MuiGrid-root MuiGrid-container MuiGrid-spacing-xs-1 css-1cym44n text-black">
                            <div className="MuiGrid-root MuiGrid-item MuiGrid-grid-xs-12 css-15j76c0">
                              <h5 className="MuiTypography-root MuiTypography-h5 css-11604fz text-center">
                                {summaryData.title}
                              </h5>
                            </div>
                            <div className="MuiGrid-root MuiGrid-item MuiGrid-grid-xs-12 css-15j76c0">
                              <div className="MuiBox-root css-1vfxzmk text-center">
                                <p className="p-[10px]">
                                  {summaryData.highlight}
                                </p>
                              </div>
                            </div>

                            {summaryData.keypoints && (
                              <div className="MuiGrid-root MuiGrid-container MuiGrid-spacing-xs-1 css-tuxzvu">
                                <div className="MuiGrid-root MuiGrid-item MuiGrid-grid-xs-12 css-15j76c0">
                                  <div className="MuiBox-root css-jejy0m">
                                    <strong className="MuiTypography-root MuiTypography-subtitle1 css-11arlvz">
                                      Key Mentions
                                    </strong>
                                    <div className="flex flex-wrap">
                                      {summaryData.keypoints.map(
                                        (keypt, index) => (
                                          <div
                                            key={index}
                                            style={{
                                              flex: "1 0 20%",
                                              boxSizing: "border-box",
                                              padding: "10px",
                                              textAlign: "center",
                                              height: "fit-content",
                                            }}
                                            className="MuiGrid-root MuiGrid-container css-1d3bbye"
                                          >
                                            <div className="MuiGrid-root MuiGrid-item MuiGrid-grid-xs-12 css-15j76c0">
                                              <div
                                                className="MuiButtonBase-root MuiChip-root MuiChip-outlined MuiChip-sizeMedium MuiChip-colorDefault MuiChip-clickable MuiChip-clickableColorDefault MuiChip-outlinedDefault css-n08mak"
                                                tabIndex="0"
                                                role="button"
                                                style={{ height: "100%" }}
                                              >
                                                <span className="MuiChip-label MuiChip-labelMedium css-9iedg7">
                                                  <span
                                                    style={{
                                                      textWrap: "balance",
                                                    }}
                                                  >
                                                    {keypt.point}
                                                  </span>
                                                </span>
                                                <span className="MuiTouchRipple-root css-w0pj6f"></span>
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
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
                            origin={"summary"}
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

export default Summary;
