const Binance = require('node-binance-api')
const binance = new Binance().options({
    APIKEY: 'nc6lLi1aK0p4yzpRuLf4wWL23qyU3f2MUaS0287A9sz7N3eY33XakyYNDqCzdTVr',
    APISECRET: 'vdiJJ9d2Fih3YIEHA1iGauhcZmrmMls8oLcqiy5wlBT3VLJRqizqvcK6RPPL1xu5'
})

var name_course_arraay = [""];

function getAllName() {
    binance.bookTickers((error, ticker) => {
        for (let index = 0; index < 10; index++) {
            name_course_arraay[index] = ticker[index]['symbol'];
        }
        console.log("end");
        console.log(name_course_arraay);
        getBidsAndAsks(name_course_arraay)
    });
}

function getBidsAndAsks (array){
        binance.websockets.depthCache(array, (symbol, depth) => {
        let bids = binance.sortBids(depth.bids);
        let asks = binance.sortAsks(depth.asks);
        console.info(symbol+" depth cache update");
        console.info("bids", bids);
        console.info("asks", asks);
        console.info("last updated: " + new Date(depth.eventTime));
    });
}

getAllName();
