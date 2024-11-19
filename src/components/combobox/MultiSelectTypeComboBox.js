import { useState, useEffect } from "react";
import { Combobox } from "@headlessui/react";
import { BiNotepad, BiUserCircle } from "react-icons/bi";
import { AiOutlineFilePdf } from "react-icons/ai";
import {
  RiDoubleQuotesL,
  RiScreenshot2Line,
  RiArticleLine,
  RiEdit2Line,
  RiRobotLine,
  RiAlignCenter,
  RiTextSpacing,
} from "react-icons/ri";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  SpeakerWaveIcon,
  CodeBracketIcon,
  PhotoIcon,
  VideoCameraIcon,
  LinkIcon,
  ShoppingBagIcon,
  FilmIcon,
  BookOpenIcon,
  DevicePhoneMobileIcon,
  CheckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { TbSocial } from "react-icons/tb";
import { TfiWrite } from "react-icons/tfi";
import { LiaBlogSolid } from "react-icons/lia";
import { Button } from "antd";

const optionData = [
  {
    id: 1,
    name: "Audio",
  },
  {
    id: 2,
    name: "Code",
  },
  {
    id: 3,
    name: "Image",
  },
  {
    id: 4,
    name: "Note",
  },
  {
    id: 5,
    name: "Video",
  },
  {
    id: 6,
    name: "Link",
  },
  {
    id: 7,
    name: "PDF",
  },
  {
    id: 8,
    name: "Article",
  },
  {
    id: 9,
    name: "Highlight",
  },
  {
    id: 10,
    name: "App",
  },
  {
    id: 11,
    name: "Product",
  },
  {
    id: 12,
    name: "Book",
  },
  {
    id: 13,
    name: "Movie",
  },
  {
    id: 14,
    name: "Profile",
  },
  {
    id: 15,
    name: "Ai Prompt",
  },
  {
    id: 16,
    name: "Text Expander",
  },
  {
    id: 17,
    name: "Quote",
  },
  {
    id: 18,
    name: "Screenshot",
  },
  {
    id: 19,
    name: "SocialFeed",
  },
  {
    id: 20,
    name: "Citation",
  },
  {
    id: 21,
    name: "Testimonial",
  },
  {
    id: 22,
    name: "Blog",
  },
];

