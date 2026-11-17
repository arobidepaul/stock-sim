# Spec

## Round 1 (covers R1-R7)

### Game state
`createGame(rng)` returns:
```
{
  cash: number,
  turn: number,
  maxTurns: number,
  companies: [{ name, price, history: [price, ...] }],
  holdings: { [companyName]: shares },
}
```

### R1 - Starting cash
`createGame` sets `cash` to a fixed starting amount ($10,000).

### R2 - At least 3 companies
`createGame` seeds 3 fake companies (Acme Corp, Globex, Initech) each with a starting price and a one-entry history.

### R3 - Prices change each turn, based on random events
`advanceTurn(state, rng)` applies a random percentage change (-10% to +10%) to each company's price, using an injected RNG function `() => number in [0,1)`. Prices never go below $0.01. The new price is appended to that company's `history`. `turn` increments by 1.

A seedable PRNG (`createRng(seed)`, a mulberry32 generator) lets tests be deterministic instead of flaky.

### R4 - Buy and sell each turn
`buyStock(state, company, shares)`: fails (returns state unchanged, or throws - see tests) if `shares * price > cash`. Otherwise deducts cash, adds to holdings.
`sellStock(state, company, shares)`: fails if holdings for that company are fewer than `shares`. Otherwise adds cash, removes from holdings.

### R5 - Game ends after a set number of turns
`maxTurns` is fixed at 20. `isGameOver(state)` is true once `turn >= maxTurns`. `advanceTurn` is a no-op once the game is over.

### R6 - Final portfolio value is the score
`portfolioValue(state)` = `cash + sum(shares * current price)` across all holdings.

### R7 - Graph of price history
`app.js` draws each company's `history` array as a line on a canvas. Rendering only, not tested.

### Out of scope for Round 1
Multiple players, saving/loading a game in progress, difficulty levels.
