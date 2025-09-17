import React from 'react';
import styled from 'styled-components';

export default function ImageModal({ imageUrl, onClose }) {
  return (
    <Container onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <img src={imageUrl} alt="Full size" />
      </div>
    </Container>
  );
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);

  .modal-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    
    img {
      max-width: 100%;
      max-height: 90vh;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }

    .close-button {
      position: absolute;
      top: -40px;
      right: -40px;
      background: none;
      border: none;
      color: white;
      font-size: 2rem;
      cursor: pointer;
      padding: 10px;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.2);
      }
    }
  }
`;