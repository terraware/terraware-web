import React, { useMemo } from 'react';

import { Box, Card, useTheme } from '@mui/material';

import { MapService } from 'src/services';
import { Application } from 'src/types/Application';
import { MapOptions } from 'src/types/Map';

import { GenericMap } from '../Map';
import useRenderAttributes from '../Map/useRenderAttributes';

type ApplicationMapCardProps = {
  application: Application;
};

const ApplicationMapCard = ({ application }: ApplicationMapCardProps) => {
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
    <Card style={{ width: '100%', padding: theme.spacing(3), borderRadius: theme.spacing(3) }}>
      {mapOptions && (
        <Box display='flex' minHeight={'640px'} justifyContent={'center'} alignContent={'center'}>
          <GenericMap options={mapOptions} style={{ height: '100%', width: '100%', borderRadius: '24px' }} />
        </Box>
      )}
    </Card>
  );
};

export default ApplicationMapCard;
