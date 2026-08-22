import type { Runnable } from './types';

/**
 * An immutable execution plan produced by `Scheduler.build()`. Holds the
 * solved order of runnables and executes them against a context.
 */
export class Schedule<Context = unknown> {
  readonly #runnables: readonly Runnable<Context>[];

  constructor(runnables: readonly Runnable<Context>[] = []) {
    this.#runnables = Object.freeze([...runnables]);
    Object.freeze(this);
  }

  get runnables(): readonly Runnable<Context>[] {
    return this.#runnables;
  }

  /**
   * Executes the schedule against a context once. Returns synchronously
   * unless a runnable returns a promise, in which case the remaining
   * runnables are awaited in order.
   */
  run(context: Context): void | Promise<void> {
    const runnables = this.#runnables;

    for (let i = 0; i < runnables.length; i++) {
      const result = runnables[i](context);

      if (result instanceof Promise) {
        return this.#finishAsync(result, i + 1, context);
      }
    }
  }

  async #finishAsync(pending: Promise<void>, index: number, context: Context): Promise<void> {
    await pending;

    const runnables = this.#runnables;

    for (let i = index; i < runnables.length; i++) {
      await runnables[i](context);
    }
  }
}
