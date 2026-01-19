import React, { type JSX, useEffect, useState } from 'react';

import { Grid } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { SubLocationService } from 'src/services';
import AccessionService from 'src/services/AccessionService';
import strings from 'src/strings';
import theme from 'src/theme';
import { Accession } from 'src/types/Accession';
import { Facility, SubLocation } from 'src/types/Facility';
import { getAllSeedBanks } from 'src/utils/organization';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { FacilitySelector, SubLocationSelector } from '../properties';

export interface EditLocationModalProps {
  open: boolean;
  accession: Accession;
  onClose: () => void;
  reload: () => void;
}

export default function EditLocationModal(props: EditLocationModalProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();
  const { onClose, open, accession, reload } = props;
  const seedBanks: Facility[] = selectedOrganization
    ? selectedOrganization
      ? getAllSeedBanks(selectedOrganization)
      : [].filter((sb) => !!sb)
    : [];
  const [subLocations, setSubLocations] = useState<SubLocation[]>([]);
  const snackbar = useSnackbar();

  const newRecord = {
    facilityId: accession.facilityId || 0,
    subLocation: accession.subLocation,
  };

  const [record, setRecord, , onChangeCallback] = useForm(newRecord);

  useEffect(() => {
    setRecord({ facilityId: accession.facilityId || 0, subLocation: accession.subLocation });
  }, [accession, setRecord]);

  useEffect(() => {
    const setLocations = async () => {
      if (record.facilityId && activeLocale) {
        const response = await SubLocationService.getSubLocations(record.facilityId);
        if (response.requestSucceeded) {
          const collator = new Intl.Collator(activeLocale);
          setSubLocations(response.subLocations.sort((a, b) => collator.compare(a.name, b.name)));
        } else {
          setSubLocations([]);
        }
      }
    };
    void setLocations();
  }, [activeLocale, record.facilityId]);

  const saveLocation = async () => {
    const response = await AccessionService.updateAccession({
      ...accession,
      ...record,
    });
    if (response.requestSucceeded) {
      reload();
      onClose();
    } else {
      snackbar.toastError();
    }
  };

  const onChangeHandler = (value: Facility) => {
    setRecord({ facilityId: value.id, subLocation: undefined });
  };

  const onCloseHandler = () => {
    setRecord({ facilityId: accession.facilityId, subLocation: accession.subLocation });
    onClose();
  };

  return (
    <DialogBox
      onClose={onCloseHandler}
      open={open}
      title={strings.EDIT_LOCATION}
      size='large'
      middleButtons={[
        <Button
          id='cancelEditLocation'
          label={strings.CANCEL}
          type='passive'
          onClick={onCloseHandler}
          priority='secondary'
          key='button-1'
        />,
        <Button id='saveEditLocation' onClick={() => void saveLocation()} label={strings.SAVE} key='button-2' />,
      ]}
    >
      <Grid item xs={12} textAlign='left'>
        <Grid item xs={12}>
          <FacilitySelector
            id='edit-location'
            label={strings.LOCATION}
            selectedFacility={seedBanks.find((sb) => sb.id === record.facilityId)}
            facilities={seedBanks}
            onChange={(value: Facility) => onChangeHandler(value)}
          />
        </Grid>
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          <SubLocationSelector
            id='edit-sub-location'
            label={strings.SUB_LOCATION}
            selectedSubLocation={record.subLocation}
            subLocations={subLocations.map((obj) => obj.name)}
            onChange={onChangeCallback('subLocation')}
            disabled={!record.facilityId}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
