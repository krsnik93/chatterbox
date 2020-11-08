import React, { useState, useEffect } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { connect } from "react-redux";

import LoginForm from "../components/LoginForm";
import SignUpForm from "../components/SignUpForm";
import styles from "./Login.module.css";
import { isUserLoggedIn } from "../utils";

function Login(props) {
  const { user, tokens } = props;
  if (user && isUserLoggedIn(tokens)) {
    return <Redirect to="/home" />;
  }

  return (
    <div className={styles.forms}>
      <LoginForm />
      <SignUpForm />
    </div>
  );
}

const mapStateToProps = (state) => ({
  user: state.userReducer.user,
  tokens: state.userReducer.tokens,
  loading: state.userReducer.loading,
  error: state.userReducer.error,
});

export default connect(mapStateToProps, null)(Login);
