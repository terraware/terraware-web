import React, { type JSX, useState } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import useUpdateAcceleratorProjectSpecies from 'src/hooks/useUpdateAcceleratorProjectSpecies';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import {
  SpeciesForAcceleratorProject,
  SpeciesNativeCategory,
  getSpeciesNativeCategoryOptions,
} from 'src/types/AcceleratorProjectSpecies';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import Link from '../common/Link';

export interface EditSpeciesModalProps {
  onClose: () => void;
  projectSpecies: SpeciesForAcceleratorProject;
}

export default function EditSpeciesModal(props: EditSpeciesModalProps): JSX.Element {
  const { onClose, projectSpecies } = props;
  const theme = useTheme();
  const { update } = useUpdateAcceleratorProjectSpecies();
  const snackbar = useSnackbar();

  const [error, setError] = useState('');
  const [record, setRecord] = useForm<SpeciesForAcceleratorProject>(projectSpecies);
  const { activeLocale } = useLocalization();

  const save = () => {
    if (!record.participantProjectSpecies.rationale || !record?.participantProjectSpecies.speciesNativeCategory) {
      setError(strings.REQUIRED_FIELD);
      return;
    }

    void update(record.participantProjectSpecies)
      .then(onClose)
      .catch(() => snackbar.toastError());
  };

  const onChangeRationale = (rationale: unknown) => {
    setRecord((prev) => {
      const previousAcceleratorProjectSpecies = { ...prev.participantProjectSpecies };
      previousAcceleratorProjectSpecies.rationale = rationale as string;
      return {
        ...prev,
        participantProjectSpecies: previousAcceleratorProjectSpecies,
      };
    });
  };

  const onChangeNativeCategory = (value: unknown) => {
    setRecord((prev) => {
      const previousAcceleratorProjectSpecies = { ...prev.participantProjectSpecies };
      previousAcceleratorProjectSpecies.speciesNativeCategory = value as SpeciesNativeCategory;
      return {
        ...prev,
        participantProjectSpecies: previousAcceleratorProjectSpecies,
      };
    });
  };

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.SPECIES_USAGE}
      size='large'
      middleButtons={[
        <Button
          id='cancel'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button id='save' onClick={save} label={strings.SAVE} key='button-2' />,
      ]}
    >
      <Grid container textAlign={'left'}>
        <Grid item xs={12}>
          <Typography sx={{ fontSize: '14px', color: theme.palette.TwClrBaseGray600, marginBottom: 1.5 }}>
            {strings.SCIENTIFIC_NAME}
          </Typography>
          <Link
            fontSize='16px'
            to={APP_PATHS.SPECIES_DETAILS.replace(':speciesId', projectSpecies.species.id.toString())}
          >
            {projectSpecies.species.scientificName}
          </Link>
        </Grid>
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          <Dropdown
            id='speciesNativeCategory'
            selectedValue={record?.participantProjectSpecies.speciesNativeCategory}
            onChange={(value) => onChangeNativeCategory(value)}
            options={getSpeciesNativeCategoryOptions(activeLocale)}
            label={strings.NATIVE_NON_NATIVE}
            aria-label={strings.NATIVE_NON_NATIVE}
            placeholder={strings.SELECT}
            fixedMenu
            required
            fullWidth={true}
            errorText={error && !record?.participantProjectSpecies.speciesNativeCategory ? error : ''}
          />
        </Grid>
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          <TextField
            required
            id='rationale'
            label={strings.RATIONALE}
            type='textarea'
            value={record?.participantProjectSpecies.rationale}
            onChange={onChangeRationale}
            errorText={error && !record?.participantProjectSpecies.rationale ? error : ''}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
