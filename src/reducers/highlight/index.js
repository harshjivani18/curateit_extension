import { S,  } from "../../utils/prefix";
import * as ActionTypes from "../../actions/highlights/action-types";
import HighlightStateManager from "./state-manager";


const INITIAL_STATE = {
    highlights: [],
    singleHighlight:[],
    allTypeHighlights: [],
    showHighlightTab: true
}

export default function highlightStates(state = INITIAL_STATE, action) {
    switch (action.type) {
        case S(ActionTypes.GET_ALL_HIGHLIGHTS):
            return HighlightStateManager.getAllHighlights(state, action);
        case S(ActionTypes.GET_SINGLE_HIGHLIGHTS):
            return HighlightStateManager.getSingleHighlight(state, action);
        case S(ActionTypes.GET_ALL_TYPE_HIGHLIGHTS):
            return HighlightStateManager.getAllTypeHighlightSuccess(state, action)
        case (ActionTypes.GET_SINGLE_HIGHLIGHTS_RESET):
            return HighlightStateManager.getSingleHighlightReset(state, action);
        case ActionTypes.UPDATE_HIGHLIGHTS_ARR:
            return HighlightStateManager.updateHighlightsArr(state, action)
        default:
            return state;
    }
}