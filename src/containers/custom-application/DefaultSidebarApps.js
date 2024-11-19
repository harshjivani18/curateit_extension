import { EllipsisVerticalIcon, PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button, Dropdown, Input, Spin, message } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { changeSidebarOrder, createSidebarApp, deleteSidebarApp, getAllPublicSidebarApps, getSidebarAppsUser, getSidebarOrder } from "../../actions/customApplication";
import LayoutCommon from "../../components/commonLayout/LayoutCommon";
import Header from "../../components/header/Header";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import session from "../../utils/session";
import { TEXT_MESSAGE, curateitApps } from "../../utils/constants";
import { generateCurateitAppsUi } from "../../utils/generateTreeData";

const DefaultSidebarApps = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const publicSidebarApps = useSelector(state => state.sidebarApplications.publicSidebarApps)
    const sidebarAppsUser = useSelector(state => state.sidebarApplications.sidebarAppsUser)
    const sidebarOrderData = useSelector(state => state.sidebarApplications.sidebarOrder);
    const [sidebarOrder, setSidebarOrder] = useState([]);
    const [singleSelectedApp, setSingleSelectedApp] = useState('');

    const selectedAppsMenu = [
    {
      label: <PencilSquareIcon className="h-4 w-4 cursor-pointer" 
      onClick={()  => {
        if(!session.userId){
            navigate('/login')
        }else{
            navigate(`/custom-application?id=${singleSelectedApp.id}&action=edit`)
        }
      }}/>,
      key: '0',
    },
    {
      label: <TrashIcon className=" h-4 w-4 text-[#EB5757] cursor-pointer" 
      onClick={() => handleDeleteSidebarApp(singleSelectedApp)}
      />,
      key: '1',
    },
  ]

    useEffect(() => {
        if(sidebarOrder && sidebarOrder.length > 0){
            setSidebarOrder(sidebarOrderData)
        }else{
            setSidebarOrder(session.sidebarOrder || [])
        }
  },[sidebarOrderData])


    const [searchedApps,setSearchedApps] = useState([])
    const [loading,setLoading] = useState(false)
    const [loadingSubmit,setLoadingSubmit] = useState(false)
    const [tipText,setTipText] = useState('')

    useEffect(() => {
        const getCall = async () => {
            setLoading(true)
            const res = await dispatch(getAllPublicSidebarApps())
            const res1 = await dispatch(getSidebarAppsUser())

            if(res && res1){
                setLoading(false)
            }
        }

        getCall()
    },[])

    useEffect(() => {
        if(publicSidebarApps){
            setSearchedApps(publicSidebarApps)
        }
    },[publicSidebarApps])

    const handleAddSidebarApps = async (item) => {
        if (!session?.userId) {
            const isItemExits = sidebarOrder.filter(data => data?.url === item?.url)
            if (isItemExits.length > 0) {
                message.error('App is already selected')
                return
            }

            setLoadingSubmit(true)
            setTipText('Adding app...')
            
            const payload = {
                name: item.name,
                url: item.url,
                icon: item.icon,
                type: 'app',
            }

            const sidebar = [...sidebarOrder, payload];
            session.setSidebarOrder(sidebar)
            setSidebarOrder(sidebar);
            setLoadingSubmit(false)
            message.success(TEXT_MESSAGE.SIDEBAR_APP_CREATE_TEXT)
            setTipText("")
            return;
        }

        const isItemExits = sidebarAppsUser.filter(data => data?.url === item?.url)
        if(isItemExits.length>0){
            message.error('App is already selected')
            return
        }

        setLoadingSubmit(true)
        setTipText('Adding app...')

        const payload = {
            name: item.name,
            url: item.url,
            icon: item.icon,
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
            sidebar: [...sidebarOrder, orderPayload],
          }
          session.setSidebarOrder(payload.sidebar)
          await dispatch(changeSidebarOrder(payload))
          await dispatch(getSidebarOrder())
          message.success(TEXT_MESSAGE.SIDEBAR_APP_CREATE_TEXT)
          setLoadingSubmit(false)
          setTipText("")
        }else{
            setLoadingSubmit(false)
            message.error(TEXT_MESSAGE.ERROR_TEXT)
            setTipText('')
        }

        
    }

    const handleSearchChange = (e) => {
        const {value} = e.target;
        const data = publicSidebarApps?.filter(item =>
            item.apps.some(app => app.name.toLowerCase().includes(value.toLowerCase()))
        );
        setSearchedApps(data)
    }

    const handleDeleteSidebarApp = async (item) => {
        setLoadingSubmit(true)
        setTipText('Deleting app...')
        if(!session?.userId){
            const filtered = sidebarOrder.filter(data => data.name !== item.name)
            setSidebarOrder(filtered);
            session.setSidebarOrder(filtered)
            setLoadingSubmit(false)
            setTipText('')
            message.success(TEXT_MESSAGE.SIDEBAR_APP_DELETE_TEXT)
            return;
        }


        const res = await dispatch(deleteSidebarApp(item.id))

        if(res.error === undefined){
            const filtered = sidebarOrder.filter(data => data.name !== item.name)
            const payload = {
                sidebar : filtered
            }
            session.setSidebarOrder(filtered)
            await dispatch(getSidebarAppsUser())
            await dispatch(changeSidebarOrder(payload))
            await dispatch(getSidebarOrder())
            setLoadingSubmit(false)
            setTipText('')
            message.success(TEXT_MESSAGE.SIDEBAR_APP_DELETE_TEXT)
        }else{
            setLoadingSubmit(false)
            setTipText('')
            message.error(TEXT_MESSAGE.ERROR_TEXT)
        }
    }

