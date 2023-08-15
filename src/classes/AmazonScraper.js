const signale = require("signale");
const cheerio = require("cheerio");
const axios = require("axios");
const { HttpsProxyAgent } = require("https-proxy-agent");

const ProxyManager = require("./ProxyManager");
const proxyManager = new ProxyManager();

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

const fetchHTML = async (url) => {
  const proxy = proxyManager.getNextProxy();
  const { host, port, username, password } = proxyManager.getProxyInformation(proxy);
  signale.info(`Host: ${host}, Port: ${port}, Username: ${username}, Password: ${password}`);

  const proxyURL = `http://${username}:${password}@${host}:${port}`;

  const agent = new HttpsProxyAgent(proxyURL);

  const fetchOptions = {
    method: 'GET',
    headers: headers,
    agent: agent,
  };

  const response = await fetch(url, fetchOptions);
  signale.info(`[${response.status}] Requested: ${url}`);
  const htmlText = await response.text();
  return htmlText;
};

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

module.exports = class AmazonScraper {
  static async getSellerASINS(sellerID, paginationDelay) {
    const queryURL = `http://www.amazon.com/s?i=merchant-items&me=${sellerID}`;

    try {
      const html = await fetchHTML(queryURL);
      const $ = cheerio.load(html);

      const resultsText = $(
        "#search > span:nth-child(9) > div > h1 > div > div.sg-col-14-of-20.sg-col-18-of-24.sg-col.s-breadcrumb.sg-col-10-of-16.sg-col-6-of-12 > div > div > span"
      ).text();
      signale.info("Product Count: ", resultsText);

      const sellerAsins = [];
      const totalResults = parseInt(resultsText.split(" ")[2]);

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

          await timer(paginationDelay);
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
      throw error;
    }
  }

  static async getASINInformation(ASIN) {
    const queryURL = `http://www.amazon.com/dp/${ASIN}/`;

    try {
      const html = await fetchHTML(queryURL);
      const $ = cheerio.load(html);

      const productTitle = $("#productTitle").text().trim();

      const scrapedPrice = $(
        "#corePrice_feature_div > div > span.a-price.aok-align-center > span.a-offscreen"
      ).first().text();
      const productPrice = scrapedPrice ? scrapedPrice : "NO BUY BOX";

      const productCategory = $(
        "#wayfinding-breadcrumbs_feature_div > ul > li:nth-child(1) > span > a"
      )
        .text()
        .trim();
      const productImage = $("#landingImage").attr("src");

      const scrapedSalesRank = $("#detailBulletsWrapper_feature_div > ul:nth-child(4) > li > span").find('span.a-text-bold:contains("Best Sellers Rank:")').parent().text().trim().split(" ")[4];
      const salesRank = scrapedSalesRank ? scrapedSalesRank : "Unknown";

      const scrapedType = $(
        "#tabular-buybox > div.tabular-buybox-container > div:nth-child(4) > div > span"
      ).first().text();
      let fulfillmentType =
        (scrapedType === "Amazon" || scrapedType === "Amazon.com")
          ? "FBA"
          : "FBM";
      fulfillmentType = productPrice === "NO BUY BOX" ? productPrice : fulfillmentType;
      return {
        productTitle,
        productPrice,
        productCategory,
        productImage,
        salesRank,
        fulfillmentType,
      };
    } catch (error) {
      signale.error("Couldn't get ASIN Information: ", error);
    }
  }

  static async checkValidSellerID(sellerID) {
    const queryURL = `http://www.amazon.com/s?i=merchant-items&me=${sellerID}`;

    try {
      const html = await fetchHTML(queryURL);
      const $ = cheerio.load(html);

      const results = $("#search > span:nth-child(9) > div > h1 > div > div.sg-col-14-of-20.sg-col-18-of-24.sg-col.s-breadcrumb.sg-col-10-of-16.sg-col-6-of-12 > div > div > span").text();

      if (results) {
        signale.success("Seller ID Valid");
        return true;
      } else {
        return false;
      }
    } catch (error) {
      signale.error("An error occurred while checking valid seller ID: ", error);
    }
  }
};
