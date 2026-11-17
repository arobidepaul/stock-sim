import { createGame, advanceTurn, buyStock, sellStock, isGameOver, portfolioValue } from "./gameState.js";
import { createRng } from "./rng.js";

const rng = createRng(Date.now());
let state = createGame();

const status = document.getElementById("status");
const companiesDiv = document.getElementById("companies");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

const COLORS = ["#4caf50", "#2196f3", "#ff9800", "#e91e63"];

function render() {
  status.textContent = isGameOver(state)
    ? `Game over! Final portfolio value: $${portfolioValue(state).toFixed(2)}`
    : `Turn ${state.turn} of ${state.maxTurns} | Cash: $${state.cash.toFixed(2)} | Portfolio: $${portfolioValue(state).toFixed(2)}`;

  companiesDiv.innerHTML = "";
  state.companies.forEach((company, i) => {
    const held = state.holdings[company.name] || 0;
    const row = document.createElement("div");
    row.className = "company";
    row.innerHTML = `
      <span style="color:${COLORS[i % COLORS.length]}">${company.name}: $${company.price.toFixed(2)} (holding ${held})</span>
      <span>
        <button data-action="buy" data-name="${company.name}">Buy 1</button>
        <button data-action="sell" data-name="${company.name}">Sell 1</button>
      </span>
    `;
    companiesDiv.appendChild(row);
  });

  drawChart();
}

function drawChart() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const allPrices = state.companies.flatMap((c) => c.history);
  const max = Math.max(...allPrices);
  const min = Math.min(...allPrices);
  const range = max - min || 1;

  state.companies.forEach((company, i) => {
    ctx.strokeStyle = COLORS[i % COLORS.length];
    ctx.beginPath();
    company.history.forEach((price, turn) => {
      const x = (turn / state.maxTurns) * canvas.width;
      const y = canvas.height - ((price - min) / range) * canvas.height;
      turn === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  });
}

companiesDiv.addEventListener("click", (event) => {
  const { action, name } = event.target.dataset;
  if (!action) return;
  state = action === "buy" ? buyStock(state, name, 1) : sellStock(state, name, 1);
  render();
});

const nextTurnButton = document.createElement("button");
nextTurnButton.textContent = "Next Turn";
nextTurnButton.addEventListener("click", () => {
  state = advanceTurn(state, rng);
  render();
});
document.body.insertBefore(nextTurnButton, canvas);

render();
