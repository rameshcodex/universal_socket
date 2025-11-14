import UniversalSocket from "../../src/index";

const ws = new UniversalSocket({ type: "binance", tradeType: "futures" });

// Wait until connected
ws.onOpen(async () => {
    console.log("✅ Socket connected!");
    // ws.subscribeTicker(["BTC-USDT", "LTC-USDT"]);

    let localOrderBook = {
        lastUpdateId: 0,
        bids: [], // array: [[price, qty]]
        asks: []  // array: [[price, qty]]
    };

    // const url = `https://fapi.binance.com/api/v3/depth?symbol=BCHUSDT&limit=5000`;

    // const res = await fetch(url);
    // const json = await res.json();

    // localOrderBook.lastUpdateId = json.lastUpdateId;
    // localOrderBook.bids = json.bids;
    // localOrderBook.asks = json.asks;

    console.log("📥 SNAPSHOT LOADED", localOrderBook);


    ws.subscribeOrderBook('BCH-USDT', localOrderBook, 20)
});

// // Listen for ticker data
// ws.ticker((data) => {
//     console.log("📊 ticker:", data);
// });


//Listen for trade data
ws.orderbook((data) => {
    console.log("📊 orderbook:", data?.bids);
});



// setTimeout(() => {
//     ws.UnsubscribeTicker(["BTC-USDT", "LTC-USDT"])

//     ws.subscribeTicker(["ETH-USDT"])
//     // ws.close()

// }, 10000);
