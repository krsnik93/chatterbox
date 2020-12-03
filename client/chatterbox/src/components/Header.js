import { useState } from "react";
import { connect } from "react-redux";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Nav from "react-bootstrap/Nav";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";

import CreateRoomModal from "../components/CreateRoomModal";
import { logoutUser } from "../redux/middleware/user";
import styles from "./Header.module.css";

function Header(props) {
  const { socket, user, logoutUser } = props;
  const [showModal, setShowModal] = useState(false);

  const onClick = () => {
    setShowModal(true);
  };

  return (
    <>
      <Navbar className={styles.navbar} expand="lg">
        <Navbar.Brand href="#home" className={styles.brand}>
          Chatterbox
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className={classNames(styles.nav, "ml-auto")}>
            <Nav.Link className={styles.navLink} onClick={onClick}>
              <FontAwesomeIcon icon={faPlus} />
            </Nav.Link>
            <NavDropdown
              className={styles.navDropdown}
              title={user.username}
              alignRight
            >
              <NavDropdown.Item href="#action/3.1">Profile</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">Settings</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={logoutUser}>Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <CreateRoomModal
        showModal={showModal}
        setShowModal={setShowModal}
        socket={socket}
      />
    </>
  );
}

const mapStateToProps = (state) => ({
  user: state.userReducer.user,
});

export default connect(mapStateToProps, { logoutUser })(Header);
