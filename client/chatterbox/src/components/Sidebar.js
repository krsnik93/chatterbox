import { useEffect, useState, useRef, useContext } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { connect } from "react-redux";
import Nav from "react-bootstrap/Nav";
import Spinner from "react-bootstrap/Spinner";
import Badge from "react-bootstrap/Badge";
import classNames from "classnames";
import { toast } from "react-toastify";

import { SocketContext } from "../contexts";
import { setCountsSuccess, setCountsFailure } from "../redux/actions/unseen";
import { getRooms } from "../redux/middleware/room";
import { sortRooms } from "../redux/actions/room";
import { getMessages } from "../redux/middleware/message";
import { getMemberships } from "../redux/middleware/membership";
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
    memberships,
    activeRoomId,
    getRooms,
    getMemberships,
    getMessages,
    setCountsSuccess,
    setCountsFailure,
    sortRooms,
  } = props;

  const [hasMoreRooms, setHasMoreRooms] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [joinedRooms, setJoinedRooms] = useState({});
  const [createdListener, setCreatedListener] = useState(false);
  const [fetchedInitMsgs, setFetchedInitMsgs] = useState(false);
  const roomsRef = useRef();

  useEffect(() => {
    if (!socket || createdListener) {
      return;
    }

    socket.on("unseen messages", (response) => {
      const { error } = response;
      if (error) setCountsFailure(error);
      else setCountsSuccess(response);
    });

    setCreatedListener(true);
  }, [
    socket,
    createdListener,
    setCreatedListener,
    setCountsFailure,
    setCountsSuccess,
  ]);

  useEffect(() => {
    if (!error) return;
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
    getRooms({ userId: user.id, page: pg });
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
    if (!user) return;
    getMemberships(user.id);
  }, [user, getMemberships]);

  useEffect(() => {
    if (!socket || !user || !memberships) return;
    const newJoinedRooms = {};
    for (const membership of memberships) {
      if (!(membership in joinedRooms)) {
        socket.emit("join", { username: user.username, room: membership });
        newJoinedRooms[membership] = true;
      }
    }
    if (!(user.username in joinedRooms)) {
      socket.emit("join", { username: user.username, room: user.username });
      newJoinedRooms[user.username] = true;
    }
    setJoinedRooms((joinedRooms) => ({ ...joinedRooms, ...newJoinedRooms }));
  }, [socket, user, memberships, setJoinedRooms]);

  useEffect(() => {
    if (!rooms.length || fetchedInitMsgs) return;
    getMessages(
      user.id,
      rooms.map((room) => room.id),
      1
    );
    setFetchedInitMsgs(true);
  }, [rooms, getMessages, fetchedInitMsgs, setFetchedInitMsgs]);

  useEffect(() => {
    if (!socket || !user) return;
    console.log("fetching unseen message");
    socket.emit("unseen messages", {
      userId: user.id,
      roomIds: rooms.map((room) => room.id),
    });
  }, [messages, rooms.length, socket, user]);

  useEffect(() => {
    if (!sortRooms) return;
    console.log("Reordering rooms.");
    sortRooms(messages, counts);
  }, [counts, sortRooms]);

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
                    {counts[room.id].count}
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
      <div key={"bottom"}></div>
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
  memberships: state.membershipReducer.memberships,
});

export default connect(mapStateToProps, {
  getRooms,
  getMemberships,
  getMessages,
  setCountsFailure,
  setCountsSuccess,
  sortRooms,
})(Sidebar);
