import dogRouteData from '../data/gwangan-dangdang-route.json';
import seagullRouteData from '../data/gwangan-seagull-route.json';
import yachtRouteData from '../data/seomyeon-yacht-route.json';
import snailRouteData from '../data/haeundae-snail-route.json';

export interface GeoPoint { latitude: number; longitude: number }

export interface CourseGuide {
  id: number;
  name: string;
  points: GeoPoint[];
  referenceImage: string;
}

// All 257 track points are taken, in order, from the user-provided GPX.
// The GPX reports 4,035 m; the polyline's geodesic length is about 4,042 m.
export const gwanganDogGuide: CourseGuide = {
  id: 1,
  name: '광안리 댕댕 RUN',
  points: dogRouteData.coordinates.map(([latitude, longitude]) => ({ latitude, longitude })),
  referenceImage: '/assets/gwangan-dangdang-route.png',
};

// This is a separate 273-point loop from the second user-provided GPX.
export const gwanganSeagullGuide: CourseGuide = {
  id: 2,
  name: '광안리 갈매기 RUN',
  points: seagullRouteData.coordinates.map(([latitude, longitude]) => ({ latitude, longitude })),
  referenceImage: '/assets/gwangan-seagull-route.png',
};

// All 355 track points follow the user-provided 5,984 m Seomyeon loop.
export const seomyeonYachtGuide: CourseGuide = {
  id: 4,
  name: '서면 요트 RUN',
  points: yachtRouteData.coordinates.map(([latitude, longitude]) => ({ latitude, longitude })),
  referenceImage: '/assets/seomyeon-yacht-route.png',
};

// The supplied Haeundae GPX runs 11,393 m from Jung-dong to Jwa-dong.
export const haeundaeSnailGuide: CourseGuide = {
  id: 3,
  name: '해운대 달팽이 RUN',
  points: snailRouteData.coordinates.map(([latitude, longitude]) => ({ latitude, longitude })),
  referenceImage: '/assets/haeundae-snail-route.png',
};

export function getCourseGuide(id?: number): CourseGuide | null {
  if (id === gwanganDogGuide.id) return gwanganDogGuide;
  if (id === gwanganSeagullGuide.id) return gwanganSeagullGuide;
  if (id === haeundaeSnailGuide.id) return haeundaeSnailGuide;
  if (id === seomyeonYachtGuide.id) return seomyeonYachtGuide;
  return null;
}
