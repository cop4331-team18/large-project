import React, { useState } from "react";
import "./Projects.css";
import Tabs from "./components/Tabs";
import { AttributesInput } from "./components/AttributesInput";

interface Project {
  id: number;
  name: string;
  description: string;
  attributes: string[];
}

interface ProjectsProps {
  chatNotifications: number;
}

const ProjectsPage: React.FC<ProjectsProps> = ({ chatNotifications }: ProjectsProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null); //update and edit 
  const [attributesList, setAttributesList] = useState<string[]>([]); //

  //create project with jack shit in it
  const handleCreateBlankProject = () => {
    const newProject: Project = {
      id: Date.now(),
      name: "",
      description: "",
      attributes: [],
    };
    setProjects((prevProjects) => [newProject, ...prevProjects]);
  };

  //delete stuff, needs to be changed probably lmk 
  const handleDeleteProject = (id: number) => {
    setProjects((prevProjects) => prevProjects.filter((project) => project.id !== id));
  };

  //update for project code 
  const handleUpdateProject = () => {
    if (currentProject) {
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === currentProject.id
            ? { ...currentProject, attributes: attributesList }
            : project
        )
      );
      setCurrentProject(null); //clears it if not entered so we dont have fuckshit happening
    }
  };

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
                  onChange={(e) =>
                    setCurrentProject({ ...currentProject, name: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="project-description">Description</label>
              <textarea
                id="project-description"
                placeholder="Project Description"
                value={currentProject.description}
                onChange={(e) =>
                  setCurrentProject({ ...currentProject, description: e.target.value })
                }
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
            <div key={project.id} className="project-card">
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
                  onClick={() => handleDeleteProject(project.id)} //i think this works not sure with api side
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
