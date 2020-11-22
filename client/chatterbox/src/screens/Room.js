import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import { useParams, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Spinner from "react-bootstrap/Spinner";

import { leaveRoom, deleteRoom } from "../redux/middleware/room";
import {
  getMessages,
  addMessageAndSetSeen,
  setMessageSeen,
} from "../redux/middleware/message";
import { setActiveRoomId } from "../redux/actions/tab";
import RoomHeader from "../components/RoomHeader";
import MessageItem from "../components/MessageItem";
import { SocketContext } from "../contexts";
import styles from "./Room.module.css";

function Room(props) {
  const { roomId } = useParams();
  const {
    user,
    rooms,
    messages: allRoomMessages,
    loading: messagesLoading,
    pages,
    pageCounts,
    leaveRoom,
    deleteRoom,
    getMessages,
    setActiveRoomId,
    addMessageAndSetSeen,
    setMessageSeen,
    activeRoomId,
  } = props;

  const socket = useContext(SocketContext);
  const [room, setRoom] = useState(null);
  const [noRoom, setNoRoom] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isAtTop, setIsAtTop] = useState(false);
  const [createdMessageListener, setCreatedMessageListener] = useState(false);
  const [loadedInitially, setLoadedInitially] = useState(false);
  const bottomRef = useRef();
  const messagesRef = useRef();

  useEffect(() => {
    const matchingRooms = rooms.filter(
      (room) => room.id === parseInt(roomId, 10)
    );
    if (matchingRooms.length === 0) {
      setNoRoom(true);
    } else if (matchingRooms.length > 0) {
      const room = matchingRooms.pop();
      setRoom(room);
    }
  }, [rooms, roomId]);

  useEffect(() => {
    if (room) {
      setActiveRoomId(room.id);
    }
  }, [room, setActiveRoomId]);

  useEffect(() => {
    if (room) {
      setMessageSeen(user.id, room.id, [], true, true);
    }
  }, [user.id, room, setMessageSeen]);

  useEffect(() => {
    if (room && room.id in allRoomMessages) {
      setMessages(allRoomMessages[room.id]);
    }
  }, [room, allRoomMessages]);

  useEffect(() => {
    if (!activeRoomId || createdMessageListener) {
      return;
    }

    socket.on("message event", (response) => {
      const { status_code, message } = response;
      const seenStatus = activeRoomId === message.room_id;
      if (status_code === 200) {
        addMessageAndSetSeen(user.id, message.room_id, message, seenStatus);
      } else {
        console.error(message);
      }
    });

    setCreatedMessageListener(true);
  }, [
    user,
    socket,
    createdMessageListener,
    activeRoomId,
    addMessageAndSetSeen,
  ]);

  useEffect(() => {
    if (!room) {
      return;
    }
    const hasMoreMessages = pages?.[room?.id] < pageCounts?.[room?.id];
    setHasMoreMessages(hasMoreMessages);
  }, [room, pages, pageCounts]);

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

  const onConfirmLeave = () => {
    leaveRoom(user.id, room.id);
  };

  const onConfirmDelete = () => {
    deleteRoom(user.id, room.id);
  };

  const scrollToBottom = useCallback(() => {
    if (!bottomRef.current) {
      return;
    }
    bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [bottomRef]);

  useEffect(() => {
    if (!room || !(room.id in pages)) return;

    if (pages?.[room.id] === 1) {
      scrollToBottom();
    } else {
      messagesRef.current.scrollTop = 50;
      setIsAtTop(false);
    }
  }, [messages, pages, room, scrollToBottom]);

  const loadMoreMessages = useCallback(() => {
    if (!user || !room || messagesLoading) {
      return;
    }

    if (loadedInitially && !isAtTop) {
        return;
    }

    const page = room.id in pages ? pages[room.id] + 1 : 1;
    if (page > pageCounts?.[room.id]) {
      return;
    }

    console.log(`Getting page ${page} messages for room ${room.id}.`);
    getMessages(user.id, room.id, page);

  }, [user, room, messagesLoading, isAtTop, pages, pageCounts, loadedInitially, getMessages]);

  useEffect(() => {
    if (!room || loadedInitially) return;
    loadMoreMessages();
    setLoadedInitially(true);
  }, [room, loadMoreMessages, loadedInitially]);

  const onScroll = (e) => {
    setIsAtTop(e.target.scrollTop === 0);
  };

  useEffect(() => {
    if (isAtTop && hasMoreMessages) {
      loadMoreMessages();
    }
    return (() => setIsAtTop(false));
  }, [isAtTop, hasMoreMessages, loadMoreMessages]);

  if (noRoom) {
    return <Redirect to="/home" />;
  }

  return (
    <div>
      <RoomHeader
        user={user}
        room={room}
        onConfirmLeave={onConfirmLeave}
        onConfirmDelete={onConfirmDelete}
      />
      <div className={styles.chat}>
        <div className={styles.messages} onScroll={onScroll} ref={messagesRef}>
          <div>
            {messagesLoading && (
              <div className={styles.spinnerContainer}>
                <Spinner animation="border" role="status" key={"spinner"}>
                  <span className="sr-only">Loading...</span>
                </Spinner>
              </div>
            )}
            {!hasMoreMessages && (
              <div className={styles.chatBeginning}>(Beginning of chat)</div>
            )}
            {messages.map((message, index) => (
              <MessageItem key={index} message={message} user={user} />
            ))}
          </div>
          <div ref={bottomRef} key={"bottom"}></div>
        </div>

        <Form onSubmit={onSubmit}>
          <InputGroup className="mb-3">
            <Form.Control
              name="message"
              type="text"
              placeholder="Type a Message..."
              value={message}
              onChange={onChange}
            />
            <InputGroup.Append>
              <Button type="submit" variant="dark" onClick={onSubmit}>
                Send!
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Form>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  user: state.userReducer.user,
  tokens: state.userReducer.tokens,
  rooms: state.roomReducer.rooms,
  messages: state.messageReducer.messages,
  loading: state.messageReducer.loading,
  pages: state.messageReducer.pages,
  pageCounts: state.messageReducer.pageCounts,
  activeRoomId: state.tabReducer.activeRoomId,
});

export default connect(mapStateToProps, {
  getMessages,
  setActiveRoomId,
  leaveRoom,
  deleteRoom,
  addMessageAndSetSeen,
  setMessageSeen,
})(Room);
