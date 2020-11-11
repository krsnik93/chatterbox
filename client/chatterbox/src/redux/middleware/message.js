import {
  getMessagesBegin,
  getMessagesFailure,
  getMessagesSuccess,
  addMessageBegin,
  addMessageFailure,
  addMessageSuccess,
  setMessageSeenBegin,
  setMessageSeenFailure,
  setMessageSeenSuccess,
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

export function addMessage(message) {
  return (dispatch) => {
    dispatch(addMessageBegin());
    try {
      return dispatch(addMessageSuccess(message));
    } catch (error) {
      return dispatch(addMessageFailure(error));
    }
  };
}

export function setMessageSeen(userId, roomId, status, messageIds) {
  return (dispatch) => {
    dispatch(setMessageSeenBegin());
    return api
      .put(`/users/${userId}/rooms/${roomId}/messages_seen`, {
        messageIds,
        status,
      })
      .then((response) => {
        console.log(response);
        const { message, messages } = response.data;
        if (message) {
          return dispatch(setMessageSeenFailure(message));
        } else {
          return dispatch(setMessageSeenSuccess(messages));
        }
      })
      .catch((error) => {
        console.log(error);
        return dispatch(setMessageSeenFailure(error));
      });
  };
}

export function addMessageAndSetSeen(userId, roomId, status, message) {
  return (dispatch) => {
    dispatch(addMessage(message));
    dispatch(setMessageSeen(userId, roomId, status, [message.id]));
  };
}
