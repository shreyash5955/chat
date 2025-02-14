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
    res.json({ roomId, inviteLink: `https://your-app-name.herokuapp.com/join/${roomId}` }); // Replace with your Heroku/Render app name
});

// Route to join a room
app.get("/join/:roomId", (req, res) => {
    const { roomId } = req.params;
    if (!rooms[roomId]) {
        return res.status(404).send("Room not found!");
    }
    res.send("Join Room: " + roomId); // Optionally render a join page
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
        io.to(roomId).emit("receive-message", message); // Broadcast to room
    });

    socket.on("disconnecting", () => {
        for (const roomId of socket.rooms) {
            if (rooms[roomId]) delete rooms[roomId]; // Remove chat when all users leave
        }
    });
});

// Dynamic port handling for Heroku/Render
const port = process.env.PORT || 3000; // Heroku provides dynamic port via process.env.PORT
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
