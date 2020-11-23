import { combineReducers } from "redux";

import {
  FORM_SIGN_UP_BEGIN,
  FORM_SIGN_UP_SUCCESS,
  FORM_SIGN_UP_FAILURE,
  FORM_LOGIN_BEGIN,
  FORM_LOGIN_SUCCESS,
  FORM_LOGIN_FAILURE,
} from "../actions/form";

const signUpInitialState = {
  loading: false,
  errors: {},
};

const loginInitialState = {
  loading: false,
  errors: {},
};

const signUpReducer = (state = signUpInitialState, action) => {
  switch (action.type) {
    case FORM_SIGN_UP_BEGIN:
      return {
        ...state,
        loading: true,
        errors: {},
      };
    case FORM_SIGN_UP_SUCCESS:
      return {
        ...state,
        loading: false,
        errors: {},
      };
    case FORM_SIGN_UP_FAILURE:
      return {
        ...state,
        loading: false,
        errors: action.payload.errors,
      };
    default:
      return state;
  }
};

const loginReducer = (state = loginInitialState, action) => {
  switch (action.type) {
    case FORM_LOGIN_BEGIN:
      return {
        ...state,
        loading: true,
        errors: {},
      };
    case FORM_LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        errors: {},
      };
    case FORM_LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        errors: action.payload.errors,
      };
    default:
      return state;
  }
};

const formReducer = combineReducers({
    signUpReducer,
    loginReducer,
})
export default formReducer;
