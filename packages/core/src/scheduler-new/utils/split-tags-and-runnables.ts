import { Schedule } from '../schedule';
import { Runnable, Tag } from '../types';

/**
 * Splits the input ids into tags and runnables based on their type and retrieves corresponding tags and runnables from the schedule.
 *
 * @param schedule - The schedule to retrieve tags and runnables from.
 * @param ids - The ids to split into tags and runnables.
 * @return An object containing the extracted tags and runnables.
 */
export function splitTagsAndRunnables<T extends Scheduler.Context = Scheduler.Context>(
    schedule: Schedule<T>,
    ...ids: (symbol | string | Runnable<T>)[]
) {
    let tags: Tag<T>[] = [];
    let runnables: Runnable<T>[] = [];

    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];

        if (typeof id === 'symbol' || typeof id === 'string') {
            const tag = schedule.tags.get(id);

            if (tag) {
                tags.push(tag);
                continue;
            }

            const runnable = schedule.runnables.get(id);

            if (!runnable) {
                throw new Error(`Directed: Runnable with id ${String(id)} not found.`);
            }

            runnables.push(runnable);

            continue;
        }

        runnables.push(id);
    }

    return { tags, runnables };
}
