import type { Runnable } from './types';

export class Schedule<Context = unknown> {
  readonly #runnables: readonly Runnable<Context>[];

  constructor(runnables: readonly Runnable<Context>[] = []) {
    this.#runnables = Object.freeze([...runnables]);
    Object.freeze(this);
  }

  async run(context: Context): Promise<void> {
    for (const runnable of this.#runnables) {
      const result = runnable(context);

      if (result instanceof Promise) {
        await result;
      }
    }
  }
}
