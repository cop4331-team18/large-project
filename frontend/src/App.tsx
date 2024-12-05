import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import AuthForm from './AuthForm';
import MatchingPage from './MatchingPage';
import ChatPage from './Chat';
import SettingsPage from './Settings';
import ProjectsPage from './Projects';
import { apiCall, ChatMessage, Project, SERVER_BASE_URL, User } from './util/constants';
import { io, Socket } from 'socket.io-client';
import "./App.css"

const AuthenticatedRoute = (props: {isLoggedIn: boolean | null}): JSX.Element => {
  return (
    props.isLoggedIn === false ? <Navigate to="/login"/> : <Outlet/>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketEvents, setSocketEvents] = useState<Set<string>>(new Set());
  const [chatNotifications, setChatNotifications] = useState<number>(0);
  const [newMessages, setNewMessages] = useState<Map<string, ChatMessage[]>>(new Map());
  const [oldMessages, setOldMessages] = useState<Map<string, ChatMessage[]>>(new Map());
  const [oldMessagesPageNum, setOldMessagesPageNum] = useState<Map<string, number>>(new Map());
  const [oldMessagesHasNext, setOldMessagesHasNext] = useState<Map<string, boolean>>(new Map());
  const [oldMessagesViewDate, setOldMessagesViewDate] = useState<Map<string, Date>>(new Map());
  const [projects, setProjects] = useState<Project[]>([]);

  const refreshSocket = (loginStatus: boolean) => {
    if (loginStatus) {
      // Really annoying implementation from socket.io.
      const socketUrl = (import.meta.env.PROD) ? '' : SERVER_BASE_URL;
      const socketPath = (import.meta.env.PROD) ? '/api/socket.io' : '/socket.io';
      setSocket(io(socketUrl, {
        path: socketPath, 
        withCredentials: true, 
        transports: ['websocket'],
      }));
    } else {
      if (socket) {
        socketEvents.forEach((event: string) => {
          socket.off(event);
        })
        socket.close();
      }
      setSocketEvents(new Set());
      setSocket(null);
    }
  }

  const fetchUserStatus = async () => {
    const response = await apiCall.get(`/login/status`);
    const data: any = response.data;
    setIsLoggedIn(data.loginStatus as boolean);
    setUser(data.user as User);
    refreshSocket(data.loginStatus);
  };

  useEffect(() => {
    if (user) {
      console.log(user);
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      if (!socketEvents.has("connection")) {
        setSocketEvents(prev => prev.add("connection"));
        socket.on("connection", (data) => {
          console.log(data)
        })
      }
    }
  }, [socket])

  useEffect(() => {
    fetchUserStatus();
  }, []);

  return (
    <Router>
      <Routes>

        <Route path="/login"
          element={<AuthForm fetchUserStatus={fetchUserStatus} isLoggedIn={isLoggedIn}/>
        } />

        <Route element={<AuthenticatedRoute isLoggedIn={isLoggedIn}/>}>

          <Route path="/" element={
            <MatchingPage chatNotifications={chatNotifications}/>
          } />
         
          <Route path="/matching" element={
            <MatchingPage chatNotifications={chatNotifications}/>
          } />

          <Route path="/chat" element={
            <ChatPage 
              user={user}
              socket={socket}
              socketEvents={socketEvents}
              setSocketEvents={setSocketEvents}
              chatNotifications={chatNotifications}
              setChatNotifications={setChatNotifications}
              isLoggedIn={isLoggedIn}
              newMessages={newMessages}
              setNewMessages={setNewMessages}
              oldMessages={oldMessages}
              setOldMessages={setOldMessages}
              oldMessagesPageNum={oldMessagesPageNum}
              setOldMessagesPageNum={setOldMessagesPageNum}
              oldMessagesHasNext={oldMessagesHasNext}
              setOldMessagesHasNext={setOldMessagesHasNext}
              oldMessagesViewDate={oldMessagesViewDate}
              setOldMessagesViewDate={setOldMessagesViewDate}
              projects={projects}
              setProjects={setProjects}
            />
          } />

          <Route path="/settings" element={
            <SettingsPage chatNotifications={chatNotifications} fetchUserStatus={fetchUserStatus}/>
          } />

          <Route
            path="/projects"element={
            <ProjectsPage  projects={projects} chatNotifications={chatNotifications}/>}
      
          />

          <Route path="*" element={
            <Navigate to="/" replace />
          } />

        </Route>

      </Routes>
    </Router>
  );
}

export default App;