import React, { useCallback, useEffect, useMemo } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import { GenericMap } from 'src/components/Map';
import useRenderAttributes from 'src/components/Map/useRenderAttributes';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
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
  includeLabel?: boolean;
  projectId?: number;
};

const ProjectMap = ({ application, countryCode, md, includeLabel, projectId }: ProjectMapProps) => {
  const theme = useTheme();
  const getRenderAttributes = useRenderAttributes();
  const dispatch = useAppDispatch();
  const countryBoundaryResult = useAppSelector(selectCountryBoundary(countryCode ?? ''));
  const navigate = useSyncNavigate();

  useEffect(() => {
    if (countryCode) {
      void dispatch(requestGetCountryBoundary(countryCode));
    }
  }, [dispatch, countryCode]);

  const getMapOptions = useCallback(
    (coordinates: number[][][][], name: string, type: RenderableObject, id: number) => {
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
    },
    [getRenderAttributes]
  );

  const countryMapOptions = useMemo<MapOptions | undefined>(() => {
    if (!countryBoundaryResult || !countryBoundaryResult.data) {
      return undefined;
    }

    return getMapOptions(countryBoundaryResult.data.coordinates, 'countryBoundary', 'countryBoundary', 1);
  }, [countryBoundaryResult, getMapOptions]);

  const appBoundaryMapOptions = useMemo<MapOptions | undefined>(() => {
    if (!application?.boundary) {
      return undefined;
    }

    return getMapOptions(application.boundary.coordinates, 'boundary', 'site', application.id);
  }, [application?.boundary, application?.id, getMapOptions]);

  const mapElement = useMemo(() => {
    const style = { height: '100%', width: '100%', borderRadius: theme.spacing(1) };
    if (application?.boundary) {
      return (
        <GenericMap
          options={appBoundaryMapOptions}
          mapViewStyle={'Satellite'}
          style={style}
          hideAllControls={true}
          bottomRightLabel={includeLabel && <ProjectFigureLabel labelText={strings.APPLICATION_SITE_BOUNDARY} />}
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
          bottomRightLabel={includeLabel && <ProjectFigureLabel labelText={strings.COUNTRY_ONLY} />}
        />
      );
    }
  }, [appBoundaryMapOptions, application?.boundary, countryCode, countryMapOptions, includeLabel, theme]);

  const goToGisMapsView = useCallback(() => {
    if (projectId) {
      navigate(APP_PATHS.ACCELERATOR_PROJECT_GIS_MAPS_VIEW.replace(':projectId', projectId.toString()));
    }
  }, [projectId, navigate]);

  return (
    <Grid item md={md || 12} xs={12} paddingX={theme.spacing(1)} position={'relative'}>
      <Box
        sx={{
          position: 'absolute',
          right: '20px',
          top: '12px',
          zIndex: 10,
          backgroundColor: `${theme.palette.TwClrBaseWhite}`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
          }}
          onClick={goToGisMapsView}
        >
          <Icon name='iconExternalLink' size='medium' fillColor={theme.palette.TwClrIcnSecondary} />
        </button>
      </Box>
      <Box sx={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignContent: 'center' }}>
        {mapElement}
      </Box>
    </Grid>
  );
};

export default ProjectMap;
