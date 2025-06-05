import React, { useCallback, useEffect, useState } from 'react';

import { Box, Container, Grid, Typography, useTheme } from '@mui/material';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { useOrganization } from 'src/providers/hooks';
import TrackingService, { PlantingSitePostRequestBody, PlantingSitePutRequestBody } from 'src/services/TrackingService';
import strings from 'src/strings';
import { PlantingSite, UpdatedPlantingSeason } from 'src/types/Tracking';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import DetailsInputForm from './DetailsInputForm';

type CreatePlantingSiteProps = {
  reloadPlantingSites: () => void;
};

export default function CreatePlantingSite(props: CreatePlantingSiteProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { reloadPlantingSites } = props;
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const [onValidate, setOnValidate] = useState<((hasErrors: boolean) => void) | undefined>(undefined);
  const [plantingSeasons, setPlantingSeasons] = useState<UpdatedPlantingSeason[]>();

  const { isLoading, plantingSite } = usePlantingSiteData();

  const defaultPlantingSite = (): PlantingSite => ({
    id: -1,
    adHocPlots: [],
    name: '',
    organizationId: selectedOrganization?.id || -1,
    plantingSeasons: [],
  });

  const [record, setRecord, onChange] = useForm<PlantingSite>(defaultPlantingSite());

  useEffect(() => {
    setRecord({
      adHocPlots: plantingSite?.adHocPlots || [],
      boundary: plantingSite?.boundary,
      description: plantingSite?.description,
      id: plantingSite?.id || -1,
      name: plantingSite?.name || '',
      organizationId: selectedOrganization?.id || -1,
      plantingSeasons: plantingSite?.plantingSeasons || [],
      plantingZones: plantingSite?.plantingZones,
      projectId: plantingSite?.projectId,
      timeZone: plantingSite?.timeZone,
    });
  }, [plantingSite, setRecord, selectedOrganization]);

  const goToPlantingSite = useCallback(
    (id?: number) => {
      const plantingSitesLocation = {
        pathname: APP_PATHS.PLANTING_SITES + (id && id !== -1 ? `/${id}` : ''),
      };
      navigate(plantingSitesLocation);
    },
    [navigate]
  );

  const onSave = () =>
    new Promise((resolve) => {
      setOnValidate(() => async (hasErrors: boolean) => {
        if (hasErrors) {
          setOnValidate(undefined);
          resolve(false);
          return;
        }
        const saved = await savePlantingSite();
        if (!saved) {
          setOnValidate(undefined);
          resolve(false);
        }
      });
    });

  const savePlantingSite = async (): Promise<boolean> => {
    let response;
    let id = record.id;
    if (record.id === -1) {
      const newPlantingSite: PlantingSitePostRequestBody = {
        boundary: record.boundary,
        description: record.description,
        name: record.name,
        organizationId: record.organizationId,
        plantingSeasons,
        projectId: record.projectId,
        timeZone: record.timeZone,
      };
      // TODO use redux here
      response = await TrackingService.createPlantingSite(newPlantingSite);
      id = response.data?.id || -1;
    } else {
      const updatedPlantingSite: PlantingSitePutRequestBody = {
        boundary: record.boundary,
        description: record.description,
        name: record.name,
        plantingSeasons,
        projectId: record.projectId,
        timeZone: record.timeZone,
      };
      // TODO use redux here
      response = await TrackingService.updatePlantingSite(record.id, updatedPlantingSite);
    }

    if (response.requestSucceeded) {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      reloadPlantingSites();
      goToPlantingSite(id);
      return true;
    } else {
      snackbar.toastError();
      return false;
    }
  };

  return (
    <TfMain>
      <PageForm
        cancelID='cancelCreatePlantingSite'
        saveID='saveCreatePlantingSite'
        onCancel={() => goToPlantingSite(record.id)}
        onSave={() => void onSave()}
        style={{
          display: 'flex',
          flexGrow: 1,
        }}
      >
        <Container maxWidth={false} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, paddingRight: 0 }}>
          {!isLoading && plantingSite && (
            <>
              <Grid spacing={3} flexGrow={0} display='flex' flexDirection='column' marginTop={theme.spacing(3)}>
                <Box
                  paddingLeft={theme.spacing(3)}
                  marginBottom={theme.spacing(4)}
                  display='flex'
                  flexDirection='column'
                >
                  <Typography fontSize={plantingSite ? '20px' : '24px'} fontWeight={600} margin={theme.spacing(1, 0)}>
                    {record.id !== -1 && plantingSite ? plantingSite.name : strings.ADD_PLANTING_SITE}
                  </Typography>
                </Box>
                <PageSnackbar />
                <Card flushMobile style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <DetailsInputForm<PlantingSite>
                    onChange={onChange}
                    onValidate={onValidate}
                    plantingSeasons={plantingSeasons}
                    record={record}
                    setPlantingSeasons={setPlantingSeasons}
                    setRecord={setRecord}
                  />
                </Card>
              </Grid>
            </>
          )}
        </Container>
      </PageForm>
    </TfMain>
  );
}
