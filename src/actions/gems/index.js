import * as ActionTypes from "./action-types";

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
        url: `/api/gems?populate=tags`,
        method: "post",
        data
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
        data
      },
    }
  });

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

  export const deleteGem = (id) => ({
    type: ActionTypes.DELETE_GEM,
    payload: {
      request: {
        url: `/api/gems/${id}`,
        method: "delete"
      },
    }
  });


  export const deleteAllGems = () => ({
    type: ActionTypes.DELETE_ALL_GEMS,
    payload: {
      request: {
        url: `/api/delete-gems`,
        method: "delete",
      },
    },
  })

  export const updateUsageCount = (gemId) => ({
    type: ActionTypes.UPDATE_USAGE_COUNT,
    payload: {
      request: {
        url: `/api/usage-count/${gemId}`,
        method: "PUT",
      }
    }
  })

  export const fetchAllShortLinks = () => ({
    type: ActionTypes.FETCH_ALL_SHORTLINKS,
    payload: {
      request: {
        url: `/api/fetch-all-short-links`,
        method: "get"
      }
    }
  })

  export const fetchAllSharedExpanders = () => ({
    type: ActionTypes.FETCH_ALL_SHARED_EXPANDERS,
    payload: {
      request: {
        url: `/api/fetch-all-shared-media-type?mediaType=Text Expander,Ai Prompt`,
        method: "get"
      }
    }
  })

  export const setArticleText = (articleText, url) => ({
    type: ActionTypes.SET_ARTICLE_TEXT,
    payload: {
      request: {
        url: `/api/set-article-text`,
        method: "post",
        data: {
          url,
          articleBody: articleText
        }
      }
    }
  })