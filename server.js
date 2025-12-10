const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();
app.use(cors());

// Add this route to test the server
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

    // When a player joins a room
    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`Player ${socket.id} joined room ${roomId}`);

        io.to(roomId).emit("playerJoined", {
            playerId: socket.id,
            roomId: roomId
        });
    });

    // When a player plays a card
    socket.on("playCard", (data) => {
        console.log(`Card played in ${data.roomId}:`, data.card);

        // Broadcast to everyone in the room
        io.to(data.roomId).emit("cardPlayed", {
            player: socket.id,
            card: data.card
        });
    });

    // When user disconnects
    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
    });
});

// Use Railway's port or fallback to 3000
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

