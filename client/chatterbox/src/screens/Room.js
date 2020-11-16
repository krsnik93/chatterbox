import React, { useState, useEffect } from "react";
import { useParams, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import Modal from "react-bootstrap/Modal";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";

import { getRooms, leaveRoom, deleteRoom } from "../redux/middleware/room";
import {
  getMessages,
  addMessageAndSetSeen,
  setMessageSeen,
} from "../redux/middleware/message";
import { setActiveRoomId } from "../redux/actions/tab";

import styles from "./Room.module.css";

function Room(props) {
  const { roomId } = useParams();
  const {
    user,
    rooms,
    messages: allRoomMessages,
    getRooms,
    leaveRoom,
    deleteRoom,
    getMessages,
    setActiveRoomId,
    addMessageAndSetSeen,
    setMessageSeen,
    activeRoomId,
    socket,
    createdSocket,
  } = props;

  const [room, setRoom] = useState(null);
  const [noRoom, setNoRoom] = useState(false);
  const [fetchedRooms, setFetchedRooms] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showLeaveRoomModal, setShowLeaveRoomModal] = useState(false);
  const [showDeleteRoomModal, setShowDeleteRoomModal] = useState(false);
  const [
    createdSocketMessageListener,
    setCreatedSocketMessageListener,
  ] = useState(false);

  useEffect(() => {
    if (user && !rooms.length && !fetchedRooms) {
      getRooms(user.id).then(() => setFetchedRooms(true));
    }
  }, [user, rooms.length, getRooms, fetchedRooms]);

  useEffect(() => {
    if (
      rooms &&
      rooms.filter((room) => room.id === parseInt(roomId)).length === 0
    ) {
      console.log("noRoom");
      setNoRoom(true);
    }
  }, [rooms, roomId]);

  useEffect(() => {
    if (rooms.length > 0) {
      const room = rooms.filter((r) => r.id === parseInt(roomId, 10)).pop();
      if (room) {
        setRoom(room);
      }
    }
  }, [rooms, roomId]);

  useEffect(() => {
    if (room) {
      setActiveRoomId(room.id);
    }
  }, [room]);

  useEffect(() => {
    if (room) {
      setMessageSeen(user.id, room.id, [], true, true);
    }
  }, [room]);

  useEffect(() => {
    if (room && !(room.id in allRoomMessages)) {
      console.log(`Getting messages in room ${room.name}.`);
      getMessages(user.id, [room.id]);
    }
  }, [room, allRoomMessages, getMessages, user.id]);

  useEffect(() => {
    if (room && room.id in allRoomMessages) {
      setMessages(allRoomMessages[room.id]);
    }
  }, [room, allRoomMessages]);

  useEffect(() => {
    if (user && createdSocket && !createdSocketMessageListener) {
      socket.on("message event", (response) => {
        const { status_code, message } = response;
        const seenStatus = activeRoomId === message.room_id;

        if (status_code === 200) {
          addMessageAndSetSeen(user.id, message.room_id, message, seenStatus);
        } else {
          console.error(message);
        }
      });

      setCreatedSocketMessageListener(true);

      return () => {
        socket.removeAllListeners("message event");
      };
    }
  }, [activeRoomId, createdSocket, socket, addMessageAndSetSeen, user]);

  const onSubmit = (event) => {
    event.preventDefault();
    socket.emit("message event", {
      room: room.id,
      sender_id: user.id,
      username: user.username,
      message,
    });

    setMessage("");
  };

  const onChange = (event) => {
    setMessage(event.target.value);
  };

  const getMessageSeenStatus = (message) => {
    return (
      !!message.seens &&
      !!message.seens.find((seen) => seen.user_id === user.id) &&
      message.seens.find((seen) => seen.user_id === user.id).status
    );
  };

  const onClickLeaveAction = () => {
    setShowLeaveRoomModal(true);
  };

  const onClickDeleteAction = () => {
    setShowDeleteRoomModal(true);
  };

  const onHideLeaveRoomModal = () => {
    setShowLeaveRoomModal(false);
  };

  const onHideDeleteRoomModal = () => {
    setShowDeleteRoomModal(false);
  };

  const onConfirmLeaveRoomModal = () => {
    leaveRoom(user.id, room.id);
    setShowLeaveRoomModal(false);
  };

  const onConfirmDeleteRoomModal = () => {
    deleteRoom(user.id, room.id);
    setShowDeleteRoomModal(false);
  };

  if (noRoom) {
    return <Redirect to="/home" />;
  }

  return (
    <div>
      <div>
        Username:
        {user.username}
      </div>
      <div>
        Room:
        {!!room && room.name}
      </div>
      <DropdownButton id="dropdown-basic-button" title="Actions">
        <Dropdown.Item onClick={onClickLeaveAction}>Leave Room</Dropdown.Item>
        {user && room && user.id === room.created_by && (
          <Dropdown.Item onClick={onClickDeleteAction}>
            Delete Room
          </Dropdown.Item>
        )}
      </DropdownButton>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Type a message..."
          name="message"
          value={message}
          onChange={onChange}
        />
        <input type="submit" name="message" value="Submit" />
      </form>
      <div className={styles.messages}>
        {messages.map((message, index) => (
          <div key={index}>
            {message.sender ? message.sender.username : ""}: {message.text}{" "}
            {message.sent_at}
            seen: {getMessageSeenStatus(message) ? "true" : "false"}
          </div>
        ))}
      </div>

      {room && (
        <div>
          <Modal show={showLeaveRoomModal} onHide={onHideLeaveRoomModal}>
            <Modal.Header closeButton>
              <Modal.Title>Leave Room</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <h4>Are you sure you want to leave room {room.name}?</h4>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={onHideLeaveRoomModal}>
                Cancel
              </Button>
              <Button variant="primary" onClick={onConfirmLeaveRoomModal}>
                Confirm
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={showDeleteRoomModal} onHide={onHideDeleteRoomModal}>
            <Modal.Header closeButton>
              <Modal.Title>Delete Room</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <h4>Are you sure you want to delete room {room.name}?</h4>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={onHideDeleteRoomModal}>
                Cancel
              </Button>
              <Button variant="primary" onClick={onConfirmDeleteRoomModal}>
                Confirm
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  user: state.userReducer.user,
  tokens: state.userReducer.tokens,
  rooms: state.roomReducer.rooms,
  messages: state.messageReducer.messages,
  activeRoomId: state.tabReducer.activeRoomId,
});

export default connect(mapStateToProps, {
  getRooms,
  getMessages,
  setActiveRoomId,
  leaveRoom,
  deleteRoom,
  addMessageAndSetSeen,
  setMessageSeen,
})(Room);
