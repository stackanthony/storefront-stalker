const signale = require("signale");
const cheerio = require("cheerio");

const scrape = async (sellerID) => {
	const queryURL = `https://www.amazon.com/s?i=merchant-items&me=${sellerID}`;
	const headers = {
		"User-Agent":
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
		Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
		"Accept-Language": "en-US,en;q=0.5",
	};

	try {
		const fetchHTML = async (url) => {
			const res = await fetch(url, { headers });
			return await res.text();
		};

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
};

module.exports = scrape;
