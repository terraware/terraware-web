import React, { type JSX, useCallback, useEffect } from 'react';
import { useParams } from 'react-router';

import { Box, Divider, Grid, Typography, useTheme } from '@mui/material';
import { Checkbox } from '@terraware/web-components';

import {
  indicatorCategoryLabel,
  indicatorClassLabel,
  indicatorFrequencyLabel,
  indicatorLevelLabel,
} from 'src/components/AcceleratorReports/utils';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import {
  ProjectAutoCalculatedIndicatorPayload,
  ProjectAutoCalculatedIndicatorSettingsPayload,
  useUpdateProjectAutoCalculatedIndicatorMutation,
} from 'src/queries/generated/indicators';
import { useGetProjectQuery } from 'src/queries/generated/projects';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

export interface EditAutoCalculatedIndicatorModalProps {
  onClose: () => void;
  autoCalculatedIndicator: ProjectAutoCalculatedIndicatorPayload;
}

export default function EditAutoCalculatedIndicatorModal({
  onClose,
  autoCalculatedIndicator,
}: EditAutoCalculatedIndicatorModalProps): JSX.Element {
  const { strings } = useLocalization();
  const theme = useTheme();
  const snackbar = useSnackbar();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const { data: projectResponse } = useGetProjectQuery(projectId);
  const projectName = projectResponse?.project.name ?? '';

  const [updateIndicator, updateIndicatorResponse] = useUpdateProjectAutoCalculatedIndicatorMutation();
  const [record, , , onChangeCallback] = useForm<ProjectAutoCalculatedIndicatorSettingsPayload>({
    active: autoCalculatedIndicator.active,
    isPublishable: autoCalculatedIndicator.isPublishable,
    notes: autoCalculatedIndicator.notes,
    refId: autoCalculatedIndicator.refId,
  });

  useEffect(() => {
    if (updateIndicatorResponse.isError) {
      snackbar.toastError();
    } else if (updateIndicatorResponse.isSuccess) {
      onClose();
      snackbar.toastSuccess(strings.INDICATOR_SAVED);
    }
  }, [updateIndicatorResponse, snackbar, onClose, strings.INDICATOR_SAVED]);

  const save = useCallback(() => {
    void updateIndicator({
      projectId,
      indicatorId: autoCalculatedIndicator.indicator,
      updateProjectAutoCalculatedIndicatorRequestPayload: {
        indicator: { ...record, refId: record.refId || undefined },
      },
    });
  }, [projectId, autoCalculatedIndicator.indicator, record, updateIndicator]);

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      scrolled
      size='x-large'
      title={strings.EDIT_INDICATOR}
      middleButtons={[
        <Button
          id='cancel'
          key='button-1'
          label={strings.CANCEL}
          onClick={onClose}
          priority='secondary'
          type='passive'
        />,
        <Button
          disabled={updateIndicatorResponse.isLoading}
          id='save'
          key='button-2'
          label={strings.SAVE}
          onClick={save}
        />,
      ]}
    >
      <Box
        borderRadius={theme.spacing(1)}
        marginBottom={theme.spacing(3)}
        padding={theme.spacing(3)}
        sx={{ backgroundColor: theme.palette.TwClrBgSecondary }}
        textAlign='left'
      >
        <Typography fontSize='20px' fontWeight={600}>
          {strings.PROJECT_LEVEL_FIELDS}
        </Typography>
        <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' paddingBottom={theme.spacing(2)}>
          {strings.formatString(strings.PROJECT_LEVEL_FIELDS_DESCRIPTION, <b>{projectName}</b>)}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <TextField
              id='refId'
              label={strings.REF_ID}
              onChange={onChangeCallback('refId')}
              type='text'
              value={record.refId}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              display
              id='primaryDataSource'
              label={strings.PRIMARY_DATA_SOURCE}
              type='text'
              value={autoCalculatedIndicator.primaryDataSource ?? strings.TW_DATA}
            />
          </Grid>
          <Grid size={6}>
            <Checkbox
              id='active'
              label={strings.ACTIVE}
              name='active'
              onChange={onChangeCallback('active')}
              value={record.active}
            />
          </Grid>
          <Grid size={6}>
            <Checkbox
              id='isPublishable'
              label={strings.PUBLISH_TO_FUNDER_PORTAL}
              name='isPublishable'
              onChange={onChangeCallback('isPublishable')}
              value={record.isPublishable}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              id='notes'
              label={strings.NOTES}
              onChange={onChangeCallback('notes')}
              type='textarea'
              value={record.notes}
            />
          </Grid>
        </Grid>
      </Box>

      <Box
        border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
        borderRadius={theme.spacing(1)}
        padding={theme.spacing(3)}
        textAlign='left'
      >
        <Typography fontSize='20px' fontWeight={600}>
          {strings.SHARED_FIELDS_ACROSS_ALL_PROJECTS}
        </Typography>
        <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' paddingBottom={theme.spacing(2)}>
          {strings.SHARED_FIELDS_CALCULATED_BY_TERRAWARE}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              display
              id='name'
              label={strings.INDICATOR_NAME}
              type='text'
              value={autoCalculatedIndicator.name}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              display
              id='description'
              label={strings.DEFINITION}
              preserveNewlines
              type='textarea'
              value={autoCalculatedIndicator.description}
            />
          </Grid>
          <Grid size={4}>
            <TextField display id='unit' label={strings.UNIT} type='text' value={autoCalculatedIndicator.unit} />
          </Grid>
          <Grid size={4}>
            <TextField
              display
              id='classId'
              label={strings.IS_CUMULATIVE}
              type='text'
              value={indicatorClassLabel(autoCalculatedIndicator.classId, strings)}
            />
          </Grid>
          <Grid size={4} alignContent='center'>
            <Checkbox
              disabled
              id='isDecimal'
              label={strings.IS_DECIMAL}
              name='isDecimal'
              onChange={() => undefined}
              value={autoCalculatedIndicator.precision === 2}
            />
          </Grid>
          <Grid size={12}>
            <Divider />
          </Grid>
          <Grid size={4}>
            <TextField
              display
              id='category'
              label={strings.CATEGORY}
              type='text'
              value={indicatorCategoryLabel(autoCalculatedIndicator.category, strings)}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              display
              id='level'
              label={strings.INDICATOR_LEVEL}
              type='text'
              value={indicatorLevelLabel(autoCalculatedIndicator.level, strings)}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              display
              id='frequency'
              label={strings.FREQUENCY_OF_REPORTING}
              type='text'
              value={indicatorFrequencyLabel(autoCalculatedIndicator.frequency, strings)}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              display
              id='tfOwner'
              label={strings.TF_OWNER_REVIEWER}
              type='text'
              value={autoCalculatedIndicator.tfOwner}
            />
          </Grid>
        </Grid>
      </Box>
    </DialogBox>
  );
}
