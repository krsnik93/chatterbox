import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";

import { getRooms } from "../redux/middleware/room";
import { getMessages, addMessageAndSetSeen } from "../redux/middleware/message";
import { setActiveRoomId } from "../redux/actions/tab";

import styles from "./Room.module.css";

function Room(props) {
  const { roomId } = useParams();
  const {
    user,
    rooms,
    messages: allRoomMessages,
    getRooms,
    getMessages,
    setActiveRoomId,
    addMessageAndSetSeen,
    activeRoomId,
    socket,
    createdSocket
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
    console.log("active room id changed: ", activeRoomId);
    if (user && createdSocket) {
      console.log("setting message listener");
      socket.on("message event", (response) => {
        const { status_code, message } = response;
        const seenStatus = activeRoomId === message.room_id;
        console.log(123, activeRoomId, message.room_id);
        if (status_code === 200) {
          addMessageAndSetSeen(user.id, message.room_id, seenStatus, message);
        } else {
          console.error(message);
        }
      });

      return () => {
        console.log("clearing message listener");
        socket.removeAllListeners("message event");
      };
    }
  }, [activeRoomId, createdSocket, socket, addMessageAndSetSeen, user]);

  useEffect(() => {
    if (room) {
      setActiveRoomId(room.id);
    }
  }, [room]);

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
            seen: {getMessageSeenStatus(message) ? "true" : "false"}
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
  activeRoomId: state.tabReducer.activeRoomId,
});

export default connect(mapStateToProps, {
  getRooms,
  getMessages,
  setActiveRoomId,
  addMessageAndSetSeen,
})(Room);
