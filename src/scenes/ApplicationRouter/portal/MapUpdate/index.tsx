import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, Card, Grid, useTheme } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { BusySpinner, Button } from '@terraware/web-components';
import area from '@turf/area';
import { Feature, FeatureCollection } from 'geojson';

import { Crumb } from 'src/components/BreadCrumbs';
import EditableMapV2 from 'src/components/Map/EditableMapV2';
import MapIcon from 'src/components/Map/MapIcon';
import useRenderAttributes from 'src/components/Map/useRenderAttributes';
import { toFeature, unionMultiPolygons } from 'src/components/Map/utils';
import { APP_PATHS, SQ_M_TO_HECTARES } from 'src/constants';
import { useCountryBoundary } from 'src/hooks/useCountryBoundary';
import useNavigateTo from 'src/hooks/useNavigateTo';
import usePathApplicationId from 'src/hooks/usePathApplicationId';
import useUndoRedoState from 'src/hooks/useUndoRedoState';
import { useLocalization } from 'src/providers';
import { useGetApplicationQuery, useUpdateApplicationBoundaryMutation } from 'src/queries/generated/applications';
import StepTitleDescription, { Description } from 'src/scenes/PlantingSitesRouter/edit/editor/StepTitleDescription';
import strings from 'src/strings';
import { RenderableReadOnlyBoundary } from 'src/types/Map';
import { MultiPolygon } from 'src/types/Tracking';
import useSnackbar from 'src/utils/useSnackbar';

import ApplicationPage from '../ApplicationPage';

// undo redo stack to capture site boundary and errors
type Stack = {
  errorAnnotations?: Feature[];
  siteBoundary?: FeatureCollection;
};

const MapUpdateView = () => {
  const theme = useTheme();

  const { activeLocale } = useLocalization();
  const pathApplicationId = usePathApplicationId();
  const { currentData: applicationData } = useGetApplicationQuery(pathApplicationId ?? skipToken);
  const selectedApplication = applicationData?.application;
  const { goToApplicationPrescreen } = useNavigateTo();
  const { toastSuccess, toastError } = useSnackbar();
  const getRenderAttributes = useRenderAttributes();

  const [siteBoundaryData, setSiteBoundaryData, undo, redo] = useUndoRedoState<Stack>();

  const [updateApplicationBoundary, { isLoading: isSaving }] = useUpdateApplicationBoundaryMutation();
  const countryBoundaryData = useCountryBoundary(selectedApplication?.countryCode);

  const countryBoundary = useMemo<RenderableReadOnlyBoundary[] | undefined>(() => {
    if (!countryBoundaryData) {
      return undefined;
    }

    return [
      {
        data: { type: 'FeatureCollection', features: [toFeature(countryBoundaryData, {}, 'countryBoundary')] },
        id: 'countryBoundary',
        renderProperties: getRenderAttributes('boundary'),
      },
    ];
  }, [getRenderAttributes, countryBoundaryData]);

  const findErrors = (boundaryToCheck: MultiPolygon) => {
    const boundaryAreaHa = parseFloat((area(boundaryToCheck) * SQ_M_TO_HECTARES).toFixed(2));

    const errorText = `${boundaryAreaHa} ${strings.HECTARES}`;
    return [{ type: 'Feature', geometry: boundaryToCheck, properties: { errorText, fill: false }, id: -1 } as Feature];
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
    if (selectedApplication) {
      if (boundary) {
        const applicationId = selectedApplication.id;
        void updateApplicationBoundary({
          applicationId,
          updateApplicationBoundaryRequestPayload: { boundary },
        })
          .unwrap()
          .then(() => {
            if (activeLocale) {
              toastSuccess(strings.PROPOSED_PROJECT_BOUNDARIES_ADDED);
            }
            goToApplicationPrescreen(applicationId);
          })
          .catch(() => undefined);
      } else {
        toastError(strings.APPLICATION_ERROR_NO_PROJECT_BOUNDARY);
      }
    }
  }, [
    activeLocale,
    boundary,
    goToApplicationPrescreen,
    selectedApplication,
    toastError,
    toastSuccess,
    updateApplicationBoundary,
  ]);

  const tutorialDescription = useMemo(() => {
    if (!activeLocale) {
      return '';
    }
    return strings.formatString(
      strings.PLANTING_SITE_CREATE_INSTRUCTIONS_DESCRIPTION,
      <MapIcon centerAligned icon='polygon' />
    ) as JSX.Element[];
  }, [activeLocale]);

  const description: Description[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              text: strings.SITE_BOUNDARY_DESCRIPTION_0,
            },
            {
              text: strings.SITE_BOUNDARY_DESCRIPTION_1,
              hasTutorial: true,
              handlePrefix: (prefix: string) =>
                strings.formatString(prefix, <MapIcon centerAligned={true} icon='polygon' />) as JSX.Element[],
            },
          ]
        : [],
    [activeLocale]
  );

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
      {isSaving && <BusySpinner withSkrim={true} />}
      <Grid container flexDirection={'row'} spacing={3} sx={{ padding: 0 }}>
        <Grid item xs={4}>
          <StepTitleDescription
            description={description}
            dontShowAgainPreferenceName='dont-show-site-boundary-instructions'
            title={strings.PROPOSED_PROJECT_BOUNDARY}
            tutorialDescription={tutorialDescription}
            tutorialDocLinkKey='planting_site_create_boundary_instructions_video'
            tutorialTitle={strings.PLANTING_SITE_CREATE_INSTRUCTIONS_TITLE}
          />
        </Grid>
        <Grid item xs={8}>
          <EditableMapV2
            editableBoundary={siteBoundaryData?.siteBoundary}
            errorAnnotations={siteBoundaryData?.errorAnnotations}
            onEditableBoundaryChanged={onEditableBoundaryChanged}
            onRedo={redo}
            onUndo={undo}
            readOnlyBoundary={countryBoundary}
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

const MapUpdateViewWrapper = () => {
  const { activeLocale } = useLocalization();
  const pathApplicationId = usePathApplicationId();
  const { currentData: applicationData } = useGetApplicationQuery(pathApplicationId ?? skipToken);
  const selectedApplication = applicationData?.application;

  const selectedApplicationId = selectedApplication?.id;

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale && selectedApplicationId
        ? [
            {
              name: strings.APPLICATION_PRESCREEN,
              to: APP_PATHS.APPLICATION_PRESCREEN.replace(':applicationId', `${selectedApplicationId}`),
            },
          ]
        : [],
    [activeLocale, selectedApplicationId]
  );
  return (
    <ApplicationPage crumbs={crumbs}>
      <MapUpdateView />
    </ApplicationPage>
  );
};

export default MapUpdateViewWrapper;
