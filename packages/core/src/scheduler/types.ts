import type { DirectedGraph } from '../directed-graph/directed-graph';
import { VertexID } from '../directed-graph/types';

declare global {
    namespace Scheduler {
        export interface Context {}
    }
}

export type TagID = string | symbol;
export type RunnableID = string | symbol;

export type Runnable<T extends Scheduler.Context = Scheduler.Context> = (
    context: T
) => void | Promise<void>;

export interface Schedule<T extends Scheduler.Context = Scheduler.Context> {
    dag: DirectedGraph<Runnable<T>>;
    tags: Map<TagID, Tag>;
    symbols: Map<RunnableID, Runnable<T>>;
    anonymous: Map<Runnable<T>, RunnableID>;
}

export type Options<T extends Scheduler.Context = Scheduler.Context> = {
    schedule: Schedule<T>;
    dag: DirectedGraph<Runnable<T>>;
    runnable?: Runnable<T>;
    tag?: Tag;
    id?: RunnableID;
};

export type OptionsFn<T extends Scheduler.Context = Scheduler.Context> =
    | SingleOptionsFn<T>
    | MultiOptionsFn<T>;

export type SingleOptionsFn<T extends Scheduler.Context = Scheduler.Context> =
    ((options: Options<T>) => Options<T>) & { __type: 'single' | 'multi' };

export type MultiOptionsFn<T extends Scheduler.Context = Scheduler.Context> = ((
    options: Options<T>
) => Options<T>) & { __type: 'multi' };

export type Tag = {
    id: TagID;
    before: VertexID;
    after: VertexID;
};
