import React, { type JSX, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';

import usePlantingSite from 'src/hooks/usePlantingSite';
import { simplifyToBudget } from 'src/utils/geometry';
import useMapboxToken from 'src/utils/useMapboxToken';

export type PlantingPlanMapThumbnailProps = {
  plantingSiteId: number;
  width?: number;
  height?: number;
};

// The Mapbox Static Images API caps the request URL length. A 140x102 thumbnail needs almost no geometric detail, so we
// simplify the boundary (see simplifyToBudget) to a point budget and shrink the budget further if the URL is still too
// long.
const MAX_URL_LENGTH = 7500;

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
          geometry: {
            type: 'MultiPolygon',
            coordinates: simplifyToBudget(plantingSite.boundary!.coordinates, pointBudget),
          },
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
