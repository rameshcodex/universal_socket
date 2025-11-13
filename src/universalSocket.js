/**
 * UniversalSocket (Browser/React)
 * - ticker-only
 * - supports Binance and Bybit public ticker streams
 * - auto reconnects and resubscribes
 *
 * Example:
 *   const ws = new UniversalSocket({ type: "binance" });
 *   ws.onOpen(() => ws.subscribeTicker(["BTCUSDT", "LTCUSDT"]));
 *   ws.ticker((data) => console.log("ticker:", data));
 */

export default class UniversalSocket {
  constructor({ type = "binance", autoConnect = true, tradeType = "spot" } = {}) {
    this.type = String(type).toLowerCase();
    this.tradeType = String(tradeType).toLowerCase();
    this.ws = null;
    this.callbacks = {
      ticker: new Set(),
      open: new Set(),
      markettrade: new Set()
    };
    this.subscribedTopics = new Set();
    this.ready = false;
    this._reconnectTimeout = 2000;

    if (autoConnect) this.connect();
  }

  connect() {
    if (this.ws && (this.ws.readyState === 1 || this.ws.readyState === 0)) return;

    let url;
    if (this.type === "binance" && this.tradeType == "spot") url = "wss://stream.binance.com:9443/ws";
    else if (this.type === "binance" && this.tradeType == "futures") url = "wss://fstream.binance.com/ws";
    else if (this.type === "bybit" && this.tradeType == "spot") url = "wss://stream.bybit.com/v5/public/spot";
    else if (this.type === "bybit" && this.tradeType == "futures") url = "wss://stream.bybit.com/v5/public/linear";
    else if (this.type === "bitget") url = "wss://ws.bitget.com/v2/ws/public";
    else if (this.type === "valr") url = "wss://api.valr.com/ws/trade"
    else throw new Error("Unsupported exchange type: " + this.type);

    this.ws = new WebSocket(url);

    this.ws.addEventListener("open", () => {
      this.ready = true;
      this._emit("open");
    });

    this.ws.addEventListener("message", (ev) => this._onMessage(ev.data));

    this.ws.addEventListener("close", () => {
      this.ready = false;
      // setTimeout(() => this.connect(), this._reconnectTimeout);
    });

    this.ws.addEventListener("error", () => {
      try {
        this.ws.close();
      } catch (_) { }
    });
  }

  // --- Public API ---

  onOpen(callback) {
    if (typeof callback !== "function") throw new Error("callback must be function");
    this.callbacks.open.add(callback);
    if (this.ready) callback(); // call immediately if already open
    return () => this.callbacks.open.delete(callback);
  }

  waitForOpen() {
    return new Promise((resolve) => {
      if (this.ready) return resolve();
      const off = this.onOpen(() => {
        off();
        resolve();
      });
    });
  }

  // symbols: array like ["BTCUSDT","LTCUSDT"]
  subscribeTicker(symbols = []) {
    if (!Array.isArray(symbols)) symbols = [symbols];
    var normalized = symbols.map((s) => s.replace(/\W/g, "").toUpperCase());
    console.log("🚀 ~ UniversalSocket ~ subscribeTicker ~ normalized:", normalized)

    if (this.type == "valr") {
      if (this.tradeType === "futures") {
        normalized = symbols.map((s) => s.replace(/\W/g, "").toUpperCase() + "PERP");
      }
      this._sendSubscribe(normalized);
    }
    else {
      normalized.forEach((sym) => {
        const topic =
          this.type === "binance"
            ? `${sym.toLowerCase()}@ticker` :
            this.type === "bybit" ?
              `tickers.${sym}` :
              this.type === "bitget" ?
                {
                  "instType": this.tradeType == "spot" ? "SPOT" : "USDT-FUTURES",
                  "channel": "ticker",
                  "instId": sym
                } :
                sym
        this._sendSubscribe(topic);
      });
    }
  }

  UnsubscribeTicker(symbols = []) {
    if (!Array.isArray(symbols)) symbols = [symbols];
    const normalized = symbols.map((s) => s.replace(/\W/g, "").toUpperCase());

    if (this.type == "valr") {
      this._unsendSubscribe(normalized);
    }
    else {
      normalized.forEach((sym) => {
        const topic =
          this.type === "binance"
            ? `${sym.toLowerCase()}@ticker` :
            this.type === "bybit" ?
              `tickers.${sym}` :
              this.type === "bitget" ?
                {
                  "instType": this.tradeType == "spot" ? "SPOT" : "USDT-FUTURES",
                  "channel": "ticker",
                  "instId": sym
                } :
                sym
        this._unsendSubscribe(topic);
      });
    }
  }


