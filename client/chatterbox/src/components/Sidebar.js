import { useEffect, useState, useRef, useContext } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { connect } from "react-redux";
import Nav from "react-bootstrap/Nav";
import Spinner from "react-bootstrap/Spinner";
import Badge from "react-bootstrap/Badge";
import classNames from "classnames";

import { SocketContext } from "../contexts";
import { getRooms } from "../redux/middleware/room";
import styles from "./Sidebar.module.css";

function Sidebar(props) {
  const socket = useContext(SocketContext);
  const {
    user,
    rooms,
    loading,
    page,
    pageCount,
    messages,
    activeRoomId,
    getRooms,
  } = props;
  const [unseenMessageCounts, setUnseenMessageCounts] = useState({});
  const [hasMoreRooms, setHasMoreRooms] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [joinedRooms, setJoinedRooms] = useState({});
  const bottomRef = useRef();
  const roomsRef = useRef();

  useEffect(() => {
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
    if (!user || loading || !hasMoreRooms) return;
    const pg = page + 1 || 1;
    if (pageCount && pg > pageCount) return;
    if (pageCount && !isAtBottom) return;
    console.log(`Getting page ${pg} of rooms.`);
    getRooms(user.id, pg);
    return () => setIsAtBottom(false);
  }, [user, page, pageCount, loading, isAtBottom, hasMoreRooms, getRooms]);

  useEffect(() => {
    if (socket && user && page) {
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
    }
  }, [socket, user, rooms]);

  useEffect(() => {
    if (messages) {
      //      const counts = Object.fromEntries(
      //        Object.entries(messages).map(([roomId, msgs]) => [
      //          roomId,
      //          msgs.filter(
      //            (m) =>
      //              !m.seens ||
      //              !m.seens.find((s) => s.user_id === user.id) ||
      //              !m.seens.find((s) => s.user_id === user.id).status
      //          ).length,
      //        ])
      //      );
      //      setUnseenMessageCounts(counts);
    }
  }, [user.id, messages]);

  const getUnseenMessageCountForRoom = (roomId) => {
    return roomId in unseenMessageCounts ? unseenMessageCounts[roomId] : 0;
  };

  return (
    <Nav
      variant="tabs"
      activeKey={activeRoomId?.toString()}
      className={classNames("flex-column", styles.nav)}
      onScroll={onScroll}
      ref={roomsRef}
    >
      {rooms.map((room, index) => {
        const unseenMessageCount = getUnseenMessageCountForRoom(room.id);

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
                {!!unseenMessageCount && (
                  <Badge pill className={styles.badge} variant="secondary">
                    {unseenMessageCount}
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
  loading: state.roomReducer.loading,
  page: state.roomReducer.page,
  pageCount: state.roomReducer.pageCount,
  messages: state.messageReducer.messages,
  activeRoomId: state.tabReducer.activeRoomId,
});

export default connect(mapStateToProps, { getRooms })(Sidebar);
