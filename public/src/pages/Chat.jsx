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
      </Container>
    </>
  );
}

const Container = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #232526 0%, #414345 100%);
  .container {
    height: 85vh;
    width: 85vw;
    background: rgba(30, 32, 60, 0.95);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    border-radius: 24px;
    display: grid;
    grid-template-columns: 25% 75%;
    overflow: hidden;
    border: 1.5px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(8px);
    position: relative;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
