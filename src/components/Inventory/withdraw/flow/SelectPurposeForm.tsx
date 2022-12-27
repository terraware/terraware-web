import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { DatePicker, Dropdown, Textfield, DropdownItem } from '@terraware/web-components';
import { getAllNurseries, isContributor } from 'src/utils/organization';
import { listPlantingSites } from 'src/api/tracking/tracking';
import { getAllSpecies } from 'src/api/species/species';
import { PlantingSite } from 'src/api/types/tracking';
import useSnackbar from 'src/utils/useSnackbar';
import PageForm from 'src/components/common/PageForm';
import ErrorMessage from 'src/components/common/ErrorMessage';
import PlotSelector, { PlotInfo, ZoneInfo } from 'src/components/PlotSelector';

const useStyles = makeStyles((theme: Theme) => ({
  withdrawnQuantity: {
    '&> #withdrawnQuantity': {
      height: '44px',
    },
  },
  notReadyQuantityWithdrawn: {
    '&> #notReadyQuantityWithdrawn': {
      height: '44px',
    },
  },
  readyQuantityWithdrawn: {
    '&> #readyQuantityWithdrawn': {
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
  const [readyQuantityWithdrawn, setReadyQuantityWithdrawn] = useState<number>();
  const [notReadyQuantityWithdrawn, setNotReadyQuantityWithdrawn] = useState<number>();
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>();
  const [zones, setZones] = useState<any[]>([]);
  const [zoneId, setZoneId] = useState<number>();
  const [snackbar] = useState(useSnackbar());
  const [noReadySeedlings, setNoReadySeedlings] = useState<boolean>(false);
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const classes = useStyles();
  const [selectedPlot, setSelectedPlot] = useState<PlotInfo>();
  const [selectedZone, setSelectedZone] = useState<ZoneInfo>();
  const [speciesMap, setSpeciesMap] = useState<{ [key: string]: string }>({});

  const updateField = (field: keyof NurseryWithdrawalRequest, value: any) => {
    setLocalRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fetchPlantingSites = useCallback(async () => {
    if (plantingSites) {
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
    setSelectedZone(undefined);
    setSelectedPlot(undefined);
    const plantingSite = plantingSites ? plantingSites.find((site) => site.id.toString() === value.toString()) : null;
    setZones(plantingSite?.plantingZones || []);
    setZoneId(undefined);
  };

  const onChangePlantingZone = (value: any) => {
    setSelectedZone(value);
    setSelectedPlot(undefined);
    setZoneId(value?.id);
    updateField('plotId', undefined); // clear plot id when there's a new planting zone id
  };

  const onChangePlot = (value: any) => {
    setSelectedPlot(value);
    updateField('plotId', value?.id);
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
    if (isSingleBatch && isOutplant) {
      if (withdrawnQuantity) {
        if (isNaN(withdrawnQuantity)) {
          setIndividualError('withdrawnQuantity', strings.INVALID_VALUE);
          return false;
        } else {
          if (withdrawnQuantity > +batches[0].readyQuantity) {
            setIndividualError('withdrawnQuantity', strings.WITHDRAWN_QUANTITY_ERROR);
            return false;
          }
        }
      } else {
        setIndividualError('withdrawnQuantity', strings.REQUIRED_FIELD);
        return false;
      }
    }
    setIndividualError('withdrawnQuantity', '');
    return true;
  };

  const validateReadyAndNotReadyQuantities = () => {
    let bothValid = true;
    if (isSingleBatch && !isOutplant) {
      if (!notReadyQuantityWithdrawn && notReadyQuantityWithdrawn !== 0) {
        setIndividualError('notReadyQuantityWithdrawn', strings.REQUIRED_FIELD);
        bothValid = false;
      } else {
        if (isNaN(notReadyQuantityWithdrawn)) {
          setIndividualError('notReadyQuantityWithdrawn', strings.INVALID_VALUE);
          bothValid = false;
        } else {
          if (+notReadyQuantityWithdrawn > +batches[0].notReadyQuantity) {
            setIndividualError('notReadyQuantityWithdrawn', strings.WITHDRAWN_QUANTITY_ERROR);
            bothValid = false;
          } else {
            setIndividualError('notReadyQuantityWithdrawn', '');
          }
        }
      }

      if (!readyQuantityWithdrawn && readyQuantityWithdrawn !== 0) {
        setIndividualError('readyQuantityWithdrawn', strings.REQUIRED_FIELD);
        bothValid = false;
      } else {
        if (isNaN(readyQuantityWithdrawn)) {
          setIndividualError('readyQuantityWithdrawn', strings.INVALID_VALUE);
          bothValid = false;
        } else {
          if (+readyQuantityWithdrawn > +batches[0].readyQuantity) {
            setIndividualError('readyQuantityWithdrawn', strings.WITHDRAWN_QUANTITY_ERROR);
            bothValid = false;
          } else {
            setIndividualError('readyQuantityWithdrawn', '');
          }
        }
      }
    }
    return bothValid;
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
    const readyAndNotReadyInvalid = !validateReadyAndNotReadyQuantities();
    if (
      fieldsErrors.withdrawDate ||
      nurseryTransferInvalid ||
      selectedNurseryInvalid ||
      withdrawnQuantityInvalid ||
      plantingSitePlotInvalid ||
      readyAndNotReadyInvalid
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
        .filter((batch) => {
          return batch.facility_id.toString() === selectedNursery && (!isOutplant || +batch.readyQuantity > 0);
        })
        .map((batch) => ({
          batchId: batch.id,
          notReadyQuantityWithdrawn: isSingleOutplant ? 0 : isSingleBatch ? notReadyQuantityWithdrawn || 0 : 0,
          readyQuantityWithdrawn: isSingleOutplant
            ? withdrawnQuantity || 0
            : isSingleBatch
            ? readyQuantityWithdrawn || 0
            : 0,
        })),
    });
  };

  const onChangeFromNursery = (facilityIdSelected: string) => {
    setSelectedNursery(facilityIdSelected);
  };

  const getNurseriesOptions = () => {
    const nurseries = batches
      .filter((batch) => {
        if (isOutplant) {
          return +batch.readyQuantity > 0;
        }
        return +batch.totalQuantity > 0;
      })
      .reduce((acc, batch) => {
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
    if (!plantingSites) {
      return [];
    }
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
    setWithdrawnQuantity(
      (readyQuantityWithdrawn ? +readyQuantityWithdrawn : 0) +
        (notReadyQuantityWithdrawn ? +notReadyQuantityWithdrawn : 0)
    );
  }, [readyQuantityWithdrawn, notReadyQuantityWithdrawn]);

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

  useEffect(() => {
    const fetchSpecies = async () => {
      const result = await getAllSpecies(organization.id);
      const speciesNamesMap = (result.species || []).reduce((acc, sp) => {
        const { scientificName, commonName } = sp;
        return {
          ...acc,
          [sp.id.toString()]: commonName ? `${scientificName} (${commonName})` : scientificName,
        };
      }, {});
      setSpeciesMap(speciesNamesMap);
    };

    fetchSpecies();
  }, [organization.id]);

  const batchesFromNursery = useMemo(() => {
    return batches.filter((batch) => !selectedNursery || batch.facility_id.toString() === selectedNursery);
  }, [batches, selectedNursery]);

  const batchSpeciesNames = useMemo(() => {
    const batchSpeciesIds = batchesFromNursery.map((batch) => batch.species_id.toString());
    const speciesIds: string[] = Array.from(new Set(batchSpeciesIds));
    return speciesIds.map((speciesId: string) => speciesMap[speciesId] || strings.NAME_UNKNOWN);
  }, [batchesFromNursery, speciesMap]);

  const totalReadyQuantity = useMemo(() => {
    return batchesFromNursery.reduce((acc, batch) => acc + (+batch.readyQuantity || 0), 0);
  }, [batchesFromNursery]);

  return (
    <PageForm onCancel={onCancel} onSave={onNextHandler} saveButtonText={saveText} saveDisabled={noReadySeedlings}>
      <Container
        maxWidth={false}
        sx={{
          display: 'flex',
          margin: '0 auto',
          width: isMobile ? '100%' : '700px',
          paddingLeft: theme.spacing(isMobile ? 0 : 4),
          paddingRight: theme.spacing(isMobile ? 0 : 4),
          paddingTop: theme.spacing(5),
        }}
      >
        <Grid
          container
          width={isMobile ? '100%' : '700px'}
          sx={{
            backgroundColor: theme.palette.TwClrBg,
            borderRadius: theme.spacing(4),
            padding: theme.spacing(3),
          }}
        >
          <Grid item xs={12}>
            <Typography variant='h2' sx={{ fontSize: '18px', fontWeight: 'bold', marginBottom: theme.spacing(2) }}>
              {strings.WITHDRAWAL_DETAILS}
            </Typography>
            <Typography>{strings.WITHDRAW_INSTRUCTIONS}</Typography>
            <Grid xs={12} padding={theme.spacing(4, 0, 0)}>
              <Typography fontSize='14px' fontWeight={400} lineHeight='20px'>
                {strings.SPECIES_SELECTED}
              </Typography>
              <Typography fontSize='16px' fontWeight={500} lineHeight='24px' marginTop='12px'>
                {batchSpeciesNames.join(', ')}
              </Typography>
            </Grid>
            <Grid xs={12} padding={theme.spacing(4, 0, 0)}>
              <FormControl>
                <FormLabel
                  sx={{
                    color: theme.palette.TwClrTxtSecondary,
                    fontSize: '14px',
                    '&.MuiFormLabel-root.Mui-focused': {
                      color: theme.palette.TwClrTxtSecondary,
                    },
                  }}
                >
                  {strings.PURPOSE_REQUIRED}
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
                  label={strings.FROM_NURSERY_REQUIRED}
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
                    label={strings.TO_PLANTING_SITE_REQUIRED}
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
                <PlotSelector
                  zones={zones}
                  onZoneSelected={onChangePlantingZone}
                  onPlotSelected={onChangePlot}
                  zoneError={fieldsErrors.zoneId}
                  plotError={fieldsErrors.plotId}
                  selectedPlot={selectedPlot}
                  selectedZone={selectedZone}
                />
              </>
            )}
            <Grid display='flex' flexDirection={isMobile ? 'column' : 'row'}>
              {isSingleBatch && isOutplant && (
                <>
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
                  <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }} paddingLeft={isMobile ? 0 : 1}>
                    <Textfield
                      label={strings.TOTAL_READY_QUANTITY}
                      id='totalReadyQuantity'
                      type='text'
                      value={totalReadyQuantity}
                      display={true}
                    />
                  </Grid>
                </>
              )}
            </Grid>
            <>
              {isSingleBatch && !isOutplant && (
                <>
                  <Grid display='flex' flexDirection={isMobile ? 'column' : 'row'}>
                    <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }} paddingRight={isMobile ? 0 : 1}>
                      <Textfield
                        label={strings.NOT_READY_QUANTITY_REQUIRED}
                        id='notReadyQuantityWithdrawn'
                        onChange={(id: string, value: unknown) => setNotReadyQuantityWithdrawn(value as number)}
                        type='text'
                        value={notReadyQuantityWithdrawn}
                        tooltipTitle={strings.TOOLTIP_NOT_READY_QUANTITY}
                        className={classes.notReadyQuantityWithdrawn}
                        errorText={fieldsErrors.notReadyQuantityWithdrawn}
                      />
                    </Grid>
                    <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }} paddingLeft={isMobile ? 0 : 1}>
                      <DatePicker
                        id='withdrawnDate'
                        label={strings.ESTIMATED_READY_DATE}
                        aria-label={strings.ESTIMATED_READY_DATE}
                        value={localRecord.readyByDate}
                        onChange={onChangeDate}
                      />
                    </Grid>
                  </Grid>
                  <Grid display='flex' flexDirection={isMobile ? 'column' : 'row'}>
                    <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }} paddingRight={1}>
                      <Textfield
                        label={strings.READY_QUANTITY_REQUIRED}
                        id='readyQuantityWithdrawn'
                        onChange={(id: string, value: unknown) => setReadyQuantityWithdrawn(value as number)}
                        type='text'
                        value={readyQuantityWithdrawn}
                        tooltipTitle={strings.TOOLTIP_READY_QUANTITY}
                        className={classes.readyQuantityWithdrawn}
                        errorText={fieldsErrors.readyQuantityWithdrawn}
                      />
                    </Grid>
                    <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }} paddingLeft={isMobile ? 0 : 1}>
                      <Textfield
                        label={strings.WITHDRAW_QUANTITY}
                        id='withdrawQuantity'
                        onChange={(id: string, value: unknown) => setWithdrawnQuantity(value as number)}
                        type='text'
                        value={withdrawnQuantity}
                        display={true}
                      />
                    </Grid>
                  </Grid>
                </>
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
            </>
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
    </PageForm>
  );
}
