import session                          from "../../utils/session";
import { updateAndGetNewCollection,
         manageMove,
         addMultipleGems,
         removeGemFromCollections, 
         updateMediaInBookmark,
         addNewOrUpdateGemInCollection,
         modifyCollection,
         moveGemFromOwnToSharedCollection,
         removeGemFromCollectionsShared,
         modifySharedCollection,
         sharedCollectionRoot,
         manageMoveShared,
         moveAndUpdateSharedCollection,
         removeSharedCollection,
         decrementGemCount,
         incrementCollectionCount,
         incDecGemCount,
         addGemsCount,
         incrementMultipleGems} from '../../utils/find-collection-id'

export default class CollectionStateManager {
    static fetchCollectionListSuccess = (prevState, action) => {
        const state = { ...prevState };
        const {data} = action.payload;

        if (data) {
            const filtered = data.filter(item => item?.name?.toLowerCase() !== 'bio')
            state.collectionData = [...filtered.map((f) => { return { ...f, bookmarks: [] }})] ;
            // session.setCollectionData(JSON.stringify(data))
        }

        return state;
    };
    static fetchSearchCollectionListSuccess = (prevState, action) => {
        const state = { ...prevState };
        const {data} = action.payload;
        // 
        if (data) {
            state.searchCollectionData = [...data] ;
            // session.setCollectionData(JSON.stringify(data))
        }

        return state;
    };


