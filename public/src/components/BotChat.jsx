import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { startBotChatRoute, continueBotChatRoute, getBotHistoryRoute } from "../utils/APIRoutes";
import ChatInput from "./ChatInput";

export default function BotChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const scrollRef = useRef();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("chat-app-user"));
    if (!currentUser) {
      // Handle not logged in state
      return;
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMsg = async (msg) => {
    try {
      setIsLoading(true);
      const currentUser = JSON.parse(localStorage.getItem("chat-app-user"));
      
      if (!conversationId) {
        // Start new conversation
        const response = await axios.post(startBotChatRoute, {
          from: currentUser._id,
          message: msg
        });
        
        setConversationId(response.data.conversationId);
        setMessages(prev => [...prev, 
          { fromBot: false, message: response.data.userMessage.message },
          { fromBot: true, message: response.data.botMessage.message }
        ]);
      } else {
        // Continue existing conversation
        const response = await axios.post(continueBotChatRoute, {
          from: currentUser._id,
          conversationId,
          message: msg
        });

        setMessages(prev => [...prev,
          { fromBot: false, message: response.data.userMessage.message },
          { fromBot: true, message: response.data.botMessage.message }
        ]);
      }
    } catch (error) {
      console.error("Error sending message to bot:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            🤖
          </div>
          <div className="username">
            <h3>SOUL Bot</h3>
          </div>
        </div>
        <div className="header-buttons">
          <button 
            className="end-chat-btn"
            onClick={() => {
              if (window.confirm("Are you sure you want to end this chat with SOUL Bot?")) {
                // Add a farewell message
                setMessages(prev => [...prev, 
                  { fromBot: true, message: "Thanks for chatting with me! Feel free to come back anytime. 👋" }
                ]);
                
                // Wait a moment to show the farewell message
                setTimeout(() => {
                  navigate("/"); // Navigate back to main chat
                }, 1500);
              }
            }}
          >
            End Chat
          </button>
        </div>
      </div>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.fromBot ? "received" : "sent"}`}
            ref={index === messages.length - 1 ? scrollRef : null}
          >
            <div className="content">
              <p>{message.message}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message received">
            <div className="content">
              <p>...</p>
            </div>
          </div>
        )}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  overflow: hidden;
  background-color: #131324;

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    background-color: #080820;
    
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      
      .avatar {
        font-size: 2rem;
      }
      
      .username {
        h3 {
          color: white;
        }
      }
    }

    .header-buttons {
      .end-chat-btn {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        background-color: #9a86f3;
        color: white;
        border: none;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background-color: #4e0eff;
          transform: scale(1.05);
        }
      }
    }
  }

  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    
    .message {
      display: flex;
      align-items: center;
      
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
      }
    }
    
    .sent {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    
    .received {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;