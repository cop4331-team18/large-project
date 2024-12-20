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
import Verification from './Verification';

const AuthenticatedRoute = (props: {isLoggedIn: boolean | null, user: User | null}): JSX.Element => {
  return (
    props.isLoggedIn === false ? <Navigate to="/login"/> :
    props.user && !props.user.isVerified ? <Navigate to="/verify"/> : <Outlet/>
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
  const [userMap, setUserMap] = useState<Map<string, User>>(new Map());
  const [currentChat, setCurrentChat] = useState<string>('');


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

  useEffect(() => {
    if (socket) {
      if (!socketEvents.has("message-res")) {
        setSocketEvents(prev => {
          const newSet = new Set(prev);
          newSet.add("message-res");
          return newSet;
        });
        socket.on("message-res", async (data: ChatMessage) => {
          if (!userMap.get(data.sender)) {
            await fetchUser(data.sender);
          }
          if (data.messageType === 'CREATE' || (user && data.message.split(' ').length > 2 && data.messageType === 'ACCEPT_USER' && data.message.split(' ')[2].replace('@', '') === user.username)) {
            // User just joined this project
            setOldMessagesViewDate(prev => new Map(prev).set(data.project, new Date()));
            await fetchUserProjects();
          } else if (data.messageType === 'UPDATE' || data.messageType === 'SWIPE_RIGHT' || data.messageType === 'ACCEPT_USER') {
            await fetchUserProjects();
          } else if (data.messageType === 'DELETE') {
            if (currentChat === data.project) {
              setCurrentChat('');
            }
            setProjects(prev => {
              const newProjects: Project[] = [];
              for (const project of prev) {
                if (project._id !== data.project) {
                  newProjects.push(project);
                }
              }
              return newProjects;
            });
            return; // Play around with this and make sure this always works
          }
          setNewMessages(prev => {
            const newMap = new Map(prev);
            const messages: ChatMessage[] = newMap.get(data.project) || [];
            newMap.set(data.project, [data, ...messages]);
            return newMap;
          });
          if (data.messageType !== 'READ') {
            setProjects(prev => {
              const copy = [...prev];
              const updateProject = copy.find(val => val._id === data.project);
              if (updateProject) {
                updateProject.lastMessageAt = data.createdAt;
              }
              return copy;
            });
            // Better way to do this, but this will do.
            if (currentChat === data.project && window.location.pathname === "/chat") {
              socket.emit("read", {message: '', project: currentChat});
            }
          }
          if (data.messageType === 'READ') {
            setProjects(prev => {
              const copy = [...prev];
              const updateProject = copy.find(val => val._id === data.project);
              if (updateProject) {
                const updateReadTime = updateProject.lastReadAt.find(val => val.userId === data.sender);
                if (updateReadTime) {
                  updateReadTime.date = data.createdAt;
                }
              }
              return copy;
            });
          }
        });
      }
    }
    return () => {
      if (socket) {
        if (socketEvents.has("message-res")) {
          socket.off("message-res");
          setSocketEvents(prev => {
            const newSet = new Set(prev);
            newSet.delete("message-res");
            return newSet;
          });
        }
      }
    }
  }, [socket, socketEvents, currentChat, userMap, user]);

  const fetchUserStatus = async () => {
    const response = await apiCall.get(`/login/status`);
    const data: any = response.data;
    setIsLoggedIn(data.loginStatus as boolean);
    setUser(data.user as User);
    refreshSocket(data.loginStatus);
  };

  const fetchUser = async (id: string): Promise<User> => {
    const response = await apiCall.get(`/user/${id}`);
    const data: any = response.data;
    const user: User = data.user;
    setUserMap(prev => {
      const newMap = new Map(prev);
      newMap.set(id, user);
      return newMap;
    });
    return user;
  }

  const fetchUserProjects = async() => {
    const response = await apiCall.get(`/projects/get`);
    const data: any = response.data;
    const projects: Project[] = data.projects;
    setProjects(projects);
    const set = new Set<string>;
    for (const project of projects) {
      for (const userId of [...project.acceptedUsers, ...project.swipeRight, project.createdBy]) {
        set.add(userId);
      }
    }
    await Promise.all([...set].map(async (userId) => await fetchUser(userId)));
  };

  useEffect(() => {
    let isSorted: boolean = true;
    for (let i = 0; i < projects.length-1; ++i) {
      if (projects[i].lastMessageAt.localeCompare(projects[i+1].lastMessageAt) < 0) {
        isSorted = false;
      }
    }
    if (!isSorted) {
      setProjects(prev => {
        return [...prev].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
      });
    }
  }, [projects]);

  useEffect(() => {
    setChatNotifications(0);
    for (const project of projects) {
      const lastReadAt = project.lastReadAt.find(val => user!._id === val.userId);
      if (lastReadAt && project.lastMessageAt > lastReadAt.date) {
        setChatNotifications(prev => prev+1);
      }
    }
  }, [projects]);

  useEffect(() => {
    if (isLoggedIn === true) {
      fetchUserProjects();
    }
  }, [isLoggedIn]);

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

        <Route path="/verify" element={<Verification fetchUserStatus={fetchUserStatus} user={user}/>}/>

        <Route element={<AuthenticatedRoute isLoggedIn={isLoggedIn} user={user}/>}>

          <Route path="/" element={
            <MatchingPage chatNotifications={chatNotifications} userMap={userMap} fetchUser={fetchUser}/>
          } />
         
          <Route path="/matching" element={
            <MatchingPage chatNotifications={chatNotifications} userMap={userMap} fetchUser={fetchUser}/>
          } />

          <Route path="/chat" element={
            <ChatPage 
              user={user}
              socket={socket}
              socketEvents={socketEvents}
              setSocketEvents={setSocketEvents}
              chatNotifications={chatNotifications}
              fetchUserProjects={fetchUserProjects}
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
              userMap={userMap}
              fetchUser={fetchUser}
              currentChat={currentChat}
              setCurrentChat={setCurrentChat}
            />
          } />

          <Route path="/settings" element={
            <SettingsPage chatNotifications={chatNotifications} fetchUserStatus={fetchUserStatus} user={user}/>
          } />

          <Route
            path="/projects"element={
            <ProjectsPage  projects={projects} chatNotifications={chatNotifications} user={user} userMap={userMap} setCurrentChat={setCurrentChat}/>}
      
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