import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./reducers";

const store = createStore(rootReducer, applyMiddleware(thunk));
store.subscribe(() => {
  localStorage.setItem(
    "user",
    JSON.stringify(store.getState().userReducer.user)
  );
  localStorage.setItem(
    "tokens",
    JSON.stringify(store.getState().userReducer.tokens)
  );
});
export default store;
