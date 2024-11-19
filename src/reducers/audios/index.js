import { S }                from "../../utils/prefix";
import * as ActionTypes     from "../../actions/audios/action-types";
import AudioStateManager    from "./state-manager";

const INITIAL_STATE = {
    audios: []
}

export default function audioStates(state = INITIAL_STATE, action) {
    switch (action.type) {
        case S(ActionTypes.CREATE_AUDIO):
            return AudioStateManager.createAudioSuccess(state, action);
        case S(ActionTypes.UPDATE_AUDIO):
            return AudioStateManager.updateAudioSuccess(state, action);
        default:
            return state;
    }
}