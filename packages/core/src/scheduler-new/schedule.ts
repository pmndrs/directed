import { DirectedGraph } from '../directed-graph/directed-graph';
import { Runnable } from '../scheduler/types';
import { Tag } from './types';

export interface Schedule<T extends Scheduler.Context = Scheduler.Context> {
    dag: DirectedGraph<Runnable<T>>;
    tags: Map<symbol | string, Tag<T>>;
    runnables: Map<symbol | string, Runnable<T>>;
    sorted: Runnable<T>[];
}

export function createSchedule<T extends Scheduler.Context = Scheduler.Context>(): Schedule<T> {
    return {
        dag: new DirectedGraph(),
        tags: new Map(),
        runnables: new Map(),
        get sorted() {
            return this.dag.sorted;
        },
    };
}
