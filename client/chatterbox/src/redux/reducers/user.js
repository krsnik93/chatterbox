import {
  AUTH_USER_BEGIN,
  AUTH_USER_FAILURE,
  AUTH_USER_SUCCESS,
} from "../actions/user";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  tokens: JSON.parse(localStorage.getItem("tokens")) || {
    accessToken: null,
    refreshToken: null,
  },
  loading: false,
  error: null,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case AUTH_USER_BEGIN:
      return {
        ...state,
        user: null,
        tokens: {
          accessToken: null,
          refreshToken: null,
        },
        loading: true,
        error: null,
      };
    case AUTH_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        tokens: action.payload.tokens,
        error: null,
      };
    case AUTH_USER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};
export default userReducer;
