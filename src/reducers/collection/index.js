import { S, F } from "../../utils/prefix";
import * as ActionTypes from "../../actions/collection/action-types";
import CollectionStateManager from "./state-manager";
import session from "../../utils/session";

const INITIAL_STATE = {
    importData: [],
    collectionData: [],
    searchCollectionData:[],
    // collectionData: typeof session.collectionData === "string" || session.collectionData.length !== 0 ? JSON.parse(session.collectionData) : [],
    addedCollectionData: null,
    expandedKeys: [],
    savedSelectedCollection: {id:Number(session.unfiltered_collection_id),name:"Unfiltered"},
    sharedCollections:[],
    singleCollection: [],
    loadedKeys:[],
};

export default function collectionStates(state = INITIAL_STATE, action) {
    switch (action.type) {
        case S(ActionTypes.FETCH_COLLECTION):
            return CollectionStateManager.fetchCollectionListSuccess(state, action);
        case S(ActionTypes.SEARCH_DATA):
            return CollectionStateManager.fetchSearchCollectionListSuccess(state, action);
        case S(ActionTypes.IMPORTCOL):
            return CollectionStateManager.importData(state, action);
        case S(ActionTypes.ADD_COLLECTION):
            return CollectionStateManager.addCollectionSuccess(state, action);
        case ActionTypes.ADD_COLLECTION_RESET:
            return CollectionStateManager.addCollectionReset(state, action);
        case S(ActionTypes.DELETE_COLLECTION):
            return CollectionStateManager.deleteCollectionSuccess(state, action);
        case S(ActionTypes.EDIT_COLLECTION):
            return CollectionStateManager.editCollectionsSuccess(state, action)
        case ActionTypes.REMOVE_GEM_FROM_COLLECTION:
            return CollectionStateManager.removeGemFromCollection(state, action)
        case S(ActionTypes.MOVE_COLLECTION):
            return CollectionStateManager.moveCollectionSuccess(state, action)
        case ActionTypes.UPDATE_BOOKMARK_EXISTING_COLLECTION:
            return CollectionStateManager.updateBookmarkInCollection(state, action)
        case S(ActionTypes.MOVE_GEMS):
            return CollectionStateManager.moveGemsSuccess(state, action)
        case S(ActionTypes.MOVE_TO_ROOT):
            return CollectionStateManager.moveToRootSuccess(state, action)
        case S(ActionTypes.GET_COLLECTION_BY_ID):
            return CollectionStateManager.getCollectionSuccess(state, action)
        case S(ActionTypes.GET_SHARED_COLLECTIONS):
            return CollectionStateManager.getSharedCollections(state, action)
        case S(ActionTypes.MOVE_COLLECTION_SHARED):
            return CollectionStateManager.moveCollectionSharedSuccess(state, action)
        case S(ActionTypes.MOVE_SHARED_COLLECTION_TO_ROOT):
            return CollectionStateManager.moveSharedCollectionToRoot(state, action)
        case S(ActionTypes.GET_SINGLE_COLLECTION):
            return CollectionStateManager.getSingleCollection(state, action)
        case ActionTypes.UPDATE_COLLECTION_DATA_FOR_IMPORT:
            return CollectionStateManager.updateCollectionDataForImport(state, action)
        case ActionTypes.RESET_SHARED_COLLECTIONS:
            return { ...state, sharedCollections: []}
        case ActionTypes.MOVE_GEM_TO_SHARED_COLLECTION:
            return CollectionStateManager.moveGemToSharedCollection(state, action)
        case ActionTypes.REMOVE_GEM_FROM_SHARED_COLLECTION:
            return CollectionStateManager.removeGemFromSharedCollection(state, action)
        case ActionTypes.ADD_GEM_TO_SHARED_COLLECTION:
            return CollectionStateManager.addGemToSharedCollection(state, action)
        case ActionTypes.UPDATE_SHARED_COLLECTION:
            return CollectionStateManager.updateSharedCollection(state, action)
        case ActionTypes.RESET_COLLECTION_DATA:
            return { ...state, collectionData: [] }
        case ActionTypes.ADD_IMPORTED_GEMS:
            return CollectionStateManager.addImportedGems(state, action)
        case ActionTypes.SET_EXPANDED_KEYS:
            return { ...state, expandedKeys: [ ...action.keys ] }
        case ActionTypes.SAVE_SELECTED_COLLECTION:
            return { ...state, savedSelectedCollection: action.data }
        case ActionTypes.REMOVE_SHARED_COLLECTION:
            return CollectionStateManager.removeSharedCollectionSuccess(state, action)
        case S(ActionTypes.UPLOAD_BOOKMARK_COVER):
            return CollectionStateManager.uploadBookmarkCoverSuccess(state, action)
        case S(ActionTypes.UPDATE_COLLECTION):
            return CollectionStateManager.updateCollectionsSuccess(state, action)
        case ActionTypes.SET_LOADED_KEYS:
            return { ...state, loadedKeys: [ ...action.keys ] }
        case ActionTypes.ADD_COLLECTION_COUNT:
            return CollectionStateManager.addCollectionWiseCountState(state, action)
        case F(ActionTypes.DELETE_COLLECTION):
        case F(ActionTypes.EDIT_COLLECTION):
            return {
                ...state,
                currentErrorMsg: action.error?.response?.data?.error?.message,
                currentSuccessMsg: "",
            };
        case F(ActionTypes.FETCH_COLLECTION):
        case F(ActionTypes.MOVE_COLLECTION):
        case F(ActionTypes.MOVE_GEMS):
        case F(ActionTypes.ADD_COLLECTION):
        case F(ActionTypes.GET_COLLECTION_BY_ID):
        default:
            return state;
    }
}