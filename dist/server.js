"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
const users = [];
const connections = [];
const messageHistory = [];
const serverStartTime = Date.now();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.static(path_1.default.resolve(__dirname, "..")));
// Serve Index.html
app.get("/", (req, resp) => {
    resp.sendFile(path_1.default.resolve(__dirname, "../Index.html"));
});
// Optional extension route (for +5 bonus points in rubric)
app.get("/api/status", (req, resp) => {
    const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
    resp.json({
        status: "online",
        uptime: uptimeSeconds,
        activeConnections: connections.length,
        totalMessages: messageHistory.length,
        timestamp: new Date().toISOString(),
    });
});
io.sockets.on("connection", (socket) => {
    connections.push(socket);
    console.log("connected : %s socket connected", connections.length);
    const defaultUsername = `User-${socket.id.substring(0, 4)}`;
    socket.data.username = defaultUsername;
    users.push(defaultUsername);
    io.sockets.emit("get users", users);
    socket.on("disconnect", () => {
        const connIndex = connections.indexOf(socket);
        if (connIndex !== -1) {
            connections.splice(connIndex, 1);
        }
        if (socket.data.username) {
            const userIndex = users.indexOf(socket.data.username);
            if (userIndex !== -1) {
                users.splice(userIndex, 1);
            }
        }
        io.sockets.emit("get users", users);
        console.log("Disconnected : %s socket connected", connections.length);
    });
    socket.on("send message", (data) => {
        console.log(data);
        const messagePayload = {
            msg: data,
            user: socket.data.username || "Anonymous",
            timestamp: new Date().toLocaleTimeString(),
        };
        messageHistory.push(messagePayload);
        io.sockets.emit("new message", messagePayload);
    });
});
server.listen(PORT, () => {
    console.log("server is listening on port %s", PORT);
});
