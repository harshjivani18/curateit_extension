/*global chrome*/
import React, { useState } from "react";
import Button from "../Button/Button";
import Input from "../inputWithIcon/InputWithIcon";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signup, emailVerification } from "../../actions/login";
import {
  FIELD_REQUIRED,
  LESS_THAN_15_CHARS,
  NO_SPACES,
  NO_SPECIAL_CHARS,
} from "../../utils/constants";
import { Validator } from "../../utils/validations";
import SigninError from "../../components/common/signinerror";
import { getVisitedHistory, setWebappStorage } from "../../utils/message-operations";
import session from "../../utils/session";
// import { fetchUserDetails } from '../../actions/user';
import { setDefaultCurateit, setUserInformation } from "../../actions/login";
import {
  getSidebarOrder,
  updateMostVisitedApps,
} from "../../actions/customApplication";
import { useSelector } from "react-redux";
import { fetchCurrentTab } from "../../utils/fetch-current-tab";
import {
  sendEnableFloatCodeMenuToChrome,
  sendEnableFloatImageMenuToChrome,
  sendSidebarPositionToChrome,
  sendSidebarViewType,
} from "../../utils/send-theme-to-chrome";
import { getSharedCollections } from "../../actions/collection";
import { message } from "antd";
import { syncBookmarks } from "../../utils/sync-bookmarks";

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [fnameError, setFnameError] = useState("");
  const [lnameError, setLnameError] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [emailIsValidating, setEmailIsValidating] = useState(false);
  const tabDetails = useSelector((state) => state.app.tab);

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailVerificationError, setEmailVerificationError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleEmailChange = (val) => {
    setEmail(val);
  };
  const handlePasswordChange = (val) => {
    setPassword(val);
  };
  const handleUsernameChange = (val) => {
    setUsername(val);
  };
  const handleFirstnameChange = (val) => {
    setFirstname(val);
  };
  const handleLastnameChange = (val) => {
    setLastname(val);
  };

  const submitData = async (e) => {
    e.preventDefault();
    if (emailVerificationError !== "") return;
    if (emailIsValidating) {
      message.error("Please wait while we validate your email address.");
    }
    if (
      email === "" ||
      username === "" ||
      password === "" ||
      firstname === "" ||
      lastname === ""
    ) {
      setEmailError(email === "" ? FIELD_REQUIRED : "");
      setUsernameError(username === "" ? FIELD_REQUIRED : "");
      setPasswordError(password === "" ? FIELD_REQUIRED : "");
      setFnameError(firstname === "" ? FIELD_REQUIRED : "");
      setLnameError(lastname === "" ? FIELD_REQUIRED : "");
      return;
    } else {
      setEmailError("");
      setUsernameError("");
      setPasswordError("");
      setFnameError("");
      setLnameError("");
    }

    if (username.includes(" ")) {
      setUsernameError(NO_SPACES);
      return;
    }
    if (/[^a-zA-Z0-9]/.test(username)) {
      // This regex checks for any character that is not a letter or a number
      setUsernameError(NO_SPECIAL_CHARS);
      return;
    }
    if (username.length >= 15) {
      setUsernameError(LESS_THAN_15_CHARS);
      return;
    }

    if (Validator.validate("name", username, null, null, true)) {
      setUsernameError(Validator.validate("name", username, null, null, true));
      return;
    } else {
      setUsernameError("");
    }

    if (Validator.validate("name", firstname, null, null, true)) {
      setFnameError(Validator.validate("name", firstname, null, null, true));
      return;
    } else {
      setFnameError("");
    }

    if (Validator.validate("name", lastname, null, null, true)) {
      setLnameError(Validator.validate("name", lastname, null, null, true));
      return;
    } else {
      setLnameError("");
    }

    if (Validator.validate("email", email, null, null, true)) {
      setEmailError(Validator.validate("email", email, null, null, true));
      return;
    } else {
      setEmailError("");
    }

    if (Validator.validate("password", password, 6, 30, true)) {
      setPasswordError(Validator.validate("password", password, 6, 30, true));
      return;
    } else {
      setPasswordError("");
    }
    setLoading(true);
    if (email !== "") {
      try {
        const res = await dispatch(
          signup(username, email, password, firstname, lastname)
        );
        // 
        // 
        setLoading(false);
        if (res.payload.status === 200) {
          navigate("/");
          const updateUser = await dispatch(setUserInformation());
          // await dispatch(setDefaultCurateit());
          const sites = await getVisitedHistory();
          await dispatch(getSidebarOrder());
          await dispatch(getSharedCollections());
          await dispatch(updateMostVisitedApps(sites));
          // const resUser = await dispatch(fetchUserDetails())
          const bio_collection = updateUser.payload.data.bio_collection;
          const isSynced = res?.payload?.data?.user?.is_bookmark_sync
          if (isSynced === true) {
            // window.chrome.storage.local.remove("defaultBookmarks")
          }
          else {
            window.chrome.storage.local.get(["defaultBookmarks"], (result) => {
              if (result.defaultBookmarks) {
                syncBookmarks(result.defaultBookmarks, isSynced, navigate);
              }
            })
          }
          
          chrome.storage.sync.set({
            userData: {
              token: session.token,
              username: session.username,
              unfilteredCollectionId: session.unfiltered_collection_id,
              apiUrl: process.env.REACT_APP_API_URL,
              userId: session.userId,
              webappURL: process.env.REACT_APP_WEBAPP_URL,
              bioCollectionId: bio_collection,
              iframelyApi: process.env.REACT_APP_IFRAMELY_API_KEY,
              imagesCdn: process.env.REACT_APP_STATIC_IMAGES_CDN,
              showImageMenu:
                res?.payload?.data?.preferences?.show_image_option === true
                  ? "SHOW"
                  : "HIDE",
              showCodeMenu:
                res?.payload?.data?.preferences?.show_code_option === true
                  ? "SHOW"
                  : "HIDE",
              showHighlightMenu:
                res?.user?.preferences?.show_highlight_option === false
                  ? "HIDE"
                  : "SHOW",
            },
          });
          const tObj = tabDetails || (await fetchCurrentTab());
          window.chrome.tabs.sendMessage(tObj.id, { type: "USER_LOGIN" });

          const imageOpt =
            res?.payload?.data?.user?.preferences?.show_image_option === true
              ? "SHOW"
              : "HIDE";
          sendEnableFloatImageMenuToChrome(imageOpt, tObj);
          const codeOpt =
            res?.payload?.data?.user?.preferences?.show_code_option === true
              ? "SHOW"
              : "HIDE";
          sendEnableFloatCodeMenuToChrome(codeOpt, tObj);
          sendSidebarPositionToChrome(
            res?.payload?.data?.user?.preferences?.sidebar_position || "right",
            tObj
          );
          sendSidebarViewType(
            res?.payload?.data?.user?.preferences?.sidebar_view || "auto_hide",
            tObj
          );
          session.setSidebarView(
            res?.payload?.data?.user?.preferences?.sidebar_view || "auto_hide"
          );
          await setWebappStorage(res,true);
          // navigate("/")
          // navigate("/search-bookmark");
        } else {
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      }
    }
  };

  const onBlurEmail = async (e) => {
    if (email === "") return;
    const { REACT_APP_ENV } = process.env;
    if (REACT_APP_ENV === "production") {
      setEmailIsValidating(true);
      const emailVerificationResult = await dispatch(emailVerification(email));
      setEmailIsValidating(false);
      setEmailVerificationError("");
      if (
        emailVerificationResult &&
        emailVerificationResult?.payload?.data &&
        emailVerificationResult?.payload?.data?.status === "invalid"
      ) {
        setEmailVerificationError("Please enter a valid email address.");
        return;
      }
    }
  };

  return (
    <>
      <SigninError />
      <div className="py-4">
        <div className="mb-4">
          <Input
            type="text"
            name="last_name"
            placeholder="User Name"
            value={username}
            onChange={(val) => handleUsernameChange(val)}
          />
          <span className="error-label">{usernameError}</span>
        </div>
        <div className="mb-4">
          <Input
            type="text"
            name="f_name"
            placeholder="First Name"
            value={firstname}
            onChange={(val) => handleFirstnameChange(val)}
          />
          <span className="error-label">{fnameError}</span>
        </div>
        <div className="mb-4">
          <Input
            type="text"
            name="l_name"
            placeholder="Last Name"
            value={lastname}
            onChange={(val) => handleLastnameChange(val)}
          />
          <span className="error-label">{lnameError}</span>
        </div>
        <div className="mb-4">
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(val) => handleEmailChange(val)}
            onBlur={onBlurEmail}
          />
          <span className="error-label">
            {emailVerificationError.length > 0
              ? emailVerificationError
              : emailError}
          </span>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(val) => handlePasswordChange(val)}
        />
        <span className="error-label">{passwordError}</span>
      </div>
      <Button variant="primary w-full" disabled={loading} onClick={submitData}>
        {loading ? `Loading...` : "Sign Up"}
      </Button>
    </>
  );
};

export default RegisterForm;
