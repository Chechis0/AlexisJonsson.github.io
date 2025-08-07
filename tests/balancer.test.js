import { balanceEquation, identifyReaction } from '../balancer.js';

function assert(cond, msg) {
  if (!cond) {
    console.error('Test failed:', msg);
    process.exit(1);
  }
}

const eq1 = balanceEquation('H2 + O2 -> H2O');
assert(eq1.coeffs.join(',') === '2,1,2', 'Balanceo de agua');

const eq2 = balanceEquation('N2 + H2 -> NH3');
assert(eq2.coeffs.join(',') === '1,3,2', 'Balanceo de amoníaco');

assert(identifyReaction(eq1.reactants, eq1.products) === 'Síntesis', 'Identificación de síntesis');

console.log('All tests passed');
