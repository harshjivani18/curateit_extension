import { S, F } from "../../utils/prefix";
import * as ActionTypes from "../../actions/gem/action-types";
import GemStateManager from "./state-manager";


const INITIAL_STATE = {
    gemData: [],
    importedGemData: null,
    addedGemData: null,
    updateGemData: null,
    deleteSuccess: false,
  currentErrorMsg: "",
  currentSuccessMsg: "",
  currentGem: null,
  currentMedia: null
}

export default function gemStates(state = INITIAL_STATE, action) {
    switch (action.type) {
        case S(ActionTypes.FETCH_GEM):
            return GemStateManager.fetchGemByIdSuccess(state, action);
        case S(ActionTypes.ADD_GEM):
            return GemStateManager.addGemSuccess(state, action);
        case ActionTypes.ADD_GEM_RESET:
            return GemStateManager.addGemReset(state, action);
        case S(ActionTypes.IMPORT_GEM):
            return GemStateManager.importGemSuccess(state, action);
        case ActionTypes.IMPORT_GEM_RESET:
            return GemStateManager.importGemReset(state, action);
        case S(ActionTypes.UPDATE_GEM):
            return GemStateManager.updateGemSuccess(state, action);
        case ActionTypes.UPDATE_GEM_RESET:
            return GemStateManager.updateGemReset(state, action);
        case S(ActionTypes.DELETEGEM):
            return GemStateManager.deleteGemSuccess(state, action);
        case ActionTypes.SET_CURRENT_GEM:
            return { ...state, currentGem: action.gem !== null ? { ...action.gem } : null }
        case ActionTypes.SET_CURRENT_MEDIA:
            return { ...state, currentMedia: action.media !== null ? { ...action.media } : null}
            
        case F(ActionTypes.FETCH_GEM):
        case F(ActionTypes.ADD_GEM):    
        case F(ActionTypes.IMPORT_GEM):                    
        case F(ActionTypes.UPDATE_GEM):
        case F(ActionTypes.DELETEGEM):
            return {
                ...state,
                currentErrorMsg: action.error?.response?.data?.error?.message,
                currentSuccessMsg: "",
            };
   
        default:
            return state;
    }
}