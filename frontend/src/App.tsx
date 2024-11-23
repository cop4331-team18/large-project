import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthForm from './AuthForm';
import HomePage from './HomePage';
import { SERVER_BASE_URL } from './util/constants';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserStatus = async () => {
      const response = await fetch(`${SERVER_BASE_URL}/login/status`);
      const data = await response.json();
      setIsLoggedIn(data.loginStatus);
      setUser(data.user);
    };
    fetchUserStatus();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="" element={<HomePage user={user}/>} />
        <Route
         path="/login"
         element={user ? <Navigate to="/" replace /> : <AuthForm setIsLoggedIn={setIsLoggedIn} setUser={setUser} />}
        />
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;