/*global chrome*/
import React, { useState ,useEffect } from 'react'
import Button from '../Button/Button'
import CheckBox from '../checkbox/CheckBox'
import InputWithIcon from '../inputWithIcon/InputWithIcon'
import { useNavigate } from "react-router-dom"
import { useDispatch,
         useSelector } from "react-redux";
import { fetchLogin } from "../../actions/login";
import { FIELD_REQUIRED } from "../../utils/constants";
import { Validator } from "../../utils/validations";
import Error from "../../components/common/error";
import session from "../../utils/session";
import { updateLocation } from '../../utils/update-location'
import { fetchUserDetails, 
         setWebsiteThemeMode } from '../../actions/user'
import { sendEnableFloatCodeMenuToChrome, sendEnableFloatImageMenuToChrome, sendSidebarPositionToChrome, sendSidebarViewType, sendThemeToChrome } from '../../utils/send-theme-to-chrome'
import { fetchCurrentTab } from '../../utils/fetch-current-tab'
import { getAllHighlights } from '../../actions/highlights'
import { getSidebarOrder } from '../../actions/customApplication'
import { getSharedCollections } from '../../actions/collection'
import { setWebappStorage } from '../../utils/message-operations'
import { syncBookmarks } from '../../utils/sync-bookmarks'

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isChecked, setIsChecked] = useState("");
  const [userError, setUserError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false)
  const tabDetails = useSelector((state) => state.app.tab)

  useEffect(() => {
    if (session.checkbox) {
      setIsChecked(session.checkbox);
      const user = localStorage.getItem("user");
      setEmail(user);
      setPassword(session.password);
    }
  }, []);
  const handleUserChange = (val) => {
    setEmail(val)
  };
  const handlePasswordChange = (val) => {
    setPassword(val);
  };


  const handleCheckbox = (e) => {
    setIsChecked(!isChecked)

  };
  const submitData = async (e) => {
    e.preventDefault();
    if(email === '' || password === ''){
      setUserError(email === '' ? FIELD_REQUIRED : '')
      setPasswordError(password === '' ? FIELD_REQUIRED : '')
      return;
    }else{
      setUserError('')
      setPasswordError('')
    }

    if(Validator.validate("email", email, null, null, true)){
      setUserError(Validator.validate("email", email, null, null, true))
      return;
    }else{
      setUserError('')
    }
    setLoading(true);
    if (email !== "") {
      try {
        const res = await dispatch(fetchLogin(email, password));
        setLoading(false);
        if(res.payload.status === 200){
          await dispatch(getSidebarOrder())
          await dispatch(getSharedCollections())
          const resUser = await dispatch(fetchUserDetails())
          const tObj     = tabDetails || await fetchCurrentTab()
          const response = await dispatch(getAllHighlights(tObj.url))
          if(response.error === undefined && response.payload && response.payload.data && response.payload.data.length>0){
            const highlighData = response.payload.data
            window.chrome.tabs.sendMessage(tObj.id, { value: JSON.stringify(highlighData), type: "CT_HIGHLIGHT_DATA" })
          }
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
          if (isChecked && email !== "") {
            session.setCheckbox(isChecked);
            session.setEmail(email);
            session.setPassword(password);
            sendThemeToChrome(res.payload.data.user?.preferences?.theme?.isDark || false, "Login Form", tabDetails || await fetchCurrentTab())
            dispatch(setWebsiteThemeMode(res.payload.data.user?.preferences?.theme?.mode))
          }
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
                resUser?.payload?.data?.preferences?.show_image_option === true
                  ? "SHOW"
                  : "HIDE",
              showCodeMenu:
                resUser?.payload?.data?.preferences?.show_code_option === true
                  ? "SHOW"
                  : "HIDE",
              showHighlightMenu:
                resUser?.user?.preferences?.show_highlight_option === false
                  ? "HIDE"
                  : "SHOW",
            },
          });
          //SET COOKIES FOR WEB APP
          chrome.cookies.set({
            url: process.env.REACT_APP_WEBAPP_URL,
            name: 'curateittoken',
            value: session.token
          })
          // document.cookie = `curateittoken=${session.token};domain=${process.env.REACT_APP_WEBAPP_URL}`
          updateLocation(window.location.search, tObj, navigate, [])
          window.chrome.tabs.sendMessage(tObj.id, { type: "USER_LOGIN" })

          const imageOpt = resUser?.payload?.data?.preferences?.show_image_option === true ? 'SHOW' : 'HIDE'
          sendEnableFloatImageMenuToChrome(imageOpt, tObj)
          const codeOpt = resUser?.payload?.data?.preferences?.show_code_option === true ? "SHOW" : "HIDE"
          sendEnableFloatCodeMenuToChrome( codeOpt, tObj)
          sendSidebarPositionToChrome( resUser?.payload?.data?.preferences?.sidebar_position || 'right', tObj)
          sendSidebarViewType(resUser?.payload?.data?.preferences?.sidebar_view || 'auto_hide', tObj)
          session.setSidebarView(resUser?.payload?.data?.preferences?.sidebar_view || 'auto_hide')
          navigate("/search-bookmark");
          await setWebappStorage(res)
        }
        else {
          setLoading(false);
          navigate("/login")
        }
      } catch (error) {
        setLoading(false);
      }
    }
  };


  return (
    <>
      <Error />
      <div className='py-4'>
        <div className='mb-4'>
          <InputWithIcon value={email} onChange={(val) => handleUserChange(val)} type="email" name="email" placeholder="Email" />
          <span className="error-label">{userError}</span>
        </div>
        <InputWithIcon value={password} onChange={(val) => handlePasswordChange(val)} type="password" name="password" placeholder="Password" />
        <span className="error-label">{passwordError}</span>
      </div>
      <div className='flex justify-between'>
        <CheckBox value={isChecked} onChange={handleCheckbox} name="remember" label="Remember Me" />
        <Button  onClick={() => navigate("/forgot")}className='text-blue-500 text-sm'>Forgot Password?</Button>
      </div>
      <div className='mt-4'>
        <Button onClick={submitData} disabled={loading} variant="primary w-full">{loading ? `Loading...` : "Sign in"}</Button>
      </div>
    </>
  )
}

export default LoginForm