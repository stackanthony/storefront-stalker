const signale = require("signale");
const { webhookID, webhookToken } = require("../../config.json");

signale.config({
    displayTimestamp: true,
    displayDate: true,
})

const { Seller } = require("../database/models");
const AmazonScraper = require("./AmazonScraper");

const { WebhookClient, EmbedBuilder } = require("discord.js");
const webhookClient = new WebhookClient({
    id: webhookID, token: webhookToken
});

const getRandomInterval = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomTimer = () => {
    const randomInterval = getRandomInterval(15000, 20000);
    return new Promise((res) => setTimeout(res, randomInterval));
};

module.exports = class AmazonMonitor {

    constructor() {
        this.scraper = new AmazonScraper();
        this.seller = new Seller();
    }

    async monitor() {
        try {
            const sellerIDs = await this.seller.getAllSellerIDs();

            for (const { sellerID } of sellerIDs) {

                signale.await("Monitoring for new Seller Products...");

                //Get ASINS for the seller using the scraper
                const sellerAsins = await this.scraper.getSellerASINS(sellerID);

                //Get existing ASINS for the seller from the database
                const existingAsins = await this.seller.getASINSFromSellerID(sellerID);
                const existingAsinSet = new Set(existingAsins);

                const newAsins = sellerAsins.filter((ASIN) => !existingAsinSet.has(ASIN));

                if (newAsins.length > 0) {
                    // NEW PRODUCT FOUND
                    signale.info(newAsins);
                    newAsins.forEach(async (ASIN) => {
                        const { productTitle, productPrice, productSize, productStyle, fulfillmentType } = await this.scraper.getASINInformation(ASIN);
                        signale.success("Found Product: ", productTitle);
                        webhookClient.send({
                            content: `Product Title: ${productTitle}\nPrice: ${productPrice}\nFulfillment Type: ${fulfillmentType}`
                        });

                        await this.seller.updateSellerASINS(sellerID, ASIN);

                    })
                }

                await randomTimer();
            }
        } catch (error) {
            signale.error("Monitor error: ", error);
        }
    }
}