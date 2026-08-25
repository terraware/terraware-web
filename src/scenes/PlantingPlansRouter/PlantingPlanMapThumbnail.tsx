import React, { type JSX } from 'react';

import { Box, useTheme } from '@mui/material';

import { useGetPlantingSiteThumbnailQuery } from 'src/queries/generated/siteThumbnail';

type PlantingPlanMapThumbnailProps = {
  plantingSiteId: number;
  width?: number;
  height?: number;
  fillColor?: string;
  strokeColor?: string;
};

const PlantingPlanMapThumbnail = ({
  plantingSiteId,
  width = 140,
  height = 102,
  fillColor,
  strokeColor,
}: PlantingPlanMapThumbnailProps): JSX.Element => {
  const theme = useTheme();
  const { data: svgMarkup, isError } = useGetPlantingSiteThumbnailQuery({ id: plantingSiteId, width, height });

  const boundaryFill = fillColor ?? (theme.palette.TwClrBaseGreen300 as string);
  const boundaryStroke = strokeColor ?? (theme.palette.TwClrBaseGreen300 as string);

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
      {svgMarkup && !isError && (
        <Box
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
          sx={{
            display: 'block',
            height: '100%',
            width: '100%',
            '& svg': { display: 'block', height: '100%', width: '100%' },
            '& path': {
              fill: boundaryFill,
              fillOpacity: 0.2,
              stroke: boundaryStroke,
              strokeWidth: 2,
            },
          }}
        />
      )}
    </Box>
  );
};

export default PlantingPlanMapThumbnail;
