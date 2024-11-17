import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import "./AuthForm.css";
import { SERVER_BASE_URL } from "./util/constants";

function AuthForm() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${SERVER_BASE_URL}/login/password`, {
        username,
        password,
      });
      if (response.status === 200) {
        alert("Login successful!");
        window.location.href = "/"; // Redirect to homepage
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid username or password.");
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    try {
      const response = await axios.post(`${SERVER_BASE_URL}/login/signup`, {
        username,
        password,
        email,
        firstName,
        lastName,
      });
      if (response.status === 200) {
        alert("Signup successful! Please verify your email.");
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error("Signup failed:", error);
      alert(error.response?.data?.error || "Signup failed. Please try again.");
    }
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) =>
    setUsername(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) =>
    setPassword(e.target.value);
  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) =>
    setConfirmPassword(e.target.value);
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) =>
    setEmail(e.target.value);
  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFirstName(e.target.value);
  const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) =>
    setLastName(e.target.value);

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
            Don't have an account?{" "}
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
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={handleFirstNameChange}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={handleLastNameChange}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
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
            Already have an account?{" "}
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
