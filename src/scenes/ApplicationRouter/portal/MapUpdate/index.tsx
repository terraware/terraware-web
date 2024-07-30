import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Card, Grid, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import area from '@turf/area';
import { Feature, FeatureCollection } from 'geojson';

import { Crumb } from 'src/components/BreadCrumbs';
import EditableMap from 'src/components/Map/EditableMapV2';
import { unionMultiPolygons } from 'src/components/Map/utils';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import useUndoRedoState from 'src/hooks/useUndoRedoState';
import { useLocalization } from 'src/providers';
import { requestUpdateApplicationBoundary } from 'src/redux/features/application/applicationAsyncThunks';
import { selectApplicationUpdateBoundary } from 'src/redux/features/application/applicationSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { SQ_M_TO_HECTARES } from 'src/scenes/PlantingSitesRouter/edit/editor/utils';
import strings from 'src/strings';
import { MultiPolygon } from 'src/types/Tracking';
import useSnackbar from 'src/utils/useSnackbar';

import { useApplicationData } from '../../provider/Context';
import ApplicationPage from '../ApplicationPage';

// undo redo stack to capture site boundary and errors
type Stack = {
  errorAnnotations?: Feature[];
  siteBoundary?: FeatureCollection;
};

const MapView = () => {
  const theme = useTheme();

  const { activeLocale } = useLocalization();
  const dispatch = useAppDispatch();
  const { selectedApplication, reload } = useApplicationData();
  const { goToApplicationMap } = useNavigateTo();
  const { toastSuccess } = useSnackbar();
  const [siteBoundaryData, setSiteBoundaryData, undo, redo] = useUndoRedoState<Stack>();

  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectApplicationUpdateBoundary(requestId));

  const findErrors = (boundary: MultiPolygon) => {
    const boundaryAreaHa = parseFloat((area(boundary) * SQ_M_TO_HECTARES).toFixed(2));
    const maxAreaHa = 20000;

    if (boundaryAreaHa > 20000) {
      const errorText = strings.formatString(strings.SITE_BOUNDARY_POLYGON_TOO_LARGE, boundaryAreaHa, maxAreaHa);
      return [{ type: 'Feature', geometry: boundary, properties: { errorText, fill: true }, id: -1 } as Feature];
    } else {
      return undefined;
    }
  };

  /**
   * Check for errors and mark annotations.
   */
  const onEditableBoundaryChanged = (editableBoundary?: FeatureCollection) => {
    const newBoundary = (editableBoundary && unionMultiPolygons(editableBoundary)) || undefined;

    if (newBoundary) {
      const errors = findErrors(newBoundary);
      setSiteBoundaryData({
        errorAnnotations: errors,
        siteBoundary: editableBoundary,
      });
    }
  };

  // construct union of multipolygons
  const boundary = useMemo<MultiPolygon | undefined>(
    () => (siteBoundaryData?.siteBoundary && unionMultiPolygons(siteBoundaryData?.siteBoundary)) || undefined,
    [siteBoundaryData?.siteBoundary]
  );

  const onSave = useCallback(() => {
    if (selectedApplication && boundary) {
      const dispatched = dispatch(
        requestUpdateApplicationBoundary({ applicationId: selectedApplication.id, boundary })
      );
      setRequestId(dispatched.requestId);
    }
  }, [selectedApplication, boundary]);

  const navigateToMap = useCallback(() => {
    if (selectedApplication) {
      goToApplicationMap(selectedApplication.id);
    }
  }, [selectedApplication, goToApplicationMap]);

  useEffect(() => {
    if (result && result.status === 'success') {
      if (activeLocale) {
        toastSuccess(strings.SUCCESS);
      }
      reload(navigateToMap);
    }
  }, [activeLocale, reload, result, toastSuccess, navigateToMap]);

  if (!selectedApplication) {
    return;
  }

  return (
    <Card
      title={strings.PROPOSED_PROJECT_BOUNDARY}
      style={{
        width: '100%',
        padding: theme.spacing(3),
        borderRadius: theme.spacing(3),
        marginTop: selectedApplication.status === 'Failed Pre-screen' ? theme.spacing(4) : 0,
      }}
    >
      <Typography fontSize={'24px'} fontWeight={600} lineHeight={'32px'}>
        {strings.PROPOSED_PROJECT_BOUNDARY}
      </Typography>
      <Grid container flexDirection={'row'} spacing={3} sx={{ padding: 0 }}>
        <Grid item xs={4}>
          <Typography fontSize={'16px'} fontWeight={400} lineHeight={'24px'}>
            <p>
              All plantable areas must be contained within the site boundary. Any areas within the site boundary that
              are not plantable should be excluded.
            </p>
            <p>
              Draw the site boundary of your planting site below. Use the drawing tool to draw the boundary of the
              planting site.
            </p>
            <p>Watch a tutorial about drawing site boundaries.</p>
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <EditableMap
            errorAnnotations={siteBoundaryData?.errorAnnotations}
            onEditableBoundaryChanged={onEditableBoundaryChanged}
            onRedo={redo}
            onUndo={undo}
            showSearchBox
          />
        </Grid>
      </Grid>
      <Box marginTop={theme.spacing(2)} display='flex' justifyContent='flex-end' width='100%'>
        <Button label={strings.SAVE_PROJECT_BOUNDARIES} onClick={onSave} size='medium' />
      </Box>
    </Card>
  );
};

const MapViewWrapper = () => {
  const { activeLocale } = useLocalization();
  const { selectedApplication } = useApplicationData();

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale && selectedApplication?.id
        ? [
            {
              name: strings.PROPOSED_PROJECT_BOUNDARY,
              to: APP_PATHS.APPLICATION_MAP.replace(':applicationId', `${selectedApplication.id}`),
            },
          ]
        : [],
    [activeLocale, selectedApplication?.id]
  );
  return (
    <ApplicationPage crumbs={crumbs}>
      <MapView />
    </ApplicationPage>
  );
};

export default MapViewWrapper;
