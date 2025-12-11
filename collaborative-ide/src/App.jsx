import React, { useState } from "react";
import Editor from "./Editor";
import { Toaster } from "react-hot-toast";
import "./App.css";

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
      <div className="app-wrapper">
        {!joined ? (
          <div className="login-container">
            <div className="login-card">
              <h2 className="logo-text">Collaborative IDE</h2>

              <div className="input-group">
                <input
                  type="text"
                  className="input-box"
                  placeholder="Enter Room ID"
                  value={roomName}
                  onChange={(e) => setRoom(e.target.value)}
                />

                <button onClick={joinRoom} className="btn-join">
                  Join Room
                </button>
              </div>

              <p className="footer-text">
                Real-time collaboration for developers
              </p>
            </div>
          </div>
        ) : (
          <Editor roomName={roomName} />
        )}
      </div>
    </>
  );
};

export default App;
