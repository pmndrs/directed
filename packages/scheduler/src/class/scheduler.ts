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
import { Runnable, Tag } from '../scheduler-types';
import { OptionsObject } from './types';
import { createOptionsFns } from './utils/create-options-fns';

export class Scheduler {
    dag: DirectedGraph<Runnable<any>>;
    tags: Map<symbol | string, Tag<any>>;
    symbols: Map<symbol | string, Runnable<any>>;

    constructor() {
        this.dag = new DirectedGraph<Runnable<any>>();
        this.tags = new Map<symbol | string, Tag<any>>();
        this.symbols = new Map<symbol | string, Runnable<any>>();
    }

    add(runnable: Runnable<any>, options?: OptionsObject): Scheduler {
        const optionsFns = createOptionsFns(options);
        add(this, runnable, ...optionsFns);

        return this;
    }

    run(context: Scheduler.Context): Scheduler {
        run(this, context);
        return this;
    }

    createTag(id: symbol | string, options?: OptionsObject): Scheduler {
        const optionsFns = createOptionsFns(options);
        createTag(this, id, ...optionsFns);
        return this;
    }

    removeTag(id: symbol | string): Scheduler {
        removeTag(this, id);
        return this;
    }

    build(): Scheduler {
        build(this);
        return this;
    }

    remove(runnable: Runnable): Scheduler {
        remove(this, runnable);
        return this;
    }

    debug(): Scheduler {
        debug(this);
        return this;
    }
}
