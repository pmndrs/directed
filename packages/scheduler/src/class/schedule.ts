import { DirectedGraph } from '../directed-graph';
import {
    add,
    build,
    createTag,
    debug,
    remove,
    removeTag,
    run,
} from '../scheduler';
import type { Runnable, Tag } from '../scheduler-types';
import type { OptionsObject } from './types';
import { createOptionsFns } from './utils/create-options-fns';

export class Schedule<T extends Scheduler.Context = Scheduler.Context> {
    dag: DirectedGraph<Runnable<T>>;
    tags: Map<symbol | string, Tag<any>>;
    symbols: Map<symbol | string, Runnable<T>>;

    constructor() {
        this.dag = new DirectedGraph<Runnable<T>>();
        this.tags = new Map<symbol | string, Tag<T>>();
        this.symbols = new Map<symbol | string, Runnable<T>>();
    }

    add(runnable: Runnable<T>, options?: OptionsObject): Schedule<T> {
        const optionsFns = createOptionsFns<T>(options);
        add(this, runnable, ...optionsFns);

        return this;
    }

    run(context: T): Schedule<T> {
        run(this, context);
        return this;
    }

    build(): Schedule<T> {
        build(this);
        return this;
    }

    remove(runnable: Runnable): Schedule<T> {
        remove(this, runnable);
        return this;
    }

    debug(): Schedule<T> {
        debug(this);
        return this;
    }

    createTag(id: symbol | string, options?: OptionsObject): Schedule<T> {
        const optionsFns = createOptionsFns<T>(options);
        createTag(this, id, ...optionsFns);
        return this;
    }

    removeTag(id: symbol | string): Schedule<T> {
        removeTag(this, id);
        return this;
    }

    hasTag(id: symbol | string): boolean {
        return this.tags.has(id);
    }

    getRunnable(id: symbol | string): Runnable<T> | undefined {
        return this.symbols.get(id);
    }
}