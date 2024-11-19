import { useSelector } from "react-redux";
import LayoutCommon from "../../components/commonLayout/LayoutCommon";
import ShareCollectionDrawer from "../../components/common/Drawer/ShareCollectionDrawer";
import { useParams } from "react-router-dom";
import Header from "../../components/header/Header";
import { useEffect, useState } from "react";

const ShareCollection = ({}) =>  {
    const { id } = useParams()
    const {singleCollection} = useSelector(state => state.collection)
    const [imagesArr,setImagesArr] = useState([])

    useEffect(() => {
      if (singleCollection && singleCollection?.attributes?.gems && singleCollection?.attributes?.gems?.data?.length>0) {
      let arr = []
      singleCollection?.attributes?.gems?.data?.forEach(item => {
        if (item?.attributes?.metaData?.docImages && item?.attributes?.metaData?.docImages?.length>0) {
          item?.attributes?.metaData?.docImages.forEach(image => {
            arr.push(image)
          })
        }
      })
      setImagesArr(arr)
    }
    },[singleCollection])

    return(
        <LayoutCommon>
        <div className="flex flex-col h-screen">
                <Header
                    label={'Share Collection'}
                    isHideBackButton={false}
                    isMenuItemEnabled={false}
                    onBackBtnClick={false}
                    menuItems={[]}
                    MenuIcon={null}
                    isDownloadable={false}
                    onDownload={false}
                />
                
                <div className="p-2">
                    <ShareCollectionDrawer
                        singleCollectionDetails={singleCollection?.attributes || ''}
                        collectionId={Number(id)}
                        existingThumbnails={imagesArr?.length > 0 ? imagesArr : []}
                    />
                </div>
        </div>
        </LayoutCommon>
    )
}

export default ShareCollection;