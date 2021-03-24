import { Box, Chip, Grid, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { SearchField } from '../../api/types/search';
import CancelButton from '../common/CancelButton';
import Checkbox from '../common/Checkbox';
import DialogCloseButton from '../common/DialogCloseButton';
import Divisor from '../common/Divisor';
import RadioButton from '../common/RadioButton';
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
  onClose: (columns?: SearchField[]) => void;
  value: SearchField[];
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
      newValue.push(id as SearchField);
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
          Add columns
        </Typography>
        <Typography component='p'>
          Select columns you want to add. Deselect columns you want to remove.
        </Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>

      <DialogContent>
        <Typography component='p'>Presets</Typography>
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
                    {optionsColumn.map(({ key, disabled, name }) => (
                      <Grid key={key} item xs={12}>
                        <Checkbox
                          disabled={disabled}
                          id={key}
                          name={key}
                          label={name}
                          value={value.includes(key)}
                          onChange={(id, value) => onChange(key, value)}
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
  key: SearchField;
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
      [{ ...COLUMNS_INDEXED['accessionNumber'], disabled: true }],
      [COLUMNS_INDEXED['active']],
      [COLUMNS_INDEXED['state']],
    ],
  },
  {
    name: 'Seed Collection',
    options: [
      [
        COLUMNS_INDEXED['species'],
        COLUMNS_INDEXED['receivedDate'],
        COLUMNS_INDEXED['collectedDate'],
        COLUMNS_INDEXED['primaryCollector'],
      ],
      [
        COLUMNS_INDEXED['siteLocation'],
        COLUMNS_INDEXED['endangered2'],
        COLUMNS_INDEXED['rare2'],
        COLUMNS_INDEXED['bagNumber'],
      ],
      [
        COLUMNS_INDEXED['treesCollectedFrom'],
        COLUMNS_INDEXED['estimatedSeedsIncoming'],
        COLUMNS_INDEXED['landowner'],
        COLUMNS_INDEXED['collectionNotes'],
      ],
    ],
  },
  {
    name: 'Processing and Drying',
    options: [
      [
        COLUMNS_INDEXED['processingStartDate'],
        COLUMNS_INDEXED['dryingStartDate'],
      ],
      [COLUMNS_INDEXED['processingMethod'], COLUMNS_INDEXED['dryingEndDate']],
      [COLUMNS_INDEXED['seedsCounted'], COLUMNS_INDEXED['processingNotes']],
    ],
  },
  {
    name: 'Storing',
    options: [
      [
        COLUMNS_INDEXED['storageStartDate'],
        COLUMNS_INDEXED['storageCondition'],
      ],
      [COLUMNS_INDEXED['storageLocation']],
      [COLUMNS_INDEXED['storagePackets'], COLUMNS_INDEXED['storageNotes']],
    ],
  },
  {
    name: 'Withdrawal',
    options: [
      [COLUMNS_INDEXED['withdrawalDate'], COLUMNS_INDEXED['withdrawalSeeds']],
      [
        COLUMNS_INDEXED['withdrawalDestination'],
        COLUMNS_INDEXED['seedsRemaining'],
      ],
      [
        COLUMNS_INDEXED['withdrawalPurpose'],
        COLUMNS_INDEXED['targetStorageCondition'],
        COLUMNS_INDEXED['withdrawalNotes'],
      ],
    ],
  },
  {
    name: 'Germination Testing',
    options: [
      [
        COLUMNS_INDEXED['germinationTestType'],
        COLUMNS_INDEXED['germinationSeedType'],
        COLUMNS_INDEXED['germinationTreatment'],
        COLUMNS_INDEXED['cutTestSeedsFilled'],
        COLUMNS_INDEXED['germinationTestNotes'],
      ],
      [
        COLUMNS_INDEXED['germinationStartDate'],
        COLUMNS_INDEXED['germinationSeedsSown'],
        COLUMNS_INDEXED['germinationSeedsGerminated'],
        COLUMNS_INDEXED['cutTestSeedsEmpty'],
      ],
      [
        COLUMNS_INDEXED['latestGerminationTestDate'],
        COLUMNS_INDEXED['germinationSubstrate'],
        COLUMNS_INDEXED['germinationPercentGerminated'],
        COLUMNS_INDEXED['cutTestSeedsCompromised'],
      ],
    ],
  },
  {
    name: 'Viability',
    options: [
      [COLUMNS_INDEXED['latestViabilityPercent']],
      [COLUMNS_INDEXED['totalViabilityPercent']],
    ],
  },
];
