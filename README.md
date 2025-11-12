# universal-socket-react

UniversalSocket — **ticker-only** provider for **Binance** and **Bybit**.  
Provides an instance-based class usable in browser/React apps:

```js
import UniversalSocket from "universal-socket-react";

const ws = new UniversalSocket({ type: "binance" });
ws.subscribeTicker(["BTCUSDT","LTCUSDT"]);
ws.ticker((data) => console.log("ticker:", data));
```

---

## What's included
- `src/` — ESM source (browser-compatible, no build required)
- `example/` — small Vite + React example showing how to use the package
- `README.md` (this file)

---

## Install locally and test

### Option A — `npm pack` and install into the example
1. From the package root (where `package.json` is), run:
   ```bash
   npm pack
   ```
   This creates a `universal-socket-react-0.1.0.tgz`.

2. Move (or reference) that file into the `example` folder and install:
   ```bash
   cd example
   npm install ../universal-socket-react-0.1.0.tgz
   npm install
   npm run dev
   ```

### Option B — `npm link` (development)
1. From package root:
   ```bash
   npm link
   cd example
   npm link universal-socket-react
   npm install
   npm run dev
   ```

### Option C — Local file install (simpler)
From `example/`:
```bash
npm install ../
npm install
npm run dev
```

---

## Usage (browser / React)
```js
import UniversalSocket from "universal-socket-react";

const ws = new UniversalSocket({ type: "bybit" });
ws.subscribeTicker(["BTCUSDT","ETHUSDT"]);
ws.ticker((d) => {
  // d = { exchange, symbol, price, volume, time }
  console.log(d);
});
```

---

## Notes / Limitations
- This package only implements **ticker** subscriptions for **Binance** and **Bybit**.
- It uses browser-native `WebSocket` (no server-side `ws` dependency).
- The package is ESM; ensure your build tool supports ESM imports.

If you want, I can:
- Add TypeScript types
- Add publish-ready bundling (Rollup) and CI
- Extend to trades/orderbook/private sockets

