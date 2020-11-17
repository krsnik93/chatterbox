import Button from "react-bootstrap/Button";
import { connect } from "react-redux";

import { logoutUser } from "../redux/middleware/user";

const LogoutButton = (props) => {
  const { logoutUser } = props;

  return (
    <Button {...props} onClick={logoutUser}>
      Logout
    </Button>
  );
};

export default connect(null, { logoutUser })(LogoutButton);
