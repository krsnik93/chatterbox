import {
  createMembershipsBegin,
  createMembershipsSuccess,
  createMembershipsFailure,
} from "../actions/membership";
import { api } from "../../utils";

export function createMemberships(userId, roomId, usernames) {
  return (dispatch) => {
    dispatch(createMembershipsBegin(roomId));
    return api
      .post(`/users/${userId}/rooms/${roomId}/memberships`, { usernames })
      .then((response) => {
        dispatch(createMembershipsSuccess());
      })
      .catch((error) => {
        dispatch(createMembershipsFailure(error));
      });
  };
}
