import {
  BookOpenIcon,
  CheckBadgeIcon,
  ClockIcon,
  InformationCircleIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  DocumentMagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import { Divider, Dropdown, Tooltip } from "antd";
import { RiScreenshot2Line } from "react-icons/ri";
import { BsWindowPlus } from "react-icons/bs";
import { TbFileDownload } from "react-icons/tb";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const generateMenuUi = (
  item,
  tooltipPlacement,
  callbacks,
  screenshotItems,
  activeTab
) => {
  const itemName = item?.name?.toLowerCase();
  if (
    item.type === "menu" &&
    (itemName === "flashcards" || itemName === "quiz" || itemName === "summary")
  ) {
    return (
      // <Tooltip placement={tooltipPlacement} title={item.name} key={item.name}>
      <div
        onClick={() => callbacks.handleNavigate(item.url)}
        title={item.name}
        className={classNames(
          activeTab === item.name ? "bg-[#347AE2] text-white" : "",
          "cursor-pointer mb-2 p-1 rounded-md"
        )}
      >
        <img
          src={item.imgUrl || item.icon}
          title={item.name}
          alt="tab icon"
          className="h-5 w-5 cursor-pointer"
        />
      </div>
      // </Tooltip>
    );
  }

  if (
    item.type === "menu" &&
    (itemName === "tabs manager" ||
      itemName === "highlight" ||
      itemName === "text expander" ||
      itemName === "save tabs")
  ) {
    return (
      <div
        onClick={() => callbacks.handleNavigate(item.url)}
        title={item.name}
        className={classNames(
          activeTab === item.name ? "bg-[#347AE2] text-white" : "",
          "cursor-pointer mb-2 p-1 rounded-md"
        )}
      >
        {itemName === "tabs manager" || itemName === "save tabs" ? (
          <svg
            title={item.name}
            width="20"
            height="20"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="0.12"
              d="M2 5.86602C2 4.74591 2 4.18586 2.21799 3.75803C2.40973 3.38171 2.71569 3.07575 3.09202 2.884C3.51984 2.66602 4.0799 2.66602 5.2 2.66602H10.8C11.9201 2.66602 12.4802 2.66602 12.908 2.884C13.2843 3.07575 13.5903 3.38171 13.782 3.75803C14 4.18586 14 4.74591 14 5.86602V6.66602H2V5.86602Z"
              fill="#062046"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M14 7.66602V5.86602C14 4.74591 14 4.18586 13.782 3.75803C13.5903 3.38171 13.2843 3.07575 12.908 2.884C12.4802 2.66602 11.9201 2.66602 10.8 2.66602H5.2C4.0799 2.66602 3.51984 2.66602 3.09202 2.884C2.71569 3.07575 2.40973 3.38171 2.21799 3.75803C2 4.18586 2 4.74591 2 5.86602V11.466C2 12.5861 2 13.1462 2.21799 13.574C2.40973 13.9503 2.71569 14.2563 3.09202 14.448C3.51984 14.666 4.0799 14.666 5.2 14.666H8.33333M14 6.66602H2M12 13.9993V9.99935M10 11.9993H14"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="4.66667" cy="4.66667" r="0.666667" fill="#062046" />
            <circle cx="6.66667" cy="4.66667" r="0.666667" fill="#062046" />
            <ellipse
              cx="8.66667"
              cy="4.66667"
              rx="0.666667"
              ry="0.666667"
              fill="#062046"
            />
          </svg>
        ) : itemName === "highlight" ? (
          <PencilIcon title={item.name} className="h-5 w-5 cursor-pointer" />
        ) : (
          <svg
            title={item.name}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
          >
            <path d="M7 17H17V14.5L20.5 18L17 21.5V19H7V21.5L3.5 18L7 14.5V17ZM13 6V15H11V6H5V4H19V6H13Z"></path>
          </svg>
        )}
      </div>
    );
  }

  if (
    item.type === "menu" &&
    (itemName === "Screenshot" || itemName === "screenshot")
  ) {
    return (
      // <Tooltip placement={tooltipPlacement} title={item.name} key={item.name}>
      <div
        onClick={() => callbacks.onScreenshotClick()}
        title={item.name}
        className={classNames(
          activeTab === item.name ? "bg-[#347AE2] text-white" : "",
          "cursor-pointer mb-2 p-1 rounded-md"
        )}
      >
        <RiScreenshot2Line className="h-5 w-5" title={item.name} />
      </div>
      // </Tooltip>
    );
  }

  if (item.type === "menu" && itemName === "reader view") {
    return (
      // <Tooltip placement={tooltipPlacement} title={item.name} key={item.name}>
      <div
        onClick={() => callbacks.onReaderViewClick()}
        className="cursor-pointer mb-2 p-1 rounded-md"
        title={item.name}
      >
        <BookOpenIcon title={item.name} className="h-5 w-5" />
      </div>
      // </Tooltip>
    );
  }

  if (
    item.type === "menu" &&
    (itemName === "info" || itemName === "seo" || itemName === "read later")
  ) {
    return (
      // <Tooltip placement={tooltipPlacement} title={item.name} key={item.name}>
      <div
        onClick={() => callbacks.handleNavigate(item.url)}
        title={item.name}
        className={classNames(
          activeTab === item.name ? "bg-[#347AE2] text-white" : "",
          "cursor-pointer mb-2 p-1 rounded-md"
        )}
      >
        {itemName === "info" && (
          <InformationCircleIcon
            title={item.name}
            className="h-5 w-5 cursor-pointer"
          />
        )}
        {itemName === "seo" && (
          <DocumentMagnifyingGlassIcon
            title={item.name}
            className="h-5 w-5 cursor-pointer"
          />
        )}
        {itemName === "read later" && (
          <ClockIcon title={item.name} className="h-5 w-5 cursor-pointer" />
        )}
      </div>
      // </Tooltip>
    );
  }

  if (item.type === "menu" && itemName === "dark/light mode") {
    return (
      <button
        className="cursor-pointer mb-2 p-1 rounded-md"
        title={callbacks.mode === "dark" ? "Light Mode" : "Dark Mode"}
        onClick={callbacks.onModeChange}
        disabled={!callbacks.isProcessDone}
      >
        {callbacks.mode === "dark" ? (
          <SunIcon className="h-6 w-6 text-gray-700" />
        ) : (
          <MoonIcon className="h-6 w-6 text-gray-700" />
        )}
      </button>
    )
  }

  if (item.type === "app" || item.openAs) {
    return (
      // <Tooltip placement={tooltipPlacement} title={item.name} key={item.name}>
      <div
        onClick={() => callbacks.handleOpenCustomApp(item)}
        className="cursor-pointer mb-2 p-1 rounded-md"
        title={item.name}
      >
        <img
          src={item.icon}
          title={item.name}
          alt="tab icon"
          className="h-5 w-5 cursor-pointer"
        />
      </div>
      // </Tooltip>
    );
  }

  if (item.type === "menu" && itemName === "save offline") {
    return (
      <button
        className="cursor-pointer mb-2 p-1 rounded-md"
        title={item.name}
        onClick={() => callbacks.handleSingleFile()}
      >
        <TbFileDownload className="w-5 h-5" />
      </button>
    );
  }
};

export const generateMenuTreeData = (
  menuList,
  tooltipPlacement,
  callbacks,
  screenshotItems,
  activeTab
) => {
  const arr = [];

  menuList?.forEach((item, i) => {
    const obj = {
      title: generateMenuUi(
        item,
        tooltipPlacement,
        callbacks,
        screenshotItems,
        activeTab
      ),
      key: i,
      label: item,
    };
    arr.push(obj);
  });

  return arr;
};

export const generateCurateitAppsUi = (item, sidebarOrder) => {
  const itemName = item?.name?.toLowerCase();
  if (
    item.type === "menu" &&
    (itemName === "tabs manager" ||
      itemName === "save tabs" ||
      itemName === "highlight" ||
      itemName === "text expander" ||
      itemName === "flashcards" ||
      itemName === "quiz" ||
      itemName === "summary")
  ) {
    return (
      <div className="w-full cursor-pointer relative flex flex-col items-center justify-center group">
        {sidebarOrder?.some(
          (data) => data?.name?.toLowerCase() === itemName
        ) ? (
          <CheckBadgeIcon className="absolute top-0 left-0 h-4 w-4 text-green-600" />
        ) : (
          ""
        )}
        <img
          src={item.imgUrl || item.icon}
          alt={item.name}
          className={itemName === "screenshot" ? "h-8 w-8" : "h-5 w-5"}
        />
        {sidebarOrder?.some(
          (data) => data?.name?.toLowerCase() === itemName
        ) ? (
          <TrashIcon className="absolute top-0 right-[-6px] h-4 w-4 text-[#EB5757] opacity-0 group-hover:opacity-100" />
        ) : (
          <PlusIcon className="absolute top-0 right-[-6px] h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100" />
        )}

        <span
          className="text-xs block mt-2 font-medium truncate"
          title={item.name}
        >
          {item?.name}
        </span>
      </div>
    );
  }

  if (item.type === "menu" && itemName === "screenshot") {
    return (
      <div className="w-full cursor-pointer relative flex flex-col items-center justify-center group">
        {sidebarOrder?.some(
          (data) => data?.name?.toLowerCase() === itemName
        ) ? (
          <CheckBadgeIcon className="absolute top-0 left-0 h-4 w-4 text-green-600" />
        ) : (
          ""
        )}
        <RiScreenshot2Line className="h-5 w-5" />
        {sidebarOrder?.some(
          (data) => data?.name?.toLowerCase() === itemName
        ) ? (
          <TrashIcon className="absolute top-0 right-[-6px] h-4 w-4 text-[#EB5757] opacity-0 group-hover:opacity-100" />
        ) : (
          <PlusIcon className="absolute top-0 right-[-6px] h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100" />
        )}

        <span
          className="text-xs block mt-2 font-medium truncate"
          title={item.name}
        >
          {item?.name}
        </span>
      </div>
    );
  }

  if (
    item.type === "menu" &&
    (itemName === "info" ||
      itemName === "reader view" ||
      itemName === "seo" ||
      itemName === "read later")
  ) {
    return (
      <div className="w-full cursor-pointer relative flex flex-col items-center justify-center group">
        {sidebarOrder?.some(
          (data) => data?.name?.toLowerCase() === itemName
        ) ? (
          <CheckBadgeIcon className="absolute top-0 left-0 h-4 w-4 text-green-600" />
        ) : (
          ""
        )}
        {itemName === "info" && (
          <InformationCircleIcon className="h-5 w-5 cursor-pointer" />
        )}
        {itemName === "seo" && (
          <DocumentMagnifyingGlassIcon className="h-5 w-5 cursor-pointer" />
        )}
        {itemName === "read later" && (
          <ClockIcon className="h-5 w-5 cursor-pointer" />
        )}

        {itemName === "reader view" && (
          <BookOpenIcon className="h-5 w-5 cursor-pointer" />
        )}
        {sidebarOrder?.some(
          (data) => data?.name?.toLowerCase() === itemName
        ) ? (
          <TrashIcon className="absolute top-0 right-[-6px] h-4 w-4 text-[#EB5757] opacity-0 group-hover:opacity-100" />
        ) : (
          <PlusIcon className="absolute top-0 right-[-6px] h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100" />
        )}
        <span className="text-xs block mt-2 font-medium" title={item.name}>
          {itemName === "info" ? "Insights" : item?.name}
        </span>
      </div>
    );
  }
  if (item.type === "menu" && (itemName === "dark/light mode" || itemName === "save offline")) {
    return (
      <div className="w-full cursor-pointer relative flex flex-col items-center justify-center group">
        {sidebarOrder?.some(
          (data) => data?.name?.toLowerCase() === itemName
        ) ? (
          <CheckBadgeIcon className="absolute top-0 left-0 h-4 w-4 text-green-600" />
        ) : (
          ""
        )}

        {itemName === "save offline" && (
          <TbFileDownload className="w-5 h-5" />
        )}
        {itemName === "dark/light mode" && (
          <MoonIcon className="w-5 h-5" />
        )}

        {sidebarOrder?.some(
          (data) => data?.name?.toLowerCase() === itemName
        ) ? (
          <TrashIcon className="absolute top-0 right-[-6px] h-4 w-4 text-[#EB5757] opacity-0 group-hover:opacity-100" />
        ) : (
          <PlusIcon className="absolute top-0 right-[-6px] h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100" />
        )}
        <span className="text-xs block mt-2 font-medium" title={item.name}>
          {itemName === "dark/light mode" ? "Dark Mode" : item?.name}
        </span>
      </div>
    )
  }
};
