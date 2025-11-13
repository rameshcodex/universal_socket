import UniversalSocket from "../../src/index";

const ws = new UniversalSocket({ type: "valr", tradeType: "futures" });

// Wait until connected
ws.onOpen(() => {
    console.log("✅ Socket connected!");
    // ws.subscribeTicker(["BTC-USDT", "LTC-USDT"]);

    ws.subscribeMarketTrade('BTC-USDT')
});

// // Listen for ticker data
// ws.ticker((data) => {
//     console.log("📊 ticker:", data);
// });


//Listen for trade data
ws.markettrade((data) => {
    console.log("📊 marketTrade:", data);
});

// setTimeout(() => {
//     ws.UnsubscribeTicker(["BTC-USDT", "LTC-USDT"])

//     ws.subscribeTicker(["ETH-USDT"])
//     // ws.close()

// }, 10000);
