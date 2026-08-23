import { DirectedGraph } from './directed-graph/directed-graph';
import { Schedule } from './schedule';
import type {
  AddManyOptions,
  AddOptions,
  Dependency,
  DependencyList,
  OrderingOptions,
  Runnable,
  SchedulerId,
} from './types';

type Tag<Context> = {
  before: Runnable<Context>;
  after: Runnable<Context>;
};

type RunnableDefinition<Context> = {
  runnable: Runnable<Context>;
  options?: AddOptions<Context>;
};

type StageDefinition<Context> = {
  id: SchedulerId;
  options?: OrderingOptions<Context>;
};

type ResolvedDependencies<Context> = {
  tags: Tag<Context>[];
  runnables: Runnable<Context>[];
};

type ScheduleEntry<Context> =
  { runnable: Runnable<Context>; stage?: never } | { runnable?: never; stage: Tag<Context> };

/**
 * The mutable handle work is declared into. Building a scheduler solves its
 * constraints into an immutable `Schedule`, which `run` executes.
 */
export class Scheduler<Context = unknown> {
  #schedule = new Schedule<Context>();
  readonly #runnableDefinitions = new Map<Runnable<Context>, RunnableDefinition<Context>>();
  readonly #stageDefinitions = new Map<SchedulerId, StageDefinition<Context>>();
  readonly #runnables = new Map<SchedulerId, Runnable<Context>>();
  #dirty = false;

  get schedule(): Schedule<Context> {
    return this.#schedule;
  }

