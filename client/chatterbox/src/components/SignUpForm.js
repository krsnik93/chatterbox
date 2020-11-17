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
  const { signUpUser, errorsSignUp: errorsServer } = props;
  const { register, handleSubmit, errors, formState, setError } = useForm({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });
  const { touched, dirtyFields, submitCount } = formState;
  const [validated, setValidated] = useState(false);
  const setServerErrors = (errors) => {
    Object.keys(errors).forEach((key) => {
      setError(key, {
        type: "server",
        message: errors[key].message,
      });
    });
  };

  useEffect(() => {
    setServerErrors(errorsServer);
  }, [errorsServer]);

  useEffect(() => {
    if (!Object.values(errors).some((error) => error !== null)) {
      setValidated(false);
    }
  }, [errors]);

  const onSubmit = (data, e) => {
    const { username, email, password } = data;
    signUpUser(username, email, password);
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
                ref={register({
                  required: "Email address is tequired.",
                  maxLength: {
                    value: 254,
                    message:
                      "Email address has to have at most 254 characters.",
                  },
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address format.",
                  },
                })}
                isValid={submitCount > 0 && !errors.email}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="valid" />
              <Form.Control.Feedback type="invalid">
                {errors.email?.message}
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
                    value: 8,
                    message: "Password has to have at least 8 characters.",
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
