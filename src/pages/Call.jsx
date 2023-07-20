import styled from "styled-components";
import { FcEndCall, FcVideoCall, FcNoVideo } from "react-icons/fc";
import { AiFillAudio, AiOutlineAudioMuted } from "react-icons/ai";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import Peer from "simple-peer";

const Call = ({
  currentUser,
  currentChat,
  isCallerCalling,
  callerInfo,
  callerOffer,
}) => {
  console.log(">>>INside Call", callerOffer);

  const socket = useSocket();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  
  const [stream, setStream] = useState();
  const userVideo = useRef();
  const partnerVideo = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        setStream(stream);
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }
      });
  }, []);

  useEffect(() => {
    if (isCallerCalling) {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream,
        config: {
          iceServers: [
            {
              urls: [
                "stun:stun.l.google.com:19302",
                "stun:global.stun.twilio.com:3478",
              ],
            },
          ],
        },
      });

      peer.on("signal", (data) => {
        socket.emit("user:call", {
          to: currentChat._id,
          from: currentUser,
          offer: data,
        });
      });

      peer.on("stream", (stream) => {
        if (partnerVideo.current) {
          partnerVideo.current.srcObject = stream;
        }
      });

      socket.on("call:accepted", ({ from, ans }) => {
        console.log(">>>call accepted", ans);
        peer.signal(ans);
      });
    } else {
      if (stream) {
        const peer = new Peer({
          initiator: false,
          trickle: false,
          stream: stream,
        });

        peer.on("signal", (data) => {
          socket.emit("call:accepted", { to: callerInfo._id, ans: data });
        });

        peer.on("stream", (stream) => {
          partnerVideo.current.srcObject = stream;
        });

        peer.signal(callerOffer);
      }
    }
  }, [stream]);

  const userInfo = (userInfo) => {
    return (
      <div className="userName">
        <div className="avatar">
          <img
            src={`data:image/svg+xml;base64,${userInfo.avatarImage}`}
            alt="avatar"
          />
        </div>
        <div className="name">
          <h3>{userInfo.username}</h3>
        </div>
      </div>
    );
  };

  // const callEnd = () => {
  //   peer.peer.close();
  //   setIsCalling(false);
  // };

  // const toggleAudio = () => {
  //   let audioTrack = localStream
  //     .getTracks()
  //     .find((track) => track.kind === "audio");
  //   console.log(">>>>>audioTrack", audioTrack);
  //   if (audioTrack.enabled) {
  //     audioTrack.enabled = false;
  //     //   setIsAudioOn(false);
  //   } else {
  //     audioTrack.enabled = true;
  //     //   setIsAudioOn(true);
  //   }
  // };

  // const toggleVideo = () => {
  //   let videoTrack = localStream
  //     .getTracks()
  //     .find((track) => track.kind === "video");

  //   console.log(">>>>videoTrack", videoTrack);
  //   if (videoTrack.enabled) {
  //     videoTrack.enabled = false;
  //     //   setIsVideoOn(false);
  //   } else {
  //     videoTrack.enabled = true;
  //     //   setIsVideoOn(true);
  //   }
  // };

  return (
    <Container>
      <div className="streams">
        <div className="localStream">
          {userInfo(currentUser)}
          <div className="stream">
            <video
              height="100%"
              width="100%"
              playsInline
              muted
              ref={userVideo}
              autoPlay
            />
          </div>
        </div>
        <div className="remoteStream">
          {userInfo(currentChat)}
          <div className="stream">
            {partnerVideo.current ? (
              <video
                height="100%"
                width="100%"
                playsInline
                ref={partnerVideo}
                autoPlay
              />
            ) : (
              "NO RemoteStream found"
            )}
          </div>
        </div>
      </div>
      <div className="operators">
        {isAudioOn ? (
          <AiFillAudio className="icons" /* onClick={toggleAudio} */ />
        ) : (
          <AiOutlineAudioMuted className="icons" /* onClick={toggleAudio} */ />
        )}
        {isVideoOn ? (
          <FcVideoCall className="icons" /* onClick={toggleVideo} */ />
        ) : (
          <FcNoVideo className="icons" /* onClick={toggleVideo} */ />
        )}
        <FcEndCall className="icons" /* onClick={callEnd} */ />
      </div>
    </Container>
  );
};

export default Call;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  .streams {
    display: flex;
    width: 100%;
    height: 90%;
    .localStream {
      width: 100%;
    }
    .remoteStream {
      width: 100%;
    }
    .userName {
      /* background-color: lightseagreen; */
      width: 100%;
      height: 10%;
      display: flex;
      align-items: center;
      padding: 1rem;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
          max-inline-size: 100%;
        }
      }
      .name {
        h3 {
          color: white;
        }
      }
    }
    .stream {
      background-color: lightsteelblue;
      width: 100%;
      height: 90%;
      display: flex;
      padding: 1rem;
    }
  }
  .operators {
    display: flex;
    height: 10%;
    width: 100%;
    padding: 0.5rem;
    justify-content: space-evenly;
    align-items: center;
    .icons {
      height: 2rem;
      width: 2rem;
      cursor: pointer;
    }
  }
`;
