import React, { useState } from "react";
import Editor from "./Editor";
import { Toaster } from "react-hot-toast";

const App = () => {
  const [roomName, setRoom] = useState("");
  const [joined, setJoined] = useState(false);

  const joinRoom = () => {
    if (roomName.trim() === "") {
      alert("Please Enter valid room ID");
      return;
    }
    setJoined(true);
  };

  return (
    <>
      <div>
        {!joined ? (
          <div>
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomName}
              onChange={(e) => setRoom(e.target.value)}
              style={{
                padding: "8px",
                fontSize: "16px",
                width: "200px",
                marginRight: "10px",
              }}
            />

            <button
              onClick={joinRoom}
              style={{
                padding: "8px 14px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Join Room
            </button>
          </div>
        ) : (
          <Editor roomName={roomName} />
        )}
      </div>
    </>
  );
};

export default App;
