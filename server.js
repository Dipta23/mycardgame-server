const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();
app.use(cors());

// Health check route
app.get("/", (req, res) => {
    res.send("Server is running ✔");
});

const server = http.createServer(app);

// Initialize Socket.IO
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`Player ${socket.id} joined room ${roomId}`);

        io.to(roomId).emit("playerJoined", {
            playerId: socket.id,
            roomId: roomId
        });
    });

    socket.on("playCard", (data) => {
        console.log(`Card played in ${data.roomId}:`, data.card);

        io.to(data.roomId).emit("cardPlayed", {
            player: socket.id,
            card: data.card
        });
    });

    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
    });
});

// IMPORTANT: Railway requires ONLY process.env.PORT
const PORT = process.env.PORT;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
