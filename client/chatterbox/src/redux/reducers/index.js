import { combineReducers } from "redux";

import userReducer from "./user";
import roomReducer from "./room";
import membershipReducer from "./membership";
import messageReducer from "./message";
import tabReducer from "./tab";

const rootReducer = combineReducers({
  userReducer,
  roomReducer,
  membershipReducer,
  messageReducer,
  tabReducer,
});
export default rootReducer;
