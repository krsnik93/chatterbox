import React, { useEffect, useState } from "react";
import {
  Route,
  Switch,
  Redirect,
  useRouteMatch,
} from "react-router-dom";
import { connect } from "react-redux";
import Tab from "react-bootstrap/Tab";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import io from "socket.io-client";

import Room from "./Room";
import Header from "../components/Header";
import { logoutUser } from "../redux/middleware/user";
import { getRooms, addRoom } from "../redux/middleware/room";
import Sidebar from "../components/Sidebar";
import Welcome from "../screens/Welcome";
import styles from "./Home.module.css";

const ENDPOINT = "http://127.0.0.1:5000";

function Home(props) {
  const {
    user,
    rooms,
    getRooms,
    logoutUser,
    addRoom,
  } = props;
  const { path } = useRouteMatch();
  const [socket, setSocket] = useState(null);
  const [fetchedRooms, setFetchedRooms] = useState(false);
  const [joinedRooms, setJoinedRooms] = useState(false);
  const [createdSocket, setCreatedSocket] = useState(false);

  useEffect(() => {
    if (!user) {
      logoutUser();
    }
  }, [user, logoutUser]);

  useEffect(() => {
    if (!createdSocket) {
      const socket = io(ENDPOINT);
      socket.on("connect", (data) => {
        if (data !== undefined) {
          console.log(data.data);
        }
      });

      socket.on("join", (data) => {
        if (data !== undefined) {
          //console.log(data.data);
        }
      });

      socket.on("leave", (data) => {
        if (data !== undefined) {
          //console.log(data.data);
        }
      });

      socket.on("room event", (response) => {
        const { status_code, message, room } = response;
        if (status_code === 200) {
          addRoom(room);
        } else {
          console.error(message);
          console.error(response);
        }
      });

      setSocket(socket);
      setCreatedSocket(true);

      return () => socket.disconnect();
    }
  }, [createdSocket, addRoom]);

  useEffect(() => {
    if (user && !fetchedRooms) {
      getRooms(user.id).then(() => setFetchedRooms(true));
    }
  }, [user, fetchedRooms, getRooms]);

  useEffect(() => {
    if (socket && user && fetchedRooms && !joinedRooms) {
      console.log(`Joining ${rooms.length} rooms.`);
      for (const room of rooms) {
        socket.emit("join", { username: user.username, room: room.id });
      }
      socket.emit("join", { username: user.username, room: user.username });
      setJoinedRooms(true);
    }
  }, [socket, user, rooms, fetchedRooms, joinedRooms]);

  if (!user) return <Redirect to="/login" />;

  return (
    <div>
      <Header socket={socket} />
      <Tab.Container id="left-tabs-example" defaultActiveKey="first">
        <Row className={styles.row}>
          <Col sm={3} className={styles.column}>
            <Sidebar socket={socket} />
          </Col>
          <Col sm={9} className={styles.column}>
            <Switch>
              <Route exact path={`${path}`}>
                <Welcome />
              </Route>
              <Route path={`${path}/rooms`}>
                <Route path={`${path}/rooms/:roomId`}>
                  <Room socket={socket} createdSocket={createdSocket} />
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
})(Home);
