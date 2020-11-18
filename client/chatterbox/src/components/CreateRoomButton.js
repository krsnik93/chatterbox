import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import AsyncSelect from "react-select/async";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusSquare } from "@fortawesome/free-regular-svg-icons";

import { api } from "../axios";
import { logoutUser } from "../redux/middleware/user";
import { getRooms } from "../redux/middleware/room";

const CreateRoomButton = (props) => {
  const { socket, user, createdRoom, getRooms } = props;
  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [users, setUsers] = useState([]);

  const onClick = () => {
    setShowModal(true);
  };

  const onHide = () => {
    setShowModal(false);
    setRoomName("");
  };

  //  useEffect(() => {
  //    if (createdRoom) {
  //      getRooms(user.id);
  //    }
  //  }, [createdRoom, getRooms, user.id]);

  const processUsers = (users) => {
    const processedUsers = users.map((user, index) => ({
      value: user.username,
      label: user.username,
    }));
    return processedUsers;
  };

  const onChangeRoomName = (event) => {
    setRoomName(event.target.value);
  };

  const onChangeUserSearch = (userSearch) =>
    api
      .get(`/users?username=${userSearch}`)
      .then((response) => {
        let { users } = response.data;
        users = users.filter((u) => u.username !== user.username);
        return processUsers(users);
      })
      .catch((error) => {
        console.log(error);
      });

  const onChange = (selectedOptions) => {
    const usernames = selectedOptions.map((o, i) => o.value);
    setUsers(usernames);
  };

  const onCreate = (event) => {
    socket.emit("room event", {
      roomName,
      userId: user.id,
      usernames: users.concat(user.username),
    });
    setShowModal(false);
  };

  return (
    <>
      <Button {...props} onClick={onClick}>
        <FontAwesomeIcon icon={faPlusSquare} />
        {" New Room"}
      </Button>

      <Modal show={showModal} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Create a Room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              type="text"
              name="roomName"
              placeholder="Enter Room Name..."
              value={roomName}
              onChange={onChangeRoomName}
            />
          </Form>
          <h4>Add other users to the room</h4>
          <AsyncSelect
            placeholder="Find users..."
            isSearchable
            isMulti
            defaultOptions={[]}
            loadOptions={onChangeUserSearch}
            onChange={onChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onCreate}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.userReducer.user,
  createdRoom: state.roomReducer.createdRoom,
});

export default connect(mapStateToProps, { getRooms })(CreateRoomButton);
