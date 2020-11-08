import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./reducers";

function writeUserInfoToLocalStorage(state) {
  try {
    localStorage.setItem(
      "state.userReducer.user",
      JSON.stringify(state.userReducer.user)
    );
    localStorage.setItem(
      "state.userReducer.tokens",
      JSON.stringify(state.userReducer.tokens)
    );
  } catch (err) {
    console.log(err);
  }
}

const store = createStore(rootReducer, applyMiddleware(thunk));
store.subscribe(() => {
  writeUserInfoToLocalStorage(store.getState());
});
export default store;
