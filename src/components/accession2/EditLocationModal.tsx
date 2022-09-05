import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import Button from '../common/button/Button';
import DialogBox from '../common/DialogBox/DialogBox';
import 'react-multi-carousel/lib/styles.css';
import { Grid } from '@mui/material';
import { Facility } from 'src/api/types/facilities';
import theme from 'src/theme';
import { SelectT } from '@terraware/web-components';
import { getAllSeedBanks } from 'src/utils/organization';
import { ServerOrganization } from 'src/types/Organization';
import { Accession2 } from 'src/api/accessions2/accession';
import useForm from 'src/utils/useForm';
import { getLocations } from 'src/api/seeds/locations';
import { updateAccession2 } from 'src/api/accessions2/accession';

type AccessionState = Pick<Accession2, 'state'>;

export interface EditLocationDialogProps {
  open: boolean;
  accession?: Accession2;
  onClose: () => void;
  organization: ServerOrganization;
}

interface StorageLocationDetails {
  storageLocation: string;
  storageCondition: 'Refrigerator' | 'Freezer';
}

type AccessionLocation = Pick<Accession2, 'facilityId' | 'storageLocation'>;

export default function EditLocationDialog(props: EditLocationDialogProps): JSX.Element {
  const { onClose, open, accession, organization } = props;
  const seedBanks: Facility[] = (getAllSeedBanks(organization).filter((sb) => !!sb) as Facility[]) || [];
  const [storageLocations, setStorageLocations] = useState<StorageLocationDetails[]>([]);
  const [storageLocationSelected, setStorageLocationSelected] = useState<StorageLocationDetails>();

  const newRecord = {
    facilityId: 0,
    storageLocation: '',
  };
  const [record, setRecord, onChange] = useForm(newRecord);

  useEffect(() => {
    const setLocations = async () => {
      if (record.facilityId) {
        const response = await getLocations(record.facilityId);
        if (response) {
          setStorageLocations(response);
        } else {
          setStorageLocations([]);
        }
      }
    };
    setLocations();
  }, [record.facilityId]);

  const saveLocation = () => {
    if (accession) {
      updateAccession2({
        ...accession,
        ...record,
        storageCondition: storageLocationSelected?.storageCondition,
        storageLocation: storageLocationSelected?.storageLocation,
      });
      onClose();
    }
  };

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.LOCATION}
      size='large'
      middleButtons={[
        <Button label={strings.CANCEL} type='passive' onClick={onClose} priority='secondary' key='button-1' />,
        <Button onClick={saveLocation} label={strings.SAVE} key='button-2' />,
      ]}
    >
      <Grid item xs={12} textAlign='left'>
        <Grid item xs={12}>
          <SelectT<Facility>
            label={strings.LOCATION}
            placeholder={strings.SELECT}
            options={seedBanks}
            onChange={(value: Facility) => onChange('facilityId', value.id)}
            isEqual={(a: Facility, b: Facility) => a.id === b.id}
            renderOption={(facility: Facility) => facility.name}
            displayLabel={(facility: Facility) => facility?.name || ''}
            selectedValue={seedBanks.find((sb) => sb.id === record.facilityId)}
            toT={(name: string) => ({ name } as Facility)}
            fullWidth={true}
            readonly={true}
          />
        </Grid>
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          <SelectT<StorageLocationDetails>
            label={strings.SUB_LOCATION}
            placeholder={strings.SELECT}
            options={storageLocations}
            onChange={(value: StorageLocationDetails) => setStorageLocationSelected(value)}
            isEqual={(a: StorageLocationDetails, b: StorageLocationDetails) => a.storageLocation === b.storageLocation}
            renderOption={(details: StorageLocationDetails) => details.storageLocation}
            displayLabel={(details: StorageLocationDetails) => details?.storageLocation || ''}
            selectedValue={storageLocationSelected}
            toT={(name: string) => ({ storageLocation: name } as StorageLocationDetails)}
            fullWidth={true}
            readonly={true}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
