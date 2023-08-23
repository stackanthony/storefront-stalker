const signale = require("signale");
const { Seller, User } = require("../database/models");
const scraper = require("./AmazonScraper");
const { WebhookClient, EmbedBuilder } = require("discord.js");
const getRandomInterval = (min, max) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

/*
* Sets a random timer between min, max.
*/
const randomTimer = (min, max) => {
	const randomInterval = getRandomInterval(min, max);
	return new Promise((res) => setTimeout(res, randomInterval));
};

module.exports = class AmazonMonitor {
	//Main function of the monitor, that checks for new products that users are monitoring and sends notifications when new products are found.
	static async run() {
		try {
			//Retreive all seller ID's in DB
			const sellerIDs = await Seller.getAllSellerIDs();
			// check if there are any sellers to monitor
			if (sellerIDs.length === 0) {
				//NO SELLERS IN DB
				signale.info("No sellers to monitor.");
				return await randomTimer(5000, 5500);
			}
			signale.await("Started monitoring for new Seller Products...");

			//For every sellerID in DB, get the object (row) from DB and check if there's any new ASIN's that a seller has added
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
				await randomTimer(30000, 40000); // change these values based on amount of proxies. The more proxies you have, the less your delay can be. Tinker as you go.
			}
		} catch (error) {
			signale.error("Monitor error: ", error);
		}
	}

	/**
	 * Checks all of the seller's ASINS through our scraping method. 
	 * If new products are found, we send notifications through Discord embeds to each user that monitor the seller.  
	 * @param {Seller} seller
	 */
	static async processSeller(seller) {
		try {
			const sellerAsins = await scraper.getSellerASINS(seller.sellerID, 4000); // get current ASINs from Seller page that's been scraped
			const existingAsins = await Seller.getASINSFromSellerID(seller.sellerID); // get existing ASINs that are in the DB
			const existingAsinSet = new Set(existingAsins); // create HashSet so we can do O(1) lookups

			const newAsins = sellerAsins.filter((ASIN) => !existingAsinSet.has(ASIN)); // init array that contains all of the new ASINS on the sellers page, if any.

			if (newAsins.length > 0) {
				// PROCESS NEW ASINS
				signale.info("New ASINs: ", newAsins);

				//from the users in DB, find which users are tracking the seller that has added the ASINS 
				const usersTrackingSeller = await User.findAll({
					where: { discordUserID: seller.usersTracking },
				});

				//for every new ASIN, find ASIN product information and send embed to user's webhook.
				for (const ASIN of newAsins) {
					await this.processNewASIN(ASIN, seller, usersTrackingSeller);
				}

			}
		} catch (error) {
			signale.error("Error processing seller: ", error);
		}
	}

	/**
	 * Find ASIN product information and send embed through webhook to each user that is monitoring the seller
	 * @param {String} ASIN 
	 * @param {Seller} seller 
	 * @param {Array} usersTrackingSeller 
	 */
	static async processNewASIN(ASIN, seller, usersTrackingSeller) {
		try {
			const productInfo = await scraper.getASINInformation(ASIN); // through scraping, gets various product information data for specific ASIN
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

				try {
					webhookClient.send({
						embeds: [embed],
					});
				} catch (error) {
					throw new Error("Webhook Doesn't Exist");
				}


				await Seller.updateSellerASINS(seller.sellerID, ASIN); // update seller ASINS in DB
			}
		} catch (error) {
			signale.error("Error processing new ASIN: ", error);
		}
	}

	static createEmbed({ productTitle, productPrice, productCategory, productImage, salesRank, fulfillmentType }, ASIN) {
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
