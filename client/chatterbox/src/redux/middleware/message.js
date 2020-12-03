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

import { api } from "../../axios";
import queryString from "query-string";

export function getMessages(userId, roomIds, maxMilliseconds = []) {
  return (dispatch) => {
    dispatch(getMessagesBegin());

    const queryStr = queryString.stringify(
      { room_ids: roomIds, max_milliseconds: maxMilliseconds },
      { arrayFormat: "none" }
    );

    return api
      .get(`/users/${userId}/messages?${queryStr}`)
      .then((response) => {
        const { data } = response;
        dispatch(getMessagesSuccess(data));
        return { data };
      })
      .catch((error) => {
        dispatch(getMessagesFailure(error.toString()));
      });
  };
}

export function addMessage(message) {
  return (dispatch) => {
    dispatch(addMessageBegin());
    try {
      return dispatch(addMessageSuccess(message));
    } catch (error) {
      return dispatch(addMessageFailure(error.toString()));
    }
  };
}

export function setMessageSeen(
  userId,
  roomId,
  messageIds = [],
  status = true,
  all = false
) {
  return (dispatch) => {
    dispatch(setMessageSeenBegin());

    let args = { status };
    if (all) args.all = true;
    else args.messageIds = messageIds;

    return api
      .put(`/users/${userId}/rooms/${roomId}/messages_seen`, args)
      .then((response) => {
        const { message, messages } = response.data;
        if (message) {
          return dispatch(setMessageSeenFailure(message));
        } else {
          return dispatch(setMessageSeenSuccess(messages));
        }
      })
      .catch((error) => {
        return dispatch(setMessageSeenFailure(error.toString()));
      });
  };
}

export function addMessageAndSetSeen(userId, roomId, message, status) {
  return (dispatch) => {
    dispatch(addMessage(message));
    dispatch(setMessageSeen(userId, roomId, [message.id], status));
  };
}
