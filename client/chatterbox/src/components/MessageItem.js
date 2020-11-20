import styles from "./MessageItem.module.css";

const MessageItem = (props) => {
  const { message } = props;

  return (
    <div className={styles.container}>
      <span className={styles.content}>
        {message?.sender?.username || " "}: {message?.text || " "}
      </span>
      <span className={styles.timestamp}>
        {new Date(message.sent_at).toLocaleString()}
      </span>
    </div>
  );
};
export default MessageItem;
