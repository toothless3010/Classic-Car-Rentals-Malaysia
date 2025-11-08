import "dotenv/config";
import http from "http";
import app from "./app.js";
import prisma from "./lib/prisma.js";

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  try {
    await prisma.$connect();
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`🚗 Classic Car Rentals Malaysia app listening on port ${PORT}`);
    });

    const gracefulShutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Closing server...`);
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
      setTimeout(async () => {
        await prisma.$disconnect();
        process.exit(0);
      }, 10000).unref();
    };

    ["SIGINT", "SIGTERM"].forEach((signal) => {
      process.on(signal, () => gracefulShutdown(signal));
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
