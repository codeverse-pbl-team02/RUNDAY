import type { GeoPoint } from './courseGuide';

interface XY { x: number; y: number }

export interface RouteProgress {
  completedMeters: number;
  totalMeters: number;
  completedPath: GeoPoint[];
}

const START_RADIUS_METERS = 55;
const ROUTE_TOLERANCE_METERS = 45;
const MAX_FORWARD_METERS = 240;

/** Matches recorded GPS positions to the supplied GPX in course order. */
export function measureRouteProgress(route: GeoPoint[], samples: GeoPoint[]): RouteProgress {
  if (route.length < 2) return { completedMeters: 0, totalMeters: 0, completedPath: [] };

  const origin = route[0];
  const latitudeScale = 111_195;
  const longitudeScale = latitudeScale * Math.cos(origin.latitude * Math.PI / 180);
  const project = (point: GeoPoint): XY => ({
    x: (point.longitude - origin.longitude) * longitudeScale,
    y: (point.latitude - origin.latitude) * latitudeScale,
  });
  const xy = route.map(project);
  const cumulative = [0];
  for (let i = 1; i < xy.length; i++) {
    cumulative.push(cumulative[i - 1] + Math.hypot(xy[i].x - xy[i - 1].x, xy[i].y - xy[i - 1].y));
  }
  const totalMeters = cumulative[cumulative.length - 1];
  let completedMeters = 0;
  let started = false;

  for (const sample of samples) {
    if (!Number.isFinite(sample.latitude) || !Number.isFinite(sample.longitude)) continue;
    const point = project(sample);
    if (!started) {
      if (Math.hypot(point.x, point.y) <= START_RADIUS_METERS) started = true;
      continue;
    }
    let bestDistance = Infinity;
    let bestAlong = completedMeters;
    for (let i = 1; i < xy.length; i++) {
      if (cumulative[i] < completedMeters - 10 || cumulative[i - 1] > completedMeters + MAX_FORWARD_METERS) continue;
      const start = xy[i - 1];
      const end = xy[i];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const lengthSquared = dx * dx + dy * dy;
      if (lengthSquared === 0) continue;
      const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
      const along = cumulative[i - 1] + t * (cumulative[i] - cumulative[i - 1]);
      if (along < completedMeters - 10 || along > completedMeters + MAX_FORWARD_METERS) continue;
      const distance = Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
      if (distance < bestDistance - 0.5 || (Math.abs(distance - bestDistance) <= 0.5 && along < bestAlong)) {
        bestDistance = distance;
        bestAlong = along;
      }
    }
    if (bestDistance <= ROUTE_TOLERANCE_METERS) completedMeters = Math.max(completedMeters, bestAlong);
  }

  if (completedMeters < 1) return { completedMeters: 0, totalMeters, completedPath: [] };
  let index = 1;
  while (index < cumulative.length - 1 && cumulative[index] < completedMeters) index++;
  const startDistance = cumulative[index - 1];
  const segmentLength = cumulative[index] - startDistance;
  const t = segmentLength > 0 ? Math.max(0, Math.min(1, (completedMeters - startDistance) / segmentLength)) : 0;
  const completedPath = route.slice(0, index);
  completedPath.push({
    latitude: route[index - 1].latitude + (route[index].latitude - route[index - 1].latitude) * t,
    longitude: route[index - 1].longitude + (route[index].longitude - route[index - 1].longitude) * t,
  });
  return { completedMeters, totalMeters, completedPath };
}
