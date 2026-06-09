import React, { type JSX, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Grid } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import useAccession from 'src/hooks/useAccession';
import { useTrackModalAbandonment } from 'src/hooks/useTrackModalAbandonment';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { useUpdateAccessionMutation } from 'src/queries/generated/accessionsV2';
import { SubLocationService } from 'src/services';
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
  onClose: () => void;
}

export default function EditLocationModal({ open, onClose }: EditLocationModalProps): JSX.Element | null {
  const { accessionId } = useParams<{ accessionId: string }>();
  const { accession } = useAccession(Number(accessionId));

  if (!accession) {
    return null;
  }

  return <EditLocationModalForm accession={accession} open={open} onClose={onClose} />;
}

interface EditLocationModalFormProps {
  open: boolean;
  accession: Accession;
  onClose: () => void;
}

function EditLocationModalForm({ accession, open, onClose }: EditLocationModalFormProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();
  const seedBanks: Facility[] = selectedOrganization
    ? selectedOrganization
      ? getAllSeedBanks(selectedOrganization)
      : [].filter((sb) => !!sb)
    : [];
  const [subLocations, setSubLocations] = useState<SubLocation[]>([]);
  const snackbar = useSnackbar();
  const markSubmitted = useTrackModalAbandonment('accession_edit_location', open);
  const [updateAccession] = useUpdateAccessionMutation();

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
    const updatedAccession = { ...accession, facilityId: record.facilityId, subLocation: record.subLocation };
    try {
      await updateAccession({
        id: accession.id,
        updateAccessionRequestPayloadV2: updatedAccession,
      }).unwrap();
      markSubmitted();
      onClose();
    } catch {
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
