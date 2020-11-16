export const FORM_SIGN_UP_BEGIN = "FORM_SIGN_UP_BEGIN";
export const FORM_SIGN_UP_SUCCESS = "FORM_SIGN_UP_SUCCESS";
export const FORM_SIGN_UP_FAILURE = "FORM_SIGN_UP_FAILURE";
export const FORM_LOGIN_BEGIN = "FORM_LOGIN_BEGIN";
export const FORM_LOGIN_SUCCESS = "FORM_LOGIN_SUCCESS";
export const FORM_LOGIN_FAILURE = "FORM_LOGIN_FAILURE";

export const formSignUpBegin = () => ({
  type: FORM_SIGN_UP_BEGIN,
});

export const formSignUpSuccess = () => ({
  type: FORM_SIGN_UP_SUCCESS,
});

export const formSignUpFailure = (errors) => ({
  type: FORM_SIGN_UP_FAILURE,
  payload: { errors },
});

export const formLoginBegin = () => ({
  type: FORM_LOGIN_BEGIN,
});

export const formLoginSuccess = () => ({
  type: FORM_LOGIN_SUCCESS,
});

export const formLoginFailure = (errors) => ({
  type: FORM_LOGIN_FAILURE,
  payload: { errors },
});
