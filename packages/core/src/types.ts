export type ScheduleId = string | symbol;

export type Runnable<Context = unknown> = (
    context: Context
) => void | Promise<void>;

export type Dependency<Context = unknown> = ScheduleId | Runnable<Context>;

export type DependencyList<Context = unknown> =
    | Dependency<Context>
    | Dependency<Context>[];

export interface OrderingOptions<Context = unknown> {
    before?: DependencyList<Context>;
    after?: DependencyList<Context>;
}

export interface AddOptions<Context = unknown>
    extends OrderingOptions<Context> {
    id?: ScheduleId;
    tag?: ScheduleId | ScheduleId[];
}

export type AddManyOptions<Context = unknown> = Omit<
    AddOptions<Context>,
    'id'
>;
