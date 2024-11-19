import * as ActionTypes from "./action-types";

export const deleteSubcollection = (id) => ({
    type: ActionTypes.DELETE_SUBCOLLECTION,
    payload: {
        request: {
            url: `api/sub-collections/${id}`,
            method: "delete",
        }
    }
  })