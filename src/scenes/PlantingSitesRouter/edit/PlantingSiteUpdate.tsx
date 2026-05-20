import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Container, Grid, Typography, useTheme } from '@mui/material';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import {
  UpdatePlantingSiteRequestPayload,
  useGetPlantingSiteQuery,
  useUpdatePlantingSiteMutation,
} from 'src/queries/generated/plantingSites';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import DetailsInputForm from './DetailsInputForm';

type UpdatePlantingSiteProps = {
  plantingSiteId: number;
};

export default function UpdatePlantingSite({ plantingSiteId }: UpdatePlantingSiteProps): JSX.Element {
  const theme = useTheme();
  const { strings } = useLocalization();
  const snackbar = useSnackbar();

  const { goToPlantingSiteView } = useNavigateTo();
  const [hasErrors, setHasErrors] = useState<boolean>();

  const [update, updateResult] = useUpdatePlantingSiteMutation();
  const { currentData: plantingSiteData, isLoading } = useGetPlantingSiteQuery({ id: plantingSiteId });
  const [record, setRecord, onChange] = useForm<UpdatePlantingSiteRequestPayload>({
    name: '',
  });

  const plantingSite = useMemo(() => plantingSiteData?.site, [plantingSiteData?.site]);

  useEffect(() => {
    if (plantingSite) {
      setRecord({
        description: plantingSite.description,
        name: plantingSite.name,
        plantingSeasons: plantingSite.plantingSeasons,
        projectId: plantingSite.projectId,
        survivalRateIncludesTempPlots: plantingSite.survivalRateIncludesTempPlots,
        timeZone: plantingSite.timeZone,
      });
    }
  }, [plantingSite, plantingSiteId, setRecord]);

  const goBack = useCallback(() => {
    if (plantingSiteId) {
      goToPlantingSiteView(plantingSiteId);
    }
  }, [goToPlantingSiteView, plantingSiteId]);

  const savePlantingSite = useCallback(() => {
    if (!hasErrors) {
      void update({ id: plantingSiteId, updatePlantingSiteRequestPayload: record });
    }
  }, [hasErrors, plantingSiteId, record, update]);

  useEffect(() => {
    if (updateResult) {
      if (updateResult.isSuccess) {
        snackbar.toastSuccess(strings.CHANGES_SAVED);
        goBack();
      }
    }
  }, [goBack, plantingSiteId, snackbar, strings.CHANGES_SAVED, updateResult]);

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
                  marginBottom={theme.spacing(2)}
                  display='flex'
                  flexDirection='column'
                >
                  <Typography fontSize={plantingSite ? '20px' : '24px'} fontWeight={600} margin={theme.spacing(1, 0)}>
                    {plantingSite?.name}
                  </Typography>
                </Box>
                <PageSnackbar />
                <Card flushMobile style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <DetailsInputForm
                    onChange={onChange}
                    onValidate={setHasErrors}
                    plantingSiteId={plantingSiteId}
                    record={record}
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
