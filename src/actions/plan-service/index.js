import * as ActionTypes from "./action-types";

export const getPlanService = () => (
  {
  type: ActionTypes.GET_PLAN_SERVICE,
  payload: {
      request: {
          url: `/api/get-plan-services`,
          method: "get"
      }
  }
});
