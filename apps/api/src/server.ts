import { app } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

let server: ReturnType<typeof app.listen> | undefined;

async function start(): Promise<void> {
  await connectDatabase();
  server = app.listen(env.API_PORT, () => {
    process.stdout.write(`ForgeOS API listening on port ${env.API_PORT}\n`);
  });
}

async function shutdown(signal: string): Promise<void> {
  process.stdout.write(`Received ${signal}; shutting down gracefully.\n`);
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server?.close((error) => error ? reject(error) : resolve());
    });
  }
  await disconnectDatabase();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

start().catch((error: unknown) => {
  process.stderr.write(`ForgeOS startup failed: ${String(error)}\n`);
  process.exit(1);
});
