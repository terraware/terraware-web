import { Typography, Grid, Box } from '@mui/material';
import React from 'react';
import strings from 'src/strings';
import Checkbox from '../../common/Checkbox';
import Divisor from '../../common/Divisor';
import RadioButton from '../../common/RadioButton';
import { COLUMNS_INDEXED, Preset, searchPresets } from './columns';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';

export interface Props {
  open: boolean;
  onClose: (columns?: string[]) => void;
  value: string[];
}

export default function EditColumnsDialog(props: Props): JSX.Element {
  const { onClose, open } = props;
  const [preset, setPreset] = React.useState<Preset>();
  const { isMobile } = useDeviceInfo();

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
      title={strings.EDIT_COLUMNS}
      size='x-large'
      middleButtons={[
        <Button
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={handleCancel}
          key='button-1'
          id='cancel'
        />,
        <Button label={strings.SAVE_CHANGES} onClick={handleOk} key='button-2' id='saveColumnsButton' />,
      ]}
    >
      <Box textAlign='left'>
        <Typography component='p' sx={{ paddingBottom: '15px' }}>
          {strings.EDIT_COLUMNS_DESCRIPTION}
        </Typography>
        <Typography component='p'>{strings.TEMPLATES}</Typography>
        <Grid container>
          <Grid item xs={gridSize()}>
            <Grid container>
              {searchPresets.map((p) => (
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

        {sections.map(({ name, options }) => (
          <React.Fragment key={name}>
            <Divisor />
            <Typography component='p'>{name}</Typography>
            <Grid container spacing={isMobile ? 1 : 4}>
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
                          onChange={(id, newValue) => onChange(key, newValue)}
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
  options: Option[][];
}

const sections: Section[] = [
  {
    name: 'General',
    options: [
      [{ ...COLUMNS_INDEXED.accessionNumber, disabled: true }],
      [COLUMNS_INDEXED.active],
      [COLUMNS_INDEXED.state],
      [COLUMNS_INDEXED.facility_name],
    ],
  },
  {
    name: 'Seed Collection',
    options: [
      [
        COLUMNS_INDEXED.speciesName,
        COLUMNS_INDEXED.species_commonName,
        COLUMNS_INDEXED.species_familyName,
        COLUMNS_INDEXED.receivedDate,
        COLUMNS_INDEXED.collectedDate,
        COLUMNS_INDEXED.collectionSiteName,
      ],
      [
        COLUMNS_INDEXED.species_endangered,
        COLUMNS_INDEXED.species_rare,
        COLUMNS_INDEXED.collectionSource,
        COLUMNS_INDEXED.ageYears,
        COLUMNS_INDEXED.ageMonths,
        COLUMNS_INDEXED.estimatedCount,
      ],
      [
        COLUMNS_INDEXED.treesCollectedFrom,
        COLUMNS_INDEXED.bagNumber,
        COLUMNS_INDEXED.collectionSiteLandowner,
        COLUMNS_INDEXED.collectionNotes,
        COLUMNS_INDEXED.estimatedWeightGrams,
      ],
    ],
  },
  {
    name: 'Processing and Drying',
    options: [
      [COLUMNS_INDEXED.totalQuantity, COLUMNS_INDEXED.viabilityTestType, COLUMNS_INDEXED.dryingStartDate],
      [COLUMNS_INDEXED.dryingEndDate, COLUMNS_INDEXED.targetStorageCondition, COLUMNS_INDEXED.processingNotes],
    ],
  },
  {
    name: 'Storing',
    options: [
      [COLUMNS_INDEXED.storageStartDate, COLUMNS_INDEXED.storageCondition],
      [COLUMNS_INDEXED.storagePackets, COLUMNS_INDEXED.storageLocationName],
      [COLUMNS_INDEXED.storageNotes],
    ],
  },
  {
    name: 'Withdrawal',
    options: [
      [COLUMNS_INDEXED.withdrawalDate, COLUMNS_INDEXED.withdrawalQuantity],
      [COLUMNS_INDEXED.withdrawalDestination, COLUMNS_INDEXED.remainingQuantity],
      [COLUMNS_INDEXED.withdrawalPurpose, COLUMNS_INDEXED.withdrawalNotes],
    ],
  },
  {
    name: 'Viability Testing',
    options: [
      [
        COLUMNS_INDEXED.viabilityTests_type,
        COLUMNS_INDEXED.viabilityTests_seedType,
        COLUMNS_INDEXED.viabilityTests_treatment,
        COLUMNS_INDEXED.cutTestSeedsFilled,
        COLUMNS_INDEXED.viabilityTests_percentGerminated,
      ],
      [
        COLUMNS_INDEXED.viabilityTests_startDate,
        COLUMNS_INDEXED.viabilityTests_seedsSown,
        COLUMNS_INDEXED.viabilityTests_viabilityTestResults_seedsGerminated,
        COLUMNS_INDEXED.cutTestSeedsEmpty,
        COLUMNS_INDEXED.latestViabilityPercent,
      ],
      [
        COLUMNS_INDEXED.latestViabilityTestDate,
        COLUMNS_INDEXED.viabilityTests_substrate,
        COLUMNS_INDEXED.cutTestSeedsCompromised,
        COLUMNS_INDEXED.viabilityTests_notes,
      ],
    ],
  },
];
