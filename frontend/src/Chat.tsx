import { useNavigate } from "react-router-dom";
import "./Chat.css";
import { Socket } from "socket.io-client";
import { useEffect } from "react";

interface ChatProps {
  socket: Socket | null,
}

const ChatPage = ({socket}: ChatProps) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (socket) {
      console.log(socket)
    }
  }, [socket])
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
        <div className="tab" onClick={() => navigate("/settings")}>
          <span>Settings</span>
        </div>
      </div>

      {/* Chat Content */}
      <div className="chat-container">
        <div className="left-panel">

        </div>
        <div className="right-panel">

        </div>
      </div>
    </div>
  );
};

export default ChatPage;