const handleDeleteCurateitApp = async (item) => {
    setLoadingSubmit(true)
    setTipText('Deleting app...')
    const filtered = sidebarOrder.filter(data => data.name !== item.name)
    
    const payload = {
        sidebar: [...filtered],
    }
    session.setSidebarOrder(payload.sidebar)
    if(session?.userId){
        await dispatch(changeSidebarOrder(payload))
        await dispatch(getSidebarOrder())
    }

    setLoadingSubmit(false)
    setTipText('')
    message.success(TEXT_MESSAGE.CURATEIT_APP_DELETE_TEXT)
}

const handleAddCurateitApp = async (item) => {
    setLoadingSubmit(true)
    setTipText('Adding app...')
    const payload = {
        sidebar: [...sidebarOrder,item],
    }
    session.setSidebarOrder(payload.sidebar)
    await dispatch(changeSidebarOrder(payload))
    await dispatch(getSidebarOrder())
    setLoadingSubmit(false)
    setTipText('')
    message.success(TEXT_MESSAGE.CURATEIT_APP_CREATE_TEXT)
}
    return(
        <>
        <LayoutCommon>
            {
                loading ? 
                <div className="flex justify-center align-center pt-4">
                    <Spin tip="Loading..." />
                </div>
                :
                <>
                <Header
                label={'Apps'}
                isHideBackButton={false}
                isMenuItemEnabled={false}
                onBackBtnClick={false}
                menuItems={[]}
                MenuIcon={null}
                isDownloadable={false}
                onDownload={false}
            />

            {
                loadingSubmit && <div className="spin-overlay">
                    <Spin tip={tipText} />
                </div>
            }

            <div className="py-4 px-2 bg-[#E9E9E9]">
                    <Input 
                    placeholder="Search app"
                    className="outline-none"
                    allowClear
                    onChange={handleSearchChange}
                    />
                    {session?.userId && <>
                        <div className="bg-white p-2 rounded-[10px] my-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium block">Curateit apps</span>
                            </div>
                            {
                                curateitApps  &&
                                <div className="px-1 customapp-grid" style={{gridTemplateColumns:"repeat(3, 1fr)"}}>
                                        {
                                        curateitApps.map((item,i) => {
                                        return(
                                            <div key={i} className="w-full cursor-pointer relative flex flex-col items-center justify-center group bg-[#F2F4F5] p-2 rounded-[10px]" 
                                            onClick={sidebarOrder?.some(data => data?.name?.toLowerCase() === item.name.toLowerCase()) ? () => handleDeleteCurateitApp(item) : () => handleAddCurateitApp(item)}
                                            >
                                            {generateCurateitAppsUi(item,sidebarOrder)}
                                            </div>
                                        )
                                        })
                                        }
                                </div>
                            }
                        </div>
                    </>}
                    
                    <div className="bg-white p-2 rounded-[10px] mb-4">
                    <div className="flex items-center justify-between">
                        <span className="font-medium block">Selected apps</span>
                        <Button type="text" onClick={()  => {
                            if(!session?.userId){
                                navigate('/login')
                            }else{
                                navigate('/custom-application')
                            }
                        }}>+ App</Button>
                    </div>

                    {/* Display below only if user is not loggedIn */}
                    {
                        !session.userId && sidebarOrder && 
                        <div className="px-4 customapp-grid">
                            {
                            sidebarOrder?.map((item,i) => {
                            return(
                                <div key={i} className="w-full cursor-pointer relative flex flex-col items-center justify-center group bg-[#F2F4F5] p-2 rounded-[10px]">
                                    <img src={item.icon} alt={item.name} className="h-5 w-5"/>
                                    <Dropdown menu={{ items: selectedAppsMenu }} trigger={["click"]}>
                                        <EllipsisVerticalIcon className="h-5 w-5 absolute top-0 right-[-6px] opacity-0 group-hover:opacity-100" 
                                        onClick={() => setSingleSelectedApp(item)}/>
                                    </Dropdown>
                                    {/* <span className="text-xs block mt-2 font-medium overflow-text-anywhere" title={item.name}>{urlData.host}</span> */}

                                    <span className="text-xs block mt-2 font-medium overflow-text-anywhere" title={item.name}>{item.name.length > 8 ? `${item.name.substring(0, 8)} ...` : item.name}</span>
                                </div>
                            )
                            })
                            }
                        </div>
                    }

                    {
                        sidebarAppsUser && 
                        <div className="px-4 customapp-grid">
                            {
                            sidebarAppsUser?.map((item,i) => {
                                // const urlData = new URL(item.url)
                            return(
                                <div key={i} className="w-full cursor-pointer relative flex flex-col items-center justify-center group bg-[#F2F4F5] p-2 rounded-[10px]" 
                                >
                                    <img src={item.icon} alt={item.name} className="h-5 w-5"/>
                                    <Dropdown menu={{ items: selectedAppsMenu }} trigger={["click"]}>
                                        <EllipsisVerticalIcon className="h-5 w-5 absolute top-0 right-[-6px] opacity-0 group-hover:opacity-100" 
                                        onClick={() => setSingleSelectedApp(item)}/>
                                    </Dropdown>

                                    <span className="text-center text-xs block mt-2 font-medium w-[50px] truncate" title={item.name}>{item.name}</span>
                                </div>
                            )
                            })
                            }
                        </div>
                    }
                    </div>
                    
                    {
                        searchedApps && 
                        <>
                            {searchedApps.map((item, index) => (
                            <div key={index} className="bg-white p-2 rounded-[10px] mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium block">{item.name || ''}</span>
                                    </div>

                                    <div className="px-4 customapp-grid">
                                        {item.apps.map((app, appIndex) => (
                                            <div key={appIndex} className="w-full">
                                                <div className="cursor-pointer relative flex flex-col items-center justify-center group bg-[#F2F4F5] p-2 rounded-[10px]" onClick={() => handleAddSidebarApps(app)}>
                                                    <img src={app.icon} alt={app.name} className="h-5 w-5"/>
                                                        <PlusIcon className="absolute top-0 right-[-6px] h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100"/>
                                                    <span className="text-center text-xs block mt-2 font-medium truncate w-[50px]" title={app.name}>
                                                        {app.name}
                                                        </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                            </div>
                            ))}
                        </>
                    }
            </div>
                </>
            }
        </LayoutCommon>
        
        </>
    )
}

export default DefaultSidebarApps;