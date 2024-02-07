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
import { NurseryWithdrawalRequest, NurseryWithdrawalPurposes, BatchWithdrawalPayload } from 'src/types/Batch';
import getDateDisplayValue, { getTodaysDateFormatted, isInTheFuture } from '@terraware/web-components/utils/date';
import { APP_PATHS } from 'src/constants';
import { useAppSelector } from 'src/redux/store';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import Divisor from 'src/components/common/Divisor';
import { Dropdown, Textfield, DropdownItem, IconTooltip } from '@terraware/web-components';
import DatePicker from 'src/components/common/DatePicker';
import { getAllNurseries, getNurseryById, isContributor } from 'src/utils/organization';
import { SpeciesService } from 'src/services';
import useSnackbar from 'src/utils/useSnackbar';
import PageForm from 'src/components/common/PageForm';
import SubzoneSelector, { SubzoneInfo, ZoneInfo } from 'src/components/SubzoneSelector';
import { useOrganization } from 'src/providers/hooks';
import { Facility } from 'src/types/Facility';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';
import { useUser } from 'src/providers';
import { useNumberFormatter } from 'src/utils/useNumber';
import isEnabled from 'src/features';
import { SearchResponseElement } from 'src/types/Search';
import ProjectsDropdown from 'src/components/ProjectsDropdown';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { Project } from 'src/types/Project';

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
  germinatingQuantityWithdrawn: {
    '&> #germinatingQuantityWithdrawn': {
      height: '44px',
    },
  },
}));

type SelectPurposeFormProps = {
  onNext: (withdrawal: NurseryWithdrawalRequest) => void;
  batches: SearchResponseElement[];
  nurseryWithdrawal: NurseryWithdrawalRequest;
  onCancel: () => void;
  saveText: string;
  setFilterProjectId: (projectId: number) => void;
};

const { OUTPLANT, NURSERY_TRANSFER, DEAD, OTHER } = NurseryWithdrawalPurposes;

