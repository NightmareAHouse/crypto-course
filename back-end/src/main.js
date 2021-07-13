const Binance = require('node-binance-api')
const axios = require('axios')
const url = require('url');
const binance = new Binance().options({
    APIKEY: 'nc6lLi1aK0p4yzpRuLf4wWL23qyU3f2MUaS0287A9sz7N3eY33XakyYNDqCzdTVr',
    APISECRET: 'vdiJJ9d2Fih3YIEHA1iGauhcZmrmMls8oLcqiy5wlBT3VLJRqizqvcK6RPPL1xu5',
    reconnect: false
})

function getAllName(index) {
    let loop_limiter = index + 35;
    binance.bookTickers((error, ticker) => {
        if (loop_limiter >= ticker.length)
            loop_limiter = ticker.length;
        for (index; index < loop_limiter; index++) {
            getBidsAndAsks(ticker[index]['symbol']).catch(console.log);
        }
        if (index === ticker.length)
            index = 0;
        console.log(index);
        setTimeout(getAllName, 9000, index)
    })
}

async function getBidsAndAsks(array) {
    binance.websockets.depthCache(array, (symbol, depth) => {
        let date = new Date();
        let time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        let bids = binance.sortBids(depth.bids);
        let asks = binance.sortAsks(depth.asks);
        let restRequestOptions = url.format({
            protocol: 'http',
            hostname: 'localhost',
            port: '7072',
            pathname: 'wrotedata',
            query: {
                instrument: symbol,
                bestBid: binance.first(bids),
                bestAsk: binance.first(asks),
                time: time
            }
        });
        axios.get(restRequestOptions)
            .then().catch(console.log)
        console.info(symbol + " depth cache update");
        console.info("best bid: " + binance.first(bids));
        console.info("best ask: " + binance.first(asks));
        let endpoints = binance.websockets.subscriptions();
        for (let endpoint in endpoints) {
            let ws = endpoints[endpoint];
            ws.terminate();
        }
    });
}

let index = 0
getAllName(index);

