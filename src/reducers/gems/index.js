import { S, F } from "../../utils/prefix";
import * as ActionTypes from "../../actions/gems/action-types";
import GemViewStateManager from "./state-manager";

const INITIAL_STATE = {
    gemData: null,
    
};

export default function gemsStates(state = INITIAL_STATE, action) {
  switch (action.type) {
    case S(ActionTypes.FETCH_GEM):
      return GemViewStateManager.fetchGemByIdSuccess(state, action);
    case S(ActionTypes.ADD_GEM):
      return GemViewStateManager.addGemSuccess(state, action);
    case ActionTypes.ADD_GEM_RESET:
        return GemViewStateManager.addGemReset(state, action);
    case S(ActionTypes.IMPORT_GEM):
        return GemViewStateManager.importGemSuccess(state, action);
    case S(ActionTypes.UPDATE_GEM):
      return GemViewStateManager.updateGemSuccess(state, action);
    case ActionTypes.UPDATE_GEM_RESET:
      return GemViewStateManager.updateGemReset(state, action);
    case S(ActionTypes.DELETE_GEM):
      return GemViewStateManager.deleteGemSuccess(state, action);

    case F(ActionTypes.FETCH_GEM):
      return {
        ...state,
        currentErrorMsg: action.error?.response?.data?.error?.message,
        currentSuccessMsg: "",
      };

    case F(ActionTypes.ADD_GEM):
      return {
        ...state,
        currentErrorMsg: action.error?.response?.data?.error?.message,
        currentSuccessMsg: "",
      };
    
    case F(ActionTypes.IMPORT_GEM):
        return {
          ...state,
          currentErrorMsg: action.error?.response?.data?.error?.message,
          currentSuccessMsg: "",
        };
        
    case F(ActionTypes.UPDATE_GEM):
      return {
        ...state,
        currentErrorMsg: action.error?.response?.data?.error?.message,
        currentSuccessMsg: "",
        };
    
    case F(ActionTypes.DELETE_GEM):
      return {
        ...state,
        currentErrorMsg: action.error?.response?.data?.error?.message,
        currentSuccessMsg: "",
          };
    default:
      return state;
  }
}
