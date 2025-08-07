import { balanceEquation, identifyReaction, totalAtoms, totalMass, parseEquation } from './balancer.js';

const eqInput = document.getElementById('equation-input');
const balanceBtn = document.getElementById('balance-btn');
const simulateBtn = document.getElementById('simulate-btn');
const reactionTypeDiv = document.getElementById('reaction-type');
const equationDisplay = document.getElementById('equation-display');
const atomCountsDiv = document.getElementById('atom-counts');
const verificationDiv = document.getElementById('verification');
const stepsDiv = document.getElementById('steps');

let lastData = null;

function formatEquation(coeffs, reactants, products) {
  const all = reactants.concat(products);
  const parts = all.map((c, i) => `${coeffs[i] > 1 ? coeffs[i] : ''}${c.formula}`);
  return parts.slice(0, reactants.length).join(' + ') + ' → ' + parts.slice(reactants.length).join(' + ');
}

function displayCounts(reactants, products, before, after) {
  const elements = new Set();
  reactants.concat(products).forEach(c => Object.keys(c.elems).forEach(e => elements.add(e)));
  let html = '<table><tr><th>Elemento</th><th>Reactivos antes</th><th>Productos antes</th><th>Reactivos balanceados</th><th>Productos balanceados</th></tr>';
  elements.forEach(el => {
    const rBefore = reactants.reduce((s, c, i) => s + (c.elems[el] || 0) * before[i], 0);
    const pBefore = products.reduce((s, c, i) => s + (c.elems[el] || 0) * before[i + reactants.length], 0);
    const rAfter = reactants.reduce((s, c, i) => s + (c.elems[el] || 0) * after[i], 0);
    const pAfter = products.reduce((s, c, i) => s + (c.elems[el] || 0) * after[i + reactants.length], 0);
    html += `<tr><td>${el}</td><td>${rBefore}</td><td>${pBefore}</td><td>${rAfter}</td><td>${pAfter}</td></tr>`;
  });
  html += '</table>';
  atomCountsDiv.innerHTML = html;
}

function verify(reactants, products, coeffs) {
  const rTotals = totalAtoms(reactants, coeffs.slice(0, reactants.length));
  const pTotals = totalAtoms(products, coeffs.slice(reactants.length));
  const massR = totalMass(rTotals);
  const massP = totalMass(pTotals);
  const atomsOK = Object.keys(rTotals).every(el => rTotals[el] === pTotals[el]);
  verificationDiv.textContent = `Masa reactivos: ${massR.toFixed(3)} u | Masa productos: ${massP.toFixed(3)} u. Conservación de átomos: ${atomsOK ? 'cumplida' : 'no cumplida'}`;
}

function updateDisplay(coeffs, data) {
  const { reactants, products } = data;
  equationDisplay.textContent = formatEquation(coeffs, reactants, products);
  displayCounts(reactants, products, Array(reactants.length + products.length).fill(1), coeffs);
  verify(reactants, products, coeffs);
}

balanceBtn.addEventListener('click', () => {
  const input = eqInput.value.trim();
  if (!input) return;
  try {
    const data = balanceEquation(input);
    const before = Array(data.reactants.length + data.products.length).fill(1);
    displayCounts(data.reactants, data.products, before, data.coeffs);
    reactionTypeDiv.textContent = `Tipo de reacción: ${identifyReaction(data.reactants, data.products)}`;
    equationDisplay.textContent = formatEquation(data.coeffs, data.reactants, data.products);
    verify(data.reactants, data.products, data.coeffs);
    lastData = data;
    stepsDiv.textContent = '';
  } catch (e) {
    equationDisplay.textContent = e.message;
  }
});

simulateBtn.addEventListener('click', () => {
  if (!lastData) return;
  stepsDiv.textContent = '';
  const { coeffs, reactants, products } = lastData;
  const current = Array(coeffs.length).fill(1);
  let i = 0;
  function step() {
    if (i >= coeffs.length) return;
    current[i] = coeffs[i];
    equationDisplay.textContent = formatEquation(current, reactants, products);
    verify(reactants, products, current);
    const p = document.createElement('p');
    p.textContent = formatEquation(current, reactants, products);
    stepsDiv.appendChild(p);
    i++;
    setTimeout(step, 800);
  }
  step();
});
