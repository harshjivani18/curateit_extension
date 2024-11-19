import { S,  } from "../../utils/prefix";
import * as ActionTypes     from "../../actions/customApplication/action-types";
import SidebarApplicationStateManager from "./state-manager";
import { SIDEBAR_MENU } from "../../utils/constants";
import session from "../../utils/session";

const INITIAL_STATE = {
    sidebarAppsUser: [],
    publicSidebarApps: [],
    sidebarOrder: session.sidebarOrder
}

export default function SidebarApplicationStates(state = INITIAL_STATE, action) {
    switch (action.type) {
        case S(ActionTypes.GET_ALL_PUBLIC_SIDEBAR_APPS):
            return SidebarApplicationStateManager.getAllPublicSidebarApps(state, action);
        case S(ActionTypes.GET_SIDEBAR_APP_USER):
            return SidebarApplicationStateManager.getSidebarAppsUser(state, action);
        case S(ActionTypes.GET_SIDEBAR_ORDER):
            return SidebarApplicationStateManager.getSidebarOrder(state, action);
        case S(ActionTypes.UPDATE_MOST_VISITED_APP):
            return SidebarApplicationStateManager.updateMostVisited(state, action);
        // case S(ActionTypes.UPDATE_MOST_VISITED_APP):
        //     return { ...state, 
        //              sidebarAppsUser: [ ...action.payload.data, ...state.sidebarAppsUser ],
        //              sidebarOrder: state.sidebarOrder ? [ ...state.sidebarOrder, ...action.payload.data ] : [ ...action.payload.data ] };
        default:
            return state;
    }
}