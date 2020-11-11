import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import AsyncSelect from "react-select/async";
import { LinkContainer } from "react-router-bootstrap";
import { connect } from "react-redux";

import { api } from "../utils";
import { getRooms } from "../redux/middleware/room";

function Sidebar(props) {
  const { user, rooms, socket, createdRoom, getRooms } = props;
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

  useEffect(() => {
    if (createdRoom) {
      getRooms(user.id);
    }
  }, [createdRoom, getRooms, user.id]);

  return (
    <Nav variant="pills" className="flex-column">
      <button onClick={onClick}>Create a Room</button>
      {rooms.map((room, index) => (
        <Nav.Item key={index}>
          <LinkContainer
            to={{
              pathname: `/home/rooms/${room.id}`,
              state: { room },
            }}
          >
            <Nav.Link eventKey={index}>{room.name}</Nav.Link>
          </LinkContainer>
        </Nav.Item>
      ))}

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
    </Nav>
  );
}

const mapStateToProps = (state) => ({
  user: state.userReducer.user,
  rooms: state.roomReducer.rooms,
  createdRoom: state.roomReducer.createdRoom,
});

export default connect(mapStateToProps, { getRooms })(Sidebar);
