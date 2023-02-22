import { Typography, Grid, Box } from '@mui/material';
import React from 'react';
import strings from 'src/strings';
import Checkbox from '../../common/Checkbox';
import Divisor from '../../common/Divisor';
import RadioButton from '../../common/RadioButton';
import { columnsIndexed, Preset, searchPresets } from './columns';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import isEnabled from 'src/features';
import { useUser } from 'src/providers';
import { IconTooltip } from '@terraware/web-components';

export interface Props {
  open: boolean;
  onClose: (columns?: string[]) => void;
  value: string[];
}

export default function EditColumnsDialog(props: Props): JSX.Element {
  const { onClose, open } = props;
  const [preset, setPreset] = React.useState<Preset>();
  const { isMobile } = useDeviceInfo();
  const { userPreferences } = useUser();

  const [value, setValue] = React.useState(props.value ?? []);

  React.useEffect(() => {
    setValue(props.value);
    setPreset(undefined);
  }, [props.value]);

  const handleCancel = () => {
    onClose();
  };

  const handleOk = () => {
    onClose(value);
  };

  const onSelectPreset = (updatedPreset: Preset) => {
    setPreset(updatedPreset);
    setValue([...updatedPreset.fields]);
  };

  const onChange = (id: string, checked: boolean) => {
    if (checked) {
      const newValue = [...value];
      newValue.push(id as string);
      setValue(newValue);
    } else {
      setValue(value.filter((v) => v !== id));
    }
  };

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  return (
    <DialogBox
      scrolled
      onClose={handleCancel}
      open={open}
      title={strings.CUSTOMIZE_TABLE_COLUMNS}
      size='x-large'
      middleButtons={[
        <Button
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={handleCancel}
          key='button-1'
          id='cancelEditColumns'
        />,
        <Button label={strings.SAVE_CHANGES} onClick={handleOk} key='button-2' id='saveColumnsButton' />,
      ]}
    >
      <Box textAlign='left'>
        <Typography component='p' sx={{ paddingBottom: '15px' }}>
          {strings.CUSTOMIZE_TABLE_COLUMNS_DESCRIPTION}
        </Typography>
        <Typography component='p'>{strings.TEMPLATES}</Typography>
        <Grid container>
          <Grid item xs={gridSize()}>
            <Grid container>
              {searchPresets(userPreferences.preferredWeightSystem as string).map((p) => (
                <Grid key={p.name} item xs={12}>
                  <RadioButton
                    id={p.name}
                    name={p.name}
                    label={p.name}
                    value={p.name === preset?.name}
                    onChange={() => onSelectPreset(p)}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {sections(userPreferences.preferredWeightSystem as string).map(({ name, tooltip, options }) => (
          <React.Fragment key={name}>
            <Divisor />
            <Typography component='p'>
              {name}
              {tooltip && <IconTooltip title={tooltip} />}
            </Typography>
            <Grid container spacing={isMobile ? 1 : 4} sx={{ marginTop: '-15px' }}>
              {options.map((optionsColumn, index) => (
                <Grid key={index} item xs={gridSize()}>
                  <Grid container>
                    {optionsColumn.map(({ key, disabled, name: oName }) => (
                      <Grid key={key} item xs={12}>
                        <Checkbox
                          disabled={disabled}
                          id={key}
                          name={key}
                          label={oName}
                          value={value.includes(key)}
                          onChange={(newValue) => onChange(key, newValue)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </React.Fragment>
        ))}
      </Box>
    </DialogBox>
  );
}

interface Option {
  name: string | JSX.Element;
  key: string;
  disabled?: boolean;
}

interface Section {
  name: string;
  tooltip?: string;
  options: Option[][];
}

function sections(system?: string): Section[] {
  const columns = columnsIndexed();

  const totalWithdrawnSection = () => {
    if (system === 'imperial') {
      return [
        [columns.totalWithdrawnCount, columns.totalWithdrawnWeightOunces],
        [columns.totalWithdrawnWeightPounds, columns.totalWithdrawnWeightGrams],
        [columns.totalWithdrawnWeightMilligrams, columns.totalWithdrawnWeightKilograms],
      ];
    } else {
      return [
        [columns.totalWithdrawnCount, columns.totalWithdrawnWeightGrams],
        [columns.totalWithdrawnWeightMilligrams, columns.totalWithdrawnWeightKilograms],
        [columns.totalWithdrawnWeightOunces, columns.totalWithdrawnWeightPounds],
      ];
    }
  };

  const columnsSections = [
    {
      name: strings.GENERAL,
      options: [
        [{ ...columns.accessionNumber, disabled: true }],
        [{ ...columns.state, disabled: true }],
        [columns.active],
        [columns.facility_name],
      ],
    },
    {
      name: strings.SEED_COLLECTION,
      options: [
        [
          columns.speciesName,
          columns.species_commonName,
          columns.species_familyName,
          columns.receivedDate,
          columns.collectedDate,
          columns.estimatedCount,
        ],
        [
          columns.species_endangered,
          columns.species_rare,
          columns.collectionSource,
          columns.ageYears,
          columns.ageMonths,
        ],
        [
          columns.plantsCollectedFrom,
          columns.bagNumber,
          columns.collectionSiteLandowner,
          columns.collectionSiteNotes,
          columns.collectionSiteName,
        ],
      ],
    },
    {
      name: strings.WEIGHT_UNITS,
      options:
        system === 'imperial'
          ? [
              [columns.estimatedWeightOunces, columns.estimatedWeightPounds],
              [columns.estimatedWeightGrams, columns.estimatedWeightMilligrams],
              [columns.estimatedWeightKilograms],
            ]
          : [
              [columns.estimatedWeightGrams, columns.estimatedWeightMilligrams],
              [columns.estimatedWeightKilograms],
              [columns.estimatedWeightOunces, columns.estimatedWeightPounds],
            ],
    },
    {
      name: strings.PROCESSING_AND_DRYING,
      options: [[columns.dryingEndDate], [columns.remainingQuantity]],
    },
    {
      name: strings.STORING,
      options: [[columns.storageLocation_name]],
    },
    {
      name: strings.WITHDRAWAL,
      options: totalWithdrawnSection(),
    },
    {
      name: strings.VIABILITY_TESTING,
      tooltip: strings.VIABILITY_TESTING_SECTION_TOOLTIP,
      options: [
        [
          columns.viabilityTests_type,
          columns.viabilityTests_seedType,
          columns.viabilityTests_treatment,
          columns.viabilityTests_seedsFilled,
        ],
        [
          columns.viabilityTests_startDate,
          columns.viabilityTests_seedsSown,
          columns.viabilityTests_viabilityTestResults_seedsGerminated,
          columns.viabilityTests_seedsEmpty,
        ],
        [columns.viabilityTests_substrate, columns.viabilityTests_seedsCompromised, columns.viabilityTests_notes],
      ],
    },
  ];

  return columnsSections;
}
