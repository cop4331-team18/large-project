import React, { useEffect, useState } from "react";
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
  const navigate = useNavigate()

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
    {
        id: "3",
        name: "Charlie",
        age: 28,
        location: "Austin",
        school: "UT Austin",
        languages: ["Go", "Rust", "Python"],
        skills: ["Microservices", "Kubernetes"],
        bio: "Charlie here! Excited to collaborate on backend systems and cloud solutions.",
      },
      {
        id: "4",
        name: "Zuck",
        age: 19,
        location: "Cambridge",
        school: "Harvard",
        languages: ["C++", "PHP", "Java"],
        skills: ["Original ideas", "Web Development"],
        bio: "Heard about these two brothers' idea, might try to code it for fun.",
      },
  ];

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  const handleDecision = (decision: "accept" | "reject") => {
    setSwipeDirection(decision === "accept" ? "right" : "left");

    // Delay to load profile after swipe
    setTimeout(() => {
        setSwipeDirection(null);
        if (currentIndex < mockProfiles.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            alert("No more profiles available.");
        }
    }, 650); 
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
          <div 
            key={currentProfile.id} 
            className={`profile-card ${
            swipeDirection === "right" ? "swipe-right" : ""
          } ${swipeDirection === "left" ? "swipe-left" : ""}`}
        >
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
