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
	url: webhookURL,
});

const getRandomInterval = (min, max) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

const randomTimer = () => {
	const randomInterval = getRandomInterval(15000, 20000);
	return new Promise((res) => setTimeout(res, randomInterval));
};

module.exports = class AmazonMonitor {
	async monitor() {
		try {
			const sellerIDs = await Seller.getAllSellerIDs();
			signale.await("Started monitoring for new Seller Products...");
			for (const { sellerID } of sellerIDs) {
				signale.info("Watching seller: ", sellerID);
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
						console.log(`http://images.amazon.com/images/P/${ASIN}.01._SCMZZZZZZZ_.jpg`)
						console.log(`http://images.amazon.com/images/P/${ASIN}.01._LZZZZZZZ_.jpg`)
						const embed = new EmbedBuilder()
							.setAuthor({ name: "Amazon Stalker" })
							.setTitle(`New Product Found! - ${ASIN}`)
							.setURL(`https://www.amazon.com/dp/${ASIN}`)
							.setColor("#00ff00")
							.setImage(
								`http://images.amazon.com/images/P/${ASIN}.01._SCMZZZZZZZ_.jpg`
							)
							.setThumbnail(
								`http://images.amazon.com/images/P/${ASIN}.01._LZZZZZZZ_.jpg`
							)
							.setFooter({
								text: "Amazon Stalker",
								iconURL: `http://images.amazon.com/images/P/${ASIN}.01._LZZZZZZZ_.jpg`,
							})
							.setTimestamp()
							.addFields(
								{
									name: "Links",
									value: `[Amazon](https://www.amazon.com/dp/${ASIN}) | [Keepa](https://keepa.com/#!product/1-${ASIN}) | [CamelCamelCamel](https://camelcamelcamel.com/product/${ASIN}) | [SellerAmp](https://sas.selleramp.com/sas/lookup?&search_term=${ASIN})`,
								},
								{
									name: "Product Title",
									value: productTitle,
								},
								{
									name: "Product Price",
									value: productPrice,
								},
								{
									name: "Product Category",
									value: productCategory,
								},
								{
									name: "Sales Rank",
									value: salesRank,
								},
								{
									name: "Fulfillment Type",
									value: fulfillmentType,
								}
							);
						webhookClient.send({
							embeds: [embed],
						});
						// webhookClient.send({
						// 	content: `Product Title: ${productTitle}\nPrice: ${productPrice}\nProduct Category: ${productCategory}\nSales Rank: ${salesRank}\nFulfillment Type: ${fulfillmentType}`,
						// });
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
