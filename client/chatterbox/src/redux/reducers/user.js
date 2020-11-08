import {
  AUTH_USER_BEGIN,
  AUTH_USER_FAILURE,
  AUTH_USER_SUCCESS,
} from "../actions/user";

function loadUserInfoFromLocalStorage() {
  const nullTokens = { accessToken: null, refreshToken: null };
  const nullUser = null;
  try {
    const tokens =
      JSON.parse(localStorage.getItem("state.userReducer.tokens")) ||
      nullTokens;
    const user =
      JSON.parse(localStorage.getItem("state.userReducer.user")) || nullUser;
    return { tokens, user };
  } catch (err) {
    return { nullTokens, nullUser };
  }
}

const initialState = {
  user: null,
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
  loading: false,
  error: null,
  ...loadUserInfoFromLocalStorage(),
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
