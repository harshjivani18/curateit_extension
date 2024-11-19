import { S }                from "../../utils/prefix";
import * as ActionTypes     from "../../actions/videos/action-types";
import VideoStateManager    from "./state-manager";

const INITIAL_STATE = {
    videos: []
}

export default function videoStates(state = INITIAL_STATE, action) {
    switch (action.type) {
        case S(ActionTypes.CREATE_VIDEO):
            return VideoStateManager.createVideoSuccess(state, action);
        case S(ActionTypes.UPDATE_VIDEO):
            return VideoStateManager.updateVideoSuccess(state, action);
        default:
            return state;
    }
}