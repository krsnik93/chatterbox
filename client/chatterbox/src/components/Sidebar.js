import { useEffect, useState } from "react";
import Nav from "react-bootstrap/Nav";
import { LinkContainer } from "react-router-bootstrap";
import { connect } from "react-redux";
import classNames from "classnames";

import { api } from "../axios";
import { getRooms } from "../redux/middleware/room";
import styles from "./Sidebar.module.css";


function Sidebar(props) {
  const { user, rooms, messages, activeRoomId, socket, getRooms } = props;
  const [unseenMessageCounts, setUnseenMessageCounts] = useState({});

  useEffect(() => {
    if (messages) {
      const counts = Object.fromEntries(
        Object.entries(messages).map(([roomId, msgs]) => [
          roomId,
          msgs.filter(
            (m) =>
              !m.seens ||
              !m.seens.find((s) => s.user_id === user.id) ||
              !m.seens.find((s) => s.user_id === user.id).status
          ).length,
        ])
      );
      setUnseenMessageCounts(counts);
    }
  }, [messages]);

  const getUnseenMessageCountForRoom = (roomId) => {
    return roomId in unseenMessageCounts ? unseenMessageCounts[roomId] : 0;
  };

  return (
    <Nav
        variant="tabs"
        activeKey={activeRoomId?.toString()}
        className={classNames("flex-column", styles.nav)}
    >
      {rooms.map((room, index) => {
        const unseenMessageCount = getUnseenMessageCountForRoom(room.id);

        return (
          <Nav.Item key={index} eventKey={room.id} className={styles.navItem}>
            <LinkContainer className={styles.link}
              to={{
                pathname: `/home/rooms/${room.id}`,
                state: { room },
              }}
            >
              <Nav.Link eventKey={room.id} className={styles.navLink}>
                {room.name} {!!unseenMessageCount && unseenMessageCount}
              </Nav.Link>
            </LinkContainer>
          </Nav.Item>
        );
      })}
    </Nav>
  );
}

const mapStateToProps = (state) => ({
  user: state.userReducer.user,
  rooms: state.roomReducer.rooms,
  messages: state.messageReducer.messages,
  activeRoomId: state.tabReducer.activeRoomId
});

export default connect(mapStateToProps, { getRooms })(Sidebar);
