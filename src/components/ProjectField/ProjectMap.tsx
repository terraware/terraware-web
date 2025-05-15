import React, { useEffect, useMemo } from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import { GenericMap } from 'src/components/Map';
import useRenderAttributes from 'src/components/Map/useRenderAttributes';
import { requestGetCountryBoundary } from 'src/redux/features/location/locationAsyncThunks';
import { selectCountryBoundary } from 'src/redux/features/location/locationSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { Application } from 'src/types/Application';
import { MapOptions, RenderableObject } from 'src/types/Map';

import ProjectFigureLabel from './ProjectFigureLabel';

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

  const getMapOptions = (coordinates: number[][][][], name: string, type: RenderableObject, id: number) => {
    return {
      bbox: MapService.getBoundingBox([coordinates]),
      sources: [
        {
          entities: [
            {
              properties: {
                id,
                name,
                type,
              },
              boundary: coordinates,
              id,
            },
          ],
          id: 'boundary',
          isInteractive: false,
          ...getRenderAttributes(type),
        },
      ],
    };
  };

  const countryMapOptions = useMemo<MapOptions | undefined>(() => {
    if (!countryBoundaryResult || !countryBoundaryResult.data) {
      return undefined;
    }

    return getMapOptions(countryBoundaryResult.data.coordinates, 'countryBoundary', 'countryBoundary', 1);
  }, [getRenderAttributes, countryBoundaryResult]);

  const appBoundaryMapOptions = useMemo<MapOptions | undefined>(() => {
    if (!application?.boundary) {
      return undefined;
    }

    return getMapOptions(application.boundary.coordinates, 'boundary', 'site', application.id);
  }, [application, getRenderAttributes]);

  const mapElement = useMemo(() => {
    const style = { height: '100%', width: '100%', borderRadius: theme.spacing(1) };
    if (application?.boundary) {
      return (
        <GenericMap
          options={appBoundaryMapOptions}
          mapViewStyle={'Satellite'}
          style={style}
          hideAllControls={true}
          bottomRightLabel={<ProjectFigureLabel labelText={strings.APPLICATION_SITE_BOUNDARY} />}
        />
      );
    } else if (countryCode && countryMapOptions) {
      return (
        <GenericMap
          options={countryMapOptions}
          mapViewStyle={'Light'}
          style={style}
          hideAllControls={true}
          disableZoom={true}
          bottomRightLabel={<ProjectFigureLabel labelText={strings.COUNTRY_ONLY} />}
        />
      );
    }
  }, [application?.boundary, countryCode, countryMapOptions]);

  return (
    <Grid item md={md || 12} xs={12} paddingX={theme.spacing(1)}>
      <Box sx={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignContent: 'center' }}>
        {mapElement}
      </Box>
    </Grid>
  );
};

export default ProjectMap;
