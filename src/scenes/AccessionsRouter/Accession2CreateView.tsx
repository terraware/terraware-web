import React, { type JSX, useEffect, useState } from 'react';

import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';
import { getTodaysDateFormatted } from '@terraware/web-components/utils/date';

import ProjectsDropdown from 'src/components/ProjectsDropdown';
import PageForm from 'src/components/common/PageForm';
import SelectPhotos from 'src/components/common/Photos/SelectPhotos';
import SpeciesSelector from 'src/components/common/SpeciesSelector';
import Textfield from 'src/components/common/Textfield/Textfield';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useProjects } from 'src/hooks/useProjects';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import SeedBankService, { AccessionPostRequestBody } from 'src/services/SeedBankService';
import strings from 'src/strings';
import { accessionCreateStates } from 'src/types/Accession';
import { Facility } from 'src/types/Facility';
import { getSeedBank } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';

import {
  Accession2Address,
  Accession2GPS,
  Accession2PlantSiteDetails,
  CollectedReceivedDate2,
  Collectors2,
  SeedBank2Selector,
} from './properties';
import CollectionSiteName from './properties/CollectionSiteName';

const SubTitleStyle = {
  fontSize: '20px',
  fontWeight: 600,
};

const MANDATORY_FIELDS = ['speciesId', 'collectedDate', 'receivedDate', 'state', 'facilityId'] as const;

type MandatoryField = (typeof MANDATORY_FIELDS)[number];

export const MAX_ACCESSION_PHOTOS = 10;

export default function CreateAccession(): JSX.Element | null {
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const [selectedSeedBank, setSelectedSeedBank] = useState<Facility>();
  const tz = useLocationTimeZone().get(selectedSeedBank);
  const [timeZone, setTimeZone] = useState<string>(tz.id);
  const { selectedOrganization } = useOrganization();
  const [collectedDateError, setCollectedDateError] = useState<string>();
  const [receivedDateError, setReceivedDateError] = useState<string>();
  const [photos, setPhotos] = useState<File[]>([]);

  const onPhotosChanged = (photosList: File[]) => {
    setPhotos(photosList);
  };

  const onCollectedDateError = (error?: string) => {
    setCollectedDateError(error);
  };

  const onReceivedDateError = (error?: string) => {
    setReceivedDateError(error);
  };

  const defaultAccession = (): AccessionPostRequestBody =>
    ({
      state: 'Awaiting Check-In',
      collectedDate: getTodaysDateFormatted(timeZone),
      receivedDate: getTodaysDateFormatted(timeZone),
    }) as AccessionPostRequestBody;

  const [record, setRecord, onChange, onChangeCallback] = useForm<AccessionPostRequestBody>(defaultAccession());

  const { availableProjects } = useProjects();

  // If there's only 1 project, and the record's `projectId` is not explicitly set to `null`, auto apply it
  useEffect(() => {
    if (record.projectId === null) {
      return;
    } else if (!availableProjects || availableProjects.length !== 1) {
      return;
    }

    const projectId = availableProjects[0].id;
    if (projectId && record.projectId !== projectId) {
      setRecord({
        ...record,
        projectId,
      });
    }
  }, [record, availableProjects, setRecord]);

  useEffect(() => {
    if (record.facilityId && selectedOrganization) {
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
    navigate(accessionsDatabase);
  };

  const hasErrors = () => {
    const missingRequiredField = MANDATORY_FIELDS.some((field: MandatoryField) => !record[field]);
    return missingRequiredField || collectedDateError || receivedDateError;
  };

  const saveAccession = async () => {
    if (hasErrors()) {
      setValidateFields(true);
      return;
    }
    const response = await SeedBankService.createAccession(record);
    if (response.requestSucceeded) {
      if (photos.length) {
        // upload photos
        await SeedBankService.uploadAccessionPhotos(response.id, photos);
      }

      navigate(accessionsDatabase, { replace: true });
      navigate({
        pathname: APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', response.id.toString()),
      });
    } else {
      snackbar.toastError();
    }
  };

  const gridSize = () => (isMobile ? 12 : 6);

  return !activeLocale ? null : (
    <TfMain>
      <PageForm
        cancelID='cancelCreateAccession'
        saveID='saveCreateAccession'
        onCancel={goToAccessions}
        onSave={() => void saveAccession()}
        saveButtonText={strings.SAVE}
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
              <SpeciesSelector record={record} setRecord={setRecord} validate={validateFields} />
            </Grid>
            <CollectedReceivedDate2
              onChange={onChange}
              validate={validateFields}
              timeZone={timeZone}
              value={record.collectedDate}
              id='collectedDate'
              onDateError={onCollectedDateError}
              label={strings.COLLECTION_DATE_REQUIRED}
              maxDate={new Date()}
              dateError={collectedDateError}
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
                <CollectionSiteName onChange={onChange} collectionSiteName={record?.collectionSiteName} />
              </Grid>
              <Grid item xs={gridSize()} sx={marginTop}>
                <Textfield
                  id='collectionSiteLandowner'
                  value={record.collectionSiteLandowner}
                  onChange={onChangeCallback('collectionSiteLandowner')}
                  type='text'
                  label={strings.LANDOWNER}
                />
              </Grid>
            </Grid>
            <Accession2Address record={record} onChange={onChange} />
            <Accession2GPS record={record} onChange={onChange} />
            <Accession2PlantSiteDetails record={record} onChange={onChange} />
          </Grid>

          <Box sx={marginTop}>
            <ProjectsDropdown<AccessionPostRequestBody>
              record={record}
              setRecord={setRecord}
              availableProjects={availableProjects}
              allowUnselect
            />
          </Box>

          <Grid container>
            <CollectedReceivedDate2
              onChange={onChange}
              validate={validateFields}
              timeZone={timeZone}
              value={record.receivedDate}
              id='receivedDate'
              onDateError={onReceivedDateError}
              label={strings.RECEIVING_DATE_REQUIRED}
              dateError={receivedDateError}
            />
            <Grid item xs={12} sx={marginTop}>
              <Dropdown
                id='state'
                selectedValue={record.state}
                onChange={onChangeCallback('state')}
                label={strings.PROCESSING_STATUS_REQUIRED}
                options={accessionCreateStates()}
                fullWidth={true}
              />
            </Grid>
            <SeedBank2Selector record={record} onChange={onChange} validate={validateFields} />
          </Grid>

          <Box sx={marginTop}>
            <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px'>
              {strings.PHOTOS}
            </Typography>

            <Box
              sx={{
                marginLeft: `-${theme.spacing(3)}`,
                marginRight: `-${theme.spacing(3)}`,
                marginTop: `-${theme.spacing(1)}`,
              }}
            >
              <SelectPhotos
                maxPhotos={MAX_ACCESSION_PHOTOS}
                multipleSelection={true}
                onPhotosChanged={onPhotosChanged}
              />
            </Box>
          </Box>
        </Container>
      </PageForm>
    </TfMain>
  );
}
