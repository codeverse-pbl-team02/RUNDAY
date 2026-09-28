// Keep auth deletion last so a failed cleanup can be retried by its owner.
export interface DeletionSteps {
  mark: () => Promise<unknown>;
  removeDocuments: () => Promise<unknown>;
  removeFiles: () => Promise<unknown>;
  removeIdentity: () => Promise<unknown>;
  clearMarker: () => Promise<unknown>;
  onMarkerError: (error: unknown) => void;
}

export async function performDeletion(steps: DeletionSteps) {
  await steps.mark();
  await steps.removeDocuments();
  await steps.removeFiles();
  await steps.removeIdentity();
  // Identity has already been deleted. A leftover lock is safe and logged for cleanup.
  try { await steps.clearMarker(); }
  catch (error) { steps.onMarkerError(error); }
}

export function hasRecentAuthentication(authTime: unknown, nowSeconds: number): boolean {
  return typeof authTime === 'number' && authTime <= nowSeconds + 30 && nowSeconds - authTime <= 300;
}
