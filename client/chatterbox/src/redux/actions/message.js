export const GET_MESSAGES_BEGIN = "GET_MESSAGES_BEGIN";
export const GET_MESSAGES_SUCCESS = "GET_MESSAGES_SUCCESS";
export const GET_MESSAGES_FAILURE = "GET_MESSAGES_FAILURE";

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