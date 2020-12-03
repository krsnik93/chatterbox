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
import { toast } from "react-toastify";

import { leaveRoom, deleteRoom } from "../redux/middleware/room";
import { getMessages, setMessageSeen } from "../redux/middleware/message";
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
    moreToFetch,
    loadingGetMessages,
    errorGetMessages,
    errorAddMessage,
    errorSetSeenMessage,
    leaveRoom,
    deleteRoom,
    getMessages,
    setActiveRoomId,
    setMessageSeen,
  } = props;

  const socket = useContext(SocketContext);
  const [room, setRoom] = useState(null);
  const [noRoom, setNoRoom] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [scrolledToBottomInitially, setScrolledToBottomInitially] = useState(
    false
  );
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
    if (!room) return;
    setMessages([room.id] in allRoomMessages ? allRoomMessages[room.id] : []);
  }, [room, allRoomMessages]);

  useEffect(() => {
    if (room) {
      console.log("setting messages seen");
      setMessageSeen(user.id, room.id, [], true, true);
    }
  }, [user.id, room, setMessageSeen]);

  useEffect(() => {
    if (!room) return;
    setHasMoreMessages(!(room.id in moreToFetch) || moreToFetch[room.id]);
  }, [room, moreToFetch]);

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
    leaveRoom(user.id, room.id).then((status) => {
      if (status) {
        socket.emit("leave", { username: user.username, room: room.id });
        toast.success("Successfully left room.");
      }
    });
  };

  const onConfirmDelete = () => {
    deleteRoom(user.id, room.id).then((status) => {
      if (status) {
        socket.emit("leave", { username: user.username, room: room.id });
        toast.success("Successfully deleted room.");
      }
    });
  };

  const scrollToBottom = useCallback(() => {
    if (!bottomRef.current) {
      return;
    }
    bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [bottomRef]);

  useEffect(() => {
    if (!room || !(room.id in moreToFetch)) return;

    if (!scrolledToBottomInitially) {
      console.log("Scrolling to bottom.");
      scrollToBottom();
      setScrolledToBottomInitially(true);
    } else {
      console.log("Scrolling to almost top.");
      messagesRef.current.scrollTop = 50;
      setIsAtTop(false);
    }
  }, [messages.length]);

  useEffect(() => {
    if (
      !user ||
      !room ||
      loadingGetMessages ||
      !hasMoreMessages ||
      (hasMoreMessages && !isAtTop)
    ) {
      return;
    }

    console.log("Getting a batch of messages.");

    getMessages(
      user.id,
      [room.id],
      [
        messages.length > 0
          ? Math.min(...messages.map((m) => new Date(m.sent_at)))
          : "",
      ]
    );

    return () => setIsAtTop(false);
  }, [
    user,
    room,
    loadingGetMessages,
    isAtTop,
    moreToFetch,
    getMessages,
    hasMoreMessages,
  ]);

  const onScroll = (e) => {
    setIsAtTop(e.target.scrollTop === 0);
  };

  useEffect(() => {
    if (!errorGetMessages) return;
    console.log("errorGetMessages");
    toast.error(errorGetMessages);
  }, [errorGetMessages]);

  useEffect(() => {
    if (!errorAddMessage) return;
    console.log("errorAddMessage");
    toast.error(errorAddMessage);
  }, [errorAddMessage]);

  useEffect(() => {
    if (!errorSetSeenMessage) return;
    console.log("errorSetSeenMessage");
    toast.error(errorSetSeenMessage);
  }, [errorSetSeenMessage]);

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
            {loadingGetMessages && (
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
  moreToFetch: state.messageReducer.moreToFetch,
  loadingGetMessages: state.messageReducer.loadingGet,
  errorGetMessages: state.messageReducer.errorGet,
  errorAddMessage: state.messageReducer.errorAdd,
  errorSetSeenMessage: state.messageReducer.errorSetSeen,
  activeRoomId: state.tabReducer.activeRoomId,
});

export default connect(mapStateToProps, {
  getMessages,
  setActiveRoomId,
  leaveRoom,
  deleteRoom,
  setMessageSeen,
})(Room);
