import { Feature } from '../api/types/feature';

interface Props {
  color: string;
  feature: Feature;
  onClick: (feature: Feature) => void;
}

export const IconPin = ({ color, feature, onClick }: Props) => (
  <svg height='100' width='100' onClick={() => onClick(feature)}>
    <circle cx='20' cy='20' r='10' fill={color} />
  </svg>
);

interface Coordinate {
  latitude: number;
  longitude: number;
}

export const getCoordinates = (feature: Feature): Coordinate => {
  if (feature.geom && feature.geom.coordinates && Array.isArray(feature.geom.coordinates)) {
    return {
      longitude: feature.geom.coordinates[0],
      latitude: feature.geom.coordinates[1],
    };
  } else {
    return {
      latitude: 0,
      longitude: 0,
    };
  }
};

export const getCenter = (features?: Feature[]): { latitude: number; longitude: number } => {
  if (features?.length) {
    let maxLat: number = getCoordinates(features[0]).latitude;
    let minLat: number = getCoordinates(features[0]).latitude;
    let maxLong: number = getCoordinates(features[0]).longitude;
    let minLong: number = getCoordinates(features[0]).longitude;

    const featureCopy = [...features];
    featureCopy.shift();

    featureCopy.forEach((feature) => {
      const coordinates = getCoordinates(feature);
      if (coordinates.latitude > maxLat) {
        maxLat = coordinates.latitude;
      }
      if (coordinates.latitude < minLat) {
        minLat = coordinates.latitude;
      }
      if (coordinates.longitude > maxLong) {
        maxLong = coordinates.longitude;
      }
      if (coordinates.longitude < minLong) {
        minLong = coordinates.longitude;
      }
    });

    return {
      latitude: (maxLat + minLat) / 2,
      longitude: (maxLong + minLong) / 2,
    };
  }

  return { latitude: 0, longitude: 0 };
};