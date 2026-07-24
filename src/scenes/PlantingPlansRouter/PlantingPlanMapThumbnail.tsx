import React, { type JSX, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';

import usePlantingSite from 'src/hooks/usePlantingSite';
import { MultiPolygon } from 'src/queries/generated/plantingSites';
import useMapboxToken from 'src/utils/useMapboxToken';

export type PlantingPlanMapThumbnailProps = {
  plantingSiteId: number;
  width?: number;
  height?: number;
};

// The Mapbox Static Images API caps the request URL length. A 140x102 thumbnail needs almost no geometric detail, so we
// heavily simplify boundaries: keep only the outer ring of each polygon, drop tiny sliver polygons, and decimate the
// remaining points to fit a global budget. This keeps even pathological boundaries (dozens of polygons) within the URL
// limit while looking identical at thumbnail scale.
const COORD_DECIMALS = 5;
const MAX_URL_LENGTH = 7500;
const MIN_POLYGON_AREA_FRACTION = 0.0004;
const MIN_POINTS_PER_RING = 4;

type Ring = number[][];

const roundCoord = (value: number): number => Number(value.toFixed(COORD_DECIMALS));

const ringArea = (ring: Ring): number => {
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(area / 2);
};

const dedupeConsecutive = (ring: Ring): Ring =>
  ring.filter((point, index) => index === 0 || point[0] !== ring[index - 1][0] || point[1] !== ring[index - 1][1]);

const ensureClosed = (ring: Ring): Ring => {
  if (ring.length === 0) {
    return ring;
  }
  const first = ring[0];
  const last = ring[ring.length - 1];
  return first[0] === last[0] && first[1] === last[1] ? ring : [...ring, first];
};

const cleanRing = (ring: Ring, maxPoints: number): Ring | null => {
  const step = Math.max(1, Math.ceil(ring.length / maxPoints));
  const sampled: Ring = [];
  for (let i = 0; i < ring.length; i += step) {
    sampled.push([roundCoord(ring[i][0]), roundCoord(ring[i][1])]);
  }

  const closed = ensureClosed(dedupeConsecutive(sampled));
  if (closed.length < 4 || ringArea(closed) === 0) {
    return null;
  }
  return closed;
};

const simplifyToBudget = (boundary: MultiPolygon, pointBudget: number): number[][][][] => {
  const withArea = boundary.coordinates
    .map((polygon) => polygon[0])
    .filter((ring): ring is Ring => !!ring && ring.length >= 4)
    .map((ring) => ({ ring, area: ringArea(ring) }))
    .filter(({ area }) => area > 0);
  if (withArea.length === 0) {
    return [];
  }

  const maxArea = Math.max(...withArea.map(({ area }) => area));
  const significant = withArea
    .filter(({ area }) => area >= maxArea * MIN_POLYGON_AREA_FRACTION)
    .sort((a, b) => b.area - a.area);

  const maxPolygons = Math.max(1, Math.floor(pointBudget / MIN_POINTS_PER_RING));
  const kept = significant.slice(0, maxPolygons);
  const pointsPerRing = Math.max(MIN_POINTS_PER_RING, Math.floor(pointBudget / kept.length));

  return kept
    .map(({ ring }) => cleanRing(ring, pointsPerRing))
    .filter((ring): ring is Ring => ring !== null)
    .map((ring) => [ring]);
};

const PlantingPlanMapThumbnail = ({
  plantingSiteId,
  width = 140,
  height = 102,
}: PlantingPlanMapThumbnailProps): JSX.Element => {
  const theme = useTheme();
  const { token } = useMapboxToken();
  const { plantingSite } = usePlantingSite(plantingSiteId);

  const siteColor = (theme.palette.TwClrBaseGreen300 as string).replace('#', '');

  const imageUrl = useMemo(() => {
    if (!token || !plantingSite?.boundary) {
      return undefined;
    }

    const buildUrl = (pointBudget: number): string => {
      const features: object[] = [
        {
          type: 'Feature',
          properties: { stroke: `#${siteColor}`, 'stroke-width': 2, fill: `#${siteColor}`, 'fill-opacity': 0.2 },
          geometry: { type: 'MultiPolygon', coordinates: simplifyToBudget(plantingSite.boundary!, pointBudget) },
        },
      ];

      const geojson = encodeURIComponent(JSON.stringify({ type: 'FeatureCollection', features }));
      const size = `${width}x${height}@2x`;
      return `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/geojson(${geojson})/auto/${size}?padding=10&access_token=${token}`;
    };

    let url = buildUrl(220);
    if (url.length > MAX_URL_LENGTH) {
      url = buildUrl(140);
    }
    if (url.length > MAX_URL_LENGTH) {
      url = buildUrl(90);
    }
    return url;
  }, [plantingSite, siteColor, token, width, height]);

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.TwClrBgSecondary,
        borderRadius: theme.spacing(1),
        flexShrink: 0,
        height: `${height}px`,
        overflow: 'hidden',
        width: `${width}px`,
      }}
    >
      {imageUrl && (
        <Box
          component='img'
          src={imageUrl}
          alt=''
          sx={{ borderRadius: theme.spacing(1), display: 'block', height: '100%', objectFit: 'cover', width: '100%' }}
        />
      )}
    </Box>
  );
};

export default PlantingPlanMapThumbnail;
