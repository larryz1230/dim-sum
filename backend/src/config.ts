export const config = {
    port: Number(process.env.PORT ?? 9090),
    corsOrigin: process.env.CORS_ORIGIN ?? "*", // TODO: change
};