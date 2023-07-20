import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import { allUsersRoute } from "../utils/APIRoutes";
import Call from "./Call";
import { useSocket } from "../context/SocketProvider";
import Modal from "react-modal";

const Chat = () => {
  console.log(">>>>INside CHAT");
  const socket = useSocket();
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isIncommingCall, setIsIncommingCall] = useState(false);
  const [callerInfo, setCallerInfo] = useState();
  const [callerOffer, setCallerOffer] = useState();
  const [isCallerCalling, setCallerCalling] = useState(false);

  const navigate = useNavigate();

  const handleIncommingCall = useCallback(async ({ from, offer }) => {
    
    setCallerOffer(offer);
    setCallerInfo(from);
    setIsIncommingCall(true);
  }, []);

  useEffect(() => {
    socket.on("incomming:call", handleIncommingCall);
    return () => {
      socket.on("incomming:call", handleIncommingCall);
    };
  }, [socket, handleIncommingCall]);

  /**
   * Functioning:
   * 1. If User not present in LocalStorage redirect to login Page
   * 2. Else Set AlreadyLogin User in state
   */
  useEffect(() => {
    if (!localStorage.getItem("chat-app-user")) {
      navigate("/login");
    } else {
      setCurrentUser(JSON.parse(localStorage.getItem("chat-app-user")));
      setIsLoaded(true);
    }
  }, [navigate]);

  /**
   * Funtioning:
   * 1. Create Socket connection.
   * 2. Add current User in onlineUsers socket list with API
   */
  useEffect(() => {
    if (currentUser) {
      socket.emit("add-user", currentUser._id);
    }
  }, [currentUser, socket]);

  /**
   * Functioning:
   * 1. Check curentUser present
   * 2. If CurrentUser not set there Avatar then navigate to SetAvatar Page.
   * 3. Else Fetch All Users except Current User
   * 4. Set User list in state
   *  */
  useEffect(() => {
    if (currentUser) {
      if (currentUser.isAvatarImageSet) {
        (async () => {
          const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
          setContacts(data.data);
        })();
      } else {
        navigate("/setAvatar");
      }
    }
  }, [currentUser, navigate]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  const handleBackToWelcomePage = (event) => {
    setCurrentChat(undefined);
  };

  const handleAcceptCall = async () => {
    setIsIncommingCall(false);
    setIsCalling(true);
  };

  const handleCallClick = () => {
    setCallerCalling(true);
    setIsCalling(true);
  };

  return (
    <Container>
      <Modal
        isOpen={isIncommingCall}
        style={{
          overlay: {},
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
          },
        }}
      >
        <div>
          <p>{callerInfo?.username} is calling you.</p>
          <div>
            <button onClick={handleAcceptCall}>Accept</button>
            <button>Reject</button>
          </div>
        </div>
      </Modal>
      <div className="container">
        {isCalling ? (
          <Call
            setIsCalling={setIsCalling}
            currentUser={currentUser}
            currentChat={currentChat}
            isCallerCalling={isCallerCalling}
            callerInfo={callerInfo}
            callerOffer={callerOffer}
          />
        ) : (
          <div className="chat-view">
            <Contacts
              contacts={contacts}
              currentUser={currentUser}
              changeChat={handleChatChange}
            />
            {isLoaded && currentChat === undefined ? (
              <Welcome currentUser={currentUser} />
            ) : (
              <ChatContainer
                currentChat={currentChat} // User From List to Chat with
                currentUser={currentUser} // Account Owner
                onBackClick={handleBackToWelcomePage}
                handleCallClick={handleCallClick}
              />
            )}
          </div>
        )}
      </div>
    </Container>
  );
};

export default Chat;

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 90vh;
    width: 90vw;
    background-color: #00000076;
    .chat-view {
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: 25% 75%;
      @media screen and (min-width: 720px) and (max-width: 1080px) {
        grid-template-columns: 35% 65%;
      }
    }
  }
`;
const ModalStyles = {
  content: {},
  overlay: {},
};
