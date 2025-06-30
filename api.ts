// Load environment variables from .env file (for local development)
import dotenv from "dotenv";
dotenv.config();
console.log("=== Bella Bona API  up ===");

// Debug: Check if environment variables are loaded
console.log("🔧 Environment check:");
console.log(
  "  BELLA_BONA_USERNAME:",
  process.env.BELLA_BONA_USERNAME ? "✅ Set" : "❌ Not set"
);
console.log(
  "  BELLA_BONA_PASSWORD:",
  process.env.BELLA_BONA_PASSWORD ? "✅ Set" : "❌ Not set"
);
console.log("  PORT:", process.env.PORT || "3000 (default)");

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { getVegetarianItems } from "./getVegetarian.js";
import { login, isAuthenticated } from "./login.js";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

// Global browser instance
let browser: any = null;
let page: any = null;

// Initialize browser
async function initializeBrowser(): Promise<void> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true, // Use headless for production
      userDataDir: "./my-user-data",
    });
    page = await browser.newPage();

    // Set up console logging
    page.on("console", (msg: any) => {
      for (let i = 0; i < msg.args().length; ++i)
        console.log(`PAGE LOG: ${msg.args()[i]}`);
    });
  }
}

// Ensure authentication
async function ensureAuthenticated(): Promise<boolean> {
  if (!page) {
    await initializeBrowser();
  }

  if (!page) return false;

  const authenticated = await isAuthenticated(page);
  if (!authenticated) {
    const loginSuccess = await login(page);
    if (!loginSuccess) {
      throw new Error("Failed to authenticate");
    }
  }
  return true;
}

// API Routes

// GET /api/vegetarian-options
app.get("/api/vegetarian-options", async (req: any, res: any) => {
  try {
    await ensureAuthenticated();

    if (!page) {
      return res.status(500).json({ error: "Browser not initialized" });
    }

    const vegetarianItems = await getVegetarianItems(page);

    res.json({
      success: true,
      count: vegetarianItems.length,
      items: vegetarianItems,
    });
  } catch (error) {
    console.error("Error getting vegetarian options:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// POST /api/book-vegan-bowl
app.post("/api/book-vegan-bowl", async (req: any, res: any) => {
  try {
    await ensureAuthenticated();

    if (!page) {
      return res.status(500).json({ error: "Browser not initialized" });
    }

    const result = await page.evaluate(() => {
      const cards = Array.from(
        document.querySelectorAll('[class*="JaAcgl6Q1jV1fKSLOL8Hw"]')
      );
      const veganBowlCards: Array<{ index: number; productName: string }> = [];

      cards.forEach((card: any, index: number) => {
        const cardText = card.textContent?.toLowerCase() || "";
        if (cardText.includes("vegan bowl")) {
          const buyButton = card.querySelector(
            'button[class*="m92yzui_kJE2ejTj4Gf5N"]'
          );
          if (buyButton) {
            veganBowlCards.push({
              index,
              productName:
                card
                  .querySelector('div[class*="COpa-sL0HU6NqaYNgIACA"]')
                  ?.textContent?.trim() || "Unknown Product",
            });
            (buyButton as HTMLButtonElement).click();
          }
        }
      });

      return veganBowlCards;
    });

    res.json({
      success: true,
      message: `Found and booked ${result.length} vegan bowl(s)`,
      bookedItems: result,
    });
  } catch (error) {
    console.error("Error booking vegan bowl:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// POST /api/cancel-booking
app.post("/api/cancel-booking", async (req: any, res: any) => {
  try {
    await ensureAuthenticated();

    if (!page) {
      return res.status(500).json({ error: "Browser not initialized" });
    }

    const result = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const cancelButton = buttons.find((button: any) =>
        button.textContent?.toLowerCase().includes("cancel order")
      );

      if (cancelButton) {
        (cancelButton as HTMLButtonElement).click();
        return { success: true, message: "Order cancelled successfully" };
      } else {
        return { success: false, message: "No active order found to cancel" };
      }
    });

    res.json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/order-status
app.get("/api/order-status", async (req: any, res: any) => {
  try {
    await ensureAuthenticated();

    if (!page) {
      return res.status(500).json({ error: "Browser not initialized" });
    }

    const hasOrder = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      return buttons.some((button: any) =>
        button.textContent?.toLowerCase().includes("cancel order")
      );
    });

    res.json({
      success: true,
      hasActiveOrder: hasOrder,
      message: hasOrder ? "There is already an order" : "Nothing is ordered",
    });
  } catch (error) {
    console.error("Error checking order status:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Health check endpoint
app.get("/api/health", (req: any, res: any) => {
  res.json({
    success: true,
    message: "Bella Bona API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err: Error, req: any, res: any, next: any) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Bella Bona API server running on port ${PORT}`);
  console.log(`📖 API Documentation:`);
  console.log(`   GET  /api/health - Health check`);
  console.log(
    `   GET  /api/vegetarian-options - Get all vegetarian/vegan items`
  );
  console.log(`   POST /api/book-vegan-bowl - Book vegan bowl items`);
  console.log(`   POST /api/cancel-booking - Cancel current order`);
  console.log(`   GET  /api/order-status - Check if there's an active order`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

function getCredentials() {
  return {
    username: process.env.BELLA_BONA_USERNAME || "",
    password: process.env.BELLA_BONA_PASSWORD || "",
  };
}
