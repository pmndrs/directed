import { DirectedGraph } from './directed-graph';
import { Options, OptionsFn, Runnable, Schedule, Tag } from './scheduler-types';

/**
 * Splits the input ids into tags and runnables based on their type and retrieves corresponding tags and runnables from the schedule.
 *
 * @param {Schedule} schedule - The schedule to retrieve tags and runnables from.
 * @param {(symbol | string | Runnable)[]} ids - The ids to split into tags and runnables.
 * @return {{ tags: Tag[], runnables: Runnable[] }} An object containing the extracted tags and runnables.
 */
function splitTagsAndRunnables(
    schedule: Schedule,
    ...ids: (symbol | string | Runnable)[]
) {
    let tags: Tag[] = [];
    let runnables: Runnable[] = [];

    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];

        if (typeof id === 'symbol' || typeof id === 'string') {
            const tag = getTag(schedule, id);

            if (tag) {
                tags.push(tag);
                continue;
            }

            const runnable = getRunnable(schedule, id);

            if (runnable) {
                runnables.push(runnable);
            }

            continue;
        }

        runnables.push(id);
    }

    return { tags, runnables };
}

/**
 * An options function that schedules runnables before specified tags and runnables.
 *
 * @param {(symbol | string | Runnable)[]} ids - The ids to split into tags and runnables.
 * @return {OptionsFn} A function to schedule runnables before specified tags and runnables.
 */
export function before(...ids: (symbol | string | Runnable)[]): OptionsFn {
    return ({ schedule, dag, runnable, tag }) => {
        const { tags, runnables } = splitTagsAndRunnables(schedule, ...ids);

        if (runnable) {
            // schedule runnable before any tags in ids
            for (const t of tags) {
                dag.addEdge(runnable, t.before);
            }

            // schedule runnable before any runnables in ids
            for (const r of runnables) {
                dag.addEdge(runnable, r);
            }
        }

        if (tag) {
            // schedule tag before any other tags in ids
            for (const t of tags) {
                dag.addEdge(tag.after, t.before);
            }

            // schedule tag before any runnables in ids
            for (const r of runnables) {
                dag.addEdge(tag.after, r);
            }
        }
    };
}

/**
 * An options function that schedules runnables after specified tags and runnables.
 *
 * @param {...(symbol | string | Runnable)} ids - The ids to split into tags and runnables.
 * @return {OptionsFn} A function to schedule runnables after specified tags and runnables.
 */
export function after(...ids: (symbol | string | Runnable)[]): OptionsFn {
    return ({ schedule, dag, runnable, tag }) => {
        const { tags, runnables } = splitTagsAndRunnables(schedule, ...ids);

        if (runnable) {
            // schedule runnable after any tags in ids
            for (const t of tags) {
                dag.addEdge(t.after, runnable);
            }

            // schedule runnable after any runnables in ids
            for (const r of runnables) {
                dag.addEdge(r, runnable);
            }
        }

        if (tag) {
            // schedule tag after any other tags in ids
            for (const t of tags) {
                dag.addEdge(t.after, tag.before);
            }

            // schedule tag after any runnables in ids
            for (const r of runnables) {
                dag.addEdge(r, tag.before);
            }
        }
    };
}

/**
 * An options function that sets the ID of a runnable in the schedule.
 *
 * @param {symbol | string} id - The ID to be set for the runnable.
 * @return {OptionsFn} A function that sets the ID of a runnable in the schedule.
 */
export function id(id: symbol | string): OptionsFn {
    return ({ runnable, dag, schedule }) => {
        if (!runnable) {
            throw new Error('Id can only be applied to a runnable');
        }

        if (typeof id === 'string') {
            dag.name(runnable, id);
        }

        schedule.symbols.set(id, runnable);
    };
}

/**
 * An options function that applies a tag to a runnable based on the given id, symbol or runnable.
 *
 * @param {symbol | string} id - The unique identifier of the tag to apply.
 * @return {OptionsFn} A function that applies the tag to the provided runnable.
 */
export function tag(id: symbol | string): OptionsFn {
    return ({ schedule, runnable, dag }) => {
        if (!runnable) {
            throw new Error('Tag can only be applied to a runnable');
        }

        // apply the tag
        let tag = getTag(schedule, id);

        // create the tag if it doesn't exist
        if (!tag) {
            tag = createTag(schedule, id);
        }

        dag.addEdge(tag.before, runnable);
        dag.addEdge(runnable, tag.after);
    };
}

/**
 * Creates a new Schedule object with an empty DirectedGraph,
 * a new Map for tags, and a new Map for symbols.
 *
 * @return {Schedule} The newly created Schedule object.
 */
export function create<
    T extends Scheduler.Context = Scheduler.Context
>(): Schedule<T> {
    const schedule: Schedule<T> = {
        dag: new DirectedGraph<Runnable<T>>(),
        tags: new Map(),
        symbols: new Map(),
    };

    return schedule;
}

/**
 * Executes all the runnables in the given schedule with the provided context.
 *
 * @param {Schedule} schedule - The schedule containing the runnables to execute.
 * @param {Context} context - The context to be passed to each runnable.
 */