    static importData = (prevState, action) => {
        const state    = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.importData     = data;
            state.collectionData = [ ...state.collectionData, ...data ]
            // session.setCollectionData(JSON.stringify(state.collectionData))

        }
        return state;
    };

    static updateCollectionDataForImport = (prevState, action) => {
        const state    = { ...prevState };
        const { data } = action;
        const obj = addGemsCount(data)
        if (data) {
            state.importData     = [ ...state.importData, obj ]
            state.collectionData = [ ...state.collectionData, obj ]
            // session.setCollectionData(JSON.stringify(state.collectionData))

        }
        return state;
    }

    static addCollectionSuccess = (prevState, action) => {
        const state = { ...prevState };
        const {data} = action.payload;
        if (data) {
            state.addedCollectionData = { ...data?.data, id: data.data?.id, folders: [], bookmarks: [], collection: null };
            if (!data.msg) {
                state.collectionData      = (state.collectionData.length !== 0) ? [ ...state.collectionData, { ...data?.data, id: data.data?.id, folders: [], bookmarks: [], collection: null,gems_count:0 } ] : []
            }
            // session.setCollectionData(JSON.stringify(state.collectionData))
        }
        return state;
    };

    static addCollectionReset = (prevState, action) => {
        const state = { ...prevState };
        state.addedCollectionData = null; 
        state.collectionData = [ ...state.collectionData ]
        return state;
    };

    static deleteCollectionSuccess = (prevState, action) => {
        const state         = { ...prevState };
        const { id,isSelectedCollectionShared }        = action.meta.previousAction.meta
        const { data }      = action.payload;

        if(!isSelectedCollectionShared){
            if (data) {
            state.deleteSuccess     = true;
            const newCollection     = updateAndGetNewCollection(state.collectionData, id)
            state.collectionData    = [ ...newCollection ]
            // session.setCollectionData(JSON.stringify(newCollection))
        }
        }

        if(isSelectedCollectionShared){
            const newCollection = removeSharedCollection(state.sharedCollections, id);
            state.sharedCollections = [...newCollection];
        }
        return state;
    };

    static editCollectionsSuccess = (prevState, action) => {
        const state           = { ...prevState }
        const { id, name }    = action.meta.previousAction.meta
        const { data }        = action.payload
        if (data && data.data) {
            const newCollection = updateAndGetNewCollection(state.collectionData, id, name)
            state.collectionData = [ ...newCollection ]
            // session.setCollectionData(JSON.stringify(newCollection))
        }
        return state
    }

    static removeGemFromCollection = (prevState, action) => {
        const state                     = { ...prevState }
        const { gemId, parentCollectionId,isCurrentCollectionShared } = action;
        if(!isCurrentCollectionShared){
            const newCollection             = decrementGemCount(state.collectionData, parentCollectionId,)
            state.collectionData = newCollection;
        }
        if(isCurrentCollectionShared){
            const newCollection             = removeGemFromCollections(state.sharedCollections, gemId, parentCollectionId)
            state.sharedCollections = [ ...newCollection ]
        }
        
        return state
    }

    static moveCollectionSuccess = (prevState, action) => {
        const state                     = { ...prevState }
        const { dragObj, dropObj }      = action.meta.previousAction.meta
        const newCollection             = manageMove(state.collectionData, dragObj, dropObj)

        state.collectionData = [ ...newCollection ]
        // session.setCollectionData(JSON.stringify(newCollection))
        return state
    }

    static moveToRootSuccess = (prevState, action) => {
        const state          = { ...prevState }
        const { sourceObj }  = action.meta.previousAction.meta
        const newCollection  = manageMove(state.collectionData, sourceObj, null)

        state.collectionData = [ ...newCollection ]
        // session.setCollectionData(JSON.stringify(newCollection))
        return state
    }

    static moveGemsSuccess = (prevState, action) => {
        const state                     = { ...prevState }
        const { dragObj, dropObj,sourceId,destinationId }      = action.meta.previousAction.meta
        // const newCollection             = manageMove(state.collectionData, dragObj, dropObj)
        // const newCollectionInc             = incrementCollectionCount(state.collectionData, destinationId)
        const newCollection           = incDecGemCount(state.collectionData, sourceId,destinationId)

        state.collectionData = [ ...newCollection ]
        // session.setCollectionData(JSON.stringify(newCollection))
        return state
    }

    static updateBookmarkInCollection = (prevState, action) => {
        const state                     = { ...prevState }
        const { gem, parent, process,
                isCollectionChanged }   = action

        let latestData                  = [ ...state.collectionData ]
        if (process === "update") {
            if (isCollectionChanged) {
                latestData    = incDecGemCount(state.collectionData, gem?.parent?.id, parent?.id)
            }
        }

        // if (process === "add") {
        //     latestData = addNewOrUpdateGemInCollection(state.collectionData, gem, parent, "add")
        // }
        // if (process === "update") {
        //     const obj = { ...gem }
        //     delete obj.parent;
        //     if (isCollectionChanged) {
        //         latestData    = manageMove(state.collectionData, obj, parent)
        //     }
        //     else {
        //         latestData    = addNewOrUpdateGemInCollection(state.collectionData, obj, parent, "update")
        //     }
        // }

        state.collectionData  = [ ...latestData ]
        session.setCollectionData(JSON.stringify(latestData))

        return state
    }

    static addImportedGems = (prevState, action) => {
        const state           = { ...prevState }
        const{ gems,
               parent }       = action
        
        // const latestData      = addMultipleGems(state.collectionData, gems, parent)
        const latestData      = incrementMultipleGems(state.collectionData, parent.id,gems?.length)
        state.collectionData  = [ ...latestData ]
        // session.setCollectionData(JSON.stringify(latestData))

        return state     
    }

    static uploadBookmarkCoverSuccess = (prevState, action) => {
        const state         = { ...prevState }
        const { gemId }     = action.meta.previousAction.meta
        const { data }      = action.payload
        if (data) {
            const updatedCollection = updateMediaInBookmark(state.collectionData, gemId, data.media)
            state.collectionData = [ ...updatedCollection ]
            // session.setCollectionData(JSON.stringify(state.collectionData))
        }
        return state
    }

    static getCollectionSuccess = (prevState, action) => {
        const state                 = { ...prevState }
        const data                  = action.payload.data
        const unfilterdCollection   = state.collectionData.filter((x) => x.id === Number(session.unfiltered_collection_id))
        if (data) {
            const collectionObj     = data.data?.attributes || data.data
            state.addedCollectionData = { ...collectionObj, id: data.data?.id, folders: [], bookmarks: [], collection: null };
            if(unfilterdCollection.length === 0){
                state.collectionData = [ ...state.collectionData,{ ...collectionObj, id: data.data?.id, folders: [], bookmarks: [], collection: null } ]
                // session.setCollectionData(JSON.stringify(state.collectionData))
            }else{
                state.collectionData = [ ...state.collectionData]
                // session.setCollectionData(JSON.stringify(state.collectionData))
            }
        }
        return state
    }

    static updateCollectionsSuccess = (prevState, action) => {
        const state           = { ...prevState }
        const { id, updatedData,tags }    = action.meta.previousAction.meta
        const { data }        = action.payload;
        const dataWithTags = {
            ...updatedData,
            tags: tags
        }
        if (data && data.data) {
            const newCollection = modifyCollection(state.collectionData, Number(id), dataWithTags)
            state.collectionData = [ ...newCollection ]
        }
        return state
    }

    static getSharedCollections = (prevState, action) => {
    const state = { ...prevState };
    const { data } = action.payload;
    if(data){
      state.sharedCollections = data.data;
    }
    
    return state;
  };
  
    static moveGemToSharedCollection = (prevState, action) => {
        const state                     = { ...prevState }
        const { collectionId,gemId,gem}                         = action

        let latestData                  = [ ...state.sharedCollections ]
        latestData = moveGemFromOwnToSharedCollection(latestData,collectionId,gem)
        state.sharedCollections  = [ ...latestData ]
        return state
    }
    
    static removeGemFromSharedCollection = (prevState, action) => {
        const state                     = { ...prevState }
        const { gemId, parentCollectionId } = action;
        const newCollection             = removeGemFromCollectionsShared(state.sharedCollections, gemId, parentCollectionId)
        state.sharedCollections = [ ...newCollection ]
        return state
    }

    static addGemToSharedCollection = (prevState, action) => {
        const state                     = { ...prevState }
        const { collectionId,gem } = action;
        const newCollection             = moveGemFromOwnToSharedCollection(state.sharedCollections, collectionId,gem)
        state.sharedCollections = [ ...newCollection ]
        return state
    }

    static moveCollectionSharedSuccess = (prevState, action) => {
    const state = { ...prevState };
    const { sourceId,destinationId,dragObj,actionType } = action.meta.previousAction.meta;
    if(actionType === 'add'){
      const newCollection = manageMoveShared(state.sharedCollections, destinationId, dragObj);
      state.sharedCollections = [...newCollection];
    }
    if(actionType === 'edit'){
      // data, sourceCollectionId, destinationCollectionId, updatedSourceObject
      const newCollection = moveAndUpdateSharedCollection(state.sharedCollections, sourceId,destinationId, dragObj);
      state.sharedCollections = [...newCollection];
    }
    if(actionType === 'moveOwnToShare'){
      const newCollection = updateAndGetNewCollection(state.collectionData,sourceId);
      state.collectionData = [...newCollection];
      const newCollection1 = manageMoveShared(state.sharedCollections, destinationId, dragObj);
      state.sharedCollections = [...newCollection1];
    }
    return state;
  };

  static updateSharedCollection = (prevState, action) => {
        const state                     = { ...prevState }
        const { collectionId,gem}       = action

        let latestData                  = [ ...state.sharedCollections ]

        latestData = modifySharedCollection(latestData,collectionId,gem)
        state.sharedCollections  = [ ...latestData ]
        return state
    }

  static moveSharedCollectionToRoot = (prevState, action) => {
      const state = { ...prevState };
      const { collectionId,gem} = action.meta.previousAction.meta;
      let latestData                  = [ ...state.sharedCollections ]

      latestData = sharedCollectionRoot(latestData,collectionId,gem)
      state.sharedCollections  = [ ...latestData ]
      return state
    }

static removeSharedCollectionSuccess = (prevState, action) => {
    const state = { ...prevState };
    const { collectionId } = action;
    const newCollection = removeSharedCollection(state.sharedCollections, collectionId);
    state.sharedCollections = [...newCollection];
    return state;
    }

static getSingleCollection = (prevState, action) => {
    const state = { ...prevState };
    const { data } = action.payload.data;
    if (data) {
      state.singleCollection = data || null;
    }
    return state;
  };

  static addCollectionWiseCountState = (prevState, action) => {
        const state = { ...prevState };
        const { collectionId } = action;
        const newCollection             = incrementCollectionCount(state.collectionData, collectionId)
        state.collectionData = newCollection;
        return state
    }
}