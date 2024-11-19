import { Layout } from "antd";
import { useEffect, useState } from "react";
import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";
import session from "../../utils/session";
import { useNavigate } from "react-router-dom";
import { getCurrentWindowURL } from "../../utils/message-operations";
import ImageModal from "../modal/ImageModal";
import ExceedLimitModal from "../modal/ExceedModel";
import { useSelector } from "react-redux";
import SingleFileModal from "../modal/SingleFile";
const { Content } = Layout;

const LayoutCommon = (props) => {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false);
  const [showMenu,setShowMenu] = useState(false)
  const { showExceedModal, showSingleFileModal } = useSelector(state => state.app)

  useEffect(() => {
    const getCall = () => {
      getCurrentWindowURL().then((tab) => {
        window.chrome.tabs.sendMessage(tab.id, { type: "GET_CURRENT_IFRMAE_WIDTH" }, (response) => {
          
          if (response) {
            setCollapsed(response === "50px")
          }
        })
      })
    }
    getCall()
    window.addEventListener("message", onMessageReceived);
    return () => {
      window.removeEventListener("message", onMessageReceived);
    };
  }, []);

  const onMessageReceived = async (e) => {
    const { data } = e;
    if (!data) return;
    if (data === 'SHOW_MENU') {
      setShowMenu(true)
      setCollapsed(true)
      return;
    }
    if (data === 'HIDE_MENU') {
      setShowMenu(false)
      setCollapsed(false)
      return;
    }
    // if (!session.token) {
    //   navigate(`/login`);
    //   return;
    // }
    // if(session.token && data === 'SHOW_MENU'){
    //   setShowMenu(true)
    //   setCollapsed(true)
    //   return;
    // }
    // if(session.token && data === 'HIDE_MENU'){
    //   setShowMenu(false)
    //   setCollapsed(false)
    //   return;
    // }
  };

  return (
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
            <div className={props.isHideOverflow ? "flex-1 h-full bg-white relative" : "overflow-y-scroll flex-1 h-full bg-white relative"}>
              <Content style={{ background: "#FCFCFD" }}>
                {props.children}
              </Content>
            </div>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
          </Layout>
          <Footer collapsed={collapsed} />
        </>
      )}
      {props.showThumbnailBox && 
        <ImageModal currentTab={props.currentImageBoxTab} 
                    onClose={props.onImageBoxClose}
                    siteImages={props.siteImages}
                    currentIcon={props.currentIcon}
                    currentThumbnail={props.currentThumbnail}
                    onThumbnailSelect={props.onThumbnailSelect}
                    currentURL={props.currentURL}
                    onIconSelect={props.onIconSelect}
                    isSetResetOpt={props.isSetResetOpt}
                    onResetIcon={props.onResetIcon}
                    platform={props.platform}
                    defaultIcon={props.defaultIcon}
                    defaultThumbnail={props.defaultThumbnail}
                     />}
      {showExceedModal && <ExceedLimitModal />}
      {console.log("showSingleFileModal ===>", showSingleFileModal)}
      {showSingleFileModal && <SingleFileModal />}
    </Layout>
  )
};

export default LayoutCommon;
