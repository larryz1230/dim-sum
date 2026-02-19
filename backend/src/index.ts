import http from 'http';
import { Server } from "socket.io";
import { createApp } from "./app";
import { registerSockets } from "./sockets/RegisterSockets";
import { config } from "./config";

const app = createApp();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "*", // TODO: change
        methods: ["GET", "POST"]
    }
});

registerSockets(io);

httpServer.listen(config.port, () => {
    console.log(`Server running on port ${config.port}: http://localhost:8080`);
})
