import { Grid, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { Facility } from 'src/api/types/facilities';
import Button from '../common/button/Button';
import Select from '../common/Select/Select';
import DialogBox from '../common/DialogBox/DialogBox';
import { getAllSeedBanks } from 'src/utils/organization';

const useStyles = makeStyles((theme: Theme) => ({
  spacing: {
    marginRight: theme.spacing(2),
  },
  mainGrid: {
    textAlign: 'left',
    marginTop: Number(theme.spacing(2)) / 2,
  },
}));

export type SelectSeedBankProps = {
  open: boolean;
  onClose: (facility?: Facility) => void;
  organization: ServerOrganization;
};

export default function SelectSeedBankModal(props: SelectSeedBankProps): JSX.Element {
  const classes = useStyles();
  const { open, onClose, organization } = props;
  const [selectedFacility, setSelectedFacility] = useState<Facility | undefined>();

  const availableFacilities = getAllSeedBanks(organization) || [];

  const onChange = (facilityName: string) => {
    setSelectedFacility(availableFacilities.find((facility) => facility?.name === facilityName));
  };

  const onSelect = () => {
    onClose(selectedFacility);
  };

  const onCancel = () => {
    onClose();
  };

  return (
    <DialogBox
      onClose={onCancel}
      open={open}
      title={strings.SELECT_SEED_BANK}
      size={'medium'}
      middleButtons={[
        <Button
          onClick={onCancel}
          id='cancel-select-seed-bank'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          className={classes.spacing}
          key='button-1'
        />,
        <Button onClick={onSelect} id='select-seed-bank' label={strings.SELECT_BUTTON} key='button-2' />,
      ]}
      message={strings.SELECT_SEED_BANK_INFO}
    >
      <Grid container spacing={4} className={classes.mainGrid}>
        <Grid item xs={12}>
          <Select
            id='seedBank'
            selectedValue={selectedFacility?.name}
            onChange={onChange}
            options={availableFacilities
              .filter((facility) => !!facility)
              .map((facility) => facility!.name)
              .sort()}
            label={strings.SEED_BANK}
            aria-label={strings.SELECT_SEED_BANK}
            placeholder={strings.SELECT}
            allowEditingValue={true}
            fullWidth={true}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
