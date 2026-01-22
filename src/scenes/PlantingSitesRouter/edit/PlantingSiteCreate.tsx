import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Container, Grid, Typography, useTheme } from '@mui/material';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useOrganization } from 'src/providers/hooks';
import {
  CreatePlantingSiteApiArg,
  UpdatePlantingSiteApiArg,
  useCreatePlantingSiteMutation,
  useLazyGetPlantingSiteQuery,
  useUpdatePlantingSiteMutation,
} from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import { PlantingSite, UpdatedPlantingSeason } from 'src/types/Tracking';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

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

  const [create, createResult] = useCreatePlantingSiteMutation();
  const [update, updateResult] = useUpdatePlantingSiteMutation();
  const [getPlantingSite, { data: plantingSiteData, isLoading }] = useLazyGetPlantingSiteQuery();

  useEffect(() => {
    if (plantingSiteId && plantingSiteId > 0) {
      void getPlantingSite(plantingSiteId);
    }
  }, [getPlantingSite, plantingSiteId]);

  const plantingSite = useMemo(() => plantingSiteData?.site, [plantingSiteData?.site]);

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
        ...plantingSite,
        adHocPlots: plantingSite?.adHocPlots || [],
        id: plantingSite?.id || -1,
        name: plantingSite?.name || '',
        organizationId: selectedOrganization?.id || -1,
        plantingSeasons: plantingSite?.plantingSeasons || [],
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
        const payload: CreatePlantingSiteApiArg = {
          boundary: record.boundary,
          description: record.description,
          name: record.name,
          organizationId: record.organizationId,
          plantingSeasons,
          projectId: record.projectId,
          timeZone: record.timeZone,
        };
        void create(payload);
      } else {
        const payload: UpdatePlantingSiteApiArg = {
          id: record.id,
          updatePlantingSiteRequestPayload: {
            ...record,
            plantingSeasons,
          },
        };
        void update(payload);
      }
    }
  }, [create, hasErrors, plantingSeasons, record, update]);

  useEffect(() => {
    if (updateResult) {
      if (updateResult.isSuccess) {
        snackbar.toastSuccess(strings.CHANGES_SAVED);
        goBack();
      }
    }
  }, [goBack, plantingSiteId, snackbar, updateResult]);

  useEffect(() => {
    if (createResult) {
      if (createResult.isSuccess) {
        snackbar.toastSuccess(strings.PLANTING_SITE_CREATED);
        if (createResult.data) {
          goToPlantingSiteView(createResult.data.id);
        } else {
          goBack();
        }
      }
    }
  }, [createResult, goBack, goToPlantingSiteView, snackbar, updateResult]);

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
