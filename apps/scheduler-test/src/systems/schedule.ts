import { Schedule } from 'directed';

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

// Create a new schedule
export const schedule = new Schedule();

// Add systems to the schedule
schedule.add(systemA, { id: 'A' });
schedule.add(systemB, { id: 'B', after: 'A' });
schedule.add(systemC, { id: 'C', after: 'B' });

// Build the schedule
schedule.build();
