const signale = require("signale");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const scrape = async (sellerID) => {
  const queryURL = `https://www.amazon.com/s?i=merchant-items&me=${sellerID}`;

  try {
    const res = await fetch(queryURL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      },
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    let sellerAsins = $("div[data-asin]")
      .map((i, ASIN) => $(ASIN).attr("data-asin"))
      .get()
      .filter((asin) => asin); // Filter out any empty asins

    return sellerAsins;
  } catch (error) {
    signale.error("Error occurred while scraping:", error.message);
    return [];
  }
};

module.exports = scrape;