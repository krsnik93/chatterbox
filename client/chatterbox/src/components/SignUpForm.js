import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useForm } from "react-hook-form";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import classNames from "classnames";
import { signUpUser } from "../redux/middleware/user";
import styles from "./SignUpForm.module.css";

function SignUpForm(props) {
  const { signUpUser, errorsSignUp: errServ } = props;
  const { register, handleSubmit, errors: errClient } = useForm();
  const [errors, setErrors] = useState({});
  const [validated, setValidated] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const [state, setState] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const errors = {
      email: errClient.email
        ? errClient.email
        : errServ.email
        ? errServ.email
        : null,
      username: errClient.username
        ? errClient.username
        : errServ.username
        ? errServ.username
        : null,
      password: errClient.password
        ? errClient.password
        : errServ.password
        ? errServ.password
        : null,
    };
    setErrors(errors);
  }, [errServ, errClient]);

  useEffect(() => {
    if (!Object.values(errors).some((error) => error !== null)) {
      setValidated(false);
    }
  }, [errors]);

  const onChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.value,
    });
    setValidated(false);
  };

  const onSubmit = (data, e) => {
    setSubmittedOnce(true);
    setValidated(true);
    const { username, email, password } = state;
    signUpUser(username, email, password);
  };
  const onError = (errors, e) => {
    setSubmittedOnce(true);
    setValidated(false);
  };

  return (
    <Container className={styles.container}>
      <Form onSubmit={handleSubmit(onSubmit, onError)} validated={validated}>
        <Row className={styles.row}>
          <Col className={styles.headingColumn}>
            <h4 className={styles.heading}>Sign Up</h4>
          </Col>
        </Row>
        <Row className={classNames(styles.row, styles.inputRow)}>
          <Col>
            <Form.Group>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter Email Address..."
                value={state.email}
                onChange={onChange}
                ref={register({
                  required: "Email address is tequired.",
                  maxLength: 254,
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                isValid={submittedOnce && !errors.email}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="valid" />
              <Form.Control.Feedback type="invalid">
                {errors.email && errors.email.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Row className={classNames(styles.row, styles.inputRow)}>
          <Col>
            <Form.Group>
              <Form.Control
                type="text"
                name="username"
                placeholder="Enter Username..."
                value={state.username}
                onChange={onChange}
                ref={register({
                  required: "Username is required.",
                  minLength: 8,
                  maxLength: 128,
                })}
                isValid={submittedOnce && !errors.username}
                isInvalid={!!errors.username}
              />
              <Form.Control.Feedback type="valid" />
              <Form.Control.Feedback type="invalid">
                {errors.username && errors.username.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Row className={classNames(styles.row, styles.inputRow)}>
          <Col>
            <Form.Group>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter Password..."
                value={state.password}
                onChange={onChange}
                ref={register({
                  required: "Password is required.",
                  minLength: 8,
                  maxLength: 128,
                })}
                isValid={submittedOnce && !errors.password}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="valid" />
              <Form.Control.Feedback type="invalid">
                {errors.password && errors.password.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Row className={styles.row}>
          <Col className={styles.buttonColumn}>
            <Button type="submit" className={styles.button}>
              Sign Up
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

const mapStateToProps = (state) => ({
  errorsSignUp: state.formReducer.errorsSignUp,
});

export default connect(mapStateToProps, { signUpUser })(SignUpForm);
