import { useEffect, useState } from "react"
import { Combobox } from "@headlessui/react"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  FolderIcon,
  FolderPlusIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"
import { useDispatch, useSelector } from "react-redux"
import { addCollectionReset, addCollections } from "../../actions/collection"
import {
  checkCollectionExists,
  getAllCollectionWithSub,
} from "../../utils/find-collection-id"
import { message } from "antd"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function CollectionComboBox({
  inputShown,
  setSelectedCollections,
  tab,
  tabs,
  collectionData,
  userId,
  setTabs,
  selectedCollections,
  getCollection,
}) {

  const [query, setQuery] = useState("")
  const [isQuery, setIsQuery] = useState(false)
  const [selectedOption, setSelectedOption] = useState({})
  const [messageApi, contextHolder] = message.useMessage()
  const allCollections = getAllCollectionWithSub(collectionData)
  //Getting Collection list
  let filteredOptionData =
    query === ""
      ? allCollections
        ? allCollections
        : []
      : allCollections?.filter((data) => {
          return data?.name?.toLowerCase().includes(query?.toLowerCase())
        })

  const dispatch = useDispatch()

  const addedCollectionData = useSelector(
    (state) => state.collection.addedCollectionData
  )

  //Set selected Collection
  useEffect(() => {
    if (selectedCollections) {
      setSelectedOption(
        filteredOptionData?.filter((data) => data.id === selectedCollections?.id)[0]
      )
      getCollection(
        filteredOptionData?.filter((data) => data.id === selectedCollections?.id)
      )
    }
  }, [selectedCollections])

  //Set newly added Collection
  useEffect(() => {
    if (addedCollectionData) {
      filteredOptionData?.push({
        id: addedCollectionData.id,
        name: addedCollectionData?.name,
      })
      setSelectedCollections({
        id: addedCollectionData.id,
        name: addedCollectionData?.name,
      })
      getCollection({
        id: addedCollectionData.id,
        name: addedCollectionData?.name,
      })
      setSelectedOption({
        id: addedCollectionData.id,
        name: addedCollectionData?.name,
      })
      let a = tabs?.map((t) => {
        if (!t.collection_gems) {
          return {
            ...t,
            collection_gems: addedCollectionData.id,
            collection_data: {
              id: addedCollectionData.id,
              name: addedCollectionData?.name,
            },
          }
        } else {
          return t
        }
      })
      setTabs(a)
      setIsQuery(false)
      dispatch(addCollectionReset())
    }
  }, [addedCollectionData])

  //Add new collection
  const addCollectionHandler = async () => {
    if (query === "") return
    if(query?.toLowerCase() === 'bio'){
      messageApi.open({
          type: 'error',
          content: 'Bio collection name already taken.',
      })
      setQuery('')
      return;
    }
    const result = checkCollectionExists(filteredOptionData, query)
    if (result) {
      setQuery("")
      return messageApi.open({
        type: "error",
        content: "Collection Already Exists",
      })
    }
    const res = await dispatch(
      addCollections({
        data: {
          name: query,
          author: userId,
        },
      })
    )
    setIsQuery(false)
    setQuery("")
    if (res.payload?.data?.data?.id) {
      setTabs((prev) =>
        prev?.map((t) => {
          return {
            ...t,
            collection_gems: res.payload?.data?.data?.id,
            collection_data: {
              id: res.payload?.data?.data?.id,
              ...res.payload?.data?.data,
            },
          }
        })
      )
    }
    return false
  }

  const onChangeCollection = (value) => {
    if (typeof value === "object") {
      setSelectedOption(value)
      setSelectedCollections(value)
    }
  }
  const queryChange = (value) => {
    setQuery(value)
  }
  return (
    <>
      {contextHolder}
      <Combobox as="div" onChange={(e) => onChangeCollection(e)}>
        <div className="ct-relative">
          <div className="ct-relative">
            {tab?.collection_data?.id ? (
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addCollectionHandler(e)
                }
              }}
              className="save-input-box w-full outline-none rounded-md border border-gray-300 bg-white pl-8 py-2 pr-6 shadow-sm text-sm"
              onChange={(event) => queryChange(event.target.value)}
              onClick={() => setIsQuery(true)}
              onBlur={() => setIsQuery(false)}
              placeholder={isQuery ? query : "Select Collection"}
              displayValue={() => {
                return isQuery ? query : selectedOption?.name
              }
              }
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md pr-2 focus:outline-none">
              {inputShown ? (
                <ChevronUpIcon
                  className="h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
              ) : (
                <ChevronDownIcon
                  className="h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
              )}
            </Combobox.Button>
          </div>

          {(query?.length > 0 || filteredOptionData.length > 0) && (
            <Combobox.Options
              static={inputShown}
              className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            >
              <Combobox.Option
                value={query}
                className="ct-relative select-none py-2 pl-3 pr-9 cursor-pointer"
              >
                <div
                  className="flex items-center"
                  onClick={addCollectionHandler}
                >
                  <FolderPlusIcon
                    className="h-4 w-4 text-blue-500"
                    aria-hidden="true"
                  />
                  <span className="ml-3 truncate text-sm text-blue-500">{`${
                    query ? `"${query}"` : ""
                  } Type to create new collection `}</span>
                </div>
              </Combobox.Option>
              {filteredOptionData?.map((option) => (
                <Combobox.Option
                  key={option.id}
                  value={option}
                  className="ct-relative cursor-default select-none py-2 pl-3 pr-1 text - gray - 900"
                >
                  {({ active, selected }) => (
                    <>
                      <div className="flex items-center">
                        {selected ? (
                          <FolderOpenIcon
                            className="h-4 w-4 text-gray-500"
                            aria-hidden="true"
                            style={{ width: "29px" }}
                          />
                        ) : (
                          <FolderIcon
                            className="h-4 w-4 text-gray-500"
                            aria-hidden="true"
                            style={{ width: "29px" }}
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
                      {/* {!hideCount && <span className='absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm'>
                                            {option.count}
                                        </span>} */}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </>
  )
}
