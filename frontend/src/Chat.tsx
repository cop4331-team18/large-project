import "./Chat.css";
import { Socket } from "socket.io-client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { apiCall, CHAT_PAGE_SIZE, ChatMessage, ChatMessageInput, getDateString, Project } from "./util/constants";
import Tabs from "./components/Tabs";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";

interface ChatProps {
  socket: Socket | null;
  socketEvents: Set<string>;
  setSocketEvents: React.Dispatch<React.SetStateAction<Set<string>>>;
  chatNotifications: number;
  setChatNotifications: React.Dispatch<React.SetStateAction<number>>;
  isLoggedIn: boolean | null;
  newMessages: Map<string, ChatMessage[]>;
  setNewMessages: React.Dispatch<React.SetStateAction<Map<string, ChatMessage[]>>>;
  oldMessages: Map<string, ChatMessage[]>;
  setOldMessages: React.Dispatch<React.SetStateAction<Map<string, ChatMessage[]>>>;
  oldMessagesPageNum: Map<string, number>;
  setOldMessagesPageNum: React.Dispatch<React.SetStateAction<Map<string, number>>>;
  oldMessagesHasNext: Map<string, boolean>;
  setOldMessagesHasNext: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
  messagesResConnectDate: Date;
  setMessagesResConnectDate: React.Dispatch<React.SetStateAction<Date>>;
}

const ChatPage: React.FC<ChatProps> = ({
  socket, 
  socketEvents,
  setSocketEvents,
  chatNotifications,
  setChatNotifications,
  isLoggedIn,
  newMessages,
  setNewMessages,
  oldMessages,
  setOldMessages,
  oldMessagesPageNum,
  setOldMessagesPageNum,
  oldMessagesHasNext,
  setOldMessagesHasNext,
  messagesResConnectDate,
  setMessagesResConnectDate,
}: ChatProps) => {
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentChat, setCurrentChat] = useState<string>('');
  const [isLoadingOldMessages, setIsLoadingOldMessages] = useState<boolean>(false);

  const handleMessageInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
  };

  useEffect(() => {
    if (socket) {
      if (!socketEvents.has("message-res")) {
        setSocketEvents(prev => prev.add("message-res"));
        setMessagesResConnectDate(new Date());
        socket.on("messasge-res", (data: ChatMessage) => {
          setNewMessages(prev => {
            const newMap = new Map(prev);
            const messages: ChatMessage[] = newMap.get(data.project) || [];
            newMap.set(data.project, [data, ...messages]);
            return newMap;
          });
          setChatNotifications(prev => {
            return prev+1;
          });
        });
      }
    }
  }, [socket]);

  const fetchUserProjects = async() => {
    const response = await apiCall.get(`/projects/get`);
    const data: any = response.data;
    setProjects(data.projects);
    if (data.projects.length > 0) {
      setCurrentChat(data.projects[0]._id);
    }
  };

  useEffect(() => {
    if (isLoggedIn === false) {
      navigate("/login");
    } else if (isLoggedIn === true) {
      fetchUserProjects();
    }
}, [isLoggedIn]);

  const sendChatMessage = (e: FormEvent) => {
    e.preventDefault();
    if (socket && messageInput) {
      const message: ChatMessageInput = {
        message: messageInput,
        project: currentChat,
      };
      socket.emit("chat", message);
      setMessageInput("");
      const button = e.currentTarget;
      button.setAttribute("disabled", "true");
      setTimeout(() => {
        button.removeAttribute("disabled");
      }, 750);
    }
  };

  const loadOldMessages = async() => {
    setIsLoadingOldMessages(true);
    const pageNum: number = oldMessagesPageNum.get(currentChat) || 0;
    const response = await apiCall.get("/chat/getpage", {
      params: {
        projectId: currentChat,
        createdAtBefore: messagesResConnectDate,
        pageNum: pageNum,
        pageSize: CHAT_PAGE_SIZE,
      }
    });
    const data: any = response.data;
    const messages: ChatMessage[] = data.messages;
    setOldMessages(prev => {
      const newMap = new Map(prev);
      const oldMessagesForCurrentChat: ChatMessage[] = newMap.get(currentChat) || [];
      newMap.set(currentChat, [...oldMessagesForCurrentChat, ...messages]);
      return newMap;
    });
    setOldMessagesHasNext(prev => prev.set(currentChat, data.hasNext));
    setOldMessagesPageNum(prev => prev.set(currentChat, pageNum+1));
    setIsLoadingOldMessages(false);
  }

  useEffect(() => {
    if (currentChat && !oldMessages.get(currentChat)) {
      loadOldMessages();
    }
  }, [currentChat]);

  const MessageView: React.FC<ChatMessage> = (message: ChatMessage) => {
    return (
      <div className="message-view">
        <div>
          {/* TODO: need an endpoint or some way to fetch the user from backend */}
          <span>{message.sender}</span>
          <span>{getDateString(message.createdAt)}</span>
        </div>
        <p>
          {message.message}
        </p>
      </div>
    );
  }

  return (
    <div className="chat-page">
      {/* Tabs */}
      <Tabs currentTab="chat" chatNotifications={chatNotifications}/>

      {/* Chat Content */}
      <div className="chat-container">
        <div className="left-panel">
          <h1>
            Matches
          </h1>
          {projects.length === 0 && <p>No projects found!</p>}
          {projects.map((project) => 
            <div className="chat-project" key={project._id} onClick={() => setCurrentChat(project._id)} style={{cursor: 'pointer',  background: (project._id === currentChat) ? 'Gainsboro' : ''}}>
              <p>
                {project.name}
              </p>
            </div>
          )}
        </div>
        <div className="right-panel">
          <h1>{projects && currentChat && projects.find((project) => project._id === currentChat)!.name}</h1>
          <div className="message-container" id="message-container">
            {(newMessages.get(currentChat) || []).map(message => 
              <MessageView key={message._id} {...message}/> 
            )}
            <InfiniteScroll
              dataLength={(oldMessages.get(currentChat) || []).length}
              next={loadOldMessages}
              className="infinite-scroll"
              inverse={true}
              hasMore={!isLoadingOldMessages && !!currentChat && oldMessagesHasNext.get(currentChat) === true}
              loader={<></>}
              endMessage={
                !isLoadingOldMessages && currentChat && <div>
                  <p>This is the beginning of the chat.</p>
                </div>
              }
              scrollableTarget="message-container"
            >
              {
                (oldMessages.get(currentChat) || []).map(message =>
                  <div key={message._id}>
                    <MessageView {...message}/>
                  </div>
                )
              }
            </InfiniteScroll>
            {isLoadingOldMessages && <div style={{display: "flex", justifyContent: "center", padding: "5px"}}>
              <div className="loader"></div>
            </div>}
          </div>
          {currentChat && <form className="input-container" onSubmit={sendChatMessage}>
            <input type="text" placeholder="Send a message" value={messageInput} onChange={handleMessageInputChange}></input>
            <button onClick={sendChatMessage}>➣</button>
          </form>}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
