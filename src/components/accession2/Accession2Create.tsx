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

type CreateAccessionProps = {
  organization: ServerOrganization;
};

const SubTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
};

const defaultAccession = (): AccessionPostRequestBody => ({} as AccessionPostRequestBody);

type Dates = {
  collectedDate?: any;
};

export default function CreateAccession(props: CreateAccessionProps): JSX.Element {
  const { organization } = props;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const history = useHistory();
  const [record, setRecord, onChange] = useForm<AccessionPostRequestBody>(defaultAccession());
  const [dates, setDates] = useState<Dates>({
    collectedDate: record.collectedDate,
  });
  const accessions2Database = {
    pathname: APP_PATHS.ACCESSIONS2,
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

  const changeDate = (id: string, value?: any) => {
    setDates((curr) => ({ ...curr, collectedDate: value }));
    const date = new Date(value).getTime();
    const now = Date.now();
    if (isNaN(date) || date > now) {
      return;
    } else {
      onChange(id, value);
    }
  };

  const goToAccessions2 = () => {
    history.push(accessions2Database);
  };

  const saveAccession = async () => {
    try {
      const accessionNumber = await postAccession(record);
      history.replace(accessions2Database);
      history.push({
        pathname: APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', accessionNumber),
      });
    } catch (e) {
      // show toast error
    }
  };

  const gridSize = () => (isMobile ? 12 : 6);

  return (
    <Box
      display='flex'
      flexDirection='column'
      marginTop={theme.spacing(5)}
      marginBottom={isMobile ? theme.spacing(15) : theme.spacing(5)}
    >
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
            <Species2Dropdown record={record} organization={organization} setRecord={setRecord} />
          </Grid>
          <Grid item xs={12} sx={datePickerStyle}>
            <DatePicker
              id='collectedDate'
              label={strings.COLLECTED_DATE_REQUIRED}
              aria-label={strings.COLLECTED_DATE_REQUIRED}
              value={dates.collectedDate}
              onChange={changeDate}
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
          <Grid xs={12} display='flex' flexDirection={isMobile ? 'column' : 'row'} justifyContent='space-between'>
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
        </Grid>
        <Grid container>
          <Grid item xs={12} sx={{ marginTop: theme.spacing(4) }}>
            <Typography variant='h2' sx={SubTitleStyle}>
              {strings.SEED_PROCESSING_DETAIL}
            </Typography>
          </Grid>
        </Grid>
      </Container>
      <FormBottomBar onCancel={goToAccessions2} onSave={saveAccession} />
    </Box>
  );
}
