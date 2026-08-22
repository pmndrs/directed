import { AddOptions, Runnable, Schedule } from '@directed/core';
import { useLayoutEffect } from 'react';

export function useSchedule<Context = unknown>(
    schedule: Schedule<Context>,
    runnable: Runnable<Context>,
    options?: AddOptions<Context>
) {
    useLayoutEffect(() => {
        schedule.add(runnable, options);

        return () => {
            schedule.remove(runnable);
        };
    }, [runnable, schedule]);
}
