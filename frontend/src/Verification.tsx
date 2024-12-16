import { FormEvent, useEffect } from "react";
import "./Verification.css";
import { apiCall, User } from "./util/constants";
import { useNavigate } from "react-router-dom";

const Verification = (props: {fetchUserStatus: () => Promise<void>, user: User | null}) => {

  const navigate = useNavigate();

  useEffect(() => {
    if (props.user && props.user.isVerified) {
      navigate("/");
    }
  }, [props.user]);

  const handleLogout = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiCall.post("/login/logout");
      if (response.status === 200) {
        props.fetchUserStatus();
      }
    } catch (error) {
      console.log(error);
    } finally {
      window.location.href = "/";
    }
  };
    
  return (
    <div className="verification-page">
      <div className="verification-container">
        <h1 className="verification-title"> ❗ </h1>
        <h1 className="verification-title">Email Verification Required</h1>
        <p className="verification-message">
          Please check your email and use the link to verify your account. Then, refresh this page.
        </p>
        <button className="log-out-btn" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Verification;
