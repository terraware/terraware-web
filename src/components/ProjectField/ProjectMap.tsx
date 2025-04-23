import React, { useEffect, useMemo } from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import { GenericMap } from 'src/components/Map';
import useRenderAttributes from 'src/components/Map/useRenderAttributes';
import { requestGetCountryBoundary } from 'src/redux/features/location/locationAsyncThunks';
import { selectCountryBoundary } from 'src/redux/features/location/locationSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { MapService } from 'src/services';
import { Application } from 'src/types/Application';
import { MapOptions } from 'src/types/Map';

type ProjectMapProps = {
  application?: Application;
  countryCode?: string;
  md?: number;
};

const ProjectMap = ({ application, countryCode, md }: ProjectMapProps) => {
  const theme = useTheme();
  const getRenderAttributes = useRenderAttributes();
  const dispatch = useAppDispatch();
  const countryBoundaryResult = useAppSelector(selectCountryBoundary(countryCode ?? ''));

  useEffect(() => {
    if (countryCode) {
      void dispatch(requestGetCountryBoundary(countryCode));
    }
  }, [dispatch, countryCode]);

  const countryMapOptions = useMemo<MapOptions | undefined>(() => {
    if (!countryBoundaryResult || !countryBoundaryResult.data) {
      return undefined;
    }

    const coordinates = countryBoundaryResult.data.coordinates;

    return {
      bbox: MapService.getBoundingBox([coordinates]),
      sources: [
        {
          entities: [
            {
              properties: {
                id: 1,
                name: 'countryBoundary',
                type: 'countryBoundary',
              },
              boundary: coordinates,
              id: 1,
            },
          ],
          id: 'boundary',
          isInteractive: false,
          ...getRenderAttributes('countryBoundary'),
        },
      ],
    };
  }, [getRenderAttributes, countryBoundaryResult]);

  const appBoundaryMapOptions = useMemo<MapOptions | undefined>(() => {
    if (!application?.boundary) {
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

  const mapElement = useMemo(() => {
    if (application?.boundary) {
      return (
        <GenericMap
          options={appBoundaryMapOptions}
          mapViewStyle={'Satellite'}
          style={{ height: '100%', width: '100%', borderRadius: theme.spacing(1) }}
          hideAllControls={true}
        />
      );
    } else if (countryCode && countryMapOptions) {
      return (
        <GenericMap
          options={countryMapOptions}
          mapViewStyle={'Light'}
          style={{ height: '100%', width: '100%', borderRadius: theme.spacing(1) }}
          hideAllControls={true}
        />
      );
    }
  }, [application?.boundary, countryCode, countryMapOptions]);

  return (
    <Grid item md={md || 12} paddingLeft={theme.spacing(1)}>
      <Box display='flex' minHeight={'400px'} justifyContent={'center'} alignContent={'center'}>
        {mapElement}
      </Box>
    </Grid>
  );
};

export default ProjectMap;
