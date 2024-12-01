import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  // State to manage user profile data
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [bio, setBio] = useState<string>("");

  const handleSave = () => {
    alert("Profile saved successfully!");
    // Add logic here to send the updated profile data to your backend
  };

  return (
    <div className="settings-page">
      {/* Tabs */}
      <div className="tabs">
        <div className="tab" onClick={() => navigate("/chat")}>
          <span>Chat</span>
        </div>
        <div className="tab" onClick={() => navigate("/matching")}>
          <span>Matching</span>
        </div>
        <div className="tab active">
          <span>Settings</span>
        </div>
      </div>

      {/* Settings Content */}
      <div className="settings-container">
        <h1>Profile Settings</h1>
        <form className="settings-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short bio about yourself"
            />
          </div>

          <button type="button" className="save-button" onClick={handleSave}>
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
