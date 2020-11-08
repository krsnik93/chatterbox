import {
  getMessagesBegin,
  getMessagesFailure,
  getMessagesSuccess,
} from "../actions/message";

import { api } from "../../utils";

export function getMessages(userId, roomId) {
  return (dispatch) => {
    console.log(0);
    dispatch(getMessagesBegin());
    return api
      .get(`/users/${userId}/rooms/${roomId}/messages`)
      .then((response) => {
        console.log(1);
        const {data} = response;
        dispatch(getMessagesSuccess(data));
        return { data };
      })
      .catch((error) => {
        console.log(error);
        dispatch(getMessagesFailure(error));
      });
  };
}