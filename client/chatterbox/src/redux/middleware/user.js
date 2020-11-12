import {
  authUserBegin,
  authUserFailure,
  authUserSuccess,
} from "../actions/user";

import { api } from "../../axios";

export function loginUser(username, password) {
  return (dispatch) => {
    dispatch(authUserBegin());
    return api
      .post("/auth/tokens", { username, password })
      .then((response) => {
        const { user, accessToken, refreshToken } = response.data;
        const tokens = { accessToken, refreshToken };
        dispatch(authUserSuccess(user, tokens));
        return { user, tokens };
      })
      .catch((error) => {
        dispatch(authUserFailure(error));
      });
  };
}

export function signUpUser(username, email, password) {
  return (dispatch) => {
    dispatch(authUserBegin());
    return api
      .post("/users", { username, email, password })
      .then((response) => {
        const { user, accessToken, refreshToken } = response.data;
        const tokens = { accessToken, refreshToken };
        dispatch(authUserSuccess(user, tokens));
        return { user, tokens };
      })
      .catch((error) => {
        dispatch(authUserFailure(error));
      });
  };
}

export function logoutUser() {
  return (dispatch) => {
    dispatch(authUserBegin());
    localStorage.removeItem("state.userReducer.user");
    localStorage.removeItem("state.userReducer.tokens");
  };
}
