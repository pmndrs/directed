import { beforeEach, describe, expect, test, vi } from 'vitest';
import { add, after, before, id, create, run, tag } from '../scheduler';

describe('Scheduler', () => {
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
        const schedule = create();

        add(schedule, aFn, id('A'));

        run(schedule, {});

        expect(aFn).toBeCalledTimes(1);

        expect(order).toEqual(['A']);
    });

    test('schedule a runnable with before', () => {
        const schedule = create();

        add(schedule, aFn, id('A'));
        add(schedule, bFn, before('A'), id('B'));

        run(schedule, {});

        expect(aFn).toBeCalledTimes(1);
        expect(bFn).toBeCalledTimes(1);

        expect(order).toEqual(['B', 'A']);
    });

    test('schedule a runnable with after', () => {
        const schedule = create();

        add(schedule, aFn, id('A'));
        add(schedule, bFn, after('A'), id('B'));

        run(schedule, {});

        expect(aFn).toBeCalledTimes(1);
        expect(bFn).toBeCalledTimes(1);

        expect(order).toEqual(['A', 'B']);
    });

    test('schedule a runnable after multiple runnables', () => {
        const schedule = create();

        add(schedule, aFn, id('A'));
        add(schedule, bFn, id('B'));
        add(schedule, cFn, after('A', 'B'), id('C'));
        add(schedule, dFn, after('C'), id('D'));

        run(schedule, {});

        expect(aFn).toBeCalledTimes(1);
        expect(bFn).toBeCalledTimes(1);
        expect(cFn).toBeCalledTimes(1);
        expect(dFn).toBeCalledTimes(1);

        expect(order).toEqual(['A', 'B', 'C', 'D']);
    });

    test('schedule a runnable with tag', () => {
        const group1 = Symbol();
        const schedule = create();

        add(schedule, aFn, tag(group1), id('A'));
        add(schedule, bFn, after('A'), tag(group1), id('B'));

        run(schedule, {});

        expect(aFn).toBeCalledTimes(1);
        expect(bFn).toBeCalledTimes(1);

        expect(order).toEqual(['A', 'B']);
    });

    test('schedule a runnable before and after a tag', () => {
        const group1 = Symbol();
        const schedule = create();

        add(schedule, aFn, tag(group1), id('A'));
        add(schedule, bFn, after('A'), tag(group1), id('B'));
        add(schedule, cFn, before(group1), id('C'));
        add(schedule, dFn, after(group1), id('D'));

        run(schedule, {});

        expect(aFn).toBeCalledTimes(1);
        expect(bFn).toBeCalledTimes(1);
        expect(cFn).toBeCalledTimes(1);
        expect(dFn).toBeCalledTimes(1);

        expect(order).toEqual(['C', 'A', 'B', 'D']);
    });

    test('schedule a runnable into an existing tag', () => {
        const group1 = Symbol();
        const schedule = create();

        add(schedule, aFn, id('A'), tag(group1), id('A'));
        add(schedule, bFn, after('A'), tag(group1), id('B'));

        add(schedule, cFn, before(group1), id('C'));
        add(schedule, dFn, after(group1), id('D'));

        add(schedule, eFn, tag(group1), id('E'));

        run(schedule, {});

        expect(aFn).toBeCalledTimes(1);
        expect(bFn).toBeCalledTimes(1);
        expect(cFn).toBeCalledTimes(1);
        expect(dFn).toBeCalledTimes(1);
        expect(eFn).toBeCalledTimes(1);

        expect(order).toEqual(['C', 'A', 'E', 'B', 'D']);
    });

    test('schedule multiple runnables to run in addition order', () => {
        const schedule = create();

        add(schedule, dFn, id('D'));
        add(schedule, aFn, id('A'));
        add(schedule, bFn, id('B'));
        add(schedule, cFn, id('C'));

        run(schedule, {});

        expect(aFn).toBeCalledTimes(1);
        expect(bFn).toBeCalledTimes(1);
        expect(cFn).toBeCalledTimes(1);
        expect(dFn).toBeCalledTimes(1);

        expect(order).toEqual(['D', 'A', 'B', 'C']);
    });

    test('schedule a tag before or after another tag', () => {
        const group1 = Symbol();
        const group2 = Symbol();
        const group3 = Symbol();

        const schedule = create();

        add(schedule, aFn, tag(group1), id('A'));
        add(schedule, bFn, tag(group2), id('B'), before(group1));
        add(schedule, cFn, tag(group3), id('C'), after(group1));

        run(schedule, {});

        expect(aFn).toBeCalledTimes(1);
        expect(bFn).toBeCalledTimes(1);
        expect(cFn).toBeCalledTimes(1);

        expect(order).toEqual(['B', 'A', 'C']);
    });

    test.fails(
        'scheduling the same runnable multiple times does not run it multiple times',
        () => {
            const schedule = create();

            add(schedule, aFn, id('A'));
            add(schedule, aFn, id('A'));
            add(schedule, aFn, id('A'));

            run(schedule, {});

            expect(aFn).toBeCalledTimes(1);

            expect(order).toEqual(['A']);
        }
    );
});
