import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useForm } from "react-hook-form";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import classNames from "classnames";

import { loginUser } from "../redux/middleware/user";
import { setServerErrors } from "../utils";
import styles from "./LoginForm.module.css";

function LoginForm(props) {
  const { loginUser, errors: errorsServer } = props;
  const { register, handleSubmit, errors, formState, setError } = useForm({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { submitCount } = formState;
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    setServerErrors(errorsServer, setError);
  }, [errorsServer, setError]);

  useEffect(() => {
    if (!Object.values(errors).some((error) => error !== null)) {
      setValidated(false);
    }
  }, [errors]);

  const onSubmit = (data, e) => {
    const { username, password } = data;
    loginUser(username, password);
  };

  const onError = (errors, e) => {
    setValidated(false);
  };

  return (
    <Container className={styles.container}>
      <Form
        onSubmit={handleSubmit(onSubmit, onError)}
        noValidate
        validated={validated}
      >
        <Row className={styles.row}>
          <Col className={styles.headingColumn}>
            <h4 className={styles.heading}>Login</h4>
          </Col>
        </Row>
        <Row className={classNames(styles.row, styles.inputRow)}>
          <Col>
            <Form.Group>
              <Form.Control
                name="username"
                type="text"
                placeholder="Enter Username..."
                ref={register({
                  required: "Username is required.",
                  minLength: {
                    value: 8,
                    message: "Username has to have at least 8 characters.",
                  },
                  maxLength: {
                    value: 128,
                    message: "Username has to have at most 128 characters.",
                  },
                })}
                isValid={submitCount > 0 && !errors.username}
                isInvalid={!!errors.username}
              />
              <Form.Control.Feedback type="valid" />
              <Form.Control.Feedback type="invalid">
                {errors.username?.message}
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
                ref={register({
                  required: "Password is required.",
                  minLength: {
                    value: 3,
                    message: "Password has to have at least 3 characters.",
                  },
                  maxLength: {
                    value: 128,
                    message: "Password has to have at most 128 characters.",
                  },
                })}
                isValid={submitCount > 0 && !errors.password}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="valid" />
              <Form.Control.Feedback type="invalid">
                {errors.password?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Row className={styles.row}>
          <Col className={styles.buttonColumn}>
            <Button type="submit" className={styles.button}>
              Login
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

const mapStateToProps = (state) => ({
  errors: state.formReducer.loginReducer.errors,
});

export default connect(mapStateToProps, { loginUser })(LoginForm);
