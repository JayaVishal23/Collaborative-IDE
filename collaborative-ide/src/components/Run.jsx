import React from "react";
import "../App.css";
import axios from "axios";

const Run = ({ editor }) => {
  const runCodeURL = import.meta.env.VITE_RUN_CODE;
  const runCode = async () => {
    if (!editor) {
      alert("Please wait");
      return;
    }
    const code = editor.getValue();
    try {
      const resp = await axios.post(runCodeURL, {
        code: code,
        language: "python",
      });
      if (resp.data.output) {
        console.log(resp.data.output);
      } else {
        console.log(resp.data.error);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <button className="btn-run" onClick={runCode}>
      <span className="play-icon"></span>
      Run
    </button>
  );
};

export default Run;
