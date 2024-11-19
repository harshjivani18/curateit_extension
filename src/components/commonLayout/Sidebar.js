import {  Layout } from "antd";
import MenuItem from "./MenuItem";

const { Sider } = Layout;

const Sidebar = ({collapsed,setCollapsed,tooltipPlacement='leftTop'}) => {


    return (
      <>
        <Sider
          className={`bg-white overflow-auto border-solid border-l-2 border-[#E6F0FF] z-50 ${
            collapsed ? "sider-w50" : "sider-w60"
          }`}
          trigger={null}
          collapsible
          collapsed={collapsed}
          width="60px"
        >
          <MenuItem
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            tooltipPlacement={tooltipPlacement}
          />
        </Sider>
      </>
    )
}

export default Sidebar