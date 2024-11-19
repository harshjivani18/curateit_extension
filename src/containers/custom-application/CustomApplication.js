import { useEffect, useRef, useState } from "react";
import LayoutCommon from "../../components/commonLayout/LayoutCommon"
import Header from "../../components/header/Header";
import Input from "../../components/input/Input";
import { Spin, message } from "antd";
import Button from "../../components/Button/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { checkValidFileTypes } from "../../utils/equalChecks";
import { useDispatch } from "react-redux";
import {  changeSidebarOrder, createSidebarApp, deleteSidebarApp, getSidebarAppsUser, getSidebarOrder, getSingleSidebarApp, updateSidebarApp, uploadFileFromLocal, uploadFileFromWeb } from "../../actions/customApplication";
import { useNavigate } from "react-router";
import axios from 'axios';
import { TEXT_MESSAGE } from "../../utils/constants";
import session from "../../utils/session";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchCurrentTab } from "../../utils/fetch-current-tab";


const CustomApplication = () => {
    const [searchParams] = useSearchParams()
    const action = searchParams.get('action')
    const id = searchParams.get('id')
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const tabDetails = useSelector((state) => state.app.tab)
    const [appUrl,setAppUrl] = useState('')
    const [appName,setAppName] = useState('')
    const [tempImg,setTempImg] = useState('')
    const [imgSpinner, setImgSpinner]       = useState(false)
    const imageRef                          = useRef()
    const [timer, setTimer] = useState(null)
    const [validUrlError, setValidUrlError] = useState('')
    const [loading, setLoading] = useState(false)
    const [sidebarOrder, setSidebarOrder] = useState([]);
    const sidebarOrderData = useSelector(state => state.sidebarApplications.sidebarOrder);
    const sidebarAppsUser = useSelector(state => state.sidebarApplications.sidebarAppsUser)
    const [loadingState,setLoadingState] = useState(false) 
    const [loadingDelete,setLoadingDelete] = useState(false) 
    const [showModal, setShowModal]        = useState(false);

    useEffect(() => {
        if(id && action === 'edit'){
            const getCall = async () => {
                setLoadingState(true)
                const res = await dispatch(getSingleSidebarApp(id))
                if(res.error === undefined){
                    setLoadingState(false)
                    setAppName(res?.payload?.data?.data?.attributes?.name || '')
                    setAppUrl(res?.payload?.data?.data?.attributes?.url || '')
                    setTempImg(res?.payload?.data?.data?.attributes?.icon || '')
                }
            }

            getCall()
        }
    },[id,action])
    
    useEffect(() => {
    setSidebarOrder(sidebarOrderData)
  },[sidebarOrderData])

    const getFavicon = async (url) =>{
    try {
        const response = await axios.get(url);
        const html = response.data;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Look for the favicon in <link> elements
        const faviconLink = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]');

        let faviconUrl;
        if (faviconLink) {
        const faviconHref = faviconLink.getAttribute('href');
        faviconUrl = new URL(faviconHref, url); // Resolve relative URLs
        } else {
        // If not found in <link> elements, try fetching from the root level
        faviconUrl = new URL('favicon.ico', url);
        const faviconResponse = await axios.get(faviconUrl.toString());
        if (faviconResponse.status !== 200) {
            return;
        }
        }

        return faviconUrl;
    } catch (error) {
        console.error('Error fetching favicon:', error);
    }
    }

    function isValidUrl(url) {
        const pattern = new RegExp(
            '^(https?:\\/\\/)' + // protocol (http or https)
            '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-zA-Z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-zA-Z\\d_]*)?$',
            'i'
        );
        return !!pattern.test(url);
    }

    const resetValues = () => {
        setAppUrl('')
        setAppName('')
        setTempImg('')
    }

    const handleAppUrl = async (e) => {
        setTempImg('')
        setImgSpinner(true)
        clearTimeout(timer)
        const {value} = e.target;
        setAppUrl(value)
        const valid = isValidUrl(value)
        if(valid){
            setValidUrlError('')
            const newTimer = setTimeout(async() => {
            const img = await getFavicon(value)
            if(img){
                setImgSpinner(true)
                const payload = {
                    file: img.href
                }
                const res = await dispatch(uploadFileFromWeb(payload))
                if(res.error === undefined){
                    setTempImg(res?.payload?.data?.message)
                    setImgSpinner(false)
                }else{
                    setTempImg('')
                    setImgSpinner(false)
                    message.error(TEXT_MESSAGE.ERROR_UPLOAD_LOGO_APP_USER)
                }
            }
            
            }, 700)
            setTimer(newTimer)
        }else{
            setValidUrlError('Enter valid url')
        }
        setImgSpinner(false)
    }

    const onThumbnailChangeClick = async (e) => {
        const { files } = e.target

        if(files.length === 0){
            return;
        }

        if (files.length !== 0 && !checkValidFileTypes(files[0])){
            message.error("Invalid file type!")
            return;
        }

        if (files.length !== 0 && checkValidFileTypes(files[0])) {
            setImgSpinner(true)
            const formData = new FormData()
            formData.append("files", files[0])
            
            const res = await dispatch(uploadFileFromLocal(formData))

            if(res.error === undefined){
                setTempImg(res?.payload?.data?.media[0])
                setImgSpinner(false)
            }else{
                setImgSpinner(false)
                setTempImg('')
            }
        }
    }

    const extractDomainName = (url) =>{
    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname
        const pathname = parsedUrl.pathname
        return {
            hostname: hostname,
            pathname: pathname
        };
    } catch (error) {
        return null;
    }
    }
    
    const saveCustomApp = async (tabDetails) => {
        const userEnteredDomain = extractDomainName(tabDetails?.url);

        let domainExists = sidebarAppsUser.some(obj => {
            let objUrl = new URL(obj.url);
            return ((objUrl.hostname === userEnteredDomain.hostname) && (objUrl.pathname === userEnteredDomain.pathname))
        });

        if(domainExists){
            message.error("Custom app already added")
            return;
        }

        setLoading(true)
        const payload = {
            name: tabDetails?.title || 'Custom App',
            url: tabDetails?.url,
            icon: tabDetails?.favIconUrl,
            author: Number(session.userId)
        }

        const res = await dispatch(createSidebarApp(payload))
        if(res.error === undefined){
            const orderPayload = {
            ...res.payload.data.data.attributes,
            type: 'app',
            id: res.payload.data.data.id
        }
            await dispatch(getSidebarAppsUser())
            const payload = {
                sidebar : [...sidebarOrder,orderPayload]
            }
            session.setSidebarOrder(payload.sidebar)
            await dispatch(changeSidebarOrder(payload))
            await dispatch(getSidebarOrder())
            message.success(TEXT_MESSAGE.SIDEBAR_APP_CREATE_TEXT)
            setLoading(false)
            resetValues()
            navigate('/default-sidebar-apps')
        }else{
            setLoading(false)
            message.error(TEXT_MESSAGE.ERROR_TEXT)
            resetValues()
            navigate('/default-sidebar-apps')
        }
    }

    const handleSubmitCurrentPage = async () => {
      if(tabDetails){
        saveCustomApp(tabDetails)
        return;
      }

      if (!tabDetails) {
        fetchCurrentTab().then((res) => {
            saveCustomApp(res)
        })
      }
    }

    const handleSubmit = async () => {
        if(action === 'edit'){
            if(!appName){
                message.error("All fields are required")
                return
            }

            setLoading(true)
            const payload = {
                name: appName,
                url: appUrl,
                icon:tempImg,
                author: session.userId
            }

            let updatedData = sidebarOrder.map(item => {
                if (item.id === Number(id)) {
                    return { ...item, 
                        name: appName,
                        url: appUrl,
                        icon:tempImg,
                        author: session.userId
                    }; 
                }
                return item;
            });

            const res = await dispatch(updateSidebarApp(id,payload))

            if(res.error === undefined){
                await dispatch(getSidebarAppsUser())
                const payload = {
                    sidebar : [...updatedData]
                }
                session.setSidebarOrder(payload.sidebar)
                await dispatch(changeSidebarOrder(payload))
                await dispatch(getSidebarOrder())
                message.success(TEXT_MESSAGE.SIDEBAR_APP_UPDATE_TEXT)
                setLoading(false)
                resetValues()
                navigate('/default-sidebar-apps')
            }else{
                setLoading(false)
                message.error(TEXT_MESSAGE.ERROR_TEXT)
                resetValues()
                navigate('/default-sidebar-apps')
            }
            return;
        }

        if(!appUrl || !appName || !tempImg){
            message.error("All fields are required")
            return
        }

        const userEnteredDomain = extractDomainName(appUrl);

        let domainExists = sidebarAppsUser.some(obj => {
            let objUrl = new URL(obj.url);
            return ((objUrl.hostname === userEnteredDomain.hostname) && (objUrl.pathname === userEnteredDomain.pathname))
        });

        if(domainExists){
            message.error("Custom app already added")
            return;
        }

        setLoading(true)
        const payload = {
            name: appName,
            url: appUrl,
            icon:tempImg,
            author: session.userId
        }

        const res = await dispatch(createSidebarApp(payload))
        if(res.error === undefined){
            const orderPayload = {
            ...res.payload.data.data.attributes,
            type: 'app',
            id: res.payload.data.data.id
        }
            await dispatch(getSidebarAppsUser())
            const payload = {
                sidebar : [...sidebarOrder,orderPayload]
            }
            session.setSidebarOrder(payload.sidebar)
            await dispatch(changeSidebarOrder(payload))
            await dispatch(getSidebarOrder())
            message.success(TEXT_MESSAGE.SIDEBAR_APP_CREATE_TEXT)
            setLoading(false)
            resetValues()
            navigate('/default-sidebar-apps')
        }else{
            setLoading(false)
            message.error(TEXT_MESSAGE.ERROR_TEXT)
            resetValues()
            navigate('/default-sidebar-apps')
        }
        
    }

    const onDeleteClick = async () => {
        setLoadingDelete(true)
        const res = await dispatch(deleteSidebarApp(id))

        if(res.error === undefined){
            const filtered = sidebarOrder.filter(data => data?.id !== Number(id))
            const payload = {
                sidebar : filtered
            }
            session.setSidebarOrder(filtered)
            await dispatch(getSidebarAppsUser())
            await dispatch(changeSidebarOrder(payload))
            await dispatch(getSidebarOrder())
            setLoadingDelete(false)
            message.success(TEXT_MESSAGE.SIDEBAR_APP_DELETE_TEXT)
            resetValues()
            navigate('/default-sidebar-apps')
        }else{
            setLoadingDelete(false)
            message.error(TEXT_MESSAGE.ERROR_TEXT)
        }
    }

    return(
        <>
        <LayoutCommon>
            <Header
                label={action === 'edit' ? 'Edit Application' : 'Add Custom Application'}
                isHideBackButton={false}
                isMenuItemEnabled={false}
                onBackBtnClick={false}
                menuItems={[]}
                MenuIcon={null}
                isDownloadable={false}
                onDownload={false}
                backUrl={'/default-sidebar-apps'}
            />
            {
               loadingState ? <div className="flex justify-center align-center pt-4">
                    <Spin size='middle' tip='Loading...'/>
                </div>
                :
            <div className="flex flex-col">

                <div className="p-4 flex">
                    <div style={{flex:'0.3'}}>
                        <div 
                        className='bg-white w-[48px] rounded-lg my-0 mx-auto' 
                        >
                            {imgSpinner && <Spin className="mt-5" />}
                            {tempImg !== "" && <img className='w-[48px] h-[48px] rounded-lg fit-image' src={tempImg} 
                            alt={"app-logo"} />}
                        </div>
                        <div onClick={() => imageRef.current.click()} 
                        className='mr-2 w-48px py-[2px] bg-[#D9D9D9] flex flex-col items-center justify-center align-middle border-2 border-gray-300 rounded-sm mt-2 cursor-pointer'>
                            <PlusIcon className="h-10 w-10 mb-2 text-[#060606]"/>
                            <span className="text-xs text-[#060606]">Custom icon</span>
                        </div>
                        <input className='hidden' ref={imageRef} onChange={onThumbnailChangeClick} 
                        onError={(err)=>message.error(err)} type="file" name="bookmark-image" id="bookmark-image" accept="image/png, image/jpeg" />
                    </div>

                    <div style={{flex:'0.7'}}>
                        <Input
                                size="medium w-full mb-2"
                                type="text"
                                name="app url"
                                placeholder="App url"
                                value={appUrl}
                                onChange={handleAppUrl}
                                disabled={action === 'edit'}
                            />
                            <span className="block text-xs text-[#EB5757]">{validUrlError && validUrlError}</span>

                            <Input
                                size="medium w-full mb-2"
                                type="text"
                                name="app name"
                                placeholder="App name"
                                value={appName}
                                onChange={(e) => setAppName(e.target.value)}
                            />

                        {
                        action === 'edit' &&
                        <button
                        className="border-none bg-transparent text-red-700 outline-none"
                        onClick={() => setShowModal(true)}
                        disabled={loadingDelete}
                    >
                        Remove app
                    </button>
                        }
                    </div>
                </div>

                <div className="flex justify-end items-center mt-4 px-4">
                    {
                    action === 'edit' ? <></>
                     : <Button variant="primary small text-xs mr-2" 
                        onClick={handleSubmitCurrentPage}
                        disabled={loading || loadingDelete}
                    >   
                        {loading ? 'Adding app...' : 'Add Current Page'}
                    </Button>
                    }
                    <Button variant="primary small text-xs" 
                        onClick={handleSubmit}
                        disabled={loading || loadingDelete}
                    >   
                        {loading ? 'Adding app...' : 'Add Application'}
                    </Button>
                </div>

                <div
                className={showModal ? "pop-box2" : ""}
                style={{ marginLeft: 0 }}
                >
                <div className={showModal === true ? "popup-delete-model" : ""}>
                    {showModal && (
                    <div className="border-t-[1px]">
                        <div className="popup-delete bg-white">
                        <h1 className="content-h">
                            Confirm delete app?
                        </h1>
                        <div className="btnn-pop">
                            <button
                            className="yes-btn"
                            onClick={() => onDeleteClick()}
                            disabled={loading || loadingDelete}
                            >
                            {loadingDelete ? "Loading" : `Yes`}
                            </button>
                            <button
                            className="no-btn"
                            onClick={() => setShowModal(false)}
                            disabled={loading || loadingDelete}
                            >
                            No
                            </button>
                        </div>
                        </div>
                    
                    </div>
                    )}
                </div>
                </div>
            </div>
            }

        </LayoutCommon>
        </>
    )
}

export default CustomApplication;