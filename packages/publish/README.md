# Directed

📅 A flexible, minimal scheduler written in TypeScript. Directed is powered by a directed acyclic graph (DAG) allowing for dependency-based scheduling.

```
npm install directed
```

## Quickstart

```js
import { Scheduler } from 'directed'

const applyGravity = (state) => {}
const moveBody = (state) => {}

const scheduler = new Scheduler()
scheduler.add(moveBody)
scheduler.add(applyGravity, { before: moveBody })

scheduler.run(state)
```

### React

```js
import { Scheduler } from 'directed'
import { useScheduler } from 'directed/react'

const applyGravity = (state) => {}
const moveBody = (state) => {}

const scheduler = new Scheduler()

// You can create a hook bound to your scheduler.
function useMyScheduler(runnable, options) {
  return useScheduler(scheduler, runnable, options)
}

function Foo({ children }) {
  useMyScheduler(moveBody)
  useMyScheduler(applyGravity, { before: moveBody })

  return children
}
```

> [!TIP]
> See the [Scheduler tests](packages/core/tests/scheduler.test.ts) for more usage examples until the API documentation is complete.

## Lifecycle

> Declare → Build → Run

Declare. Register runnables, tags, and dependencies. This is the mutable phase. All changes to the scheduler happen here.

Build. Resolve and validate the declared dependencies before execution. The resulting schedule is an immutable snapshot of the declared work.

Run. Execute the built schedule once against a context. Runtime policy is applied as each runnable is executed.

## What's the big deal?

Scheduling update functions is simple when you have visibility of an entire static app, you just call them in the order required. The problem comes when the app scales and you no longer have full visibiilty, or if the app is dynamic and updates may or may not exist at any given time. You need to be confident that data is updated in the correct order at all times.

One solution is to arrange updates by a priority number. But this quickly gets back to needing visibility of the entire app, and the problem only gets worse with external libraries. As web devs we all remember the z-index wars.

The most flexible solution is to instead tell the scheduler the dependencies for each update and let it solve for the correct order for us. Any new insertions will respect the already defined dependencies.

Dependencies can be declared before their targets. Directed resolves and validates the complete graph when `build()` is called explicitly or when `run()` encounters deferred changes. An explicit build is useful when you want to validate and publish a new schedule before execution. A successful build atomically replaces `scheduler.schedule`. A failed build leaves the previous schedule unchanged.

```js
scheduler.add(B, { before: A, after: C })
scheduler.add(A)
scheduler.add(C)

scheduler.run(state)
// Executes with the order C -> B -> A
```

Directed takes this a step further by allowing tags to be used as dependencies. This allows you to schedule without needing to know any of the internal functions.

```js
scheduler.add(A, { tag: 'render' })
scheduler.add(B, { before: 'render' })
scheduler.add(C, { after: 'render' })

scheduler.run(state)
// Executes with the order B -> A -> C
```

Tags are created implicitly when work is tagged. They carry no ordering of their own and members interleave freely by their own dependencies.

## Stages

When you want explicitly ordered groups, like a Unity-style update loop, declare stages. A stage is a tag with declared ordering, using the same before and after options as work. Its ordering binds every member, including members added later.

```js
scheduler.createStage(['input', 'update', 'render'])

scheduler.add(A, { tag: 'render' })
scheduler.add(B, { tag: 'input' })
scheduler.add(C, { tag: 'update' })

scheduler.run(state)
// Executes with the order B -> C -> A
```

An array declares a linear chain of stages. Options apply to the chain as a whole, so a chain can be inserted between existing stages.

Stages can be declared without visibility of the whole app. `scheduler.createStage('physics', { before: 'update' })` slots physics before update, no matter who declared update.

## API

> [!CAUTION]
> Not quite done yet! The mutable API can be found in [Scheduler](packages/core/src/scheduler.ts), and the immutable artifact in [Schedule](packages/core/src/schedule.ts).
