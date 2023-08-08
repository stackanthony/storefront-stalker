const signale = require("signale");
const { Seller, User } = require("../database/models");
const scraper = require("./AmazonScraper");
const { WebhookClient, EmbedBuilder } = require("discord.js");
const getRandomInterval = (min, max) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

const randomTimer = () => {
	const randomInterval = getRandomInterval(20000, 30000);
	return new Promise((res) => setTimeout(res, randomInterval));
};

module.exports = class AmazonMonitor {
	static async run() {
		try {
			const sellerIDs = await Seller.getAllSellerIDs();
			// check if there are any sellers to monitor
			if (sellerIDs.length === 0) {
				return signale.info("No sellers to monitor.");
			}
			signale.await("Started monitoring for new Seller Products...");

			for (const { sellerID } of sellerIDs) {
				signale.info("Watching seller: ", sellerID);
				const seller = await Seller.findOne({
					where: { sellerID: sellerID },
				});

				if (!seller) {
					continue;
				}

				await this.processSeller(seller);
				signale.await("Delaying next request...");
				await randomTimer();
			}
		} catch (error) {
			signale.error("Monitor error: ", error);
		}
	}

	static async processSeller(seller) {
		try {
			const sellerAsins = await scraper.getSellerASINS(seller.sellerID, 4000); // get current ASINs from Seller page
			const existingAsins = await Seller.getASINSFromSellerID(seller.sellerID); // get existing ASINs that are in the DB
			const existingAsinSet = new Set(existingAsins);

			const newAsins = sellerAsins.filter((ASIN) => !existingAsinSet.has(ASIN));
			const removedAsins = existingAsins.filter((ASIN) => !sellerAsins.includes(ASIN));

			if (newAsins.length > 0 || removedAsins.length > 0) {
				// PROCESS NEW AND REMOVED ASINS
				signale.info("New ASINs: ", newAsins);
				signale.info("Removed ASINs: ", removedAsins);

				const usersTrackingSeller = await User.findAll({
					where: { discordUserID: seller.usersTracking },
				});

				for (const ASIN of newAsins) {
					await this.processNewASIN(ASIN, seller, usersTrackingSeller);
				}

				for (const ASIN of removedAsins) {
					await this.processRemovedASIN(ASIN, seller);
				}
			}
		} catch (error) {
			signale.error("Error processing seller: ", error);
		}
	}

	static async processNewASIN(ASIN, seller, usersTrackingSeller) {
		try {
			const productInfo = await scraper.getASINInformation(ASIN);
			signale.success("Found Product: ", productInfo.productTitle);
			const embed = this.createEmbed(productInfo, ASIN);

			for (const user of usersTrackingSeller) {
				if (!user.discordWebhook) {
					signale.info("User doesn't have a webhook set: ", user.discordUserID);
					continue;
				}

				const webhookClient = new WebhookClient({
					url: user.discordWebhook,
				});

				webhookClient.send({
					embeds: [embed],
				});

				await Seller.updateSellerASINS(seller.sellerID, ASIN);
			}
		} catch (error) {
			signale.error("Error processing new ASIN: ", error);
		}
	}

	static async processRemovedASIN(ASIN, seller) {
		try {
			await Seller.deleteASIN(seller.sellerID, ASIN);
			signale.info("Removed ASIN from database: ", ASIN);
		} catch (error) {
			signale.error("Error processing removed ASIN: ", error);
		}
	}

	createEmbed({ productTitle, productPrice, productCategory, productImage, salesRank, fulfillmentType }, ASIN) {
		const embed = new EmbedBuilder()
			.setAuthor({ name: "Amazon Stalker" })
			.setTitle(`New Product Found! - ${ASIN}`)
			.setURL(`https://www.amazon.com/dp/${ASIN}`)
			.setColor("#00ff00")
			.setImage(
				`https://graph.keepa.com/pricehistory.png?asin=${ASIN}&domain=com`
			)
			.setThumbnail(productImage)
			.setFooter({
				text: "Amazon Stalker",
				iconURL: `https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Amazon_icon.svg/2500px-Amazon_icon.svg.png`,
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
		return embed;
	}
};
