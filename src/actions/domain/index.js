import * as ActionTypes from "./action-types";

const headers = {
    'Content-Type': 'multipart/form-data',
  }
  export const fetchUrlData = (url) => (
    {
    type: ActionTypes.FETCH_URL_DATA,
    payload: {
      request: {
        url: `/api/domain?url=${url}`,
        headers,
        method: "get"
      }
    }
  }
  );

  export const fetchUrlDataReset = () => {
    return{
    type: ActionTypes.FETCH_URL_DATA_RESET
  }};

  export const fetchUrlScreenshotData = (url) => (
    {
    type: ActionTypes.FETCH_URL_SCREENSHOT,
    payload: {
      request: {
        url: `/api/domain?url=${url}&screenshot=true`,
        headers: headers,
        method: "get"
      }
    }
  }
  );

  export const fetchUrlScreenshotDataReset = () => {
    return{
    type: ActionTypes.FETCH_URL_SCREENSHOT_RESET
  }};

  export const fetchingSiteData = (status) => ({
    type: ActionTypes.FETCHING_SITE_DATA,
    status
  })

  export const setDataFromStorage = (data) => ({
    type: ActionTypes.SET_DATA_FROM_STORAGE,
    data
  })