  subscribeMarketTrade(symbols = []) {
    if (!Array.isArray(symbols)) symbols = [symbols];
    var normalized = symbols.map((s) => s.replace(/\W/g, "").toUpperCase());
    console.log("🚀 ~ UniversalSocket ~ subscribeTicker ~ normalized:", normalized)

    if (this.type == "valr") {
      if (this.tradeType === "futures") {
        normalized = symbols.map((s) => s.replace(/\W/g, "").toUpperCase() + "PERP");
      }
      this._sendSubscribe(normalized);
    }
    else {
      normalized.forEach((sym) => {
        const topic =
          this.type === "binance"
            ? `${sym.toLowerCase()}@trade` :
            this.type === "bybit" ?
              `publicTrade.${sym}` :
              this.type === "bitget" ?
                {
                  "instType": this.tradeType == "spot" ? "SPOT" : "USDT-FUTURES",
                  "channel": "trade",
                  "instId": sym
                } :
                sym
        this._sendSubscribe(topic);
      });
    }
  }

  UnsubscribeMarketTrade(symbols = []) {
    if (!Array.isArray(symbols)) symbols = [symbols];
    const normalized = symbols.map((s) => s.replace(/\W/g, "").toUpperCase());

    if (this.type == "valr") {
      this._unsendSubscribe(normalized);
    }
    else {
      normalized.forEach((sym) => {
        const topic =
          this.type === "binance"
            ? `${sym.toLowerCase()}@trade` :
            this.type === "bybit" ?
              `publicTrade.${sym}` :
              this.type === "bitget" ?
                {
                  "instType": this.tradeType == "spot" ? "SPOT" : "USDT-FUTURES",
                  "channel": "trade",
                  "instId": sym
                } :
                sym
        this._unsendSubscribe(topic);
      });
    }
  }


  ticker(callback) {
    if (typeof callback !== "function")
      throw new Error("callback must be function");
    this.callbacks.ticker.add(callback);
    return () => this.callbacks.ticker.delete(callback);
  }


  markettrade(callback) {
    if (typeof callback !== "function")
      throw new Error("callback must be function");
    this.callbacks.markettrade.add(callback);
    return () => this.callbacks.markettrade.delete(callback);
  }

  close() {
    try {
      if (this.ws) this.ws.close();
    } catch (_) { }
    this.ws = null;
    this.ready = false;
  }

  // --- Internal helpers ---

