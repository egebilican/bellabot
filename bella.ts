import puppeteer, { Page } from "puppeteer";
import { login, isAuthenticated } from "./login.js";
import { getVegetarianItems } from "./getVegetarian.js";

async function checkExistingOrder(page: Page): Promise<void> {
  try {
    // Check if there's a "cancel order" button on the page
    const hasCancelOrderButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      return buttons.some((button) =>
        button.textContent?.toLowerCase().includes("cancel order")
      );
    });

    if (hasCancelOrderButton) {
      console.log("There is already an order");
    } else {
      console.log("Nothing is ordered");
    }
  } catch (error) {
    console.log(
      "Error checking for existing order:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function buyVeganBowls(page: Page): Promise<void> {
  try {
    console.log("Looking for vegan bowl cards...");

    const veganBowlCards = await page.evaluate(() => {
      const cards = Array.from(
        document.querySelectorAll('[class*="JaAcgl6Q1jV1fKSLOL8Hw"]')
      );
      const veganBowlCards: Array<{ index: number; productName: string }> = [];

      cards.forEach((card, index) => {
        const cardText = card.textContent?.toLowerCase() || "";
        if (cardText.includes("vegan bowl")) {
          // Find the buy button within this card
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
            // Click the buy button
            (buyButton as HTMLButtonElement).click();
          }
        }
      });

      return veganBowlCards;
    });

    if (veganBowlCards.length > 0) {
      console.log(
        `Found and clicked buy button on ${veganBowlCards.length} vegan bowl card(s):`
      );
      veganBowlCards.forEach((card) => {
        console.log(`- ${card.productName}`);
      });
    } else {
      console.log("No vegan bowl cards found on this page.");
    }
  } catch (error) {
    console.log(
      "Error buying vegan bowls:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: "./my-user-data", // This saves browser session like Chrome does
  }); // Set to true for headless mode
  const page = await browser.newPage();
  page.on("console", (msg) => {
    for (let i = 0; i < msg.args().length; ++i)
      console.log(`PAGE LOG: ${msg.args()[i]}`);
  });
  // const existingCookies = JSON.parse(fs.readFileSync("./cookies.json"));
  // console.log(existingCookies);
  // await page.setCookie(...existingCookies);

  // Check if user is already authenticated
  const authenticated = await isAuthenticated(page);
  console.log("authenticated", authenticated);
  if (!authenticated) {
    // User is not authenticated, perform login
    const loginSuccess = await login(page);
    if (!loginSuccess) {
      console.log("Failed to log in. Exiting...");
      await browser.close();
      return;
    }
  } else {
    console.log("Already authenticated, proceeding...");
  }

  console.log("Ready to perform actions!");

  // Check for existing order
  await checkExistingOrder(page);

  // Buy vegan bowls if available
  await buyVeganBowls(page);

  // Extract vegetarian items
  await getVegetarianItems(page);

  // Do more actions after login...
  // Add your main bot logic here

  // await browser.close(); // Uncomment if needed
})();
