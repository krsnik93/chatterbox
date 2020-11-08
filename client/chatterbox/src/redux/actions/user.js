export const AUTH_USER_BEGIN = "AUTH_USER_BEGIN";
export const AUTH_USER_SUCCESS = "AUTH_USER_SUCCESS";
export const AUTH_USER_FAILURE = "AUTH_USER_FAILURE";

export const authUserBegin = () => ({
  type: AUTH_USER_BEGIN,
});

export const authUserSuccess = (user, tokens) => ({
  type: AUTH_USER_SUCCESS,
  payload: { user, tokens },
});

export const authUserFailure = (error) => ({
  type: AUTH_USER_FAILURE,
  payload: { error },
});
