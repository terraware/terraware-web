import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import Button from '../common/button/Button';
import DialogBox from '../common/DialogBox/DialogBox';
import { Grid } from '@mui/material';
import { Facility, StorageLocationDetails } from 'src/api/types/facilities';
import theme from 'src/theme';
import { getAllSeedBanks } from 'src/utils/organization';
import { ServerOrganization } from 'src/types/Organization';
import { Accession2 } from 'src/api/accessions2/accession';
import useForm from 'src/utils/useForm';
import { getLocations } from 'src/api/seeds/locations';
import { updateAccession2 } from 'src/api/accessions2/accession';
import StorageLocationSelector from './StorageLocationSelector';
import StorageSubLocationSelector from './StorageSubLocationSelector';

export interface EditLocationDialogProps {
  open: boolean;
  accession: Accession2;
  onClose: () => void;
  organization: ServerOrganization;
  reload: () => void;
}

export default function EditLocationDialog(props: EditLocationDialogProps): JSX.Element {
  const { onClose, open, accession, organization, reload } = props;
  const seedBanks: Facility[] = (getAllSeedBanks(organization).filter((sb) => !!sb) as Facility[]) || [];
  const [storageLocations, setStorageLocations] = useState<StorageLocationDetails[]>([]);

  const newRecord = {
    facilityId: accession.facilityId || 0,
    storageLocation: accession.storageLocation,
  };

  const [record, setRecord, onChange] = useForm(newRecord);

  useEffect(() => {
    setRecord({ facilityId: accession.facilityId || 0, storageLocation: accession.storageLocation });
  }, [accession, setRecord]);

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

  const saveLocation = async () => {
    const response = await updateAccession2({
      ...accession,
      ...record,
    });
    if (response.requestSucceeded) {
      reload();
    }
    onClose();
  };

  const onChangeHandler = (value: Facility) => {
    setRecord({ facilityId: value.id, storageLocation: '' });
  };

  const onCloseHandler = () => {
    setRecord({ facilityId: accession.facilityId, storageLocation: accession.storageLocation });
    onClose();
  };

  return (
    <DialogBox
      onClose={onCloseHandler}
      open={open}
      title={strings.LOCATION}
      size='large'
      middleButtons={[
        <Button label={strings.CANCEL} type='passive' onClick={onCloseHandler} priority='secondary' key='button-1' />,
        <Button onClick={saveLocation} label={strings.SAVE} key='button-2' />,
      ]}
    >
      <Grid item xs={12} textAlign='left'>
        <Grid item xs={12}>
          <StorageLocationSelector
            label={strings.LOCATION}
            selectedStorageLocation={seedBanks.find((sb) => sb.id === record.facilityId)}
            storageLocations={seedBanks}
            onChange={(value: Facility) => onChangeHandler(value)}
            readonly={true}
          />
        </Grid>
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          <StorageSubLocationSelector
            label={strings.SUB_LOCATION}
            selectedStorageSubLocation={record.storageLocation}
            storageSubLocations={storageLocations.map((obj) => obj.storageLocation)}
            onChange={(value: string) => onChange('storageLocation', value)}
            readonly={false}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
