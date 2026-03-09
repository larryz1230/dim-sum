import type { Server, Socket } from "socket.io";
import { supabaseAdmin } from "../db/SupabaseAdmin";
import { registerGameHandlers } from "./Game";
import { registerMatchmakingHandlers } from "./Matchmaking";

export function registerSockets(io : Server) {
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("Missing auth token"));
            }

            const {data, error} = await supabaseAdmin.auth.getUser(token);

            if (error || !data.user) {
                return next(new Error("Invalid auth token."));
            }

            socket.data.userId = data.user.id;
            socket.data.email = data.user.email ?? null;

            next();
        } catch (err) {
            next(err as Error);
        }
    })

    io.on("connection", (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);

        registerGameHandlers(io, socket);
        registerMatchmakingHandlers(io, socket);
    })
}