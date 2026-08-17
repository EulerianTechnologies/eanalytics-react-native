# Offline-queue tests

These scenarios exercise the SDK's offline queue — the path that stores events on disk when
the network is unavailable and replays them later.

They run the **real** sources from `../src`, compiled with `tsc`, on plain Node. The React
Native native modules are replaced by the stubs in `stubs/`; `react-native-fs` is backed by
the real filesystem, so `appendFile` / `writeFile` semantics are the actual ones rather than
a simulation. Connectivity and `fetch` are driven by each scenario.

This needs no Xcode, no Android SDK and no simulator.

## Running

Node >= 16 is required (`npm test` also runs the type check as part of the build).

```bash
cd test && npm install && npm test
```

To type-check `../src` without running the scenarios:

```bash
cd test && npm run typecheck
```

## What is covered

| # | Scenario |
|---|---|
| 1 | Offline, three generic events are all queued |
| 2 | Back online, a further event flushes the whole queue in one POST, in order |
| 3 | Collector rejects the request, the event is queued for retry |
| 4 | The next retry drains the queue |
| 5 | A corrupted line does not block the queue forever |
| 6 | Mixed generic + tpview queue, deletion stays aligned with the file head |
| 7 | A restored tpview keeps campaign, placement and products |
| 8 | Same round-trip for tpclick |

## Layout

- `scenarios.js` — the scenarios and their assertions
- `stubs.js` — redirects the native module names to `stubs/`
- `stubs/` — minimal stand-ins for the native modules
- `tsconfig.json` — compiles `../src` into `build/`

## Adding a scenario

Use `reset()` to clear the queue and the recorded requests, `online(false|true)` to drive
connectivity, `failNext = true` to make the collector reject the next request, `readLines()`
to inspect the queue file and `sent` to inspect the attempted requests. Assert with
`check(label, actual, expected)`.
