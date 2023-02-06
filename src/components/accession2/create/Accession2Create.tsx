import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import useForm from 'src/utils/useForm';
import { Container, Grid, Typography, useTheme } from '@mui/material';
import SeedBankService, { AccessionPostRequestBody } from 'src/services/SeedBankService';
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
import PageForm from 'src/components/common/PageForm';
import { accessionCreateStates } from 'src/types/Accession';
import useSnackbar from 'src/utils/useSnackbar';
import TfMain from 'src/components/common/TfMain';
import { Dropdown } from '@terraware/web-components';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';
import { useOrganization } from 'src/providers';
import { getSeedBank } from 'src/utils/organization';
import { Facility } from 'src/types/Facility';
import { getTodaysDateFormatted } from '@terraware/web-components/utils/date';
import isEnabled from 'src/features';

const SubTitleStyle = {
  fontSize: '20px',
  fontWeight: 600,
};

const MANDATORY_FIELDS = ['speciesId', 'collectedDate', 'receivedDate', 'state', 'facilityId'] as const;

type MandatoryField = typeof MANDATORY_FIELDS[number];

export default function CreateAccession(): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const history = useHistory();
  const snackbar = useSnackbar();
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const [selectedSeedBank, setSelectedSeedBank] = useState<Facility>();
  const timeZoneFeatureEnabled = isEnabled('Timezones');
  const tz = useLocationTimeZone().get(timeZoneFeatureEnabled ? selectedSeedBank : undefined);
  const [timeZone, setTimeZone] = useState<string>(tz.id);
  const { selectedOrganization } = useOrganization();

  const defaultAccession = (): AccessionPostRequestBody =>
    ({
      state: 'Awaiting Check-In',
      receivedDate: getTodaysDateFormatted(timeZone),
    } as AccessionPostRequestBody);

  const [record, setRecord, onChange] = useForm<AccessionPostRequestBody>(defaultAccession());

  useEffect(() => {
    if (record.facilityId) {
      const accessionSeedBank = getSeedBank(selectedOrganization, record.facilityId);
      setSelectedSeedBank(accessionSeedBank);
    }
  }, [record.facilityId, selectedOrganization]);

  useEffect(() => {
    setTimeZone(tz.id);
  }, [tz]);

  useEffect(() => {
    setRecord((previousRecord: AccessionPostRequestBody): AccessionPostRequestBody => {
      return {
        ...previousRecord,
        receivedDate: getTodaysDateFormatted(timeZone),
      };
    });
  }, [timeZone, setRecord]);

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
    const response = await SeedBankService.createAccession(record);
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
      <PageForm
        cancelID='cancelCreateAccession'
        saveID='saveCreateAccession'
        onCancel={goToAccessions}
        onSave={saveAccession}
        saveButtonText={strings.CREATE}
      >
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
            marginBottom: theme.spacing(8),
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
              <Species2Dropdown record={record} setRecord={setRecord} validate={validateFields} />
            </Grid>
            <CollectedReceivedDate2
              record={record}
              onChange={onChange}
              type='collected'
              validate={validateFields}
              timeZone={timeZone}
            />
            <Grid item xs={12} sx={marginTop}>
              <Collectors2 collectors={record.collectors} onChange={onChange} />
            </Grid>
            <Grid
              item
              xs={12}
              display='flex'
              flexDirection={isMobile ? 'column' : 'row'}
              justifyContent='space-between'
            >
              <Grid item xs={gridSize()} sx={{ ...marginTop, marginRight: isMobile ? 0 : theme.spacing(2) }}>
                <Textfield
                  id='collectionSiteName'
                  value={record.collectionSiteName}
                  onChange={(value) => onChange('collectionSiteName', value)}
                  type='text'
                  label={strings.COLLECTION_SITE}
                  tooltipTitle={strings.TOOLTIP_ACCESSIONS_ADD_COLLECTING_SITE}
                />
              </Grid>
              <Grid item xs={gridSize()} sx={marginTop}>
                <Textfield
                  id='collectionSiteLandowner'
                  value={record.collectionSiteLandowner}
                  onChange={(value) => onChange('collectionSiteLandowner', value)}
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
            <CollectedReceivedDate2
              record={record}
              onChange={onChange}
              type='received'
              validate={validateFields}
              timeZone={timeZone}
            />
            <Grid item xs={12} sx={marginTop}>
              <Dropdown
                id='state'
                selectedValue={record.state}
                onChange={(value: string) => onChange('state', value)}
                label={strings.PROCESSING_STATUS_REQUIRED}
                options={accessionCreateStates()}
                fullWidth={true}
              />
            </Grid>
            <SeedBank2Selector record={record} onChange={onChange} validate={validateFields} />
          </Grid>
        </Container>
      </PageForm>
    </TfMain>
  );
}
