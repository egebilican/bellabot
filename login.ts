import puppeteer, { Page } from "puppeteer";

console.log("=== Bella Bona API starting up ===");

function getCredentials() {
  return {
    username: process.env.BELLA_BONA_USERNAME || "",
    password: process.env.BELLA_BONA_PASSWORD || "",
  };
}

async function login(page: Page): Promise<boolean> {
  const { username, password } = getCredentials();
  console.log("Attempting to log in...", username, password); // Debug: show actual credentials

  // Navigate to the login page
  await page.goto("https://app.bellabona.com/", {
    waitUntil: "networkidle2",
  });

  // Wait for the email field to appear (timeout after 10 seconds)
  const emailField = await page
    .waitForSelector("#email", { timeout: 10000 })
    .catch(() => null);
  if (!emailField) {
    console.log("Login form not found (no #email field).");
    return false;
  }

  // Fill in the login form
  await page.type("#email", username);
  await page.type("#password", password);

  // Find and click the "Sign in" button
  const signInButtonFound = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const signInButton = buttons.find((button) =>
      button.textContent?.includes("Sign in")
    );
    if (signInButton) {
      signInButton.click();
      return true;
    }
    return false;
  });

  if (signInButtonFound) {
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    console.log("Successfully logged in!");
    return true;
  } else {
    console.log("Sign in button not found");
    return false;
  }
}

async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Navigate to the main app page
    await page.goto("https://app.bellabona.com/", {
      waitUntil: "networkidle2",
    });

    // Check if we're redirected to login page or if we're already logged in
    const currentUrl = page.url();

    if (currentUrl.includes("/login")) {
      console.log("User is not authenticated - we are on the login page");
      return false;
    }

    return true;
  } catch (error) {
    console.log(
      "Error checking authentication status:",
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}

export { login, isAuthenticated };
