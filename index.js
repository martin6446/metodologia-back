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
    client.on("create", ({ name, room }) => {
        const roomDateTime = Date.now();
        const { user, error } = addUser(client.id, name, {
            id: room,
            created: roomDateTime,
        });
        client.join(user.room.id);
        client.in(room).emit("alert", { connected: true, user: user.name });
        console.log(
            "alert" + ` ${user.name} has created the room ${user.room.id}`
        );
        client.emit("timer", 600000 - (Date.now() - roomDateTime));
    });

    client.on("login", ({ name, room }) => {
        console.log(getAll());
        const roomDateTime = getUsers(room)[0].room.created;
        const { user, error } = addUser(client.id, name, {
            id: room,
            created: roomDateTime,
        });
        client.join(user.room.id);
        client.in(room).emit("alert", { connected: true, user: user.name });
        console.log(
            "alert" + ` ${user.name} has joined the room ${user.room.id}`
        );
        io.to(user.room.id).emit("timer", 600000 - (Date.now() - roomDateTime));
    });

    client.on("message", (msg) => {
        const u = getUser(client.id);
        io.to(u.room.id).emit("message", { username: u.name, body: msg.body });
    });

    client.on("disconnect", () => {
        console.log(getAll());
        const u = getUser(client.id);
        client
            .in(u?.room.id)
            .emit("alert", { connected: false, user: u?.name });
    });

    client.on("reset", () => {
        const u = getUser(client.id);
        u.room.created=Date.now();
        io.to(u.room.id).emit("timer",600000-(Date.now() - u.room.created));
    });
});

server.listen(9000, () => {
    console.log("server loaded");
});
