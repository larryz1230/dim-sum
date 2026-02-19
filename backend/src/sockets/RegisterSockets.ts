import type { Server, Socket } from "socket.io";
import { SocketEvents } from "../utils/SocketEvents";

export function registerSockets(io : Server) {
    io.on("connection", (socket : Socket) => {
        console.log("User connected: ", socket.id);

        socket.on(SocketEvents.Ping, () => {
            socket.emit(SocketEvents.Pong);
        })

        socket.on("disconnect", () => {
            console.log("User disconnected: ", socket.id);
        })
    })
}