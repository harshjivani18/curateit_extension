// import { v4 as uuidv4 } from 'uuid';
import Folder           from '../components/folderList/Folder';
import Bookmark         from '../components/folderList/Bookmark'
// import Highlight from '../components/folderList/Highlight';
// import PDF from '../components/folderList/PDF';
// import Image from '../components/folderList/Image';
import Common from '../components/folderList/Common';

export const processNestedBookmarks = (collections, callbacks,sharedCollections=[]) => {
    const newArr        = []
    collections?.forEach((c, key) => {
        const k = `Folder-${c.id}`
        const o = {
          key: k,
          title: <Folder obj={c} modalEdit={callbacks.onModalEdit} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
          children: [],
          isLeaf: (c?.gems_count === 0 && c?.folders?.length === 0),
          label: c,
          isLoading: false, 
          page: 0, 
          hasMore: c?.gems_count > 0, 
          gems_count: c?.gems_count,
        }
        if (c?.folders?.length !== 0) {
          o.children = processNestedBookmarks(c.folders, callbacks,sharedCollections)
        }
        if (c?.bookmarks?.length !== 0) {
          c?.bookmarks?.forEach((b) => {
              switch (b.media_type) {
                  case 'Link':
                      o.children.push({
                      key: `Bookmark-${b.id}`,
                      title: <Bookmark obj={b} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                      })
                    break;
                  // case 'Highlight':
                  //     o.children.push({
                  //     key: `Highlight-${b.id}`,
                  //     title: <Common obj={b}  icon={"/icons/pencil-icon.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} />,
                  //     children: []
                  //     })
                  //   break;
                  case 'PDF':
                      o.children.push({
                      key: `PDF-${b.id}`,
                      title: <Common obj={b} icon={"/icons/pdf-file-svgrepo-com.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                      })
                    break;
                  case 'Image':
                    if (b?.fileType === "file") {
                      o.children.push({
                        key: `Image-${b.id}`,
                        title: <Common obj={b} icon={"/icons/image-svgrepo-com.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                        children: [],
                        isLeaf: true
                      })
                    }
                    break;
                  case 'Screenshot':
                      o.children.push({
                        key: `Screenshot-${b.id}`,
                        title: <Common obj={b} icon={"/icons/screenshot.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                        children: [],
                        isLeaf: true
                      })
                    break;
                  case 'Article':
                      o.children.push({
                      key: `Article-${b.id}`,
                      title: <Common obj={b} icon={"/icons/article-icon.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                      })
                    break;
                  case 'Epub':
                      o.children.push({
                      key: `Epub-${b.id}`,
                      title: <Common obj={b} icon={"/icons/Epub.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                      })
                    break;
                  case 'Video':
                      o.children.push({
                      key: `Video-${b.id}`,
                      title: <Common obj={b} icon={"/icons/video-recorder.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                      })
                    break;
                  case 'Audio':
                      o.children.push({
                      key: `Audio-${b.id}`,
                      title: <Common obj={b} icon={"/icons/speaker.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                      })
                    break;
                  case 'App':
                      o.children.push({
                      key: `Apps-${b.id}`,
                      title: <Common obj={b} icon={"/icons/app-icon.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                      })
                    break;
                  case 'Product':
                      o.children.push({
                      key: `Products-${b.id}`,
                      title: <Common obj={b} icon={"/icons/product-icon.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                      })
                    break;
                  case 'Ai Prompt':
                      o.children.push({
                      key: `AiPrompt-${b.id}`,
                      title: <Common obj={b} icon={"/icons/robot.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                      })
                    break;
                  case 'Quote':
                      o.children.push({
                      key: `Quote-${b.id}`,
                      title: <Common obj={b} icon={"/icons/quote.png"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                      })
                    break;
                  // case 'Notes':
                  //     o.children.push({
                  //     key: `Notes-${b.id}`,
                  //     title: <Common obj={b} icon={"/icons/Notes.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} />,
                  //     children: []
                  //     })
                  //   break;
                  case 'Movie':
                      o.children.push({
                      key: `Movies-${b.id}`,
                      title: <Common obj={b} icon={"/icons/Movies.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                      })
                    break;
                  case 'Book':
                      o.children.push({
                      key: `Books-${b.id}`,
                      title: <Common obj={b} icon={"/icons/Book.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                      })
                    break;
                  case 'RSS':
                      o.children.push({
                      key: `RSS-${b.id}`,
                      title: <Common obj={b} icon={"/icons/rss.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                      })
                    break;
                  case 'Email Newsletter':
                      o.children.push({
                      key: `Emailnewsletter-${b.id}`,
                      title: <Common obj={b} icon={"/icons/email-letters.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                      })
                    break;
                  case 'Code':
                    if (b?.url?.startsWith(process.env.REACT_APP_WEBAPP_URL) || b?.url === null || b?.url === "" || b?.url === undefined) {
                      o.children.push({
                        key: `Code-${b.id}`,
                        title: <Common obj={b} icon={"/icons/code-svgrepo-com.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections} />,
                        children: [],
                        isLeaf: true
                      })
                    }
                    break;
                  case 'Note':
                      o.children.push({
                        key: `Note-${b.id}`,
                      title: <Common obj={b} icon={"/icons/notepad.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                      })
                    break;
                  case 'Text Expander':
                      o.children.push({
                        key: `Text-${b.id}`,
                        title: <Common obj={b} icon={"/icons/text-spacing.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                        children: [],
                        isLeaf: true
                      })
                    break;
                  // case 'Twitter':
                  //     o.children.push({
                  //     key: `Twitter-${b.id}`,
                  //     title: <Common obj={b} icon={"/icons/twitter.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} />,
                  //     children: []
                  //     })
                  //   break;
                  case 'Profile':
                    o.children.push({
                      key: `Profile-${b.id}`,
                      title: <Common obj={b} icon={"/icons/profile.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                    })
                    break;
                case 'SocialFeed':
                  if(b.platform === "Twitter") {
                    o.children.push({
                      key: `SocialFeed-${b.id}`,
                      title: <Common obj={b} icon={"/icons/twitter.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                    })
                  } else if(b.platform === "Github") {
                    o.children.push({
                      key: `SocialFeed-${b.id}`,
                      title: <Common obj={b} icon={"/icons/github.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                    })
                  } else if(b.platform === "Reddit") {
                    o.children.push({
                      key: `SocialFeed-${b.id}`,
                      title: <Common obj={b} icon={"/icons/reddit.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                    })
                  } else if(b.platform === "Medium") {
                    o.children.push({
                      key: `SocialFeed-${b.id}`,
                      title: <Common obj={b} icon={"/icons/medium.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                    })
                  } else if(b.platform === "Hacker News") {
                    o.children.push({
                      key: `SocialFeed-${b.id}`,
                      title: <Common obj={b} icon={"/icons/hackernews.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                    })
                  } else if(b.platform === "Producthunt") {
                    o.children.push({
                      key: `SocialFeed-${b.id}`,
                      title: <Common obj={b} icon={"/icons/producthunt.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                    })
                  } else if(b.platform === "LinkedIn") {
                    o.children.push({
                      key: `SocialFeed-${b.id}`,
                      title: <Common obj={b} icon={"/icons/linkedin.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                    })
                  } else if(b.platform === "Tiktok") {
                    o.children.push({
                      key: `SocialFeed-${b.id}`,
                      title: <Common obj={b} icon={"/icons/tiktok.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                    })
                  } else if(b.platform === "Instagram") {
                    o.children.push({
                      key: `SocialFeed-${b.id}`,
                      title: <Common obj={b} icon={"/icons/instagram.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                    })
                  } else if(b.platform === "YouTube") {
                    o.children.push({
                      key: `SocialFeed-${b.id}`,
                      title: <Common obj={b} icon={"/icons/youtube.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                      children: [],
                      isLeaf: true
                    })
                  }
                  // o.children.push({
                  //   key: `SocialFeed-${b.id}`,
                  //   title: <Common obj={b} icon={"/icons/twitter.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} />,
                  //   children: []
                  // })
                  break;
                case 'Citation':
                  o.children.push({
                    key: `Citation-${b.id}`,
                    title: <Common obj={b} icon={"/icons/center-align.png"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                    children: [],
                    isLeaf: true
                  })
                  break;
                case 'Testimonial':
                  o.children.push({
                    key: `Testimonial-${b.id}`,
                    title: <Common obj={b} icon={"/icons/testimonial.svg"} editGem={callbacks.onEditGem} deleteGems={callbacks.onDeleteGem} parentId={c.id} parent={c} modalDelete={callbacks.onModalDelete} sharedCollections={sharedCollections}/>,
                    children: [],
                    isLeaf: true
                  })
                  break;
                default:
                  console.log(`Sorry, we are out of.`);
              }
          })
        }
        newArr.push(o)
    })
    return newArr
}