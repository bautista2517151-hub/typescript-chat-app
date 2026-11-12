import express, { Request, Response } from "express";
import http from "http";
import path from "path";
import { Server, Socket } from "socket.io";
import {
  ChatMessage,
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  ServerStatusResponse,
} from "./types/chat";

const app = express();
const server = http.createServer(app);

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server);

const users: string[] = [];
const connections: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>[] = [];
const messageHistory: ChatMessage[] = [];
const serverStartTime: number = Date.now();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.resolve(__dirname, "..")));

// Serve Index.html
app.get("/", (req: Request, resp: Response) => {
  resp.sendFile(path.resolve(__dirname, "../Index.html"));
});

// Optional extension route (for +5 bonus points in rubric)
app.get("/api/status", (req: Request, resp: Response<ServerStatusResponse>) => {
  const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
  resp.json({
    status: "online",
    uptime: uptimeSeconds,
    activeConnections: connections.length,
    totalMessages: messageHistory.length,
    timestamp: new Date().toISOString(),
  });
});

io.sockets.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
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

  socket.on("send message", (data: string) => {
    console.log(data);
    const messagePayload: ChatMessage = {
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