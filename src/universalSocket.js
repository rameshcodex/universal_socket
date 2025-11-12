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
  constructor({ type = "binance", autoConnect = true } = {}) {
    this.type = String(type).toLowerCase();
    this.ws = null;
    this.callbacks = {
      ticker: new Set(),
      open: new Set(),
    };
    this.subscribedTopics = new Set();
    this.ready = false;
    this._reconnectTimeout = 2000;

    if (autoConnect) this.connect();
  }

  connect() {
    if (this.ws && (this.ws.readyState === 1 || this.ws.readyState === 0)) return;

    let url;
    if (this.type === "binance") url = "wss://stream.binance.com:9443/ws";
    else if (this.type === "bybit") url = "wss://stream.bybit.com/v5/public/spot";
    else throw new Error("Unsupported exchange type: " + this.type);

    this.ws = new WebSocket(url);

    this.ws.addEventListener("open", () => {
      this.ready = true;
      this._emit("open");
    });

    this.ws.addEventListener("message", (ev) => this._onMessage(ev.data));

    this.ws.addEventListener("close", () => {
      this.ready = false;
      setTimeout(() => this.connect(), this._reconnectTimeout);
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
    const normalized = symbols.map((s) => s.replace(/\W/g, "").toUpperCase());
    normalized.forEach((sym) => {
      const topic =
        this.type === "binance"
          ? `${sym.toLowerCase()}@ticker`
          : `tickers.${sym}`;
      this._sendSubscribe(topic);
    });
  }

  UnsubscribeTicker(symbols = []) {
    if (!Array.isArray(symbols)) symbols = [symbols];
    const normalized = symbols.map((s) => s.replace(/\W/g, "").toUpperCase());
    normalized.forEach((sym) => {
      const topic =
        this.type === "binance"
          ? `${sym.toLowerCase()}@ticker`
          : `tickers.${sym}`;
      this._unsendSubscribe(topic);
    });
  }


  ticker(callback) {
    if (typeof callback !== "function")
      throw new Error("callback must be function");
    this.callbacks.ticker.add(callback);
    return () => this.callbacks.ticker.delete(callback);
  }

  close() {
    try {
      if (this.ws) this.ws.close();
    } catch (_) { }
    this.ws = null;
    this.ready = false;
  }

  // --- Internal helpers ---

  _sendSubscribe(topic) {
    if (!this.ws || this.ws.readyState !== 1) return;
    try {
      if (this.type === "binance") {
        this.ws.send(
          JSON.stringify({ method: "SUBSCRIBE", params: [topic], id: Date.now() })
        );
      } else if (this.type === "bybit") {
        this.ws.send(JSON.stringify({ op: "subscribe", args: [topic] }));
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
      }
    } catch (_) { }
  }

  _onMessage(raw) {
    let data;
    try {
      data = JSON.parse(raw);
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
