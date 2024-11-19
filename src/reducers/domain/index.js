import { S, F } from "../../utils/prefix";
import * as ActionTypes from "../../actions/domain/action-types";
import DomainViewStateManager from "./state-manager";

const INITIAL_STATE = {
    urlData: null,
    urlScreenshotData: null,
    fetchingInformation: false
};

export default function domainStates(state = INITIAL_STATE, action) {
  switch (action.type) {
    case S(ActionTypes.FETCH_URL_DATA):
      return DomainViewStateManager.fetchUrlDataSuccess(state, action);
    case S(ActionTypes.FETCH_URL_SCREENSHOT):
      return DomainViewStateManager.fetchUrlScreenshotDataSuccess(state, action);
    case ActionTypes.FETCH_URL_DATA_RESET:
      return DomainViewStateManager.fetchUrlDataReset(state, action);
    case ActionTypes.FETCH_URL_SCREENSHOT_RESET:
      return DomainViewStateManager.fetchUrlScreenshotDataReset(state, action);
    case ActionTypes.FETCHING_SITE_DATA:
      return { ...state, fetchingInformation: action.status }
    case ActionTypes.SET_DATA_FROM_STORAGE:
      return { ...state, urlData: { ...action.data }, fetchingInformation: false }

    case F(ActionTypes.FETCH_URL_DATA):
        return DomainViewStateManager.fetchUrlDataSuccess(state, action)
    case F(ActionTypes.FETCH_URL_SCREENSHOT):
        return DomainViewStateManager.fetchUrlScreenshotDataSuccess(state, action)
    default:
      return state;
  }
}
