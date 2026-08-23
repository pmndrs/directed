import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Schedule, Scheduler } from '../src';

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
    const scheduler = new Scheduler();

    scheduler.add(aFn, { id: 'A' });
    scheduler.build();

    scheduler.run({});

    expect(aFn).toBeCalledTimes(1);

    expect(order).toEqual(['A']);
  });

  test('schedule a runnable with before', () => {
    const scheduler = new Scheduler();

    scheduler.add(aFn, { id: 'A' });
    scheduler.add(bFn, { id: 'B', before: 'A' });
    scheduler.build();

    scheduler.run({});

    expect(aFn).toBeCalledTimes(1);
    expect(bFn).toBeCalledTimes(1);

    expect(order).toEqual(['B', 'A']);
  });

  test('schedule a runnable with after', () => {
    const scheduler = new Scheduler();

    scheduler.add(aFn, { id: 'A' });
    scheduler.add(bFn, { id: 'B', after: 'A' });
    scheduler.build();

    scheduler.run({});

    expect(aFn).toBeCalledTimes(1);
    expect(bFn).toBeCalledTimes(1);

    expect(order).toEqual(['A', 'B']);
  });

  test('schedule a runnable without an id', () => {
    const scheduler = new Scheduler();

    scheduler.add(aFn);
    scheduler.add(bFn, {
      before: aFn,
    });
    scheduler.build();

    scheduler.run({});

    expect(aFn).toBeCalledTimes(1);
    expect(bFn).toBeCalledTimes(1);

    expect(order).toEqual(['B', 'A']);
  });

  test('schedule a runnable after multiple runnables', () => {
    const scheduler = new Scheduler();

    scheduler.add(aFn, { id: 'A' });
    scheduler.add(bFn, { id: 'B' });
    scheduler.add(cFn, { id: 'C', after: ['A', 'B'] });
    scheduler.add(dFn, { id: 'D', after: 'C' });
    scheduler.build();

    scheduler.run({});

    expect(aFn).toBeCalledTimes(1);
    expect(bFn).toBeCalledTimes(1);
    expect(cFn).toBeCalledTimes(1);
    expect(dFn).toBeCalledTimes(1);

    expect(order).toEqual(['A', 'B', 'C', 'D']);
  });

  test('schedule a runnable with tag', () => {
    const group1 = Symbol();
    const scheduler = new Scheduler();

    scheduler.createTag(group1);

    scheduler.add(aFn, { id: 'A', tag: group1 });
    scheduler.add(bFn, { id: 'B', after: 'A', tag: group1 });
    scheduler.build();

    scheduler.run({});

    expect(aFn).toBeCalledTimes(1);
    expect(bFn).toBeCalledTimes(1);

    expect(order).toEqual(['A', 'B']);
  });

  test('schedule multiple runnables at once with a single tag', () => {
    const group1 = Symbol();
    const scheduler = new Scheduler();

    scheduler.createTag(group1);

    scheduler.add([aFn, bFn, cFn], {
      tag: group1,
    });
    scheduler.build();

    scheduler.run({});

    expect(aFn).toBeCalledTimes(1);
    expect(bFn).toBeCalledTimes(1);
    expect(cFn).toBeCalledTimes(1);

    expect(order).toEqual(['A', 'B', 'C']);
  });

  test('schedule multiple runnables in addition order', () => {
    const scheduler = new Scheduler();

    scheduler.add(dFn);
    scheduler.add(aFn);
    scheduler.add(bFn);
    scheduler.add(cFn);
    scheduler.build();

    scheduler.run({});

    expect(order).toEqual(['D', 'A', 'B', 'C']);
  });

  test('schedule a runnable before and after a tag', () => {
    const group1 = Symbol();
    const scheduler = new Scheduler();

    scheduler.createTag(group1);

    scheduler.add(aFn, { id: 'A', tag: group1 });
    scheduler.add(bFn, { id: 'B', after: 'A', tag: group1 });
    scheduler.add(cFn, { id: 'C', before: group1 });
    scheduler.add(dFn, { id: 'D', after: group1 });
    scheduler.build();

    scheduler.run({});

    expect(aFn).toBeCalledTimes(1);
    expect(bFn).toBeCalledTimes(1);
    expect(cFn).toBeCalledTimes(1);
    expect(dFn).toBeCalledTimes(1);

    expect(order).toEqual(['C', 'A', 'B', 'D']);
  });

  test('schedule a runnable into an existing tag', () => {
    const group1 = Symbol();
    const scheduler = new Scheduler();

    scheduler.createTag(group1);

    scheduler.add(aFn, { id: 'A', tag: group1 });
    scheduler.add(bFn, { id: 'B', after: 'A', tag: group1 });

    scheduler.add(cFn, { id: 'C', before: group1 });
    scheduler.add(dFn, { id: 'D', after: group1 });

    scheduler.add(eFn, { id: 'E', tag: group1 });
    scheduler.build();

    scheduler.run({});

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

    const scheduler = new Scheduler();

    scheduler.createTag(group1);
    scheduler.createTag(group2, { before: group1 });
    scheduler.createTag(group3, { after: group1 });

    scheduler.add(aFn, { tag: group1, id: 'A' });
    scheduler.add(bFn, { tag: group2, id: 'B' });
    scheduler.add(cFn, { tag: group3, id: 'C' });
    scheduler.build();

    scheduler.run({});

    expect(aFn).toBeCalledTimes(1);
    expect(bFn).toBeCalledTimes(1);
    expect(cFn).toBeCalledTimes(1);

    expect(order).toEqual(['B', 'A', 'C']);
  });

  test('scheduling async runnables', async () => {
    const scheduler = new Scheduler();

    const aFn = async () => {
      order.push('A');
    };

    const bFn = async () => {
      // Don't resolve until the next tick
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          order.push('B');
          resolve();
        }, 100);
      });
    };

    const cFn = () => {
      order.push('C');
    };

    scheduler.add(aFn, { id: 'A' });
    scheduler.add(bFn, { after: 'A', id: 'B' });
    scheduler.add(cFn, { after: 'B', id: 'C' });
    scheduler.build();

    await scheduler.run({});

    expect(order).toEqual(['A', 'B', 'C']);
  });

  test('remove runnables from the schedule', () => {
    const scheduler = new Scheduler();

    scheduler.add(aFn, { id: 'A' });
    scheduler.add(bFn, { id: 'B' });
    scheduler.add(cFn, { id: 'C' });
    scheduler.build();

    scheduler.run({});

    expect(order).toEqual(['A', 'B', 'C']);

    scheduler.remove(bFn);
    scheduler.build();

    order = [];
    scheduler.run({});

    expect(order).toEqual(['A', 'C']);
  });

  test('can check if a runnable is in the schedule', () => {
    const scheduler = new Scheduler();

    scheduler.add(aFn, { id: 'A' });
    scheduler.add(bFn, { id: 'B' });
    scheduler.add(cFn, { id: 'C' });
    scheduler.build();

    expect(scheduler.has(aFn)).toBe(true);
    expect(scheduler.has(dFn)).toBe(false);
  });

  test('does not allow the same runnable to be added more than once', () => {
    const scheduler = new Scheduler();

    scheduler.add(aFn);

    expect(() => scheduler.add(aFn)).toThrow('Runnable already exists in schedule');
  });

  test('does not allow duplicate runnables in a group', () => {
    const scheduler = new Scheduler();

    expect(() => scheduler.add([aFn, aFn])).toThrow('A runnable can only be added once');
    expect(scheduler.has(aFn)).toBe(false);
  });

  test('uses one unambiguous ID namespace', () => {
    const scheduler = new Scheduler();

    scheduler.createTag('update');

    expect(() => scheduler.add(aFn, { id: 'update' })).toThrow(
      'ID update already exists in the schedule'
    );
  });

  test('resolves forward dependencies when the schedule is built', () => {
    const scheduler = new Scheduler();

    scheduler.add(bFn, { id: 'B', before: 'A', after: 'C' });
    scheduler.add(aFn, { id: 'A' });
    scheduler.add(cFn, { id: 'C' });
    scheduler.build();
    scheduler.run({});

    expect(order).toEqual(['C', 'B', 'A']);
  });

  test('validates unresolved dependencies when the schedule is built', () => {
    const scheduler = new Scheduler();

    scheduler.add(aFn, { after: 'missing' });

    expect(() => scheduler.build()).toThrow('Dependency missing does not exist');
    expect(scheduler.has(aFn)).toBe(true);
  });

  test('reports dependency cycles when the schedule is built', () => {
    const scheduler = new Scheduler();

    scheduler.add(aFn, { id: 'A', after: 'B' });
    scheduler.add(bFn, { id: 'B', after: 'A' });

    expect(() => scheduler.build()).toThrow(/cycle/i);
  });

  test('keeps the canonical schedule unchanged until the scheduler is rebuilt', async () => {
    const scheduler = new Scheduler();

    scheduler.add(aFn, { id: 'A' });
    scheduler.build();

    const firstSchedule = scheduler.schedule;

    scheduler.add(bFn, { after: 'A' });

    expect(scheduler.schedule).toBe(firstSchedule);
    expect(Object.isFrozen(firstSchedule)).toBe(true);

    await firstSchedule.run({});

    expect(order).toEqual(['A']);

    order = [];
    scheduler.build();

    expect(scheduler.schedule).not.toBe(firstSchedule);

    await scheduler.run({});

    expect(order).toEqual(['A', 'B']);

    order = [];
    await firstSchedule.run({});

    expect(order).toEqual(['A']);
  });

  test('builds deferred changes before running', async () => {
    const scheduler = new Scheduler();

    scheduler.add(aFn, { id: 'A' });
    scheduler.build();

    const firstSchedule = scheduler.schedule;

    scheduler.add(bFn, { after: 'A' });

    await scheduler.run({});

    expect(scheduler.schedule).not.toBe(firstSchedule);
    expect(order).toEqual(['A', 'B']);
  });

  test('returns the canonical schedule when built', () => {
    const scheduler = new Scheduler();

    scheduler.add(aFn);

    expect(scheduler.build()).toBe(scheduler.schedule);
  });

  test('keeps the previous canonical schedule when a build fails', async () => {
    const scheduler = new Scheduler();

    scheduler.add(aFn);
    scheduler.build();

    const validSchedule = scheduler.schedule;

    scheduler.add(bFn, { after: 'missing' });

    expect(() => scheduler.build()).toThrow('Dependency missing does not exist');
    expect(scheduler.schedule).toBe(validSchedule);

    expect(() => scheduler.run({})).toThrow('Dependency missing does not exist');
    expect(scheduler.schedule).toBe(validSchedule);

    await validSchedule.run({});

    expect(order).toEqual(['A']);
  });

  test('resolves tags that are declared after their runnables', async () => {
    const scheduler = new Scheduler();

    scheduler.add(aFn, { tag: 'render' });
    scheduler.createTag('render');
    scheduler.build();

    await scheduler.run({});

    expect(order).toEqual(['A']);
  });

  test('unregisters a runnable ID when the runnable is removed', () => {
    const scheduler = new Scheduler();

    scheduler.add(aFn, { id: 'A' });
    scheduler.remove(aFn);
    scheduler.add(bFn, { id: 'A' });

    expect(scheduler.getRunnable('A')).toBe(bFn);
  });

  test('exposes the solved order on the built schedule', () => {
    const scheduler = new Scheduler();

    scheduler.add(aFn, { id: 'A' });
    scheduler.add(bFn, { id: 'B', before: 'A' });

    const schedule = scheduler.build();

    expect(schedule).toBeInstanceOf(Schedule);
    expect(schedule.runnables).toEqual([bFn, aFn]);
    expect(Object.isFrozen(schedule.runnables)).toBe(true);
  });

  test('runs synchronously when no runnable is async', () => {
    const scheduler = new Scheduler();

    scheduler.add(aFn);

    expect(scheduler.run({})).toBeUndefined();
    expect(order).toEqual(['A']);
  });

  test('creates tags implicitly from membership', () => {
    const scheduler = new Scheduler();

    scheduler.add(aFn, { tag: 'group1' });
    scheduler.add(bFn, { tag: 'group2', before: 'group1' });
    scheduler.add(cFn, { tag: 'group3', after: 'group1' });

    scheduler.run({});

    expect(order).toEqual(['B', 'A', 'C']);
    expect(scheduler.hasTag('group1')).toBe(true);
  });

  test('does not create tags from dependency references', () => {
    const scheduler = new Scheduler();

    scheduler.add(aFn, { before: 'group1' });

    expect(() => scheduler.build()).toThrow('Dependency group1 does not exist');
  });

  test('rejects an implied tag that collides with a runnable ID', () => {
    const scheduler = new Scheduler();

    scheduler.add(aFn, { id: 'x' });
    scheduler.add(bFn, { tag: 'x' });

    expect(() => scheduler.build()).toThrow('ID x already exists in the schedule');
  });

  test('orders a declared tag against an implied tag', () => {
    const scheduler = new Scheduler();

    scheduler.createTag('group2', { before: 'group1' });

    scheduler.add(aFn, { tag: 'group1' });
    scheduler.add(bFn, { tag: 'group2' });

    scheduler.run({});

    expect(order).toEqual(['B', 'A']);
  });
});
