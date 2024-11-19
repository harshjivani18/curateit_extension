import session from "../../utils/session";
import * as ActionTypes from "./action-types";

export const updateUserTags = (tags) => ({
  type: ActionTypes.UPDATE_USER_TAGS,
  tags
}) 

export const fetchUserDetails = () => ({
  type: ActionTypes.FETCH_USER_DETAILS,
  payload: {
    request: {
      url: `/api/users/me?populate=tags`,
      method: "get"
    }
  }
});

export const updateUser = (data) => ({
  type: ActionTypes.UPDATE_USER,
  payload: {
    request: {
      url: `/api/users/${session.userId}`,
      method: "put",
      data
    }
  }
})

export const deleteAccount = (data) => ({
  type: ActionTypes.DELETE_ACCOUNT,
  payload: {
    request: {
      url: `/api/users/${session.userId}`,
      method: "delete",
      data,
    },
  },
})

export const setWebsiteThemeMode = (mode) => ({
  type: ActionTypes.SET_THEME_MODE,
  mode
})

export const changeSidebarPosition = (position) => ({
  type: ActionTypes.CHANGE_SIDEBAR_POSITION,
  position
})

export const changeEnableFloatMenu = (value, isSessionUpdate=true) => ({
  type: ActionTypes.ENABLE_FLOAT_MENU,
  value,
  isSessionUpdate
})

export const getSuperAdminConfiguration = () => ({
  type: ActionTypes.GET_SUPER_ADMIN_CONFIGURATION,
  payload: {
      request: {
          url: `/api/super-admin-configurations`,
          method: "get",
      }
  }
})

export const removeDomainFromBlockList = (data) => ({
    type: ActionTypes.REMOVE_DOMAIN_FROM_BLOCK_LIST,
    payload: {
      request: {
        url: `/api/remove-block-sites`,
        method: "post",
        data
      }
    }
  });

export const getBlockDomainList = () => ({
  type: ActionTypes.GET_BLOCK_DOMAIN_LIST,
  payload: {
      request: {
          url: `/api/users/${session.userId}`,
          method: "get",
      }
  }
})

export const getUserPlanDetails = () => ({
  type: ActionTypes.GET_USER_PLAN_DETAILS,
  payload: {
      request: {
          url: `/api/get-user-plan-details`,
          method: "get"
      }
  }
})

export const getIsPlanOwner = () => ({
  type: ActionTypes.GET_IS_PLAN_OWNER,
  payload: {
      request: {
          url: `/api/check-is-plan-owner`,
          method: "get"
      }
  }
})

export const updateUserSyncStatus = () => ({
  type: ActionTypes.UPDATE_USER_SYNC_STATUS,
  payload: {
    request: {
      url: `/api/set-user-sync-status`,
      method: "patch"
    }
  }
})