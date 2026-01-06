import React from "react";
import "../App.css";
import axios from "axios";

const Run = ({ editor, input, setOutput }) => {
  const runCodeURL = import.meta.env.VITE_RUN_CODE;
  const runCode = async () => {
    if (!editor) {
      alert("Please wait");
      return;
    }
    // const start = Date.now();
    const code = editor.getValue();
    try {
      const resp = await axios.post(runCodeURL, {
        input: input,
        code: code,
        language: "python",
      });
      if (resp.data.output) {
        // const end = Date.now();
        // const duration = end - start;

        // console.log(`Total Execution Time: ${duration}ms`);
        setOutput(resp.data.output);
      } else {
        setOutput(resp.data.error);
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
