import * as ActionTypes from "./action-types";


export const fetchLogin = (email, password) => ({
  type: ActionTypes.FETCH_LOGIN,
  payload: {
    request: {
      url: `/api/auth/local`,
      method: "post",
      data: {
        identifier: email,
        password: password
      }
    }
  }
});

export const setDefaultCurateit = () => ({
  type: ActionTypes.SET_USER_DEFAULT_CURATEIT,
  payload: {
    request: {
      url: `/api/default-collection`,
      method: "post"
    }
  }
})

export const setUserInformation = () => ({
  type: ActionTypes.SET_AFTER_USER_CREATE_OPERATION,
  payload: {
    request: {
      url: `/api/update-userdata`,
      method: "post"
    }
  }
})

export const signup = (lastn, email, password, fName, lName) => ({
  type: ActionTypes.SIGNUP,
  payload: {
    request: {
      url: `/api/auth/local/register`,
      method: "post",
      data: {
        username: lastn,
        email: email,
        password: password,
        firstname: fName,
        lastname: lName,
      }
    }
  }
});

export const errorMsg = (data) => (
  {
    type: ActionTypes.ERROR_MSG,
    payload: {
      data
    }
  }
)
export const disableMsg = (data) => (
  {
    type: ActionTypes.DISABLE_MSG,
    payload: {
      data
    }
  }
)

export const setSocialLogin = (data) => (
  {
    type: ActionTypes.SET_SOCIAL_LOGIN,
    payload: {
      data
    }
  }
)

export const successMsg = (data) => (
  {
    type: ActionTypes.SUCCESS_MSG,
    payload: {
      data
    }
  }
)

export const forgot = (email) => ({
  type: ActionTypes.FORGOT,
  payload: {
    request: {
      url: `/api/auth/forgot-password`,
      method: "post",
      data: {
        email: email,
      }
    }
  }
});

export const emailVerification = (email) => ({
  type: ActionTypes.EMAIL_VERIFICATION,
  payload: {
    request: {
      url: `https://emailverifier.reoon.com/api/v1/verify?email=${email}&key=${process.env.REACT_APP_EMAIL_VERFICATION_KEY}&mode=quick`,
      method: "get",
      data: {
        email: email,
      }
    }
  }
});

export const autoGenerateSeoDetails = (queryParams) => ({
    type: ActionTypes.AUTO_GENERATE_SEO_DETAILS,
    payload: {
        request: {
            url: `/api/generate-ai-seo?${queryParams}`,
            method: "post"
        }
    }
})