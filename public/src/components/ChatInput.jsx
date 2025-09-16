import React, { useState, useRef } from "react";
import axios from "axios";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import { FaPaperclip } from "react-icons/fa";
import styled from "styled-components";
import Picker from "emoji-picker-react";
import { uploadRoute } from "../utils/APIRoutes";

export default function ChatInput({ handleSendMsg, socket, currentChat, userId }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef();

  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (event, emojiObject) => {
    setMsg((prev) => prev + emojiObject.emoji);
  };

  // Typing indicator logic
  let typingTimeout = null;
  const sendTyping = () => {
    if (socket && socket.current && currentChat && userId) {
      socket.current.emit("typing", { to: currentChat._id, from: userId });
      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socket.current.emit("stop-typing", { to: currentChat._id, from: userId });
      }, 1500);
    }
  };

  const handleInputChange = (e) => {
    setMsg(e.target.value);
    sendTyping();
  };

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg("");
      if (socket && socket.current && currentChat && userId) {
        socket.current.emit("stop-typing", { to: currentChat._id, from: userId });
      }
    }
  };

  // File upload handler
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(uploadRoute, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Send file message
      handleSendMsg({
        file: res.data.url,
        filename: res.data.originalname,
        mimetype: res.data.mimetype,
      });
    } catch (err) {
      alert("Failed to upload file.");
      console.error(err);
    }
    e.target.value = ""; // reset for next upload
  };

  const onAttachClick = () => {
    fileInputRef.current.click();
  };

  return (
    <Container>
      {/* Hidden file input at root for accessibility */}
      <input
        id="file-upload-input"
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{
          display: "none",
          position: "absolute",
          zIndex: 99999,
          pointerEvents: "auto",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
        }}
        onChange={handleFileChange}
      />
      <div className="button-container">
        <div className="emoji">
          <BsEmojiSmileFill onClick={handleEmojiPickerhideShow} />
          {showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />}
        </div>
        {/* File upload button uses label for accessibility */}
        <label htmlFor="file-upload-input" className="attach-btn" title="Attach Image" style={{margin:0, padding:0, cursor:'pointer', display:'flex', alignItems:'center'}}>
          <FaPaperclip />
        </label>
      </div>
      <form className="input-container" onSubmit={sendChat}>
        <input
          type="text"
          placeholder="type your message here"
          onChange={handleInputChange}
          value={msg}
        />
        <button type="submit">
          <IoMdSend />
        </button>
      </form>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  background-color: #080420;
  padding: 0 2rem 1.2rem 2rem;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    padding: 0 1rem 1.2rem 1rem;
    gap: 1rem;
  }
  .button-container {
    display: flex;
    align-items: center;
    color: white;
    gap: 0.7rem;
    position: relative;
    z-index: 100;
    margin-right: 0.7rem;
    .emoji {
      position: relative;
      svg {
        font-size: 1.5rem;
        color: #ffff00c8;
        cursor: pointer;
      }
      .emoji-picker-react {
        position: absolute;
        top: -350px;
        background-color: #080420;
        box-shadow: 0 5px 10px #9a86f3;
        border-color: #9a86f3;
        .emoji-scroll-wrapper::-webkit-scrollbar {
          background-color: #080420;
          width: 5px;
          &-thumb {
            background-color: #9a86f3;
          }
        }
        .emoji-categories {
          button {
            filter: contrast(0);
          }
        }
        .emoji-search {
          background-color: transparent;
          border-color: #9a86f3;
        }
        .emoji-group:before {
          background-color: #080420;
        }
      }
    }
    .attach-btn {
      background: transparent;
      border: none;
      color: #ffe600;
      font-size: 1.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
      margin: 0 0.2rem;
      z-index: 101;
      pointer-events: auto;
      position: relative;
      &:hover,
      &:focus {
        color: #fff176;
        outline: none;
      }
    }
  }
  .input-container {
    flex: 1 1 auto;
    border-radius: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    background-color: #ffffff34;
    min-height: 48px;
    box-sizing: border-box;
    input {
      flex: 1 1 auto;
      min-width: 0;
      background-color: transparent;
      color: white;
      border: none;
      padding-left: 1rem;
      font-size: 1.2rem;
      &::selection {
        background-color: #9a86f3;
      }
      &:focus {
        outline: none;
      }
    }
    button {
      padding: 0.3rem 1.5rem;
      border-radius: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #9a86f3;
      border: none;
      margin-left: 0.5rem;
      @media screen and (min-width: 720px) and (max-width: 1080px) {
        padding: 0.3rem 1rem;
        svg {
          font-size: 1rem;
        }
      }
      svg {
        font-size: 2rem;
        color: white;
      }
    }
  }
`;
