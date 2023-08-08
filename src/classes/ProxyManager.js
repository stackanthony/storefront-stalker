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

    getProxiesLength() {
        return this.proxies.length;
    }

    getProxyHost(proxy) {
        return proxy.split(":")[0];
    }

    getProxyPort(proxy) {
        return proxy.split(":")[1];
    }

    getProxyUsername(proxy) {
        return proxy.split(":")[2];
    }
    
    getProxyPassword(proxy) {
        return proxy.split(":")[3];
    }
}