import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import strings from 'src/strings';
import {
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Theme,
  Typography,
  useTheme,
} from '@mui/material';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { NurseryWithdrawalRequest, NurseryWithdrawalPurposes } from 'src/api/types/batch';
import { isInTheFuture } from '@terraware/web-components/utils';
import { ServerOrganization } from 'src/types/Organization';
import { APP_PATHS } from 'src/constants';
import Divisor from 'src/components/common/Divisor';
import { DatePicker, Dropdown, Textfield } from '@terraware/web-components';
import { getAllNurseries, isContributor } from 'src/utils/organization';
import { listPlantingSites } from 'src/api/tracking/tracking';
import { PlantingSite, Plot } from 'src/api/types/tracking';
import useSnackbar from 'src/utils/useSnackbar';
import { DropdownItem } from '@terraware/web-components/components/Dropdown';
import FormBottomBar from 'src/components/common/FormBottomBar';
import ErrorMessage from 'src/components/common/ErrorMessage';

const useStyles = makeStyles((theme: Theme) => ({
  withdrawnQuantity: {
    '&> #withdrawnQuantity': {
      height: '44px',
    },
  },
}));

type SelectPurposeFormProps = {
  organization: ServerOrganization;
  onNext: (withdrawal: NurseryWithdrawalRequest) => void;
  batches: any[];
  nurseryWithdrawal: NurseryWithdrawalRequest;
  onCancel: () => void;
  saveText: string;
};

