import { combineReducers } from "redux";

import userReducer from "./user";
import roomReducer from "./room";
import membershipReducer from "./membership";
import messageReducer from "./message";
import unseenReducer from "./unseen";
import tabReducer from "./tab";
import formReducer from "./form";

const rootReducer = combineReducers({
  userReducer,
  roomReducer,
  membershipReducer,
  messageReducer,
  unseenReducer,
  tabReducer,
  formReducer,
});
export default rootReducer;
