import * as Y from "yjs";
import { useState, useRef, useEffect } from "react";
import { WebsocketProvider } from "y-websocket";

const doc = new Y.Doc();
const ide = doc.getText("ide");

const provider = new WebsocketProvider(
  "wss://demos.yjs.dev/ws",
  "vishal-room",
  doc
);

function App() {
  const [value, setValue] = useState("");
  const textAreaRef = useRef(null);

  useEffect(() => {
    const observer = () => {
      setValue(ide.toString());
    };

    ide.observe(observer);

    return () => {
      ide.unobserve(observer);
    };
  }, []);

  const handleChange = (e) => {
    const newValue = e.target.value;

    ide.delete(0, ide.length);
    ide.insert(0, newValue);
  };

  return (
    <>
      <div>
        <h2>Collaborative IDE</h2>
        <textarea
          ref={textAreaRef}
          value={value}
          onChange={handleChange}
        ></textarea>
      </div>
    </>
  );
}

export default App;
