import React, { useContext, useEffect, useState, useRef } from "react";
import { Route, Switch, Redirect, useRouteMatch } from "react-router-dom";
import { connect } from "react-redux";
import Tab from "react-bootstrap/Tab";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { toast } from "react-toastify";
import { useIdleTimer } from "react-idle-timer";

import Room from "./Room";
import Header from "../components/Header";
import { logoutUser } from "../redux/middleware/user";
import { getRooms, addRoom } from "../redux/middleware/room";
import { addMessageAndSetSeen } from "../redux/middleware/message";
import Sidebar from "../components/Sidebar";
import Welcome from "../screens/Welcome";
import { SocketContext } from "../contexts";
import styles from "./Home.module.css";

function Home(props) {
  const {
    user,
    rooms,
    tokens,
    logoutUser,
    addRoom,
    addMessageAndSetSeen,
    getRooms,
  } = props;
  const { path } = useRouteMatch();
  const socket = useContext(SocketContext);
  const [createdListeners, setCreatedListeners] = useState(false);
  const { getRemainingTime, getLastActiveTime } = useIdleTimer({
    timeout: 1000 * 60 * 15,
    onIdle: logoutUser,
    debounce: 500,
  });

  useEffect(() => {
    if (!user || createdListeners) {
      return;
    }

    socket.on("connect", (data) => {
      console.log(data);
    });

    socket.on("disconnect", (data) => {
      console.log(data);
    });

    socket.on("join", (data) => {
      if (data !== undefined) {
        console.log(data);
      }
    });

    socket.on("leave", (data) => {
      if (data !== undefined) {
        console.log(data);
      }
    });

    setCreatedListeners(true);
  }, [user, socket, createdListeners, addRoom, addMessageAndSetSeen]);

  useEffect(() => {
    if (!socket) return;
    socket.on("room event", (response) => {
      console.log(response);
      const { status_code, message, room } = response;
      if (status_code === 200) {
        addRoom(room).then((roomOrNull) => {
          if (roomOrNull) {
            toast.success(`Successfully added room '${roomOrNull.name}'.`);
          }
        });
      } else {
        console.error(message);
        toast.error(message);
      }
    });
  }, [socket, addRoom]);

  useEffect(() => {
    if (!user || !socket) return;
    socket.off("message event");
    socket.on("message event", (response) => {
      const match = window.location.pathname.match(/\/rooms\/(\d+)/);
      const activeRoomId = match && match[1] ? parseInt(match[1]) : null;
      const { status_code, message } = response;
      const seen = activeRoomId === message.room_id;
      if (status_code === 200) {
        addMessageAndSetSeen(user.id, message.room_id, message, seen);
        if (rooms.filter((room) => room.id === message.room_id).length === 0) {
          getRooms({ userId: user.id, idsToFetch: [message.room_id] });
        }
      } else {
        console.error(message);
        toast.error(message);
      }
    });
  }, [user, socket, rooms, addMessageAndSetSeen, getRooms]);

  if (!user) return <Redirect to="/login" />;

  return (
    <div>
      <Header socket={socket} />
      <Tab.Container id="left-tabs-example" defaultActiveKey="first">
        <Row className={styles.row}>
          <Col sm={3} className={styles.column}>
            <Sidebar />
          </Col>
          <Col sm={9} className={styles.column}>
            <Switch>
              <Route exact path={`${path}`}>
                <Welcome />
              </Route>
              <Route path={`${path}/rooms`}>
                <Route path={`${path}/rooms/:roomId`}>
                  <Room />
                </Route>
              </Route>
              <Route path={`${path}/users`}>Users</Route>
            </Switch>
          </Col>
        </Row>
      </Tab.Container>
    </div>
  );
}

const mapStateToProps = (state) => ({
  user: state.userReducer.user,
  tokens: state.userReducer.tokens,
  rooms: state.roomReducer.rooms,
  activeRoomId: state.tabReducer.tab,
});

export default connect(mapStateToProps, {
  getRooms,
  logoutUser,
  addRoom,
  addMessageAndSetSeen,
})(Home);
