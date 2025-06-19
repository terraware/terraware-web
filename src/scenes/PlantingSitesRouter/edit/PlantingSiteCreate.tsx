import React, { useCallback, useEffect, useState } from 'react';

import { Box, Container, Grid, Typography, useTheme } from '@mui/material';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { useOrganization } from 'src/providers/hooks';
import { PlantingSitePostRequestBody, PlantingSitePutRequestBody } from 'src/services/TrackingService';
import strings from 'src/strings';
import { PlantingSite, UpdatedPlantingSeason } from 'src/types/Tracking';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import usePlantingSiteCreate from '../hooks/usePlantingSiteCreate';
import usePlantingSiteUpdate from '../hooks/usePlantingSiteUpdate';
import DetailsInputForm from './DetailsInputForm';

type CreatePlantingSiteProps = {
  plantingSiteId?: number;
};

export default function CreatePlantingSite({ plantingSiteId }: CreatePlantingSiteProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { goToPlantingSiteView } = useNavigateTo();
  const snackbar = useSnackbar();
  const [plantingSeasons, setPlantingSeasons] = useState<UpdatedPlantingSeason[]>();

  const [hasErrors, setHasErrors] = useState<boolean>();
  const { create, result: createResult } = usePlantingSiteCreate();
  const { update, result: updateResult } = usePlantingSiteUpdate();

  const { isLoading, reload, setSelectedPlantingSite, plantingSite } = usePlantingSiteData();

  const defaultPlantingSite = (): PlantingSite => ({
    id: plantingSiteId ?? -1,
    adHocPlots: [],
    name: '',
    organizationId: selectedOrganization?.id || -1,
    plantingSeasons: [],
  });

  const [record, setRecord, onChange] = useForm<PlantingSite>(defaultPlantingSite());

  useEffect(() => {
    if (plantingSiteId) {
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
    }
  }, [plantingSite, plantingSiteId, setRecord, selectedOrganization]);

  const goBack = useCallback(() => {
    if (plantingSiteId) {
      goToPlantingSiteView(plantingSiteId);
    }
  }, [goToPlantingSiteView, plantingSiteId]);

  const savePlantingSite = useCallback(() => {
    if (!hasErrors) {
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
        create(newPlantingSite);
      } else {
        const updatedPlantingSite: PlantingSitePutRequestBody = {
          boundary: record.boundary,
          description: record.description,
          name: record.name,
          plantingSeasons,
          projectId: record.projectId,
          timeZone: record.timeZone,
        };
        update(record.id, updatedPlantingSite);
      }
    }
  }, [create, hasErrors, plantingSeasons, record, update]);

  useEffect(() => {
    if (updateResult) {
      if (updateResult.status === 'success' && updateResult.data) {
        reload();
        snackbar.toastSuccess(strings.CHANGES_SAVED);
        goBack();
      }
    }
  }, [goBack, plantingSiteId, reload, setSelectedPlantingSite, snackbar, updateResult]);

  useEffect(() => {
    if (createResult) {
      if (createResult.status === 'success') {
        reload();
        snackbar.toastSuccess(strings.PLANTING_SITE_CREATED);
        if (createResult.data) {
          goToPlantingSiteView(createResult.data);
        } else {
          goBack();
        }
      }
    }
  }, [createResult, goBack, goToPlantingSiteView, reload, snackbar, updateResult]);

  return (
    <TfMain>
      <PageForm
        cancelID='cancelCreatePlantingSite'
        saveID='saveCreatePlantingSite'
        onCancel={goBack}
        onSave={savePlantingSite}
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
                    onValidate={setHasErrors}
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
