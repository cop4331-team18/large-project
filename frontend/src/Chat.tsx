import "./Chat.css";
import { Socket } from "socket.io-client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { apiCall, ChatMessage, ChatMessageInput, Project } from "./util/constants";
import Tabs from "./components/Tabs";
import { useNavigate } from "react-router-dom";

interface ChatProps {
  socket: Socket | null;
  socketEvents: Set<string>;
  setSocketEvents: React.Dispatch<React.SetStateAction<Set<string>>>;
  chatNotifications: number;
  setChatNotifications: React.Dispatch<React.SetStateAction<number>>;
  isLoggedIn: boolean | null;
}

const ChatPage = ({socket, socketEvents, setSocketEvents, chatNotifications, setChatNotifications, isLoggedIn}: ChatProps) => {
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentChat, setCurrentChat] = useState<string>('');

  const handleMessageInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
  };

  useEffect(() => {
    if (socket) {
      if (!socketEvents.has("message-res")) {
        setSocketEvents(prev => prev.add("message-res"));
        socket.on("messasge-res", (data: ChatMessage) => {
          alert(`RECIEVED MESSAGE: ${JSON.stringify(data)}`);
          setChatNotifications(prev => {
            return prev+1;
          });
        });
      }
    }
  }, [socket]);

  const fetchUserProjects = async() => {
    const response = await apiCall.get(`/projects/get`);
    const data: any = response.data;
    setProjects(data.projects);
    if (data.projects.length > 0) {
      setCurrentChat(data.projects[0]._id);
    }
  };

  useEffect(() => {
    if (isLoggedIn === false) {
      navigate("/login");
    } else if (isLoggedIn === true) {
      fetchUserProjects();
    }
}, [isLoggedIn]);

  const sendChatMessage = (e: FormEvent) => {
    e.preventDefault();
    if (socket) {
      const message: ChatMessageInput = {
        message: messageInput,
        project: '674b8e7d3a47d64473d09b4c', // TODO: change this after better functionality
      };
      socket.emit("message", message);
    }
  };

  return (
    <div className="chat-page">
      {/* Tabs */}
      <Tabs currentTab="chat" chatNotifications={chatNotifications}/>

      {/* Chat Content */}
      <div className="chat-container">
        <div className="left-panel">
          <h1>
            Matches
          </h1>
          {projects.length === 0 && <p>No projects found!</p>}
          {projects.map((project) => 
            <div className="chat-project" key={project._id} onClick={() => setCurrentChat(project._id)} style={{cursor: 'pointer',  background: (project._id === currentChat) ? 'Gainsboro' : ''}}>
              <p>
                {project.name}
              </p>
            </div>
          )}
        </div>
        <div className="right-panel">
          <div className="message-container">

          </div>
          <form className="input-container" onSubmit={sendChatMessage}>
            <input type="text" placeholder="Send a message" value={messageInput} onChange={handleMessageInputChange}></input>
            <button onClick={sendChatMessage}>➣</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
