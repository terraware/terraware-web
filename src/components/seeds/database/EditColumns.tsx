import { Theme, Dialog, DialogTitle, Typography, DialogContent, Grid, DialogActions, Box, Chip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import strings from 'src/strings';
import CancelButton from '../../common/CancelButton';
import Checkbox from '../../common/Checkbox';
import DialogCloseButton from '../../common/DialogCloseButton';
import Divisor from '../../common/Divisor';
import RadioButton from '../../common/RadioButton';
import { COLUMNS_INDEXED, Preset, searchPresets } from './columns';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles((theme: Theme) => ({
  submit: {
    '&:not(.mobile)': {
      marginLeft: theme.spacing(2),
    },
    '&.mobile': {
      marginTop: theme.spacing(1),
    },
    color: theme.palette.common.white,
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: theme.spacing(2),
    '&.mobile': {
      width: '100%',
    },
  },
  bold: {
    fontWeight: theme.typography.fontWeightBold,
  },
  mobileButtons: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
}));

export interface Props {
  open: boolean;
  onClose: (columns?: string[]) => void;
  value: string[];
}

export default function EditColumnsDialog(props: Props): JSX.Element {
  const classes = useStyles();
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

  return (
    <Dialog
      id='editColumnsDialog'
      disableEscapeKeyDown
      open={open}
      maxWidth='md'
      fullWidth={true}
      onClose={handleCancel}
    >
      <DialogTitle>
        <Typography component='p' variant='h6' className={classes.bold}>
          {strings.ADD_COLUMNS}
        </Typography>
        <Typography component='p'>{strings.ADD_COLUMNS_DESCRIPTION}</Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>

      <DialogContent>
        <Typography component='p'>{strings.TEMPLATES}</Typography>
        <Grid container>
          <Grid item xs={4}>
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
            <Grid container spacing={4}>
              {options.map((optionsColumn, index) => (
                <Grid key={index} item xs={4}>
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
      </DialogContent>

      <DialogActions>
        <Box className={`${classes.actions} ${isMobile ? 'mobile' : ''}`}>
          <Box className={isMobile ? classes.mobileButtons : ''}>
            <CancelButton onClick={handleCancel} />
            <Chip
              id='saveColumnsButton'
              className={`${classes.submit} ${isMobile ? 'mobile' : ''}`}
              label='Save changes'
              clickable
              color='primary'
              onClick={handleOk}
            />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
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
        COLUMNS_INDEXED.receivedDate,
        COLUMNS_INDEXED.collectedDate,
        COLUMNS_INDEXED.primaryCollectorName,
        COLUMNS_INDEXED.siteLocation,
      ],
      [
        COLUMNS_INDEXED.species_endangered,
        COLUMNS_INDEXED.species_rare,
        COLUMNS_INDEXED.sourcePlantOrigin,
        COLUMNS_INDEXED.species_familyName,
      ],
      [
        COLUMNS_INDEXED.treesCollectedFrom,
        COLUMNS_INDEXED.bagNumber,
        COLUMNS_INDEXED.landowner,
        COLUMNS_INDEXED.collectionNotes,
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
