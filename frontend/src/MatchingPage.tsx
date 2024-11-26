import React from "react";
import { useNavigate } from "react-router-dom";
import "./MatchingPage.css";

interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  school: string;
  languages: string[];
  skills: string[];
  bio: string;
}

const MatchingPage: React.FC = () => {
  const navigate = useNavigate();

  const mockProfiles: Profile[] = [
    {
      id: "1",
      name: "Alice",
      age: 22,
      location: "New York",
      school: "NYU",
      languages: ["JavaScript", "Python", "TypeScript"],
      skills: ["React", "Node.js"],
      bio: "I'm Alice, a full-stack developer looking to create a MERN stack application",
    },
    {
      id: "2",
      name: "Bob",
      age: 25,
      location: "San Francisco",
      school: "Stanford",
      languages: ["C#", "C++", "Python"],
      skills: ["Unity", "Unreal Engine", "Pygame"],
      bio: "Hi, I'm Bob, a game developer looking to create a blockbuster game",
    },
  ];

  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleDecision = (decision: "accept" | "reject") => {
    console.log(`Profile ${mockProfiles[currentIndex].id} was ${decision}ed.`);
    if (currentIndex < mockProfiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert("No more profiles available.");
    }
  };

  const currentProfile = mockProfiles[currentIndex];

  return (
    <div className="matching-page">
      {/* Tabs */}
      <div className="tabs">
        <div
          className="tab"
          onClick={() => navigate("/")}
        >
          <span>Updates</span>
        </div>
        <div className="tab active">
          <span>Matching</span>
        </div>
        <div
          className="tab"
          onClick={() => navigate("/")}
        >
          <span>Settings</span>
        </div>
      </div>

      {/* Current Profile */}
      <div className="profile-container">
        {currentProfile ? (
          <div key={currentProfile.id} className="profile-card">
            <h2 className="left-title">{currentProfile.name}, {currentProfile.age}</h2>
            <p className="left-text small-spacing">📍 {currentProfile.location}</p>
            <p className="left-text small-spacing">🏫 {currentProfile.school}</p>
            <h3>About Me</h3>
            <p className = "bio">{currentProfile.bio}</p>
            <p>Languages: {currentProfile.languages.join(", ")}</p>
            <p>Skills: {currentProfile.skills.join(", ")}</p> 

            <div className="action-buttons">
              <button
                className="reject-btn"
                onClick={() => handleDecision("reject")}>
                    <img src="/cross.svg"/>
              </button>
              <button
                className="accept-btn"
                onClick={() => handleDecision("accept")}>
                    <img src="/heart.svg"/>
              </button>
            </div>
          </div>
        ) : (
          <p>No profiles available. Check back later!</p>
        )}
      </div>
    </div>
  );
};

export default MatchingPage;
