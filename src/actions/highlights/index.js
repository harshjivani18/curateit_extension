import * as ActionTypes from "./action-types";

const headers = {
  'Content-Type': 'multipart/form-data',
}

export const getAllHighlights = (url) => (
    {
    type: ActionTypes.GET_ALL_HIGHLIGHTS,
    payload: {
        request: {
            url: `/api/highlights?url=${encodeURIComponent(url)}`,
            method: "get"
        }
    }
});

export const addHighlight = (collectionId, highlightData, parent_type) => ({
  type: ActionTypes.ADD_HIGHLIGHT,
  payload: {
    request: {
      url: parent_type !== "" ? `/api/collections/${collectionId}/highlights?parent_type=${parent_type}` : `/api/collections/${collectionId}/highlights`,
      method: "post",
      data: highlightData
    }
  }
});


export const updateHighlight = (collectionId,gemId,highlightId,data) => ({
    type: ActionTypes.UPDATE_HIGHLIGHT,
    payload: {
      request: {
        url: `/api/collections/${collectionId}/highlights/${gemId}/${highlightId}`,
        method: "put",
        data
      },
    },
  });

export const deleteHighlight = (collectionId,gemId,highlightId) => ({
    type: ActionTypes.DELETE_HIGHLIGHT,
    payload: {
        request: {
            url: `/api/collections/${collectionId}/highlights/${gemId}/${highlightId}`,
            method: "delete",
        }
    },
})

export const getSingleHighlight = (collectionId='',gemId='',highlightId='') => (
    {
    type: ActionTypes.GET_SINGLE_HIGHLIGHTS,
    payload: {
        request: {
            url: `/api/collections/${collectionId}/highlights/${gemId}/${highlightId}`,
            method: "get"
        }
    }
});

export const singleHighlightReset = () => {
    return{
    type: ActionTypes.GET_SINGLE_HIGHLIGHTS_RESET
  }};

  export const updateHighlightToGem = (collectionId,gemId,data) => ({
    type: ActionTypes.UPDATE_HIGHLIGHT_TO_GEM,
    payload: {
      request: {
        url: `/api/collections/${collectionId}/highlights/${gemId}`,
        method: "put",
        data
      },
    },
  });

  export const getAllTypeHighlights = (url) => ({
    type: ActionTypes.GET_ALL_TYPE_HIGHLIGHTS,
    payload: {
      request: {
        url: `/api/highlight-gems?url=${encodeURIComponent(url)}`,
        method: "get"
      }
    }
  })

  export const updateHighlightsArr = (obj, operation="delete") => ({
    type: ActionTypes.UPDATE_HIGHLIGHTS_ARR,
    obj,
    operation
  })