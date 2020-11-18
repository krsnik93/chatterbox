import { connect } from "react-redux";
import Container from "react-bootstrap/Container";

import styles from "./Welcome.module.css";

const Welcome = (props) => {
  const { user } = props;
  return (
    <Container fluid className={styles.container}>
      <h3>Welcome, {user?.username}.</h3>
    </Container>
  );
};

const mapStateToProps = (state) => ({
  user: state.userReducer.user,
});

export default connect(mapStateToProps, null)(Welcome);
