import {
  getMessagesBegin,
  getMessagesFailure,
  getMessagesSuccess,
  appendMessageBegin,
  appendMessageFailure,
  appendMessageSuccess,
} from "../actions/message";

import { api } from "../../utils";

export function getMessages(userId, roomId) {
  return (dispatch) => {
    dispatch(getMessagesBegin());
    return api
      .get(`/users/${userId}/rooms/${roomId}/messages`)
      .then((response) => {
        const { data } = response;
        dispatch(getMessagesSuccess(data));
        return { data };
      })
      .catch((error) => {
        console.log(error);
        dispatch(getMessagesFailure(error));
      });
  };
}

export function appendMessage(message) {
  return (dispatch) => {
    dispatch(appendMessageBegin());
    try {
      dispatch(appendMessageSuccess(message));
    } catch (error) {
      dispatch(appendMessageFailure(error));
    }
  };
}
