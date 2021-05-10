const express = require("express") ;
const socketIO = require("socket.io");
const http = require("http");
const app = express();

const server = http.Server(app);

const io = socketIO(server);

server.listen(9000, () => {
    console.log("server loaded");
});

app.get("/",(req,res) => {
    res.send("holaa");
})


io.on("connection",(client) => {
    client.send("jaja XD");
})




