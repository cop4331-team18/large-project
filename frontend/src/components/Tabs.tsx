import { useNavigate } from "react-router-dom";

interface TabsPop {
    chatNotifications: number;
    currentTab: string;
}

const Tabs: React.FC<TabsPop> = ({currentTab, chatNotifications}: TabsPop) => {
    const navigate = useNavigate();
    
    return (
        <div className="tabs">
            {currentTab === "chat" ? 
            <div className="tab active">
                <span>Chat</span>
                {chatNotifications > 0 && <span className="chat-notifications">{chatNotifications}</span>}
            </div>
            :
            <div className="tab" onClick={() => navigate("/chat")}>
                <span>Chat</span>
                {chatNotifications > 0 && <span className="chat-notifications">{chatNotifications}</span>}
            </div>}
            {currentTab === "matching" ? 
            <div className="tab active">
                <span>Matching</span>
            </div>
            :
            <div className="tab" onClick={() => navigate("/")}>
                <span>Matching</span>
            </div>}

            <div className="logo-container">
                <img src="/devswipe_logo.png" alt="Logo" className="tabs-logo" />
            </div>
            
            {currentTab === "projects" ? 
            <div className="tab active">
                <span>Projects</span>
            </div>
            :
            <div className="tab" onClick={() => navigate("/projects")}>
                <span>Projects</span>
            </div>}

            {currentTab === "settings" ? 
            <div className="tab active">
                <span>Settings</span>
            </div>
            :
            <div className="tab" onClick={() => navigate("/settings")}>
                <span>Settings</span>
            </div>}
      </div>
    );
};

export default Tabs;