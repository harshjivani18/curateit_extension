import { useEffect, useState } from "react";
import Header from "../components/header/Header";
import { Tabs } from 'antd';
import AllHighlights from "./AllHighlights";
import AllCodes from "./AllCodes";
import { getAllCodes } from "../actions/code";
import { getAllHighlights } from "../actions/highlights";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import AllImages from "./AllImages";
import { getAllImages } from "../actions/image";
import { fetchCurrentTab } from "../utils/fetch-current-tab";

const ListHighlightCode = () => {
    const dispatch = useDispatch()
    const [tabKey,setTabKey] = useState('Highlights')

    const pageHighlights  = useSelector((state) => state.highlights.highlights);
    const pageCodes       = useSelector((state) => state.codes.codes);
    const pageImages       = useSelector((state) => state.images.images);
    const tabDetails      = useSelector((state) => state.app.tab)

    useEffect(() => {
    const getCall = async () => {
        const tabObj        = tabDetails || await fetchCurrentTab()
        if (tabObj) {
          await dispatch(getAllHighlights(tabObj.url))
          await dispatch(getAllCodes(tabObj.url))
          await dispatch(getAllImages(tabObj.url))
        }
    }

    getCall()
  },[])

    const handleTabChange = (key) => {
        setTabKey(key)
    }
    return(
        <div className='bookmark-bg h-full'>
            <Header 
            label={tabKey === 'Highlights' ? (pageHighlights && pageHighlights[0]?.media && pageHighlights[0]?.media?.length>0)  ? `${pageHighlights[0]?.media?.length} Highlights` : 'Highlights' : tabKey === 'Codes' ? (pageCodes && pageCodes[0]?.media && pageCodes[0]?.media?.length>0) ? `${pageCodes[0]?.media.length} Codes`: 'Codes': (pageImages && pageImages.length>0) ? `${pageImages.length} Images` : 'Images'}
            />
            <div className="bg-[#F8FBFF] p-4 rounded-t-[16px]">
                <Tabs
                defaultActiveKey={tabKey}
                onChange={handleTabChange}
                items={[
                {
                    label: `Highlights`,
                    key: 'Highlights',
                    children: <AllHighlights/>,
                },
                {
                    label: `Codes`,
                    key: 'Codes',
                    children: <AllCodes/>,
                },
                {
                    label: `Images`,
                    key: 'Images',
                    children: <AllImages/>,
                },
                ]}
            />
            </div>
        </div>
    )
}

export default ListHighlightCode;