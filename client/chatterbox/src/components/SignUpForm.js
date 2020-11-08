import { useState } from "react";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";

import { api } from "../utils";
import { signUpUser } from "../redux/middleware/user";

function SignUpForm() {
  const history = useHistory();
  const [state, setState] = useState({
    username: "",
    email: "",
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
    const { username, email, password } = state;
    signUpUser(username, email, password);
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
        type="text"
        name="email"
        placeholder="Enter Email Address..."
        value={state.email}
        onChange={onChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Enter Password..."
        value={state.password}
        onChange={onChange}
      />
      <input type="submit" value="Sign Up" />
    </form>
  );
}

export default connect(null, { signUpUser })(SignUpForm);
