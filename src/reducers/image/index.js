import { S,  } from "../../utils/prefix";
import * as ActionTypes from "../../actions/image/action-types";
import ImageStateManager from "./state-manager";


const INITIAL_STATE = {
    images: [],
    singleImage:[],
    showHighlightTab: true
}

export default function imageStates(state = INITIAL_STATE, action) {
    switch (action.type) {
        case S(ActionTypes.GET_ALL_IMAGES):
            return ImageStateManager.getAllImages(state, action);
        case S(ActionTypes.GET_SINGLE_IMAGES):
            return ImageStateManager.getSingleImage(state, action);
        case (ActionTypes.GET_SINGLE_IMAGES_RESET):
            return ImageStateManager.getSingleImageReset(state, action);
        default:
            return state;
    }
}