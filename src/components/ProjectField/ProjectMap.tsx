import React, { useMemo } from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import { GenericMap } from 'src/components/Map';
import useRenderAttributes from 'src/components/Map/useRenderAttributes';
import { MapService } from 'src/services';
import { Application } from 'src/types/Application';
import { MapOptions } from 'src/types/Map';

type ProjectMapProps = {
  application: Application;
  md?: number;
};

const ProjectMap = ({ application, md }: ProjectMapProps) => {
  const theme = useTheme();
  const getRenderAttributes = useRenderAttributes();

  const mapOptions = useMemo<MapOptions | undefined>(() => {
    if (!application.boundary) {
      return undefined;
    }

    const id = application.id;

    return {
      bbox: MapService.getBoundingBox([application.boundary.coordinates]),
      sources: [
        {
          entities: [
            {
              properties: {
                id,
                name: 'boundary',
                type: 'site',
              },
              boundary: application.boundary.coordinates,
              id,
            },
          ],
          id: 'boundary',
          isInteractive: false,
          ...getRenderAttributes('site'),
        },
      ],
    };
  }, [application, getRenderAttributes]);

  return (
    mapOptions && (
      <Grid item md={md || 12} paddingLeft={theme.spacing(1)}>
        <Box display='flex' minHeight={'400px'} justifyContent={'center'} alignContent={'center'}>
          <GenericMap
            options={mapOptions}
            style={{ height: '100%', width: '100%', borderRadius: theme.spacing(1) }}
            readOnly={true}
          />
        </Box>
      </Grid>
    )
  );
};

export default ProjectMap;
