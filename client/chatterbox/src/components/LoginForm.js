import React, { useState } from "react";
import { connect } from "react-redux";

import { loginUser } from "../redux/middleware/user";

function LoginForm(props) {
  const { loginUser } = props;
  const [state, setState] = useState({
    username: "",
    password: "",
  });

  const onChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.value,
    });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const { username, password } = state;
    loginUser(username, password);
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        name="username"
        placeholder="Enter Username..."
        value={state.username}
        onChange={onChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Enter Password..."
        value={state.password}
        onChange={onChange}
      />
      <input type="submit" value="Login" />
    </form>
  );
}

export default connect(null, { loginUser })(LoginForm);
