import { useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";

import LeaveRoomModal from "./LeaveRoomModal";
import DeleteRoomModal from "./DeleteRoomModal";
import styles from "./RoomHeader.module.css";

const RoomHeader = (props) => {
  const { user, room, onConfirmLeave, onConfirmDelete } = props;
  const [showLeaveRoomModal, setShowLeaveRoomModal] = useState(false);
  const [showDeleteRoomModal, setShowDeleteRoomModal] = useState(false);

  const onClickLeaveAction = () => {
    setShowLeaveRoomModal(true);
  };

  const onClickDeleteAction = () => {
    setShowDeleteRoomModal(true);
  };

  const onHideLeaveRoomModal = () => {
    setShowLeaveRoomModal(false);
  };

  const onHideDeleteRoomModal = () => {
    setShowDeleteRoomModal(false);
  };

  const onConfirmLeaveRoomModal = () => {
    onConfirmLeave();
    setShowLeaveRoomModal(false);
  };

  const onConfirmDeleteRoomModal = () => {
    onConfirmDelete();
    setShowDeleteRoomModal(false);
  };

  return (
    <>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand className={styles.roomName}>{room?.name}</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="ml-auto">
            <NavDropdown title="Actions" alignRight>
              <NavDropdown.Item onClick={onClickLeaveAction}>
                Leave Room
              </NavDropdown.Item>
              {user?.id === room?.created_by && (
                <NavDropdown.Item onClick={onClickDeleteAction}>
                  Delete Room
                </NavDropdown.Item>
              )}
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <div>
        <LeaveRoomModal
          show={showLeaveRoomModal}
          onHide={onHideLeaveRoomModal}
          onCancel={onHideLeaveRoomModal}
          onConfirm={onConfirmLeaveRoomModal}
          room={room}
        />

        <DeleteRoomModal
          show={showDeleteRoomModal}
          onHide={onHideDeleteRoomModal}
          onCancel={onHideDeleteRoomModal}
          onConfirm={onConfirmDeleteRoomModal}
          room={room}
        />
      </div>
    </>
  );
};
export default RoomHeader;
