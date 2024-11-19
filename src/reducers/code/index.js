import { S,  } from "../../utils/prefix";
import * as ActionTypes from "../../actions/code/action-types";
import CodeStateManager from "./state-manager";


const INITIAL_STATE = {
    codes: [],
    singleCode:[],
    showHighlightTab: true
}

export default function codeStates(state = INITIAL_STATE, action) {
    switch (action.type) {
        case S(ActionTypes.GET_ALL_CODES):
            return CodeStateManager.getAllCodes(state, action);
        case S(ActionTypes.GET_SINGLE_CODE):
            return CodeStateManager.getSingleCode(state, action);
        case (ActionTypes.GET_SINGLE_CODE_RESET):
            return CodeStateManager.getSingleCodeReset(state, action);
        default:
            return state;
    }
}