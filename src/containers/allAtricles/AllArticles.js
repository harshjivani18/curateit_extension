import React, { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Button, Collapse, message } from "antd"
import Modal from "../../components/modal/Modal"
import LoadingScreen from "../../components/Loadingscreen/Loadingscreen"

import { getBookmarksByMediaType } from "../../actions/collection"
import { setCurrentGem, setCurrentMedia } from "../../actions/gem"
import Bookmark from "../../components/folderList/Bookmark"
import { IoReader, IoReaderOutline } from "react-icons/io5"
const { Panel } = Collapse

const AllArticles = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [messageApi, contextHolder] = message.useMessage()

  const [showModal, setShowModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [readArticles, setReadArticles] = useState([]);
  const [unReadArticles, setUnReadArticles] = useState([]);
  const [page, setPerPage] = useState(1);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const getCall = async () => {
      if(page === 1){
        setIsProcessing(true)
      }else{
        setIsProcessing(false)
      }
      setLoading(true)
      const res = await dispatch(getBookmarksByMediaType('Article',page))
      setBookmarks((prevData) => [...prevData, ...res?.payload?.data?.message || []]);
      if (res?.payload?.data?.totalCount <= bookmarks.length + res?.payload?.data?.message?.length) {
        setHasMore(false);
      }else{
        setHasMore(true)
      }
      setLoading(false)

      const filteredData = res?.payload?.data?.message?.reduce((acc, item) => {
          const key = item.isRead ? 'read' : 'unread';
          acc[key].push(item);
          return acc;
      }, { read: [], unread: [] })

      const read = filteredData.read.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const unRead = filteredData.unread.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

      setReadArticles([...readArticles,...read] || [])
      setUnReadArticles([...unReadArticles,...unRead] || [])
      setIsProcessing(false)
    }

    getCall()
  },[page])

  const updateReadStatus = (obj) => {
    const filtered = unReadArticles.filter(item => item.id !== obj.id)
    setUnReadArticles(filtered)
    setReadArticles([...readArticles,{...obj,isRead: true}])
  }

  const onEditGem = (gem) => {
    dispatch(setCurrentGem(gem))
    dispatch(setCurrentMedia(gem.media))
    navigate(`/article`)
  }

  const onCloseModal = () => {
    setShowModal(false)
    setShowEdit(false)
  }

  const Header = ({ title, numbers }) => (
    <div className="flex justify-start items-center">
      {title === "Read" ? <IoReaderOutline className="mr-2 h-5 w-5" /> : <IoReader className="mr-2 h-5 w-5" />}
      <span className="text-md font-bold">
        {title}{" "}
        <span className="ml-5 text-gray-300 font-normal">{numbers}</span>
      </span>
    </div>
  )



  return (
    <>
      {contextHolder}
      <div
        className={
          showModal === true
            ? "footer-position py-3 px-4 pb-0 flex-1 ct-relative"
            : "py-3 px-4 pb-0 flex-1 ct-relative"
        }
      >
        {isProcessing && <LoadingScreen showSpin={isProcessing} />}
        {!isProcessing && <div className="flex justify-end items-center font-semibold">
          <div>
              <button
                  className="text-[#347AE2]"
                  onClick={() => navigate("/article")}
              >
                  + Add Article
              </button>
              
          </div>
          </div>}
        {((readArticles.length === 0 && unReadArticles.length === 0)) && !isProcessing && (
          <div className="text-center py-10 mt-10">
            <div className="ct-relative mt-2">
              <img
                className="h-50 w-50 my-0 mx-auto"
                src="/icons/upload-error.svg"
                alt="Cloud ellipse icons"
              />
              <div className="absolute top-[85px] left-0 justify-center w-full text-xs text-gray-400">
                No data! Please add articles
              </div>
            </div>
          </div>
        )}

        <div
          className={(readArticles.length === 0 && unReadArticles.length === 0) ? "d-none" : "main-box py-2 h-full"}
        >
          <Collapse bordered={false} expandIconPosition="end" defaultActiveKey={['1']}>
            <Panel
              header={<Header title="Unread" numbers={unReadArticles.length} />}
              key="1"
            >
              {unReadArticles.map((article) => (
                <Bookmark
                  key={article?.id}
                  obj={article}
                  parent={article?.collection_gems}
                  editGem={onEditGem}
                  isFromArticlePage={true}
                  updateReadStatus={updateReadStatus}
                />
              ))}
              {!isProcessing && hasMore && unReadArticles.length > 20 && <div className="my-2">
                  <Button onClick={() => setPerPage(page + 1)} disabled={loading} size="small" type="link" className="!text-[#347AE2] hover:[#347AE2]">{loading ? 'Loading...' : 'Load More'}</Button>
              </div>}
            </Panel>
            <Panel
              header={<Header title="Read" numbers={readArticles.length} />}
              key="2"
            >
              {readArticles.map((article) => (
                <Bookmark
                  key={article?.id}
                  obj={article}
                  parent={article?.collection_gems}
                  editGem={onEditGem}
                />
              ))}
            </Panel>
            {!isProcessing && hasMore && readArticles.length > 20 && <div className="my-2">
                  <Button onClick={() => setPerPage(page + 1)} disabled={loading} size="small" type="link" className="!text-[#347AE2] hover:[#347AE2]">{loading ? 'Loading...' : 'Load More'}</Button>
              </div>}
          </Collapse>
        </div>

        <div className={showModal ? "pop-box" : ""}>
          <div className={showModal === true ? "popup-delete-model" : ""}>
            {showModal && (
              <div className="border-t-[1px]">
                <Modal
                  showOpen={showModal}
                  edit={showEdit}
                  cancel={onCloseModal}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default AllArticles
