import React, { useEffect, useState } from "react";
import {
  Route,
  Switch,
  Redirect,
  useRouteMatch,
  useLocation,
} from "react-router-dom";
import { connect } from "react-redux";
import Tab from "react-bootstrap/Tab";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import io from "socket.io-client";

import Room from "./Room";
import { logoutUser } from "../redux/middleware/user";
import { getRooms, addRoom } from "../redux/middleware/room";
import { getMessages, addMessageAndSetSeen } from "../redux/middleware/message";
import Sidebar from "../components/Sidebar";
import { isUserLoggedIn } from "../utils";

const ENDPOINT = "http://127.0.0.1:5000";

function Home(props) {
  const {
    user,
    rooms,
    tokens,
    getRooms,
    logoutUser,
    addMessageAndSetSeen,
    addRoom,
    getMessages,
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
  }, [user]);

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
          console.error(response);
        }
      });

      setSocket(socket);
      setCreatedSocket(true);

      return () => socket.disconnect();
    }
  }, []);

  useEffect(() => {
    if (user && !fetchedRooms) {
      getRooms(user.id).then(() => setFetchedRooms(true));
    }
  }, [user, getRooms]);

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

  useEffect(() => {
    if (user && fetchedRooms) {
      const roomIds = rooms.map((room) => room.id);
      getMessages(user.id, roomIds);
    }
  }, [user, rooms, fetchedRooms]);

  if (!user) return <Redirect to="/login" />;

  return (
    <div>
      <p>Hi {user.username}</p>
      <Tab.Container id="left-tabs-example" defaultActiveKey="first">
        <Row>
          <Col sm={3}>
            <button onClick={logoutUser}>Logout</button>
            <Sidebar socket={socket} />
          </Col>
          <Col sm={9}>
            <Switch>
              <Route exact path={`${path}`}>
                <h3>Welcome.</h3>
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
  addMessageAndSetSeen,
  addRoom,
  getMessages,
})(Home);
