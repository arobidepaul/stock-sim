import test from "node:test";
import assert from "node:assert/strict";
import {
  createGame, advanceTurn, buyStock, sellStock, isGameOver, portfolioValue,
  STARTING_CASH, MAX_TURNS,
} from "./gameState.js";
import { createRng } from "./rng.js";

test("R1: the player starts with a set amount of fake money", () => {
  const state = createGame();
  assert.equal(state.cash, STARTING_CASH);
});

test("R2: the game has at least 3 fake companies with stock prices", () => {
  const state = createGame();
  assert.ok(state.companies.length >= 3);
  for (const company of state.companies) {
    assert.ok(typeof company.price === "number" && company.price > 0);
  }
});

test("R3: prices change each turn based on random events", () => {
  const rng = createRng(42);
  let state = createGame();
  const before = state.companies.map((c) => c.price);
  state = advanceTurn(state, rng);
  const after = state.companies.map((c) => c.price);
  assert.notDeepEqual(before, after);
  assert.equal(state.turn, 1);
});

test("R3: the same seed produces the same price changes (deterministic)", () => {
  const stateA = advanceTurn(createGame(), createRng(7));
  const stateB = advanceTurn(createGame(), createRng(7));
  assert.deepEqual(stateA.companies, stateB.companies);
});

test("R3: price history records every turn's price", () => {
  const rng = createRng(1);
  let state = createGame();
  state = advanceTurn(state, rng);
  state = advanceTurn(state, rng);
  assert.equal(state.companies[0].history.length, 3); // initial + 2 turns
});

test("R4: the player can buy stock if there is enough cash", () => {
  let state = createGame();
  const company = state.companies[0];
  state = buyStock(state, company.name, 10);
  assert.equal(state.holdings[company.name], 10);
  assert.equal(state.cash, STARTING_CASH - company.price * 10);
});

test("R4: buying more shares than cash allows is rejected", () => {
  let state = createGame();
  const company = state.companies[0];
  const tooMany = Math.ceil(state.cash / company.price) + 1;
  const result = buyStock(state, company.name, tooMany);
  assert.equal(result.cash, state.cash);
  assert.deepEqual(result.holdings, {});
});

test("R4: the player can sell stock they hold", () => {
  let state = createGame();
  const company = state.companies[0];
  state = buyStock(state, company.name, 10);
  const cashAfterBuy = state.cash;
  state = sellStock(state, company.name, 4);
  assert.equal(state.holdings[company.name], 6);
  assert.equal(state.cash, cashAfterBuy + company.price * 4);
});

test("R4: selling more shares than held is rejected", () => {
  let state = createGame();
  const company = state.companies[0];
  state = buyStock(state, company.name, 5);
  const result = sellStock(state, company.name, 6);
  assert.equal(result.holdings[company.name], 5);
});

test("R5: the game ends after a set number of turns", () => {
  let state = createGame();
  const rng = createRng(3);
  assert.ok(!isGameOver(state));
  for (let i = 0; i < MAX_TURNS; i++) state = advanceTurn(state, rng);
  assert.ok(isGameOver(state));
});

test("R5: advancing the turn after game over does nothing", () => {
  let state = createGame();
  const rng = createRng(3);
  for (let i = 0; i < MAX_TURNS; i++) state = advanceTurn(state, rng);
  const final = advanceTurn(state, rng);
  assert.equal(final.turn, MAX_TURNS);
  assert.deepEqual(final.companies, state.companies);
});

test("R6: portfolio value is cash plus the value of held shares", () => {
  let state = createGame();
  const company = state.companies[0];
  state = buyStock(state, company.name, 10);
  const expected = state.cash + company.price * 10;
  assert.equal(portfolioValue(state), expected);
});

test("R6: portfolio value with no holdings equals cash", () => {
  const state = createGame();
  assert.equal(portfolioValue(state), state.cash);
});
