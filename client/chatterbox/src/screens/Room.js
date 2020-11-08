import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import io from "socket.io-client";
import { connect } from "react-redux";

import { getRooms } from "../redux/middleware/room";
import { getMessages } from "../redux/middleware/message";
import styles from "./Room.module.css";

const ENDPOINT = "http://127.0.0.1:5000";

function Room(props) {
  const { roomId } = useParams();
  const { user, rooms, messages: allRoomMessages, getRooms, getMessages } = props;
  console.log(allRoomMessages);
  const [room, setRoom] = useState(null);
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (user && !rooms.length) {
      getRooms(user.id);
    }
  }, [user, rooms]);

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
        getMessages(user.id, room.id);
    }
  }, [room]);

  useEffect(() => {
    if (room) {
      const socket = io(ENDPOINT, { username: user.username, room: room.id });
      setSocket(socket);
    }
  }, [room]);

  useEffect(() => {
    if (room && room.id in allRoomMessages){
        setMessages(allRoomMessages[room.id]);
    }
  }, [room, allRoomMessages]);

  useEffect(() => {
    if (socket) {
      socket.on("connect", (data) => {
        if (data !== undefined) {
          console.log(data.data);
        }
        socket.emit("join", { username: user.username, room: room.id });
      });

      socket.on("join", (data) => {
        if (data !== undefined) {
          console.log(data.data);
        }
      });

      socket.on("leave", (data) => {
        if (data !== undefined) {
          console.log(data.data);
        }
      });

      socket.on("chat message", (newMessage) => {
        console.log(newMessage);
        console.log("new message received");
        console.log(messages);
        console.log([...messages, newMessage]);
        setMessages((messages) => messages.concat(newMessage));
      });

      return () => socket.disconnect();
    }
  }, [socket]);

  const onSubmit = (event) => {
    event.preventDefault();
    if (socket) {
      socket.emit("chat message", {
        room: room.id,
        sender_id: user.id,
        username: user.username,
        message });
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
          <div key={index}>{message.text}</div>
        ))}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  user: state.userReducer.user,
  tokens: state.userReducer.tokens,
  rooms: state.roomReducer.rooms,
  messages: state.messageReducer.messages
});

export default connect(mapStateToProps, { getRooms, getMessages })(Room);
