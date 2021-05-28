const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server, Socket } = require("socket.io");
const { addUser, getUser, deleteUser, getUsers, getAll } = require("./users");

const io = new Server(server, {
    cors: true,
    origins: "http://localhost:3000",
});

io.on("connection", (client) => {
    console.log("connection " + client.id);
    client.on("login", ({ name, room }) => {
        const { user, error } = addUser(client.id, name, room);
        client.join(user.room);
        client.in(room).emit("alert", { connected: true, user: user.name });
        console.log("alert" + ` ${user.name} has joined the room ${user.room}`);
        io.to(room).emit("users", getUsers(room));
    });
    client.on("message", (msg) => {
        const u = getUser(client.id);
        io.to(u.room).emit("message", { username: u.name, body: msg.body });
    });
    client.on("disconnect",()=>{
        const u =getUser(client.id);
        client.in(u.room).emit("alert", { connected: false, user: u.name });
    })
    client.on("timeout",(room) => {
        const us = getUsers(room);
        us.forEach(u => deleteUser(u.id));
    })
});



server.listen(9000, () => {
    console.log("server loaded");
});
