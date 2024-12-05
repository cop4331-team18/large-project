import React, { useEffect, useState } from "react";
import "./MatchingPage.css";
import Tabs from "./components/Tabs";
import { AttributesInput } from "./components/AttributesInput";
import { apiCall, MATCHING_OPTIONS_SIZE, Project, User } from "./util/constants";

interface MatchingPageProps {
  chatNotifications: number;
  userMap: Map<string, User>;
  fetchUser: (id: string) => Promise<User>;
}

const MatchingPage: React.FC<MatchingPageProps> = ({chatNotifications, userMap, fetchUser}: MatchingPageProps) => {
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [attributesList, setAttributesList] = useState<string[]>([]);
  const [matchOptions, setMatchOptions] = useState<Project[]>([]);
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
      if (!userMap.get(projects[0].createdBy)) {
        fetchUser(projects[0].createdBy);
      }
    } else {
      setCurrentIndex(-1); // No more projects
    }
    setHasNext(data.hasNext);
  };

  useEffect(() => {
    fetchMoreOptions();
  }, [attributesList]);

  const handleDecision = (decision: "accept" | "reject") => {
    setSwipeDirection(decision === "accept" ? "right" : "left");

    // Delay to load project after swipe
    setTimeout(async () => {
      setSwipeDirection(null);
      if (currentIndex < matchOptions.length - 1) {
        if (!userMap.get(matchOptions[currentIndex+1].createdBy)) {
          await fetchUser(matchOptions[currentIndex+1].createdBy);
        }
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
      {currentIndex >= 0 && matchOptions[currentIndex] && userMap.get(matchOptions[currentIndex].createdBy) ? (
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
              {userMap.get(matchOptions[currentIndex].createdBy)!.firstName && userMap.get(matchOptions[currentIndex].createdBy)!.lastName &&
               `${userMap.get(matchOptions[currentIndex].createdBy)!.firstName} ${userMap.get(matchOptions[currentIndex].createdBy)!.lastName}`}
              <p className="matching-username-text">
                {`@${userMap.get(matchOptions[currentIndex].createdBy)!.username}`}
              </p>  
            </div>
            <p className="owner-bio">{!!userMap.get(matchOptions[currentIndex].createdBy)!.bio && 'User has no bio.'}</p>
            {/* Need to add css for owner attributes (smaller) */}
            <div className="owner-attributes">
              {userMap.get(matchOptions[currentIndex].createdBy)!.attributes.length === 0 && 'User has no attributes.'}
              {userMap.get(matchOptions[currentIndex].createdBy)!.attributes.map((attribute, index) => (
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
