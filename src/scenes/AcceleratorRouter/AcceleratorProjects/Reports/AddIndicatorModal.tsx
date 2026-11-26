import React, { type JSX, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Divider, Grid, Typography, useTheme } from '@mui/material';
import { Checkbox, Dropdown, RadioButton } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import {
  NewIndicatorPayload,
  useCreateCommonDefinitionMutation,
  useCreateProjectSpecificIndicatorMutation,
} from 'src/queries/generated/indicators';
import { useGetProjectQuery } from 'src/queries/generated/projects';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import {
  classIdOptions,
  frequencyOptions,
  indicatorComponentOptions,
  indicatorTypeOptions,
} from './EditCommonIndicatorModal';

export interface AddIndicatorModalProps {
  onClose: () => void;
}

export default function AddIndicatorModal({ onClose }: AddIndicatorModalProps): JSX.Element {
  const { strings } = useLocalization();
  const theme = useTheme();
  const snackbar = useSnackbar();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const [validate, setValidate] = useState(false);
  const [isCommon, setIsCommon] = useState(false);

  const { data: projectResponse } = useGetProjectQuery(projectId);
  const projectName = projectResponse?.project.name ?? '';

  const [createCommonDefinition, createCommonResponse] = useCreateCommonDefinitionMutation();
  const [createProjectIndicator, createProjectResponse] = useCreateProjectSpecificIndicatorMutation();
  const isSaving = createCommonResponse.isLoading || createProjectResponse.isLoading;

  const [newIndicator, , , onChangeCallback] = useForm<NewIndicatorPayload>({
    active: true,
    category: 'Biodiversity',
    classId: 'Not Cumulative',
    isPublishable: false,
    level: 'Goal',
    name: '',
    precision: 0,
  });

  useEffect(() => {
    if (createCommonResponse.isError || createProjectResponse.isError) {
      snackbar.toastError();
    } else if (createCommonResponse.isSuccess || createProjectResponse.isSuccess) {
      onClose();
      snackbar.toastSuccess(strings.INDICATOR_SAVED);
    }
  }, [createCommonResponse, createProjectResponse, snackbar, onClose, strings.INDICATOR_SAVED]);

  const save = useCallback(() => {
    if (!newIndicator.name || !newIndicator.unit || (!isCommon && !newIndicator.refId)) {
      setValidate(true);
      return;
    }

    if (isCommon) {
      // A common indicator defines only the shared fields; each project gets its own settings row.
      const { category, classId, description, frequency, level, name, precision, tfOwner, unit } = newIndicator;
      void createCommonDefinition({
        indicator: { category, classId, description, frequency, level, name, precision, tfOwner, unit },
      });
      return;
    }

    void createProjectIndicator({
      projectId,
      createProjectIndicatorRequestPayload: { indicator: newIndicator },
    });
  }, [newIndicator, isCommon, createCommonDefinition, createProjectIndicator, projectId]);

  return (
    <DialogBox
      middleButtons={[
        <Button
          id='cancel'
          key='button-1'
          label={strings.CANCEL}
          onClick={onClose}
          priority='secondary'
          type='passive'
        />,
        <Button disabled={isSaving} id='save' key='button-2' label={strings.ADD_INDICATOR} onClick={save} />,
      ]}
      onClose={onClose}
      open={true}
      scrolled
      size='x-large'
      title={strings.ADD_INDICATOR}
    >
      <Box textAlign='left'>
        <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px'>
          {`${strings.INDICATOR_TYPE} *`}
        </Typography>
        <Grid container paddingBottom={theme.spacing(2)} paddingTop={theme.spacing(1)} spacing={2}>
          <Grid size={6}>
            <RadioButton
              id='projectSpecific'
              label={
                <>
                  <Typography>{strings.PROJECT_SPECIFIC}</Typography>
                  <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px'>
                    {strings.formatString(strings.ONLY_FOR_X, projectName)}
                  </Typography>
                </>
              }
              name='indicatorKind'
              onChange={() => setIsCommon(false)}
              value={!isCommon}
            />
          </Grid>
          <Grid size={6}>
            <RadioButton
              id='common'
              label={
                <>
                  <Typography>{strings.COMMON}</Typography>
                  <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px'>
                    {strings.ADDED_TO_ALL_PROJECTS}
                  </Typography>
                </>
              }
              name='indicatorKind'
              onChange={() => setIsCommon(true)}
              value={isCommon}
            />
          </Grid>
        </Grid>

        <Box
          border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
          borderRadius={theme.spacing(1)}
          padding={theme.spacing(3)}
        >
          {isCommon && (
            <Typography fontSize='20px' fontWeight={600} paddingBottom={theme.spacing(2)}>
              {strings.SHARED_FIELDS_ACROSS_ALL_PROJECTS}
            </Typography>
          )}
          <Grid container spacing={2}>
            <Grid size={isCommon ? 12 : 8}>
              <TextField
                errorText={validate && !newIndicator.name ? strings.REQUIRED_FIELD : ''}
                id='name'
                label={strings.INDICATOR_NAME}
                onChange={onChangeCallback('name')}
                required
                type='text'
                value={newIndicator.name}
              />
            </Grid>
            {!isCommon && (
              <Grid size={4}>
                <TextField
                  errorText={validate && !newIndicator.refId ? strings.REQUIRED_FIELD : ''}
                  id='refId'
                  label={strings.REF_ID}
                  onChange={onChangeCallback('refId')}
                  required
                  type='text'
                  value={newIndicator.refId}
                />
              </Grid>
            )}
            <Grid size={12}>
              <TextField
                id='description'
                label={strings.DEFINITION}
                onChange={onChangeCallback('description')}
                type='textarea'
                value={newIndicator.description}
              />
            </Grid>
            <Grid size={4}>
              <TextField
                errorText={validate && !newIndicator.unit ? strings.REQUIRED_FIELD : ''}
                id='unit'
                label={strings.UNIT}
                maxLength={25}
                onChange={onChangeCallback('unit')}
                required
                type='text'
                value={newIndicator.unit}
              />
            </Grid>
            <Grid size={4}>
              <Dropdown
                fullWidth
                id='classId'
                label={strings.IS_CUMULATIVE}
                onChange={onChangeCallback('classId')}
                options={classIdOptions()}
                required
                selectedValue={newIndicator.classId}
              />
            </Grid>
            <Grid size={4} alignContent='center'>
              <Checkbox
                id='isDecimal'
                label={strings.IS_DECIMAL}
                name='isDecimal'
                onChange={(value) => onChangeCallback('precision')(value ? 2 : 0)}
                value={newIndicator.precision === 2}
              />
            </Grid>
            {!isCommon && (
              <>
                <Grid size={4}>
                  <Checkbox
                    id='active'
                    label={strings.ACTIVE}
                    name='active'
                    onChange={onChangeCallback('active')}
                    value={newIndicator.active}
                  />
                </Grid>
                <Grid size={8}>
                  <Checkbox
                    id='isPublishable'
                    label={strings.PUBLISH_TO_FUNDER_PORTAL}
                    name='isPublishable'
                    onChange={onChangeCallback('isPublishable')}
                    value={newIndicator.isPublishable}
                  />
                </Grid>
              </>
            )}
            <Grid size={12}>
              <Divider />
            </Grid>
            <Grid size={4}>
              <Dropdown
                fullWidth
                id='category'
                label={strings.CATEGORY}
                onChange={onChangeCallback('category')}
                options={indicatorComponentOptions()}
                required
                selectedValue={newIndicator.category}
              />
            </Grid>
            <Grid size={4}>
              <Dropdown
                fullWidth
                id='level'
                label={strings.INDICATOR_LEVEL}
                onChange={onChangeCallback('level')}
                options={indicatorTypeOptions()}
                required
                selectedValue={newIndicator.level}
              />
            </Grid>
            <Grid size={4}>
              <Dropdown
                fullWidth
                id='frequency'
                label={strings.FREQUENCY_OF_REPORTING}
                onChange={onChangeCallback('frequency')}
                options={frequencyOptions()}
                selectedValue={newIndicator.frequency}
              />
            </Grid>
            {!isCommon && (
              <Grid size={4}>
                <TextField
                  id='primaryDataSource'
                  label={strings.PRIMARY_DATA_SOURCE}
                  onChange={onChangeCallback('primaryDataSource')}
                  type='text'
                  value={newIndicator.primaryDataSource}
                />
              </Grid>
            )}
            <Grid size={4}>
              <TextField
                id='tfOwner'
                label={strings.TF_OWNER_REVIEWER}
                onChange={onChangeCallback('tfOwner')}
                type='text'
                value={newIndicator.tfOwner}
              />
            </Grid>
            {!isCommon && (
              <Grid size={12}>
                <TextField
                  id='notes'
                  label={strings.NOTES}
                  onChange={onChangeCallback('notes')}
                  type='textarea'
                  value={newIndicator.notes}
                />
              </Grid>
            )}
          </Grid>
        </Box>

        {isCommon && (
          <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' paddingTop={theme.spacing(2)}>
            {strings.COMMON_INDICATOR_PROJECT_DEFAULTS_MESSAGE}
          </Typography>
        )}
      </Box>
    </DialogBox>
  );
}
