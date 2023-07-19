const signale = require("signale");
const cheerio = require("cheerio");

const scrape = async (sellerID) => {
    const queryURL = `https://www.amazon.com/s?i=merchant-items&me=${sellerID}`;

    try {
        const res = await fetch(queryURL, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                Accept:
                    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
            },
        });

        const html = await res.text();
        const $ = cheerio.load(html);

        let resultsText = $("#search > span:nth-child(9) > div > h1 > div > div.sg-col-14-of-20.sg-col-18-of-24.sg-col.s-breadcrumb.sg-col-10-of-16.sg-col-6-of-12 > div > div > span").text();
        signale.info(resultsText);
        // console.log(resultCount);

        let sellerAsins = [];

        if (resultsText.includes("-")) {
            //contains more than 16 results, needs to paginate
            let totalResults = resultsText.split(" ")[2];
            let totalPageCount = Math.ceil(totalResults / 16);
            signale.info(totalPageCount);
            signale.info("Total Page Count: ", totalPageCount);

            for (let page = 1; page <= totalPageCount; page++) {
                let pageURL = `${queryURL}&page=${page}`;
                const pageRes = await fetch(pageURL, {
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                        Accept:
                            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                        "Accept-Language": "en-US,en;q=0.5",
                    },
                });

                const pageHtml = await pageRes.text();
                const $page = cheerio.load(pageHtml);

                $page("div[data-asin]")
                    .map((i, ASIN) => sellerAsins.push($page(ASIN).attr("data-asin")))
                    .get()
                    .filter((asin) => asin);
            }

        } else {
            //all results on one page
            sellerAsins = $("div[data-asin]")
                .map((i, ASIN) => $(ASIN).attr("data-asin"))
                .get()
                .filter((asin) => asin); // Filter out any empty asins
        }

        return sellerAsins;
    } catch (error) {
        signale.error("Error occurred while scraping:", error.message);
        return [];
    }
};

module.exports = scrape;
