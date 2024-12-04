import React from "react";
import "./Projects.css"
import Tabs from "./components/Tabs";

interface ProjectsProps {
  chatNotifications: number;
}
const ProjectsPage: React.FC<ProjectsProps> = ({chatNotifications}: ProjectsProps) =>  {
  return (
      <div className="projects-page">
        {/* Tabs */}
        <Tabs currentTab="projects" chatNotifications={chatNotifications}/>
        
        <div className="projects-container"> 
          <h1>Project Management</h1>

          <div className="section">
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
        </div>
      </div>
  );
};

export default ProjectsPage;