import { Scheduler } from 'directed';

// Define some mock systems
const systemA = () => {
  console.log('A');
};

const systemB = () => {
  console.log('B');
};

const systemC = () => {
  console.log('C');
};

// Create a new scheduler
export const scheduler = new Scheduler();

// Declare systems into the scheduler
scheduler.add(systemA, { id: 'A' });
scheduler.add(systemB, { id: 'B', after: 'A' });
scheduler.add(systemC, { id: 'C', after: 'B' });
