import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import CustomMessageList from "../components/CustomMessageList";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser, // this will run only when authUser is available
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        console.log("Initializing stream chat client...");

        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        //
        const channelId = [authUser._id, targetUserId].sort().join("-");

        // you and me
        // if i start the chat => channelId: [myId, yourId]
        // if you start the chat => channelId: [yourId, myId]  => [myId,yourId]

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };
  const handleClearChat = async () => {
    try {
      let lastMessageId = undefined;
      let deletedCount = 0;
  
      console.log("Clear chat handler started");
      console.log("authUser._id:", authUser._id);
      console.log("chatClient.userID:", chatClient?.userID);
  
      while (true) {
        const queryOptions = {
          limit: 50,
          ...(lastMessageId && { id_lt: lastMessageId }),
        };
  
        const { messages } = await channel.query({
          messages: queryOptions,
        });
  
        console.log("Fetched messages:", messages);
  
        if (messages.length === 0) break;
  
        console.log("Message user IDs:", messages.map(m => m.user?.id));
  
        // Optionally filter messages you want to delete (e.g., by user)
        const messagesToDelete = messages;
  
        console.log("Messages to delete:", messagesToDelete.length);
  
        for (const msg of messagesToDelete) {
          await chatClient.deleteMessage(msg.id, { hard: true });
          deletedCount++;
        }
  
        lastMessageId = messages[messages.length - 1].id;
  
        if (messages.length < 50) break;
      }
  
      toast.success(`Deleted ${deletedCount} messages.`);
    } catch (error) {
      console.error("Failed to clear chat:", error);
      toast.error("Failed to clear chat.");
    }
  };
  
  
  
  
  
  

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <CustomMessageList channel={channel} />

              <div className="p-2 flex justify-end">
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={handleClearChat}
                >
                  Clear Chat
                </button>
              </div>

              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};
export default ChatPage;
