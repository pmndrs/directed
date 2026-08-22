import type { AddOptions, Runnable, Scheduler } from '@directed/core';
import { useLayoutEffect } from 'react';

export function useScheduler<Context = unknown>(
  scheduler: Scheduler<Context>,
  runnable: Runnable<Context>,
  options?: AddOptions<Context>
) {
  useLayoutEffect(() => {
    scheduler.add(runnable, options);

    return () => {
      scheduler.remove(runnable);
    };
  }, [runnable, scheduler]);
}
