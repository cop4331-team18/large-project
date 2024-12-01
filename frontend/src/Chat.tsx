import { useNavigate } from "react-router-dom";
import "./Chat.css";
import { Socket } from "socket.io-client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ChatMessage, ChatMessageInput } from "./util/constants";

interface ChatProps {
  socket: Socket | null,
}

const ChatPage = ({socket}: ChatProps) => {
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState<string>('');

  const handleMessageInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
  };

  useEffect(() => {
    if (socket) {
        socket.on("messasge-res", (data: ChatMessage) => {
          alert(`RECIEVED MESSAGE: ${JSON.stringify(data)}`);
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
      <div className="tabs">
        <div className="tab active">
          <span>Chat</span>
        </div>
        <div className="tab" onClick={() => navigate("/matching")}>
          <span>Matching</span>
        </div>
        <div className="tab" onClick={() => navigate("/")}>
          <span>Settings</span>
        </div>
      </div>

      {/* Chat Content */}
      <div className="chat-container">
        <div className="left-panel">

        </div>
        <div className="right-panel">
          <div className="message-container">

          </div>
          <div className="input-container">
            <input type="text" placeholder="Send a message" value={messageInput} onChange={handleMessageInputChange}></input>
            <button onClick={sendChatMessage}>➣</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
