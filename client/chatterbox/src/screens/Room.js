import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";

import { getRooms } from "../redux/middleware/room";
import { getMessages } from "../redux/middleware/message";
import styles from "./Room.module.css";

function Room(props) {
  const { roomId } = useParams();
  const {
    user,
    rooms,
    messages: allRoomMessages,
    getRooms,
    getMessages,
    socket,
  } = props;

  const [room, setRoom] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (user && !rooms.length) {
      getRooms(user.id);
    }
  }, [user, rooms.length, getRooms]);

  useEffect(() => {
    if (rooms.length > 0) {
      const room = rooms.filter((r) => r.id === parseInt(roomId, 10)).pop();
      if (room) {
        setRoom(room);
      }
    }
  }, [rooms, roomId]);

  useEffect(() => {
    if (room && !(room.id in allRoomMessages)) {
      console.log("get messages");
      getMessages(user.id, room.id);
    }
  }, [room, allRoomMessages, getMessages, user.id]);

  useEffect(() => {
    if (room && room.id in allRoomMessages) {
      setMessages(allRoomMessages[room.id]);
    }
  }, [room, allRoomMessages]);

  const onSubmit = (event) => {
    event.preventDefault();

    if (socket) {
      socket.emit("message event", {
        room: room.id,
        sender_id: user.id,
        username: user.username,
        message,
      });
    }
    setMessage("");
  };

  const onChange = (event) => {
    setMessage(event.target.value);
  };

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
          </div>
        ))}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  user: state.userReducer.user,
  tokens: state.userReducer.tokens,
  rooms: state.roomReducer.rooms,
  messages: state.messageReducer.messages,
});

export default connect(mapStateToProps, { getRooms, getMessages })(Room);
