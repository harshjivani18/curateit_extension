/*global chrome*/
import React, { useEffect } from "react";
import { Collapse, Spin } from "antd";
import SettingType from "./SettingType";
import "./style.css";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import ButtonToggleSetting from "./ButtonToggleSetting";
import { BiDotsVertical } from "react-icons/bi";
import { BsPinAngle } from "react-icons/bs";
import { useState } from "react";
import { fetchCurrentTab } from "../../utils/fetch-current-tab";
import {
  sendEnableFloatCodeMenuToChrome,
  sendEnableFloatImageMenuToChrome,
  sendEnableFloatMenuToChrome,
  sendEnableImageMenuToChrome,
  sendSidebarPositionToChrome,
  sendSidebarViewType,
} from "../../utils/send-theme-to-chrome";
import { useSelector } from "react-redux";
import {
  changeSidebarPosition,
  fetchUserDetails,
  updateUser,
} from "../../actions/user";
import { useDispatch } from "react-redux";
import session from "../../utils/session";

const { Panel } = Collapse;

const PROFILE_OPTIONS = [
  {
    id: 1,
    value: "public",
    text: "Public",
  },
  {
    id: 2,
    value: "private",
    text: "Private",
  },
];

const SIDEBAR_OPTIONS = [
  {
    id: 1,
    value: "left",
    text: "Left",
  },
  {
    id: 2,
    value: "right",
    text: "Right",
  },
];

const SIDEBAR_VIEW_OPTIONS = [
  {
    id: 1,
    value: "auto_hide",
    text: "Auto hide",
    icon: <BiDotsVertical className="w-4 h-4" />,
  },
  {
    id: 2,
    value: "pinned",
    text: "Pinned",
    icon: <BsPinAngle className="w-4 h-4" />,
  },
];

