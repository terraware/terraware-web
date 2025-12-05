import React, { useCallback, useMemo, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import { View } from 'src/components/common/ListMapSelector';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { PlantingSite } from 'src/types/Tracking';

import DeletePlantingSiteModal from '../edit/DeletePlantingSiteModal';
import BoundariesAndZones from './BoundariesAndZones';
import PlantingSiteDetailsCard from './PlantingSiteDetailsCard';
import PlantingSiteDetailsHeader from './PlantingSiteDetailsHeader';
import SimplePlantingSite from './SimplePlantingSite';

export type GenericSiteViewProps = {
  plantingSite: PlantingSite;
};

export default function GenericSiteView({ plantingSite }: GenericSiteViewProps): JSX.Element {
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [view, setView] = useState<View>('map');

  const goToEditPlantingSite = useCallback(() => {
    const editPlantingSiteLocation = {
      pathname: APP_PATHS.PLANTING_SITES_EDIT.replace(':plantingSiteId', `${plantingSite.id}`),
    };
    navigate(editPlantingSiteLocation);
  }, [plantingSite, navigate]);

  const isMapView = useMemo<boolean>(
    () => view === 'map' || (plantingSite?.boundary !== undefined && plantingSite?.plantingZones === undefined),
    [plantingSite?.boundary, plantingSite?.plantingZones, view]
  );

  const openModal = useCallback(() => setDeleteModalOpen(true), []);
  const closeModal = useCallback(() => setDeleteModalOpen(false), []);

  return (
    <>
      {deleteModalOpen && plantingSite && (
        <DeletePlantingSiteModal plantingSiteId={plantingSite.id} onClose={closeModal} />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: isMapView ? 1 : 0 }}>
        <PlantingSiteDetailsHeader onEdit={goToEditPlantingSite} onDelete={openModal} plantingSite={plantingSite} />
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
            <BoundariesAndZones search={search} setSearch={setSearch} setView={setView} view={view} />
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
    </>
  );
}
