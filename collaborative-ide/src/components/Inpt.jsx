import React, { useState } from "react";
import "../App.css";

const Inpt = ({ inp, onChange }) => {
  return (
    <div className="input-field">
      <textarea
        placeholder="Enter input here..."
        value={inp}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default Inpt;
