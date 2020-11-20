import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const LeaveRoomModal = (props) => {
  const { show, onHide, onCancel, onConfirm, room } = props;
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Leave Room</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Are you sure you want to leave room {room?.name}?</h4>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LeaveRoomModal;
