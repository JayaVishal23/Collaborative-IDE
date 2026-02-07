import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/bin/utils";
import runCode from "./runCode/runcode.js";
import cors from "cors";
import client from "./db/db.js";
import * as Y from "yjs";

const app = express();
const port = 1234;
const server = http.createServer(app);

app.use(express.json());
app.use(cors());
app.use("/editor", runCode);

const wss = new WebSocketServer({ server });

wss.on("connection", (conn, req) => {
  const docName = req.url.slice(1).split("?")[0];
  console.log(`A user connected to document: ${docName}`);
  setupWSConnection(conn, req, { docName });
});

app.get("/", (req, res) => {
  console.log("Your Collaborative Server is running");
  res.send("Server is OK");
});

async function saveData(room, ydoc) {
  const binaryBlob = Y.encodeStateAsUpdate(ydoc); // 1. "Extract" the entire state (Files, Folders, Text) into a binary blob
  //Yjs produces a standard JavaScript Uint8Array
  // the Node.js Postgres driver requires a Node specific Buffer object
  // to recognize that the data should be stored as binary BYTEA
  const buffer = Buffer.from(binaryBlob);
  await client.query(
    `INSERT INTO project(roomid,ydocblob,lastsaved) VALUES($1,$2,NOW()) 
     ON CONFLICT (roomid) 
     DO UPDATE SET ydocblob=$2, lastsaved=NOW();`,
    [room, buffer],
  );
}

async function getData(room) {
  const data = await client.query(
    "SELECT ydocblob FROM project WHERE roomid=$1",
    [room],
  );
  console.log(data);
}

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
