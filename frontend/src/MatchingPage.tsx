import React, { useEffect, useState } from "react";
import "./MatchingPage.css";
import Tabs from "./components/Tabs";
import { AttributesInput } from "./components/AttributesInput";
import { apiCall, MATCHING_OPTIONS_SIZE, Project, User } from "./util/constants";

interface MatchingPageProps {
  chatNotifications: number;
}

const MatchingPage: React.FC<MatchingPageProps> = ({chatNotifications}: MatchingPageProps) => {

  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [attributesList, setAttributesList] = useState<string[]>([]);
  const [matchOptions, setMatchOptions] = useState<Project[]>([]);
  const [matchOptionsCreatedBy, setMatchOptionsCreatedBy] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState<number>(-1);
  const [hasNext, setHasNext] = useState<boolean>(true);

  const fetchMoreOptions = async() => {
    const response = await apiCall.get("/projects/get-match-options", {
      params: {
        pageSize: MATCHING_OPTIONS_SIZE,
        attributes: attributesList,
      }
    });
    const data: any = response.data;
    const projects: Project[] = data.projects;
    if (projects.length > 0) {
      setMatchOptions(projects);
      setCurrentIndex(0);
      const users = [];
      for (const project of projects) {
        users.push(await fetchUser(project.createdBy));
      }
      setMatchOptionsCreatedBy(users);
    } else {
      setCurrentIndex(-1); // No more projects
    }
    setHasNext(data.hasNext);
  };

  const fetchUser = async (id: string): Promise<User> => {
    const response = await apiCall.get(`/user/${id}`);
    const data: any = response.data;
    return data.user as User;
  }

  useEffect(() => {
    fetchMoreOptions();
  }, [attributesList]);

  const handleDecision = (decision: "accept" | "reject") => {
    setSwipeDirection(decision === "accept" ? "right" : "left");

    // Delay to load project after swipe
    setTimeout(async () => {
      setSwipeDirection(null);
      if (currentIndex < matchOptions.length - 1) {
        setCurrentIndex(prev => prev+1);
      } else if (hasNext) {
        await fetchMoreOptions();
      } else {
        setCurrentIndex(-1); // No more projects
      }
    }, 650); 
  };

  return (
    <div className="matching-page">
      <Tabs currentTab="matching" chatNotifications={chatNotifications}/>

      <div className="matching-attributes-input">
        <AttributesInput setAttributesList={setAttributesList} limit={5} placeholder="Filter Attributes"/>
      </div>

      {/* Current Profile */}
      {currentIndex >= 0 && matchOptions[currentIndex] && matchOptionsCreatedBy[currentIndex] ? (
        <div 
          key={matchOptions[currentIndex]._id} 
          className={`project-card ${
          swipeDirection === "right" ? "swipe-right" : ""
        } ${swipeDirection === "left" ? "swipe-left" : ""}`}
      >
        <div className="card-content">
          {/* Project Info */}
          <h2 className="title">{matchOptions[currentIndex].name}</h2>
          <p className="project-description">{matchOptions[currentIndex].description}</p>

          {/* Project Attributes */}
          <div className="section-header">
            <img src="/tag.svg" className="section-header-icon"/>
            Attributes
          </div>
          <p className="project-attributes">
            {matchOptions[currentIndex].attributes.length === 0 && 'Project has no attributes.'}
            {matchOptions[currentIndex].attributes.map((attribute, index) => (
              <span key={index} className="project-attribute-tag">{attribute}</span>
            ))}
          </p>

          {/* Divider */}
          <hr className="section-divider" />

          {/* Owner Info */}
          <div className="owner-info">
            <div className="section-header">
              <img src="/owner.svg" className="section-header-icon"/>
              {matchOptionsCreatedBy[currentIndex].firstName && matchOptionsCreatedBy[currentIndex].lastName &&
               `${matchOptionsCreatedBy[currentIndex].firstName} ${matchOptionsCreatedBy[currentIndex].lastName}`}
              <p className="matching-username-text">
                {`@${matchOptionsCreatedBy[currentIndex].username}`}
              </p>  
            </div>
            <p className="owner-bio">{!!matchOptionsCreatedBy[currentIndex].bio && 'User has no bio.'}</p>
            {/* Need to add css for owner attributes (smaller) */}
            <div className="owner-attributes">
              {matchOptionsCreatedBy[currentIndex].attributes.length === 0 && 'User has no attributes.'}
              {matchOptionsCreatedBy[currentIndex].attributes.map((attribute, index) => (
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
        !hasNext && <div className="no-projects-message">
          <h2>No Projects Left</h2>
          <p>Come back later for more matches!</p>
        </div>
      )}
    </div>
  );
};

export default MatchingPage;
