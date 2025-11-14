import UniversalSocket from "../../src/index";

const ws = new UniversalSocket({ type: "valr", tradeType: "futures" });

// Wait until connected
ws.onOpen(async () => {
    console.log("✅ Socket connected!");
    // ws.subscribeTicker(["BTC-USDT", "LTC-USDT"]);

    // let localOrderBook = {
    //     lastUpdateId: 0,
    //     bids: [], // array: [[price, qty]]
    //     asks: []  // array: [[price, qty]]
    // };

    // const url = `https://fapi.binance.com/api/v3/depth?symbol=BCHUSDT&limit=5000`;

    // const res = await fetch(url);
    // const json = await res.json();

    // localOrderBook.lastUpdateId = json.lastUpdateId;
    // localOrderBook.bids = json.bids;
    // localOrderBook.asks = json.asks;

    // console.log("📥 SNAPSHOT LOADED", localOrderBook);


    // ws.subscribeOrderBook('BCH-USDT', localOrderBook, 20)


    // let localOrderBook = {
    //     bids: [],
    //     asks: [],
    //     lastUpdateId: 0
    // };

    // const url = `https://api.bybit.com/v5/market/orderbook?category=spot&symbol=RENDERUSDT&limit=20`;
    // const res = await fetch(url);
    // const json = await res.json();

    // localOrderBook.bids = json.result.b;
    // localOrderBook.asks = json.result.a;
    // localOrderBook.lastUpdateId = json.result.u;

    // console.log("📥 BYBIT SNAPSHOT LOADED", localOrderBook);

    // ws.subscribeOrderBook("RENDER-USDT", localOrderBook, 20);

    // let localOrderBook = {
    //     bids: [],
    //     asks: [],
    //     lastUpdateId: 0
    // };

    // const url = `https://api.bitget.com/api/v2/mix/market/merge-depth?productType=usdt-futures&symbol=BTCUSDT`;
    // const res = await fetch(url);
    // const json = await res.json();

    // localOrderBook.bids = json.data.bids;
    // localOrderBook.asks = json.data.asks;
    // localOrderBook.lastUpdateId = 0

    // console.log("📥 BYBIT SNAPSHOT LOADED", localOrderBook);

    // ws.subscribeOrderBook("BCH-USDT", localOrderBook, 20);


    let localOrderBook = {
        bids: [],
        asks: [],
        lastUpdateId: 0
    };

    // const snapshotUrl = `https://api.valr.com/v1/public/BTCUSDT/orderbook`;

    // const res = await fetch(snapshotUrl);
    // const json = await res.json();

    // // Convert snapshot into simple [[price, qty]]
    // localOrderBook.bids = json.Bids.map(b => [String(b.price), String(b.quantity)]);
    // localOrderBook.asks = json.Asks.map(a => [String(a.price), String(a.quantity)]);

    // localOrderBook.lastUpdateId = json.SequenceNumber;

    // console.log("📥 VALR SNAPSHOT LOADED", localOrderBook);

    ws.subscribeOrderBook("BTCUSDT", localOrderBook, 20);



});

// // Listen for ticker data
// ws.ticker((data) => {
//     console.log("📊 ticker:", data);
// });


//Listen for trade data
ws.orderbook((data) => {
    console.log("📊 orderbook:", data?.asks[2]);
    console.log("📊 orderbook:", data?.asks[1]);
    console.log("📊 orderbook:", data?.asks[0]);
    console.log("  ")
    console.log("📊 orderbook:", data?.bids[0]);
    console.log("📊 orderbook:", data?.bids[1]);
    console.log("📊 orderbook:", data?.bids[2]);
    console.log("  ")
    console.log("  ")
});



// setTimeout(() => {
//     ws.UnsubscribeTicker(["BTC-USDT", "LTC-USDT"])

//     ws.subscribeTicker(["ETH-USDT"])
//     // ws.close()

// }, 10000);
