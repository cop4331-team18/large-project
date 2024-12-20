import "./Chat.css";
import { Socket } from "socket.io-client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { apiCall, CHAT_PAGE_SIZE, ChatMessage, ChatMessageInput, getDateString, Project, User } from "./util/constants";
import Tabs from "./components/Tabs";
import InfiniteScroll from "react-infinite-scroll-component";

interface MessageViewProp {
  message: ChatMessage;
  project: Project,
  userMap: Map<string, User>
}

const MessageView: React.FC<MessageViewProp> = ({message, project, userMap}: MessageViewProp) => {
  return (
    message.messageType !== 'READ' ? 
    <div className="message-view">
      <div>
        <span><b>{message.messageType ==='CHAT' && message.sender && userMap.has(message.sender) && `@${userMap.get(message.sender)!.username}`}</b></span>
        <span><i>{getDateString(message.createdAt)}</i></span>
        <div className="message-text-and-read-container">
          <span>
            {message.message}
          </span>
          <div className="read-icon">
            <div className="read-hover">
              {project && [...project.acceptedUsers, project.createdBy].map(userId => 
                <p className="read-hover-username" key={userId}>{userMap.has(userId) && project.lastReadAt.find(val => userMap.get(userId)!._id === val.userId) && project.lastReadAt.find(val => userMap.get(userId)!._id === val.userId)!.date > message.createdAt && `@${userMap.get(userId)!.username}`}</p>
              )}
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="black" className="bi bi-eye" viewBox="0 0 16 16">
              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
              <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
    :
    <></>
  );
}

interface ChatProps {
  user: User | null;
  socket: Socket | null;
  socketEvents: Set<string>;
  setSocketEvents: React.Dispatch<React.SetStateAction<Set<string>>>;
  chatNotifications: number;
  fetchUserProjects: () => Promise<void>;
  newMessages: Map<string, ChatMessage[]>;
  setNewMessages: React.Dispatch<React.SetStateAction<Map<string, ChatMessage[]>>>;
  oldMessages: Map<string, ChatMessage[]>;
  setOldMessages: React.Dispatch<React.SetStateAction<Map<string, ChatMessage[]>>>;
  oldMessagesPageNum: Map<string, number>;
  setOldMessagesPageNum: React.Dispatch<React.SetStateAction<Map<string, number>>>;
  oldMessagesHasNext: Map<string, boolean>;
  setOldMessagesHasNext: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
  oldMessagesViewDate: Map<string, Date>;
  setOldMessagesViewDate: React.Dispatch<React.SetStateAction<Map<string, Date>>>;
  projects: Project[];
  userMap: Map<string, User>;
  fetchUser: (id: string) => Promise<User>;
  currentChat: string,
  setCurrentChat: React.Dispatch<React.SetStateAction<string>>;
}

const ChatPage: React.FC<ChatProps> = ({
  user,
  socket, 
  chatNotifications,
  newMessages,
  oldMessages,
  setOldMessages,
  oldMessagesPageNum,
  setOldMessagesPageNum,
  oldMessagesHasNext,
  setOldMessagesHasNext,
  oldMessagesViewDate,
  setOldMessagesViewDate,
  projects,
  userMap,
  currentChat,
  setCurrentChat,
}: ChatProps) => {
  const [messageInput, setMessageInput] = useState<string>('');
  const [isLoadingOldMessages, setIsLoadingOldMessages] = useState<boolean>(false);

  const handleMessageInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
  };

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
    const createdAtBefore = oldMessagesViewDate.get(currentChat) || new Date();
    if (!oldMessagesViewDate.get(currentChat)) {
      setOldMessagesViewDate(prev => new Map(prev).set(currentChat, createdAtBefore));
    }
    const pageNum: number = oldMessagesPageNum.get(currentChat) || 0;
    const response = await apiCall.get("/chat/getpage", {
      params: {
        projectId: currentChat,
        createdAtBefore: createdAtBefore,
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
    if (currentChat) {
      if (!oldMessages.get(currentChat)) {
        loadOldMessages();
      }
      const project = projects.find(val => val._id === currentChat);
      if (project) {
        const lastReadAt = project.lastReadAt.find(val => user!._id === val.userId);
        if (socket && lastReadAt && project.lastMessageAt > lastReadAt.date) {
          socket.emit("read", {message: '', project: currentChat});
        }
      }
    }
  }, [currentChat]);

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
              {user && project.lastReadAt.find(val => val.userId === user._id) && project.lastMessageAt > project.lastReadAt.find(val => val.userId === user._id)!.date ?  
              <p><b>
                {project.name}
              </b></p>
              :
              <p>{project.name}</p>
              }
            </div>
          )}
        </div>
        <div className="right-panel">
          <h1>{projects && currentChat && projects.find((project) => project._id === currentChat) && projects.find((project) => project._id === currentChat)!.name}</h1>
          <div className="message-container" id="message-container">
            {projects.find((project) => project._id === currentChat) && (newMessages.get(currentChat) || []).map(message => 
              <MessageView key={message._id} message={message} userMap={userMap} project={projects.find((project) => project._id === currentChat)!}/> 
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
                projects.find((project) => project._id === currentChat) && (oldMessages.get(currentChat) || []).map(message =>
                  <div key={message._id}>
                    <MessageView userMap={userMap} message={message} project={projects.find((project) => project._id === currentChat)!}/>
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
