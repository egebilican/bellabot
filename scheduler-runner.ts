// Load environment variables
import dotenv from "dotenv";
dotenv.config();

import { startScheduler, stopScheduler } from "./scheduler.js";

console.log("🥗 Bella Bona Bot Scheduler Starting...");

// Start the scheduler
startScheduler();

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Received SIGINT, shutting down gracefully...");
  await stopScheduler();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  await stopScheduler();
  process.exit(0);
});

console.log("✅ Scheduler is running. Press Ctrl+C to stop.");
