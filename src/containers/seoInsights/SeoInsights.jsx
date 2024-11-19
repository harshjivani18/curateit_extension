/* global chrome */
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/commonLayout/Sidebar";
import { Layout } from "antd";
import Footer from "../../components/commonLayout/Footer";
import Header from "../../components/commonLayout/Header";
import SeoPage from "./SeoPage";

const { Content } = Layout;

const SeoInsights = (props) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <Layout
        style={{
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setTextExtract={props.setTextExtract}
        />
        {collapsed && !showMenu && <></>}

        {collapsed && showMenu && (
          <>
            <Layout
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                tooltipPlacement="top"
              />
            </Layout>
            <Footer collapsed={collapsed} setCollapsed={setCollapsed} />
          </>
        )}

        {!collapsed && (
          <>
            <Layout
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div className="overflow-y-scroll flex-1 h-full bg-white relative">
                <Content style={{ background: "#FCFCFD" }}>
                  <SeoPage />
                </Content>
              </div>
              <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            </Layout>
            <Footer collapsed={collapsed} />
          </>
        )}
      </Layout>
    </>
  );
};

export default SeoInsights;
