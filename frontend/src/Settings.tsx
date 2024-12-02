import React from "react";
import "./Settings.css";
import Tabs from "./components/Tabs";

interface SettingsProp {
  chatNotifications: number;
}

const SettingsPage: React.FC<SettingsProp> = ({chatNotifications}: SettingsProp) => {
  // State to manage user profile data
  // Commented because unused fields causes errors in prod
  // const [username, setUsername] = useState<string>("");
  // const [email, setEmail] = useState<string>("");
  // const [bio, setBio] = useState<string>("");

  const handleSave = () => {
    alert("Profile saved successfully!");
    // Add logic to save data to a backend or API
  };

  const handleCancel = () => {
    alert("Changes canceled!");
    // Reset form or navigate away if needed
  };

  return (
    <div className="settings-page">
      {/* Tabs */}
      <Tabs chatNotifications={chatNotifications} currentTab="settings"/>

      {/* Main Settings Content */}
      <div className="settings-container">
        <h1>Account Settings</h1>

        {/* User Information */}
        <div className="section">
          <h2>User Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first-name">First Name</label>
              <input
                id="first-name"
                type="text"
                placeholder="First Name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="last-name">Last Name</label>
              <input
                id="last-name"
                type="text"
                placeholder="Last Name"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Email"
              />
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="section">
          <h2>Projects</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="project-name">Name</label>
              <input
                id="project-name"
                type="text"
                placeholder="Project Name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="project-languages">Languages</label>
              <input
                id="project-languages"
                type="text"
                placeholder="Project Languages"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="project-description">Description</label>
            <textarea
              id="project-description"
              placeholder="Project Description"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="section">
          <h2>Bio</h2>
          <textarea
            placeholder="Write a short bio about yourself"
          />
        </div>

        {/* Languages */}
        <div className="section">
          <h2>Languages</h2>
          <select multiple>
            <option value="JavaScript">JavaScript</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="C++">C++</option>
            <option value="Ruby">Ruby</option>
          </select>
        </div>

        {/* Save and Cancel Buttons */}
        <div className="settings-actions">
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
