const express = require("express");
const basicAuth = require("express-basic-auth");
const { spawn } = require("node-pty");
const WebSocket = require("ws");
const http = require("http");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

app.use(basicAuth({
  users: { 'admin': 'changeme42pleaseasatest' },
  challenge: true
}));

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  const shell = spawn("bash", [], {
    name: "xterm-color",
    cols: 160,
    rows: 60,
    cwd: process.env.HOME,
    env: process.env,
  });

  shell.on("data", (data) => {
    ws.send(data);
  });

  ws.on("message", (msg) => {
    shell.write(msg);
  });

  ws.on("close", () => {
    shell.kill();
  });
});

server.listen(port, () => {
  console.log(`App running on port ${port}`);
});
