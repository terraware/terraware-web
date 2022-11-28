import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { ServerOrganization } from 'src/types/Organization';
import useForm from 'src/utils/useForm';
import { Container, Grid, Typography, useTheme } from '@mui/material';
import { AccessionPostRequestBody, postAccession } from 'src/api/accessions2/accession';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import {
  Accession2Address,
  Accession2GPS,
  Accession2PlantSiteDetails,
  CollectedReceivedDate2,
  Collectors2,
  SeedBank2Selector,
  Species2Dropdown,
} from '../properties';
import Textfield from 'src/components/common/Textfield/Textfield';
import FormBottomBar from 'src/components/common/FormBottomBar';
import Select from 'src/components/common/Select/Select';
import { ACCESSION_2_CREATE_STATES } from 'src/types/Accession';
import { getTodaysDateFormatted } from '@terraware/web-components/utils';
import useSnackbar from 'src/utils/useSnackbar';
import TfMain from 'src/components/common/TfMain';

type CreateAccessionProps = {
  organization: ServerOrganization;
};

const SubTitleStyle = {
  fontSize: '20px',
  fontWeight: 600,
};

const defaultAccession = (): AccessionPostRequestBody =>
  ({
    state: 'Awaiting Check-In',
    receivedDate: getTodaysDateFormatted(),
  } as AccessionPostRequestBody);

const MANDATORY_FIELDS = ['speciesId', 'collectedDate', 'receivedDate', 'state', 'facilityId'] as const;

type MandatoryField = typeof MANDATORY_FIELDS[number];

export default function CreateAccession(props: CreateAccessionProps): JSX.Element {
  const { organization } = props;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const history = useHistory();
  const snackbar = useSnackbar();
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const [record, setRecord, onChange] = useForm<AccessionPostRequestBody>(defaultAccession());

  const accessionsDatabase = {
    pathname: APP_PATHS.ACCESSIONS,
  };

  const marginTop = {
    marginTop: theme.spacing(2),
  };

  const goToAccessions = () => {
    history.push(accessionsDatabase);
  };

  const hasErrors = () => {
    const missingRequiredField = MANDATORY_FIELDS.some((field: MandatoryField) => !record[field]);
    return missingRequiredField;
  };

  const saveAccession = async () => {
    if (hasErrors()) {
      setValidateFields(true);
      return;
    }
    const response = await postAccession(record);
    if (response.requestSucceeded) {
      history.replace(accessionsDatabase);
      history.push({
        pathname: APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', response.id.toString()),
      });
    } else {
      snackbar.toastError(response.error);
    }
  };

  const gridSize = () => (isMobile ? 12 : 6);

  return (
    <TfMain>
      <Typography variant='h2' sx={{ fontSize: '24px', fontWeight: 600, marginBottom: theme.spacing(4) }}>
        {strings.ADD_AN_ACCESSION}
      </Typography>
      <Container
        maxWidth={false}
        sx={{
          margin: '0 auto',
          width: isMobile ? '100%' : '640px',
          backgroundColor: theme.palette.TwClrBg,
          borderRadius: '32px',
          padding: theme.spacing(3),
          marginBottom: isMobile ? theme.spacing(32) : theme.spacing(25),
        }}
      >
        <Grid container>
          <Grid item xs={12} display='flex' flexDirection='column'>
            <Typography variant='h2' sx={SubTitleStyle}>
              {strings.SEED_COLLECTION_DETAIL}
            </Typography>
            <Typography padding={theme.spacing(1, 0)} fontSize='14px' fontWeight={400}>
              {strings.SEED_COLLECTION_DETAIL_DESC}
            </Typography>
          </Grid>
          <Grid item xs={12} sx={marginTop}>
            <Species2Dropdown
              record={record}
              organization={organization}
              setRecord={setRecord}
              validate={validateFields}
            />
          </Grid>
          <CollectedReceivedDate2 record={record} onChange={onChange} type='collected' validate={validateFields} />
          <Grid item xs={12} sx={marginTop}>
            <Collectors2
              organizationId={organization.id}
              id='collectors'
              collectors={record.collectors}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={12} display='flex' flexDirection={isMobile ? 'column' : 'row'} justifyContent='space-between'>
            <Grid item xs={gridSize()} sx={{ ...marginTop, marginRight: isMobile ? 0 : theme.spacing(2) }}>
              <Textfield
                id='collectionSiteName'
                value={record.collectionSiteName}
                onChange={onChange}
                type='text'
                label={strings.COLLECTION_SITE}
                tooltipTitle={strings.TOOLTIP_ACCESSIONS_ADD_COLLECTING_SITE}
              />
            </Grid>
            <Grid item xs={gridSize()} sx={marginTop}>
              <Textfield
                id='collectionSiteLandowner'
                value={record.collectionSiteLandowner}
                onChange={onChange}
                type='text'
                label={strings.LANDOWNER}
              />
            </Grid>
          </Grid>
          <Accession2Address record={record} onChange={onChange} />
          <Accession2GPS record={record} onChange={onChange} />
          <Accession2PlantSiteDetails record={record} onChange={onChange} />
        </Grid>
        <Grid container>
          <CollectedReceivedDate2 record={record} onChange={onChange} type='received' validate={validateFields} />
          <Grid item xs={12} sx={marginTop}>
            <Select
              id='state'
              selectedValue={record.state}
              onChange={(value: string) => onChange('state', value)}
              label={strings.PROCESSING_STATUS_REQUIRED}
              options={ACCESSION_2_CREATE_STATES}
              fullWidth={true}
            />
          </Grid>
          <SeedBank2Selector
            organization={organization}
            record={record}
            onChange={onChange}
            validate={validateFields}
          />
        </Grid>
      </Container>
      <FormBottomBar onCancel={goToAccessions} onSave={saveAccession} saveButtonText={strings.CREATE} />
    </TfMain>
  );
}
