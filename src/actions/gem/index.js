import * as ActionTypes from './action-types';


export const fetchGemById = (id) => ({
    type: ActionTypes.FETCH_GEM,
    payload: {
      request: {
        url: `/api/gems/${id}?populate=*`,
        method: "get"
      }
    }
  });


export const addGem = (data) => ({
    type: ActionTypes.ADD_GEM,
    payload: {
      request: {
        url: `/api/import-gems`,
        method: "post",
        data:data
      },
    }
  });

  export const addGemReset = () => {
    return{
    type: ActionTypes.ADD_GEM_RESET
  }};

  export const importGems = (data) => ({
    type: ActionTypes.IMPORT_GEM,
    payload: {
      request: {
        url: `/api/import-gems`,
        method: "post",
        data:data
      },
    }
  });

  export const importGemsWithIcon = (data) => ({
    type: ActionTypes.IMPORT_GEMS_WITH_ICON,
    payload: {
      request: {
        url: `/api/import-gems-with-icons`,
        method: "post",
        data:data
      },
    }
  })

  export const importGemsReset = () => {
    return{
    type: ActionTypes.IMPORT_GEM_RESET
  }};

  export const updateGem = (id,data) => ({
    type: ActionTypes.UPDATE_GEM,
    payload: {
      request: {
        url: `/api/gems/${id}`,
        method: "put",
        data
      },
    }
  });

  export const updateGemsReset = () => {
    return{
    type: ActionTypes.UPDATE_GEM_RESET
  }};


export const deleteGem = (id, parentCollectionId) => ({
    type: ActionTypes.DELETEGEM,
    payload: {
      request: {
        url: `api/gems/${id}`,
        method: "delete",
      }
    },
    meta: {
      id,
      parentCollectionId
    }
})

export const setCurrentMedia = (media) => ({
  type: ActionTypes.SET_CURRENT_MEDIA,
  media
})

export const setCurrentGem = (gem) => ({
  type: ActionTypes.SET_CURRENT_GEM,
  gem
})

export const getAudioText = (data) => ({
  type: ActionTypes.FETCH_TEXT_FROM_AUDIO,
  payload: {
      request: {
          url: `/api/enhanced-text`,
          method: "post",
          headers: {
              'Content-Type': 'multipart/form-data',
            },
          data
      }
  }
});