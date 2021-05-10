const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const {Server,Socket} = require("socket.io");

const io = new Server(server, {
    cors: true,
    origins: "http://localhost:3000",
});

io.on("connection", (client) => {
    client.send("conectado");
    client.on("message",(msg) => {
        io.emit("message",msg);
    })
});

server.listen(9000, () => {
    console.log("server loaded");
});
