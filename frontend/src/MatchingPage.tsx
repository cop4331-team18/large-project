import React, { useEffect, useState } from "react";
import "./MatchingPage.css";
import Tabs from "./components/Tabs";
import { AttributesInput } from "./components/AttributesInput";

interface Project {
  name: string;
  description: string;
}

interface Profile {
  id: string;
  firstName: string;
  attributes: string[];
  projects: Project[];
}

interface MatchingPageProps {
  chatNotifications: number;
}

const MatchingPage: React.FC<MatchingPageProps> = ({chatNotifications}: MatchingPageProps) => {

  const mockProfiles: Profile[] = [
    {
      id: "1",
      firstName: "Alice",
      attributes: ["JavaScript", "Python", "React", "Node.js"],
      projects: [
        {
          name: "MERN Stack App",
          description: "An application that uses MongoDB, Express, React, and Node.js",
        },
        {
          name: "School Club Portfolio",
          description: "Portfolio for a UCF club that displays all achievements and updates"
        },
      ],
    },
    {
      id: "2",
      firstName: "Bob",
      attributes: ["Unity", "C++", "Game Design"],
      projects: [
        {
          name: "Indie Game",
          description: "A 2D platformer built with Unity targeting desktop platforms.",
        },
      ],
    },
    {
      id: "3",
      firstName: "Charlie",
      attributes: ["Go", "Rust", "Kubernetes"],
      projects: [
        {
          name: "Cloud Infrastructure",
          description: "A scalable backend infrastructure for microservices.",
        },
        {
          name: "test 2",
          description: "text",
        },
        {
          name: "test 3",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo.",
        },
      ],
    },
  ];

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [attributesList, setAttributesList] = useState<string[]>([]);

  useEffect(() => {
    console.log(attributesList);
  }, [attributesList])

  const handleDecision = (decision: "accept" | "reject") => {
    setSwipeDirection(decision === "accept" ? "right" : "left");

    // Delay to load profile after swipe
    setTimeout(() => {
        setSwipeDirection(null);
        if (currentIndex < mockProfiles.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(-1);
        }
    }, 650); 
  };

  const currentProfile = currentIndex !== null && currentIndex < mockProfiles.length 
  ? mockProfiles[currentIndex] 
  : null;

  return (
    <div className="matching-page">
      <Tabs currentTab="matching" chatNotifications={chatNotifications}/>

      <AttributesInput setAttributesList={setAttributesList} limit={5} placeholder="Filter Attributes"/>

      {/* Current Profile */}
      {currentProfile ? (
        <div 
          key={currentProfile.id} 
          className={`profile-card ${
          swipeDirection === "right" ? "swipe-right" : ""
        } ${swipeDirection === "left" ? "swipe-left" : ""}`}
      >
        <div className="card-content">
          <h2 className="title">{currentProfile.firstName}</h2>

          {/* Attributes */}
          <div className="section-header">
            <img src="/tag.svg" className="section-header-icon"/>
            Attributes
          </div>
          <div className="attributes">
            {currentProfile.attributes.map((attribute, index) => (
              <span key={index} className="attribute-tag">{attribute}</span>
            ))}
          </div>

          {/* Divider */}
          <hr className="section-divider" />

          {/* Projects */}
          <div className="projects">
            <div className="section-header">
              <img src="/book.svg" className="section-header-icon"/>
              Projects
            </div>
            {currentProfile.projects.map((project, index) => (
              <div key={index} className="project">
                <p className="project-name">
                  {project.name}</p>
                <p className="project-description">{project.description}</p>
              </div>
            ))}
          </div>
        </div>

          {/* Action Buttons */}
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
        <div className="no-profiles-message">
          <h2>No Profiles Left</h2>
          <p>Come back later for some more matches!</p>
        </div>
      )}
    </div>
  );
};

export default MatchingPage;
