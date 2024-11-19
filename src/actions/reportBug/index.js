import * as ActionTypes from "./action-types";

const headers = {
  'Content-Type': 'multipart/form-data',
}

export const addReportBug = (payload) => (
  {
  type: ActionTypes.ADD_REPORT_BUG,
  payload: {
      request: {
          url: `/api/feedbacks?populate=*`,
          method: "post",
          data: {
            data: payload
          }
      }
  }
});

export const uploadImage = (data) => (
  {
  type: ActionTypes.UPLOAD_IMAGE,
  payload: {
      request: {
          url: `/api/upload?isFeedbackImg=true`,
          method: "post",
          headers,
          data
      }
  }
});

export const deleteImage = (url) => (
  {
  type: ActionTypes.DELETE_IMAGE,
  payload: {
      request: {
          url: `/api/files?path=${url}`,
          method: "delete",
      }
  }
});