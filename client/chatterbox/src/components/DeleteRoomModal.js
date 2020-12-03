import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const DeleteRoomModal = (props) => {
  const { show, onHide, room, onCancel, onConfirm } = props;
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Room</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Are you sure you want to delete room {room?.name}?</h4>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="success" onClick={onConfirm}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteRoomModal;
