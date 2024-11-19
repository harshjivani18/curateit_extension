import "./CommonLayout.css";
import React from "react";

import CommonHeader from "../../components/header/CommonHeader";
import LayoutFooter from "./LayoutFooter";

const CommonLayout = (props) => {
  return (
    <div
      className={
        props.mainClassName ||
        "radial-grad-up pb-14 flex flex-col h-full overflow-hidden"
      }
    >
      {!props.isHideHeader && (
        <div className="border-b-2 py-2 px-4">
          <CommonHeader showBarIcon={props.showBarIcon} />
        </div>
      )}
      <div className="overflow-y-scroll flex-1">{props.children}</div>
      {props.showFooter && (
        <div className={props.footerClassName}>
          <LayoutFooter
            footerClassName={props.footerClassName}
            showSaveButton={props.showSaveButton}
            onSaveButtonClick={props.onSaveButtonClick}
            showSubmitBtn={props.showSubmitBtn}
          />
        </div>
      )}
    </div>
  );
};

export default CommonLayout;
