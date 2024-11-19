import { S, F } from "../../utils/prefix";
import * as ActionTypes from "../../actions/upload/action-types";
import UploadStateManager from "./state-manager";

const INITIAL_STATE = {
    uploadFileData: null,
};

export default function uploadStates(state = INITIAL_STATE, action) {
    switch (action.type) {
        case S(ActionTypes.ADD_UPLOAD_FILE):
            return UploadStateManager.addUploadSuccess(state, action);
        case ActionTypes.ADD_UPLOAD_RESET:
            return UploadStateManager.addUploadReset(state, action);

        case F(ActionTypes.ADD_UPLOAD_FILE):
        default:
            return state;
    }
}