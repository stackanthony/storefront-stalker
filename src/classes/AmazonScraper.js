const signale = require("signale");
const cheerio = require("cheerio");

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

const fetchHTML = async (url) => {
  const res = await fetch(url, { headers });
  signale.info(`[${res.status}] Requested: ${url}`)
  return await res.text();
};

const timer = ms => new Promise(res => setTimeout(res, ms))

module.exports = class AmazonScraper {

  static async getSellerASINS(sellerID) {
    const queryURL = `https://www.amazon.com/s?i=merchant-items&me=${sellerID}`;

    try {
      const html = await fetchHTML(queryURL);
      signale.info("Made Request to Seller Page");
      const $ = cheerio.load(html);

      const resultsText = $(
        "#search > span:nth-child(9) > div > h1 > div > div.sg-col-14-of-20.sg-col-18-of-24.sg-col.s-breadcrumb.sg-col-10-of-16.sg-col-6-of-12 > div > div > span"
      ).text();
      signale.info("Product Count: ", resultsText);

      const sellerAsins = [];
      const totalResults = parseInt(resultsText.split(" "));

      if (isNaN(totalResults) || totalResults <= 0) {
        signale.warn("No products found for the seller.");
        return sellerAsins;
      }

      // Function to get ASINs from a specific page
      const getPageAsins = async (pageURL) => {
        const pageHtml = await fetchHTML(pageURL);
        const $page = cheerio.load(pageHtml);
        return $page("div[data-asin]")
          .map((i, ASIN) => $page(ASIN).attr("data-asin"))
          .get()
          .filter((asin) => asin && asin.trim() !== ""); // Exclude empty and whitespace-only ASINs
      };

      // Check if pagination is needed
      if (totalResults > 16) {
        // Contains more than 16 results, needs pagination
        const totalPageCount = Math.ceil(totalResults / 16);

        for (let page = 1; page <= totalPageCount; page++) {
          signale.info("Scraping page: ", page);
          const pageURL = `${queryURL}&page=${page}`;
          const pageAsins = await getPageAsins(pageURL);
          sellerAsins.push(...pageAsins);

          await timer(2000);
        }
      } else {
        // All results on one page
        sellerAsins.push(
          ...$("div[data-asin]")
            .map((i, ASIN) => $(ASIN).attr("data-asin"))
            .get()
            .filter((asin) => asin && asin.trim() !== "") // Exclude empty and whitespace-only ASINs
        );
      }

      // signale.success the scraped asins length and the num pages
      // signale.success("Scraped ASINs Count: ", sellerAsins.length);
      // signale.success("Scraped Page Count: ", Math.ceil(sellerAsins.length / 16) + 1);

      return sellerAsins;
    } catch (error) {
      signale.error("Error occurred while scraping:", error.message);
      return [];
    }
  }

  static async getASINInformation(ASIN) {
    const queryURL = `https://www.amazon.com/dp/${ASIN}/`

    try {
      const html = await fetchHTML(queryURL);
      signale.info("Made Request to receive ASIN information.")
      const $ = cheerio.load(html);

      const productTitle = $("#productTitle").text().trim();

      const scrapePrice = $("#corePriceDisplay_desktop_feature_div > div.a-section.a-spacing-none.aok-align-center > span.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay > span.a-offscreen").text();
      const productPrice = scrapePrice ? scrapePrice : "NO BUY BOX";

      const productCategory = $("#wayfinding-breadcrumbs_feature_div > ul > li:nth-child(1) > span > a").text().trim();
      const salesRank = $('.a-text-bold')
        .parent()
        .contents()
        .filter((index, element) => element.nodeType === 3)
        .text()
        .trim()
        .split(' ')[0];
      const scrapedType = $("#tabular-buybox > div > div.a-expander-content.a-expander-partial-collapse-content > div.tabular-buybox-container > div:nth-child(4) > div > span").text();
      let fulfillmentType = scrapedType === "Amazon" || scrapedType === "Amazon.com" ? "FBA" : "FBM";

      // console.log(typeof productTitle);
      // console.log(typeof productPrice);
      // console.log(fulfillmentTypeText);
      return {
        productTitle,
        productPrice,
        productCategory,
        salesRank,
        fulfillmentType
      }
    } catch (error) {
      signale.error("Couldn't get ASIN Information: ", error);
    }
  }
};