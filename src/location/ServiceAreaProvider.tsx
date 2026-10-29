import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useRun } from '../running/RunProvider';
import { useServiceAreaState } from './useServiceAreaState';
import type { ServiceAreaState } from './serviceArea';

const ServiceAreaContext = createContext<ServiceAreaState | null>(null);

export function ServiceAreaProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const run = useRun();
  const area = useServiceAreaState({ point: run.current, accuracy: run.accuracy,
    locating: run.locating || run.mode === 'locating', locationError: run.locationError, enabled });
  useEffect(() => {
    if (area.status === 'outside' && (run.mode === 'running' || run.mode === 'locating')) run.pause();
  }, [area.status, run.mode, run.pause]);
  return <ServiceAreaContext.Provider value={area}>{children}</ServiceAreaContext.Provider>;
}

export function useServiceArea() {
  const area = useContext(ServiceAreaContext);
  if (!area) throw new Error('ServiceAreaProvider required');
  return area;
}
