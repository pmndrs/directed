import { OptionsObject, Runnable, Schedule } from '@directed/core';
import { useLayoutEffect, useMemo } from 'react';

export function useSchedule<T extends Scheduler.Context = Scheduler.Context>(
    schedule: Schedule<T>,
    runnable: Runnable<T>,
    options?: OptionsObject<T>
) {
    const scheduleMemo = useMemo(() => schedule, [schedule]);
    const runnableMemo = useMemo(() => runnable, [runnable]);

    useLayoutEffect(() => {
        scheduleMemo.add(runnableMemo, options);
        scheduleMemo.build();

        return () => {
            scheduleMemo.remove(runnableMemo);
            scheduleMemo.build();
        };
    }, [runnableMemo, scheduleMemo]);
}
