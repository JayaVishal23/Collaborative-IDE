import * as Y from "yjs";
import * as monaco from "monaco-editor";
import { useState, useRef, useEffect } from "react";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import toast from "react-hot-toast";

import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

// 2. Define the MonacoEnvironment global
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

const colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#556270",
  "#C7F464",
  "#C44D58",
  "#FFA500",
  "#8E44AD",
  "#3498DB",
];

const randomColor = colors[Math.floor(Math.random() * colors.length)];

const editorStyle = {
  height: "100vh",
  width: "100vw",
};

function Editor() {
  const editorRef = useRef(null);

  //   const isInitialized = useRef(false);

  useEffect(() => {
    // if (!isInitialized.current) {
    // }

    // isInitialized.current = true;
    let name = localStorage.getItem("name");
    if (!name) {
      name = prompt("Enter your name");
      if (!name || name.trim() === "") {
        name = "Anonymous";
      }
      localStorage.setItem("name", name);
    }

    const doc = new Y.Doc();
    const ytext = doc.getText("monaco");

    const provider = new WebsocketProvider(
      "wss://demos.yjs.dev/ws",
      "room-vishal",
      doc
    );

    // To know the status of websockets connection
    // provider.on("status", (event) => {
    //   console.log("WebSocket status:", event.status);
    // });

    const awareness = provider.awareness;
    awareness.on("change", ({ added, updated, removed }) => {
      //   console.log(Array.from(awareness.getStates().values()));
    });

    awareness.setLocalStateField("user", {
      name: name,
      color: randomColor,
    });

    const editor = monaco.editor.create(editorRef.current, {
      value: "",
      language: "javascript",
      theme: "vs-dark",
      automaticLayout: true,
    });

    editorRef.current = editor;

    const binding = new MonacoBinding(
      ytext,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );

    return () => {
      binding.destroy(); // to sync changes Monaco <--> yjs
      provider.destroy(); //
      editor.dispose();
      doc.destroy();
    };
  }, []);

  return <div ref={editorRef} style={editorStyle}></div>;
}

export default Editor;
