# Directed

📅 A flexible, minimal scheduler written in TypeScript. Directed is powered by a directed acyclic graph (DAG) allowing for dependency-based scheduling.

```
npm install directed
```

## Quickstart
```js
import { Schedule } from 'directed'

const applyGravity = (state) => {}
const moveBody = (state) => {}

const schedule = new Schedule()
schedule.add(moveBody)
schedule.add(applyGravity, { before: moveBody })

schedule.build() // Optional: run() builds automatically after changes
schedule.run(state)
```

### React
```js
import { Schedule } from 'directed'
import { useSchedule } from 'directed/react'

const applyGravity = (state) => {}
const moveBody = (state) => {}

const schedule = new Schedule()

// You can create hook bound to your schedule.
function useMySchedule(runnable, options) {
    return useSchedule(schedule, runnable, options)
}

function Foo({ children }) {
    useMySchedule(moveBody)
    useMySchedule(applyGravity, { before: moveBody })

    return children
}
```

> [!TIP]
> See the [Schedule tests](packages/core/src/schedule.test.ts) for more usage examples until the API documentation is complete.

## Lifecycle

> Declare → Build → Run

Declare. Register runnables, tags, and dependencies. This is the mutable phase. All changes to the scheduler happen here.

Build. Resolve the declared dependencies into a deterministic execution order. The resulting schedule is an immutable snapshot of the declared work.

Run. Execute the built schedule once against a context. Runtime policy is applied as each runnable is executed.

## What's the big deal?
Scheduling update functions is simple when you have visibility of an entire static app, you just call them in the order required. The problem comes when the app scales and you no longer have full visibiilty, or if the app is dynamic and updates may or may not exist at any given time. You need to be confident that data is updated in the correct order at all times. 

One solution is to arrange updates by a priority number. But this quickly gets back to needing visibility of the entire app, and the problem only gets worse with external libraries. As web devs we all remember the z-index wars.

The most flexible solution is to instead tell the scheduler the dependencies for each update and let it solve for the correct order for us. Any new insertions will respect the already defined dependencies.

Dependencies can be declared before their targets. Directed resolves and validates the complete graph during `build()`, and `run()` automatically builds whenever the schedule has changed.

```js
schedule.add(B, { before: A, after: C })
schedule.add(A)
schedule.add(C)
// Executes with the order C -> B -> A
```

Directed takes this a step further by allowing tags to be used as dependencies. This allows you to schedule without needing to know any of the internal functions.

```js
schedule.createTag('render')

schedule.add(A, { tag: 'render' })
schedule.add(B, { before: 'render' })
schedule.add(C, { after: 'render' })
// Executes with the order B -> A -> C
```
## API

> [!CAUTION]
> Not quite done yet! The class API can be found in [Schedule](packages/core/src/schedule.ts).
