import * as ActionTypes from './action-types'

const headers = {
  'Content-Type': 'multipart/form-data',
}


export const uploadFileFromLocal = (data) => ({
    type: ActionTypes.UPLOAD_FILE_LOCAL,
    payload: {
      request: {
        url: `/api/upload?isSidebarApp=true`,
        method: "post",
        headers,
        data
      }
    }
  });

export const uploadFileFromWeb = (data) => ({
    type: ActionTypes.UPLOAD_FILE_WEB,
    payload: {
      request: {
        url: `/api/sidebar-icon`,
        method: "post",
        data
      }
    }
  });

export const getAllPublicSidebarApps = () => (
    {
    type: ActionTypes.GET_ALL_PUBLIC_SIDEBAR_APPS,
    payload: {
        request: {
            url: `/api/public-sidebar`,
            method: "get"
        }
    }
});

export const getSidebarAppsUser = () => (
    {
    type: ActionTypes.GET_SIDEBAR_APP_USER,
    payload: {
        request: {
            url: `/api/sidebar-managements`,
            method: "get"
        }
    }
});

export const createSidebarApp = (data) => (
  {
  type: ActionTypes.CREATE_SIDEBAR_APP,
  payload: {
      request: {
          url: `/api/sidebar-managements`,
          method: "post",
          data : {
            data
          }
      }
  }
});

export const deleteSidebarApp = (id) => ({
    type: ActionTypes.DELETE_SIDEBAR_APP,
    payload: {
        request: {
            url: `/api/sidebar-managements/${id}`,
            method: "delete",
        }
    },
})

export const getSidebarOrder = () => (
    {
    type: ActionTypes.GET_SIDEBAR_ORDER,
    payload: {
        request: {
            url: `/api/sequence-sidebar`,
            method: "get"
        }
    }
});

export const changeSidebarOrder = (data) => (
  {
  type: ActionTypes.CHANGE_SIDEBAR_ORDER,
  payload: {
      request: {
          url: `/api/sequence-sidebar`,
          method: "post",
          data
      }
  }
});

export const updateMostVisitedApps = (data) => ({
  type: ActionTypes.UPDATE_MOST_VISITED_APP,
  payload: {
    request: {
      url: `/api/update-most-visited-app`,
      method: "post",
      data
    }
  }
});

export const updateSidebarApp = (id,data) => ({
    type: ActionTypes.UPDATE_SIDEBAR_APP,
    payload: {
      request: {
        url: `/api/sidebar-managements/${id}`,
        method: "put",
        data : {
          data
        }
      },
    },
  });

export const getSingleSidebarApp = (id) => ({
    type: ActionTypes.GET_SINGLE_SIDEBAR_APP,
    payload: {
      request: {
        url: `/api/sidebar-managements/${id}`,
        method: "get",
      },
    },
  });