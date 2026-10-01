import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button } from '@terraware/web-components';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import UnsavedChangesBadge from 'src/components/common/UnsavedChangesBadge';
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

  const isDirty =
    !!plantingSite &&
    (record.name !== plantingSite.name ||
      (record.description ?? '') !== (plantingSite.description ?? '') ||
      (record.timeZone ?? null) !== (plantingSite.timeZone ?? null) ||
      (record.projectId ?? null) !== (plantingSite.projectId ?? null));

  const title = (
    <Box
      alignItems='center'
      display='flex'
      flexWrap='wrap'
      gap={theme.spacing(1.5)}
      sx={{ paddingLeft: theme.spacing(3) }}
    >
      <Typography fontSize='24px' fontWeight={600}>
        {plantingSite?.name}
      </Typography>
      {isDirty && <UnsavedChangesBadge />}
    </Box>
  );
  const rightComponent = (
    <Box alignItems='center' display='flex' gap={theme.spacing(1)} justifyContent='flex-end'>
      <Button
        id='cancelCreatePlantingSite'
        label={strings.CANCEL}
        onClick={goBack}
        disabled={updateResult.isLoading}
        priority='secondary'
        type='passive'
        size='medium'
      />
      <Button
        id='saveCreatePlantingSite'
        label={strings.SAVE}
        onClick={savePlantingSite}
        disabled={!isDirty || updateResult.isLoading}
        size='medium'
      />
    </Box>
  );

  return (
    <Page
      title={title}
      rightComponent={rightComponent}
      stickyHeader
      stickyHeaderElevated={isDirty}
      isLoading={isLoading}
    >
      {updateResult.isLoading && <BusySpinner withSkrim={true} />}
      {plantingSite && (
        <Card flushMobile style={{ width: '100%' }}>
          <DetailsInputForm
            onChange={onChange}
            onValidate={setHasErrors}
            plantingSiteId={plantingSiteId}
            record={record}
            setRecord={setRecord}
          />
        </Card>
      )}
    </Page>
  );
}
