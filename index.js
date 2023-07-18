const signale = require("signale");
const axios = require("axios");

let sellerID = "ASBIGH1CERS24"
const queryURL = `https://www.amazon.com/s/query?i=merchant-items&me=${sellerID}`;

const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
}

const main = async () => {
    let res = await axios.get(queryURL, {
        headers: headers
    });

    const chunks = res.data.split('&&&');
    const sellerMetadata = JSON.parse(chunks[1])[2].metadata;
    let totalResults = sellerMetadata.totalResultCount;
    signale.info("Total Results: ", totalResults);

    let ASIN = JSON.parse(chunks[6])[2].asin;
    signale.info(`${ASIN}`);
}

main();