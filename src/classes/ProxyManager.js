/**
 * This class is used to handle proxy rotation logic. 
 * We have two class variables that are used to keep track the index of the proxies array we're on, and the proxies array.
 * Using this, we ensure that each request we send is via a different proxy. This allows us to circumvent bans from Amazon.com.
 */

const fs = require("fs");
const signale = require("signale");


let proxies = [];
try {
    fileData = fs.readFileSync("./proxies.txt", "utf-8");

    proxies = fileData.split(/\r?\n/).filter(proxy => proxy.trim() !== '');

} catch (error) {
    signale.error(error);
}
module.exports = class ProxyManager {

    constructor() {
        this.proxies = proxies;
        this.currentIndex = 0;
    }

    getNextProxy() {
        const proxy = this.proxies[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.proxies.length; // Reset to 0 when reaching the end
        return proxy;
    }

    getAllProxies() {
        return this.proxies;
    }

    getProxyInformation(proxy) {
        return {
            host: proxy.split(":")[0],
            port: proxy.split(":")[1],
            username: proxy.split(":")[2],
            password: proxy.split(":")[3],
        }
    }
}