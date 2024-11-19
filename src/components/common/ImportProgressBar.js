import React                from "react";
import { useSelector }      from "react-redux";
import { LoadingOutlined }  from '@ant-design/icons';
import { 
    Progress, 
    Spin 
}                           from "antd";

const ImportProgressBar = () => {
    const { currentImportStatus, percentage, isSyncing } = useSelector((state) => state.app);

    if (!isSyncing || !currentImportStatus) return null;
    return (
        <>
            <div className="flex items-center justify-start">
                <label className="text-[#347AE2] text-[14px] mr-5">Importing bookmarks</label>
                <Spin size="small" indicator={<LoadingOutlined style={{ fontSize: 12 }} spin />} />
            </div>
            <div className="flex items-center justify-between">
                <Progress percent={percentage} showInfo={false} strokeColor={"#347AE2"} trailColor={"#E5F0FF"} className="mr-5" />
                <div>
                    <label className="text-[#347AE2]">{currentImportStatus.processedItems}</label>
                    <label className="text-[#292B38]">{`/${currentImportStatus.totalItems}`}</label>
                </div>
            </div>
        </>
    )
}

export default ImportProgressBar;