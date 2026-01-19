import React, { type JSX, useEffect, useState } from 'react';

import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { Button, DialogBox, Textfield } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import SelectPhotos from 'src/components/common/Photos/SelectPhotos';
import ProgressCircle from 'src/components/common/ProgressCircle/ProgressCircle';
import SpeciesSelector from 'src/components/common/SpeciesSelector';
import { useLocalization, useOrganization } from 'src/providers';
import AccessionService from 'src/services/AccessionService';
import SeedBankService from 'src/services/SeedBankService';
import strings from 'src/strings';
import { Accession } from 'src/types/Accession';
import { getSeedBank } from 'src/utils/organization';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';

import { MAX_ACCESSION_PHOTOS } from '../Accession2CreateView';
import {
  Accession2Address,
  Accession2GPS,
  Accession2PlantSiteDetails,
  CollectedReceivedDate2,
  Collectors2,
} from '../properties';
import CollectionSiteName from '../properties/CollectionSiteName';

export interface Accession2EditModalProps {
  open: boolean;
  accession: Accession;
  onClose: () => void;
  reload: () => void;
}

const MANDATORY_FIELDS = ['speciesId', 'collectedDate'] as const;

type MandatoryField = (typeof MANDATORY_FIELDS)[number];

export default function Accession2EditModal(props: Accession2EditModalProps): JSX.Element | null {
  const { onClose, open, accession, reload } = props;
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const [record, setRecord, onChange, onChangeCallback] = useForm(accession);
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const snackbar = useSnackbar();
  const { selectedOrganization } = useOrganization();
  const selectedSeedBank = selectedOrganization ? getSeedBank(selectedOrganization, record.facilityId) : undefined;
  const tz = useLocationTimeZone().get(selectedSeedBank);
  const timeZone = tz.id;
  const [collectedDateError, setCollectedDateError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [photoFilenames, setPhotoFilenames] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [photoFilenamesToRemove, setPhotoFilenamesToRemove] = useState<string[]>([]);

  const onPhotosChanged = (photosList: File[]) => {
    setNewPhotos(photosList);
  };

  const removePhoto = (photoFilename: string, index: number) => {
    const _photoFilenames = [...photoFilenames];
    _photoFilenames.splice(index, 1);
    setPhotoFilenames(_photoFilenames);

    const _photoFilenamesToRemove = [...photoFilenamesToRemove];
    _photoFilenamesToRemove.push(photoFilename);
    setPhotoFilenamesToRemove(_photoFilenamesToRemove);
  };

  const updatePhotos = async () => {
    if (newPhotos.length) {
      await SeedBankService.uploadAccessionPhotos(record.id, newPhotos);
      setNewPhotos([]);
    }

    if (photoFilenamesToRemove.length) {
      await SeedBankService.deleteAccessionPhotos(record.id, photoFilenamesToRemove);
      setPhotoFilenamesToRemove([]);
    }
  };

  const onCollectedDateError = (error?: string) => {
    setCollectedDateError(error);
  };

  const hasErrors = () => {
    const missingRequiredField = MANDATORY_FIELDS.some((field: MandatoryField) => !record || !record[field]);
    return missingRequiredField || collectedDateError;
  };

  useEffect(() => {
    setRecord(accession);
    setPhotoFilenames([...(accession?.photoFilenames || [])]);
  }, [accession, setRecord]);

  const saveAccession = async () => {
    if (record) {
      if (hasErrors()) {
        setValidateFields(true);
        return;
      }
      setLoading(true);
      const response = await AccessionService.updateAccession(record);
      if (response.requestSucceeded && accession) {
        await updatePhotos();
        reload();
        onCloseHandler();
      } else {
        snackbar.toastError();
        onCloseHandler();
      }
    }
  };

  const onCloseHandler = () => {
    setLoading(false);
    onClose();
  };

  return !activeLocale ? null : (
    <DialogBox
      middleButtons={[
        <Button
          disabled={loading}
          id='cancelEditAccession'
          key='button-1'
          label={strings.CANCEL}
          onClick={onCloseHandler}
          priority='secondary'
          type='passive'
        />,
        <Button
          disabled={loading}
          id='saveEditAccession'
          key='button-2'
          label={strings.SAVE}
          onClick={() => void saveAccession()}
        />,
      ]}
      onClose={() => !loading && onCloseHandler()}
      open={open}
      scrolled={true}
      size='x-large'
      skrim={true}
      title={strings.EDIT_ACCESSION_DETAIL}
    >
      {loading && (
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ margin: '40px auto' }}>
            <ProgressCircle determinate={false} />
          </Box>
        </Box>
      )}

      {!loading && (
        <Grid container item xs={12} spacing={2} textAlign='left'>
          <Grid item xs={12}>
            <Textfield
              id='accessionNumber'
              type='text'
              label={strings.ID}
              value={record?.accessionNumber}
              onChange={onChangeCallback('accessionNumber')}
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
            <CollectionSiteName onChange={onChange} collectionSiteName={record?.collectionSiteName} />
          </Grid>

          <Grid item xs={12}>
            <Textfield
              id='collectionSiteLandowner'
              type='text'
              label={strings.LANDOWNER}
              value={record?.collectionSiteLandowner}
              onChange={onChangeCallback('collectionSiteLandowner')}
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

          <Grid padding={theme.spacing(2, 0, 0, 2)} xs={12}>
            <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px'>
              {strings.PHOTOS}
            </Typography>
            <Box display='flex' flexDirection='row' flexWrap='wrap'>
              {photoFilenames?.map((photoFilename, index) => (
                <Box
                  border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
                  display='flex'
                  height={122}
                  key={index}
                  marginRight={isMobile ? 2 : 3}
                  marginTop={1}
                  position='relative'
                  sx={{ cursor: 'pointer' }}
                  width={122}
                >
                  <Button
                    icon='iconTrashCan'
                    onClick={() => removePhoto(photoFilename, index)}
                    size='small'
                    style={{
                      backgroundColor: theme.palette.TwClrBgDanger,
                      position: 'absolute',
                      right: -10,
                      top: -10,
                    }}
                  />
                  <img
                    alt={`${index}`}
                    src={`/api/v1/seedbank/accessions/${accession.id}/photos/${photoFilename}?maxHeight=120&maxWidth=120`}
                    style={{
                      display: 'flex',
                      margin: 'auto auto',
                      maxHeight: '120px',
                      maxWidth: '120px',
                      objectFit: 'contain',
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>

          <Container maxWidth={false}>
            <Box sx={{ marginLeft: `-${theme.spacing(4)}`, marginRight: `-${theme.spacing(4)}` }}>
              <SelectPhotos
                onPhotosChanged={onPhotosChanged}
                multipleSelection={true}
                maxPhotos={MAX_ACCESSION_PHOTOS - (photoFilenames.length + newPhotos.length)}
              />
            </Box>
          </Container>
        </Grid>
      )}
    </DialogBox>
  );
}
