import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import LoginForm from "../components/LoginForm";
import SignUpForm from "../components/SignUpForm";
import { isUserLoggedIn } from "../utils";
import styles from "./Login.module.css";

function Login(props) {
  const { user, tokens } = props;

  if (user && isUserLoggedIn(tokens)) {
    return <Redirect to="/home" />;
  }

  return (
    <Container fluid className={styles.container}>
      <Row>
        <Col>
          <LoginForm />
        </Col>
      </Row>
      <Row>
        <Col>
          <SignUpForm />
        </Col>
      </Row>
    </Container>
  );
}

const mapStateToProps = (state) => ({
  user: state.userReducer.user,
  tokens: state.userReducer.tokens,
  loading: state.userReducer.loading,
  error: state.userReducer.error,
});

export default connect(mapStateToProps, null)(Login);
