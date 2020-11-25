import { useEffect, useState, useRef, useContext } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { connect } from "react-redux";
import Nav from "react-bootstrap/Nav";
import Spinner from "react-bootstrap/Spinner";
import Badge from "react-bootstrap/Badge";
import classNames from "classnames";
import { toast } from "react-toastify";

import { SocketContext } from "../contexts";
import { getCountsSuccess, getCountsFailure } from "../redux/actions/unseen";
import { getRooms } from "../redux/middleware/room";
import styles from "./Sidebar.module.css";

function Sidebar(props) {
  const socket = useContext(SocketContext);
  const {
    user,
    rooms,
    loading,
    error,
    page,
    pageCount,
    messages,
    counts,
    activeRoomId,
    getRooms,
    getCountsSuccess,
    getCountsFailure,
  } = props;

  const [hasMoreRooms, setHasMoreRooms] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [joinedRooms, setJoinedRooms] = useState({});
  const [
    createdUnseenMessagesListener,
    setCreatedUnseenMessagesListener,
  ] = useState(false);
  const bottomRef = useRef();
  const roomsRef = useRef();

  useEffect(() => {
    if (!error) return;
    console.log("error");
    toast.error(error);
  }, [error]);

  useEffect(() => {
    if (!pageCount) return;
    setHasMoreRooms(!page || !pageCount || page < pageCount);
  }, [page, pageCount]);

  useEffect(() => {
    if (!page || page === 1) {
      roomsRef.current.scrollTo(0, 0);
    } else {
      roomsRef.current.scrollTo(0, roomsRef.current.scrollHeight * (3 / 4));
    }
  }, [rooms, page]);

  const onScroll = (e) => {
    setIsAtBottom(
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight
    );
  };

  useEffect(() => {
    if (!user || loading || error || !hasMoreRooms) return;
    const pg = page + 1 || 1;
    if (pageCount && pg > pageCount) return;
    if (pageCount && !isAtBottom) return;
    console.log(`Getting page ${pg} of rooms.`);
    getRooms(user.id, pg);
    return () => setIsAtBottom(false);
  }, [
    user,
    page,
    pageCount,
    loading,
    error,
    isAtBottom,
    hasMoreRooms,
    getRooms,
  ]);

  useEffect(() => {
    if (!socket || !user || !rooms.length) return;
    const newJoinedRooms = {};
    for (const room of rooms) {
      if (!(room.id in joinedRooms)) {
        socket.emit("join", { username: user.username, room: room.id });
        newJoinedRooms[room.id] = true;
      }
    }
    if (!(user.username in joinedRooms)) {
      socket.emit("join", { username: user.username, room: user.username });
      newJoinedRooms[user.username] = true;
    }
    setJoinedRooms((joinedRooms) => ({ ...joinedRooms, ...newJoinedRooms }));
  }, [socket, user, rooms, setJoinedRooms]);

  useEffect(() => {
    if (!socket || createdUnseenMessagesListener) {
      return;
    }

    socket.on("unseen messages", (response) => {
      const { error } = response;
      if (error) getCountsFailure(error);
      else getCountsSuccess(response);
    });

    setCreatedUnseenMessagesListener(true);
  }, [
    socket,
    createdUnseenMessagesListener,
    getCountsFailure,
    getCountsSuccess,
  ]);

  useEffect(() => {
    if (!socket || !user || !rooms.length) return;
    socket.emit("unseen messages", {
      userId: user.id,
      roomIds: rooms.map((room) => room.id),
      operation: "set",
    });
  }, [rooms, messages, socket, user]);

  useEffect(() => {
    console.log("messages changed");
  }, [messages]);

  useEffect(() => {
    console.log("counts changed");
    console.log(counts);
  }, [counts]);

  return (
    <Nav
      variant="tabs"
      activeKey={activeRoomId?.toString()}
      className={classNames("flex-column", styles.nav)}
      onScroll={onScroll}
      ref={roomsRef}
    >
      {rooms.map((room, index) => {
        return (
          <Nav.Item key={index} className={styles.navItem}>
            <LinkContainer
              className={styles.link}
              to={{
                pathname: `/home/rooms/${room.id}`,
                state: { room },
              }}
            >
              <Nav.Link eventKey={room.id} className={styles.navLink}>
                {room.name}{" "}
                {!!counts?.[room.id] && (
                  <Badge pill className={styles.badge} variant="secondary">
                    {counts[room.id]}
                  </Badge>
                )}
              </Nav.Link>
            </LinkContainer>
          </Nav.Item>
        );
      })}
      {loading && (
        <div className={styles.spinnerContainer}>
          <Spinner animation="border" role="status" key={"spinner"}>
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      )}
      <div ref={bottomRef} key={"bottom"}></div>
    </Nav>
  );
}

const mapStateToProps = (state) => ({
  user: state.userReducer.user,
  rooms: state.roomReducer.rooms,
  loading: state.roomReducer.loadingGet,
  error: state.roomReducer.errorGet,
  page: state.roomReducer.page,
  pageCount: state.roomReducer.pageCount,
  counts: state.unseenReducer.counts,
  messages: state.messageReducer.messages,
  activeRoomId: state.tabReducer.activeRoomId,
});

export default connect(mapStateToProps, {
  getRooms,
  getCountsFailure,
  getCountsSuccess,
})(Sidebar);
