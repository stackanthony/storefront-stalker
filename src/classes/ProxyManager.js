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

    static getAllProxies() {
        return proxies;
    }
}