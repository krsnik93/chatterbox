import {
  GET_MESSAGES_BEGIN,
  GET_MESSAGES_FAILURE,
  GET_MESSAGES_SUCCESS,
  ADD_MESSAGE_BEGIN,
  ADD_MESSAGE_FAILURE,
  ADD_MESSAGE_SUCCESS,
  SET_MESSAGE_SEEN_BEGIN,
  SET_MESSAGE_SEEN_FAILURE,
  SET_MESSAGE_SEEN_SUCCESS,
} from "../actions/message";

const initialState = {
  messages: {},
  pages: {},
  pageCounts: {},
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
        messages: {
            ...state.messages,
            ...Object.fromEntries(
          Object.entries(action.payload.messages).map(([roomId, msgs]) => [
            roomId,
            msgs.concat(state.messages?.[roomId] || []),
          ])
        )
        },
        pages: {
          ...state.pages,
          ...Object.fromEntries(
            Object.entries(action.payload.messages).map(([roomId, msgs]) => [
              roomId,
              action.payload.page,
            ])
          ),
        },
        pageCounts: {
          ...state.pageCounts,
          ...action.payload.page_counts,
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
    case ADD_MESSAGE_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case ADD_MESSAGE_SUCCESS:
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
    case ADD_MESSAGE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    case SET_MESSAGE_SEEN_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case SET_MESSAGE_SEEN_SUCCESS:
      const seenMessages = action.payload.messages;
      const allMessages = state.messages;
      const newMessages = Object.fromEntries(
        Object.entries(allMessages).map(([roomId, messages]) => [
          roomId,
          messages.map((message) => {
            const seenMessage = seenMessages.find(
              (msg) => msg.id === message.id
            );
            if (seenMessage) {
              return {
                ...message,
                seens: seenMessage.seens,
              };
            } else return message;
          }),
        ])
      );

      return {
        ...state,
        messages: newMessages,
        loading: false,
        error: null,
      };

    case SET_MESSAGE_SEEN_FAILURE:
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
