import * as ActionTypes from "./action-types";

export const addTeam = (payload) => (
  {
  type: ActionTypes.CREATE_TEAM,
  payload: {
      request: {
          url: `/api/teams`,
          method: "post",
          data: {
            data: payload
          }
      }
  }
});

export const getAllTeams = () => (
    {
    type: ActionTypes.GET_TEAM,
    payload: {
        request: {
            url: `/api/teams`,
            method: "get",
        }
    }
});

export const deleteTeam = (id) => (
    {
    type: ActionTypes.DELETE_TEAM,
    payload: {
        request: {
            url: `/api/teams/${id}`,
            method: "delete",
        }
    }
});

export const updateTeam = (id, data) => (
    {
    type: ActionTypes.UPDATE_TEAM,
    payload: {
        request: {
            url: `/api/teams/${id}`,
            method: "put",
            data: {
                data
            }
        }
    }
});