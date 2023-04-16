import styled from "styled-components";
import { FcEndCall, FcVideoCall, FcNoVideo } from "react-icons/fc";
import { AiFillAudio, AiOutlineAudioMuted } from "react-icons/ai";
import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../context/SocketProvider";
import peer from "../service/peer";

const Call = ({ setIsCalling, currentUser, currentChat }) => {
  const socket = useSocket();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [localStream, setLocalStream] = useState();
  const [streamMedia, setStreamMedia] = useState();
  const [remoteStream, setRemoteStream] = useState();

  // const sendStreams = useCallback(() => {
  //   console.log(">>>Inside sendStreams", localStream);
  //   for (const track of localStream.getTracks()) {
  //     peer.peer.addTrack(track, localStream);
  //   }
  // }, [localStream]);

  useEffect(() => {
    (async () => {
      const stream = await navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: true,
        })
        .then((streaming) => {
          for (const track of streaming.getTracks()) {
            peer.peer.addTrack(track, streaming);
          }
          setLocalStream(streaming);
        });

      const channel = await peer.peer.createDataChannel("chat");
      channel.onopen = () => {
        channel.send("Hi Testing");
      };
      channel.onmessage = (event) => {
        console.log(">>>>>>Channel msg", event.data);
      };

      //   sendStreams();
    })();
  }, []);

  const handleCallAccepted = useCallback(async ({ from, ans }) => {
    console.log(">>>call accepted");
    await peer.setLocalDescription(ans);
    //   sendStreams();
  }, []);

  const handleNegoNeeded = useCallback(async () => {
    console.log(">>>handleNegoNeeded");
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: currentChat._id });
  }, [currentChat._id, socket]);

  const icecandidate = useCallback(async () => {
    console.log(">>>>icecandidate call");
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    peer.peer.addEventListener("icecandidate", icecandidate);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
      peer.peer.removeEventListener("icecandidate", icecandidate);
    };
  }, [icecandidate]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      console.log(">>>>handleNegoNeedIncomming");
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
      // sendStreams();
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    console.log(">>>handleNegoNeedFinal");
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!", remoteStream);
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    return () => {
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

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

  const callEnd = () => {
    peer.peer.close();
    setIsCalling(false);
  };

  const toggleAudio = () => {
    let audioTrack = localStream
      .getTracks()
      .find((track) => track.kind === "audio");
    console.log(">>>>>audioTrack", audioTrack);
    if (audioTrack.enabled) {
      audioTrack.enabled = false;
      //   setIsAudioOn(false);
    } else {
      audioTrack.enabled = true;
      //   setIsAudioOn(true);
    }
  };

  const toggleVideo = () => {
    let videoTrack = localStream
      .getTracks()
      .find((track) => track.kind === "video");

    console.log(">>>>videoTrack", videoTrack);
    if (videoTrack.enabled) {
      videoTrack.enabled = false;
      //   setIsVideoOn(false);
    } else {
      videoTrack.enabled = true;
      //   setIsVideoOn(true);
    }
  };

  return (
    <Container>
      <div className="streams">
        <div className="localStream">
          {userInfo(currentUser)}
          <div className="stream">
            <ReactPlayer
              playing={true}
              height="100%"
              width="100%"
              url={localStream}
            />
          </div>
        </div>
        <div className="remoteStream">
          {userInfo(currentChat)}
          <div className="stream">
            {remoteStream ? (
              <ReactPlayer
                playing={true}
                height="100%"
                width="100%"
                url={remoteStream}
              />
            ) : (
              "NO RemoteStream found"
            )}
          </div>
        </div>
      </div>
      <div className="operators">
        {isAudioOn ? (
          <AiFillAudio className="icons" onClick={toggleAudio} />
        ) : (
          <AiOutlineAudioMuted className="icons" onClick={toggleAudio} />
        )}
        {isVideoOn ? (
          <FcVideoCall className="icons" onClick={toggleVideo} />
        ) : (
          <FcNoVideo className="icons" onClick={toggleVideo} />
        )}
        <FcEndCall className="icons" onClick={callEnd} />
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
