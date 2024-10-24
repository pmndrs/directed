import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './app.css';
import { useRaf } from './use-raf';
import { schedule } from './systems/schedule';
import { useSchedule } from 'directed/react';

const systemD = () => {
    console.log('D');
};

function App() {
    const [count, setCount] = useState(0);

    // Add system D to the schedule with a hook
    useSchedule(schedule, systemD, { after: 'C' });

    // Run the schedule on every RAF
    useRaf(() => {
        schedule.run({});
    });

    return (
        <>
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img
                        src={reactLogo}
                        className="logo react"
                        alt="React logo"
                    />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    );
}

export default App;