export function run(schedule: Schedule, context: Scheduler.Context) {
    for (let i = 0; i < schedule.dag.sorted.length; i++) {
        const runnable = schedule.dag.sorted[i];
        runnable(context);
    }
}

/**
 * Removes a tag from the given schedule by its ID.
 *
 * @param {Schedule} schedule - The schedule from which to remove the tag.
 * @param {symbol | string} id - The ID of the tag to remove.
 * @return {void} This function does not return anything.
 */
export function removeTag(schedule: Schedule, id: symbol | string) {
    const tag = schedule.tags.get(id);

    if (!tag) {
        return;
    }

    schedule.dag.removeVertex(tag.before);
    schedule.dag.removeVertex(tag.after);

    schedule.tags.delete(id);
}

/**
 * Checks if a tag with the given ID exists in the schedule.
 *
 * @param {Schedule} schedule - The schedule to check.
 * @param {symbol | string} id - The ID of the tag to check.
 * @return {boolean} Returns true if the tag exists, false otherwise.
 */
export function hasTag(schedule: Schedule, id: symbol | string) {
    return schedule.tags.has(id);
}

/**
 * Creates a new tag for the given schedule with the provided ID, name, and options.
 *
 * @param {Schedule} schedule - The schedule to create the tag for.
 * @param {symbol} id - The unique identifier for the tag.
 * @param {string} name - The name of the tag.
 * @param {...OptionsFn[]} options - Additional options to customize the tag.
 * @return {Tag} The newly created tag.
 */
export function createTag(
    schedule: Schedule,
    id: symbol | string,
    ...options: OptionsFn[]
): Tag {
    if (hasTag(schedule, id)) {
        throw new Error(`Tag with id ${String(id)} already exists`);
    }

    const before = () => {};
    const after = () => {};

    const name = typeof id === 'string' ? id : String(id);

    schedule.dag.addVertex(before, {
        name: `${name}-before`,
        excludeFromSort: true,
    });

    schedule.dag.addVertex(after, {
        name: `${name}-after`,
        excludeFromSort: true,
    });

    schedule.dag.addEdge(before, after);

    const tag = { id, before, after };

    const optionParams: Options = {
        dag: schedule.dag,
        tag,
        schedule,
    };

    // apply all options: tag, before, after
    for (const option of options) {
        option(optionParams);
    }

    schedule.tags.set(id, tag);

    return tag;
}

/**
 * Adds a runnable to the schedule and applies options to it.  The schedule must be built after a runnable is added.
 *
 * @param {Schedule} schedule - The schedule to add the runnable to.
 * @param {Runnable} runnable - The runnable to add to the schedule.
 * @param {...OptionsFn[]} options - The options to apply to the runnable.
 * @throws {Error} If the runnable already exists in the schedule.
 * @return {void}
 */
export function add(
    schedule: Schedule,
    runnable: Runnable,
    ...options: OptionsFn[]
) {
    if (schedule.dag.exists(runnable)) {
        throw new Error('Runnable already exists in schedule');
    }

    // add the runnable to the graph
    schedule.dag.addVertex(runnable, {});

    const optionParams: Options = {
        dag: schedule.dag,
        runnable,
        schedule,
    };

    // apply all options: tag, before, after
    for (const option of options) {
        option(optionParams);
    }

    // sort the graph - make manual
    schedule.dag.topSort();
}

/**
 * Builds the schedule by performing a topological sort on the directed graph.
 *
 * @param {Schedule} schedule - The schedule to be built.
 * @return {void} This function does not return anything.
 */
export function build(schedule: Schedule) {
    schedule.dag.topSort();
}

/**
 * Removes a runnable from the given schedule.
 *
 * @param {Schedule} schedule - The schedule from which to remove the runnable.
 * @param {Runnable} runnable - The runnable to remove from the schedule.
 * @return {void} This function does not return anything.
 */
export function remove(schedule: Schedule, runnable: Runnable) {
    schedule.dag.removeVertex(runnable);
}

/**
 * Retrieves a runnable from the schedule based on the given ID.
 *
 * @param {Schedule} schedule - The schedule to retrieve the runnable from.
 * @param {symbol | string} id - The ID of the runnable to retrieve.
 * @return {Runnable | undefined} The retrieved runnable or undefined if not found.
 */
export function getRunnable(schedule: Schedule, id: symbol | string) {
    return schedule.symbols.get(id);
}

/**
 * Retrieves a tag from the given schedule based on the provided ID.
 *
 * @param {Schedule} schedule - The schedule to retrieve the tag from.
 * @param {symbol | string} id - The ID of the tag to retrieve.
 * @return {Tag | undefined} The retrieved tag or undefined if not found.
 */
export function getTag(schedule: Schedule, id: symbol | string) {
    return schedule.tags.get(id);
}

/**
 * Prints an ASCII visualization of the directed acyclic graph (DAG) in the given schedule.
 *
 * @param {Schedule} schedule - The schedule containing the DAG to visualize.
 * @return {void} This function does not return anything.
 */
export function debug(schedule: Schedule) {
    schedule.dag.asciiVisualize();
}
