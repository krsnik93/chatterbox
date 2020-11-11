export const GET_MESSAGES_BEGIN = "GET_MESSAGES_BEGIN";
export const GET_MESSAGES_SUCCESS = "GET_MESSAGES_SUCCESS";
export const GET_MESSAGES_FAILURE = "GET_MESSAGES_FAILURE";
export const ADD_MESSAGE_BEGIN = "ADD_MESSAGE_BEGIN";
export const ADD_MESSAGE_SUCCESS = "ADD_MESSAGE_SUCCESS";
export const ADD_MESSAGE_FAILURE = "ADD_MESSAGE_FAILURE";
export const SET_MESSAGE_SEEN_BEGIN = "SET_MESSAGE_SEEN_BEGIN";
export const SET_MESSAGE_SEEN_SUCCESS = "SET_MESSAGE_SEEN_SUCCESS";
export const SET_MESSAGE_SEEN_FAILURE = "SET_MESSAGE_SEEN_FAILURE";

export const getMessagesBegin = () => ({
  type: GET_MESSAGES_BEGIN,
});

export const getMessagesSuccess = ({ messages, room_id, page }) => ({
  type: GET_MESSAGES_SUCCESS,
  payload: { messages, room_id, page },
});

export const getMessagesFailure = (error) => ({
  type: GET_MESSAGES_FAILURE,
  payload: { error },
});

export const addMessageBegin = () => ({
  type: ADD_MESSAGE_BEGIN,
});

export const addMessageSuccess = (message) => ({
  type: ADD_MESSAGE_SUCCESS,
  payload: { message },
});

export const addMessageFailure = (error) => ({
  type: ADD_MESSAGE_FAILURE,
  payload: { error },
});

export const setMessageSeenBegin = () => ({
  type: SET_MESSAGE_SEEN_BEGIN,
});

export const setMessageSeenSuccess = (messages) => ({
  type: SET_MESSAGE_SEEN_SUCCESS,
  payload: { messages },
});

export const setMessageSeenFailure = (error) => ({
  type: SET_MESSAGE_SEEN_FAILURE,
  payload: { error },
});
