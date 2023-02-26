import React from "react";
import styled from "styled-components";
import Robot from "../assets/robot.gif";
import Logout from "./Logout";
import '../index.css'

export default function Welcome({ currentUser }) {
  return (
    <div className="welcome-main">
      <div className="welcome-header">
        <Logout />
      </div>
      <Container>
        <img src={Robot} alt="Robot" />
        <h1>
          Welcome, <span>{currentUser.username}</span>
        </h1>
        <h3>Please select a chat to Start Messaging</h3>
      </Container>
    </div>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: white;
  img{
    height: 20rem;
  }
  span{
    color: #4e00ff;
  }
`;
