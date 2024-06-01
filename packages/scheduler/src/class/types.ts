import { Runnable } from '../scheduler-types';

export type OptionsObject = {
    id?: symbol | string;
    before?: symbol | string | Runnable | (symbol | string | Runnable)[];
    after?: symbol | string | Runnable | (symbol | string | Runnable)[];
    tag?: symbol | string | (symbol | string)[];
};
