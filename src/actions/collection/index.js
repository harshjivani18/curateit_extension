import * as ActionTypes from "./action-types";

// const headers = {
//   'Content-Type': 'multipart/form-data',
// }

const headers = {
  'Content-Type': 'multipart/form-data',
}
  export const importcol = (data) => (
    {
    type: ActionTypes.IMPORTCOL,
    payload: {
      request: {
        url: `/api/import-collections`,
        method: "post",
        data
      }
    }
  }
  );

export const getAllCollections = () => (
    {
    type: ActionTypes.FETCH_COLLECTION,
    payload: {
        request: {
            url: `/api/collection-wise-counts`,
            method: "get"
        }
    }
});

export const addCollections = (data) => (
  {
  type: ActionTypes.ADD_COLLECTION,
  payload: {
      request: {
          url: `/api/collections`,
          method: "post",
          data
      }
  }
});

export const addImportCollection = (data) => (
  {
  type: ActionTypes.ADD_IMPORT_COLLECTION,
  payload: {
      request: {
          url: `/api/import-single-collection`,
          method: "post",
          data
      }
  }
});

export const updateCollectionDataForImport = (data) => ({
  type: ActionTypes.UPDATE_COLLECTION_DATA_FOR_IMPORT,
  data
})

export const addCollectionReset = () => {
  return{
  type: ActionTypes.ADD_COLLECTION_RESET
}};

export const deleteCollection = (id,isSelectedCollectionShared=null) => ({
  type: ActionTypes.DELETE_COLLECTION,
  payload: {
      request: {
          url: `/api/collections/${id}`,
          method: "delete",
      }
  },
  meta: {
    id,
    isSelectedCollectionShared
  }
})

export const editCollection = (id, name) => ({
  type: ActionTypes.EDIT_COLLECTION,
  payload: {
    request: {
      url: `/api/collections/${id}`,
      method: "put",
      data: {
        data: {
          name
        }
      }
    },
  },
  meta: {
    id, 
    name
  }
});

export const moveCollection = (sourceId, destinationId, dragObj, dropObj) => ({
  type: ActionTypes.MOVE_COLLECTION,
  payload: {
    request: {
      url: `/api/collections/${sourceId}/move/${destinationId}`,
      method: "post"
    },
  },
  meta: {
    sourceId, 
    destinationId,
    dragObj,
    dropObj
  }
})

export const moveGems = (gemId, sourceId, destinationId, dragObj, dropObj) => ({
  type: ActionTypes.MOVE_GEMS,
  payload: {
    request: {
      url: `/api/gems/${gemId}/move/${sourceId}/${destinationId}`,
      method: "post"
    },
  },
  meta: {
    gemId,
    sourceId, 
    destinationId,
    dragObj,
    dropObj
  }
})

export const updateGemWithCollection = (gemId, collectionId, details) => ({
  type: ActionTypes.UPDATE_GEM_WITH_COLLECTION,
  gemId, 
  collectionId,
  details
})

export const removeGemFromCollection = (gemId, parentCollectionId,isCurrentCollectionShared) => ({
  type: ActionTypes.REMOVE_GEM_FROM_COLLECTION,
  gemId,
  parentCollectionId,
  isCurrentCollectionShared
}) 

export const updateBookmarkWithExistingCollection = (gem, parent, isCollectionChanged, process, existingParent=null) => ({
  type: ActionTypes.UPDATE_BOOKMARK_EXISTING_COLLECTION,
  gem,
  parent,
  process,
  isCollectionChanged,
  existingParent
})

export const resetCollectionData = () => ({
  type: ActionTypes.RESET_COLLECTION_DATA
})

export const addImportedCollection = (gems, parent) => ({
  type: ActionTypes.ADD_IMPORTED_GEMS,
  gems,
  parent
})

export const setExpandedKeys = (keys) => ({
  type: ActionTypes.SET_EXPANDED_KEYS,
  keys
})

export const moveToRoot = (sourceId, sourceObj) => ({
  type: ActionTypes.MOVE_TO_ROOT,
  payload: {
    request: {
      url: `/api/collections/${sourceId}/move-to-root`,
      method: "post"
    },
  },
  meta: {
    sourceObj,
    sourceId
  }
})

