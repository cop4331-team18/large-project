import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthForm from './AuthForm';
import HomePage from './HomePage';
import MatchingPage from './MatchingPage';
import ChatPage from './chat';
import { apiCall, User } from './util/constants';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const fetchUserStatus = async () => {
    const response = await apiCall.get(`/login/status`);
    const data: any = response.data;
    console.log(data);
    setIsLoggedIn(data.loginStatus as boolean);
    setUser(data.user as User);
  };

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
        <Route path="/chat" element={<ChatPage />} />
        
      </Routes>
    </Router>
  );
}

export default App;