import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileUploader } from 'react-drag-drop-files'
import { useDispatch  }                                     from "react-redux";
import HomeHeader from '../components/HomeHeader/HomeHeader'
import { FiUpload } from "react-icons/fi"
import Button from '../components/Button/Button'
import {getCollectionById, importcol }    from '../actions/collection';
import LoadingScreen from '../components/Loadingscreen/Loadingscreen';
import { useSelector } from "react-redux";
import { message } from 'antd';
import { processBookmarkJson } from '../utils/process-bookmark-json';
import session from '../utils/session';
const settingMenu = [
    {
        id: 1,
        name: "Setting",
        link: "#",
        icon: "setting-icon.svg",
        alt: "setting icon"

    },
    {
        id: 2,
        name: "Download app",
        link: "#",
        icon: "file-donwload.svg",
        alt: "download icon"
    },
    {
        id: 3,
        name: "Help & Support",
        link: "#",
        icon: "help-octagon.svg",
        alt: "help octagon icon"
    },
    {
        id: 4,
        name: "What's New?",
        link: "#",
        icon: "bookopen-icon.svg",
        alt: "Book open icon"
    },
    {
        id: 5,
        name: "Report Bug",
        link: "#",
        icon: "bug.svg",
        alt: "Bug icon"
    },
    {
        id: 6,
        name: "Logout",
        link: "#",
        icon: "log-out.svg",
        alt: "logout icon"
    }
]

const fileTypes = ["HTML"];

const Home = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const username = useSelector((state) => state.login.signupData)
    const name = useSelector((state) => state.login.loginData)
    const importname = useSelector((state) => state.collection.collectionData)
    const [file, setFile] = useState(null);
    const [showSpin,setShowSpin]= useState(false)
    const [loading,setloading] = useState(false)
    const userData = username?.user?.username
    const nameData = name?.user?.username
    const importnameData = importname?.[0]?.author?.username

    const handleChange = async(files) => {
        setFile(file);
        setShowSpin(true)
        setloading(true)
        const reader = new FileReader()
        reader.onload = function (e) { 
            const parser    = new DOMParser()
            const htmlDoc   = parser.parseFromString(reader.result, "text/html")
            var htmlElement = htmlDoc.getElementsByTagName("title")[0];

          if(htmlElement.textContent === "Bookmarks"){
            const jsonObjs  = processBookmarkJson(htmlDoc)
            dispatch(getCollectionById(session.unfiltered_collection_id))
            dispatch(importcol(jsonObjs)).then((res) => {
                setShowSpin(false)
                setloading(false)
                setFile(null)
                if(res.payload?.status === 200){
                    navigate("/search-bookmark")
                }
            })
          }else{
            message.error("Please upload a valid bookmark file in html or csv format")
            setShowSpin(false)
            setloading(false)
            return
          }
        }
        reader.readAsText(files)
    };
    const AddBookmark = () => {
        localStorage.setItem("socialTrue",false)
        navigate("/search-bookmark")
    }

    const renderFileUploader = () => {
        return (
            <>
                <FileUploader handleChange={handleChange} name="drop-zone-section-file" types={fileTypes} onTypeError={(err) => message.error(err)}>
                    <div className='my-0 mx-auto w-[348px] h-[218px] bg-white border-2 border-dashed border-gray-400 flex text-center justify-center align-middle items-center'>
                        <div>
                            <FiUpload className='h-6 w-6 text-gray-500 my-0 mx-auto mb-2' />
                            <span>Drag & drop to upload bookmark</span>
                            <div className='flex justify-center items-center gap-2 mt-2'>
                                <hr className='w-12' />
                                <span className='text-gray-500'>OR</span>
                                <hr className='w-12' />
                            </div>
                            <Button variant="mt-2 primary">Browse Bookmarks</Button>
                        </div>
                    </div>
                </FileUploader>
                <div className='btn-center'>
                    <Button onClick={AddBookmark} className={loading? "active-skip-btn": "skip-btn"}>Skip to Add Bookmarks</Button>
                </div>
            </>
        )
    }

    return (
        <>
        <div className='radial-grad-up pb-14'>
            <div className='border-b-2 py-2 px-4'>
                <HomeHeader isHomeHeader={true} headerMenu={settingMenu} userData={userData} nameData={nameData} importnameData={importnameData}/>
            </div>
            { loading? <></> : <div className='text-center py-10'>
                <div className='ct-relative mt-2'>
                    <img className='h-50 w-50 my-0 mx-auto' src="/icons/upload-error.svg" alt="Cloud ellipse icons" />
                    <div className='absolute top-[85px] left-0 justify-center w-full text-xs text-gray-400'>
                        No data! Please add bookmark
                    </div>
                </div>
            </div>}
            <div className='my-0 mx-auto w-[348px] h-[218px]'>
                {showSpin 
                    ? <LoadingScreen showSpin={showSpin}/>
                    : renderFileUploader()
                }                
            </div>
        </div>
            </>
    )
}

export default Home