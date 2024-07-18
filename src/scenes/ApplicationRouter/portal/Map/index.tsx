import React from 'react';

import { Card, Grid, Typography, useTheme } from '@mui/material';
import area from '@turf/area';
import { Feature, FeatureCollection } from 'geojson';

import EditableMap from 'src/components/Map/EditableMapV2';
import { unionMultiPolygons } from 'src/components/Map/utils';
import useUndoRedoState from 'src/hooks/useUndoRedoState';
import { SQ_M_TO_HECTARES } from 'src/scenes/PlantingSitesRouter/edit/editor/utils';
import strings from 'src/strings';
import { MultiPolygon } from 'src/types/Tracking';

import ApplicationPage from '../ApplicationPage';

// undo redo stack to capture site boundary and errors
type Stack = {
  errorAnnotations?: Feature[];
  siteBoundary?: FeatureCollection;
};

const MapView = () => {
  const theme = useTheme();

  const [siteBoundaryData, setSiteBoundaryData, undo, redo] = useUndoRedoState<Stack>();

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

  return (
    <ApplicationPage title={strings.PROPOSED_PROJECT_BOUNDARY}>
      <Card style={{ width: '100%', padding: theme.spacing(3), borderRadius: theme.spacing(3) }}>
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
      </Card>
    </ApplicationPage>
  );
};

export default MapView;
