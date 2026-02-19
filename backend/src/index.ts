import express,  { Request, Response } from 'express';
import http from 'http';
import { Server } from "socket.io";
import { SocketEvents } from "./utils/SocketEvents"; 

const app = express();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "*", // TODO: change
        methods: ["GET", "POST"]
    }
});

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.json({ status: "Server is running." });
})

io.on('connection', (socket) => {
    console.log("User connected: ", socket.id);
    socket.on(SocketEvents.Ping, () => {
        socket.emit("pong");
    });

    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id);
    });
});

httpServer.listen(8080, () => {
    console.log("Server running on port 8080: http://localhost:8080");
})
