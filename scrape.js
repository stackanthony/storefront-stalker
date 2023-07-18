const signale = require("signale");
const axios = require("axios");
const cheerio = require("cheerio");
// const AmazonParser = require("./src/classes/AmazonParser");
// const amazonParser = new AmazonParser("ASBIGH1CERS24");

let sellerID = "ASBIGH1CERS24"
const queryURL = `https://www.amazon.com/s?i=merchant-items&me=${sellerID}`;



const main = async () => {
    // let sellerASINS = amazonParser.getSellerASINS();
    // sellerASINS.forEach((sellerASIN) => signale.info(sellerASIN));
    // let res = await axios.get(queryURL, {
    //     headers: {
    //         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    //     }
    // });

    // rewrite the axios request with fetch instead
    let res = await fetch(queryURL, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        }
    });

    // convert the response to text
    let html = await res.text();
    const $ = cheerio.load(html);

    // const productTitles = $('div.s-card-container div.a-section div.sg-col-inner div.a-section.a-spacing-none.puis-padding-right-small.s-title-instructions-style h2.a-size-mini a.a-link-normal').text().trim().split(',');
    // signale.info(productTitles);


    let sellerAsins = [];
    $("div[data-asin]").each((i, ASIN) => {
        // asins[index] = ASIN;
        let currentASIN = $(ASIN).attr("data-asin");
        if (currentASIN) {
            sellerAsins[i] = currentASIN;
        }
    });

    sellerAsins.forEach((ASIN) => {
        signale.info(ASIN);
    })
    // const divElement = $('div[data-asin]');
    // const dataAsinValue = divElement.attr('data-asin');
    // console.log(dataAsinValue);

    // const $ = await cheerio.fromURL(queryURL);
    // let productTitle = $("div[data-asin]");
    // console.log($("span.a-size-medium a-color-base a-text-normal").text());
    // const chunks = res.data.split('&&&');
    // const sellerMetadata = JSON.parse(chunks[1])[2].metadata;
    // let totalResults = sellerMetadata.totalResultCount;
    // signale.info("Total Results: ", totalResults);

    // let ASIN = JSON.parse(chunks[6])[2].asin;
    // signale.info(`${ASIN}`);
}

main();