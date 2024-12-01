import React from "react";
import { useNavigate } from "react-router-dom";
import "./chat.css";

const ChatPage: React.FC = () => {
  const navigate = useNavigate();

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
        <p>This is the Chat page put the shit here and stuff</p>
      </div>
    </div>
  );
};

export default ChatPage;
