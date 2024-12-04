import React, { FormEvent, useState } from "react";
import "./Settings.css";
import Tabs from "./components/Tabs";
import { apiCall } from "./util/constants";
import { AttributesInput } from "./components/AttributesInput";

interface SettingsProp {
  chatNotifications: number;
  fetchUserStatus: () => Promise<void>;
}

// ADD "useEffect" TO IMPORT REACT WHEN UNCOMMENTING!!!!!!
const SettingsPage: React.FC<SettingsProp> = ({chatNotifications, fetchUserStatus}: SettingsProp) => {
  // const [firstName, setFirstName] = useState<string>("");
  // const [lastName, setLastName] = useState<string>("");
  // const [username, setUsername] = useState<string>("");
  // const [email, setEmail] = useState<string>("");
  // const [bio, setBio] = useState<string>("");

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       const response = await apiCall.get("/user/profile"); // Replace with your API endpoint
  //       const data = response.data;
  //       setFirstName(data.firstName || "");
  //       setLastName(data.lastName || "");
  //       setUsername(data.username || "");
  //       setEmail(data.email || ""); // Set the email from the backend
  //       setBio(data.bio || "");
  //     } catch (error) {
  //       console.error("Error fetching user data:", error);
  //     }
  //   };

  //   fetchUserData();
  // }, []);

  const [attributesList, setAttributesList] = useState<string[]>([]);

  const handleSave = () => {
    alert("Profile saved successfully!");
    console.log("Selected Attributes:", attributesList);
    // Add logic to save data to a backend or API
  };

  const handleCancel = () => {
    alert("Changes canceled!");
    // Reset form or navigate away if needed
  };

  const handleLogout = async (e: FormEvent) => {
    e.preventDefault();
    try {
        const response = await apiCall.post("/login/logout");
        if (response.status === 200) {
            fetchUserStatus();
        }
    } catch (error) {
        console.log(error);
    }
  }

  const handleUndoAllLeftSwipes = async(e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiCall.post("/projects/undo-all-left-swipes");
      if (response.status === 200) {
        alert("Success!");
        fetchUserStatus();
      }
    } catch (error) {
      console.log(error)
    }
  }

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

        {/* Bio */}
        <div className="section">
          <h2>Bio</h2>
          <textarea
            placeholder="Write a short bio about yourself"
          />
        </div>

        {/* Attributes */}
        <div className="section">
          <h2>Attributes</h2>
          {/* AttributesInput Component */}
          <AttributesInput
            setAttributesList={setAttributesList}
            placeholder="Search and select attributes"
          />
        </div>

        <div className="settings-actions-container">
          {/* Log Out Button */}
          <div className="logout-actions">
            <button className="log-out-btn" onClick={handleLogout}>
              Log Out
            </button>
            <button onClick={handleUndoAllLeftSwipes}>Undo all Left Swipes</button>
          </div>

          {/* Cancel and Save Buttons */}
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
    </div>
  );
};

export default SettingsPage;
