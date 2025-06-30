import cron from "node-cron";
import { getVegetarianItems } from "./getVegetarian.js";
import { login, isAuthenticated } from "./login.js";
import puppeteer from "puppeteer";

// Global browser instance
let browser: any = null;
let page: any = null;

// Initialize browser
async function initializeBrowser(): Promise<void> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      userDataDir: "./my-user-data",
    });
    page = await browser.newPage();
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

// Function to check vegetarian options
async function checkVegetarianOptions() {
  try {
    console.log(
      `[${new Date().toISOString()}] Starting scheduled vegetarian check...`
    );

    await ensureAuthenticated();

    if (!page) {
      console.error("Browser not initialized");
      return;
    }

    const vegetarianItems = await getVegetarianItems(page);

    console.log(
      `[${new Date().toISOString()}] Found ${
        vegetarianItems.length
      } vegetarian/vegan items:`
    );
    vegetarianItems.forEach((item: any, index: number) => {
      console.log(
        `  ${index + 1}. ${item.productName} - ${item.label} - ${item.price}`
      );
    });

    // You can add logic here to:
    // - Send notifications
    // - Auto-book specific items
    // - Save to database
    // - Send email/SMS alerts
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error in scheduled check:`,
      error
    );
  }
}

// Function to auto-book vegan bowls
async function autoBookVeganBowls() {
  try {
    console.log(
      `[${new Date().toISOString()}] Starting scheduled vegan bowl booking...`
    );

    await ensureAuthenticated();

    if (!page) {
      console.error("Browser not initialized");
      return;
    }

    const result = await page.evaluate(() => {
      const veganBowlCards: Array<{ cardId: string; productName: string }> = [];

      const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const categories = [
        "cucina_italiana",
        "lunch_classics",
        "salads_&_bowls",
        "sandwich_&_wraps",
        "weekly_special",
      ];

      const cardIds = ids.flatMap((id) =>
        categories.map((category) => category + "_" + id)
      );

      cardIds.forEach((cardId: string) => {
        const card = document.getElementById(cardId);
        if (!card) return;

        const cardText = card.textContent?.toLowerCase() || "";
        if (cardText.includes("vegan bowl")) {
          const buyButton = card.querySelector(
            'button[class*="m92yzui_kJE2ejTj4Gf5N"]'
          );
          if (buyButton) {
            const productName =
              card
                .querySelector('div[class*="COpa-sL0HU6NqaYNgIACA"]')
                ?.textContent?.trim() || "Unknown Product";

            veganBowlCards.push({
              cardId,
              productName,
            });
            (buyButton as HTMLButtonElement).click();
          }
        }
      });

      return veganBowlCards;
    });

    console.log(
      `[${new Date().toISOString()}] Booked ${result.length} vegan bowl(s):`
    );
    result.forEach((item: any, index: number) => {
      console.log(`  ${index + 1}. ${item.productName} (ID: ${item.cardId})`);
    });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error in scheduled booking:`,
      error
    );
  }
}

// Schedule tasks
export function startScheduler() {
  console.log("🚀 Starting Bella Bona Bot Scheduler...");

  // Check vegetarian options every minute (for testing)
  cron.schedule(
    "* * * * *",
    () => {
      checkVegetarianOptions();
    },
    {
      timezone: "Europe/Amsterdam", // Adjust to your timezone
    }
  );

  // Auto-book vegan bowls every day at 9:05 AM
  cron.schedule(
    "5 9 * * *",
    () => {
      autoBookVeganBowls();
    },
    {
      timezone: "Europe/Amsterdam", // Adjust to your timezone
    }
  );

  // Auto-book again at 11:05 AM
  cron.schedule(
    "5 11 * * *",
    () => {
      autoBookVeganBowls();
    },
    {
      timezone: "Europe/Amsterdam",
    }
  );

  console.log("📅 Scheduled tasks:");
  console.log("  - Check vegetarian options: EVERY MINUTE (for testing)");
  console.log("  - Auto-book vegan bowls: 9:05 AM & 11:05 AM");
}

// Graceful shutdown
export async function stopScheduler() {
  console.log("Stopping scheduler...");
  if (browser) {
    await browser.close();
  }
}
