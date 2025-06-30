import { Page } from "puppeteer";

export interface VegetarianItem {
  productName: string;
  label: string;
  imageSrc: string;
  price: string;
  cardId: string;
}

// Shared function to generate card IDs - can be used in both browser and Node.js
export function generateCardIds(): string[] {
  const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const categories = [
    "cucina_italiana",
    "lunch_classics",
    "salads_&_bowls",
    "sandwich_&_wraps",
    "weekly_special",
  ];

  return ids.flatMap((id) => categories.map((category) => `${category}_${id}`));
}

// Shared card ID generation logic as a string for browser context
export const CARD_IDS_GENERATOR = `
  function generateCardIds() {
    const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const categories = [
      'cucina_italiana',
      'lunch_classics', 
      'salads_&_bowls',
      'sandwich_&_wraps',
      'weekly_special'
    ];
    
    return ids.flatMap(id => 
      categories.map(category => category + '_' + id)
    );
  }
`;

export async function getVegetarianItems(
  page: Page
): Promise<VegetarianItem[]> {
  console.log("Searching for vegetarian and vegan items...");

  try {
    // Wait for the page to load completely
    await page.waitForSelector("figure", { timeout: 10000 });

    // Extract vegetarian and vegan items
    const vegetarianItems = await page.evaluate(() => {
      const items: Array<{
        productName: string;
        label: string;
        imageSrc: string;
        price: string;
        cardId: string;
      }> = [];

      // Use the shared card ID generation
      const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const categories = [
        "cucina_italiana",
        "lunch_classics",
        "salads_&_bowls",
        "sandwich_&_wraps",
        "weekly_special",
      ];

      const cardIds = ids.flatMap((id) =>
        categories.map((category) => `${category}_${id}`)
      );

      cardIds.forEach((cardId) => {
        const card = document.getElementById(cardId);
        if (!card) return;

        // Check if this card has a vegetarian or vegan label
        const vegetarianLabel = card.querySelector(".icon-vegetarian");
        const veganLabel = card.querySelector(".icon-vegan");

        if (vegetarianLabel || veganLabel) {
          // Get the product image and alt text
          const img = card.querySelector("img") as HTMLImageElement;
          const imageSrc = img ? img.src : "";

          // Get the label text (vegetarian or vegan)
          const labelSpan = card.querySelector(".tooltip_label");
          let labelText = "Unknown";

          if (vegetarianLabel) {
            labelText = labelSpan
              ? labelSpan.textContent?.trim() || "Vegetarian"
              : "Vegetarian";
          } else if (veganLabel) {
            labelText = labelSpan
              ? labelSpan.textContent?.trim() || "Vegan"
              : "Vegan";
          }

          // Find the product info within this card using DOM structure
          let productName = "Unknown Product";
          let price = "Price not found";

          // Find the div that contains product info (after the figure)
          const productInfoContainer = card.querySelector("div > div > div");
          if (productInfoContainer) {
            // Get all direct div children
            const productDivs = productInfoContainer.children;

            if (productDivs.length >= 2) {
              // First div contains the name - get only the first child div with the actual name
              const nameContainer = productDivs[0];
              if (nameContainer) {
                const nameDiv = nameContainer.querySelector("div");
                if (nameDiv) {
                  productName =
                    nameDiv.textContent?.trim() || "Unknown Product";
                }
              }

              // Second div contains the prices - get only the price text
              const priceContainer = productDivs[1];
              if (priceContainer) {
                // Get all text nodes and spans, filter out button text
                const priceElements = priceContainer.querySelectorAll("span");
                const priceTexts: string[] = [];

                priceElements.forEach((span) => {
                  const text = span.textContent?.trim();
                  if (text && text.includes("€")) {
                    priceTexts.push(text);
                  }
                });

                if (priceTexts.length > 0) {
                  price = priceTexts.join(" ");
                } else {
                  // Fallback: get all text content and filter
                  const allText = priceContainer.textContent?.trim() || "";
                  // Remove common button text and keep only price-like content
                  price = allText.replace(/Buy|[\-\+]/g, "").trim();
                }
              }
            }
          }

          items.push({
            productName,
            label: labelText,
            imageSrc,
            price,
            cardId,
          });
        }
      });

      return items;
    });

    if (vegetarianItems.length > 0) {
      console.log(
        `Found ${vegetarianItems.length} vegetarian and vegan items:`
      );
      vegetarianItems.forEach((item, index) => {
        console.log(
          `${index + 1}. ${item.productName} - ${item.label} - ${
            item.price
          } (ID: ${item.cardId})`
        );
      });
    } else {
      console.log("No vegetarian or vegan items found on this page.");
    }

    return vegetarianItems;
  } catch (error) {
    console.log(
      "Error extracting vegetarian and vegan items:",
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
}
