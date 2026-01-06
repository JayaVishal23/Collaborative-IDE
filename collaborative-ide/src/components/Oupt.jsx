import React, { useState } from "react";
import "../App.css";

const Inpt = ({ out, setOutput }) => {
  const clrScrn = () => {
    setOutput("");
  };
  return (
    <div className="input-field output-field">
      <button className="clr-btn" onClick={clrScrn}>
        clear
      </button>
      <textarea value={out} />
    </div>
  );
};

export default Inpt;
