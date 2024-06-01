import {
    after as afterFn,
    before as beforeFn,
    id as idFn,
    tag as tagFn,
} from '../../scheduler';
import { OptionsFn } from '../../scheduler-types';
import { OptionsObject } from '../types';

export function createOptionsFns<
    T extends Scheduler.Context = Scheduler.Context
>(options: OptionsObject | undefined): OptionsFn<T>[] {
    const optionsFns: OptionsFn[] = [];

    if (options?.id) {
        optionsFns.push(idFn(options.id));
    }

    if (options?.before) {
        if (Array.isArray(options.before)) {
            optionsFns.push(
                ...options.before.map((before) => beforeFn(before))
            );
        } else {
            optionsFns.push(beforeFn(options.before));
        }
    }

    if (options?.after) {
        if (Array.isArray(options.after)) {
            optionsFns.push(...options.after.map((after) => afterFn(after)));
        } else {
            optionsFns.push(afterFn(options.after));
        }
    }

    if (options?.tag) {
        if (Array.isArray(options.tag)) {
            optionsFns.push(...options.tag.map((tag) => tagFn(tag)));
        } else {
            optionsFns.push(tagFn(options.tag));
        }
    }
    return optionsFns as OptionsFn<T>[];
}
