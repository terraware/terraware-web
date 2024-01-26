import { useEffect, useState, useMemo } from 'react';
import { Box, Container, Divider, Grid, Theme, Typography, useTheme } from '@mui/material';
import { Button, DialogBox, Dropdown, Textfield } from '@terraware/web-components';
import DatePicker from 'src/components/common/DatePicker';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { Batch, BatchPhoto } from 'src/types/Batch';
import { NurseryBatchService } from 'src/services';
import { useOrganization } from 'src/providers/hooks';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';
import { Facility } from 'src/types/Facility';
import { getNurseryById } from 'src/utils/organization';
import getDateDisplayValue from '@terraware/web-components/utils/date';
import { useNumberFormatter } from 'src/utils/useNumber';
import { useUser } from 'src/providers';
import {
  batchSubstrateEnumToLocalized,
  batchSubstrateLocalizedToEnum,
  nurserySubstratesLocalized,
  treatments,
} from 'src/types/Accession';
import SelectPhotos from '../../components/common/SelectPhotos';
import { makeStyles } from '@mui/styles';
import { BATCH_PHOTO_ENDPOINT } from 'src/services/NurseryBatchService';
import { isNumber } from 'src/types/utils';

export interface BatchDetailsModalProps {
  onClose: () => void;
  batch: Batch;
  reload: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  removePhoto: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: theme.palette.TwClrBgDanger,
  },
  thumbnail: {
    margin: 'auto auto',
    objectFit: 'contain',
    display: 'flex',
    maxWidth: '120px',
    maxHeight: '120px',
  },
}));

type BatchPhotoWithUrl = BatchPhoto & { url: string };