export const uploadBookmarkCover = (gemId, data) => ({
  type: ActionTypes.UPLOAD_BOOKMARK_COVER,
  payload: {
    request: {
      url: `/api/gems/${gemId}/upload-bookmark-cover`,
      method: "put",
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data
    }
  },
  meta: {
    gemId
  }
})

export const uploadScreenshots = (data) => ({
  type: ActionTypes.UPLOAD_SCREENSHOTS,
  payload: {
    request: {
      url: `/api/gems/upload-screenshot`,
      method: "post",
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data
    }
  }
})

export const getCollectionById = (collectionId) => ({
  type: ActionTypes.GET_COLLECTION_BY_ID,
  payload: {
      request: {
          url: `api/collections/${collectionId}`,
          method: "get",
      }
  }
})

export const getUserCollections = () => ({
  type: ActionTypes.GET_USER_COLLECTIONS,
  payload: {
    request: {
        url: `api/get-user-collections`,
        method: "get",
    }
  }
})

export const searchableData = (searchword) => ({
  type: ActionTypes.SEARCH_DATA,
  payload: {
    request: {
      url: `/api/search?searchword=${searchword}`,
      method: "get",
    },
  }
})

export const saveSelectedCollection = (data) => ({
  type: ActionTypes.SAVE_SELECTED_COLLECTION,
  data
})

export const deleteAllCollections = () => ({
  type: ActionTypes.DELETE_ALL_COLLECTIONS,
  payload: {
    request: {
      url: `/api/delete-collections`,
      method: "delete",
    },
  },
})

export const uploadIcons = (data) => ({
  type: ActionTypes.UPLOAD_ICONS,
  payload: {
    request: {
      url: `/api/icon`,
      method: "post",
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data
    }
  }
})

export const updateCollection = (id, data,tags) => ({
  type: ActionTypes.UPDATE_COLLECTION,
  payload: {
    request: {
      url: `/api/collections/${id}`,
      method: "put",
      data: { data }
    },
  },
  meta: {
    id, 
    updatedData: data,tags
  }
});

export const getSharedCollections = () => ({
  type: ActionTypes.GET_SHARED_COLLECTIONS,
  payload: {
    request: {
      url: `/api/share-with-me`,
      method: "get",
    }
  }
});

export const resetSharedCollections = () => ({
    type: ActionTypes.RESET_SHARED_COLLECTIONS,
})

export const moveGemToSharedCollection = (collectionId,gemId,gem) => ({
  type: ActionTypes.MOVE_GEM_TO_SHARED_COLLECTION,
  collectionId,gemId,gem
})

export const removeGemFromSharedCollection = (gemId, parentCollectionId) => ({
  type: ActionTypes.REMOVE_GEM_FROM_SHARED_COLLECTION,
  gemId,
  parentCollectionId
}) 

export const addGemToSharedCollection = (collectionId,gem) => ({
  type: ActionTypes.ADD_GEM_TO_SHARED_COLLECTION,
  collectionId,gem
})

export const moveCollectionShared = (sourceId, destinationId, dragObj,actionType='add') => ({
  type: ActionTypes.MOVE_COLLECTION_SHARED,
  payload: {
    request: {
      url: `/api/collections/${sourceId}/move/${destinationId}`,
      method: "post"
    },
  },
  meta: {
    sourceId,
    destinationId,
    dragObj,
    actionType
  }
})

export const moveSharedCollectionToRoot = (collectionId,gem) => ({
  type: ActionTypes.MOVE_SHARED_COLLECTION_TO_ROOT,
  payload: {
    request: {
      url: `/api/collections/${collectionId}/move-to-root`,
      method: "post"
    },
  },
  meta: {
    collectionId,gem
  }
})

export const updateSharedCollection = (collectionId,gem) => ({
  type: ActionTypes.UPDATE_SHARED_COLLECTION,
  collectionId,gem
})

//
export const shareCollectionViaEmail = (collectionId, data) => ({
  type: ActionTypes.SHARE_COLLECTION_VIA_EMAIL,
  payload: {
    request: {
      url: `/api/collection-email/${collectionId}`,
      method: "post",
      data
    }
  }
});

