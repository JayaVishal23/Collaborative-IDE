import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/bin/utils";

const app = express();
const port = 1234;
const server = http.createServer(app);

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

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
