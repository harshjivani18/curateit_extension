import { S, F } from "../../utils/prefix";
import * as ActionTypes from "../../actions/user/action-types";
import UserViewStateManager from "./state-manager";
import session from "../../utils/session";

const INITIAL_STATE = {
  userData: null,
  themeMode: session.mode,
  userTags: [],
  sidebarPosition: '',
  enableFloatMenu: session.enableFloatMenu,
  show_image_option: '',
  show_code_option: '',
  sidebar_position: '',
  sidebar_view: '',
  userConfig: null,
  blocked_sites:[]
}

export default function userStates(state = INITIAL_STATE, action) {
  switch (action.type) {
    case S(ActionTypes.FETCH_USER_DETAILS):
      return UserViewStateManager.fetchUserDetailsSuccess(state, action);
    
    case S(ActionTypes.UPDATE_USER):
      return UserViewStateManager.updateUserSuccess(state, action);
    
    case S(ActionTypes.GET_SUPER_ADMIN_CONFIGURATION):
      return UserViewStateManager.setSuperAdminConfiguration(state, action);
    case S(ActionTypes.REMOVE_DOMAIN_FROM_BLOCK_LIST):
      return UserViewStateManager.removeDomain(state, action);
    case S(ActionTypes.GET_BLOCK_DOMAIN_LIST):
      return UserViewStateManager.getBlockDomain(state, action);
    case S(ActionTypes.UPDATE_USER_SYNC_STATUS):
      session.setIsBookmarkSynced(true)
      return { ...state }
    
    case ActionTypes.UPDATE_USER_TAGS:
      return UserViewStateManager.updateUserTags(state, action)

    case ActionTypes.SET_THEME_MODE:
      session.setMode(action.mode)
      return { ...state, themeMode: action.mode }

    case ActionTypes.CHANGE_SIDEBAR_POSITION:
      session.setSidebarPosition(action.position)
      return { ...state, sidebarPosition: action.position }

    case ActionTypes.ENABLE_FLOAT_MENU:
      // if (action.isSessionUpdate) session.setEnableFloatMenu(action.value)
      return { ...state, enableFloatMenu: action.value }

    case F(ActionTypes.FETCH_USER_DETAILS):
    case F(ActionTypes.UPDATE_USER):
      return {
        ...state,
        currentErrorMsg: action.error?.response?.data?.error?.message,
        currentSuccessMsg: "",
      };

    default:
      return state;
  }
}