export const removeAccessEmail = (token, collectionId) => ({
  type: ActionTypes.REMOVE_ACCESS_EMAIL,
  payload: {
    request: {
      url: `/api/collection/${collectionId}/remove-access?id=${token}&isLink=false`,
      method: "delete",
    }
  }
});

export const changeSecurityEmail = (collectionId, tokenId, data) => ({
  type: ActionTypes.CHANGE_SECURITY_EMAIL,
  payload: {
    request: {
      url: `/api/collections/${collectionId}/security?id=${tokenId}`,
      method: "post",
      data
    }
  }
});

//link flow
export const shareCollectionViaLink = (collectionId, allowEmail, accessType) => ({
  type: ActionTypes.SHARE_COLLECTION_VIA_LINK,
  payload: {
    request: {
      url: `/api/collection-link/${collectionId}?allowEmail=${allowEmail}&accessType=${accessType}`,
      method: "post",
      // data
    }
  }
});

export const checkCollectionViaLink = (inviteTokenId, collectionId) => ({
  type: ActionTypes.CHECK_COLLECTION_VIA_LINK,
  payload: {
    request: {
      url: `/api/collection-link?inviteId=${inviteTokenId}&collectionId=${collectionId}`,
      method: "get",
    }
  }
});

export const removeAccessLink = (id, collectionId) => ({
  type: ActionTypes.REMOVE_ACCESS_LINK,
  payload: {
    request: {
      url: `/api/collection/${collectionId}/remove-access?id=${id}&isLink=true`,
      method: "delete",
    }
  }
});

export const changeSecurityLink = (collectionId, tokenId, data) => ({
  type: ActionTypes.CHANGE_SECURITY_LINK,
  payload: {
    request: {
      url: `/api/collections/${collectionId}/security?id=${tokenId}&isLink=true`,
      method: "post",
      data
    }
  }
});

//public

export const shareCollectionViaPublic = (collectionId, data) => ({
  type: ActionTypes.SHARE_COLLECTION_VIA_PUBLIC,
  payload: {
    request: {
      url: `/api/collections/${collectionId}/generatelink`,
      method: "post",
      data
    }
  }
});

export const checkCollectionViaPublic = (inviteTokenId, collectionId) => ({
  type: ActionTypes.CHECK_COLLECTION_VIA_PUBLIC,
  payload: {
    request: {
      url: `/api/collection-public?inviteId=${inviteTokenId}&collectionId=${collectionId}`,
      method: "get",
    }
  }
});

export const disablePublicLink = (collectionId) => ({
  type: ActionTypes.DISABLE_PUBLIC_LINK,
  payload: {
    request: {
      url: `/api/collection/${collectionId}/disable-link`,
      method: "get",
    }
  }
});

export const setPasswordPublicLink = (data, collectionId) => ({
  type: ActionTypes.SET_PASSWORD_PUBLIC_LINK,
  payload: {
    request: {
      url: `/api/collection/${collectionId}/password`,
      method: "post",
      // headers,
      data
    }
  }
});

export const removeSharedCollection = (collectionId) => ({
  type: ActionTypes.REMOVE_SHARED_COLLECTION,
  collectionId
})

export const getSingleCollection = (collectionId, populate=true) => ({
  type: ActionTypes.GET_SINGLE_COLLECTION,
  payload: {
    request: {
      url: `/api/collections/${collectionId}${populate ? "?populate=*" : ""}`,
      method: "get",
    }
  }
});

export const createCollectionActivity = (data) => ({
  type: ActionTypes.ADD_COLLECTION_ACTIVITY,
  payload: {
    client: 'logging',
    request: {
      method: "post",
      url: `/api/activity`,
      data
    },
  }
})

export const uploadUnsplashCoverS3Link = (link, collectionId) => ({
  type: ActionTypes.UPLOAD_UNSPLASH_IMAGE_IN_S3,
  payload: {
    request: {
      url: `/api/upload?fileLink=${link}&isCollectionCover=true&collectionId=${collectionId}`,
      method: "post",
      headers,
    }
  }
});

export const getBookmarkInCollections = (collectionId, page) => ({
  type: ActionTypes.GET_BOOKMARK_IN_COLLECTION,
  payload: {
    request: {
      url: `/api/collections/${collectionId}/bookmarks?perPage=25&page=${page}&isExtension=true`,
      method: "get",
    },
  },
});

