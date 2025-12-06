import React, { useCallback, useMemo } from 'react';
import { useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import { View } from 'src/components/common/ListMapSelector';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useUser } from 'src/providers';
import { useGetDraftPlantingSiteQuery } from 'src/queries/generated/draftPlantingSites';
import DeleteDraftPlantingSiteModal from 'src/scenes/PlantingSitesRouter/edit/DeleteDraftPlantingSiteModal';
import { toDraft } from 'src/utils/draftPlantingSiteUtils';

import DraftPlantingSiteListMapView from './DraftPlantingSiteListMapView';
import PlantingSiteDetailsCard from './PlantingSiteDetailsCard';
import PlantingSiteDetailsHeader from './PlantingSiteDetailsHeader';
import SimplePlantingSite from './SimplePlantingSite';

export default function PlantingSiteDraftView(): JSX.Element {
  const theme = useTheme();
  const { user } = useUser();
  const navigate = useSyncNavigate();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();

  const { data: result } = useGetDraftPlantingSiteQuery(Number(plantingSiteId));
  const plantingSite = useMemo(() => (result?.site ? toDraft(result.site) : undefined), [result?.site]);

  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [view, setView] = useState<View>('map');

  const isMapView = useMemo<boolean>(
    () => view === 'map' || (plantingSite?.boundary !== undefined && plantingSite?.plantingZones === undefined),
    [plantingSite, view]
  );

  const goToEditDraftPlantingSite = useCallback(() => {
    if (plantingSiteId) {
      const editDraftPlantingSiteLocation = {
        pathname: APP_PATHS.PLANTING_SITES_DRAFT_EDIT.replace(':plantingSiteId', plantingSiteId),
      };
      navigate(editDraftPlantingSiteLocation);
    }
  }, [plantingSiteId, navigate]);

  if (plantingSite !== undefined) {
    return (
      <TfMain>
        {deleteModalOpen && (
          <DeleteDraftPlantingSiteModal plantingSite={plantingSite} onClose={() => setDeleteModalOpen(false)} />
        )}
        {plantingSite && (
          <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: isMapView ? 1 : 0 }}>
            <PlantingSiteDetailsHeader
              editDisabled={!user || plantingSite.createdBy !== user.id}
              onEdit={goToEditDraftPlantingSite}
              onDelete={() => setDeleteModalOpen(true)}
              plantingSite={plantingSite}
            />
            <Grid item xs={12}>
              <PageSnackbar />
            </Grid>
            <Card
              flushMobile
              style={{
                flexGrow: plantingSite?.boundary ? 1 : 0,
                display: 'flex',
                flexDirection: 'column',
                marginTop: theme.spacing(4),
              }}
            >
              <PlantingSiteDetailsCard plantingSite={plantingSite} />
              {plantingSite.boundary && plantingSite.plantingZones && (
                <DraftPlantingSiteListMapView
                  plantingSite={plantingSite}
                  search={search}
                  setSearch={setSearch}
                  setView={setView}
                  view={view}
                />
              )}
              {plantingSite.boundary && !plantingSite.plantingZones && (
                <Grid container flexGrow={1}>
                  <Grid item xs={12} display='flex'>
                    <SimplePlantingSite plantingSite={plantingSite} />
                  </Grid>
                </Grid>
              )}
            </Card>
          </Box>
        )}
      </TfMain>
    );
  }

  return <BusySpinner withSkrim={true} />;
}
