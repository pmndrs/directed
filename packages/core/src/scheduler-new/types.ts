declare global {
    namespace Scheduler {
        export interface Context {}
    }
}

export type SchedulerOptions<T extends Scheduler.Context = Scheduler.Context> = {
    before?: symbol | string | Runnable<T> | (symbol | string | Runnable<T>)[];
    after?: symbol | string | Runnable<T> | (symbol | string | Runnable<T>)[];
    tag?: symbol | string | (symbol | string)[];
    id?: string | symbol;
};

export type Runnable<T extends Scheduler.Context = Scheduler.Context> = (
    context: T
) => void | Promise<void>;

export type Tag<T extends Scheduler.Context = Scheduler.Context> = {
    id: symbol | string;
    before: Runnable<T>;
    after: Runnable<T>;
};
