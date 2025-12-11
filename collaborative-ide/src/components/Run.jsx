import React from "react";
import "../App.css";

const Run = () => {
  const runCode = () => {
    console.log("Hello");
  };

  return (
    <button className="btn-run" onClick={runCode}>
      <span className="play-icon"></span>
      Run
    </button>
  );
};

export default Run;
