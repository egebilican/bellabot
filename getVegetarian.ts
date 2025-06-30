import { Page } from "puppeteer";

export interface VegetarianItem {
  productName: string;
  label: string;
  imageSrc: string;
  price: string;
}

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
      }> = [];

      // Find all figures that contain vegetarian or vegan labels
      const figures = document.querySelectorAll("figure");

      figures.forEach((figure) => {
        // Check if this figure has a vegetarian or vegan label
        const vegetarianLabel = figure.querySelector(".icon-vegetarian");
        const veganLabel = figure.querySelector(".icon-vegan");

        if (vegetarianLabel || veganLabel) {
          // Get the product image and alt text
          const img = figure.querySelector("img") as HTMLImageElement;
          const imageSrc = img ? img.src : "";

          // Get the label text (vegetarian or vegan)
          const labelSpan = figure.querySelector(".tooltip_label");
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

          // Find the sibling div that contains name and prices
          let productName = "Unknown Product";
          let price = "Price not found";

          // Look for the div that comes after the figure (sibling element)
          const container = figure.parentElement;
          if (container) {
            // Find the div that contains the product info
            const productDiv = container.querySelector(
              'div[class*="_3iApk-bge8t2j_4j4EUyLB"]'
            );
            if (productDiv) {
              // Get the product name from the div with class containing COpa-sL0HU6NqaYNgIACA
              const nameDiv = productDiv.querySelector(
                'div[class*="COpa-sL0HU6NqaYNgIACA"]'
              );
              if (nameDiv) {
                productName = nameDiv.textContent?.trim() || "Unknown Product";
              }

              // Get the price from the div with class containing _22Wu40RB6PSY88t7lbSk2U
              const priceDiv = productDiv.querySelector(
                'div[class*="_22Wu40RB6PSY88t7lbSk2U"]'
              );
              if (priceDiv) {
                const priceText = priceDiv.textContent?.trim() || "";
                // Split by € and get the second price (last one)
                const prices = priceText.split("€").filter((p) => p.trim());
                if (prices.length >= 2) {
                  // Get the second price (last one) and clean it up
                  const secondPrice = prices[prices.length - 1].trim();
                  price = secondPrice + " €";
                } else if (prices.length === 1) {
                  price = prices[0].trim() + " €";
                } else {
                  price = priceText;
                }
              }
            }
          }

          items.push({
            productName,
            label: labelText,
            imageSrc,
            price,
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
          `${index + 1}. ${item.productName} - ${item.label} - ${item.price}`
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
