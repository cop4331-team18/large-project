import { User } from '../../backend/src/util/types';

// Define a type for the user data we receive from the API
type SafeUser = Omit<User, 'password' | 'salt' | 'verificationToken'>;

interface HomePageProps {
    user: SafeUser;
}

const HomePage = ({ user }: HomePageProps) => {
    return (
        <div className="main">
            <div className="home-container">
                <h1>Welcome, {user.firstName}!</h1>
                <p>
                    We're glad to have you here. Enjoy exploring the application!
                </p>
            </div>
        </div>
    );
};

export default HomePage;
