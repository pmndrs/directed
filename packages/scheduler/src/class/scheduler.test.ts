import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Scheduler } from './scheduler';

describe('Scheduler Class', () => {
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
        order = [];

        aFn.mockClear();
        bFn.mockClear();
        cFn.mockClear();
        dFn.mockClear();
        eFn.mockClear();
        fFn.mockClear();
    });

    test('scheduler with a single runnable', () => {
        const schedule = new Scheduler();

        schedule.add(aFn, { id: 'A' });

        schedule.run({});

        expect(aFn).toBeCalledTimes(1);

        expect(order).toEqual(['A']);
    });

    test('schedule a runnable with before', () => {
        const schedule = new Scheduler();

        schedule.add(aFn, { id: 'A' });
        schedule.add(bFn, { id: 'B', before: 'A' });

        schedule.run({});

        expect(aFn).toBeCalledTimes(1);
        expect(bFn).toBeCalledTimes(1);

        expect(order).toEqual(['B', 'A']);
    });

    test('schedule a runnable with after', () => {
        const schedule = new Scheduler();

        schedule.add(aFn, { id: 'A' });
        schedule.add(bFn, { id: 'B', after: 'A' });

        schedule.run({});

        expect(aFn).toBeCalledTimes(1);
        expect(bFn).toBeCalledTimes(1);

        expect(order).toEqual(['A', 'B']);
    });

    test('schedule a runnable after multiple runnables', () => {
        const schedule = new Scheduler();

        schedule.add(aFn, { id: 'A' });
        schedule.add(bFn, { id: 'B' });
        schedule.add(cFn, { id: 'C', after: ['A', 'B'] });
        schedule.add(dFn, { id: 'D', after: 'C' });

        schedule.run({});

        expect(aFn).toBeCalledTimes(1);
        expect(bFn).toBeCalledTimes(1);
        expect(cFn).toBeCalledTimes(1);
        expect(dFn).toBeCalledTimes(1);

        expect(order).toEqual(['A', 'B', 'C', 'D']);
    });

    test('schedule a runnable with tag', () => {
        const group1 = Symbol();
        const schedule = new Scheduler();

        schedule.createTag(group1);

        schedule.add(aFn, { id: 'A', tag: group1 });
        schedule.add(bFn, { id: 'B', after: 'A', tag: group1 });

        schedule.run({});

        expect(aFn).toBeCalledTimes(1);
        expect(bFn).toBeCalledTimes(1);

        expect(order).toEqual(['A', 'B']);
    });

    test('schedule a runnable before and after a tag', () => {
        const group1 = Symbol();
        const schedule = new Scheduler();

        schedule.createTag(group1);

        schedule.add(aFn, { id: 'A', tag: group1 });
        schedule.add(bFn, { id: 'B', after: 'A', tag: group1 });
        schedule.add(cFn, { id: 'C', before: group1 });
        schedule.add(dFn, { id: 'D', after: group1 });

        schedule.run({});

        expect(aFn).toBeCalledTimes(1);
        expect(bFn).toBeCalledTimes(1);
        expect(cFn).toBeCalledTimes(1);
        expect(dFn).toBeCalledTimes(1);

        expect(order).toEqual(['C', 'A', 'B', 'D']);
    });

    test('schedule a runnable into an existing tag', () => {
        const group1 = Symbol();
        const schedule = new Scheduler();

        schedule.createTag(group1);

        schedule.add(aFn, { id: 'A', tag: group1 });
        schedule.add(bFn, { id: 'B', after: 'A', tag: group1 });

        schedule.add(cFn, { id: 'C', before: group1 });
        schedule.add(dFn, { id: 'D', after: group1 });

        schedule.add(eFn, { id: 'E', tag: group1 });

        schedule.run({});

        expect(aFn).toBeCalledTimes(1);
        expect(bFn).toBeCalledTimes(1);
        expect(cFn).toBeCalledTimes(1);
        expect(dFn).toBeCalledTimes(1);
        expect(eFn).toBeCalledTimes(1);

        expect(order).toEqual(['C', 'A', 'E', 'B', 'D']);
    });

    test('schedule a tag before or after another tag', () => {
        const group1 = Symbol();
        const group2 = Symbol();
        const group3 = Symbol();

        const schedule = new Scheduler();

        schedule.createTag(group1);
        schedule.createTag(group2, { before: group1 });
        schedule.createTag(group3, { after: group1 });

        schedule.add(aFn, { tag: group1, id: 'A' });
        schedule.add(bFn, { tag: group2, id: 'B' });
        schedule.add(cFn, { tag: group3, id: 'C' });

        schedule.run({});

        expect(aFn).toBeCalledTimes(1);
        expect(bFn).toBeCalledTimes(1);
        expect(cFn).toBeCalledTimes(1);

        expect(order).toEqual(['B', 'A', 'C']);
    });
});
