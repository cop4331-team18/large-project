import { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import './AuthForm.css';

function AuthForm() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/login', { username, password });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    try {
      await axios.post('/api/signup', { username, password });
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  return (
    <div className="main">
      {isLogin ? (
        <div className="login-form">
          <h1>Login</h1>
          <input
            type="text"
            placeholder="Enter your Username"
            value={username}
            onChange={handleUsernameChange}
          />
          <input
            type="password"
            placeholder="Enter your Password"
            value={password}
            onChange={handlePasswordChange}
          />
          <button onClick={handleLogin}>Login</button>
          <p>
            Don't have an account?{' '}
            <a href="#" onClick={() => setIsLogin(false)}>
              Create an account
            </a>
          </p>
        </div>
      ) : (
        <div className="signup-form">
          <h1>Sign Up</h1>
          <input
            type="text"
            placeholder="Create Username"
            value={username}
            onChange={handleUsernameChange}
          />
          <input
            type="password"
            placeholder="Create Password"
            value={password}
            onChange={handlePasswordChange}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
          />
          <button onClick={handleSignUp}>Sign Up</button>
          <p>
            Already have an account?{' '}
            <a href="#" onClick={() => setIsLogin(true)}>
              Login here
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default AuthForm;