export default function SelectPurposeForm(props: SelectPurposeFormProps): JSX.Element {
  const { nurseryWithdrawal, onNext, batches, onCancel, saveText, setFilterProjectId } = props;

  const { selectedOrganization } = useOrganization();
  const { user } = useUser();
  const numberFormatter = useNumberFormatter();
  const contributor = isContributor(selectedOrganization);
  const snackbar = useSnackbar();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const classes = useStyles();
  const featureFlagProjects = isEnabled('Projects');

  const plantingSites = useAppSelector(selectPlantingSites);
  const projects = useAppSelector(selectProjects);

  const [isNurseryTransfer, setIsNurseryTransfer] = useState(contributor ? true : false);
  const [isOutplant, setIsOutplant] = useState(nurseryWithdrawal.purpose === OUTPLANT);
  const [fieldsErrors, setFieldsErrors] = useState<{ [key: string]: string | undefined }>({});
  const [localRecord, setLocalRecord] = useState<NurseryWithdrawalRequest>(nurseryWithdrawal);
  const [selectedNursery, setSelectedNursery] = useState<Facility>();
  const [destinationNurseriesOptions, setDestinationNurseriesOptions] = useState<DropdownItem[]>();
  const [isSingleBatch] = useState<boolean>(batches.length === 1);
  const [withdrawnQuantity, setWithdrawnQuantity] = useState<number>();
  const [readyQuantityWithdrawn, setReadyQuantityWithdrawn] = useState<number>();
  const [notReadyQuantityWithdrawn, setNotReadyQuantityWithdrawn] = useState<number>();
  const [germinatingQuantityWithdrawn, setGerminatingQuantityWithdrawn] = useState<number>();
  const [zones, setZones] = useState<any[]>([]);
  const [zoneId, setZoneId] = useState<number>();
  const [noReadySeedlings, setNoReadySeedlings] = useState<boolean>(false);
  const [selectedSubzone, setSelectedSubzone] = useState<SubzoneInfo>();
  const [selectedZone, setSelectedZone] = useState<ZoneInfo>();
  const [speciesMap, setSpeciesMap] = useState<{ [key: string]: string }>({});
  const [projectRecord, setProjectRecord] = useState<{ projectId?: number }>({});

  const tz = useLocationTimeZone().get(selectedNursery);
  const [timeZone, setTimeZone] = useState(tz.id);

  const numericFormatter = useMemo(() => numberFormatter(user?.locale), [numberFormatter, user?.locale]);

  const availableProjects = useMemo(
    () =>
      projects?.filter((project: Project) =>
        batches.some(
          (batch: SearchResponseElement) =>
            // Only show projects that are represented within the available batches
            Number(batch.project_id) === project.id &&
            // And apply to the selected facility
            (selectedNursery ? Number(batch.facility_id) === selectedNursery.id : true)
        )
      ),
    [projects, batches, selectedNursery]
  );

  useEffect(() => {
    if (timeZone !== tz.id) {
      setTimeZone(tz.id);
    }
  }, [tz.id, timeZone]);

  useEffect(() => {
    setLocalRecord((previousRecord: NurseryWithdrawalRequest): NurseryWithdrawalRequest => {
      return {
        ...previousRecord,
        withdrawnDate: getTodaysDateFormatted(timeZone),
      };
    });
  }, [timeZone, setLocalRecord]);

  const updateField = (field: keyof NurseryWithdrawalRequest, value: any) => {
    setLocalRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updatePurpose = useCallback((value: string) => {
    updateField('purpose', value);
    if (value === NURSERY_TRANSFER) {
      setIsNurseryTransfer(true);
    } else {
      setIsNurseryTransfer(false);
    }
    const outplant = value === OUTPLANT;
    setIsOutplant(outplant);
  }, []);

  const onChangePurpose = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value;
    updatePurpose(value);
  };

  const onChangePlantingSite = (value: string) => {
    updateField('plantingSubzoneId', undefined); // clear subzone id when there's a new planting site id
    updateField('plantingSiteId', value);
    setSelectedZone(undefined);
    setSelectedSubzone(undefined);
    const plantingSite = plantingSites ? plantingSites.find((site) => site.id.toString() === value.toString()) : null;
    setZones(plantingSite?.plantingZones || []);
    setZoneId(undefined);
  };

  const onChangePlantingZone = (value: any) => {
    setSelectedZone(value);
    setSelectedSubzone(undefined);
    setZoneId(value?.id);
    updateField('plantingSubzoneId', undefined); // clear subzone id when there's a new planting zone id
  };

  const onChangeSubzone = (value: any) => {
    setSelectedSubzone(value);
    updateField('plantingSubzoneId', value?.id);
  };

  const setIndividualError = (id: string, error?: string) => {
    setFieldsErrors((prev) => ({
      ...prev,
      [id]: error,
    }));
  };

  const validateDate = (id: string, value?: any) => {
    if (!value) {
      setIndividualError(id, strings.REQUIRED_FIELD);
      return false;
    } else if (isNaN(value.getTime())) {
      setIndividualError(id, strings.INVALID_DATE);
      return false;
    } else if (isInTheFuture(value.getTime())) {
      setIndividualError(id, strings.NO_FUTURE_DATES);
      return false;
    } else {
      setIndividualError(id, '');
      return true;
    }
  };

  const onChangeDate = (id: 'readyByDate' | 'withdrawnDate', value?: any) => {
    const date = value ? getDateDisplayValue(value.getTime(), timeZone) : null;
    const valid = validateDate(id, value);
    if (valid) {
      updateField(id, date);
    }
  };

  const validateNurseryTransfer = () => {
    if (isNurseryTransfer) {
      if (!localRecord.destinationFacilityId) {
        setIndividualError('destinationFacilityId', strings.REQUIRED_FIELD);
        return false;
      } else {
        setIndividualError('destinationFacilityId', '');
      }
    }
    return true;
  };

  const validateSelectedNursery = () => {
    if (!selectedNursery) {
      setIndividualError('fromFacilityId', strings.REQUIRED_FIELD);
      return false;
    } else {
      setIndividualError('fromFacilityId', '');
      return true;
    }
  };

  const validateWithdrawnQuantity = () => {
    if (isSingleBatch && isOutplant) {
      if (withdrawnQuantity) {
        if (isNaN(withdrawnQuantity)) {
          setIndividualError('withdrawnQuantity', strings.INVALID_VALUE);
          return false;
        } else {
          if (withdrawnQuantity > Number(batches[0]['readyQuantity(raw)'])) {
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

  const validateGerminatingReadyAndNotReadyQuantities = () => {
    let allValid = true;
    if (isSingleBatch && !isOutplant) {
      if (!notReadyQuantityWithdrawn && notReadyQuantityWithdrawn !== 0) {
        setIndividualError('notReadyQuantityWithdrawn', strings.REQUIRED_FIELD);
        allValid = false;
      } else {
        if (isNaN(notReadyQuantityWithdrawn)) {
          setIndividualError('notReadyQuantityWithdrawn', strings.INVALID_VALUE);
          allValid = false;
        } else {
          if (Number(notReadyQuantityWithdrawn) > Number(batches[0]['notReadyQuantity(raw)'])) {
            setIndividualError('notReadyQuantityWithdrawn', strings.WITHDRAWN_QUANTITY_ERROR);
            allValid = false;
          } else {
            setIndividualError('notReadyQuantityWithdrawn', '');
          }
        }
      }

      if (!readyQuantityWithdrawn && readyQuantityWithdrawn !== 0) {
        setIndividualError('readyQuantityWithdrawn', strings.REQUIRED_FIELD);
        allValid = false;
      } else {
        if (isNaN(readyQuantityWithdrawn)) {
          setIndividualError('readyQuantityWithdrawn', strings.INVALID_VALUE);
          allValid = false;
        } else {
          if (Number(readyQuantityWithdrawn) > Number(batches[0]['readyQuantity(raw)'])) {
            setIndividualError('readyQuantityWithdrawn', strings.WITHDRAWN_QUANTITY_ERROR);
            allValid = false;
          } else {
            setIndividualError('readyQuantityWithdrawn', '');
          }
        }
      }

      if (!germinatingQuantityWithdrawn && germinatingQuantityWithdrawn !== 0) {
        setIndividualError('germinatingQuantityWithdrawn', strings.REQUIRED_FIELD);
        allValid = false;
      } else {
        if (isNaN(germinatingQuantityWithdrawn)) {
          setIndividualError('germinatingQuantityWithdrawn', strings.INVALID_VALUE);
          allValid = false;
        } else {
          if (Number(germinatingQuantityWithdrawn) > Number(batches[0]['germinatingQuantity(raw)'])) {
            setIndividualError('germinatingQuantityWithdrawn', strings.WITHDRAWN_QUANTITY_ERROR);
            allValid = false;
          } else {
            setIndividualError('germinatingQuantityWithdrawn', '');
          }
        }
      }
    }
    return allValid;
  };

  const validatePlantingSiteSubzone = () => {
    setIndividualError('plantingSiteId', '');
    setIndividualError('zoneId', '');
    setIndividualError('subzoneId', '');

    if (!isOutplant) {
      return true;
    }

    if (!localRecord.plantingSiteId) {
      setIndividualError('plantingSiteId', strings.REQUIRED_FIELD);
    }

    if (!zones.length) {
      // zone/subzone not required if site has no zones/subzones
      return !!localRecord.plantingSiteId;
    }

    if (!zoneId) {
      setIndividualError('zoneId', strings.REQUIRED_FIELD);
    }

    if (!localRecord.plantingSubzoneId) {
      setIndividualError('subzoneId', strings.REQUIRED_FIELD);
    }

    return localRecord.plantingSiteId && localRecord.plantingSubzoneId;
  };

  const onNextHandler = () => {
    const nurseryTransferInvalid = !validateNurseryTransfer();
    const selectedNurseryInvalid = !validateSelectedNursery();
    const withdrawnQuantityInvalid = !validateWithdrawnQuantity();
    const plantingSiteSubzoneInvalid = !validatePlantingSiteSubzone();
    const germinatingReadyAndNotReadyInvalid = !validateGerminatingReadyAndNotReadyQuantities();
    if (
      fieldsErrors.withdrawnDate ||
      nurseryTransferInvalid ||
      selectedNurseryInvalid ||
      withdrawnQuantityInvalid ||
      plantingSiteSubzoneInvalid ||
      germinatingReadyAndNotReadyInvalid
    ) {
      return;
    }

    const isSingleOutplant = isSingleBatch && isOutplant;

    onNext({
      ...localRecord,
      destinationFacilityId: isNurseryTransfer ? localRecord.destinationFacilityId : undefined,
      plantingSiteId: isOutplant ? localRecord.plantingSiteId : undefined,
      plantingSubzoneId: isOutplant ? localRecord.plantingSubzoneId : undefined,
      facilityId: Number(selectedNursery?.id || -1),
      batchWithdrawals: batches
        .filter((batch: SearchResponseElement) => {
          return (
            `${batch.facility_id}` === selectedNursery?.id.toString() &&
            (!isOutplant || Number(batch['readyQuantity(raw)']) > 0)
          );
        })
        .map(
          (batch: SearchResponseElement): BatchWithdrawalPayload => ({
            batchId: Number(batch.id),
            germinatingQuantityWithdrawn: isSingleOutplant ? 0 : isSingleBatch ? germinatingQuantityWithdrawn || 0 : 0,
            notReadyQuantityWithdrawn: isSingleOutplant ? 0 : isSingleBatch ? notReadyQuantityWithdrawn || 0 : 0,
            readyQuantityWithdrawn: isSingleOutplant
              ? withdrawnQuantity || 0
              : isSingleBatch
              ? readyQuantityWithdrawn || 0
              : 0,
          })
        ),
    });
  };

  const onChangeFromNursery = (facilityIdSelected: string) => {
    const foundNursery = getNurseryById(selectedOrganization, Number(facilityIdSelected));
    setSelectedNursery(foundNursery);
  };

  const nurseriesOptions = useMemo(() => {
    const nurseries = batches
      .filter((batchData: SearchResponseElement) => {
        if (isOutplant) {
          return Number(batchData['readyQuantity(raw)']) > 0;
        }
        return Number(batchData['totalQuantity(raw)']) + Number(batchData['germinatingQuantity(raw)']) > 0;
      })
      .reduce((acc: Record<string, DropdownItem>, batch: SearchResponseElement) => {
        if (!acc[`${batch.facility_id}`]) {
          acc[`${batch.facility_id}`] = { label: `${batch.facility_name}`, value: batch.facility_id };
        }
        return acc;
      }, {});

    const options: DropdownItem[] = Object.values(nurseries).sort((a, b) =>
      `${a.label}`.toLowerCase().localeCompare(`${b.label}`.toLowerCase())
    );

    if (options.length === 1 && !selectedNursery) {
      setSelectedNursery(getNurseryById(selectedOrganization, Number(options[0].value)));
    }
    return options;
  }, [batches, isOutplant, selectedNursery, selectedOrganization]);

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
    const allNurseries = getAllNurseries(selectedOrganization);
    const destinationNurseries = allNurseries.filter(
      (nursery) => nursery.id.toString() !== selectedNursery?.id.toString()
    );
    setDestinationNurseriesOptions(
      destinationNurseries.map((nursery) => ({ label: nursery.name, value: nursery.id.toString() }))
    );
  }, [selectedNursery, selectedOrganization, isOutplant]);

  useEffect(() => {
    setWithdrawnQuantity(
      (readyQuantityWithdrawn ? Number(readyQuantityWithdrawn) : 0) +
        (notReadyQuantityWithdrawn ? Number(notReadyQuantityWithdrawn) : 0) +
        (germinatingQuantityWithdrawn ? Number(germinatingQuantityWithdrawn) : 0)
    );
  }, [readyQuantityWithdrawn, notReadyQuantityWithdrawn, germinatingQuantityWithdrawn]);

  useEffect(() => {
    if (localRecord.purpose === OUTPLANT) {
      const hasReadyQuantities = batches.some((batch) => {
        if (selectedNursery && `${batch.facility_id}` !== selectedNursery.id.toString()) {
          return false;
        }
        return Number(batch['readyQuantity(raw)']) > 0;
      });

      if (!hasReadyQuantities) {
        if (!noReadySeedlings) {
          setNoReadySeedlings(true);
          updatePurpose(NURSERY_TRANSFER);
        }
        return;
      }
    }
  }, [localRecord.purpose, noReadySeedlings, snackbar, selectedNursery, batches, updatePurpose]);

  useEffect(() => {
    const fetchSpecies = async () => {
      const result = await SpeciesService.getAllSpecies(selectedOrganization.id);
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
  }, [selectedOrganization.id]);

  const batchesFromNursery = useMemo(() => {
    return batches.filter((batch) => !selectedNursery || `${batch.facility_id}` === selectedNursery.id.toString());
  }, [batches, selectedNursery]);

  const batchSpeciesNames = useMemo(() => {
    const batchSpeciesIds = batchesFromNursery.map((batch) => `${batch.species_id}`);
    const speciesIds: string[] = Array.from(new Set(batchSpeciesIds));
    return speciesIds.map((speciesId: string) => speciesMap[speciesId] || strings.NAME_UNKNOWN);
  }, [batchesFromNursery, speciesMap]);

  const totalReadyQuantity = useMemo(() => {
    return batchesFromNursery.reduce((acc, batch) => acc + (Number(batch['readyQuantity(raw)']) || 0), 0);
  }, [batchesFromNursery]);

  const getOutplantLabel = () => {
    return (
      <>
        {strings.OUTPLANT}
        {noReadySeedlings && <IconTooltip placement='top' title={strings.OUTPLANTS_REQUIRE_READY_SEEDLINGS} />}
        {!noReadySeedlings && outplantDisabled && (
          <IconTooltip placement='top' title={strings.OUTPLANTS_REQUIRE_PLANTING_SITES} />
        )}
      </>
    );
  };

  const getNurseryTransferLabel = () => {
    return (
      <>
        {strings.NURSERY_TRANSFER}
        {nurseryTransferDisabled && (
          <IconTooltip placement='top' title={strings.NURSERY_TRANSFERS_REQUIRE_DESTINATIONS} />
        )}
      </>
    );
  };

  const outplantDisabled = useMemo(() => {
    if (!plantingSites?.length || noReadySeedlings) {
      return true;
    }

    return false;
  }, [plantingSites, noReadySeedlings]);

  const nurseryTransferDisabled = useMemo(() => {
    if (!destinationNurseriesOptions) {
      return false;
    }
    return destinationNurseriesOptions.length === 0;
  }, [destinationNurseriesOptions]);

  useEffect(() => {
    if (localRecord.purpose === OUTPLANT && outplantDisabled) {
      updatePurpose(NURSERY_TRANSFER);
    } else if (localRecord.purpose === NURSERY_TRANSFER && nurseryTransferDisabled) {
      updatePurpose(DEAD);
    }
  }, [localRecord.purpose, outplantDisabled, nurseryTransferDisabled, updatePurpose]);

  return (
    <PageForm
      cancelID='cancelInventoryWithdraw'
      saveID='saveInventoryWithdraw'
      onCancel={onCancel}
      onSave={onNextHandler}
      saveButtonText={saveText}
    >
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
                  {!contributor && (
                    <FormControlLabel
                      value={OUTPLANT}
                      control={<Radio />}
                      label={getOutplantLabel()}
                      disabled={outplantDisabled}
                    />
                  )}
                  <FormControlLabel
                    value={NURSERY_TRANSFER}
                    control={<Radio />}
                    label={getNurseryTransferLabel()}
                    disabled={nurseryTransferDisabled}
                  />
                  <FormControlLabel value={DEAD} control={<Radio />} label={strings.DEAD} />
                  <FormControlLabel value={OTHER} control={<Radio />} label={strings.OTHER} />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid display='flex'>
              <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
                <Dropdown
                  id='fromFacilityId'
                  placeholder={strings.SELECT}
                  label={strings.FROM_NURSERY_REQUIRED}
                  selectedValue={selectedNursery?.id.toString() || ''}
                  options={nurseriesOptions}
                  onChange={(newValue) => onChangeFromNursery(newValue)}
                  fullWidth={true}
                  errorText={fieldsErrors.fromFacilityId}
                />
              </Grid>
            </Grid>

            {isNurseryTransfer && (
              <Grid display='flex' flexDirection={isMobile ? 'column' : 'row'}>
                <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
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
              </Grid>
            )}

            {featureFlagProjects && !isSingleBatch && (availableProjects || []).length > 0 && (
              <Grid display='flex' flexDirection={isMobile ? 'column' : 'row'}>
                <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
                  <ProjectsDropdown<{ projectId?: number }>
                    availableProjects={availableProjects}
                    label={strings.FILTER_BY_PROJECT}
                    record={projectRecord}
                    setRecord={(setFn) => {
                      const nextRecord = setFn(projectRecord);
                      setProjectRecord(nextRecord);
                      if (nextRecord.projectId) {
                        setFilterProjectId(nextRecord.projectId);
                      }
                    }}
                  />
                </Grid>
              </Grid>
            )}

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
                        {strings.VIEW_SITES_ZONES_SUBZONES}
                      </a>
                    }
                  />
                </Grid>
                {!!zones.length && (
                  <SubzoneSelector
                    zones={zones}
                    onZoneSelected={onChangePlantingZone}
                    onSubzoneSelected={onChangeSubzone}
                    zoneError={fieldsErrors.zoneId}
                    subzoneError={fieldsErrors.subzoneId}
                    selectedSubzone={selectedSubzone}
                    selectedZone={selectedZone}
                  />
                )}
              </>
            )}
            <Grid display='flex' flexDirection={isMobile ? 'column' : 'row'}>
              {isSingleBatch && isOutplant && (
                <>
                  <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2), marginRight: theme.spacing(2) }}>
                    <Textfield
                      label={strings.WITHDRAW_QUANTITY_REQUIRED}
                      id='withdrawnQuantity'
                      onChange={(value: unknown) => setWithdrawnQuantity(value as number)}
                      type='number'
                      value={withdrawnQuantity}
                      errorText={fieldsErrors.withdrawnQuantity}
                      className={classes.withdrawnQuantity}
                    />
                  </Grid>
                  <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }} paddingLeft={isMobile ? 0 : 1}>
                    <Textfield
                      label={strings.TOTAL_READY_QUANTITY}
                      id='totalReadyQuantity'
                      type='number'
                      value={numericFormatter.format(totalReadyQuantity)}
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
                    <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }}>
                      <Textfield
                        label={strings.GERMINATING_QUANTITY_REQUIRED}
                        id='germinatingQuantityWithdrawn'
                        onChange={(value: unknown) => setGerminatingQuantityWithdrawn(value as number)}
                        type='number'
                        value={germinatingQuantityWithdrawn}
                        tooltipTitle={strings.TOOLTIP_GERMINATING_QUANTITY}
                        className={classes.germinatingQuantityWithdrawn}
                        errorText={fieldsErrors.germinatingQuantityWithdrawn}
                      />
                    </Grid>
                  </Grid>

                  <Grid display='flex' flexDirection={isMobile ? 'column' : 'row'}>
                    <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }} paddingRight={isMobile ? 0 : 1}>
                      <Textfield
                        label={strings.NOT_READY_QUANTITY_REQUIRED}
                        id='notReadyQuantityWithdrawn'
                        onChange={(value: unknown) => setNotReadyQuantityWithdrawn(value as number)}
                        type='number'
                        value={notReadyQuantityWithdrawn}
                        tooltipTitle={strings.TOOLTIP_NOT_READY_QUANTITY}
                        className={classes.notReadyQuantityWithdrawn}
                        errorText={fieldsErrors.notReadyQuantityWithdrawn}
                      />
                    </Grid>
                    <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }} paddingLeft={isMobile ? 0 : 1}>
                      <DatePicker
                        id='readyByDate'
                        label={strings.ESTIMATED_READY_DATE}
                        aria-label={strings.ESTIMATED_READY_DATE}
                        value={localRecord.readyByDate}
                        onChange={(value) => onChangeDate('readyByDate', value)}
                        defaultTimeZone={timeZone}
                      />
                    </Grid>
                  </Grid>
                  <Grid display='flex' flexDirection={isMobile ? 'column' : 'row'}>
                    <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }} paddingRight={1}>
                      <Textfield
                        label={strings.READY_QUANTITY_REQUIRED}
                        id='readyQuantityWithdrawn'
                        onChange={(value: unknown) => setReadyQuantityWithdrawn(value as number)}
                        type='number'
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
                        onChange={(value: unknown) => setWithdrawnQuantity(value as number)}
                        type='text'
                        value={numericFormatter.format(withdrawnQuantity)}
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
                  onChange={(value) => onChangeDate('withdrawnDate', value)}
                  errorText={fieldsErrors.withdrawnDate}
                  defaultTimeZone={timeZone}
                />
              </Grid>
            </>
            <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
              <Textfield
                id='notes'
                value={localRecord.notes}
                onChange={(value) => updateField('notes', value)}
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
