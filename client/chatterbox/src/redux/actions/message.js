export const GET_MESSAGES_BEGIN = "GET_MESSAGES_BEGIN";
export const GET_MESSAGES_SUCCESS = "GET_MESSAGES_SUCCESS";
export const GET_MESSAGES_FAILURE = "GET_MESSAGES_FAILURE";
export const APPEND_MESSAGE_BEGIN = "APPEND_MESSAGE_BEGIN";
export const APPEND_MESSAGE_SUCCESS = "APPEND_MESSAGE_SUCCESS";
export const APPEND_MESSAGE_FAILURE = "APPEND_MESSAGE_FAILURE";

export const getMessagesBegin = () => ({
  type: GET_MESSAGES_BEGIN,
});

export const getMessagesSuccess = ({messages, room_id, page}) => ({
  type: GET_MESSAGES_SUCCESS,
  payload: { messages, room_id, page },
});

export const getMessagesFailure = (error) => ({
  type: GET_MESSAGES_FAILURE,
  payload: { error },
});

export const appendMessageBegin = () => ({
  type: APPEND_MESSAGE_BEGIN,
});

export const appendMessageSuccess = (message) => ({
  type: APPEND_MESSAGE_SUCCESS,
  payload: { message },
});

export const appendMessageFailure = (error) => ({
  type: APPEND_MESSAGE_FAILURE,
  payload: { error },
});
