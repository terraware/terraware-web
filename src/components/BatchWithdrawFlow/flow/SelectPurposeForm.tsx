import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
  useTheme,
} from '@mui/material';
import { Dropdown, DropdownItem, IconTooltip, Textfield } from '@terraware/web-components';
import getDateDisplayValue, { getTodaysDateFormatted, isInTheFuture } from '@terraware/web-components/utils/date';

import ProjectsDropdown from 'src/components/ProjectsDropdown';
import SubstratumSelector, { StratumInfo, SubstratumInfo } from 'src/components/SubstratumSelector';
import DatePicker from 'src/components/common/DatePicker';
import Divisor from 'src/components/common/Divisor';
import PageForm from 'src/components/common/PageForm';
import { APP_PATHS } from 'src/constants';
import { useUser } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { useOrganization } from 'src/providers/hooks';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { BatchWithdrawalPayload, NurseryWithdrawalPurposes, NurseryWithdrawalRequest } from 'src/types/Batch';
import { Facility } from 'src/types/Facility';
import { Project } from 'src/types/Project';
import { SearchResponseElement } from 'src/types/Search';
import { getAllNurseries, getNurseryById, isContributor } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import useSnackbar from 'src/utils/useSnackbar';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';

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
  const numberFormatter = useNumberFormatter(user?.locale);
  const contributor = isContributor(selectedOrganization);
  const snackbar = useSnackbar();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const { allPlantingSites } = usePlantingSiteData();
  const { species } = useSpeciesData();
  const projects = useAppSelector(selectProjects);

  const [isNurseryTransfer, setIsNurseryTransfer] = useState(contributor ? true : false);
  const [isOutplant, setIsOutplant] = useState(nurseryWithdrawal.purpose === OUTPLANT);
  const [fieldsErrors, setFieldsErrors] = useState<{ [key: string]: string | undefined }>({});
  const [localRecord, setLocalRecord] = useState<NurseryWithdrawalRequest>(nurseryWithdrawal);
  const [selectedNursery, setSelectedNursery] = useState<Facility>();
  const [destinationNurseriesOptions, setDestinationNurseriesOptions] = useState<DropdownItem[]>();
  const [isSingleBatch] = useState<boolean>(batches.length === 1);
  const [withdrawnQuantity, setWithdrawnQuantity] = useState<number>(0);
  const [readyQuantityWithdrawn, setReadyQuantityWithdrawn] = useState<number>(0);
  const [activeGrowthQuantityWithdrawn, setActiveGrowthQuantityWithdrawn] = useState<number>(0);
  const [hardeningOffQuantityWithdrawn, setHardeningOffQuantityWithdrawn] = useState<number>(0);
  const [germinatingQuantityWithdrawn, setGerminatingQuantityWithdrawn] = useState<number>(0);
  const [strata, setStrata] = useState<any[]>([]);
  const [stratumId, setStratumId] = useState<number>();
  const [noReadySeedlings, setNoReadySeedlings] = useState<boolean>(false);
  const [selectedStratum, setSelectedStratum] = useState<StratumInfo>();
  const [selectedSubstratum, setSelectedSubstratum] = useState<SubstratumInfo>();
  const [projectRecord, setProjectRecord] = useState<{ projectId?: number }>({});

  const speciesMap = useMemo((): Record<string, string> => {
    return species.reduce((acc, sp) => {
      const { scientificName, commonName } = sp;
      return {
        ...acc,
        [sp.id]: commonName ? `${scientificName} (${commonName})` : scientificName,
      };
    }, {});
  }, [species]);

  const tz = useLocationTimeZone().get(selectedNursery);
  const [timeZone, setTimeZone] = useState(tz.id);

  const availableProjects = useMemo(
    () =>
      projects?.filter((project: Project) =>
        batches.some(
          (batch: SearchResponseElement) =>
            // Only show projects that are represented within the available batches
            Number(batch.project_id) === project.id &&
            // And apply to the selected facility
            (selectedNursery ? Number(batch.facility_id) === selectedNursery.id : true) &&
            (isOutplant ? batch['readyQuantity(raw)'] && Number(batch['readyQuantity(raw)']) > 0 : true)
        )
      ),
    [projects, batches, selectedNursery, isOutplant]
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
    updateField('substratumId', undefined); // clear substratum id when there's a new planting site id
    updateField('plantingSiteId', value);
    setSelectedStratum(undefined);
    setSelectedSubstratum(undefined);
    const plantingSite = allPlantingSites
      ? allPlantingSites.find((site) => site.id.toString() === value.toString())
      : null;
    setStrata(plantingSite?.strata || []);
    setStratumId(undefined);
  };

  const onChangeStratum = (value: any) => {
    setSelectedStratum(value);
    setSelectedSubstratum(undefined);
    setStratumId(value?.id);
    updateField('substratumId', undefined); // clear substratum id when there's a new stratum id
  };

  const onChangeSubstratum = (value: any) => {
    setSelectedSubstratum(value);
    updateField('substratumId', value?.id);
  };

  const setIndividualError = (id: string, error?: string) => {
    setFieldsErrors((prev) => ({
      ...prev,
      [id]: error,
    }));
  };

  const validateDate = (id: string, value?: any, allowFutureDates?: boolean) => {
    if (!value) {
      setIndividualError(id, strings.REQUIRED_FIELD);
      return false;
    } else if (isNaN(value.getTime())) {
      setIndividualError(id, strings.INVALID_DATE);
      return false;
    } else if (!allowFutureDates && isInTheFuture(value.getTime())) {
      setIndividualError(id, strings.NO_FUTURE_DATES);
      return false;
    } else {
      setIndividualError(id, '');
      return true;
    }
  };

  const onChangeDate = (id: 'readyByDate' | 'withdrawnDate', value?: any, allowFutureDates?: boolean) => {
    const date = value ? getDateDisplayValue(value.getTime(), timeZone) : null;
    const valid = validateDate(id, value, allowFutureDates);
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

  const validateQuantities = () => {
    let allValid = true;
    if (isSingleBatch && !isOutplant) {
      if (
        activeGrowthQuantityWithdrawn === 0 &&
        hardeningOffQuantityWithdrawn === 0 &&
        readyQuantityWithdrawn === 0 &&
        germinatingQuantityWithdrawn === 0
      ) {
        setIndividualError('totalQuantityWithdrawn', strings.WITHDRAWN_QUANTITY_GREATER_THAN_ZERO_ERROR);
        allValid = false;
      } else {
        setIndividualError('totalQuantityWithdrawn', '');
      }

      if (!activeGrowthQuantityWithdrawn && activeGrowthQuantityWithdrawn !== 0) {
        setIndividualError('activeGrowthQuantityWithdrawn', strings.REQUIRED_FIELD);
        allValid = false;
      } else {
        if (isNaN(activeGrowthQuantityWithdrawn)) {
          setIndividualError('activeGrowthQuantityWithdrawn', strings.INVALID_VALUE);
          allValid = false;
        } else {
          if (Number(activeGrowthQuantityWithdrawn) > Number(batches[0]['activeGrowthQuantity(raw)'])) {
            setIndividualError('activeGrowthQuantityWithdrawn', strings.WITHDRAWN_QUANTITY_ERROR);
            allValid = false;
          } else {
            setIndividualError('activeGrowthQuantityWithdrawn', '');
          }
        }
      }

      if (!hardeningOffQuantityWithdrawn && hardeningOffQuantityWithdrawn !== 0) {
        setIndividualError('hardeningOffQuantityWithdrawn', strings.REQUIRED_FIELD);
        allValid = false;
      } else {
        if (isNaN(hardeningOffQuantityWithdrawn)) {
          setIndividualError('hardeningOffQuantityWithdrawn', strings.INVALID_VALUE);
          allValid = false;
        } else {
          if (Number(hardeningOffQuantityWithdrawn) > Number(batches[0]['hardeningOffQuantity(raw)'])) {
            setIndividualError('hardeningOffQuantityWithdrawn', strings.WITHDRAWN_QUANTITY_ERROR);
            allValid = false;
          } else {
            setIndividualError('hardeningOffQuantityWithdrawn', '');
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

  const validatePlantingSiteSubstratum = () => {
    setIndividualError('plantingSiteId', '');
    setIndividualError('stratumId', '');
    setIndividualError('substratumId', '');

    if (!isOutplant) {
      return true;
    }

    if (!localRecord.plantingSiteId) {
      setIndividualError('plantingSiteId', strings.REQUIRED_FIELD);
    }

    if (!strata.length) {
      // stratum/substratum not required if site has no strata/substrata
      return !!localRecord.plantingSiteId;
    }

    if (!stratumId) {
      setIndividualError('stratumId', strings.REQUIRED_FIELD);
    }

    if (!localRecord.substratumId) {
      setIndividualError('substratumId', strings.REQUIRED_FIELD);
    }

    return localRecord.plantingSiteId && localRecord.substratumId;
  };

  const onNextHandler = () => {
    const nurseryTransferInvalid = !validateNurseryTransfer();
    const selectedNurseryInvalid = !validateSelectedNursery();
    const withdrawnQuantityInvalid = !validateWithdrawnQuantity();
    const plantingSiteSubstratumInvalid = !validatePlantingSiteSubstratum();
    const germinatingReadyAndActiveGrowthInvalid = !validateQuantities();
    if (
      fieldsErrors.withdrawnDate ||
      nurseryTransferInvalid ||
      selectedNurseryInvalid ||
      withdrawnQuantityInvalid ||
      plantingSiteSubstratumInvalid ||
      germinatingReadyAndActiveGrowthInvalid
    ) {
      return;
    }

    const isSingleOutplant = isSingleBatch && isOutplant;

    onNext({
      ...localRecord,
      destinationFacilityId: isNurseryTransfer ? localRecord.destinationFacilityId : undefined,
      plantingSiteId: isOutplant ? localRecord.plantingSiteId : undefined,
      substratumId: isOutplant ? localRecord.substratumId : undefined,
      facilityId: Number(selectedNursery?.id || -1),
      batchWithdrawals: batches
        .filter((batch: SearchResponseElement) => {
          return (
            `${batch.facility_id as string}` === selectedNursery?.id.toString() &&
            (!isOutplant || Number(batch['readyQuantity(raw)']) > 0)
          );
        })
        .map(
          (batch: SearchResponseElement): BatchWithdrawalPayload => ({
            batchId: Number(batch.id),
            germinatingQuantityWithdrawn: isSingleOutplant ? 0 : isSingleBatch ? germinatingQuantityWithdrawn || 0 : 0,
            activeGrowthQuantityWithdrawn: isSingleOutplant
              ? 0
              : isSingleBatch
                ? activeGrowthQuantityWithdrawn || 0
                : 0,
            hardeningOffQuantityWithdrawn: isSingleOutplant
              ? 0
              : isSingleBatch
                ? hardeningOffQuantityWithdrawn || 0
                : 0,
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
    if (selectedOrganization) {
      const foundNursery = getNurseryById(selectedOrganization, Number(facilityIdSelected));
      setSelectedNursery(foundNursery);
    }
  };

  const nurseriesOptions = useMemo(() => {
    if (!selectedOrganization) {
      return [];
    }

    const nurseries = batches
      .filter((batchData: SearchResponseElement) => {
        if (isOutplant) {
          return Number(batchData['readyQuantity(raw)']) > 0;
        }
        return Number(batchData['totalQuantity(raw)']) + Number(batchData['germinatingQuantity(raw)']) > 0;
      })
      .reduce((acc: Record<string, DropdownItem>, batch: SearchResponseElement) => {
        if (!acc[`${batch.facility_id as string}`]) {
          acc[`${batch.facility_id as string}`] = {
            label: `${batch.facility_name as string}`,
            value: batch.facility_id,
          };
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
    if (!allPlantingSites) {
      return [];
    }
    return allPlantingSites
      .filter((plantingSite) => {
        return plantingSite.id !== -1;
      })
      .map((plantingSite) => ({
        label: plantingSite.name,
        value: plantingSite.id.toString(),
      }));
  };

  const gridSize = () => (isMobile ? 12 : 6);

  useEffect(() => {
    if (selectedOrganization) {
      const allNurseries = getAllNurseries(selectedOrganization);
      const destinationNurseries = allNurseries.filter(
        (nursery) => nursery.id.toString() !== selectedNursery?.id.toString()
      );
      setDestinationNurseriesOptions(
        destinationNurseries.map((nursery) => ({ label: nursery.name, value: nursery.id.toString() }))
      );
    }
  }, [selectedNursery, selectedOrganization, isOutplant]);

  useEffect(() => {
    setWithdrawnQuantity(
      (readyQuantityWithdrawn ? Number(readyQuantityWithdrawn) : 0) +
        (activeGrowthQuantityWithdrawn ? Number(activeGrowthQuantityWithdrawn) : 0) +
        (hardeningOffQuantityWithdrawn ? Number(hardeningOffQuantityWithdrawn) : 0) +
        (germinatingQuantityWithdrawn ? Number(germinatingQuantityWithdrawn) : 0)
    );
  }, [
    readyQuantityWithdrawn,
    activeGrowthQuantityWithdrawn,
    hardeningOffQuantityWithdrawn,
    germinatingQuantityWithdrawn,
  ]);

  useEffect(() => {
    if (localRecord.purpose === OUTPLANT) {
      const hasReadyQuantities = batches.some((batch) => {
        if (selectedNursery && `${batch.facility_id as string}` !== selectedNursery.id.toString()) {
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

  const batchesFromNursery = useMemo(() => {
    return batches.filter(
      (batch) => !selectedNursery || `${batch.facility_id as string}` === selectedNursery.id.toString()
    );
  }, [batches, selectedNursery]);

  const batchSpeciesNames = useMemo(() => {
    const batchSpeciesIds = batchesFromNursery.map((batch) => `${batch.species_id as string}`);
    const speciesIds: string[] = Array.from(new Set(batchSpeciesIds));
    return speciesIds.map((speciesId: string) => speciesMap[speciesId] || strings.NAME_UNKNOWN);
  }, [batchesFromNursery, speciesMap]);

  const totalReadyQuantity = useMemo(() => {
    return batchesFromNursery.reduce((acc, batch) => acc + (Number(batch['readyQuantity(raw)']) || 0), 0);
  }, [batchesFromNursery]);

  const getOutplantLabel = () => {
    return (
      <>
        {strings.PLANTING}
        {noReadySeedlings && <IconTooltip placement='top' title={strings.PLANTINGS_REQUIRE_READY_TO_PLANT_SEEDLINGS} />}
        {!noReadySeedlings && outplantDisabled && (
          <IconTooltip placement='top' title={strings.PLANTINGS_REQUIRE_PLANTING_SITES} />
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
    if (!allPlantingSites?.length || noReadySeedlings) {
      return true;
    }

    return false;
  }, [allPlantingSites, noReadySeedlings]);

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
            <Grid padding={theme.spacing(4, 0, 0)}>
              <Typography fontSize='14px' fontWeight={400} lineHeight='20px'>
                {strings.SPECIES_SELECTED}
              </Typography>
              <Typography fontSize='16px' fontWeight={500} lineHeight='24px' marginTop='12px'>
                {batchSpeciesNames.join(', ')}
              </Typography>
            </Grid>
            <Grid padding={theme.spacing(4, 0, 0)}>
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

            {!isSingleBatch && (availableProjects || []).length > 0 && (
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
                <Grid>
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
                    selectStyles={{ optionsContainer: { maxHeight: '250px' } }}
                  />
                </Grid>
                {!!strata.length && (
                  <SubstratumSelector
                    strata={strata}
                    onStratumSelected={onChangeStratum}
                    onSubstratumSelected={onChangeSubstratum}
                    stratumError={fieldsErrors.stratumId}
                    substratumError={fieldsErrors.substratumId}
                    selectedSubstratum={selectedSubstratum}
                    selectedStratum={selectedStratum}
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
                      sx={{
                        '&> #withdrawnQuantity': {
                          height: '44px',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }} paddingLeft={isMobile ? 0 : 1}>
                    <Textfield
                      label={strings.TOTAL_READY_TO_PLANT_QUANTITY}
                      id='totalReadyQuantity'
                      type='number'
                      value={numberFormatter.format(totalReadyQuantity)}
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
                        label={strings
                          .formatString(
                            strings.GERMINATION_ESTABLISHMENT_QUANTITY_REMAINING,
                            String(batches[0].germinatingQuantity)
                          )
                          .toString()}
                        id='germinatingQuantityWithdrawn'
                        onChange={(value: unknown) => setGerminatingQuantityWithdrawn(value as number)}
                        type='number'
                        value={germinatingQuantityWithdrawn}
                        tooltipTitle={strings.TOOLTIP_GERMINATION_ESTABLISHMENT_QUANTITY}
                        errorText={fieldsErrors.germinatingQuantityWithdrawn}
                        required
                        sx={{
                          '&> #germinatingQuantityWithdrawn': {
                            height: '44px',
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Grid display='flex' flexDirection={isMobile ? 'column' : 'row'}>
                    <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }} paddingRight={isMobile ? 0 : 1}>
                      <Textfield
                        label={strings
                          .formatString(
                            strings.ACTIVE_GROWTH_QUANTITY_REMAINING,
                            String(batches[0].activeGrowthQuantity)
                          )
                          .toString()}
                        id='activeGrowthQuantityWithdrawn'
                        onChange={(value: unknown) => setActiveGrowthQuantityWithdrawn(value as number)}
                        type='number'
                        value={activeGrowthQuantityWithdrawn}
                        tooltipTitle={strings.ACTIVE_GROWTH_QUANTITY}
                        errorText={fieldsErrors.activeGrowthQuantityWithdrawn}
                        required
                        sx={{
                          '&> #activeGrowthQuantityWithdrawn': {
                            height: '44px',
                          },
                        }}
                      />
                    </Grid>
                    {isNurseryTransfer && (
                      <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }} paddingLeft={isMobile ? 0 : 1}>
                        <DatePicker
                          id='readyByDate'
                          label={strings.ESTIMATED_READY_DATE}
                          aria-label={strings.ESTIMATED_READY_DATE}
                          value={localRecord.readyByDate}
                          onChange={(value) => onChangeDate('readyByDate', value, true)}
                          defaultTimeZone={timeZone}
                        />
                      </Grid>
                    )}
                  </Grid>

                  <Grid display='flex' flexDirection={isMobile ? 'column' : 'row'}>
                    <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }}>
                      <Textfield
                        label={strings
                          .formatString(
                            strings.HARDENING_OFF_QUANTITY_REMAINING,
                            String(batches[0].hardeningOffQuantity)
                          )
                          .toString()}
                        id='hardeningOffQuantityWithdrawn'
                        onChange={(value: unknown) => setHardeningOffQuantityWithdrawn(value as number)}
                        type='number'
                        value={hardeningOffQuantityWithdrawn}
                        tooltipTitle={strings.TOOLTIP_HARDENING_OFF_QUANTITY}
                        errorText={fieldsErrors.hardeningOffQuantityWithdrawn}
                        required
                        sx={{
                          '&> #hardeningOffQuantityWithdrawn': {
                            height: '44px',
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Grid display='flex' flexDirection={isMobile ? 'column' : 'row'}>
                    <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }} paddingRight={1}>
                      <Textfield
                        label={strings
                          .formatString(strings.READY_TO_PLANT_QUANTITY_REMAINING, String(batches[0].readyQuantity))
                          .toString()}
                        id='readyQuantityWithdrawn'
                        onChange={(value: unknown) => setReadyQuantityWithdrawn(value as number)}
                        type='number'
                        value={readyQuantityWithdrawn}
                        tooltipTitle={strings.TOOLTIP_READY_TO_PLANT_QUANTITY}
                        errorText={fieldsErrors.readyQuantityWithdrawn}
                        required
                        sx={{
                          '&> #readyQuantityWithdrawn': {
                            height: '44px',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={gridSize()} sx={{ marginTop: theme.spacing(2) }} paddingLeft={isMobile ? 0 : 1}>
                      <Textfield
                        label={strings.WITHDRAW_QUANTITY}
                        id='withdrawQuantity'
                        onChange={(value: unknown) => setWithdrawnQuantity(value as number)}
                        type='text'
                        value={numberFormatter.format(withdrawnQuantity)}
                        errorText={fieldsErrors.totalQuantityWithdrawn}
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
