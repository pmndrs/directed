# Directed

📅 A flexible, minimal scheduler written in TypeScript. Directed is powered by a directed acyclic graph (DAG) allowing for dependency-based scheduling.

```
npm install directed
```

## Quickstart
Directed supports a functional and class API depending on what is comfy for you.


### Class API
```js
import { Schedule } from 'directed'

const applyGravity = (state) => {}
const moveBody = (state) => {}

const schedule = new Schedule()
schedule.add(moveBody)
schedule.add(applyGravity, { before: moveBody })

schedule.run(state)
```

### Functional API
```js
import * as Scheduler from 'directed'

const applyGravity = (state) => {}
const moveBody = (state) => {}

const schedule = Scheduler.create()
Scheduler.add(schedule, moveBody)
Scheduler.add(schedule, applyGravity, before(moveBody))

Scheduler.run(schedule, state)
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
> See the tests for more usage examples until we write out better docs. [Here](packages/core//src/scheduler/scheduler.test.ts) for functional and [here](packages/core/src/class/schedule.test.ts) for class.

## What's the big deal?
Scheduling update functions is simple when you have visibility of an entire static app, you just call them in the order required. The problem comes when the app scales and you no longer have full visibiilty, or if the app is dynamic and updates may or may not exist at any given time. You need to be confident that data is updated in the correct order at all times. 

One solution is to arrange updates by a priority number. But this quickly gets back to needing visibility of the entire app, and the problem only gets worse with external libraries. As web devs we all remember the z-index wars.

The most flexible solution is to instead tell the scheduler the dependencies for each update and let it solve for the correct order for us. Any new insertions will respect the already defined dependencies.

```js
schedule.add(A)
schedule.add(B, { before: A, after: C })
schedule.add(C, { before: B })
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
> Not quite done yet! All functions have JSDoc comments you can read [here](packages/core/src/scheduler/scheduler.ts) for the functional API. The class API is virtually the same, just formatted as methods which you can find [here](packages/core/src/class/schedule.ts).
