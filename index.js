const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server, Socket } = require("socket.io");
const { addUser, getUser, deleteUser, getUsers, getAll } = require("./users");
const {
    addMessage,
    getMessagesFromRoom,
    deleteRoom,
} = require("./persistence");

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
        const roomDateTime = getUsers(room)[0]?.room.created;
        const { user, error } = addUser(client.id, name, {
            id: room,
            created: roomDateTime,
        });
        client.join(user.room.id);
        io.in(room).emit("alert", { connected: true, user: user.name });
        getMessagesFromRoom(user.room.id).then((data)=>
            client.to(user.room.id).emit("prevMessages",data)
        );
        io.to(user.room.id).emit("timer", 600000 - (Date.now() - roomDateTime));
    });

    client.on("message", (msg) => {
        const u = getUser(client.id);
        addMessage(u.room.id, msg);
        io.to(u.room.id).emit("message", msg);
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
        u.room.created = Date.now();
        io.to(u.room.id).emit("timer", 600000 - (Date.now() - u.room.created));
    });

    client.on("timeout",((roomId)=>{
        deleteRoom(roomId);
    }))
});

server.listen(9000, () => {
    console.log("server loaded");
});
