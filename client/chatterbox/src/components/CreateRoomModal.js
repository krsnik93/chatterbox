import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import AsyncSelect from "react-select/async";
import { AsyncPaginate } from "react-select-async-paginate";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { api } from "../axios";

const CreateRoomModal = (props) => {
  const { socket, user, showModal, setShowModal } = props;
  const [roomName, setRoomName] = useState("");
  const [users, setUsers] = useState([]);
  const [startingUserId, setStartingUserId] = useState(0);

  const processUsers = (users) => {
    const processedUsers = users.map((user, index) => ({
      value: user,
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

  const onChangeUserSearch = (userSearch, loadedOptions) => {
    const startingUserId = Math.max(
      ...(loadedOptions.length ? loadedOptions.map((o) => o.value.id) : [0])
    );
    return api
      .get(
        `/users?username_pattern=${userSearch}&starting_user_id=${startingUserId}`
      )
      .then((response) => {
        let { users } = response.data;
        console.log(users);
        users = users.filter((u) => u.username !== user.username);
        return {
          options: processUsers(users),
          hasMore: !!users.length,
        };
      })
      .catch((error) => {
        console.log(error);
        return {
          options: [],
          hasMore: false,
        };
      });
  };

  const onChange = (selectedOptions) => {
    console.log();
    const usernames = (selectedOptions || []).map((o, i) => o.value.username);
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
        <AsyncPaginate
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
