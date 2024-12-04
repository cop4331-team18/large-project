import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import "./AuthForm.css";
import { apiCall } from "./util/constants";
import { useNavigate } from "react-router-dom";
import logo from "./components/devswipe_logo.png";

interface AuthFormProps {
  fetchUserStatus: () => Promise<void>,
  isLoggedIn: boolean | null,
}

function AuthForm({ fetchUserStatus, isLoggedIn }: AuthFormProps) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [authErrorText, setAuthErrorText] = useState<string>("");

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn]);

  const handleLogin = async (e: FormEvent) => { 
    e.preventDefault();
    try {
      const response = await apiCall.post(`/login/password`, {
        username,
        password,
      });
      if (response.status === 200) {
        fetchUserStatus();
      }
    } catch (error) {
      console.error("Login failed:", error);
      setAuthErrorText("Invalid username or password.");
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setAuthErrorText("Passwords don't match!");
      return;
    }
    const button = e.currentTarget;
    button.setAttribute("disabled", "true");
    try {
      const response = await apiCall.post(`/login/signup`, {
        username,
        password,
        email,
        firstName,
        lastName,
      });
      if (response.status === 200) {
        alert("Signup successful! Please verify your email."); // TODO: delete after
        fetchUserStatus();
      }
    } catch (error: any) {
      console.error("Signup failed:", error);
      setAuthErrorText(error.response?.data?.error || "Signup failed. Please try again.");
    }
    button.removeAttribute("disabled");
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
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <h1 className="welcome-text">Welcome!</h1>
          <img src={logo} alt="Logo" className="auth-logo" />
        </div>

        <div className="auth-right"> 
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
            {authErrorText && <p className="auth-error-text">{authErrorText}</p>}
            <p>
              Don't have an account?{" "}
              <a href="#" onClick={() => {
                setAuthErrorText("");
                setIsLogin(false);
              }}>
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
            {authErrorText && <p className="auth-error-text">{authErrorText}</p>}
            <p>
              Already have an account?{" "}
              <a href="#" onClick={() => {
                setAuthErrorText("");
                setIsLogin(true);
              }}>
                Login here
              </a>
            </p>
          </div>
        )}
        </div>
      </div>
      
    
    </div>
  );
}

export default AuthForm;