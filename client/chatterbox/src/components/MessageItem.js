import styles from "./MessageItem.module.css";

const MessageItem = (props) => {
  const { user, message } = props;

  return (
    <div className={styles.container}>
      <span>
        {message?.sender?.username || " "}: {message?.text || " "}
      </span>
      <span>{new Date(message.sent_at).toLocaleString()}</span>
    </div>
  );
};
export default MessageItem;
