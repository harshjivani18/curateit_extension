import * as ActionTypes from "./action-types";

const headers = {
  'Content-Type': 'multipart/form-data',
}

export const uploadBase64Img = (imageData) => ({
  type: ActionTypes.UPLOAD_BASE64,
  payload: {
    request: {
      url: `/api/upload-base64-img`,
      method: "post",
      data: {
        base64: imageData
      }
    }
  }
});

export const addUploadFile = (data) => ({
    type: ActionTypes.ADD_UPLOAD_FILE,
    payload: {
      request: {
        url: `/api/upload`,
        method: "post",
        headers,
        data
      }
    }
  });

  export const addUploadReset = () => {
    return{
    type: ActionTypes.ADD_UPLOAD_RESET
  }};