const optionDataAdd = optionData.filter(
  (item) => item.name !== "Highlight" && item.name !== "Screenshot"
);

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function MultiSelectTypeComboBox({
  setSelectedType,
  selectedType,
  action = "",
  inputShown,
  setShowTypeInput,
  disabled = "",
  defaultSelectedType,
  setDefaultSelectedType,
  otherSelectedType,
  setOtherSelectedType,
  handleDefaultType,
}) {
  const mediaTypeData = action === "add" ? optionDataAdd : optionData;
  const [query, setQuery] = useState("");

  const filteredOptionData =
    query === ""
      ? mediaTypeData
      : mediaTypeData.filter((person) =>
          person.name.toLowerCase().includes(query.toLowerCase())
        );

  const handleSelection = (item) => {
    const isSelected = selectedType.some((p) => {
      if (typeof p === "object" && p !== null) {
        return p.name === item.name;
      } else if (typeof p === "string") {
        return p === item.name;
      }
      return false;
    });

    if (isSelected) {
      const filtered = selectedType.filter((p) => {
        if (typeof p === "object" && p !== null) {
          return p.name !== item.name;
        } else if (typeof p === "string") {
          return p !== item.name;
        }
        return true;
      });
      setSelectedType(filtered);
    } else {
      setSelectedType((prev) => [...prev, item]);
    }
  };

  return (
    <Combobox
      as="div"
      value={selectedType}
      // onChange={handleSelection}
      onChange={() => {}}
      disabled={disabled}
      multiple
    >
      <div className="relative">
        <div className="relative">
          <Combobox.Input
            className={`w-full outline-none rounded-md pl-8 py-2 pr-10 shadow-sm text-sm ${
              disabled
                ? "cursor-not-allowed type-combobox-input-disable"
                : "type-combobox-input"
            }`}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Searc media type..."
            displayValue={(types) =>
              types?.map((type) => type?.name || type)?.join(", ")
            }
            disabled={disabled}
          />
          <Combobox.Button
            className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
            disabled={disabled}
          >
            {inputShown ? (
              <ChevronUpIcon
                className={`h-4 w-4 ${
                  disabled
                    ? "text-[#d9d9d9] cursor-not-allowed"
                    : "text-gray-400"
                }`}
                aria-hidden="true"
              />
            ) : (
              <ChevronDownIcon
                className={`h-4 w-4 ${
                  disabled
                    ? "text-[#d9d9d9] cursor-not-allowed"
                    : "text-gray-400"
                }`}
                aria-hidden="true"
              />
            )}
          </Combobox.Button>
        </div>

        {filteredOptionData.length > 0 && (
          <Combobox.Options
            static={inputShown}
            className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          >
            {filteredOptionData?.map((option) => (
              <Combobox.Option
                disabled={option?.name === defaultSelectedType}
                key={option.id}
                value={option}
                className={`ct-relative ${
                  option?.name === defaultSelectedType
                    ? "cursor-not-allowed"
                    : "cursor-default"
                } select-none py-2 pl-3 pr-9 text-gray-900`}
              >
                {({ active, selected }) => (
                  <>
                    {option?.name === "Audio" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <SpeakerWaveIcon className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}
                    {option?.name === "Screenshot" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <RiScreenshot2Line className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}
                    {option?.name === "Quote" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <RiDoubleQuotesL className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}
                    {option?.name === "Ai Prompt" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <RiRobotLine className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}
                    {option?.name === "Text Expander" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <RiTextSpacing className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}
                    {option?.name === "Profile" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <BiUserCircle className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}
                    {option?.name === "SocialFeed" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <TbSocial className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}
                    {option?.name === "Movie" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <FilmIcon className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}
                    {option?.name === "Book" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <BookOpenIcon className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}
                    {option?.name === "Product" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <ShoppingBagIcon className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}
                    {option?.name === "App" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <DevicePhoneMobileIcon className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}
                    {option?.name === "Code" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <CodeBracketIcon className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}
                    {option?.name === "Note" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <BiNotepad className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}
                    {option?.name === "Video" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <VideoCameraIcon className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}
                    {option?.name === "PDF" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <AiOutlineFilePdf className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}
                    {option?.name === "Link" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <LinkIcon
                              className="h-4 w-4 text-gray-500"
                              aria-hidden="true"
                            />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}

                    {option?.name === "Image" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <PhotoIcon className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}

                    {option?.name === "Article" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <RiArticleLine className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}

                    {option?.name === "Highlight" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <RiEdit2Line className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}

                    {option?.name === "Citation" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <RiAlignCenter className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}

                    {option?.name === "Testimonial" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <TfiWrite className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}

                    {option?.name === "Blog" && (
                      <>
                        <div
                          className="flex items-center justify-between"
                          onClick={() => handleSelection(option)}
                        >
                          <div className="flex items-center">
                            <LiaBlogSolid className="h-4 w-4 text-gray-500" />
                            <div className="flex items-center gap-1">
                              <span
                                className={classNames(
                                  "ml-3 truncate text-sm",
                                  (selected ||
                                    selectedType?.some(
                                      (data) =>
                                        data?.name === option?.name ||
                                        data === option?.name
                                    )) &&
                                    "text-gray-400"
                                )}
                              >
                                {option.name}
                              </span>
                              {(selected ||
                                selectedType?.some(
                                  (data) =>
                                    data?.name === option?.name ||
                                    data === option?.name
                                )) && (
                                <CheckCircleIcon className="h-4 w-5 ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            {option?.name === defaultSelectedType ? (
                              <Button
                                className="ant-btn ant-btn-primary rounded-full bg-[#347ae2] border-[#347ae2] hover:bg-[#347ae2] hover:border-[#347ae2]"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: "#347ae2",
                                  borderColor: "#347ae2",
                                  color: "white",
                                }}
                                size="small"
                              >
                                Default
                              </Button>
                            ) : (
                              <></>
                            )}
                            {active && option?.name !== defaultSelectedType && (
                              <Button
                                size="small"
                                type="primary"
                                className="rounded-md text-[#347AE2] bg-[#E5F0FF] hover:bg-[#E5F0FF] hover:text-[#347AE2] border-[#347AE2] hover:border-[#347AE2]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDefaultType(option);
                                }}
                              >
                                Make it default
                              </Button>
                            )}
                          </div>
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">
                          {option.count}
                        </span>
                      </>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
}

export default MultiSelectTypeComboBox;
