import React, { useContext, useEffect, useState } from "react";
import { Route, Switch, Redirect, useRouteMatch } from "react-router-dom";
import { connect } from "react-redux";
import Tab from "react-bootstrap/Tab";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import Room from "./Room";
import Header from "../components/Header";
import { logoutUser } from "../redux/middleware/user";
import { getRooms, addRoom } from "../redux/middleware/room";
import Sidebar from "../components/Sidebar";
import Welcome from "../screens/Welcome";
import { SocketContext } from "../contexts";
import styles from "./Home.module.css";

function Home(props) {
  const { user, tokens, rooms, getRooms, logoutUser, addRoom } = props;
  const { path } = useRouteMatch();
  const socket = useContext(SocketContext);
  const [fetchedRooms, setFetchedRooms] = useState(false);
  const [joinedRooms, setJoinedRooms] = useState(false);
  const [createdListeners, setCreatedListeners] = useState(false);

  useEffect(() => {
    if (!user) {
      localStorage.removeItem("state.userReducer.user");
      localStorage.removeItem("state.userReducer.tokens");
      logoutUser();
    }
  }, [user, logoutUser]);

  useEffect(() => {
    if (!user || !tokens) return;
    try {
      localStorage.setItem("state.userReducer.user", JSON.stringify(user));
      localStorage.setItem("state.userReducer.tokens", JSON.stringify(tokens));
    } catch (err) {
      console.log(err);
    }
  }, [user, tokens]);

  useEffect(() => {
    if (createdListeners) {
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

    socket.on("room event", (response) => {
      const { status_code, message, room } = response;
      if (status_code === 200) {
        addRoom(room);
      } else {
        console.error(message);
        console.error(response);
      }
    });

    setCreatedListeners(true);

  }, [socket, createdListeners, addRoom]);

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
            <Sidebar />
          </Col>
          <Col sm={9} className={styles.column}>
            <Switch>
              <Route exact path={`${path}`}>
                <Welcome />
              </Route>
              <Route path={`${path}/rooms`}>
                <Route path={`${path}/rooms/:roomId`}>
                  <Room socket={socket} />
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
