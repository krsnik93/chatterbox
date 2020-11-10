import {
  GET_MESSAGES_BEGIN,
  GET_MESSAGES_FAILURE,
  GET_MESSAGES_SUCCESS,
  APPEND_MESSAGE_BEGIN,
  APPEND_MESSAGE_FAILURE,
  APPEND_MESSAGE_SUCCESS,
} from "../actions/message";

const initialState = {
  messages: {},
  pages: {},
  loading: false,
  error: null,
};

const messageReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_MESSAGES_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GET_MESSAGES_SUCCESS:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.room_id]: action.payload.messages,
        },
        pages: {
          ...state.pages,
          [action.payload.room_id]: action.payload.page,
        },
        loading: false,
        error: null,
      };
    case GET_MESSAGES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    case APPEND_MESSAGE_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case APPEND_MESSAGE_SUCCESS:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.message.room_id]: state.messages[
            action.payload.message.room_id
          ].concat(action.payload.message),
        },
        loading: false,
        error: null,
      };
    case APPEND_MESSAGE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};
export default messageReducer;
