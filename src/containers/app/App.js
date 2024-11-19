/*global chrome*/
import "./App.css";
import "react-quill/dist/quill.snow.css";
import { createContext, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import SeoInsights from "../seoInsights/SeoInsights";
import ForgotPassword from "../membership/ForgotPassword";
import Login from "../membership/Login";
import LinkVerified from "../membership/LinkVerified";
import BookmarkPage from "../bookmark/BookmarkPage";
import CodePage from "../code/CodePage";
import ImagePage from "../images/ImagePage";
import AudioPage from "../audio/AudioPage";
import VideoPage from "../video/VideoPage";
import HighlightPage from "../highlights/Highlight";
import CitationsPage from "../citations/CitationsPage";
import PDFPage from "../pdf/PDFPage";
import NotePage from "../notes/NotePage";
import Home from "../home/Home";
import HomeTabPage from "../home/HomeTabPage";
import ScreenshotsOptionPage from "../screenshots/ScreenshotOptionPage";
import UploadPDFPage from "../pdf/UploadPDFPage";
import ArticlePage from "../articles/ArticlePage";
// import Gems                                   from '../gems/Gems';
import SaveTabs from "../bookmark/SaveTabs";
import ReportBug from "../report-bugs/ReportBug";
import AppGemPage from "../app-gems/AppGem";
import ProductPage from "../products/ProductPage";
import BookPage from "../books/BookPage";
import MoviePage from "../movies/MoviePage";
import ProfilePage from "../profiles/ProfileGemPage";
import AIPromptPage from "../ai-prompts/AIPromptPage";
import TextPage from "../texts/TextPage";
import QuotePage from "../quotes/QuotePage";
import ScreenshotPage from "../screenshots/ScreenshotPage";
import FlashCards from "../../pages/flashcards/FlashCards";
import QuizComp from "../../pages/quiz/QuizComp";
import Summary from "../../pages/summary/Summary";
// import SelectCollection                       from '../../pages/SelectCollection';
// import SaveTabs                               from '../../pages/SaveTabs';
// import Highlights                             from '../../pages/Highlights';
// import SingleHighlight                        from '../../pages/SingleHighlight';
// import HighlightPanel                         from '../../pages/HighlightPanel';
// import CodeSnippetPanel                       from '../../pages/CodeSnippetPanel';
// import ListHighlightCode                      from '../../pages/ListHighlightCode';
// import SingleCode                             from '../../pages/SingleCode';
// import CodeSnippetPanelDetails                from '../../pages/CodeSnippetPanelDetails';
// import ImagePanel                             from '../../pages/ImagePanel';
// import ImagePanelDetails                      from '../../pages/ImagePanelDetails';
// import SingleImage                            from '../../pages/SingleImage';
// import PdfHighlight                           from '../../pages/PdfHighlight';
// import ReportBug                              from '../../pages/ReportBug';
import session from "../../utils/session";
import {
  sendEnableFloatCodeMenuToChrome,
  sendEnableFloatImageMenuToChrome,
  sendEnableFloatMenuToChrome,
  sendSidebarPositionToChrome,
  sendSidebarViewType,
  sendThemeToChrome,
} from "../../utils/send-theme-to-chrome";
import { fetchCurrentTab } from "../../utils/fetch-current-tab";
import { updateLocation } from "../../utils/update-location";
// import { setCurrentSiteData }                 from '../../utils/set-current-site-data';

import { fetchUserDetails } from "../../actions/user";
import { getAllHighlights } from "../../actions/highlights";
import HighlightTabPage from "../page-highlights/HighlightTabPage";
import InfoTabPage from "../info/InfoTabPage";
import AllArticleTabPage from "../allAtricles/AllArticleTabPage";
import AllSaveTabPage from "../allSaveTabs/AllSaveTabPage";
import CustomApplication from "../custom-application/CustomApplication";
import DefaultSidebarApps from "../custom-application/DefaultSidebarApps";
import { SettingPage } from "../setting/SettingPage";
import { UserProfile } from "../userProfile/UserProfile";
import AddImportDetails from "../addImportDetails/AddImportDetails";
import SocialFeedPage from "../social-feed/SocialFeedPage";
import AllTextExpanderPage from "../allTextExpander/AllTextExpanderPage";
import EditCollection from "../collections/EditCollection";
import TestimonialsPage from "../testimonials/TestimonialsPage";
import ImportContainer from "../bulkImportDetails/ImportContainer";
import ProfileFeedPage from "../social-feed/ProfileFeedPage";
import AiNotes from "../ytHighlights/AiNotes";
import { changeEnableFloatMenu } from "../../actions/user";
import ShareCollection from "../collections/ShareCollection";
import CurateitAi from "../ai/CurateitAi";
// import { getCookieForLoginDetails } from '../../utils/cookies'
// import { getAllTypeHighlights,
//          getAllHighlights,
//          updateHighlightsArr}                   from '../../actions/highlights';
// import { setCurrentGem,
//          fetchGemById,
//          setCurrentMedia}                     from '../../actions/gem';
// import { removeGemFromCollection } from '../../actions/collection';

export const themeContext = createContext();

function App() {
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.user.themeMode);
  const userData = useSelector((state) => state.user.userData);
  const tabDetails = useSelector((state) => state.app.tab);
  const sidebarPosition = useSelector((state) => state.user.sidebarPosition);
  const enableFloatMenu = useSelector((state) => state.user.enableFloatMenu);
  const allHighlights = useSelector(
    (state) => state.highlights.allTypeHighlights
  );

  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessComplete, setIsProcessComplete] = useState(false);

  useEffect(() => {
    if (tabDetails) {
      updateInitialState(tabDetails);
      if (window.location.search.includes("pdfHighlight")) {
        updateLocation(window.location.search, tabDetails, navigate, []);
      } else if (session.token) {
        navigate("/search-bookmark");
      } else {
        navigate("/login");
      }
      // updateLocation(tabDetails)
    } else {
      fetchCurrentTab().then((res) => {
        updateInitialState(res);
        if (window.location.search.includes("pdfHighlight")) {
          updateLocation(window.location.search, res, navigate, []);
        } else if (session.token) {
          navigate("/search-bookmark");
        } else {
          navigate("/login");
        }
        // updateLocation(res)
      });
    }
    window.addEventListener("message", onMessageReceived);
    return () => {
      window.removeEventListener("message", onMessageReceived);
    };
  }, []);

  const onMessageReceived = async (e) => {
    const { data } = e;
    if (!data || (typeof data === "string" && data?.includes("MENU"))) return;
    if (data && typeof data === "string" && data?.includes("CT_REMOVE_TAB_LISTEN")) return;
    if (data && typeof data === "string" && data?.includes("userDetails")) return;
    if (data && typeof data === "string" &&  data?.includes("CT_HIDE_MY_HIGHLIGHT")) {
      dispatch(changeEnableFloatMenu(false, false));
      return;
    }
    const tab = tabDetails || (await fetchCurrentTab());
    if (!session.token) {
      navigate(`/login`);
      window.location.href = `${window.location.href}${data}`;
      return;
    }
    updateLocation(data, tab, navigate, allHighlights);
  };

  // useEffect(() => {
  //   const getCall = async () => {
  //       const tabObj = tabDetails || await fetchCurrentTab()
  //       if (tabObj) {
  //         const response = await dispatch(getAllHighlights(tabObj.url))
  //         if(response.error === undefined){
  //           const highlightData = response.payload.data

  //           window.chrome.tabs.sendMessage(tabObj.id, { value: highlightData, type: "CT_HIGHLIGHT_DATA" })
  //         }
  //       }
  //   }

  //   getCall()
  // },[])

  const updateInitialState = (tabObj) => {
    // if (session.currentSiteData === undefined || session.currentSiteData === null) {
    //   setCurrentSiteData(tabObj)
    // }
    if (
      session.token &&
      userData === null &&
      session.token !== "undefined" &&
      !isProcessComplete
    ) {
      dispatch(fetchUserDetails()).then(async (res) => {
        if (res.error === undefined && res.payload.error === undefined) {
          session.clearCurrentSiteData();
          sendThemeToChrome(themeMode === "dark", "APP", tabObj);
          // sendSidebarPositionToChrome(sidebarPosition, tabObj)
          const fm = enableFloatMenu === true ? "SHOW" : "HIDE";
          // sendEnableFloatMenuToChrome(fm, tabObj);

          // const tabDetails = await fetchCurrentTab()
          const imageOpt =
            res?.payload?.data?.preferences?.show_image_option === true
              ? "SHOW"
              : "HIDE";
          // sendEnableFloatImageMenuToChrome(imageOpt, tabObj);
          const codeOpt =
            res?.payload?.data?.preferences?.show_code_option === true
              ? "SHOW"
              : "HIDE";
          sendEnableFloatCodeMenuToChrome(codeOpt, tabObj);
          sendSidebarPositionToChrome(
            res?.payload?.data?.preferences?.sidebar_position ||
              sidebarPosition ||
              "right",
            tabObj
          );
          sendSidebarViewType(
            res?.payload?.data?.preferences?.sidebar_view || "auto_hide",
            tabObj
          );

          if (tabObj) {
            const response = await dispatch(getAllHighlights(tabObj.url));
            if (
              response.error === undefined &&
              response.payload &&
              response.payload.data &&
              response.payload.data.length > 0
            ) {
              const highlighData = response.payload.data;
              window.chrome.tabs.sendMessage(tabObj.id, {
                value: JSON.stringify(highlighData),
                type: "CT_HIGHLIGHT_DATA",
              });
            } else {
              const highlighData = [];
              window.chrome.tabs.sendMessage(tabObj.id, {
                value: JSON.stringify(highlighData),
                type: "CT_HIGHLIGHT_DATA",
              });
            }
          }
        } else if (
          res.error !== undefined &&
          res.error.response?.status === 401 &&
          !location.pathname.includes("/login")
        ) {
          navigate("/login");
          sendThemeToChrome(false, "APP - Without Login", tabObj);
          sendSidebarPositionToChrome(sidebarPosition, tabObj);
          const fm = enableFloatMenu === true ? "SHOW" : "HIDE";
          // sendEnableFloatMenuToChrome(fm, tabObj);
        }
        setIsProcessComplete(true);
      });
    } else if (session.token === null || session.token === "undefined") {
      sendThemeToChrome(false, "APP - Without Login", tabObj);
      sendSidebarPositionToChrome(sidebarPosition, tabObj);
      const fm = enableFloatMenu === true ? "SHOW" : "HIDE";
      // sendEnableFloatMenuToChrome(fm, tabObj);
    }
  };

  // const updateLocation = (tab) => {
  //   const { href } = window.location
  //   if (href.includes("?add-bookmark")) {
  //     navigate("/add-bookmark")
  //   }
  //   else if (href.includes("?add-highlight")) {
  //     navigate("/highlight-panel")
  //   }
  //   else if (href.includes("?edit-highlight")) {
  //     window.chrome.storage.sync.get("highlightUpdate", (data) => {
  //       if (data && data.highlightUpdate && data.highlightUpdate.current) {
  //         const { id, media } = data.highlightUpdate.current
  //         if (allHighlights.length !== 0) {
  //           const idx           = allHighlights.findIndex((o) => { return o.id === id })
  //           if (idx !== -1) {
  //             dispatch(setCurrentGem({ ...allHighlights[idx], parent: allHighlights[idx].collection_gems, collection_id: allHighlights[idx].collection_gems?.id }))
  //             dispatch(setCurrentMedia(media))
  //             window.chrome.storage.sync.remove('highlightUpdate')
  //             navigate("/highlight-panel")
  //           }
  //         }
  //         else {
  //           dispatch(getAllTypeHighlights(tab.url)).then((res) => {
  //             if (res.error === undefined) {
  //               const { data }      = res.payload
  //               const idx           = data.findIndex((o) => { return o.id === id })
  //               if (idx !== -1) {
  //                 dispatch(setCurrentGem({ ...data[idx], parent: data[idx].collection_gems, collection_id: data[idx].collection_gems?.id }))
  //                 dispatch(setCurrentMedia(media))
  //                 window.chrome.storage.sync.remove('highlightUpdate')
  //                 navigate("/highlight-panel")
  //               }
  //             }
  //           })
  //         }
  //       }
  //     })
  //   }
  //   else if (href.includes("?delete-highlight")) {
  //     window.chrome.storage.sync.get("highlightDelete", (data) => {
  //       if (data && data.highlightUpdate?.current) {
  //         const { current } = data.highlightUpdate
  //         dispatch(removeGemFromCollection(current.id, current.parent))
  //         dispatch(updateHighlightsArr(current, "delete"))
  //         window.chrome.storage.sync.remove('highlightDelete')
  //         navigate("/search-bookmark")
  //       }
  //     })
  //   }
  //   else if (href.includes("?add-code")) {
  //     navigate("/codesnippet-panel")
  //   }
  //   else if (href.includes("?highlight-list")) {
  //     navigate("/search-bookmark?highlights")
  //   }
  //   else if (href.includes("?image")) {
  //     navigate("/image-panel")
  //   }
  //   else if (href.includes("?pdfHighlight")) {
  //     const params        = new URLSearchParams(window.location.search)
  //     const file          =  params.get('file')
  //     const originalFile  =  params.get('originalFile')
  //     navigate(`/pdf-highlight?file=${file ? file : ''}&originalFile=${originalFile ? originalFile :''}`)
  //   }
  // }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/signupVerified"
        element={<LinkVerified message={"SignUp Successfully"} target={"/"} />}
      />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route
        path="/forgotverified"
        element={
          <LinkVerified
            message={"Forgot Password link has been sent to your email"}
            target={"/login"}
          />
        }
      />
      <Route path="/add-bookmark" element={<BookmarkPage />} />
      <Route path="/bookmark/:id" element={<BookmarkPage />} />
      <Route path="/codesnippet-panel" element={<CodePage />} />
      <Route path="/image-panel" element={<ImagePage />} />
      <Route path="/audio-panel" element={<AudioPage />} />
      <Route path="/video-panel" element={<VideoPage />} />
      <Route path="/search-bookmark" element={<HomeTabPage />} />
      <Route path="/all-highlights" element={<HighlightTabPage />} />
      <Route path="/info" element={<InfoTabPage rendering={"info"} />} />
      <Route path="/seo" element={<InfoTabPage rendering={"seo"} />} />
      <Route path="/highlight-panel" element={<HighlightPage />} />
      <Route path="/pdf-highlight" element={<PDFPage />} />
      <Route path="/save-tabs" element={<SaveTabs />} />
      <Route path="/note" element={<NotePage />} />
      <Route path="/upload-pdf" element={<UploadPDFPage />} />
      <Route path="/report-bug" element={<ReportBug />} />
      <Route path="/article" element={<ArticlePage />} />
      <Route path="/all-article" element={<AllArticleTabPage />} />
      <Route path="/all-save-tabs" element={<AllSaveTabPage />} />
      <Route path="/app-gem" element={<AppGemPage />} />
      <Route path="/product" element={<ProductPage />} />
      <Route path="/book" element={<BookPage />} />
      <Route path="/movie" element={<MoviePage />} />
      <Route path="/profile-gem" element={<ProfilePage />} />
      <Route path="/ai-prompt" element={<AIPromptPage />} />
      <Route path="/text" element={<TextPage />} />
      <Route path="/quick-note" element={<AiNotes />} />
      <Route path="/all-text-expanders" element={<AllTextExpanderPage />} />
      <Route path="/quote" element={<QuotePage />} />
      <Route path="/screenshot" element={<ScreenshotPage />} />
      <Route path="/screenshot-options" element={<ScreenshotsOptionPage />} />
      <Route path="/default-sidebar-apps" element={<DefaultSidebarApps />} />
      <Route path="/custom-application" element={<CustomApplication />} />
      <Route path="/setting" element={<SettingPage />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/social-feed" element={<SocialFeedPage />} />
      <Route path="/profile-feed" element={<ProfileFeedPage />} />
      <Route path="/testimonial" element={<TestimonialsPage />} />
      <Route path="/add-import-details" element={<AddImportDetails />} />
      <Route path="/import-container" element={<ImportContainer />} />
      <Route path="/citations" element={<CitationsPage />} />
      <Route path="/collection/:id" element={<EditCollection />} />
      <Route path="/" element={<Home />} />
      <Route path="/seo" element={<SeoInsights />} />
      <Route path="/share-collection/:id" element={<ShareCollection />} />
      <Route path="/ai" element={<CurateitAi />} />
      {/* <Route path="/flashcards" element={ <FlashCards/> } />
      <Route path="/quiz" element={<QuizComp />} />
      <Route path="/summary" element={<Summary />} /> */}
      <Route path="/flashcards" element={<h1>Coming Soon</h1>} />
      <Route path="/quiz" element={<h1>Coming Soon</h1>} />
      <Route path="/summary" element={<h1>Coming Soon</h1>} />
      {/* <Route path="/highlight/:collectionId/:gemId/:highlightId" element={<HighlightPage />} />
      <Route path="/code/:collectionId/:gemId/:codeId" element={<CodePage />} />
      <Route path="/image/:collectionId/:gemId" element={<ImagePage />} />
      <Route path="/audio/:collectionId/:gemId" element={<AudioPage />} />
      <Route path="/video/:collectionId/:gemId" element={<VideoPage />} /> */}
      {/* <Route path="/pdf/:collectionId/:gemId" element={<PDFPage />} /> */}
      {/* <Route path="/save-tabs" element={<SaveTabs />} />
      <Route path="/select-collection" element={<SelectCollection />} />
      <Route path="/highlights" element={<Highlights />} />
      <Route path="/all-highlights" element={<ListHighlightCode/>}/>
      <Route path="/highlight/:collectionId/:gemId/:highlightId" element={<SingleHighlight />} />
      <Route path="/highlight-panel" element={<HighlightPanel />} />
      <Route path="/codesnippet-panel" element={<CodeSnippetPanel />} />
      <Route path="/code/:collectionId/:gemId/:codeId" element={<SingleCode />} />
      <Route path="/codesnippet-details-panel" element={<CodeSnippetPanelDetails />} />
      <Route path="/image-panel" element={<ImagePanel />} />
      <Route path="/image-details-panel" element={<ImagePanelDetails />} />
      <Route path="/image/:collectionId/:gemId" element={<SingleImage />} />
      <Route path="/pdf-highlight" element={<PdfHighlight />} />
      <Route path="/report-bug" element={<ReportBug />} /> */}
    </Routes>
  );
}

export default App;
