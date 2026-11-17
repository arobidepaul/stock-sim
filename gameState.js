// Pure game logic. No DOM, no browser globals.

export const STARTING_CASH = 10000;
export const MAX_TURNS = 20;

const STARTING_COMPANIES = [
  { name: "Acme Corp", price: 50 },
  { name: "Globex", price: 100 },
  { name: "Initech", price: 25 },
];

export function createGame() {
  return {
    cash: STARTING_CASH,
    turn: 0,
    maxTurns: MAX_TURNS,
    companies: STARTING_COMPANIES.map((c) => ({ ...c, history: [c.price] })),
    holdings: {},
  };
}

export function isGameOver(state) {
  return state.turn >= state.maxTurns;
}

// R3: each company's price moves by a random -10% to +10% change per turn.
export function advanceTurn(state, rng) {
  if (isGameOver(state)) return state;
  const companies = state.companies.map((company) => {
    const changePercent = (rng() - 0.5) * 0.2; // -0.10 to +0.10
    const newPrice = Math.max(0.01, company.price * (1 + changePercent));
    return { ...company, price: newPrice, history: [...company.history, newPrice] };
  });
  return { ...state, companies, turn: state.turn + 1 };
}

function findCompany(state, name) {
  return state.companies.find((c) => c.name === name);
}

// R4: buy shares if there's enough cash.
export function buyStock(state, companyName, shares) {
  const company = findCompany(state, companyName);
  const cost = company.price * shares;
  if (shares <= 0 || cost > state.cash) return state;

  const holdings = { ...state.holdings };
  holdings[companyName] = (holdings[companyName] || 0) + shares;
  return { ...state, cash: state.cash - cost, holdings };
}

// R4: sell shares if enough are held.
export function sellStock(state, companyName, shares) {
  const held = state.holdings[companyName] || 0;
  if (shares <= 0 || shares > held) return state;

  const company = findCompany(state, companyName);
  const proceeds = company.price * shares;
  const holdings = { ...state.holdings };
  holdings[companyName] = held - shares;
  return { ...state, cash: state.cash + proceeds, holdings };
}

// R6: final score is cash plus the current value of all holdings.
export function portfolioValue(state) {
  const holdingsValue = Object.entries(state.holdings).reduce((sum, [name, shares]) => {
    const company = findCompany(state, name);
    return sum + company.price * shares;
  }, 0);
  return state.cash + holdingsValue;
}
