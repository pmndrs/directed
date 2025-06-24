import { createSchedule, Schedule } from './schedule';
import { Runnable, SchedulerOptions } from './types';
import { splitTagsAndRunnables } from './utils/split-tags-and-runnables';

export class Scheduler<T extends Scheduler.Context = Scheduler.Context> {
    schedule: Schedule<T>;

    constructor(schedule?: Schedule<T>) {
        this.schedule = schedule ?? createSchedule<T>();
    }

    add(runnable: Runnable<T>, options?: SchedulerOptions<T>) {
        if (this.schedule.dag.exists(runnable)) {
            throw new Error('Runnable already exists in schedule');
        }

        // Add the runnable to the graph
        this.schedule.dag.addVertex(runnable);

        // Process ID options
        if (options?.id) {
            // Add the string ID as a vertex name on the DAG for debugging
            const stringId = typeof options.id === 'symbol' ? options.id.description : options.id;
            this.schedule.dag.name(runnable, stringId ?? '');

            // Add to the schedule's runnables map
            this.schedule.runnables.set(options.id, runnable);
        }

        // Process before options
        if (options?.before) {
            const beforeIds = Array.isArray(options.before) ? options.before : [options.before];
            const { tags, runnables } = splitTagsAndRunnables(this.schedule, ...beforeIds);

            for (const t of tags) {
                this.schedule.dag.addEdge(runnable, t.before);
            }

            for (const r of runnables) {
                this.schedule.dag.addEdge(runnable, r);
            }
        }

        // Process after options
        if (options?.after) {
            const afterIds = Array.isArray(options.after) ? options.after : [options.after];
            const { tags, runnables } = splitTagsAndRunnables(this.schedule, ...afterIds);

            for (const t of tags) {
                this.schedule.dag.addEdge(t.after, runnable);
            }

            for (const r of runnables) {
                this.schedule.dag.addEdge(r, runnable);
            }
        }

        return this;
    }

    build() {
        this.schedule.dag.topologicalSort();
        return this;
    }

    async run(context: T = {} as T) {
        for (let i = 0; i < this.schedule.sorted.length; i++) {
            const runnable = this.schedule.sorted[i];
            const result = runnable(context);
            if (result instanceof Promise) {
                await result;
            }
        }
    }

    remove(runnable: Runnable<T>) {
        this.schedule.dag.removeVertex(runnable);
        return this;
    }

    has(runnable: Runnable<T>) {
        return this.schedule.dag.exists(runnable);
    }

    // debug(): Schedule<T> {
    //     debug(this);
    //     return this;
    // }

    // createTag(id: symbol | string, options?: OptionsObject<T>): Schedule<T> {
    //     const optionsFns = createOptionsFns<T>(options);
    //     createTag(this, id, ...optionsFns);
    //     return this;
    // }

    // removeTag(id: symbol | string): Schedule<T> {
    //     removeTag(this, id);
    //     return this;
    // }

    // hasTag(id: symbol | string): boolean {
    //     return this.tags.has(id);
    // }

    // getRunnable(id: symbol | string): Runnable<T> | undefined {
    //     return this.symbols.get(id);
    // }
}
