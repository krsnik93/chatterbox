import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./screens/Login";
import Home from "./screens/Home";

function App() {
  return (
    <>
      <Router>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/home" component={Home} />
          <Route exact path="/" render={() => <Redirect to="/home" />} />
        </Switch>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
