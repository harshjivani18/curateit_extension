import * as ActionTypes from "./action-types";

export const takeFullPageScreenshot = () => ({
  type: ActionTypes.TAKE_FULL_SCREENSHOT,
  payload: {
    request: {
      url: `/api/take-screenshot`,
      method: "get"
    }
  }
})

