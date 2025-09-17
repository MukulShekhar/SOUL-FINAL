import React, { useEffect, useState, useRef } from "react";
import { LOCALHOST_KEY } from "../utils/constants";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const checkUser = async () => {
      if (!localStorage.getItem(LOCALHOST_KEY)) {
        navigate("/login");
      } else {
        setCurrentUser(await JSON.parse(localStorage.getItem(LOCALHOST_KEY)));
      }
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          try {
            const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
            setContacts(data.data);
          } catch (err) {
            alert("Failed to load contacts. Please try again.");
          }
        } else {
          navigate("/setAvatar");
        }
      }
    };
    fetchContacts();
  }, [currentUser, navigate]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <>
      <Container>
        <div className="container">
          <Contacts contacts={contacts} changeChat={handleChatChange} />
          {/* Logout Button */}
          <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
            <button
              style={{
                background: "#9a86f3",
                border: "none",
                borderRadius: "12px",
                padding: "10px 16px",
                cursor: "pointer",
                color: "#fff",
                fontSize: "1.1rem",
                fontWeight: "bold",
                boxShadow: "0 2px 8px rgba(31,38,135,0.15)",
              }}
              onClick={() => {
                localStorage.removeItem(LOCALHOST_KEY);
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
          {currentChat === undefined ? (
            <Welcome />
          ) : (
            <ChatContainer currentChat={currentChat} socket={socket} />
          )}
        </div>
        {/* Bot Chat Button */}
        <button 
          className="bot-button" 
          onClick={() => navigate("/bot")}
          title="Chat with SOUL Bot"
        >
          🤖
        </button>
      </Container>
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  
  .bot-button {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 1rem;
    border-radius: 50%;
    background-color: #4f04ff21;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    color: white;
    transition: all 0.3s ease;
    &:hover {
      transform: scale(1.1);
      background-color: #4f04ff40;
    }
  }

  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
