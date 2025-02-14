const socket = io();
let roomId = null;

function createChat() {
    fetch("/create")
        .then(res => res.json())
        .then(data => {
            alert(`Invite Link: ${data.inviteLink}`);
            joinRoom(data.roomId);
        });
}

function joinChat() {
    const code = document.getElementById("joinCode").value.trim();
    if (code) joinRoom(code);
}

function joinRoom(id) {
    roomId = id;
    document.getElementById("main").style.display = "none";
    document.getElementById("chat").style.display = "block";
    document.getElementById("roomId").innerText = roomId;
    socket.emit("join-room", roomId);
}

function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();
    if (message) {
        socket.emit("send-message", { roomId, message });
        messageInput.value = "";
    }
}

socket.on("receive-message", (msg) => {
    const msgDiv = document.createElement("div");
    msgDiv.textContent = msg;
    document.getElementById("messages").appendChild(msgDiv);
});

socket.on("chat-history", (msgs) => {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";
    msgs.forEach(msg => {
        const msgDiv = document.createElement("div");
        msgDiv.textContent = msg;
        messagesDiv.appendChild(msgDiv);
    });
});

socket.on("error", (msg) => alert(msg));
