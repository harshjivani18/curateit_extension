import { useEffect, useState } from "react";
import { Combobox } from "@headlessui/react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  FolderIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { getAllCollectionWithSub } from "../../utils/find-collection-id";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ComboBox({
  inputShown,
  setShowCollectionInput,
  collectionData,
  setSelectedCollection,
  isSubCollection,
  selectedCollection,
  id,
  action,
  disabled = false,
}) {
  const [query, setQuery] = useState("");
  const allCollections =
    collectionData.length === 0 ? [] : getAllCollectionWithSub(collectionData);
  const uniqueCollectionData = allCollections.filter(
    (value, index, self) => index === self.findIndex((v) => v.id === value.id)
  );
  //Set selected collection
  useEffect(() => {
    if (setShowCollectionInput && setSelectedCollection) {
      setSelectedCollection(selectedCollection);
      setShowCollectionInput(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCollection, action]);

  const onCollectionChange = (e) => {
    if (typeof e === "object") {
      setSelectedCollection(e);
    } else {
      setSelectedCollection(e);
    }
  };

  let filteredOptionData =
    query === ""
      ? uniqueCollectionData
        ? uniqueCollectionData
        : []
      : uniqueCollectionData?.filter((data) => {
          return data?.name?.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <>
      <Combobox
        as="div"
        value={selectedCollection}
        onChange={onCollectionChange}
        disabled={disabled}
      >
        <div className="relative">
          <div className="relative">
            {selectedCollection?.id || selectedCollection ? (
              <FolderOpenIcon
                className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
            ) : (
              <MagnifyingGlassIcon
                className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
            )}
            <Combobox.Input
              className={`save-input-box w-full outline-none rounded-md border border-gray-300 bg-white pl-8 py-2 pr-6 shadow-sm text-sm ${
                inputShown ? "text-gray-400" : ""
              } ${
                disabled
                  ? "cursor-not-allowed type-combobox-input-disable"
                  : "type-combobox-input"
              }`}
              placeholder={"Select"}
              displayValue={(collectionData) =>
                collectionData?.name || selectedCollection
              }
              onChange={(event) => setQuery(event.target.value)}
              disabled={disabled}
            />

            <Combobox.Button
              className="absolute inset-y-0 right-0 flex items-center rounded-r-md pr-2 focus:outline-none"
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
                  disabled={disabled}
                />
              ) : (
                <ChevronDownIcon
                  className={`h-4 w-4 ${
                    disabled
                      ? "text-[#d9d9d9] cursor-not-allowed"
                      : "text-gray-400"
                  }`}
                  aria-hidden="true"
                  disabled={disabled}
                />
              )}
            </Combobox.Button>
          </div>

          {filteredOptionData.length > 0 && (
            <Combobox.Options
              static={inputShown}
              className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            >
              {isSubCollection === false && (
                <Combobox.Option
                  disabled={disabled}
                  value={"Parent folder"}
                  className="relative select-none py-2 pl-3 pr-9 cursor-pointer"
                >
                  <div className="flex items-center" disabled={disabled}>
                    <FolderIcon
                      className="h-4 w-4 text-gray-500"
                      aria-hidden="true"
                    />
                    <span className={classNames("ml-3 truncate text-sm")}>
                      {"Parent folder"}
                    </span>
                  </div>
                </Combobox.Option>
              )}
              {isSubCollection && (
                <Combobox.Option
                  value={"Make it parent folder"}
                  className="relative select-none py-2 pl-3 pr-9 cursor-pointer"
                >
                  <div className="flex items-center">
                    {/* <FolderIcon className="h-4 w-4 text-gray-500" aria-hidden="true" /> */}
                    <span
                      className={classNames(
                        "ml-3 truncate text-sm text-blue-500"
                      )}
                    >
                      {"Make it parent folder"}
                    </span>
                  </div>
                </Combobox.Option>
              )}
              {action === "create" && (
                <Combobox.Option
                  value={"Parent folder"}
                  className="relative select-none py-2 pl-3 pr-9 cursor-pointer"
                >
                  <div className="flex items-center">
                    <FolderIcon
                      className="h-4 w-4 text-gray-500"
                      aria-hidden="true"
                    />
                    <span className={classNames("ml-3 truncate text-sm")}>
                      {"Parent folder"}
                    </span>
                  </div>
                </Combobox.Option>
              )}
              {filteredOptionData
                ?.filter(
                  (item) =>
                    item?.name?.toLowerCase() !== "unfiltered" &&
                    item?.id !== id
                )
                .map((option) => (
                  <Combobox.Option
                    key={option.id}
                    value={option}
                    className="relative cursor-default select-none py-2 pl-3 pr-9 text - gray - 900"
                  >
                    {({ active, selected }) => (
                      <>
                        <div className="flex items-center">
                          {selected ? (
                            <FolderOpenIcon
                              className="h-4 w-4 text-gray-500"
                              aria-hidden="true"
                            />
                          ) : (
                            <FolderIcon
                              className="h-4 w-4 text-gray-500"
                              aria-hidden="true"
                            />
                          )}
                          <span
                            className={classNames(
                              "ml-3 truncate text-sm",
                              selected && "text-gray-400"
                            )}
                          >
                            {option.name}
                          </span>
                        </div>
                      </>
                    )}
                  </Combobox.Option>
                ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </>
  );
}
