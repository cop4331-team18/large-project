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
          <h1>Create Project</h1>

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
          
            </div>
            <div className="form-group">
              <label htmlFor="project-description">Description</label>
              <textarea
                id="project-description"
                placeholder="Project Description"
              />
            </div>
            <div className="section">
          <h3>Languages</h3>
          <select multiple>
            <option value="JavaScript">JavaScript</option> {/*placeholder for atributes, lmk if this needs change -dylan */}
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="C++">C++</option>
            <option value="Ruby">Ruby</option>
          </select>
        </div>
          </div> {/*used for creation of project on project page  */}
          <div className="create-project">  
            <button className="create-btn" > {/*onClick=  */}
              Create Project
            </button>

          </div>
        </div>
      </div>
  );
};

export default ProjectsPage;