import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { ServerOrganization } from 'src/types/Organization';
import useForm from 'src/utils/useForm';
import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { AccessionPostRequestBody, postAccession } from 'src/api/accessions2/accession';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { DatePicker } from '@terraware/web-components';
import Species2Dropdown from './Species2Dropdown';
import Collectors2 from './Collectors2';
import Textfield from '../common/Textfield/Textfield';
import FormBottomBar from '../common/FormBottomBar';
import Select from '../common/Select/Select';
import SeedBank2Selector from './SeedBank2Selector';
import { ACCESSION_2_CREATE_STATES } from 'src/types/Accession';
import Accession2Address from './Accession2Address';
import Accession2GPS from './Accession2GPS';
import Accession2PlantSiteDetails from './Accession2PlantSiteDetails';
import getDateDisplayValue from 'src/utils/date';
import useSnackbar from 'src/utils/useSnackbar';

type CreateAccessionProps = {
  organization: ServerOrganization;
};

const SubTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
};

const defaultAccession = (): AccessionPostRequestBody =>
  ({
    state: 'Awaiting Check-In',
    receivedDate: getDateDisplayValue(Date.now()),
  } as AccessionPostRequestBody);

type Dates = {
  collectedDate?: any;
  receivedDate?: any;
};

const MANDATORY_FIELDS = [
  'speciesId',
  'collectedDate',
  'receivedDate',
  'state',
  'facilityId',
  'storageLocation',
] as const;

type MandatoryField = typeof MANDATORY_FIELDS[number];

export default function CreateAccession(props: CreateAccessionProps): JSX.Element {
  const { organization } = props;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const history = useHistory();
  const snackbar = useSnackbar();
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const [dateErrors, setDateErrors] = useState<{ [key: string]: string | undefined }>({});
  const [record, setRecord, onChange] = useForm<AccessionPostRequestBody>(defaultAccession());
  const [dates, setDates] = useState<Dates>({
    collectedDate: record.collectedDate,
    receivedDate: record.receivedDate,
  });
  const accessionsDatabase = {
    pathname: APP_PATHS.ACCESSIONS,
  };

  const marginTop = {
    marginTop: theme.spacing(2),
  };

  const datePickerStyle = {
    '.MuiFormControl-root': {
      width: '100%',
    },
    ...marginTop,
  };

  const setDateError = (id: string, error?: string) => {
    setDateErrors((prev) => ({
      ...prev,
      [id]: error,
    }));
  };

  const changeDate = (id: string, value?: any) => {
    setDates((curr) => ({ ...curr, [id]: value }));
    const date = new Date(value).getTime();
    const now = Date.now();

    setDateError(id, '');

    if (isNaN(date)) {
      setDateError(id, strings.INVALID_DATE);
      return;
    } else if (date > now) {
      setDateError(id, strings.NO_FUTURE_DATES);
      return;
    } else {
      onChange(id, value);
    }
  };

  const goToAccessions = () => {
    history.push(accessionsDatabase);
  };

  const hasErrors = () => {
    const missingRequiredField = MANDATORY_FIELDS.some((field: MandatoryField) => record[field] === undefined);
    const hasDateErrors = dateErrors.recordedDate || dateErrors.collectedDate;
    return missingRequiredField || hasDateErrors;
  };

  const saveAccession = async () => {
    if (hasErrors()) {
      setDateError('collectedDate', record.collectedDate ? dateErrors.collectedDate : strings.REQUIRED_FIELD);
      setDateError('receivedDate', record.receivedDate ? dateErrors.receivedDate : strings.REQUIRED_FIELD);
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
      snackbar.toastError();
    }
  };

  const gridSize = () => (isMobile ? 12 : 6);

  return (
    <Box display='flex' flexDirection='column' marginTop={theme.spacing(5)} marginBottom={theme.spacing(25)}>
      <Typography variant='h2' sx={{ fontSize: '24px', fontWeight: 'bold', margin: '0 auto' }}>
        {strings.ADD_AN_ACCESSION}
      </Typography>
      <Container
        maxWidth={false}
        sx={{
          margin: '0 auto',
          width: isMobile ? '100%' : '640px',
          paddingLeft: theme.spacing(4),
          paddingRight: theme.spacing(4),
          paddingTop: theme.spacing(5),
          paddingBottom: theme.spacing(5),
        }}
      >
        <Grid container>
          <Grid item xs={12}>
            <Typography variant='h2' sx={SubTitleStyle}>
              {strings.SEED_COLLECTION_DETAIL}
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
          <Grid item xs={12} sx={datePickerStyle}>
            <DatePicker
              id='collectedDate'
              label={strings.COLLECTION_DATE_REQUIRED}
              aria-label={strings.COLLECTION_DATE_REQUIRED}
              value={dates.collectedDate}
              onChange={changeDate}
              errorText={dateErrors.collectedDate}
              maxDate={Date.now()}
            />
          </Grid>
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
          <Grid item xs={12} sx={{ marginTop: theme.spacing(4) }}>
            <Typography variant='h2' sx={SubTitleStyle}>
              {strings.SEED_PROCESSING_DETAIL}
            </Typography>
          </Grid>
          <Grid item xs={12} sx={datePickerStyle}>
            <DatePicker
              id='receivedDate'
              label={strings.RECEIVING_DATE_REQUIRED}
              aria-label={strings.RECEIVING_DATE_REQUIRED}
              value={dates.receivedDate}
              onChange={changeDate}
              errorText={dateErrors.receivedDate}
            />
          </Grid>
          <Grid item xs={12} sx={marginTop}>
            <Select
              id='state'
              selectedValue={record.state}
              onChange={(value: string) => onChange('state', value)}
              label={strings.PROCESSING_STATUS_REQUIRED}
              readonly={true}
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
      <FormBottomBar onCancel={goToAccessions} onSave={saveAccession} saveButtonText={strings.ADD} />
    </Box>
  );
}
