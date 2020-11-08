import { combineReducers } from "redux";

import userReducer from "./user";
import roomReducer from "./room";
import membershipReducer from "./membership";
import messageReducer from "./message";

const rootReducer = combineReducers({
  userReducer,
  roomReducer,
  membershipReducer,
  messageReducer,
});
export default rootReducer;
