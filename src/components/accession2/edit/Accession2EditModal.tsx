import { useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import { Button, DialogBox, Textfield } from '@terraware/web-components';
import { Accession2, updateAccession2 } from 'src/api/accessions2/accession';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import useForm from 'src/utils/useForm';
import {
  Accession2Address,
  Accession2GPS,
  CollectedReceivedDate2,
  Collectors2,
  Species2Dropdown,
  Accession2PlantSiteDetails,
} from '../properties';
import useSnackbar from 'src/utils/useSnackbar';

export interface Accession2EditModalProps {
  open: boolean;
  accession: Accession2;
  onClose: () => void;
  organization: ServerOrganization;
  reload: () => void;
}

const MANDATORY_FIELDS = ['speciesId', 'collectedDate'] as const;

type MandatoryField = typeof MANDATORY_FIELDS[number];

export default function Accession2EditModal(props: Accession2EditModalProps): JSX.Element {
  const { onClose, open, accession, organization, reload } = props;
  const [record, setRecord, onChange] = useForm(accession);
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const snackbar = useSnackbar();

  const hasErrors = () => {
    const missingRequiredField = MANDATORY_FIELDS.some((field: MandatoryField) => !record || !record[field]);
    return missingRequiredField;
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
      const response = await updateAccession2(record);
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
      title={strings.ACCESSION_DETAIL}
      size='x-large'
      middleButtons={[
        <Button label={strings.CANCEL} type='passive' onClick={onCloseHandler} priority='secondary' key='button-1' />,
        <Button onClick={saveAccession} label={strings.SAVE} key='button-2' />,
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
            onChange={onChange}
            readonly={true}
          />
        </Grid>
        <Species2Dropdown
          speciesId={record.speciesId}
          record={record}
          organization={organization}
          setRecord={setRecord}
          validate={validateFields}
        />
        <CollectedReceivedDate2 record={record} onChange={onChange} type='collected' validate={validateFields} />
        <Grid item xs={12}>
          <Collectors2
            organizationId={organization.id}
            id='collectors'
            onChange={onChange}
            collectors={record.collectors}
          />
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
            onChange={onChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Textfield
            id='collectionSiteLandowner'
            type='text'
            label={strings.LANDOWNER}
            value={record?.collectionSiteLandowner}
            onChange={onChange}
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
