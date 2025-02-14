const socket = io();
let chatId = null;

document.getElementById("createChat").addEventListener("click", async () => {
    const res = await fetch("/create");
    const data = await res.json();
    chatId = data.chatId;
    alert(`Share this code to join: ${chatId}`);
    startChat();
});

document.getElementById("joinChat").addEventListener("click", () => {
    const code = document.getElementById("chatCode").value.trim();
    if (code) {
        chatId = code;
        startChat();
    }
});

function startChat() {
    document.getElementById("main").style.display = "none";
    document.getElementById("chat").style.display = "block";
    socket.emit("joinChat", chatId);
}

document.getElementById("sendMessage").addEventListener("click", () => {
    const message = document.getElementById("messageInput").value.trim();
    if (message) {
        socket.emit("sendMessage", message);
        document.getElementById("messages").innerHTML += `<p><b>You:</b> ${message}</p>`;
        document.getElementById("messageInput").value = "";
    }
});

socket.on("receiveMessage", (message) => {
    document.getElementById("messages").innerHTML += `<p><b>Friend:</b> ${message}</p>`;
});
