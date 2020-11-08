import React, { useEffect, useState } from "react";
import {
  Router,
  Route,
  Switch,
  Redirect,
  useRouteMatch,
} from "react-router-dom";
import { connect } from "react-redux";
import Tab from "react-bootstrap/Tab";
import Nav from "react-bootstrap/Nav";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import Room from "./Room";
import { logoutUser } from "../redux/middleware/user";
import { getRooms } from "../redux/middleware/room";
import Sidebar from "../components/Sidebar";
import { api, isUserLoggedIn } from "../utils";

function Home(props) {
  const { user, tokens, getRooms, logoutUser } = props;
  let { path } = useRouteMatch();

  useEffect(() => {
    if (user) {
      getRooms(user.id);
    }
  }, [user]);

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
});

export default connect(mapStateToProps, { getRooms, logoutUser })(Home);
