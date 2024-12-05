import React, { useState, ChangeEvent } from "react";
import "./Projects.css";
import Tabs from "./components/Tabs";
import { AttributesInput } from "./components/AttributesInput";
import { apiCall, Project } from "./util/constants";

interface ProjectsProps {
  chatNotifications: number;
  projects: Project[];
}

const ProjectsPage: React.FC<ProjectsProps> = ({ chatNotifications, projects }: ProjectsProps) => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null); //update and edit 
  const [attributesList, setAttributesList] = useState<string[]>([]); 
  const [projectName, setProjectName] = useState<string>("");
  const [description, setDescription] = useState<string>("");


  //create project
  const handleCreateBlankProject = async () => {
    try {
      const response = await apiCall.post(`/projects/add`, {});
      if (response.status === 200) {
        console.log("Blank project created successfully!");
      }
    } catch (error) {
      console.error("Project was not successfully added");
    }
  };

  //delete stuff, needs to be changed probably lmk 
  const handleDeleteProject = async () => {
    try {
      if(currentProject !== null){
        const response = await apiCall.post(`/projects/delete/${currentProject._id}`);
        if(response.status === 200) {
          console.log("Project deleted successfully");
          setCurrentProject(null); // Reset current project selection
        }
      }
    } catch (error) {
      console.error("Project was not successfully deleted");
    }
  };

  //update for project code 
  const handleUpdateProject = async () => {
    try {

      if (!projectName || !description ) {
        alert("Please fill in all the required fields");
        return;
      }

      const response = await apiCall.post("/projects/update", {
        _id: currentProject?._id,
        name: projectName,
        description: description,
      });

      if(response.status === 200) {
        alert("Project updated successfully!");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };  

  const handleProjectName = (e: ChangeEvent<HTMLInputElement>) =>
    setProjectName(e.target.value);
  const handleDescription = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setDescription(e.target.value);

  return (
    <div className="projects-page">
      {/* Tabs */}
      <Tabs currentTab="projects" chatNotifications={chatNotifications} />

      <div className="projects-container">
        <h1>Projects</h1>

        {/* Create Blank Project Button */}
        <button className="create-btn top-btn" onClick={handleCreateBlankProject}>
          Create Blank Project
        </button>

        {/* Update/Create Project Form */}
        {currentProject && (
          <div className="section">
            <h2>Update Project</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="project-name">Name</label>
                <input
                  id="project-name"
                  type="text"
                  placeholder="Project Name"
                  value={currentProject.name}
                  onChange={handleProjectName}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="project-description">Description</label>
              <textarea
                id="project-description"
                placeholder="Project Description"
                value={currentProject.description}
                onChange={handleDescription}
              />
            </div>

            <div className="section">
              <h3>Attributes</h3>
              <AttributesInput
                setAttributesList={setAttributesList}
                limit={5}
                placeholder="Search and select attributes"
              />
            </div>

            <button className="update-btn" onClick={handleUpdateProject}>
              Update Project
            </button>
          </div>
        )}

        {/* Display Projects */}
        <div className="projects-list">
          {projects.map((project) => (
            <div key={project._id} className="project-card">
              <h3>{project.name || "Untitled Project"}</h3>
              <p>{project.description || "No Description"}</p>
              <div className="attributes">
                {project.attributes.length > 0 ? (
                  project.attributes.map((attr, index) => (
                    <span key={index} className="attribute-tag">
                      {attr}
                    </span>
                  ))
                ) : (
                  <p>No Attributes</p>
                )}
              </div>
              <div className="project-actions">
                <button
                  className="update-btn"
                  onClick={() => {
                    setCurrentProject(project);
                    setAttributesList(project.attributes);
                  }}
                >
                  Update
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteProject()} //i think this works not sure with api side
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;