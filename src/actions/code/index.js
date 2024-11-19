import * as ActionTypes from "./action-types";

export const addCode = (data) => (
  {
  type: ActionTypes.ADD_CODE,
  payload: {
      request: {
          url: `/api/code`,
          method: "post",
          data
      }
  }
});

export const getAllCodes = (url) => (
    {
    type: ActionTypes.GET_ALL_CODES,
    payload: {
        request: {
            url: `/api/selectedcodes?url=${url}`,
            method: "get"
        }
    }
});

export const updateCode = (collectionId,gemId,codeId,data) => ({
    type: ActionTypes.UPDATE_CODE,
    payload: {
      request: {
        url: `/api/collections/${collectionId}/selectedcodes/${gemId}/${codeId}`,
        method: "put",
        data
      },
    },
  });

export const deleteCode = (collectionId,gemId,codeId) => ({
    type: ActionTypes.DELETE_CODE,
    payload: {
        request: {
            url: `/api/collections/${collectionId}/selectedcodes/${gemId}/${codeId}`,
            method: "delete",
        }
    },
})

export const getSingleCode = (collectionId,gemId,codeId) => (
    {
    type: ActionTypes.GET_SINGLE_CODE,
    payload: {
        request: {
            url: `/api/collections/${collectionId}/selectedcodes/${gemId}/${codeId}`
        }
    }
});

export const singleCodeReset = () => {
    return{
    type: ActionTypes.GET_SINGLE_CODE_RESET
  }};

export const updateCodeToGem = (collectionId,gemId,data) => ({
    type: ActionTypes.UPDATE_CODE_TO_GEM,
    payload: {
      request: {
        url: `/api/collections/${collectionId}/selectedcodes/${gemId}`,
        method: "put",
        data
      },
    },
});