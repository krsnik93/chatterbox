import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import AsyncSelect from "react-select/async";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { api } from "../axios";

const CreateRoomModal = (props) => {
  const { socket, user, showModal, setShowModal } = props;
  const [roomName, setRoomName] = useState("");
  const [users, setUsers] = useState([]);

  const processUsers = (users) => {
    const processedUsers = users.map((user, index) => ({
      value: user.username,
      label: user.username,
    }));
    return processedUsers;
  };

  const onHide = () => {
    setShowModal(false);
    setRoomName("");
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
    event.preventDefault();
    socket.emit("room event", {
      roomName,
      userId: user.id,
      usernames: users.concat(user.username),
    });
    setShowModal(false);
  };

  return (
    <Modal show={showModal} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Create a Room</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate onSubmit={onCreate}>
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
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="success" type="submit" onClick={onCreate}>
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const mapStateToProps = (state) => ({
  user: state.userReducer.user,
});

export default connect(mapStateToProps, null)(CreateRoomModal);
