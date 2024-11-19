import "./folder.css"
import { useDispatch } from "react-redux";
import { getSavedTabsGems } from "../../actions/collection";
import Tree from 'antd/lib/tree/Tree';
import { useEffect, useState } from "react";
import { Button } from "antd";
import Common from "./Common";
import Bookmark from "./Bookmark";
import { setFullLoaderScreen } from "../../actions/app";

const FolderTabs = ({ list,callbacks }) => {
    const dispatch      = useDispatch()

    const [treeData, setTreeData] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [loadedKeys, setLoadedKeys] = useState([]);

    const resetKeys = () => {
        setExpandedKeys([])
        setLoadedKeys([])
    }

    useEffect(() => {
        setTreeData(list)
    },[list])

    const updateTreeData = (newData) => {
        setTreeData(newData);
    };

    const onExpandKeys = (keys,{node}) => {
        setExpandedKeys(keys)
    }

  function updateCollectionTree(data, targetNode,children,hasMore,onLoadData) {
      return data.map(collection => {
          if (collection.key === targetNode.key) {
              if(hasMore){
                  const prevChildren = [...collection.children]
                  const removed = prevChildren?.filter(item => item?.key !== 'load-more')
                  collection.children = [...removed,...children,{
                      key: `load-more`,
                      title: <Button onClick={() => onLoadData(targetNode)} size="small" type="link" className="!text-[#347AE2] hover:[#347AE2]">Load More</Button>,
                      isLeaf: true,
                  }]
              }else{
                  const prevChildren = [...collection.children]
                  const removed = prevChildren?.filter(item => item?.key !== 'load-more')
                  collection.children = [...removed,...children];
              }
          }

          if (collection.children && collection.children.length > 0) {
              collection.children = updateCollectionTree(collection.children, targetNode,children,hasMore,onLoadData);
          }

          return collection;
      });
  }

    async function fetchBookmarks(folderId, page) {
        if(page !== 1){
          dispatch(setFullLoaderScreen(true))
        }else{
          dispatch(setFullLoaderScreen(false))
        }
        const res = await dispatch(getSavedTabsGems(folderId,page ))
        const data = res?.payload?.data?.data || []
        const hasMore = (page * 20) < res?.payload?.data?.count;
        dispatch(setFullLoaderScreen(false))
        return {
            bookmarks: data,
            hasMore : hasMore
        };
    }

    const onLoadData = async ({ key, children, ...rest }) => {
      const keys = [...new Set([...loadedKeys, key])]
      setLoadedKeys(keys)
      const targetNode = { key, children, ...rest  };

      const id = key.split('-')[1];

      const { bookmarks, hasMore } = await fetchBookmarks(id, targetNode.page + 1);
      let nodeChildren=[]
      bookmarks?.forEach((b) => {
                switch (b.media_type) {
                    case 'Link':
                        nodeChildren.push({
                        key: `Bookmark-${b.id}`,
                        title: <Bookmark obj={b} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} 
                        parentId={targetNode.label.id} parent={targetNode.label} 
                        modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                        })
                      break;
                    case 'PDF':
                        nodeChildren.push({
                        key: `PDF-${b.id}`,
                        title: <Common obj={b} icon={"/icons/pdf-file-svgrepo-com.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                        })
                      break;
                    case 'Image':
                      if (b?.fileType === "file") {
                        nodeChildren.push({
                          key: `Image-${b.id}`,
                          title: <Common obj={b} icon={"/icons/image-svgrepo-com.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                          children: [],
                          isLeaf: true
                        })
                      }
                      break;
                    case 'Screenshot':
                        nodeChildren.push({
                          key: `Screenshot-${b.id}`,
                          title: <Common obj={b} icon={"/icons/screenshot.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                          children: [],
                          isLeaf: true
                        })
                      break;
                    case 'Article':
                        nodeChildren.push({
                        key: `Article-${b.id}`,
                        title: <Common obj={b} icon={"/icons/article-icon.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                        })
                      break;
                    case 'Epub':
                        nodeChildren.push({
                        key: `Epub-${b.id}`,
                        title: <Common obj={b} icon={"/icons/Epub.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                        })
                      break;
                    case 'Video':
                        nodeChildren.push({
                        key: `Video-${b.id}`,
                        title: <Common obj={b} icon={"/icons/video-recorder.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                        })
                      break;
                    case 'Audio':
                        nodeChildren.push({
                        key: `Audio-${b.id}`,
                        title: <Common obj={b} icon={"/icons/speaker.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                        })
                      break;
                    case 'App':
                        nodeChildren.push({
                        key: `Apps-${b.id}`,
                        title: <Common obj={b} icon={"/icons/app-icon.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                        })
                      break;
                    case 'Product':
                        nodeChildren.push({
                        key: `Products-${b.id}`,
                        title: <Common obj={b} icon={"/icons/product-icon.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                        })
                      break;
                    case 'Ai Prompt':
                        nodeChildren.push({
                        key: `AiPrompt-${b.id}`,
                        title: <Common obj={b} icon={"/icons/robot.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                        })
                      break;
                    case 'Quote':
                        nodeChildren.push({
                        key: `Quote-${b.id}`,
                        title: <Common obj={b} icon={"/icons/quote.png"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} 
                        parentId={targetNode.label.id} parent={targetNode.label} 
                        modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                        })
                      break;               
                    case 'Movie':
                        nodeChildren.push({
                        key: `Movies-${b.id}`,
                        title: <Common obj={b} icon={"/icons/Movies.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                        })
                      break;
                    case 'Book':
                        nodeChildren.push({
                        key: `Books-${b.id}`,
                        title: <Common obj={b} icon={"/icons/Book.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                        })
                      break;
                    case 'RSS':
                        nodeChildren.push({
                        key: `RSS-${b.id}`,
                        title: <Common obj={b} icon={"/icons/rss.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                        })
                      break;
                    case 'Email Newsletter':
                        nodeChildren.push({
                        key: `Emailnewsletter-${b.id}`,
                        title: <Common obj={b} icon={"/icons/email-letters.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                        })
                      break;
                
                    case 'Note':
                        nodeChildren.push({
                          key: `Note-${b.id}`,
                        title: <Common obj={b} icon={"/icons/notepad.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                        })
                      break;
                    case 'Text Expander':
                        nodeChildren.push({
                          key: `Text-${b.id}`,
                          title: <Common obj={b} icon={"/icons/text-spacing.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                          children: [],
                          isLeaf: true
                        })
                      break;
                  
                    case 'Profile':
                      nodeChildren.push({
                        key: `Profile-${b.id}`,
                        title: <Common obj={b} icon={"/icons/profile.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                      })
                      break;
                  case 'SocialFeed':
                    if(b.platform === "Twitter") {
                      nodeChildren.push({
                        key: `SocialFeed-${b.id}`,
                        title: <Common obj={b} icon={"/icons/twitter.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                      })
                    } else if(b.platform === "Github") {
                      nodeChildren.push({
                        key: `SocialFeed-${b.id}`,
                        title: <Common obj={b} icon={"/icons/github.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                      })
                    } else if(b.platform === "Reddit") {
                      nodeChildren.push({
                        key: `SocialFeed-${b.id}`,
                        title: <Common obj={b} icon={"/icons/reddit.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                      })
                    } else if(b.platform === "Medium") {
                      nodeChildren.push({
                        key: `SocialFeed-${b.id}`,
                        title: <Common obj={b} icon={"/icons/medium.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                      })
                    } else if(b.platform === "Hacker News") {
                      nodeChildren.push({
                        key: `SocialFeed-${b.id}`,
                        title: <Common obj={b} icon={"/icons/hackernews.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                      })
                    } else if(b.platform === "Producthunt") {
                      nodeChildren.push({
                        key: `SocialFeed-${b.id}`,
                        title: <Common obj={b} icon={"/icons/producthunt.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                      })
                    } else if(b.platform === "LinkedIn") {
                      nodeChildren.push({
                        key: `SocialFeed-${b.id}`,
                        title: <Common obj={b} icon={"/icons/linkedin.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                      })
                    } else if(b.platform === "Tiktok") {
                      nodeChildren.push({
                        key: `SocialFeed-${b.id}`,
                        title: <Common obj={b} icon={"/icons/tiktok.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                      })
                    } else if(b.platform === "Instagram") {
                      nodeChildren.push({
                        key: `SocialFeed-${b.id}`,
                        title: <Common obj={b} icon={"/icons/instagram.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                      })
                    } else if(b.platform === "YouTube") {
                      nodeChildren.push({
                        key: `SocialFeed-${b.id}`,
                        title: <Common obj={b} icon={"/icons/youtube.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                        children: [],
                        isLeaf: true
                      })
                    }
                    break;
                  case 'Citation':
                    nodeChildren.push({
                      key: `Citation-${b.id}`,
                      title: <Common obj={b} icon={"/icons/center-align.png"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                      children: [],
                      isLeaf: true
                    })
                    break;
                  case 'Testimonial':
                    nodeChildren.push({
                      key: `Testimonial-${b.id}`,
                      title: <Common obj={b} icon={"/icons/testimonial.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={targetNode.label.id} parent={targetNode.label} modalDelete={callbacks.onModalDelete} sharedCollections={[]} resetKeys={resetKeys}/>,
                      children: [],
                      isLeaf: true
                    })
                  //   break;
                  default:
                    console.log(`Sorry, we are out of.`);
                }
      })

      targetNode.hasMore = hasMore;
      targetNode.page += 1;

      const data = updateCollectionTree(treeData,targetNode,nodeChildren,hasMore,onLoadData)
      
      updateTreeData([...data]);
  };

    return (
        <Tree treeData={treeData} 
              className="w-full folder-tree-structure pb-5 pt-2 h-full" 
              expandedKeys={expandedKeys} 
              onExpand={onExpandKeys}
              draggable = {false}
              blockNode 
              loadData={onLoadData}
              loadedKeys={loadedKeys}
              />
    )
}

export default FolderTabs