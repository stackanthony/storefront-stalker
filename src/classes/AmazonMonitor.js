const signale = require("signale");
const { webhookURL } = require("../../config.json");

signale.config({
	displayTimestamp: true,
	displayDate: true,
});

const { Seller } = require("../database/models");
const scraper = require("./AmazonScraper");

const { WebhookClient, EmbedBuilder } = require("discord.js");
const webhookClient = new WebhookClient({
	url: webhookURL
});

const getRandomInterval = (min, max) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

const randomTimer = () => {
	const randomInterval = getRandomInterval(15000, 20000);
	return new Promise((res) => setTimeout(res, randomInterval));
};

module.exports = class AmazonMonitor {
	// constructor() {
	//     // this.seller = new Seller();
	// }

	async monitor() {
		try {
			const sellerIDs = await Seller.getAllSellerIDs();

			for (const { sellerID } of sellerIDs) {
				signale.await("Monitoring for new Seller Products...");

				//Get ASINS for the seller using the scraper
				const sellerAsins = await scraper.getSellerASINS(sellerID);

				//Get existing ASINS for the seller from the database
				const existingAsins = await Seller.getASINSFromSellerID(sellerID);
				const existingAsinSet = new Set(existingAsins);

				const newAsins = sellerAsins.filter(
					(ASIN) => !existingAsinSet.has(ASIN)
				);

				if (newAsins.length > 0) {
					// NEW PRODUCT FOUND
					signale.info(newAsins);
					newAsins.forEach(async (ASIN) => {
						const {
							productTitle,
							productPrice,
							productCategory,
							salesRank,
							fulfillmentType,
						} = await scraper.getASINInformation(ASIN);
						signale.success("Found Product: ", productTitle);
						webhookClient.send({
							content: `Product Title: ${productTitle}\nPrice: ${productPrice}\nProduct Category: ${productCategory}\nSales Rank: ${salesRank}\nFulfillment Type: ${fulfillmentType}`,
						});
						await Seller.updateSellerASINS(sellerID, ASIN);
					});
				}

				await randomTimer();
			}
		} catch (error) {
			signale.error("Monitor error: ", error);
		}
	}
};