const DisplaySetting = () => {
  const dispatch = useDispatch();
  const tabDetails = useSelector((state) => state.app.tab);
  const userDetails = useSelector((state) => state?.user);
  const [showHighlight, setShowHighlight] = useState(
    userDetails?.userData?.preferences?.show_highlight_option
  );
  const [showImage, setShowImage] = useState(
    userDetails?.userData?.preferences?.show_image_option
  );
  const [showCode, setShowCode] = useState(
    userDetails?.userData?.preferences?.show_code_option
  );
  const [sidebarPosition, setSidebarPosition] = useState(
    userDetails?.userData?.preferences?.sidebar_position
  );
  const [sidebarView, setSidebarView] = useState(
    userDetails?.userData?.preferences?.sidebar_view
  );
  const [profileType, setProfileType] = useState(
    userDetails?.userData?.isPublic ? "public" : "private"
  );
  const [isAutoSync, setIsAutoSync] = useState(
    userDetails?.userData?.preferences?.auto_sync || false
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userDetails?.userData) {
      const getCall = async () => {
        setLoading(true);
        const res = await dispatch(fetchUserDetails());
        setShowHighlight(
          res?.payload?.data?.preferences?.show_highlight_option
        );
        setShowImage(res?.payload?.data?.preferences?.show_image_option);
        setShowCode(res?.payload?.data?.preferences?.show_code_option);
        setLoading(false);
      };
      getCall();
    }
  }, [userDetails,dispatch]);

  const handleShowHighlightChange = async (checked) => {
    setShowHighlight(checked);
    const value = checked === true ? "SHOW" : "HIDE";
    sendEnableFloatMenuToChrome(value, tabDetails || (await fetchCurrentTab()));
    chrome.storage.sync.set({
      userData: {
        token: session.token,
        userId: session.userId,
        username: session.username,
        unfilteredCollectionId: session.unfiltered_collection_id,
        bioCollectionId: session.bio_collection_id,
        apiUrl: process.env.REACT_APP_API_URL,
        webappURL: process.env.REACT_APP_WEBAPP_URL,
        iframelyApi: process.env.REACT_APP_IFRAMELY_API_KEY,
        imagesCdn: process.env.REACT_APP_STATIC_IMAGES_CDN,
        showImageMenu:
          userDetails?.userData?.preferences?.show_image_option === true
            ? "SHOW"
            : "HIDE",
        showCodeMenu:
          userDetails?.userData?.preferences?.show_code_option === true
            ? "SHOW"
            : "HIDE",
        showHighlightMenu: checked === true ? "SHOW" : "HIDE",
      },
    });
    const newState = {
      preferences: {
        ...userDetails.userData?.preferences,
        show_highlight_option: checked,
      },
    };
    await dispatch(updateUser(newState));
  };
  const handleShowImageChange = async (checked) => {
    setShowImage(checked);
    const value = checked === true ? "SHOW" : "HIDE";
    sendEnableFloatImageMenuToChrome(
      value,
      tabDetails || (await fetchCurrentTab())
    );
    chrome.storage.sync.set({
      userData: {
        token: session.token,
        userId: session.userId,
        username: session.username,
        unfilteredCollectionId: session.unfiltered_collection_id,
        bioCollectionId: session.bio_collection_id,
        apiUrl: process.env.REACT_APP_API_URL,
        webappURL: process.env.REACT_APP_WEBAPP_URL,
        iframelyApi: process.env.REACT_APP_IFRAMELY_API_KEY,
        imagesCdn: process.env.REACT_APP_STATIC_IMAGES_CDN,
        showImageMenu: checked === true ? "SHOW" : "HIDE",
        showCodeMenu:
          userDetails?.userData?.preferences?.show_code_option === true
            ? "SHOW"
            : "HIDE",
        showHighlightMenu:
          userDetails?.userData?.preferences?.show_highlight_option === false
            ? "HIDE"
            : "SHOW",
      },
    });
    const newState = {
      preferences: {
        ...userDetails.userData?.preferences,
        show_image_option: checked,
      },
    };
    await dispatch(updateUser(newState));
  };

  const handleShowCodeChange = async (checked) => {
    setShowCode(checked);
    const value = checked === true ? "SHOW" : "HIDE";
    sendEnableFloatCodeMenuToChrome(
      value,
      tabDetails || (await fetchCurrentTab())
    );
    chrome.storage.sync.set({
      userData: {
        token: session.token,
        userId: session.userId,
        username: session.username,
        unfilteredCollectionId: session.unfiltered_collection_id,
        bioCollectionId: session.bio_collection_id,
        apiUrl: process.env.REACT_APP_API_URL,
        webappURL: process.env.REACT_APP_WEBAPP_URL,
        iframelyApi: process.env.REACT_APP_IFRAMELY_API_KEY,
        imagesCdn: process.env.REACT_APP_STATIC_IMAGES_CDN,
        showImageMenu:
          userDetails?.userData?.preferences?.show_image_option === true
            ? "SHOW"
            : "HIDE",
        showCodeMenu: checked === true ? "SHOW" : "HIDE",
        showHighlightMenu:
          userDetails?.userData?.preferences?.show_highlight_option === false
            ? "HIDE"
            : "SHOW",
      },
    });
    const newState = {
      preferences: {
        ...userDetails.userData?.preferences,
        show_code_option: checked,
      },
    };
    await dispatch(updateUser(newState));
  };

  const onAutoSyncChange = async (checked) => {
    setIsAutoSync(checked);
    const newState = {
      preferences: { ...userDetails.userData?.preferences, auto_sync: checked },
    };
    await dispatch(updateUser(newState));
  };

  const handleSidebarPosition = async (type) => {
    sendSidebarPositionToChrome(type, tabDetails || (await fetchCurrentTab()));
    setSidebarPosition(type);
    const newState = {
      preferences: {
        ...userDetails.userData?.preferences,
        sidebar_position: type,
      },
    };
    await dispatch(updateUser(newState));
  };

  const handleSidebarView = async (type) => {
    setSidebarView(type);
    sendSidebarViewType(type, tabDetails || (await fetchCurrentTab()));
    const newState = {
      preferences: { ...userDetails.userData?.preferences, sidebar_view: type },
    };
    await dispatch(updateUser(newState));
  };

  const handleProfileType = async (type) => {
    setProfileType(type);
    let newData = userDetails.userData;
    if (type === "public") {
      newData = { isPublic: true };
    } else {
      newData = { isPublic: false };
    }
    await dispatch(updateUser(newData));
  };

  return (
    <div>
      <Collapse
        bordered={false}
        expandIcon={(status) => {
          return (
            <div>
              {status.isActive ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </div>
          );
        }}
        expandIconPosition="end"
      >
        <Panel
          header={
            <div>
              <h2 className="font-bold text-gray-600">DISPLAY SETTINGS</h2>
            </div>
          }
          key="1"
        >
          {loading ? (
            <div className="spinDiv">
              <Spin size="middle" tip="Loading..." />
            </div>
          ) : (
            <>
              {/* <SettingType title="Show sidebar" enableMenu={true} /> */}
              <SettingType
                title="Show highlight options"
                enableMenu={showHighlight}
                handleChange={handleShowHighlightChange}
              />
              <SettingType
                title="Show image options"
                enableMenu={showImage}
                handleChange={handleShowImageChange}
              />
              <SettingType
                title="Show code options"
                enableMenu={showCode}
                handleChange={handleShowCodeChange}
              />
              {/* <SettingType
            title="Auto sync"
            enableMenu={isAutoSync}
            handleChange={onAutoSyncChange}
          /> */}
              {/* <SettingType title="Side bar view" enableMenu={true} /> */}
              <ButtonToggleSetting
                title="Sidebar Position"
                options={SIDEBAR_OPTIONS}
                mode={sidebarPosition}
                handleModeChange={handleSidebarPosition}
              />
              <ButtonToggleSetting
                title="Profile"
                options={PROFILE_OPTIONS}
                mode={profileType}
                handleModeChange={handleProfileType}
              />
              <ButtonToggleSetting
                title="Sidebar View"
                options={SIDEBAR_VIEW_OPTIONS}
                mode={sidebarView}
                handleModeChange={handleSidebarView}
              />
            </>
          )}
        </Panel>
      </Collapse>
    </div>
  );
};

export default DisplaySetting;
