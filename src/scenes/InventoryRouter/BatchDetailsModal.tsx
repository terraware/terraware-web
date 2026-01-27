import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Container, Divider, Grid, Typography, useTheme } from '@mui/material';
import { Button, DialogBox, Dropdown, Textfield } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import getDateDisplayValue from '@terraware/web-components/utils/date';

import DatePicker from 'src/components/common/DatePicker';
import SelectPhotos from 'src/components/common/Photos/SelectPhotos';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { NurseryBatchService } from 'src/services';
import { BATCH_PHOTO_ENDPOINT } from 'src/services/NurseryBatchService';
import {
  batchSubstrateEnumToLocalized,
  batchSubstrateLocalizedToEnum,
  nurserySubstratesLocalized,
  treatments,
} from 'src/types/Accession';
import { Batch, BatchPhoto } from 'src/types/Batch';
import { Facility } from 'src/types/Facility';
import { isNumber } from 'src/types/utils';
import { getNurseryById } from 'src/utils/organization';
import useForm from 'src/utils/useForm';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import useSnackbar from 'src/utils/useSnackbar';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';

export interface BatchDetailsModalProps {
  batch: Batch;
  onClose: () => void;
  reload: () => void;
}

type BatchPhotoWithUrl = BatchPhoto & { url: string };

