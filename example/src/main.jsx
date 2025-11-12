import UniversalSocket from "universal-socket-react";

const ws = new UniversalSocket({ type: "binance" });

// Wait until connected
ws.onOpen(() => {
    console.log("✅ Socket connected!");
    ws.subscribeTicker(["BTC-USDT", "LTC-USDT"]);
});

// Listen for ticker data
ws.ticker((data) => {
    console.log("📊 ticker:", data);
});

setTimeout(() => {
    ws.UnsubscribeTicker(["BTC-USDT", "LTC-USDT"])

    ws.subscribeTicker(["ETH-USDT"])

}, 10000);


// Listen for ticker data
ws.ticker((data) => {
    console.log("📊 ticker2:", data);
});