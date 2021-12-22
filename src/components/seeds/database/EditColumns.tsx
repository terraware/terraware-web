import { Box, Chip, Grid, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import strings from 'src/strings';
import CancelButton from '../../common/CancelButton';
import Checkbox from '../../common/Checkbox';
import DialogCloseButton from '../../common/DialogCloseButton';
import Divisor from '../../common/Divisor';
import RadioButton from '../../common/RadioButton';
import { COLUMNS_INDEXED, Preset, searchPresets } from './columns';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    submit: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
    },
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: theme.spacing(2),
    },
    bold: {
      fontWeight: theme.typography.fontWeightBold,
    },
  })
);

export interface Props {
  open: boolean;
  onClose: (columns?: string[]) => void;
  value: string[];
}

export default function EditColumnsDialog(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open } = props;
  const [preset, setPreset] = React.useState<Preset>();

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
        <Box className={classes.actions}>
          <Box>
            <CancelButton onClick={handleCancel} />
            <Chip
              id='saveColumnsButton'
              className={classes.submit}
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
  name: string;
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
      [COLUMNS_INDEXED.endangered, COLUMNS_INDEXED.rare, COLUMNS_INDEXED.sourcePlantOrigin, COLUMNS_INDEXED.familyName],
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
    name: 'Germination Testing',
    options: [
      [
        COLUMNS_INDEXED.germinationTestType,
        COLUMNS_INDEXED.germinationSeedType,
        COLUMNS_INDEXED.germinationTreatment,
        COLUMNS_INDEXED.cutTestSeedsFilled,
        COLUMNS_INDEXED.germinationPercentGerminated,
      ],
      [
        COLUMNS_INDEXED.germinationStartDate,
        COLUMNS_INDEXED.germinationSeedsSown,
        COLUMNS_INDEXED.germinationSeedsGerminated,
        COLUMNS_INDEXED.cutTestSeedsEmpty,
        COLUMNS_INDEXED.latestViabilityPercent,
      ],
      [
        COLUMNS_INDEXED.latestGerminationTestDate,
        COLUMNS_INDEXED.germinationSubstrate,
        COLUMNS_INDEXED.cutTestSeedsCompromised,
        COLUMNS_INDEXED.germinationTestNotes,
      ],
    ],
  },
];
