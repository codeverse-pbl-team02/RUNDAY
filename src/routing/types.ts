import type { GeoPoint } from '../data/courses';

export interface RouteEndpoint extends GeoPoint { label: string }
export interface WalkingRoute {
  id: string;
  source: 'kakao-walk';
  name: string;
  start: RouteEndpoint;
  end: RouteEndpoint;
  distanceMeters: number;
  points: GeoPoint[];
  instructions: { point: GeoPoint; description: string }[];
  createdAt: number;
}
export interface PlannedRoute extends WalkingRoute { paceSecondsPerKm: number }

export function parsePace(minutes: string, seconds: string): number | null {
  if (!/^\d{1,2}$/.test(minutes) || !/^\d{1,2}$/.test(seconds)) return null;
  const pace = Number(minutes) * 60 + Number(seconds);
  return Number(seconds) < 60 && pace >= 120 && pace <= 1800 ? pace : null;
}

export function validEndpoint(value: unknown): value is RouteEndpoint {
  const p = value as RouteEndpoint | null;
  return Boolean(p && typeof p.label === 'string' && p.label.trim() && p.label.length <= 100
    && Number.isFinite(p.latitude) && Math.abs(p.latitude) <= 90
    && Number.isFinite(p.longitude) && Math.abs(p.longitude) <= 180);
}

export function validWalkingRoute(value: unknown): value is WalkingRoute {
  const route = value as WalkingRoute | null;
  return Boolean(route && route.source === 'kakao-walk' && typeof route.id === 'string' && route.id.length > 0 && route.id.length <= 100
    && typeof route.name === 'string' && route.name.length <= 210
    && validEndpoint(route.start) && validEndpoint(route.end)
    && Number.isFinite(route.distanceMeters) && route.distanceMeters >= 20 && route.distanceMeters <= 50_000
    && Number.isFinite(route.createdAt) && Array.isArray(route.points) && route.points.length >= 2 && route.points.length <= 10_000
    && route.points.every(point => validEndpoint({ ...point, label: 'point' }))
    && Array.isArray(route.instructions) && route.instructions.length <= 1000
    && route.instructions.every(step => step && typeof step.description === 'string' && step.description.length <= 500
      && validEndpoint({ ...step.point, label: 'step' })));
}

export function validPlannedRoute(value: unknown): value is PlannedRoute {
  const route = value as PlannedRoute;
  return validWalkingRoute(value) && Number.isInteger(route.paceSecondsPerKm)
    && route.paceSecondsPerKm >= 120 && route.paceSecondsPerKm <= 1800;
}

export function estimatedRunSeconds(distanceMeters: number, paceSecondsPerKm: number) {
  return Math.round(distanceMeters / 1000 * paceSecondsPerKm);
}