export default function SelectPurposeForm(props: SelectPurposeFormProps): JSX.Element {
  const { organization, nurseryWithdrawal, onNext, batches, onCancel, saveText } = props;
  const { OUTPLANT, NURSERY_TRANSFER, DEAD, OTHER } = NurseryWithdrawalPurposes;
  const contributor = isContributor(organization);
  const [isNurseryTransfer, setIsNurseryTransfer] = useState(contributor ? true : false);
  const [isOutplant, setIsOutplant] = useState(nurseryWithdrawal.purpose === OUTPLANT);
  const [fieldsErrors, setFieldsErrors] = useState<{ [key: string]: string | undefined }>({});
  const [localRecord, setLocalRecord] = useState<NurseryWithdrawalRequest>(nurseryWithdrawal);
  const [selectedNursery, setSelectedNursery] = useState<string>();
  const [destinationNurseriesOptions, setDestinationNurseriesOptions] = useState<DropdownItem[]>();
  const [isSingleBatch] = useState<boolean>(batches.length === 1);
  const [withdrawnQuantity, setWithdrawnQuantity] = useState<number>();
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [plots, setPlots] = useState<any[]>([]);
  const [zoneId, setZoneId] = useState<string | undefined>();
  const [snackbar] = useState(useSnackbar());
  const [noReadySeedlings, setNoReadySeedlings] = useState<boolean>(false);
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const classes = useStyles();

  const updateField = (field: keyof NurseryWithdrawalRequest, value: any) => {
    setLocalRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fetchPlantingSites = useCallback(async () => {
    if (plantingSites.length) {
      return;
    }
    const response = await listPlantingSites(organization.id, true);
    if (response.requestSucceeded && response.sites) {
      setPlantingSites(response.sites);
    } else {
      snackbar.toastError(response.error);
    }
  }, [organization.id, plantingSites, snackbar]);

  const onChangePurpose = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value;
    updateField('purpose', value);
    if (value === NURSERY_TRANSFER) {
      setIsNurseryTransfer(true);
    } else {
      setIsNurseryTransfer(false);
    }
    const outplant = value === OUTPLANT;
    setIsOutplant(outplant);
    if (outplant) {
      fetchPlantingSites();
    }
  };

  const onChangePlantingSite = (value: string) => {
    updateField('plotId', undefined); // clear plot id when there's a new planting site id
    updateField('plantingSiteId', value);
    setZoneId(undefined);
    const plantingSite = plantingSites.find((site) => site.id.toString() === value.toString());
    if (!plantingSite) {
      return;
    }
    if (plantingSite.plantingZones) {
      setZones(
        plantingSite.plantingZones.map((plantingZone) => ({
          value: plantingZone.id.toString(),
          label: plantingZone.name,
          plots: plantingZone.plots,
        }))
      );
    } else {
      setZones([]);
    }
    setPlots([]);
  };

  const onChangePlantingZone = (value: string) => {
    updateField('plotId', undefined); // clear plot id when there's a new planting zone id
    setZoneId(value);
    const plantingZone = zones.find((zone) => zone.value.toString() === value);
    if (!plantingZone) {
      setPlots([]);
    }
    setPlots(
      plantingZone.plots.map((plot: Plot) => ({
        label: plot.fullName || plot.name,
        value: plot.id.toString(),
      }))
    );
  };

  const setIndividualError = (id: string, error?: string) => {
    setFieldsErrors((prev) => ({
      ...prev,
      [id]: error,
    }));
  };

  const validateDate = (id: string, value?: any) => {
    if (!value && id === 'date') {
      setIndividualError('date', strings.REQUIRED_FIELD);
      return false;
    } else if (isNaN(value.getTime())) {
      setIndividualError(id, strings.INVALID_DATE);
      return false;
    } else if (isInTheFuture(value) && id === 'date') {
      setIndividualError('date', strings.NO_FUTURE_DATES);
      return false;
    } else {
      setIndividualError(id, '');
      return true;
    }
  };

  const onChangeDate = (id: string, value?: any) => {
    const valid = validateDate(id, value);
    if (valid) {
      updateField('withdrawnDate', value);
    }
  };

  const validateNurseryTransfer = () => {
    if (isNurseryTransfer) {
      if (!localRecord.destinationFacilityId) {
        setIndividualError('destinationFacilityId', strings.REQUIRED_FIELD);
        return false;
      }
    }
    return true;
  };

  const validateSelectedNursery = () => {
    if (!selectedNursery) {
      setIndividualError('fromFacilityId', strings.REQUIRED_FIELD);
      return false;
    }
    return true;
  };

  const validateWithdrawnQuantity = () => {
    if (!withdrawnQuantity && isSingleBatch && isOutplant) {
      setIndividualError('withdrawnQuantity', strings.REQUIRED_FIELD);
      return false;
    }
    setIndividualError('withdrawnQuantity', '');
    return true;
  };

  const validatePlantingSitePlot = () => {
    setIndividualError('plantingSiteId', '');
    setIndividualError('zoneId', '');
    setIndividualError('plotId', '');

    if (!isOutplant) {
      return true;
    }

    if (!localRecord.plantingSiteId) {
      setIndividualError('plantingSiteId', strings.REQUIRED_FIELD);
    }

    if (!zones.length) {
      // zone/plot not required if site has no zones/plots
      return !!localRecord.plantingSiteId;
    }

    if (!zoneId) {
      setIndividualError('zoneId', strings.REQUIRED_FIELD);
    }

    if (!localRecord.plotId) {
      setIndividualError('plotId', strings.REQUIRED_FIELD);
    }

    return localRecord.plantingSiteId && localRecord.plotId;
  };

  const onNextHandler = () => {
    const nurseryTransferInvalid = !validateNurseryTransfer();
    const selectedNurseryInvalid = !validateSelectedNursery();
    const withdrawnQuantityInvalid = !validateWithdrawnQuantity();
    const plantingSitePlotInvalid = !validatePlantingSitePlot();
    if (
      fieldsErrors.withdrawDate ||
      nurseryTransferInvalid ||
      selectedNurseryInvalid ||
      withdrawnQuantityInvalid ||
      plantingSitePlotInvalid
    ) {
      return;
    }

    const isSingleOutplant = isSingleBatch && isOutplant;

    onNext({
      ...localRecord,
      destinationFacilityId: isNurseryTransfer ? localRecord.destinationFacilityId : undefined,
      plantingSiteId: isOutplant ? localRecord.plantingSiteId : undefined,
      plotId: isOutplant ? localRecord.plotId : undefined,
      facilityId: Number(selectedNursery as string),
      batchWithdrawals: batches
        .filter((batch) => batch.facility_id.toString() === selectedNursery)
        .map((batch) => ({
          batchId: batch.id,
          notReadyQuantityWithdrawn: isSingleOutplant ? 0 : isSingleBatch ? batch.notReadyQuantity : 0,
          readyQuantityWithdrawn: isSingleOutplant ? withdrawnQuantity : isSingleBatch ? batch.readyQuantity : 0,
        })),
    });
  };

  const onChangeFromNursery = (facilityIdSelected: string) => {
    setSelectedNursery(facilityIdSelected);
  };

  const getNurseriesOptions = () => {
    const nurseries = batches.reduce((acc, batch) => {
      if (!acc[batch.facility_id.toString()]) {
        acc[batch.facility_id.toString()] = { label: batch.facility_name, value: batch.facility_id };
      }
      return acc;
    }, {});

    const options: DropdownItem[] = Object.values(nurseries);

    if (options.length === 1 && !selectedNursery) {
      setSelectedNursery(options[0].value);
    }
    return options;
  };

  const getPlantingSitesOptions = () => {
    return plantingSites.map((plantingSite) => ({
      label: plantingSite.name,
      value: plantingSite.id.toString(),
    }));
  };

  const gridSize = () => (isMobile ? 12 : 6);

  useEffect(() => {
    const allNurseries = getAllNurseries(organization);
    const destinationNurseries = allNurseries.filter((nursery) => nursery.id.toString() !== selectedNursery);
    setDestinationNurseriesOptions(
      destinationNurseries.map((nursery) => ({ label: nursery.name, value: nursery.id.toString() }))
    );
    if (isOutplant) {
      fetchPlantingSites();
    }
  }, [selectedNursery, organization, fetchPlantingSites, isOutplant]);

  useEffect(() => {
    if (localRecord.purpose === OUTPLANT) {
      const hasReadyQuantities = batches.some((batch) => {
        if (selectedNursery && batch.facility_id.toString() !== selectedNursery) {
          return false;
        }
        return Number(batch.readyQuantity) > 0;
      });

      if (!hasReadyQuantities) {
        if (!noReadySeedlings) {
          setNoReadySeedlings(true);
          snackbar.toastError(
            strings.NO_SEEDLINGS_AVAILABLE_TO_OUTPLANT_DESCRIPTION,
            strings.NO_SEEDLINGS_AVAILABLE_TO_OUTPLANT_TITLE
          );
        }
        return;
      }
    }
    setNoReadySeedlings(false);
  }, [localRecord.purpose, noReadySeedlings, snackbar, selectedNursery, OUTPLANT, batches]);

  return (
    <>
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
        <Grid container minWidth={isMobile ? 0 : 700}>
          <Grid item xs={12}>
            <Typography variant='h2' sx={{ fontSize: '18px', fontWeight: 'bold', marginBottom: theme.spacing(2) }}>
              {strings.WITHDRAWAL_DETAILS}
            </Typography>
            <Typography>{strings.WITHDRAW_INSTRUCTIONS}</Typography>
            <Grid xs={12} padding={theme.spacing(4, 0, 0, 2)}>
              <FormControl>
                <FormLabel sx={{ color: theme.palette.TwClrTxtSecondary, fontSize: '14px' }}>
                  {strings.PURPOSE}
                </FormLabel>
                <RadioGroup name='radio-buttons-purpose' value={localRecord.purpose} onChange={onChangePurpose}>
                  {!contributor && <FormControlLabel value={OUTPLANT} control={<Radio />} label={strings.OUTPLANT} />}
                  <FormControlLabel value={NURSERY_TRANSFER} control={<Radio />} label={strings.NURSERY_TRANSFER} />
                  <FormControlLabel value={DEAD} control={<Radio />} label={strings.DEAD} />
                  <FormControlLabel value={OTHER} control={<Radio />} label={strings.OTHER} />
                </RadioGroup>
                {noReadySeedlings && <ErrorMessage message={strings.OUTPLANTS_REQUIRE_READY_SEEDLINGS} />}
              </FormControl>
            </Grid>

            <Grid display='flex'>
              <Grid
                item
                xs={isNurseryTransfer && !isMobile ? 6 : 12}
                sx={{ marginTop: theme.spacing(2) }}
                paddingRight={1}
              >
                <Dropdown
                  id='fromFacilityId'
                  placeholder={strings.SELECT}
                  label={strings.FROM_NURSERY}
                  selectedValue={selectedNursery}
                  options={getNurseriesOptions()}
                  onChange={(newValue) => onChangeFromNursery(newValue)}
                  fullWidth={true}
                  errorText={fieldsErrors.fromFacilityId}
                />
              </Grid>

              {isNurseryTransfer && (
                <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }} paddingLeft={1}>
                  <Dropdown
                    id='destinationFacilityId'
                    placeholder={strings.SELECT}
                    label={strings.TO_NURSERY_REQUIRED}
                    selectedValue={localRecord.destinationFacilityId?.toString()}
                    options={destinationNurseriesOptions}
                    onChange={(value) => updateField('destinationFacilityId', value)}
                    errorText={fieldsErrors.destinationFacilityId}
                    fullWidth={true}
                  />
                </Grid>
              )}
            </Grid>
            {isOutplant && (
              <>
                <Divisor mt={3} />
                <Grid xs={12}>
                  <Dropdown
                    id='plantingSiteId'
                    placeholder={strings.SELECT}
                    label={strings.TO_PLANTING_SITE}
                    selectedValue={localRecord.plantingSiteId?.toString()}
                    options={getPlantingSitesOptions()}
                    onChange={(value) => onChangePlantingSite(value)}
                    fullWidth={true}
                    errorText={fieldsErrors.plantingSiteId}
                    tooltipTitle={
                      <a href={APP_PATHS.PLANTING_SITES} target='_blank' rel='noreferrer'>
                        {strings.VIEW_SITES_ZONES_PLOTS}
                      </a>
                    }
                  />
                </Grid>
                <Grid display='flex' margin={theme.spacing(1, 0, 2)} flexDirection={isMobile ? 'column' : 'row'}>
                  <Grid xs={gridSize()} margin={theme.spacing(2, isMobile ? 0 : 2, 0, 0)}>
                    <Dropdown
                      id='plantingSiteId'
                      placeholder={strings.SELECT}
                      label={strings.PLANTING_ZONE}
                      selectedValue={zoneId?.toString()}
                      options={zones}
                      onChange={(value) => onChangePlantingZone(value)}
                      fullWidth={true}
                      errorText={fieldsErrors.zoneId}
                      disabled={!zones.length}
                    />
                  </Grid>
                  <Grid xs={gridSize()} margin={theme.spacing(2, 0, 0)}>
                    <Dropdown
                      id='plantingSiteId'
                      placeholder={strings.SELECT}
                      label={strings.PLOT}
                      selectedValue={localRecord.plotId?.toString()}
                      options={plots}
                      onChange={(value) => updateField('plotId', value)}
                      fullWidth={true}
                      errorText={fieldsErrors.plotId}
                      disabled={!plots.length}
                    />
                  </Grid>
                </Grid>
              </>
            )}
            <Grid display='flex' flexDirection={isMobile ? 'column' : 'row'}>
              {isSingleBatch && isOutplant && (
                <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2), marginRight: theme.spacing(2) }}>
                  <Textfield
                    label={strings.WITHDRAW_QUANTITY_REQUIRED}
                    id='withdrawnQuantity'
                    onChange={(id: string, value: unknown) => setWithdrawnQuantity(value as number)}
                    type='text'
                    value={withdrawnQuantity}
                    errorText={fieldsErrors.withdrawnQuantity}
                    className={classes.withdrawnQuantity}
                  />
                </Grid>
              )}
              <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }}>
                <DatePicker
                  id='withdrawnDate'
                  label={strings.WITHDRAW_DATE_REQUIRED}
                  aria-label={strings.WITHDRAW_DATE_REQUIRED}
                  value={localRecord.withdrawnDate}
                  onChange={onChangeDate}
                  errorText={fieldsErrors.withdrawnDate}
                />
              </Grid>
            </Grid>
            <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
              <Textfield
                id='notes'
                value={localRecord.notes}
                onChange={(id, value) => updateField('notes', value)}
                type='textarea'
                label={strings.NOTES}
              />
            </Grid>
          </Grid>
        </Grid>
      </Container>
      <FormBottomBar
        onCancel={onCancel}
        onSave={onNextHandler}
        saveButtonText={saveText}
        saveDisabled={noReadySeedlings}
      />
    </>
  );
}
