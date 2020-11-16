import {
  FORM_SIGN_UP_BEGIN,
  FORM_SIGN_UP_SUCCESS,
  FORM_SIGN_UP_FAILURE,
  FORM_LOGIN_BEGIN,
  FORM_LOGIN_SUCCESS,
  FORM_LOGIN_FAILURE,
} from "../actions/form";

const initialState = {
  loadingSignUp: false,
  errorsSignUp: {},
  loadingLogin: false,
  errorsLogin: {},
};

const formReducer = (state = initialState, action) => {
  switch (action.type) {
    case FORM_SIGN_UP_BEGIN:
      return {
        ...state,
        loadingSignUp: true,
        errorsSignUp: {},
      };
    case FORM_SIGN_UP_SUCCESS:
      return {
        ...state,
        loadingSignUp: false,
        errorsSignUp: {},
      };
    case FORM_SIGN_UP_FAILURE:
      return {
        ...state,
        loadingSignUp: false,
        errorsSignUp: action.payload.errors,
      };
    case FORM_LOGIN_BEGIN:
      return {
        ...state,
        loadingLogin: true,
        errorsLogin: {},
      };
    case FORM_LOGIN_SUCCESS:
      return {
        ...state,
        loadingLogin: false,
        errorsLogin: {},
      };
    case FORM_LOGIN_FAILURE:
      return {
        ...state,
        loadingLogin: false,
        errorsLogin: action.payload.errors,
      };
    default:
      return state;
  }
};
export default formReducer;
