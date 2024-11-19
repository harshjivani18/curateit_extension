import * as ActionTypes from "./action-types";

export const fetchPocketToken = () => ({
    type: ActionTypes.FETCH_POCKET_TOKEN,
    payload: {
        request: {
            url: `/api/get-pocket-request-token`,
            method: "GET",
        }
    }
});

export const authorizeWithPocket = ({ access_token, auth_token }) => ({
    type: ActionTypes.AUTHORIZE_POCKET,
    payload: {
        request: {
            url: `https://getpocket.com/auth/authorize?request_token=${access_token}&redirect_uri=${process.env.REACT_APP_WEBAPP_URL}/pocket&request_token=${access_token}&auth_token=${auth_token}`,
            method: "get",
        }
    }
});