import { useState, useRef, useEffect } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import "./App.css";

const doc = new Y.Doc();
const counter = doc.getMap("counter");

if (counter.get("count") === undefined) {
  counter.set("count", 0);
}

const provider = new WebsocketProvider(
  "wss://demos.yjs.dev/ws",
  "vishal-shared-room",
  doc
);

function App() {
  const [count, setCount] = useState(counter.get("count"));

  useEffect(() => {
    const observer = () => {
      setCount(counter.get("count"));
    };
    counter.observe(observer);
    return () => counter.unobserve(observer);
  }, []);

  const increment = () => {
    counter.set("count", counter.get("count") + 1);
  };
  return (
    <>
      <div className="card">
        <button onClick={increment}>count is {count}</button>
      </div>
    </>
  );
}

export default App;
