const cheerio = require("cheerio");
const axios = require("axios");
const signale = require("signale");
let queryURL = "https://www.amazon.com/s?i=merchant-items&me=";
module.exports = class AmazonParser {
    //will need to refactor this when we keep track of multiple seller ID's.
    constructor(sellerID) {
        queryURL += sellerID;

        let res = axios.get(queryURL, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
            }
        }).then(() => {
            console.log(res);
            signale.success("Amazon Parser Connection Established");
        }).catch((error) => {
            signale.error("Couldn't Establish Amazon Parser Connection due to ", error);
        });

        // this.$ = cheerio.load(res);

    }

    getSellerASINS() {
        let sellerASINS = [];

        this.$("div[data-asin]").each((i, ASIN) => {
            // asins[index] = ASIN;
            let currentASIN = $(ASIN).attr("data-asin");
            if (currentASIN) {
                sellerASINS[i] = currentASIN;
            }
        });

        return sellerASINS;
    }
}