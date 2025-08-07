import ELEMENTS from './elements.js';

function parseCompound(formula) {
  const stack = [{}];
  const regex = /([A-Z][a-z]?|\(|\)|\d+)/g;
  const tokens = formula.match(regex);
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === '(') {
      stack.push({});
    } else if (token === ')') {
      const group = stack.pop();
      let multiplier = 1;
      const next = tokens[i + 1];
      if (next && /^\d+$/.test(next)) {
        multiplier = parseInt(next, 10);
        i++;
      }
      const top = stack[stack.length - 1];
      for (const el of Object.keys(group)) {
        top[el] = (top[el] || 0) + group[el] * multiplier;
      }
    } else if (/^\d+$/.test(token)) {
      continue; // handled after element symbols or )
    } else {
      const el = token;
      let count = 1;
      const next = tokens[i + 1];
      if (next && /^\d+$/.test(next)) {
        count = parseInt(next, 10);
        i++;
      }
      const top = stack[stack.length - 1];
      top[el] = (top[el] || 0) + count;
    }
  }
  return stack[0];
}

function parseSide(str) {
  return str.split('+').map(s => {
    s = s.trim();
    let state = null;
    const m = s.match(/\((s|l|g|aq)\)$/);
    if (m) {
      state = m[1];
      s = s.replace(/\((s|l|g|aq)\)$/, '');
    }
    return { formula: s, elems: parseCompound(s), state };
  });
}

export function parseEquation(str) {
  const parts = str.split(/->|=>|→/);
  if (parts.length !== 2) throw new Error('Ecuación inválida');
  const reactants = parseSide(parts[0]);
  const products = parseSide(parts[1]);
  return { reactants, products };
}

function buildMatrix(reactants, products) {
  const compounds = reactants.concat(products);
  const elements = Array.from(new Set(compounds.flatMap(c => Object.keys(c.elems))));
  const matrix = elements.map(el => {
    const row = [];
    reactants.forEach(c => row.push(-(c.elems[el] || 0)));
    products.forEach(c => row.push(c.elems[el] || 0));
    return row;
  });
  return { matrix, elements };
}

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { const t = b; b = a % b; a = t; }
  return a;
}
function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }
function denom(x) {
  const s = x.toString();
  if (!s.includes('.')) return 1;
  return 10 ** (s.split('.')[1].length);
}
function lcmDenom(arr) {
  return arr.reduce((acc, val) => lcm(acc, denom(val)), 1);
}
function gcdArray(arr) {
  return arr.reduce((a, b) => gcd(a, b));
}

function solve(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const A = matrix.map(row => row.slice(0, cols - 1));
  const b = matrix.map(row => -row[cols - 1]);
  const m = A.length;
  const n = A[0].length;
  for (let col = 0; col < n; col++) {
    // pivot
    let pivot = col;
    while (pivot < m && Math.abs(A[pivot][col]) < 1e-10) pivot++;
    if (pivot === m) continue;
    [A[col], A[pivot]] = [A[pivot], A[col]];
    [b[col], b[pivot]] = [b[pivot], b[col]];
    const div = A[col][col];
    for (let j = col; j < n; j++) A[col][j] /= div;
    b[col] /= div;
    for (let i = 0; i < m; i++) {
      if (i === col) continue;
      const factor = A[i][col];
      for (let j = col; j < n; j++) A[i][j] -= factor * A[col][j];
      b[i] -= factor * b[col];
    }
  }
  const x = [];
  for (let i = 0; i < n; i++) x[i] = b[i] || 0;
  const coeffs = x.concat([1]);
  const mult = lcmDenom(coeffs);
  const ints = coeffs.map(v => Math.round(v * mult));
  const g = gcdArray(ints);
  return ints.map(v => v / g);
}

export function balanceEquation(str) {
  const { reactants, products } = parseEquation(str);
  const { matrix, elements } = buildMatrix(reactants, products);
  const coeffs = solve(matrix);
  return { reactants, products, coeffs, elements };
}

function isElement(compound) {
  return Object.keys(compound.elems).length === 1;
}
function isHydrocarbon(compound) {
  return Object.keys(compound.elems).every(k => k === 'C' || k === 'H');
}

export function identifyReaction(reactants, products) {
  if (reactants.length > 1 && products.length === 1) return 'Síntesis';
  if (reactants.length === 1 && products.length > 1) return 'Descomposición';
  if (reactants.some(r => r.formula === 'O2') &&
      reactants.some(r => isHydrocarbon(r)) &&
      products.some(p => p.formula === 'CO2') &&
      products.some(p => p.formula === 'H2O')) return 'Combustión';
  if (reactants.length === 2 && products.length === 2) {
    const [r1, r2] = reactants;
    const [p1, p2] = products;
    const rElems = [isElement(r1), isElement(r2)];
    const pElems = [isElement(p1), isElement(p2)];
    if ((rElems[0] && !rElems[1] && !pElems[0] && pElems[1]) ||
        (rElems[1] && !rElems[0] && pElems[0] && !pElems[1])) return 'Desplazamiento simple';
    if (!rElems[0] && !rElems[1] && !pElems[0] && !pElems[1]) return 'Doble desplazamiento';
  }
  return 'Desconocida';
}

export function totalAtoms(compounds, coeffs) {
  const totals = {};
  compounds.forEach((c, i) => {
    const mult = coeffs[i];
    for (const el of Object.keys(c.elems)) {
      totals[el] = (totals[el] || 0) + c.elems[el] * mult;
    }
  });
  return totals;
}

export function totalMass(counts) {
  let mass = 0;
  for (const el of Object.keys(counts)) {
    const data = ELEMENTS[el];
    if (data) mass += data.atomic_mass * counts[el];
  }
  return mass;
}

export default {
  parseEquation,
  balanceEquation,
  identifyReaction,
  totalAtoms,
  totalMass
};
