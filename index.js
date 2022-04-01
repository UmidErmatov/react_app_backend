const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require('cors')
const router = require('./router')
app.use(cors())

const PORT = 5000

const io = new Server(server, {
    cors: {
        origin: "http://192.168.0.108:10",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {

    socket.emit("me", socket.id)

    socket.on("join_room", (data) => {
        socket.join(data);
    });

    socket.on("callUser", data => {
        io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
    })

    socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	})

    socket.on("send_message", (data) => {
        console.log("messageData: ", data);
        socket.to(data.role).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});

app.use(router)

server.listen(PORT, () => {
    console.log(`Listening on ${PORT} port`);
});

