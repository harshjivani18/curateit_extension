import React from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import StickyBox from "react-sticky-box";
import { Tabs, Badge } from "antd";

import CommonLayout from "../../components/layouts/CommonLayout";
import { MAIN_PAGE_TABS } from "../../utils/constants";

import { setActiveHomeTab } from "../../actions/app";
import Gems from "../gems/Gems";
import LayoutCommon from "../../components/commonLayout/LayoutCommon";
import { useSearchParams } from "react-router-dom";

const HomeTabPage = (props) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams()
  const refetch = searchParams.get("refetch") || null;
  
  const pageHighlights = useSelector((state) => state.highlights.highlights);
  const pageCodes = useSelector((state) => state.codes.codes);
  const pageImages = useSelector((state) => state.images.images);
  const activeTabKey = useSelector((state) => state.app.activeTabKey);
  const highlightsLength =
    (pageHighlights &&
      pageHighlights[0]?.media &&
      pageHighlights[0]?.media?.length) ||
    0;
  const codesLength =
    (pageCodes && pageCodes[0]?.media && pageCodes[0]?.media?.length) || 0;
  const imagesLength = (pageImages && pageImages.length) || 0;
  const finalCount = highlightsLength + codesLength + imagesLength;

  // useEffect(() => {
  //     const getTabKey = () => {
  //         const searchText = window.TAB_QUERY
  //         
  //         window.TAB_QUERY = ""
  //         if (searchText === undefined) {
  //             setActiveTab(1)
  //             return
  //         }
  //         if (searchText.includes("highlight-list")) {
  //             setActiveTab(2)
  //         }
  //         else if (searchText.includes("comments")) {
  //             setActiveTab(3)
  //         }
  //         else if (searchText.includes("ai")) {
  //             setActiveTab(4)
  //         }
  //         else {
  //             setActiveTab(1)
  //         }
  //     }
  //     getTabKey()
  // }, [])

  const onTabChange = (key) => {
    dispatch(setActiveHomeTab(key));
  };

  const renderTabs = (tabProps, DefaultTabBar) => {
    return (
      <StickyBox
        offsetTop={0}
        offsetBottom={20}
        style={{
          zIndex: 1,
          padding: "15px 15px 0px 15px",
          backgroundColor: "white",
        }}
      >
        <DefaultTabBar
          {...tabProps}
          label={
            tabProps.id === 2 ? (
              <span>
                Highlights <Badge count={finalCount} showZero />
              </span>
            ) : (
              tabProps.label
            )
          }
        />
      </StickyBox>
    );
  };

  return (
    <LayoutCommon>
      <Gems refetch={refetch} />
    </LayoutCommon>
    // <CommonLayout showFooter={false}
    //               showBarIcon={true}>
    //     {/* <Tabs activeKey={activeTabKey} onChange={onTabChange} renderTabBar={renderTabs} items={MAIN_PAGE_TABS} /> */}
    // <Gems />
    // </CommonLayout>
  );
};

export default HomeTabPage;
