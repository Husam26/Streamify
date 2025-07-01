import { useState } from "react";
import { MessageList } from "stream-chat-react";

const CustomMessageList = ({ channel }) => {
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadOlderMessages = async () => {
    setLoadingOlder(true);
    try {
      await channel.query({
        messages: {
          limit: 20,
          id_lt: channel.state.messages[0]?.id,
        },
      });
      // If fewer than requested messages loaded, no more to load
      if (channel.state.messages.length < 20) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading older messages:", error);
    } finally {
      setLoadingOlder(false);
    }
  };

  return (
    <>
      {hasMore && (
        <button
          onClick={loadOlderMessages}
          disabled={loadingOlder}
          className="w-full py-2 text-center bg-gray-200 hover:bg-gray-300"
        >
          {loadingOlder ? "Loading..." : "Load Older Messages"}
        </button>
      )}
      <MessageList />
    </>
  );
};

export default CustomMessageList;
