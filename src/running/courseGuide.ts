import { courses, type GeoPoint } from '../data/courses';
export type { GeoPoint } from '../data/courses';

export interface CourseGuide {
  id: number;
  name: string;
  points: GeoPoint[];
  referenceImage: string;
}

// Adapt the shared catalog to the existing running/map interface.
const guides = new Map<number, CourseGuide>(courses.flatMap(course =>
  course.recommendationEligible && course.route ? [[course.id, {
    id: course.id, name: course.title, points: course.route.points, referenceImage: course.mapImage,
  }] as [number, CourseGuide]] : []));

export function getCourseGuide(id?: number): CourseGuide | null {
  return id === undefined ? null : guides.get(id) ?? null;
}
