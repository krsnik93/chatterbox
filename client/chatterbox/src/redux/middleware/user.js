import {
  authUserBegin,
  authUserFailure,
  authUserSuccess,
} from "../actions/user";
import {
  formSignUpBegin,
  formSignUpSuccess,
  formSignUpFailure,
  formLoginBegin,
  formLoginSuccess,
  formLoginFailure,
} from "../actions/form";

import { api } from "../../axios";

export function loginUser(username, password) {
  return (dispatch) => {
    dispatch(authUserBegin());
    dispatch(formLoginBegin());
    return api
      .post("/auth/tokens", { username, password })
      .then((response) => {
        const { user, accessToken, refreshToken } = response.data;
        const tokens = { accessToken, refreshToken };
        dispatch(authUserSuccess(user, tokens));
        dispatch(formLoginSuccess());
      })
      .catch((error) => {
        dispatch(authUserFailure(error.message));
        if (error.response && error.response.data) {
          const { errors } = error.response.data;
          dispatch(formLoginFailure(errors));
        }
      });
  };
}

export function signUpUser(username, email, password) {
  return (dispatch) => {
    dispatch(authUserBegin());
    dispatch(formSignUpBegin());
    return api
      .post("/users", { username, email, password })
      .then((response) => {
        const { user, accessToken, refreshToken } = response.data;
        const tokens = { accessToken, refreshToken };
        dispatch(authUserSuccess(user, tokens));
        dispatch(formSignUpSuccess());
      })
      .catch((error) => {
        dispatch(authUserFailure(error.message));
        if (error.response && error.response.data) {
          const { errors } = error.response.data;
          dispatch(formSignUpFailure(errors));
        }
      });
  };
}

export function logoutUser() {
  return (dispatch) => {
    dispatch(authUserBegin());
  };
}