  _formatTime(dateInput) {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  _sendSubscribe(topic) {
    if (!this.ws || this.ws.readyState !== 1) return;
    try {
      if (this.type === "binance") {
        this.ws.send(
          JSON.stringify({ method: "SUBSCRIBE", params: [topic], id: Date.now() })
        );
      } else if (this.type === "bybit") {
        this.ws.send(JSON.stringify({ op: "subscribe", args: [topic] }));
      } else if (this.type === "bitget") {
        this.ws.send(JSON.stringify({ op: "subscribe", args: [topic] }));
      } else if (this.type === "valr") {
        this.ws.send(JSON.stringify({
          "type": "SUBSCRIBE",
          "subscriptions": [
            {
              "event": "MARKET_SUMMARY_UPDATE",
              "pairs":
                topic

            }
          ]
        }));
      }
    } catch (_) { }
  }

  _unsendSubscribe(topic) {
    if (!this.ws || this.ws.readyState !== 1) return;
    try {
      if (this.type === "binance") {
        this.ws.send(
          JSON.stringify({ method: "UNSUBSCRIBE", params: [topic], id: Date.now() })
        );
      } else if (this.type === "bybit") {
        this.ws.send(JSON.stringify({ op: "unsubscribe", args: [topic] }));
      } else if (this.type === "bitget") {
        this.ws.send(JSON.stringify({ op: "unsubscribe", args: [topic] }));
      } else if (this.type === "valr") {
        this.ws.send(JSON.stringify({
          "type": "UNSUBSCRIBE",
          "subscriptions": [
            {
              "event": "MARKET_SUMMARY_UPDATE",
              "pairs": topic
            }
          ]
        }));
      }
    } catch (_) { }
  }

  _onMessage(raw) {
    let data;
    try {
      data = JSON.parse(raw);
      console.log("🚀 ~ UniversalSocket ~ _onMessage ~ data:", data)
    } catch (_) {
      return;
    }

    // Binance format
    if (this.type === "binance" && data.e === "24hrTicker") {
      const normalized = {
        exchange: "binance",
        symbol: data?.s,
        price: Number(data?.c),
        high: Number(data?.h),
        low: Number(data?.l),
        open: Number(data?.o),
        volumebase: Number(data?.v)?.toFixed(2),
        volumequote: Number(data?.q)?.toFixed(2),
        changePercent: (Number(data?.P))?.toFixed(2),
      };
      this._emit("ticker", normalized);
      return;
    }

    if (this.type === "binance" && data.e === "trade") {
      const normalized = {
        exchange: "binance",
        symbol: data?.s,
        price: Number(data?.p),
        quantity: Number(data?.q),
        marketMaker: data?.m, // is true then show red if false then show green
        TradeTime: this._formatTime(data?.T),
        Eventtime: this._formatTime(data?.T),
        tradeId: data?.t,
      };
      this._emit("markettrade", [normalized]);
      return;
    }

    // Bybit format
    if (
      this.type === "bybit" &&
      typeof data.topic === "string" &&
      data.topic.startsWith("tickers.")
    ) {
      const d = data.data;
      const payload = Array.isArray(d) ? d[0] : d;
      const normalized = {
        exchange: "bybit",

        symbol: payload?.symbol,
        price: Number(payload?.lastPrice),
        high: Number(payload?.highPrice24h),
        low: Number(payload?.lowPrice24h),
        volumebase: Number(payload?.volume24h)?.toFixed(2),
        volumequote: Number(payload?.turnover24h)?.toFixed(2),
        changePercent: (Number(payload?.price24hPcnt) * 100)?.toFixed(2),
      };
      if (normalized?.price) {
        this._emit("ticker", normalized);
      }
      return;
    }

    if (
      this.type === "bybit" &&
      typeof data.topic === "string" &&
      data.topic.startsWith("publicTrade.")
    ) {
      const d = data.data;
      const payload = Array.isArray(d) ? d[0] : d;
      const normalized = {
        exchange: "bybit",
        symbol: payload?.s,
        price: Number(payload?.p),
        quantity: Number(payload?.v),
        marketMaker: payload?.S === "Buy" ? false : true, // is true then show red if false then show green
        TradeTime: this._formatTime(payload?.T),
        Eventtime: this._formatTime(payload?.E),
        tradeId: payload?.i,

      };
      if (normalized?.price) {
        this._emit("markettrade", [normalized]);
      }
      return;
    }


    // Biget format
    if (this.type === "bitget" && data?.action == "snapshot" && data?.arg?.channel == "ticker") {
      const d = data.data;
      const payload = Array.isArray(d) ? d[0] : d;

      const normalized = {
        exchange: "bitget",

        symbol: payload?.instId,
        price: Number(payload?.lastPr),
        changePercent: (Number(payload?.change24h) * 100)?.toFixed(2),
        high: Number(payload?.high24h),
        low: Number(payload?.low24h),
        open: Number(payload?.open24h),
        volumebase: Number(payload?.baseVolume)?.toFixed(2),
        volumequote: Number(payload?.quoteVolume)?.toFixed(2),

      };
      this._emit("ticker", normalized);
      return;
    }

    // Biget format
    if (this.type === "bitget" && data?.action == "update" && data?.arg?.channel == "trade") {
      const d = data.data;
      // const payload = Array.isArray(d) ? d[0] : d;
      var normalized = []
      for (let i = 0; i < d.length; i++) {
        const payload = d[i];
        var normalizedObj = {
          exchange: "bitget",
          symbol: data?.arg?.instId,
          price: Number(payload?.price),
          quantity: Number(payload?.size),
          marketMaker: payload?.side === "buy" ? false : true, // is true then show red if false then show green
          TradeTime: this._formatTime(Number(payload?.ts)),
          Eventtime: this._formatTime(Number(payload?.ts)),
          tradeId: payload?.tradeId,

        };

        normalized.push(normalizedObj)
      }

      this._emit("markettrade", normalized);
      return;
    }

    if (this.type === "valr" && data?.type == "MARKET_SUMMARY_UPDATE") {
      const d = data.data;
      const payload = d

      const normalized = {
        exchange: "valr",

        symbol: payload?.currencyPairSymbol,
        price: Number(payload?.lastTradedPrice),
        markPrice: Number(payload?.markPrice),
        changePercent: (Number(payload?.changeFromPrevious))?.toFixed(2),
        high: Number(payload?.highPrice),
        low: Number(payload?.lowPrice),
        volumebase: Number(payload?.baseVolume)?.toFixed(2),
        volumequote: Number(payload?.quoteVolume)?.toFixed(2),
      };
      this._emit("ticker", normalized);
      return;
    }
  }

  _emit(type, data) {
    const cbs = this.callbacks[type];
    if (!cbs) return;
    for (const cb of cbs) {
      try {
        cb(data);
      } catch (_) { }
    }
  }
}
