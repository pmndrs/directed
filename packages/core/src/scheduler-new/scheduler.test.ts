import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Scheduler } from './scheduler';
import { createSchedule } from './schedule';

describe('Scheduler', () => {
    let scheduler: Scheduler;
    let order: string[] = [];

    const aFn = vi.fn(() => {
        order.push('A');
    });

    const bFn = vi.fn(() => {
        order.push('B');
    });

    const cFn = vi.fn(() => {
        order.push('C');
    });

    const dFn = vi.fn(() => {
        order.push('D');
    });

    const eFn = vi.fn(() => {
        order.push('E');
    });

    const fFn = vi.fn(() => {
        order.push('F');
    });

    beforeEach(() => {
        scheduler = new Scheduler();
        order = [];

        aFn.mockClear();
        bFn.mockClear();
        cFn.mockClear();
        dFn.mockClear();
        eFn.mockClear();
        fFn.mockClear();
    });

    test('reates its own schedule or uses one provided', () => {
        expect(scheduler.schedule).toBeDefined();

        const schedule = createSchedule();
        scheduler = new Scheduler(schedule);

        expect(scheduler.schedule).toBe(schedule);
    });

    test('schedule with a single runnable', () => {
        scheduler.add(aFn).build();
        scheduler.run();

        expect(aFn).toBeCalledTimes(1);
        expect(order).toEqual(['A']);
    });

    test('schedule a runnable with before', () => {
        scheduler.add(aFn);

        // Add with a runnable reference
        scheduler.add(bFn, { before: aFn, id: 'B' });
        scheduler.build();
        scheduler.run();

        expect(order).toEqual(['B', 'A']);

        order = [];
        const cId = Symbol('C');

        // Add with a string ID
        scheduler.add(cFn, { before: 'B', id: cId });
        scheduler.build();
        scheduler.run();

        expect(order).toEqual(['C', 'B', 'A']);

        order = [];

        // Add with a symbol ID
        scheduler.add(dFn, { before: cId });
        scheduler.build();
        scheduler.run();

        expect(order).toEqual(['D', 'C', 'B', 'A']);
    });

    test('schedule a runnable with after', () => {
        scheduler.add(aFn);

        // Add with a runnable reference
        scheduler.add(bFn, { after: aFn, id: 'B' });
        scheduler.build();
        scheduler.run();

        expect(order).toEqual(['A', 'B']);

        order = [];
        const cId = Symbol('C');

        // Add with a string ID
        scheduler.add(cFn, { after: 'B', id: cId });
        scheduler.build();
        scheduler.run();

        expect(order).toEqual(['A', 'B', 'C']);

        order = [];

        // Add with a symbol ID
        scheduler.add(dFn, { after: cId });
        scheduler.build();
        scheduler.run();

        expect(order).toEqual(['A', 'B', 'C', 'D']);
    });

    test('schedule multiple runnables to run in addition order', () => {
        scheduler.add(dFn);
        scheduler.add(aFn);
        scheduler.add(bFn);
        scheduler.add(cFn);
        scheduler.build();

        scheduler.run();

        expect(aFn).toBeCalledTimes(1);
        expect(bFn).toBeCalledTimes(1);
        expect(cFn).toBeCalledTimes(1);
        expect(dFn).toBeCalledTimes(1);

        expect(order).toEqual(['D', 'A', 'B', 'C']);
    });

    test('remove runnables from the schedule', () => {
        scheduler.add(aFn);
        scheduler.add(bFn);
        scheduler.add(cFn);
        scheduler.build();

        scheduler.run();

        expect(order).toEqual(['A', 'B', 'C']);

        scheduler.remove(bFn);
        scheduler.build();

        order = [];
        scheduler.run();

        expect(order).toEqual(['A', 'C']);
    });

    test('can check if a runnable is in the schedule', () => {
        scheduler.add(aFn);
        scheduler.add(bFn);
        scheduler.add(cFn);
        scheduler.build();

        expect(scheduler.has(aFn)).toBe(true);
        expect(scheduler.has(dFn)).toBe(false);
    });
});
