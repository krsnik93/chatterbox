import React, { useEffect } from "react";
import { Route, Switch, Redirect, useRouteMatch } from "react-router-dom";
import { connect } from "react-redux";
import Tab from "react-bootstrap/Tab";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import io from "socket.io-client";

import Room from "./Room";
import { logoutUser } from "../redux/middleware/user";
import { getRooms, addRoom } from "../redux/middleware/room";
import { appendMessage } from "../redux/middleware/message";
import Sidebar from "../components/Sidebar";
import { isUserLoggedIn } from "../utils";

const ENDPOINT = "http://127.0.0.1:5000";


function Home(props) {
  const { user, rooms, tokens, getRooms, logoutUser, appendMessage, addRoom } = props;
  let { path } = useRouteMatch();

  const socket = io(ENDPOINT);

  socket.on("connect", (data) => {
    if (data !== undefined) {
      //console.log(data.data);
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
    console.log(response);
    const { status_code, message, room } = response;
    if (status_code === 200) {
        addRoom(room);
    } else {
      console.error(response);
    }
  });

  socket.on("message event", (response) => {
    const { status_code, message } = response;
    if (status_code === 200) {
      appendMessage(message);
    } else {
      console.error(message);
    }
  });

  useEffect(() => {
    if (user) {
      getRooms(user.id);
    }
  }, [user, getRooms]);

  useEffect(() => {
    if (user) {
        socket.emit('join', {username: user.username, room: user.username});
    }
  }, [user])

  useEffect(() => {
    for (const room of rooms) {
        socket.emit('join', {username: user.username, room: room.id});
    }
  }, [rooms])

  if (!user || !isUserLoggedIn(tokens)) {
    logoutUser();
    return <Redirect to="/login" />;
  }

  return (
    <div>
      <p>Hi {user.username}</p>
      <Tab.Container id="left-tabs-example" defaultActiveKey="first">
        <Row>
          <Col sm={3}>
            <Sidebar socket={socket} />
          </Col>
          <Col sm={9}>
            <Switch>
              <Route exact path={`${path}`}>
                <h3>Welcome.</h3>
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
});

export default connect(mapStateToProps, {
  getRooms,
  logoutUser,
  appendMessage,
  addRoom,
})(Home);
