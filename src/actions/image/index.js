import * as ActionTypes from "./action-types";

export const addImage = (data,image) => (
  {
  type: ActionTypes.ADD_IMAGE,
  payload: {
      request: {
          url: `/api/ocre?image=${encodeURIComponent(image)}&imageColor=true`,
          method: "post",
          data
      }
  }
});

export const extractImageText = (image) => ({
    type: ActionTypes.EXTRACT_IMAGE_TEXT,
    payload: {
        request: {
            url: `/api/ocre?image=${encodeURIComponent(image)}&ocr=true&imageColor=true`,
            method: "post",
            data: {
                link: image
            }
        }
    }
})

export const getAllImages = (url) => (
    {
    type: ActionTypes.GET_ALL_IMAGES,
    payload: {
        request: {
            url: `/api/ocre?url=${url}`,
            method: "get"
        }
    }
});

export const updateImage = (collectionId,gemId,data) => ({
    type: ActionTypes.UPDATE_IMAGE,
    payload: {
      request: {
        url: `/api/collections/${collectionId}/ocre/${gemId}`,
        method: "put",
        data
      },
    },
  });

export const deleteImage = (collectionId,gemId) => ({
    type: ActionTypes.DELETE_IMAGE,
    payload: {
        request: {
            url: `/api/collections/${collectionId}/ocre/${gemId}`,
            method: "delete",
        }
    },
})

export const getSingleImage = (collectionId,gemId) => (
    {
    type: ActionTypes.GET_SINGLE_IMAGES,
    payload: {
        request: {
            url: `/api/collections/${collectionId}/ocre/${gemId}`,
            method: "get"
        }
    }
});

export const singleImageReset = () => {
    return{
    type: ActionTypes.GET_SINGLE_IMAGES_RESET
  }};