export default function BatchDetailsModal({ batch, onClose, reload }: BatchDetailsModalProps): JSX.Element | null {
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const numberFormatter = useNumberFormatter();
  const snackbar = useSnackbar();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const [record, setRecord, onChange, onChangeCallback] = useForm(batch);
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [photos, setPhotos] = useState<BatchPhotoWithUrl[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [photoIdsToRemove, setPhotoIdsToRemove] = useState<number[]>([]);
  const [facility, setFacility] = useState<Facility>();
  const tz = useLocationTimeZone().get(facility);
  const [timeZone, setTimeZone] = useState(tz.id);

  const onPhotosChanged = useCallback(
    (photosList: File[]) => {
      setNewPhotos(photosList);
    },
    [setNewPhotos]
  );

  const onRemovePhoto = useCallback(
    (id: number) => {
      const newIds = [...photoIdsToRemove];
      newIds.push(id);
      setPhotoIdsToRemove(newIds);
    },
    [photoIdsToRemove]
  );

  const removePhoto = useCallback(
    (id: number, index: number) => {
      photos.splice(index, 1);
      onRemovePhoto(id);
    },
    [photos, onRemovePhoto]
  );

  useEffect(() => {
    const getPhotos = async () => {
      const photoListResponse = await NurseryBatchService.getBatchPhotosList(batch.id);
      if (!photoListResponse.requestSucceeded || photoListResponse.error) {
        setPhotos([]);
        snackbar.toastError();
      } else {
        const photosWithUrl: BatchPhotoWithUrl[] = photoListResponse.photoIds
          ? photoListResponse.photoIds.map((photo: { id: number }) => {
              return {
                ...photo,
                url: BATCH_PHOTO_ENDPOINT.replace('{batchId}', batch.id.toString()).replace(
                  '{photoId}',
                  photo.id.toString()
                ),
              };
            })
          : [];

        setPhotos(photosWithUrl);
      }
    };

    void getPhotos();
  }, [batch, snackbar]);

  useEffect(() => {
    if (record) {
      const activeGrowthQuantity = record?.activeGrowthQuantity ?? 0;
      const hardeningOffQuantity = record?.hardeningOffQuantity ?? 0;
      const readyQuantity = record?.readyQuantity ?? 0;
      setTotalQuantity(+activeGrowthQuantity + +hardeningOffQuantity + +readyQuantity);
    }
  }, [record, selectedOrganization]);

  useEffect(() => {
    if (record?.facilityId && selectedOrganization) {
      const newFacility = getNurseryById(selectedOrganization, record.facilityId);
      if (newFacility.id.toString() !== facility?.id.toString()) {
        setFacility(newFacility);
      }
    }
  }, [record?.facilityId, selectedOrganization, facility?.id]);

  useEffect(() => {
    if (timeZone !== tz.id) {
      setTimeZone(tz.id);
    }
  }, [tz.id, timeZone]);

  useEffect(() => {
    if (selectedOrganization) {
      const foundFacility = selectedOrganization.facilities?.find(
        (f) => f.id.toString() === batch?.facilityId.toString()
      );
      if (foundFacility) {
        setFacility(foundFacility);
      }
    }
  }, [batch, setRecord, selectedOrganization]);

  const MANDATORY_FIELDS = useMemo(
    () =>
      ['germinatingQuantity', 'activeGrowthQuantity', 'hardeningOffQuantity', 'readyQuantity', 'addedDate'] as const,
    []
  );
  type MandatoryField = (typeof MANDATORY_FIELDS)[number];

  const hasErrors = useCallback(() => {
    if (record) {
      return MANDATORY_FIELDS.some((field: MandatoryField) => record[field] === '' || record[field] === undefined);
    }
    return true;
  }, [MANDATORY_FIELDS, record]);

  const updatePhotos = useCallback(async () => {
    await NurseryBatchService.uploadBatchPhotos(batch.id, newPhotos);
    setNewPhotos([]);
    if (photoIdsToRemove) {
      await NurseryBatchService.deleteBatchPhotos(batch.id, photoIdsToRemove);
      setPhotoIdsToRemove([]);
    }
  }, [batch.id, newPhotos, photoIdsToRemove]);

  const onCloseHandler = useCallback(() => {
    setValidateFields(false);
    onClose();
  }, [onClose, setValidateFields]);

  const saveBatch = useCallback(async () => {
    if (record) {
      if (hasErrors()) {
        setValidateFields(true);
        return;
      }

      let responseQuantities = { requestSucceeded: true };

      const response = await NurseryBatchService.updateBatch(record);
      if (response.batch) {
        responseQuantities = await NurseryBatchService.updateBatchQuantities({
          ...record,
          version: response.batch.version,
        });
      }

      if (response.requestSucceeded && responseQuantities.requestSucceeded) {
        await updatePhotos();
        reload();
        onCloseHandler();
      } else {
        snackbar.toastError();
      }
    }
  }, [record, hasErrors, updatePhotos, reload, onCloseHandler, snackbar]);

  const handleSaveBatch = useCallback(() => {
    void saveBatch();
  }, [saveBatch]);

  const changeDate = useCallback(
    (id: string, value?: Date | null) => {
      const date = value ? getDateDisplayValue(value.getTime(), tz.id) : null;
      onChange(id, date);
    },
    [tz.id, onChange]
  );

  const handleSeedsSownDateChange = useCallback(
    (value?: Date | null) => {
      changeDate('seedsSownDate', value);
    },
    [changeDate]
  );

  const handleGerminationStartedDateChange = useCallback(
    (value?: Date | null) => {
      changeDate('germinationStartedDate', value);
    },
    [changeDate]
  );

  const handleReadyByDateChange = useCallback(
    (value?: Date | null) => {
      changeDate('readyByDate', value);
    },
    [changeDate]
  );

  const handleSubstrateChange = useCallback(
    (value: unknown) => {
      onChange('substrate', batchSubstrateLocalizedToEnum(value as string));
    },
    [onChange]
  );

  const getHandleRemovePhoto = useCallback(
    (photoId: number, index: number) => () => {
      removePhoto(photoId, index);
    },
    [removePhoto]
  );

  const gridSize = useMemo(() => (isMobile ? 12 : 6), [isMobile]);

  const paddingSeparator = useMemo(() => (isMobile ? 0 : 1.5), [isMobile]);

  const marginTop = {
    marginTop: theme.spacing(0),
  };

  return record ? (
    <DialogBox
      onClose={onCloseHandler}
      open={true}
      title={strings.EDIT_BATCH_DETAILS}
      size='medium'
      middleButtons={[
        <Button
          id='cancelBatchDetails'
          label={strings.CANCEL}
          type='passive'
          onClick={onCloseHandler}
          priority='secondary'
          key='button-1'
        />,
        <Button id='saveBatchDetails' onClick={handleSaveBatch} label={strings.SAVE} key='button-2' />,
      ]}
      scrolled={true}
    >
      <Grid container spacing={2} textAlign='left'>
        <Grid item xs={gridSize} sx={marginTop} paddingLeft={paddingSeparator}>
          <DatePicker
            id='seedsSownDate'
            label={strings.SEEDS_SOWN_DATE}
            aria-label={strings.SEEDS_SOWN_DATE}
            value={record.seedsSownDate}
            onChange={handleSeedsSownDateChange}
            defaultTimeZone={timeZone}
          />
        </Grid>
        <Grid item xs={gridSize} sx={marginTop} />
        <Grid item xs={gridSize} sx={marginTop}>
          <Textfield
            id='germinatingQuantity'
            value={record.germinatingQuantity}
            onChange={onChangeCallback('germinatingQuantity')}
            type='number'
            label={strings.GERMINATION_ESTABLISHMENT_QUANTITY_REQUIRED}
            tooltipTitle={strings.TOOLTIP_GERMINATION_ESTABLISHMENT_QUANTITY}
            errorText={validateFields && !isNumber(record?.germinatingQuantity) ? strings.REQUIRED_FIELD : ''}
            min={0}
          />
        </Grid>
        <Grid item xs={gridSize} sx={marginTop} paddingLeft={paddingSeparator}>
          <DatePicker
            id='germinationStartedDate'
            label={strings.GERMINATION_ESTABLISHMENT_STARTED_DATE}
            aria-label={strings.GERMINATION_ESTABLISHMENT_STARTED_DATE}
            value={record.germinationStartedDate}
            onChange={handleGerminationStartedDateChange}
            defaultTimeZone={timeZone}
          />
        </Grid>
        <Grid item xs={gridSize} sx={marginTop} paddingRight={paddingSeparator}>
          <Textfield
            id='activeGrowthQuantity'
            value={record.activeGrowthQuantity}
            onChange={onChangeCallback('activeGrowthQuantity')}
            type='number'
            label={strings.ACTIVE_GROWTH_QUANTITY_REQUIRED}
            tooltipTitle={strings.TOOLTIP_ACTIVE_GROWTH_QUANTITY}
            errorText={validateFields && !isNumber(record?.activeGrowthQuantity) ? strings.REQUIRED_FIELD : ''}
            min={0}
          />
        </Grid>
        <Grid item xs={gridSize} sx={marginTop} paddingLeft={paddingSeparator}>
          <DatePicker
            id='readyByDate'
            label={strings.ESTIMATED_READY_DATE}
            aria-label={strings.ESTIMATED_READY_DATE}
            value={record.readyByDate}
            onChange={handleReadyByDateChange}
            defaultTimeZone={timeZone}
          />
        </Grid>

        <Grid item xs={gridSize} sx={marginTop} paddingRight={paddingSeparator}>
          <Textfield
            id='hardeningOffQuantity'
            value={record.hardeningOffQuantity}
            onChange={onChangeCallback('hardeningOffQuantity')}
            type='number'
            label={strings.HARDENING_OFF_QUANTITY_REQUIRED}
            tooltipTitle={strings.TOOLTIP_HARDENING_OFF_QUANTITY}
            errorText={validateFields && !isNumber(record?.hardeningOffQuantity) ? strings.REQUIRED_FIELD : ''}
            min={0}
          />
        </Grid>

        <Grid item xs={gridSize} sx={marginTop} paddingLeft={paddingSeparator} />

        <Grid item xs={gridSize} sx={marginTop} paddingRight={paddingSeparator}>
          <Textfield
            id='readyQuantity'
            value={record.readyQuantity}
            onChange={onChangeCallback('readyQuantity')}
            type='number'
            label={strings.READY_TO_PLANT_QUANTITY_REQUIRED}
            tooltipTitle={strings.TOOLTIP_READY_TO_PLANT_QUANTITY}
            errorText={validateFields && !isNumber(record?.readyQuantity) ? strings.REQUIRED_FIELD : ''}
            min={0}
          />
        </Grid>

        <Grid item xs={gridSize} sx={marginTop} paddingLeft={paddingSeparator} />
        <Grid item xs={gridSize} sx={marginTop} paddingRight={paddingSeparator}>
          <Textfield
            id='totalQuantity'
            value={numberFormatter.format(totalQuantity)}
            type='text'
            label={strings.TOTAL_QUANTITY}
            display={true}
            tooltipTitle={strings.TOOLTIP_TOTAL_QUANTITY}
          />
        </Grid>
        <Grid item xs={12} sx={marginTop}>
          <Divider />
        </Grid>

        <Grid item padding={theme.spacing(2, 0, 0, 2)} xs={gridSize}>
          <Dropdown
            id='substrate'
            label={strings.SUBSTRATE}
            selectedValue={batchSubstrateEnumToLocalized(record.substrate)}
            options={nurserySubstratesLocalized()}
            onChange={handleSubstrateChange}
            fullWidth={true}
          />
        </Grid>
        <Grid item padding={theme.spacing(2, 0, 0, 2)} xs={gridSize} sx={{ alignSelf: 'flex-end' }}>
          {record.substrate === strings.OTHER && (
            <Textfield
              preserveNewlines={true}
              id='substrateNotes'
              value={record.substrateNotes}
              type='text'
              label=''
              onChange={onChangeCallback('substrateNotes')}
            />
          )}
        </Grid>
        <Grid item padding={theme.spacing(2, 0, 0, 2)} xs={gridSize}>
          <Dropdown
            id='treatment'
            label={strings.TREATMENT}
            selectedValue={record.treatment}
            options={treatments()}
            onChange={onChangeCallback('treatment')}
            fullWidth={true}
          />
        </Grid>
        <Grid item padding={theme.spacing(2, 0, 0, 2)} xs={gridSize} sx={{ alignSelf: 'flex-end' }}>
          {record.treatment === strings.OTHER && (
            <Textfield
              id='treatmentNotes'
              value={record.treatmentNotes}
              type='text'
              label=''
              onChange={onChangeCallback('treatmentNotes')}
            />
          )}
        </Grid>
        <Grid item xs={12} sx={marginTop}>
          <Divider />
        </Grid>
        <Grid item padding={theme.spacing(2, 0, 0, 2)} xs={12}>
          <Textfield
            id='notes'
            value={record?.notes}
            onChange={onChangeCallback('notes')}
            type='textarea'
            label={strings.NOTES}
          />
        </Grid>

        <Grid item padding={theme.spacing(2, 0, 0, 2)} xs={12}>
          <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
            {strings.PHOTOS}
          </Typography>
          <Box display='flex' flexWrap='wrap' flexDirection='row'>
            {photos.map((photo, index) => {
              const handleRemovePhoto = getHandleRemovePhoto(photo.id, index);

              return (
                <Box
                  key={index}
                  display='flex'
                  position='relative'
                  height={122}
                  width={122}
                  marginRight={isMobile ? 2 : 3}
                  marginTop={1}
                  border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
                  sx={{ cursor: 'pointer' }}
                >
                  <Button
                    icon='iconTrashCan'
                    onClick={handleRemovePhoto}
                    size='small'
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      backgroundColor: theme.palette.TwClrBgDanger,
                    }}
                  />
                  <img
                    src={`${photo.url}?maxHeight=120&maxWidth=120`}
                    alt={`${index}`}
                    style={{
                      margin: 'auto auto',
                      objectFit: 'contain',
                      display: 'flex',
                      maxWidth: '120px',
                      maxHeight: '120px',
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        </Grid>
        <Container maxWidth={false}>
          <SelectPhotos onPhotosChanged={onPhotosChanged} multipleSelection={true} />
        </Container>
      </Grid>
    </DialogBox>
  ) : null;
}
