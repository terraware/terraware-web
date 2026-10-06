import React, { type JSX, useCallback, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useProjects } from 'src/hooks/useProjects';
import { useOrganization } from 'src/providers';
import {
  PlantingSitePayload,
  UpdatePlantingSiteRequestPayload,
  useUpdatePlantingSiteMutation,
} from 'src/queries/generated/plantingSites';
import DetailsInputForm from 'src/scenes/PlantingSitesRouter/edit/DetailsInputForm';
import strings from 'src/strings';
import { isAdmin } from 'src/utils/organization';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';

import DetailField from './DetailField';

const toRecord = (plantingSite: PlantingSitePayload): UpdatePlantingSiteRequestPayload => ({
  description: plantingSite.description,
  name: plantingSite.name,
  projectId: plantingSite.projectId,
  survivalRateIncludesTempPlots: plantingSite.survivalRateIncludesTempPlots,
  timeZone: plantingSite.timeZone,
});

export type PlantingSiteDetailsCardProps = {
  plantingSite: PlantingSitePayload;
};

export default function PlantingSiteDetailsCard({ plantingSite }: PlantingSiteDetailsCardProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();
  const snackbar = useSnackbar();
  const tz = useLocationTimeZone().get(plantingSite);
  const { selectedProject } = useProjects(plantingSite);
  const [updatePlantingSite, { isLoading: isSaving }] = useUpdatePlantingSiteMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [onValidate, setOnValidate] = useState<((hasErrors: boolean) => void) | undefined>();
  const [record, setRecord, onChange] = useForm<UpdatePlantingSiteRequestPayload>(toRecord(plantingSite));

  const onEdit = useCallback(() => {
    setRecord(toRecord(plantingSite));
    setIsEditing(true);
  }, [plantingSite, setRecord]);

  const onCancel = useCallback(() => setIsEditing(false), []);

  const onSave = useCallback(() => {
    setOnValidate(() => (hasErrors: boolean) => {
      setOnValidate(undefined);
      if (hasErrors) {
        return;
      }

      const save = async () => {
        try {
          await updatePlantingSite({ id: plantingSite.id, updatePlantingSiteRequestPayload: record }).unwrap();
          snackbar.toastSuccess(strings.CHANGES_SAVED);
          setIsEditing(false);
        } catch {
          snackbar.toastError(strings.GENERIC_ERROR);
        }
      };

      void save();
    });
  }, [plantingSite.id, record, snackbar, updatePlantingSite]);

  const actions = isEditing ? (
    <Box display='flex' gap={theme.spacing(1.5)}>
      <Button
        disabled={isSaving}
        id='cancel-edit-site-details'
        label={strings.CANCEL}
        onClick={onCancel}
        priority='secondary'
        size='medium'
        type='passive'
      />
      <Button disabled={isSaving} id='save-site-details' label={strings.SAVE} onClick={onSave} size='medium' />
    </Box>
  ) : (
    <Button
      icon='iconEdit'
      id='edit-site-details'
      label={strings.EDIT_DETAILS}
      onClick={onEdit}
      priority='secondary'
      size='medium'
      type='passive'
    />
  );

  return (
    <Card
      busy={isSaving}
      flushMobile
      radius={theme.spacing(2)}
      rightComponent={isAdmin(selectedOrganization) ? actions : undefined}
      title={strings.DETAILS}
    >
      <Box marginTop={theme.spacing(2)}>
        {isEditing ? (
          <DetailsInputForm
            onChange={onChange}
            onValidate={onValidate}
            plantingSiteId={plantingSite.id}
            record={record}
            setRecord={setRecord}
          />
        ) : (
          <>
            <Box
              display='grid'
              gridTemplateColumns={isMobile ? '1fr' : 'repeat(4, minmax(0, 1fr))'}
              columnGap={theme.spacing(4)}
              rowGap={theme.spacing(3)}
            >
              <DetailField label={strings.NAME} value={plantingSite.name} />
              <DetailField label={strings.DESCRIPTION} value={plantingSite.description} />
              <DetailField label={strings.TIME_ZONE} value={tz.longName} />
              <DetailField label={strings.PROJECT} value={selectedProject?.name} />
            </Box>
            <Box marginTop={theme.spacing(3)}>
              <Link fontSize='16px' to={`${APP_PATHS.PLANTING_SEASONS}?plantingSiteId=${plantingSite.id}`}>
                {strings.MANAGE_PLANTING_SEASONS}
              </Link>
            </Box>
          </>
        )}
      </Box>
    </Card>
  );
}