  add(runnables: Runnable<Context>[], options?: AddManyOptions<Context>): this;
  add(runnable: Runnable<Context>, options?: AddOptions<Context>): this;
  add(
    runnableOrRunnables: Runnable<Context> | Runnable<Context>[],
    options?: AddOptions<Context> | AddManyOptions<Context>
  ): this {
    const runnables = Array.isArray(runnableOrRunnables)
      ? runnableOrRunnables
      : [runnableOrRunnables];

    if (Array.isArray(runnableOrRunnables) && 'id' in (options ?? {})) {
      throw new Error('An ID cannot be assigned to multiple runnables');
    }

    this.#assertRunnablesCanBeAdded(runnables);

    if (options && 'id' in options && options.id !== undefined) {
      this.#assertIdAvailable(options.id);
      this.#runnables.set(options.id, runnables[0]);
    }

    for (const runnable of runnables) {
      this.#runnableDefinitions.set(runnable, {
        runnable,
        options: this.#copyAddOptions(options),
      });
    }

    this.#dirty = true;
    return this;
  }

  has(runnable: Runnable<Context>): boolean {
    return this.#runnableDefinitions.has(runnable);
  }

  run(context: Context): void | Promise<void> {
    if (this.#dirty) {
      this.build();
    }

    return this.#schedule.run(context);
  }

  build(): Schedule<Context> {
    const dag = new DirectedGraph<Runnable<Context>>();
    const tags = new Map<SchedulerId, Tag<Context>>();

    for (const id of this.#collectTagIds()) {
      const before: Runnable<Context> = () => {};
      const after: Runnable<Context> = () => {};
      const name = typeof id === 'string' ? id : String(id);

      dag.addVertex(before, {
        name: `${name}-before`,
        excludeFromSort: true,
      });
      dag.addVertex(after, {
        name: `${name}-after`,
        excludeFromSort: true,
      });
      dag.addEdge(before, after);
      tags.set(id, { before, after });
    }

    for (const { runnable, options } of this.#runnableDefinitions.values()) {
      dag.addVertex(runnable, {});

      if (typeof options?.id === 'string') {
        dag.name(runnable, options.id);
      }
    }

    for (const { id, options } of this.#stageDefinitions.values()) {
      const stage = tags.get(id)!;
      const before = this.#resolveDependencies(options?.before, dag, tags);
      const after = this.#resolveDependencies(options?.after, dag, tags);

      this.#applyOrdering(dag, { stage }, before, after);
    }

    for (const { runnable, options } of this.#runnableDefinitions.values()) {
      const before = this.#resolveDependencies(options?.before, dag, tags);
      const after = this.#resolveDependencies(options?.after, dag, tags);
      const assignedTags = this.#resolveTags(options?.tag, tags);

      this.#applyOrdering(dag, { runnable }, before, after);

      for (const tag of assignedTags) {
        dag.addEdge(tag.before, runnable);
        dag.addEdge(runnable, tag.after);
      }
    }

    dag.topologicalSort();

    const schedule = new Schedule(dag.sorted);
    this.#schedule = schedule;
    this.#dirty = false;
    return schedule;
  }

  remove(runnable: Runnable<Context>): this {
    if (!this.#runnableDefinitions.delete(runnable)) {
      return this;
    }

    for (const [id, registeredRunnable] of this.#runnables) {
      if (registeredRunnable === runnable) {
        this.#runnables.delete(id);
      }
    }

    this.#dirty = true;
    return this;
  }

  /**
   * Declares a stage. A stage is a tag with declared ordering: its before and
   * after constraints apply to every member, including members added later.
   */
  createStage(id: SchedulerId, options?: OrderingOptions<Context>): this {
    this.#assertIdAvailable(id);
    this.#stageDefinitions.set(id, {
      id,
      options: this.#copyOrderingOptions(options),
    });
    this.#dirty = true;
    return this;
  }

  hasTag(id: SchedulerId): boolean {
    if (this.#stageDefinitions.has(id)) {
      return true;
    }

    for (const { options } of this.#runnableDefinitions.values()) {
      if (this.#membershipIds(options).includes(id)) {
        return true;
      }
    }

    return false;
  }

  getRunnable(id: SchedulerId): Runnable<Context> | undefined {
    return this.#runnables.get(id);
  }

  #assertRunnablesCanBeAdded(runnables: Runnable<Context>[]): void {
    const uniqueRunnables = new Set(runnables);

    if (uniqueRunnables.size !== runnables.length) {
      throw new Error('A runnable can only be added once');
    }

    for (const runnable of runnables) {
      if (this.#runnableDefinitions.has(runnable)) {
        throw new Error('Runnable already exists in schedule');
      }
    }
  }

  // Tags exist when implied by membership or declared as stages. Dependency
  // references never create tags.
  #collectTagIds(): SchedulerId[] {
    const ids = new Set<SchedulerId>(this.#stageDefinitions.keys());

    for (const { options } of this.#runnableDefinitions.values()) {
      for (const id of this.#membershipIds(options)) {
        if (ids.has(id)) {
          continue;
        }

        if (this.#runnables.has(id)) {
          throw new Error(`ID ${String(id)} already exists in the schedule`);
        }

        ids.add(id);
      }
    }

    return [...ids];
  }

  #membershipIds(options?: AddOptions<Context>): SchedulerId[] {
    if (options?.tag === undefined) {
      return [];
    }

    return Array.isArray(options.tag) ? options.tag : [options.tag];
  }

  #assertIdAvailable(id: SchedulerId): void {
    if (this.#runnables.has(id) || this.#stageDefinitions.has(id)) {
      throw new Error(`ID ${String(id)} already exists in the schedule`);
    }
  }

  #resolveDependencies(
    dependencies: DependencyList<Context> | undefined,
    dag: DirectedGraph<Runnable<Context>>,
    tags: Map<SchedulerId, Tag<Context>>
  ): ResolvedDependencies<Context> {
    const resolved: ResolvedDependencies<Context> = {
      tags: [],
      runnables: [],
    };

    if (dependencies === undefined) {
      return resolved;
    }

    const dependencyList = Array.isArray(dependencies) ? dependencies : [dependencies];

    for (const dependency of dependencyList) {
      this.#resolveDependency(dependency, resolved, dag, tags);
    }

    return resolved;
  }

  #resolveDependency(
    dependency: Dependency<Context>,
    resolved: ResolvedDependencies<Context>,
    dag: DirectedGraph<Runnable<Context>>,
    tags: Map<SchedulerId, Tag<Context>>
  ): void {
    if (typeof dependency === 'function') {
      if (!dag.exists(dependency)) {
        throw new Error('Runnable dependency does not exist');
      }

      resolved.runnables.push(dependency);
      return;
    }

    const tag = tags.get(dependency);

    if (tag) {
      resolved.tags.push(tag);
      return;
    }

    const runnable = this.#runnables.get(dependency);

    if (runnable) {
      resolved.runnables.push(runnable);
      return;
    }

    throw new Error(`Dependency ${String(dependency)} does not exist`);
  }

  #resolveTags(
    ids: SchedulerId | SchedulerId[] | undefined,
    tags: Map<SchedulerId, Tag<Context>>
  ): Tag<Context>[] {
    if (ids === undefined) {
      return [];
    }

    const resolved: Tag<Context>[] = [];

    for (const id of Array.isArray(ids) ? ids : [ids]) {
      const tag = tags.get(id);

      if (!tag) {
        throw new Error(`Tag ${String(id)} does not exist`);
      }

      resolved.push(tag);
    }

    return resolved;
  }

  #applyOrdering(
    dag: DirectedGraph<Runnable<Context>>,
    entry: ScheduleEntry<Context>,
    before: ResolvedDependencies<Context>,
    after: ResolvedDependencies<Context>
  ): void {
    const entryStart = entry.runnable ?? entry.stage.before;
    const entryEnd = entry.runnable ?? entry.stage.after;

    for (const tag of before.tags) {
      dag.addEdge(entryEnd, tag.before);
    }

    for (const runnable of before.runnables) {
      dag.addEdge(entryEnd, runnable);
    }

    for (const tag of after.tags) {
      dag.addEdge(tag.after, entryStart);
    }

    for (const runnable of after.runnables) {
      dag.addEdge(runnable, entryStart);
    }
  }

  #copyAddOptions(
    options?: AddOptions<Context> | AddManyOptions<Context>
  ): AddOptions<Context> | undefined {
    if (!options) {
      return undefined;
    }

    return {
      ...this.#copyOrderingOptions(options),
      ...('id' in options ? { id: options.id } : {}),
      tag: Array.isArray(options.tag) ? [...options.tag] : options.tag,
    };
  }

  #copyOrderingOptions(options?: OrderingOptions<Context>): OrderingOptions<Context> | undefined {
    if (!options) {
      return undefined;
    }

    return {
      before: Array.isArray(options.before) ? [...options.before] : options.before,
      after: Array.isArray(options.after) ? [...options.after] : options.after,
    };
  }
}
