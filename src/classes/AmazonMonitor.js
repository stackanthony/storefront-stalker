const signale = require("signale");
const { Seller } = require("../database/models");
const AmazonScraper = require("./AmazonScraper");

const { WebhookClient, EmbedBuilder } = require("discord.js");
const webhookClient = new WebhookClient({ id: "1131325956968169472", token: "0360hIQV1fPPxiJ2u7Ebdllhurr0zOH0ipIiU9Mb7jh0Y1gEIiwSPEe5Bx6qN6p13_uu" })

const getRandomInterval = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomTimer = () => {
    const randomInterval = getRandomInterval(3000, 6000);
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

                //Get ASINS for the seller using the scraper
                const sellerAsins = await this.scraper.getSellerASINS(sellerID);

                //Get existing ASINS for the seller from the database
                const existingAsins = await this.seller.getASINSFromSellerID(sellerID);
                const existingAsinSet = new Set(existingAsins.map((ASIN) => ASIN));
                signale.info(existingAsinSet);

                const newAsins = sellerAsins.filter((ASIN) => !existingAsinSet.has(ASIN));

                if (newAsins.length > 0) {
                    // NEW PRODUCT FOUND
                    newAsins.forEach(async (ASIN) => {
                        const { productTitle, productPrice, productSize, productStyle, fulfillmentType } = await this.scraper.getASINInformation(ASIN);
                        
                        webhookClient.send({
                            content: `Product Title: `
                        })
                    
                    })
                }

                await randomTimer();
            }
        } catch (error) {
            signale.error("Monitor error: ", error);
        }
    }
}