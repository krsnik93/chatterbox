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
import { logoutUser } from "../redux/middleware/user";
import { getRooms } from "../redux/middleware/room";
import { appendMessage } from "../redux/middleware/message";
import Sidebar from "../components/Sidebar";
import { isUserLoggedIn } from "../utils";

const ENDPOINT = "http://127.0.0.1:5000";


function Home(props) {
  const { user, rooms, tokens, getRooms, logoutUser, appendMessage } = props;
  const [sockets, setSockets] = useState({});

  let { path } = useRouteMatch();

  useEffect(() => {
    if (user) {
      getRooms(user.id);
    }
  }, [user, getRooms]);

  useEffect(() => {
    const sockets = {};
    for (const room of rooms) {
        const socket = io(ENDPOINT, { username: user.username, room: room.id });

        socket.on("connect", (data) => {
        if (data !== undefined) {
          //console.log(data.data);
        }
        socket.emit("join", { username: user.username, room: room.id });
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

      socket.on("chat message", response => {
        const {status_code, message} = response;
        if (status_code === 200) {
            appendMessage(message);
        }
        else {
            console.error(message);
        }
      });

    sockets[room.id] = socket;
    }
    setSockets(sockets);
  }, [rooms, user.username, appendMessage])

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
            <Sidebar />
          </Col>
          <Col sm={9}>
            <Switch>
              <Route exact path={`${path}`}>
                <h3>Welcome.</h3>
              </Route>
              <Route path={`${path}/rooms`}>
                <Route path={`${path}/rooms/:roomId`}>
                  <Room sockets={sockets} />
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

export default connect(mapStateToProps, { getRooms, logoutUser, appendMessage })(Home);
