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
  return await res.text();
};

module.exports = class AmazonScraper {
  // async #getSellerPage(sellerID) {
  //   try {
  //     const queryURL = `https://www.amazon.com/s?i=merchant-items&me=${sellerID}`;
  //     const headers = {
  //       "User-Agent":
  //         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
  //       Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  //       "Accept-Language": "en-US,en;q=0.5",
  //     };

  //     const sellerPage = (await fetch(queryURL, { headers })).text();

  //     return sellerPage;
  //     // const fetchHTML = async (url) => {
  //     //   const res = await fetch(url, { headers });
  //     //   return res.text();
  //     // }
  //     // return ;
  //   } catch (error) {
  //     signale.error("Unable to get seller page due to: ", error);
  //   }
  // }

  async getSellerASINS(sellerID) {
    const queryURL = `https://www.amazon.com/s?i=merchant-items&me=${sellerID}`;

    try {
      const getPageAsins = async (pageURL) => {
        const pageHtml = await fetchHTML(pageURL);
        const $page = cheerio.load(pageHtml);
        return $page("div[data-asin]")
          .map((i, ASIN) => $page(ASIN).attr("data-asin"))
          .get()
          .filter((asin) => asin && asin.trim() !== ""); // Exclude empty and whitespace-only ASINs
      };

      const html = await fetchHTML(queryURL);
      const $ = cheerio.load(html);

      const resultsText = $(
        "#search > span:nth-child(9) > div > h1 > div > div.sg-col-14-of-20.sg-col-18-of-24.sg-col.s-breadcrumb.sg-col-10-of-16.sg-col-6-of-12 > div > div > span"
      ).text();
      signale.info(resultsText);

      let sellerAsins = [];

      if (resultsText.includes("-")) {
        // Contains more than 16 results, needs pagination
        const totalResults = resultsText.split(" ")[2];
        const totalPageCount = Math.ceil(totalResults / 16);
        signale.info("Total Page Count: ", totalPageCount);

        for (let page = 1; page <= totalPageCount; page++) {
          signale.info("Scraping page: ", page);
          const pageURL = `${queryURL}&page=${page}`;
          const pageAsins = await getPageAsins(pageURL);
          sellerAsins.push(...pageAsins);
        }
      } else {
        // All results on one page
        sellerAsins = await getPageAsins(queryURL);
      }
      // signale.success the scraped asins length and the num pages
      signale.success("Scraped ASINs Count: ", sellerAsins.length);
      signale.success(
        "Scraped Page Count: ",
        Math.ceil(sellerAsins.length / 16) + 1
      );

      return sellerAsins;
    } catch (error) {
      signale.error("Error occurred while scraping:", error.message);
      return [];
    }
  }

  async getASINInformation(ASIN) {
    const queryURL = `https://www.amazon.com/dp/${ASIN}/`

    try {
      const html = await fetchHTML(queryURL);
      const $ = cheerio.load(html);

      const productTitle = $("#productTitle").text().trim();

      const productPrice = $("#corePrice_feature_div > div > span.a-price.aok-align-center > span.a-offscreen").text().split("$")[1];

      const productSize = $("#variation_size_name > div > span").text().trim();

      const productStyle = $("#variation_style_name > div > span").text().trim();

      const fulfillmentType = (() => {
        let fulfillmentTypeText = $("#tabular-buybox > div > div.a-expander-content.a-expander-partial-collapse-content > div.tabular-buybox-container > div:nth-child(4) > div > span").text();
        return fulfillmentTypeText === "Amazon" || fulfillmentTypeText === "Amazon.com" ? "FBA" : "FBM";
      })();
      return {
        productTitle,
        productPrice,
        productSize,
        productStyle,
        fulfillmentType
      }
    } catch (error) {
      signale.error("Couldn't get ASIN Information: ", error);
      throw error;
    }
  }
};