import { useNavigate } from 'react-router-dom';
import { FormEvent, useEffect } from 'react';
import { apiCall, User } from './util/constants';


interface HomePageProps {
    user: User | null,
    isLoggedIn: boolean | null,
    fetchUserStatus: () => void,
}

const HomePage = ({ user, isLoggedIn, fetchUserStatus }: HomePageProps) => {
    const navigate = useNavigate();
    useEffect(() => {
        if (isLoggedIn === false) {
            navigate("/login");
        }
    }, [isLoggedIn]);

    const handleLogout = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await apiCall.post("/login/logout");
            if (response.status === 200) {
                alert("Logout successful!");
                fetchUserStatus();
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="main">
            <div className="home-container">
                <h1>Welcome, {user && user.username}!</h1>
                <p>
                    Verification Status: {user && user.isVerified ? "YES" : "NO"}
                </p>
                <p>
                    We're glad to have you here. Enjoy exploring the application!
                </p>
                <button onClick={handleLogout}>Log out temp</button>
            </div>
        </div>
    );
};

export default HomePage;
