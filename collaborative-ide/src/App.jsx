import Editor from "./Editor";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <div>
        <Toaster />

        <h2>Collaborative IDE</h2>
        <Editor />
      </div>
    </>
  );
}

export default App;
