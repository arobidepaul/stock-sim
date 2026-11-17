# CLAUDE.md

Standing rules for every session working on this project.

- No API keys, logins, or paid services. Stock prices are simulated with a seeded random walk, not fetched from a live market data provider.
- Runs with one command: `node server.js`. No build step, no external npm dependencies.
- Core game logic (price simulation, buy/sell, turn advancement, scoring) lives in `gameState.js` as pure functions so it can be unit tested with `node --test`.
- Only logic gets tests: price changes, portfolio math, buy/sell validation, turn/game-over handling. Rendering (the price-history graph) is not tested.
- The RNG used for price simulation must be injectable/seedable so tests are deterministic.
- Tests run with `node --test`.
- Never undo or amend a commit.
