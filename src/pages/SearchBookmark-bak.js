import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import BookmarkFooter from '../components/bookmarkFooter/BookmarkFooter'
import FolderList from '../components/folderList/FolderList'
import HomeHeader from '../components/HomeHeader/HomeHeader'
import InputWithIconOther from '../components/inputWithIcon/InputWithIconOther'
import { useDispatch, useSelector } from "react-redux";
import { getAllCollections } from '../actions/collection'
import LoadingScreen from '../components/Loadingscreen/Loadingscreen';
import { deleteGem } from "../actions/gem/index.js";
import { deleteCollection, editCollection } from '../actions/collection/index'
import { deleteSubcollection } from '../actions/subcollection'
import Modal from '../components/modal/Modal.js'
import { ChevronDownIcon, ChevronUpDownIcon, StarIcon } from '@heroicons/react/24/solid'
import MenuList from '../components/menuList/MenuList'
import { Menu } from '@headlessui/react'

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
    id: 7,
    name: "Logout",
    link: "#",
    icon: "log-out.svg",
    alt: "logout icon"
  }
]

const bookmarkSaveOptions = [
  {
    id: 1,
    name: "Save tabs...",
    link: "/",
    icon: "add-bookmark-dark.svg",
    alt: "setting icon"

  },
  {
    id: 2,
    name: "Upload file...",
    link: "#",
    icon: "file-donwload.svg",
    alt: "download icon"
  },
  {
    id: 3,
    name: "Add highlights...",
    link: "#",
    icon: "pencil-icon.svg",
    alt: "pencil icon"
  },
]
const SearchBookmark = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const importbookmark = useSelector((state) => state.collection.collectionData)
  const dataFetchedRef = useRef(false);
  const [searchText, setSearchText] = useState("");
  const [showSpin, setShowSpin] = useState(false);
  const [header, setHeader] = useState(false);
  const [model, setModel] = useState(false);
  const [collectionName, setCollectionName] = useState()
  const [currentId, setCurrentId] = useState();
  const [edit, setEdit] = useState(false)
  const onChangeText = (value) => {
    setSearchText(value);
  }

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    fetchData();
  }, []);

  const fetchData = async () => {
    if (localStorage.getItem("show_spinner") === "true") {
      setShowSpin(false)
      localStorage.removeItem("show_spinner")
    }else{
      setShowSpin(true)
    }
    const result = await dispatch(getAllCollections());
    if (result.error === undefined && result.payload.error === undefined) {
      if (result.payload.status === 200) {
        setShowSpin(false)
      } if (result.payload.data.collections.length === 0) {
        setHeader(!header)
      }
    }
  }

  const deleteGems = async (id) => {
    await dispatch(deleteGem(id));
    await fetchData();
  }

  const editGem = async (id) => {
    navigate(`/bookmark/${id}`)
  }

  const modalEdit = async (data) => {
    setModel(true)
    setEdit(true)
    setCurrentId(data.id)
    setCollectionName(data)
  }

  const modalDelete = async (data) => {
    setModel(true)
    setCurrentId(data.id)
    setCollectionName(data.name)
  }

  const deleteCollections = async () => {
    await dispatch(deleteCollection(currentId));
    await fetchData();
    setModel(false)
  }


  const editCollections = async (data, name) => {
    data.name = name
    let newData = {
      data: data
    }
    await dispatch(editCollection(newData, data.id));
    // await fetchData();
    setEdit(false)
    setModel(false)
  }

  const deleteSubcollections = async (id) => {
    await dispatch(deleteSubcollection(id));
    await fetchData();
  }

  const editSubcollections = async (id) => {
    //need to check what page is rendering
    navigate(`/bookmark/${id}`)
  }
  const cancle = () => {
    setModel(false)
    setEdit(false)
  }

  const subCollection = []
  const parentCollection = []
  const filterData = []
  const finalresult = []

  importbookmark?.forEach((data) => {
    if (data.parent_collection.length > 0) {
      // let subcollection = {
      //   data,
      data["children"] = []
      // }
      subCollection.push(data)
    } else {
      // let parent = {
      //   data,
      //   children:[]
      // }
      data["children"] = []
      parentCollection.push(data)
    }
  })

  const findparentCollection = (k) => {
    return filterData.filter(id => id.id === k.parent_collection[0].id)
  }

  const childrenCollection = (k) => {
    return subCollection.filter(id => id.id === k.parent_collection[0].id)
  }

  // 
  // 

  subCollection?.forEach((k, i) => {
    let data = parentCollection.filter(id => id.id === k.parent_collection[0].id)
    let newidfilter = childrenCollection(k)
    // 

    // 
    if (newidfilter.length > 0) {
      newidfilter[0].children = [...newidfilter[0]?.children, k]
    } else if (data.length > 0) {
      data[0].children = [...data[0]?.children, k]
      filterData.push(...data)
    }

    if (newidfilter.length === 0) {
      const data = findparentCollection(k)
      finalresult.push(...data)
    }
   
  })
  const result = parentCollection.filter(word => word.children.length <= 0);

  result.map((data) => {
    filterData.push(data)
  })
  // 
  const uniqueIds = [];
  const unique = finalresult.filter(element => {
    const isDuplicate = uniqueIds.includes(element.name);
    if (!isDuplicate) {
      uniqueIds.push(element.name);
      return true;
    }
    return false;
  });
  // 

  const getUniqueAfterMerge = (arr1, arr2) => {

    // merge two arrays
    let arr = arr1.concat(arr2);
    let uniqueArr = [];

    // loop through array
    for (let i of arr) {
      if (uniqueArr.indexOf(i) === -1) {
        uniqueArr.push(i);
      }
    }
    return uniqueArr;
  }
  
  
  
  const data = getUniqueAfterMerge(parentCollection, unique);
  
  // 


  return (
    <>

      <div className='ct-relative bg-[#F8FBFF] pt-14 max-h-[600px] overflow-y-auto scroll-smooth dark:bg-[#292B38]' >
        <div className='header fixed top-0 left-0 border-b-2 py-3 px-4 bg-white z-30  dark:bg-slate-500'>
          <HomeHeader headerMenu={settingMenu} />
        </div>
        <div className={model === true ? "footer-position py-3 px-4" : "py-3 px-4"}>
          <div className='fixed search-header z-20'>
            <div className='flex justify-between items-center gap-2'>
              <div className='flex-1 ct-relative'>
                <InputWithIconOther onChange={onChangeText} type="text" placeholder="Search bookmark" name="search-bookmark" showRightIcon={true} />
              </div>
              <div className='flex justify-end items-center gap-[1px]'>
                <button className='h-[40px] bg-[#347AE2] text-white rounded-l-lg flex justify-center items-center gap-1 px-2'>
                  <button className='h-[40px] w-[40px] bg-[#347AE2] rounded-lg flex justify-center items-center' onClick={() => navigate('/add-bookmark')}>
                    <img className='h-5 w-5' src="/icons/add-bookmark.svg" alt="add bookmark icon" />
                  </button>
                </button>
                <MenuList menus={bookmarkSaveOptions} position="origin-top-left top-0 right-0 mt-10 w-48">
                  <Menu.Button className="h-[40px] bg-[#347AE2] text-white rounded-r-lg inline-flex w-full justify-center items-center px-2">
                    <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                  </Menu.Button>
                </MenuList>
              </div>
            </div>
          </div>
          <LoadingScreen showSpin={showSpin} />
          {header === true ? <div className='text-center py-10'>
            <div className='ct-relative mt-2'>
              <img className='h-50 w-50 my-0 mx-auto' src="/icons/upload-error.svg" alt="Cloud ellipse icons" />
              <div className='absolute top-[85px] left-0 justify-center w-full text-xs text-gray-400'>
                No data! Please add bookmark
              </div>
            </div>
          </div> : <></>}
          {/* {
          data?.map((list) => {
            return ( */}
            {/* <div className='main-box mt-10'>
              <FolderList
                searchText={searchText}
                list={data}
                deleteGems={deleteGems}
                editGem={editGem}
                modalEdit={modalEdit}
                modalDelete={modalDelete}
                editCollections={editCollections}
                deleteSubcollections={deleteSubcollections}
                editSubcollections={editSubcollections}
                setCollectionName={setCollectionName}
              />
            </div> */}
            {/* )
          })

        }  */}
          
          <div className='main-box mt-10'>
            <FolderList
              searchText={searchText}
              list={data}
              deleteGems={deleteGems}
              editGem={editGem}
              modalEdit={modalEdit}
              modalDelete={modalDelete}
              editCollections={editCollections}
              deleteSubcollections={deleteSubcollections}
              editSubcollections={editSubcollections}
              setCollectionName={setCollectionName}
            />
          </div>
        </div>
      </div>
      <div className={model === true ? "pop-box" : ""}>
        <div className={model === true ? "popup-delete-model" : ""}>
          {model && < Modal
            showOpen={model}
            deleteCollections={deleteCollections}
            edit={edit}
            cancle={cancle}
            collectionName={collectionName}
            editCollections={editCollections}
          />}
        </div>
        <div className={model === true ? "footer-active border-t-[1px] py-3 px-4 bg-white z-50" : "border-t-[1px] py-3 px-4 bg-white z-50"}>
          <BookmarkFooter page="search-bookmark" />
        </div>
      </div>
    </>
  )
}

export default SearchBookmark