export const setLoadedKeys = (keys) => ({
  type: ActionTypes.SET_LOADED_KEYS,
  keys
})

export const addCollectionCount = (collectionId) => ({
  type: ActionTypes.ADD_COLLECTION_COUNT,
  collectionId,
});

export const getBookmarksByMediaType = (mediaType,page) => (
    {
    type: ActionTypes.GET_COLLECTION_BY_MEDIA_TYPE,
    payload: {
        request: {
            url: `/api/fetch-bookmarks?type=${mediaType}&perPage=25&page=${page}`,
            method: "get"
        }
    }
});

export const getSavedTabsCollections = () => (
    {
    type: ActionTypes.GET_SAVED_TABS_COLLECTION,
    payload: {
        request: {
            url: `/api/tab-collection`,
            method: "get"
        }
    }
});

export const getSavedTabsGems = (collectionId,page) => (
    {
    type: ActionTypes.GET_SAVED_TABS_GEMS,
    payload: {
        request: {
            url: `/api/tab-gems/${collectionId}?page=${page}&perPage=20`,
            method: "get"
        }
    }
});

//will get mediatypes without pagination
export const getGemsByMediaType = (mediaType) => (
    {
    type: ActionTypes.GET_GEMS_ON_MEDIA_TYPES,
    payload: {
        request: {
            url: `/api/media-type?mediatype=${mediaType}`,
            method: "get"
        }
    }
});

export const configlimitCollection = () => ({
  type: ActionTypes.CONFIG_LIMIT_FOR_COLLECTION,
  payload: {
      request: {
          url: `/api/config-limits`,
          method: "get"
      }
  }
});

export const configCollections = () => ({
  type: ActionTypes.CONFIG_COLLECTIONS,
  payload: {
      request: {
          url: `/api/config-collections`,
          method: "get",
      }
  }
});

export const uploadAllTypeFileInS3 = (data) => ({
  type: ActionTypes.UPLOAD_ALL_FILE_TYPE,
  payload: {
    request: {
      url: `/api/upload-all-file`,
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data,
    },
  },
});

export const getBookmarkDetailsMicrolink = (url) => ({
    type: ActionTypes.GET_BOOKMARK_DETAILS_MICROLINK,
    payload: {
        request: {
            url: `/api/cache-details?url=${url}`,
            method: "get"
        }
    }
});

export const fetchTechDomainDetails = (link) => ({
    type: ActionTypes.FETCH_TECH_DOMAIN_DETAILS,
    payload: {
        request: {
            url: `/api/domain?url=${link}&technologystack=true`,
            method: "get",
            data: {
                link
            }
        }
    }
})

export const getUserSyncData = () => ({
  type: ActionTypes.GET_USER_SYNC_DATA,
  payload: {
    request: {
      url: `/api/get-user-sync-data`,
      method: "get",
    }
  }
})

export const updateCollectionSEODetails = (seoObj, collectionId) => ({
  type: ActionTypes.UPDATE_COLLECTION_SEO_DETAILS,
  payload: {
    request: {
      url: `/api/collections/${collectionId}/seo-details`,
      method: "patch",
      data: seoObj,
    },
  },
});

export const updateGroupAccess = (collectionId, token, data, userId) => ({
  type: ActionTypes.UPDATE_GROUP_ACCESS,
  payload: {
    request: {
      url: `/api/collection-group-security/${collectionId}?token=${token}&userId=${userId}`,
      method: "put",
      data
    }
  }
})

export const shareCollectionViaEmailGroup = (collectionId, data) => ({
  type: ActionTypes.SHARE_COLLECTION_VIA_EMAIL_GROUP,
  payload: {
    request: {
      url: `/api/sharecollection-group-mail/${collectionId}`,
      method: "post",
      data,
    },
  },
});

export const uploadCsvTextLinks = (data) => ({
  type: ActionTypes.UPLOAD_CSV_TEXT_LINKS,
  payload: {
    request: {
      url: `/api/collection-import`,
      method: "post",
      data,
    },
  },
});


export const getOpenAIResponse = (data) => ({
  type: ActionTypes.GET_OPEN_AI_RESPONSE,
  payload: {
    request: {
      url: `/api/send-ai-response`,
      method: "post",
      data,
    },
  },
});