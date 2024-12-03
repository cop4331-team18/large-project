import React, { useEffect, useState } from "react";
import "./MatchingPage.css";
import Tabs from "./components/Tabs";
import { AttributesInput } from "./components/AttributesInput";

// Mock Definitions (until backend connected)
type ObjectId = string; // placeholder

type User = {
  firstName: string;
  lastName: string;
  attributes: string[];
};

type Project = {
  name: string;
  description: string;
  attributes: string[];
  createdBy: ObjectId;
  owner: User;
};

interface MatchingPageProps {
  chatNotifications: number;
}

const MatchingPage: React.FC<MatchingPageProps> = ({chatNotifications}: MatchingPageProps) => {

  const mockProjects: Project[] = [
    {
      name: "MERN Stack App",
      description: "An application that uses MongoDB, Express, React, and Node.js",
      attributes: ["MongoDB", "Express", "React", "Node.js"],
      createdBy: "1",
      owner: {
        firstName: "Alice",
        lastName: "Smith",
        attributes: ["JavaScript", "Python", "React", "Node.js"],
      },
    },
    {
      name: "Indie Game",
      description: "A 2D platformer built with Unity targeting desktop platforms.",
      attributes: ["Unity", "C++", "Python", "JavaScript", "Lua", "GDScript", "Shaders", "Unreal Engine", "WebSocket"],
      createdBy: "2",
      owner: {
        firstName: "Bob",
        lastName: "Johnson",
        attributes: ["Unity", "Lua", "Game Design"],
      },
    },
    {
      name: "Cloud Infrastructure",
      description: "A scalable backend infrastructure for microservices.",
      attributes: ["Go", "Rust", "Ruby", "Bash", "Java", "C#"],
      createdBy: "3",
      owner: {
        firstName: "Charlie",
        lastName: "Brown",
        attributes: ["Go", "C#", "Kubernetes"],
      },
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

    // Delay to load project after swipe
    setTimeout(() => {
        setSwipeDirection(null);
        if (currentIndex < mockProjects.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(-1); // No more projects
        }
    }, 650); 
  };

  const currentProject = currentIndex !== null && currentIndex < mockProjects.length 
  ? mockProjects[currentIndex] 
  : null;

  return (
    <div className="matching-page">
      <Tabs currentTab="matching" chatNotifications={chatNotifications}/>

      <AttributesInput setAttributesList={setAttributesList} limit={5} placeholder="Filter Attributes"/>

      {/* Current Profile */}
      {currentProject ? (
        <div 
          key={currentProject.name} 
          className={`project-card ${
          swipeDirection === "right" ? "swipe-right" : ""
        } ${swipeDirection === "left" ? "swipe-left" : ""}`}
      >
        <div className="card-content">
          {/* Project Info */}
          <h2 className="title">{currentProject.name}</h2>
          <p className="project-description">{currentProject.description}</p>

          {/* Project Attributes */}
          <div className="section-header">
            <img src="/tag.svg" className="section-header-icon"/>
            Attributes
          </div>
          <div className="project-attributes">
            {currentProject.attributes.map((attribute, index) => (
              <span key={index} className="project-attribute-tag">{attribute}</span>
            ))}
          </div>

          {/* Divider */}
          <hr className="section-divider" />

          {/* Owner Info */}
          <div className="owner-info">
            <div className="section-header">
              <img src="/owner.svg" className="section-header-icon"/>
              {currentProject.owner.firstName} {currentProject.owner.lastName}
            </div>
            <p className="owner-bio">This is the field for the bio. This would describe the user. Lorem ipsum dolor sit amet. Cum optio veniam ad voluptas recusandae 
              ad provident facilis non laboriosam magni quo provident omnis ut corrupti galisum ut modi inventore. 
              Sed laudantium vero cum dicta saepe non dolor tempore in corporis officia qui consectetur soluta vel corrupti dolores.</p>
            {/* Need to add css for owner attributes (smaller) */}
            <div className="owner-attributes">
              {currentProject.owner.attributes.map((attribute, index) => (
                <span key={index} className="owner-attribute-tag">{attribute}</span>
              ))}
            </div>
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
        <div className="no-projects-message">
          <h2>No Projects Left</h2>
          <p>Come back later for more matches!</p>
        </div>
      )}
    </div>
  );
};

export default MatchingPage;
