import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthForm from './AuthForm';
import HomePage from './HomePage';
import MatchingPage from './MatchingPage';
import ChatPage from './Chat';
import { apiCall, SERVER_BASE_URL, User } from './util/constants';
import { io, Socket } from 'socket.io-client';
import "./App.css"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

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
        socket.close();
      }
      setSocket(null);
    }
  }

  const fetchUserStatus = async () => {
    const response = await apiCall.get(`/login/status`);
    const data: any = response.data;
    console.log(data);
    setIsLoggedIn(data.loginStatus as boolean);
    setUser(data.user as User);
    refreshSocket(data.loginStatus);
  };

  useEffect(() => {
    if (socket) {
      socket.on("connection", (data) => {
        console.log(data)
      })
    }
  }, [socket])

  useEffect(() => {
    fetchUserStatus();
  }, []);

  return (
    <Router>
      <Routes>

        <Route path="/" element={<HomePage user={user} fetchUserStatus={fetchUserStatus} isLoggedIn={isLoggedIn}/>} />
        <Route
         path="/login"
         element={<AuthForm fetchUserStatus={fetchUserStatus} isLoggedIn={isLoggedIn}/>}
        />
        <Route path="/matching" element={<MatchingPage />} />
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
        <Route path="/chat" element={<ChatPage socket={socket}/>} />
        
      </Routes>
    </Router>
  );
}

export default App;