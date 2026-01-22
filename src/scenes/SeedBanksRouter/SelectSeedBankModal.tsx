import React, { type JSX, useState } from 'react';

import { Grid, useTheme } from '@mui/material';

import { useOrganization } from 'src/providers/hooks';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';
import { getAllSeedBanks } from 'src/utils/organization';

import DialogBox from '../../components/common/DialogBox/DialogBox';
import Select from '../../components/common/Select/Select';
import Button from '../../components/common/button/Button';

export type SelectSeedBankProps = {
  open: boolean;
  onClose: (facility?: Facility) => void;
};

export default function SelectSeedBankModal(props: SelectSeedBankProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { open, onClose } = props;
  const [selectedFacility, setSelectedFacility] = useState<Facility | undefined>();

  const availableFacilities = selectedOrganization ? getAllSeedBanks(selectedOrganization) : [];

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
          key='button-1'
          style={{ marginRight: theme.spacing(2) }}
        />,
        <Button onClick={onSelect} id='select-seed-bank' label={strings.SELECT_BUTTON} key='button-2' />,
      ]}
      message={strings.SELECT_SEED_BANK_INFO}
    >
      <Grid
        container
        spacing={4}
        sx={{
          textAlign: 'left',
          marginTop: Number(theme.spacing(2)) / 2,
        }}
      >
        <Grid item xs={12}>
          <Select
            id='seedBank'
            selectedValue={selectedFacility?.name}
            onChange={onChange}
            options={availableFacilities
              .filter((facility) => !!facility)
              .map((facility) => facility.name)
              .sort()}
            label={strings.SEED_BANK}
            aria-label={strings.SELECT_SEED_BANK}
            placeholder={strings.SELECT}
            fullWidth={true}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
