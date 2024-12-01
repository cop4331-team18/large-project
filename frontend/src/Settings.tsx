import React, { useState } from "react";
import "./Settings.css";
import Tabs from "./components/Tabs";

interface SettingsProp {
  chatNotifications: number;
}

const SettingsPage: React.FC<SettingsProp> = ({chatNotifications}: SettingsProp) => {
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
      <Tabs chatNotifications={chatNotifications} currentTab="settings"/>

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
