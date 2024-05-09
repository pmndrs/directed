import { DirectedGraph } from './directed-graph-types';

declare global {
    namespace Scheduler {
        export interface Context {}
    }
}

export type Runnable<T extends Scheduler.Context = Scheduler.Context> = (
    context: T
) => void;

export interface Schedule<T extends Scheduler.Context = Scheduler.Context> {
    dag: DirectedGraph<Runnable<T>>;
    tags: Map<symbol | string, Tag<T>>;
    symbols: Map<symbol | string, Runnable<T>>;
}

export type Options<T extends Scheduler.Context = Scheduler.Context> = {
    schedule: Schedule<T>;
    dag: DirectedGraph<Runnable<T>>;
    runnable?: Runnable<T>;
    tag?: Tag<T>;
};

export type OptionsFn<T extends Scheduler.Context = Scheduler.Context> = (
    options: Options<T>
) => void;

export type Tag<T extends Scheduler.Context = Scheduler.Context> = {
    id: symbol | string;
    before: Runnable<T>;
    after: Runnable<T>;
};
