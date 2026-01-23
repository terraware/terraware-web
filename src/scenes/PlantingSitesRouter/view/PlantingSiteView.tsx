import React, { type JSX, useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import { View } from 'src/components/common/ListMapSelector';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';

import DeletePlantingSiteModal from '../edit/DeletePlantingSiteModal';
import BoundariesAndStrata from './BoundariesAndStrata';
import PlantingSiteDetailsCard from './PlantingSiteDetailsCard';
import PlantingSiteDetailsHeader from './PlantingSiteDetailsHeader';
import SimplePlantingSite from './SimplePlantingSite';

export default function PlantingSiteView(): JSX.Element {
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [view, setView] = useState<View>('map');

  const params = useParams<{ plantingSiteId: string }>();
  const plantingSiteId = Number(params.plantingSiteId);
  const { data: plantingSiteData, isLoading } = useGetPlantingSiteQuery(plantingSiteId);
  const plantingSite = useMemo(() => plantingSiteData?.site, [plantingSiteData?.site]);

  const goToEditPlantingSite = useCallback(() => {
    if (plantingSite) {
      navigate({
        pathname: APP_PATHS.PLANTING_SITES_EDIT.replace(':plantingSiteId', `${plantingSite.id}`),
      });
    }
  }, [plantingSite, navigate]);

  const isMapView = useMemo<boolean>(
    () => view === 'map' || (plantingSite?.boundary !== undefined && plantingSite?.strata === undefined),
    [plantingSite?.boundary, plantingSite?.strata, view]
  );

  const openModal = useCallback(() => setDeleteModalOpen(true), []);
  const closeModal = useCallback(() => setDeleteModalOpen(false), []);

  if (isLoading || !plantingSite) {
    return <BusySpinner withSkrim={true} />;
  }

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
          {plantingSite.boundary && plantingSite.strata && (
            <BoundariesAndStrata search={search} setSearch={setSearch} setView={setView} view={view} />
          )}
          {plantingSite.boundary && !plantingSite.strata && (
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