export default function BatchDetailsModal(props: BatchDetailsModalProps): JSX.Element | null {
  const classes = useStyles();
  const numberFormatter = useNumberFormatter();
  const { user } = useUser();
  const { selectedOrganization } = useOrganization();
  const { onClose, batch, reload } = props;

  const [record, setRecord, onChange] = useForm(batch);
  const snackbar = useSnackbar();
  const theme = useTheme();
  const [validateFields, setValidateFields] = useState<boolean>(false);

  const { isMobile } = useDeviceInfo();
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [facility, setFacility] = useState<Facility>();

  const tz = useLocationTimeZone().get(facility);
  const [timeZone, setTimeZone] = useState(tz.id);

  const numericFormatter = useMemo(() => numberFormatter(user?.locale), [numberFormatter, user?.locale]);

  const [photos, setPhotos] = useState<BatchPhotoWithUrl[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [photoIdsToRemove, setPhotoIdsToRemove] = useState<number[]>([]);

  const onPhotosChanged = (photosList: File[]) => {
    setNewPhotos(photosList);
  };

  const onRemovePhoto = (id: number) => {
    const newIds = [...photoIdsToRemove];
    newIds.push(id);
    setPhotoIdsToRemove(newIds);
  };

  const removePhoto = (id: number, index: number) => {
    photos.splice(index, 1);
    onRemovePhoto(id);
  };

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

    getPhotos();
  }, [batch, snackbar]);

  useEffect(() => {
    if (record) {
      const notReadyQuantity = record?.notReadyQuantity ?? 0;
      const readyQuantity = record?.readyQuantity ?? 0;
      setTotalQuantity(+notReadyQuantity + +readyQuantity);
    }
  }, [record, selectedOrganization]);

  useEffect(() => {
    if (record?.facilityId) {
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
    const foundFacility = selectedOrganization.facilities?.find(
      (f) => f.id.toString() === batch?.facilityId.toString()
    );
    if (foundFacility) {
      setFacility(foundFacility);
    }
  }, [batch, setRecord, selectedOrganization]);

  const MANDATORY_FIELDS = ['germinatingQuantity', 'notReadyQuantity', 'readyQuantity', 'addedDate'] as const;
  type MandatoryField = (typeof MANDATORY_FIELDS)[number];

  const hasErrors = () => {
    if (record) {
      return MANDATORY_FIELDS.some((field: MandatoryField) => record[field] === '' || record[field] === undefined);
    }
    return true;
  };

  const updatePhotos = async () => {
    await NurseryBatchService.uploadBatchPhotos(batch.id, newPhotos);
    setNewPhotos([]);
    if (photoIdsToRemove) {
      await NurseryBatchService.deleteBatchPhotos(batch.id, photoIdsToRemove);
      setPhotoIdsToRemove([]);
    }
  };

  const saveBatch = async () => {
    if (record) {
      if (hasErrors()) {
        setValidateFields(true);
        return;
      }

      let response;
      let responseQuantities = { requestSucceeded: true };

      response = await NurseryBatchService.updateBatch(record);
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
  };

  const onCloseHandler = () => {
    setValidateFields(false);
    onClose();
  };

  const gridSize = () => (isMobile ? 12 : 6);

  const paddingSeparator = () => (isMobile ? 0 : 1.5);

  const changeDate = (id: string, value?: any) => {
    const date = value ? getDateDisplayValue(value.getTime(), tz.id) : null;
    onChange(id, date);
  };

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
        <Button id='saveBatchDetails' onClick={saveBatch} label={strings.SAVE} key='button-2' />,
      ]}
      scrolled={true}
    >
      <Grid container item xs={12} spacing={2} textAlign='left'>
        <Grid item xs={12} sx={marginTop}>
          <Textfield
            id='germinatingQuantity'
            value={record.germinatingQuantity}
            onChange={(value) => onChange('germinatingQuantity', value)}
            type='number'
            label={strings.GERMINATING_QUANTITY_REQUIRED}
            tooltipTitle={strings.TOOLTIP_GERMINATING_QUANTITY}
            errorText={validateFields && !isNumber(record?.germinatingQuantity) ? strings.REQUIRED_FIELD : ''}
            min={0}
          />
        </Grid>
        <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
          <Textfield
            id='notReadyQuantity'
            value={record.notReadyQuantity}
            onChange={(value) => onChange('notReadyQuantity', value)}
            type='number'
            label={strings.NOT_READY_QUANTITY_REQUIRED}
            tooltipTitle={strings.TOOLTIP_NOT_READY_QUANTITY}
            errorText={validateFields && !isNumber(record?.notReadyQuantity) ? strings.REQUIRED_FIELD : ''}
            min={0}
          />
        </Grid>
        <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator}>
          <DatePicker
            id='readyByDate'
            label={strings.ESTIMATED_READY_DATE}
            aria-label={strings.ESTIMATED_READY_DATE}
            value={record.readyByDate}
            onChange={(value) => changeDate('readyByDate', value)}
            defaultTimeZone={timeZone}
          />
        </Grid>
        <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
          <Textfield
            id='readyQuantity'
            value={record.readyQuantity}
            onChange={(value) => onChange('readyQuantity', value)}
            type='number'
            label={strings.READY_QUANTITY_REQUIRED}
            tooltipTitle={strings.TOOLTIP_READY_QUANTITY}
            errorText={validateFields && !isNumber(record?.readyQuantity) ? strings.REQUIRED_FIELD : ''}
            min={0}
          />
        </Grid>

        <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator} />
        <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
          <Textfield
            id='totalQuantity'
            value={numericFormatter.format(totalQuantity)}
            type='text'
            label={strings.TOTAL_QUANTITY}
            display={true}
            tooltipTitle={strings.TOOLTIP_TOTAL_QUANTITY}
          />
        </Grid>
        <Grid item xs={12} sx={marginTop}>
          <Divider />
        </Grid>

        <Grid padding={theme.spacing(2, 0, 0, 2)} xs={gridSize()}>
          <Dropdown
            id='substrate'
            label={strings.SUBSTRATE}
            selectedValue={batchSubstrateEnumToLocalized(record.substrate)}
            options={nurserySubstratesLocalized()}
            onChange={(value) => onChange('substrate', batchSubstrateLocalizedToEnum(value))}
            fullWidth={true}
          />
        </Grid>
        <Grid padding={theme.spacing(2, 0, 0, 2)} xs={gridSize()} sx={{ alignSelf: 'flex-end' }}>
          {record.substrate === strings.OTHER && (
            <Textfield
              preserveNewlines={true}
              id='substrateNotes'
              value={record.substrateNotes}
              type='text'
              label=''
              onChange={(value) => onChange('substrateNotes', value)}
            />
          )}
        </Grid>
        <Grid padding={theme.spacing(2, 0, 0, 2)} xs={gridSize()}>
          <Dropdown
            id='treatment'
            label={strings.TREATMENT}
            selectedValue={record.treatment}
            options={treatments()}
            onChange={(value) => onChange('treatment', value)}
            fullWidth={true}
          />
        </Grid>
        <Grid padding={theme.spacing(2, 0, 0, 2)} xs={gridSize()} sx={{ alignSelf: 'flex-end' }}>
          {record.treatment === strings.OTHER && (
            <Textfield
              id='treatmentNotes'
              value={record.treatmentNotes}
              type='text'
              label=''
              onChange={(value) => onChange('treatmentNotes', value)}
            />
          )}
        </Grid>
        <Grid item xs={12} sx={marginTop}>
          <Divider />
        </Grid>
        <Grid padding={theme.spacing(2, 0, 0, 2)} xs={12}>
          <Textfield
            id='notes'
            value={record?.notes}
            onChange={(value) => onChange('notes', value)}
            type='textarea'
            label={strings.NOTES}
          />
        </Grid>

        <Grid padding={theme.spacing(2, 0, 0, 2)} xs={12}>
          <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
            {strings.PHOTOS}
          </Typography>
          <Box display='flex' flexWrap='wrap' flexDirection='row'>
            {photos.map((photo, index) => (
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
                  onClick={() => removePhoto(photo.id, index)}
                  size='small'
                  className={classes.removePhoto}
                />
                <img className={classes.thumbnail} src={`${photo.url}?maxHeight=120&maxWidth=120`} alt={`${index}`} />
              </Box>
            ))}
          </Box>
        </Grid>
        <Container maxWidth={false}>
          <SelectPhotos onPhotosChanged={onPhotosChanged} multipleSelection={true} />
        </Container>
      </Grid>
    </DialogBox>
  ) : null;
}
