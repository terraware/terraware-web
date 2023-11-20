import { useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import { Button, DialogBox, Textfield } from '@terraware/web-components';
import { Accession } from 'src/types/Accession';
import AccessionService from 'src/services/AccessionService';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import {
  Accession2Address,
  Accession2GPS,
  CollectedReceivedDate2,
  Collectors2,
  Accession2PlantSiteDetails,
} from '../properties';
import SpeciesSelector from 'src/components/common/SpeciesSelector';
import useSnackbar from 'src/utils/useSnackbar';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';
import { getSeedBank } from 'src/utils/organization';
import { useOrganization } from 'src/providers';

export interface Accession2EditModalProps {
  open: boolean;
  accession: Accession;
  onClose: () => void;
  reload: () => void;
}

const MANDATORY_FIELDS = ['speciesId', 'collectedDate'] as const;

type MandatoryField = typeof MANDATORY_FIELDS[number];

export default function Accession2EditModal(props: Accession2EditModalProps): JSX.Element {
  const { onClose, open, accession, reload } = props;
  const [record, setRecord, onChange] = useForm(accession);
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const snackbar = useSnackbar();
  const { selectedOrganization } = useOrganization();
  const selectedSeedBank = getSeedBank(selectedOrganization, record.facilityId);
  const tz = useLocationTimeZone().get(selectedSeedBank);
  const timeZone = tz.id;
  const [collectedDateError, setCollectedDateError] = useState<string>();

  const onCollectedDateError = (error?: string) => {
    setCollectedDateError(error);
  };

  const hasErrors = () => {
    const missingRequiredField = MANDATORY_FIELDS.some((field: MandatoryField) => !record || !record[field]);
    return missingRequiredField || collectedDateError;
  };

  useEffect(() => {
    setRecord(accession);
  }, [accession, setRecord]);

  const saveAccession = async () => {
    if (record) {
      if (hasErrors()) {
        setValidateFields(true);
        return;
      }
      const response = await AccessionService.updateAccession(record);
      if (response.requestSucceeded && accession) {
        reload();
        onCloseHandler();
      } else {
        snackbar.toastError();
        onCloseHandler();
      }
    }
  };

  const onCloseHandler = () => {
    onClose();
  };

  return (
    <DialogBox
      onClose={onCloseHandler}
      open={open}
      title={strings.EDIT_ACCESSION_DETAIL}
      size='x-large'
      middleButtons={[
        <Button
          id='cancelEditAccession'
          label={strings.CANCEL}
          type='passive'
          onClick={onCloseHandler}
          priority='secondary'
          key='button-1'
        />,
        <Button id='saveEditAccession' onClick={saveAccession} label={strings.SAVE} key='button-2' />,
      ]}
      scrolled={true}
    >
      <Grid container item xs={12} spacing={2} textAlign='left'>
        <Grid item xs={12}>
          <Textfield
            id='accessionNumber'
            type='text'
            label={strings.ID}
            value={record?.accessionNumber}
            onChange={(value) => onChange('accessionNumber', value)}
            readonly={true}
            tooltipTitle={strings.TOOLTIP_ACCESSIONS_ID}
          />
        </Grid>
        <SpeciesSelector
          speciesId={record.speciesId}
          record={record}
          disabled={record.hasDeliveries}
          setRecord={setRecord}
          validate={validateFields}
          tooltipTitle={record.hasDeliveries ? strings.TOOLTIP_ACCESSIONS_HAS_DELIVERIES : undefined}
        />
        <CollectedReceivedDate2
          onChange={onChange}
          validate={validateFields}
          timeZone={timeZone}
          id='collectedDate'
          onDateError={onCollectedDateError}
          label={strings.COLLECTION_DATE_REQUIRED}
          maxDate={new Date()}
          dateError={collectedDateError}
          value={record.collectedDate}
        />
        <Grid item xs={12}>
          <Collectors2 onChange={onChange} collectors={record.collectors} />
        </Grid>
        <Grid item xs={12}>
          <Typography>{strings.SITE_DETAIL} </Typography>
        </Grid>
        <Grid item xs={12}>
          <Textfield
            id='collectionSiteName'
            type='text'
            label={strings.COLLECTING_SITE}
            value={record?.collectionSiteName}
            onChange={(value) => onChange('collectionSiteName', value)}
            tooltipTitle={strings.TOOLTIP_ACCESSIONS_ADD_COLLECTING_SITE}
          />
        </Grid>

        <Grid item xs={12}>
          <Textfield
            id='collectionSiteLandowner'
            type='text'
            label={strings.LANDOWNER}
            value={record?.collectionSiteLandowner}
            onChange={(value) => onChange('collectionSiteLandowner', value)}
          />
        </Grid>
        <Accession2Address record={record} onChange={onChange} opened={true} />
        <Grid item xs={12}>
          <Typography>{strings.GPS_COORDINATES} </Typography>
        </Grid>
        <Grid item xs={12}>
          <Accession2GPS record={record} onChange={onChange} opened={true} />
        </Grid>
        <Grid item xs={12}>
          <Typography>{strings.PLANT_DETAIL} </Typography>
        </Grid>
        <Accession2PlantSiteDetails record={record} onChange={onChange} opened={true} />
      </Grid>
    </DialogBox>
  );
}
