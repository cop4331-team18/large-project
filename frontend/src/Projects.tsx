import React from "react";
import "./Projects.css"
import Tabs from "./components/Tabs";

interface ProjectsProps {
  chatNotifications: number;
}
const ProjectsPage: React.FC<ProjectsProps> = ({chatNotifications}: ProjectsProps) =>  {
  return (
    <div>
      <div className="projects-page">
        {/* Tabs */}
        <Tabs currentTab="projects" chatNotifications={chatNotifications}/>
        <header>
          <h1>Project Management</h1>
        </header>
      </div>
    </div>
  );
};

export default ProjectsPage;