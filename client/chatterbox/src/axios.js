import axios from "axios";

import store from "./redux/store";
import { authUserSuccess } from "./redux/actions/user";

export const api = axios.create({
  baseURL: "http://localhost:5000",
});

//api.interceptors.request.use(
//  (config) => {
//    const accessToken = store.getState().userReducer.tokens.accessToken;
//    if (accessToken) {
//      config.headers["Authorization"] = "Bearer " + accessToken;
//    }
//    config.headers["Content-Type"] = "application/json";
//    return config;
//  },
//  (error) => {
//    Promise.reject(error);
//  }
//);

/*
https://www.techynovice.com/setting-up-JWT-token-refresh-mechanism-with-axios/
*/
//api.interceptors.response.use(
//  function (response) {
//    // If the request succeeds, we don't have to do anything and just return the response
//    return response;
//  },
//  function (error) {
//    if (isTokenExpiredError(error)) {
//      return resetTokenAndReattemptRequest(error);
//    }
//    // If the error is due to other reasons, we just throw it back to axios
//    return Promise.reject(error);
//  }
//);
function isTokenExpiredError(error) {
  return (
    error?.response?.status === 401 &&
    error?.response?.data?.msg === "The access token has expired"
  );
}

let isAlreadyFetchingAccessToken = false;

// This is the list of waiting requests that will retry after the JWT refresh complete
let subscribers = [];

async function resetTokenAndReattemptRequest(error) {
  try {
    const { response: errorResponse } = error;
    const { user, tokens } = store.getState().userReducer;
    const { refreshToken } = tokens;
    if (!refreshToken) {
      return Promise.reject(error);
    }
    /* Proceed to the token refresh procedure
    We create a new Promise that will retry the request,
    clone all the request configuration from the failed
    request in the error object. */
    const retryOriginalRequest = new Promise((resolve) => {
      /* We need to add the request retry to the queue
    since there another request that already attempt to
    refresh the token */
      addSubscriber((access_token) => {
        errorResponse.config.headers.Authorization = "Bearer " + access_token;
        resolve(axios(errorResponse.config));
      });
    });
    if (!isAlreadyFetchingAccessToken) {
      isAlreadyFetchingAccessToken = true;
      const response = await axios({
        method: "post",
        url: `http://localhost:5000/auth/access_tokens`,
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      if (!response.data) {
        return Promise.reject(error);
      }
      const newAccessToken = response.data.accessToken;
      store.dispatch(
        authUserSuccess(user, { ...tokens, accessToken: newAccessToken })
      );
      isAlreadyFetchingAccessToken = false;
      onAccessTokenFetched(newAccessToken);
    }
    return retryOriginalRequest;
  } catch (err) {
    return Promise.reject(err);
  }
}

function onAccessTokenFetched(access_token) {
  // When the refresh is successful, we start retrying the requests one by one and empty the queue
  subscribers.forEach((callback) => callback(access_token));
  subscribers = [];
}

function addSubscriber(callback) {
  subscribers.push(callback);
}
