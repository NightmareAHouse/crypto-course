const Binance = require('node-binance-api')
const axios = require('axios')
const url = require('url');
const binance = new Binance().options({
    APIKEY: 'nc6lLi1aK0p4yzpRuLf4wWL23qyU3f2MUaS0287A9sz7N3eY33XakyYNDqCzdTVr',
    APISECRET: 'vdiJJ9d2Fih3YIEHA1iGauhcZmrmMls8oLcqiy5wlBT3VLJRqizqvcK6RPPL1xu5',
    reconnect: false
})

function getAllName(index) {
    binance.bookTickers(async (error, ticker) => {
        console.log(index);
        if(index === ticker.length)
            index = 0;
        for (index; index <= (index + 10); index++) {
            await getBidsAndAsks(ticker[index]['symbol']);
        }
    })
    // setTimeout(getAllName, 10000, index);
}

async function getBidsAndAsks(array) {
    binance.websockets.depthCache(array, async (symbol, depth) => {
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
        try {
            await axios.get(restRequestOptions)
                .then(r => {
                    console.info(symbol + " depth cache update");
                    console.info("best bid: " + binance.first(bids));
                    console.info("best ask: " + binance.first(asks));
                    console.log(r);
                })
        } catch (error) {
            console.log("That did not go well.");
            throw error
        }
    });
}

let index = 0;
getAllName(index);
