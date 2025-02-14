const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { nanoid } = require("nanoid");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = {}; // Active chat rooms

app.use(express.static("public"));

// Route to create a new chat room
app.get("/create", (req, res) => {
    const roomId = nanoid(6); // Generate 6-char unique code
    rooms[roomId] = []; // Initialize empty chat room
    res.json({ roomId, inviteLink: `http://localhost:3000/join/${roomId}` });
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId) => {
        if (!rooms[roomId]) {
            socket.emit("error", "Room not found!");
            return;
        }
        socket.join(roomId);
        socket.emit("chat-history", rooms[roomId]); // Send past messages
    });

    socket.on("send-message", ({ roomId, message }) => {
        if (!rooms[roomId]) return;
        rooms[roomId].push(message); // Store message in session
        io.to(roomId).emit("receive-message", message);
    });

    socket.on("disconnecting", () => {
        for (const roomId of socket.rooms) {
            if (rooms[roomId]) delete rooms[roomId]; // Remove chat when all users leave
        }
    });
});

server.listen(3000, () => console.log("Server running on http://localhost:3000"));
