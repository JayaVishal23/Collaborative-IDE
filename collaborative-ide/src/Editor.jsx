import * as Y from "yjs";
import * as monaco from "monaco-editor";
import { useState, useRef, useEffect } from "react";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import toast from "react-hot-toast";
import { AiOutlineFile } from "react-icons/ai";
import "./App.css";
import Run from "./components/Run.jsx";

import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

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

const Editor = ({ roomName }) => {
  const editorRef = useRef(null);

  const [ydoc, setYdoc] = useState(null);
  const [provider, setProvider] = useState(null);
  const [editor, setEditor] = useState(null);
  const [binding, setBinding] = useState(null);

  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState(null);

  useEffect(() => {
    const doc = new Y.Doc();

    const provider = new WebsocketProvider(
      "ws://localhost:1234",
      roomName,
      doc
    );

    setYdoc(doc);
    setProvider(provider);

    const fileMap = doc.getMap("files");

    fileMap.observe(() => {
      setFiles(fileMap.toJSON());
    });

    if (fileMap.size === 0) {
      fileMap.set("main.js", { name: "main.js", language: "javascript" });
      setFiles(fileMap.toJSON());
      setActiveFile("main.js");
    }

    return () => {
      provider.destroy();
      doc.destroy();
    };
  }, [roomName]);

  useEffect(() => {
    let name = localStorage.getItem("name");
    if (!name) {
      name = prompt("Enter your name");
      if (!name || name.trim() === "") {
        name = "Anonymous";
      }
      localStorage.setItem("name", name);
    }
    if (!provider) return;
    const awareness = provider.awareness;

    awareness.setLocalStateField("user", {
      name,
      color: randomColor,
    });

    if (!editorRef.current) return;
    const neweditor = monaco.editor.create(editorRef.current, {
      value: "",
      language: "javascript",
      theme: "vs-dark",
      automaticLayout: true,
    });

    setEditor(neweditor);
    return () => {
      neweditor.dispose();
    };
  }, [provider]);

  useEffect(() => {
    if (!editor || !ydoc || !provider || !activeFile) return;
    if (binding) binding.destroy();

    const yText = ydoc.getText(activeFile);

    const newbinding = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );

    setBinding(newbinding);
  }, [activeFile, editor, ydoc, provider]);

  const createNewFile = () => {
    const path = prompt("Enter file path (e.g. src/components/App.js)");
    const lang = prompt("Enter lanuage");
    if (!path || !ydoc) return;

    const fileMap = ydoc.getMap("files");
    fileMap.set(path, { name: path, language: lang });
    setActiveFile(path);
  };

  const buildFileTree = (fileMap) => {
    let root = {};
    Object.keys(fileMap)
      .sort()
      .forEach((path) => {
        const parts = path.split("/");
        let currentLevel = root;
        parts.forEach((part, index) => {
          let isFile = index === parts.length - 1;
          if (!isFile) {
            if (!currentLevel[part]) {
              currentLevel[part] = { type: "folder", children: {} };
            }
            currentLevel = currentLevel[part].children;
          } else {
            currentLevel[part] = {
              ...fileMap[path],
              type: "file",
              path,
            };
          }
        });
      });
    return root;
  };

  const fileTree = buildFileTree(files);

  const FileNode = ({ fileName, node, activeFile, onSelect, depth }) => {
    if (node.type === "folder") {
      return (
        <div key={fileName}>
          <div
            style={{
              padding: "4px 8px",
              color: "#888",
              fontWeight: "bold",
              fontSize: "14px",
              paddingLeft: `${depth * 10 + 10}px`,
            }}
          >
            📁
            {fileName}/
          </div>
          {Object.keys(node.children)
            .sort((a, b) => {
              const nodeA = node.children[a];
              const nodeB = node.children[b];

              if (nodeA.type === nodeB.type) {
                return a.localeCompare(b);
              }

              return nodeA.type === "file" ? -1 : 1;
            })
            .map((childName) => (
              <FileNode
                key={childName}
                fileName={childName}
                node={node.children[childName]}
                activeFile={activeFile}
                onSelect={onSelect}
                depth={depth + 1}
              />
            ))}
        </div>
      );
    }

    return (
      <div
        onClick={() => onSelect(node.path)}
        style={{
          paddingLeft: `${depth * 10 + 10}px`,
          paddingTop: "6px",
          paddingBottom: "6px",
          cursor: "pointer",
          background: activeFile === node.path ? "#37373d" : "transparent",
          color: activeFile === node.path ? "#fff" : "#ccc",
          fontSize: "15px",
        }}
      >
        <span style={{ marginRight: "5px" }}>📄</span>
        {fileName}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <div
        style={{
          width: "250px",
          background: "#1f1f1f",
          color: "#e6e6e6",
          borderRight: "1px solid #333",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Segoe UI, sans-serif",
        }}
      >
        <div
          style={{
            padding: "12px 10px",
            fontWeight: "600",
            fontSize: "12px",
            color: "#9e9e9e",
            borderBottom: "1px solid #333",
            letterSpacing: "1px",
          }}
        >
          Distributed Collaborative IDE
        </div>

        <button
          onClick={createNewFile}
          style={{
            margin: "10px",
            padding: "7px 10px",
            width: "calc(100% - 20px)",
            background: "#0e639c",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "500",
          }}
        >
          + New File
        </button>
        <div className="file-tree-container">
          {Object.keys(fileTree).map((fileName) => (
            <FileNode
              key={fileName}
              fileName={fileName}
              node={fileTree[fileName]}
              activeFile={activeFile}
              onSelect={setActiveFile}
              depth={0}
            />
          ))}
        </div>

        {/* <div style={{ overflowY: "auto" }}>
          {Object.keys(files).map((fileName) => {
            const lang = files[fileName]?.language || "default";
            const iconColor =
              lang.includes("js") || lang.includes("ts")
                ? "#F7DF1E"
                : lang.includes("html")
                ? "#DD4B25"
                : lang.includes("css")
                ? "#2965F1"
                : lang.includes("json")
                ? "#6DB33F"
                : "#e6e6e6";

            return (
              <div
                key={fileName}
                onClick={() => setActiveFile(fileName)}
                style={{
                  padding: "6px 10px",
                  cursor: "pointer",
                  background: activeFile === fileName ? "#333" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  transition: "0.15s",
                }}
                onMouseEnter={(e) => {
                  if (activeFile !== fileName)
                    e.target.style.background = "#2a2a2a";
                }}
                onMouseLeave={(e) => {
                  if (activeFile !== fileName)
                    e.target.style.background = "transparent";
                }}
              >
                <AiOutlineFile size={14} color={iconColor} /> {fileName}
              </div>
            );
          })}
        </div> */}
      </div>
      <div className="editor-wrapper">
        <Run editor={editor} />
        <div ref={editorRef} style={{ flex: 1, height: "100%" }}></div>
      </div>
    </div>
  );
};

export default Editor;
