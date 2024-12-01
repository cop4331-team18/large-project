import "./Chat.css";
import { Socket } from "socket.io-client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ChatMessage, ChatMessageInput } from "./util/constants";
import Tabs from "./components/Tabs";

interface ChatProps {
  socket: Socket | null;
  chatNotifications: number;
  setChatNotifications: React.Dispatch<React.SetStateAction<number>>;
}

const ChatPage = ({socket, chatNotifications, setChatNotifications}: ChatProps) => {
  const [messageInput, setMessageInput] = useState<string>('');

  const handleMessageInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
  };

  useEffect(() => {
    if (socket) {
      socket.on("messasge-res", (data: ChatMessage) => {
        alert(`RECIEVED MESSAGE: ${JSON.stringify(data)}`);
        setChatNotifications(prev => {
          return prev+1;
        });
      });
    }
  }, [socket]);

  const sendChatMessage = (e: FormEvent) => {
    e.preventDefault();
    if (socket) {
      const message: ChatMessageInput = {
        message: messageInput,
        project: '674b8e7d3a47d64473d09b4c', // TODO: change this after better functionality
      };
      socket.emit("message", message);
    }
  };

  return (
    <div className="chat-page">
      {/* Tabs */}
      <Tabs currentTab="chat" chatNotifications={chatNotifications}/>

      {/* Chat Content */}
      <div className="chat-container">
        <div className="left-panel">

        </div>
        <div className="right-panel">
          <div className="message-container">

          </div>
          <form className="input-container" onSubmit={sendChatMessage}>
            <input type="text" placeholder="Send a message" value={messageInput} onChange={handleMessageInputChange}></input>
            <button onClick={sendChatMessage}>➣</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
