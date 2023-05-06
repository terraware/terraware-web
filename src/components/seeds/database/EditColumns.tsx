import { Typography, Grid, Box } from '@mui/material';
import React from 'react';
import strings from 'src/strings';
import Checkbox from '../../common/Checkbox';
import Divisor from '../../common/Divisor';
import RadioButton from '../../common/RadioButton';
import { orderedColumnNames, columnsIndexed, Preset, searchPresets } from './columns';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useUser } from 'src/providers';
import { IconTooltip } from '@terraware/web-components';

export interface Props {
  onClose: (columns?: string[]) => void;
  value: string[];
}

export default function EditColumnsDialog(props: Props): JSX.Element {
  const { onClose } = props;
  const [preset, setPreset] = React.useState<Preset>();
  const { isMobile } = useDeviceInfo();
  const { userPreferences } = useUser();

  const [value, setValue] = React.useState(props.value);

  React.useEffect(() => {
    setValue(props.value);
    setPreset(undefined);
  }, [props.value]);

  const handleCancel = () => {
    onClose();
  };

  const handleOk = () => {
    // fetch system defined preferred order of column names
    const ordered = orderedColumnNames();

    // Determine order of previous columns to maintain such, skip those that aren't in the new list of columns
    const orderToMaintain = props.value.filter((name) => value.indexOf(name) !== -1);

    // sort these keys by system order
    const orderToMaintainSorted = [...orderToMaintain].sort((a, b) => ordered.indexOf(a) - ordered.indexOf(b));
    let i = 0;
    let j = 0;
    const shuffledColumns: { name: string; index: number }[] = [];

    // determine which columns were shuffled and book-keep them with shuffled position,
    // do this by comparing the orderToMaintain values against the system sorted values
    while (i < orderToMaintain.length && j < orderToMaintain.length) {
      const currentKey = orderToMaintain[i];
      const sortedKey = orderToMaintainSorted[j];
      if (shuffledColumns.find((col: any) => col.name === sortedKey)) {
        j++;
      } else if (sortedKey !== currentKey) {
        shuffledColumns.unshift({ name: currentKey, index: j });
        i++;
      } else {
        i++;
        j++;
      }
    }

    // Sort new columns by system order and filter out the shuffled columns
    const systemOrder = value
      .sort((a, b) => ordered.indexOf(a) - ordered.indexOf(b))
      .filter((k) => !shuffledColumns.find((col: any) => col.name === k));

    // insert shuffled columns in correct position
    shuffledColumns.forEach((col: any) => systemOrder.splice(col.index, 0, col.name));

    onClose(systemOrder);
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
      open={true}
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
        [columns.totalWithdrawnCount],
        [columns.totalWithdrawnWeightOunces, columns.totalWithdrawnWeightPounds],
        [
          columns.totalWithdrawnWeightMilligrams,
          columns.totalWithdrawnWeightGrams,
          columns.totalWithdrawnWeightKilograms,
        ],
      ];
    } else {
      return [
        [columns.totalWithdrawnCount],
        [
          columns.totalWithdrawnWeightMilligrams,
          columns.totalWithdrawnWeightGrams,
          columns.totalWithdrawnWeightKilograms,
        ],
        [columns.totalWithdrawnWeightOunces, columns.totalWithdrawnWeightPounds],
      ];
    }
  };

  const columnsSections = [
    {
      name: strings.GENERAL,
      options: [[{ ...columns.accessionNumber, disabled: true }], [{ ...columns.state, disabled: true }]],
    },
    {
      name: strings.STORING,
      options: [[columns.facility_name], [columns.storageLocation_name]],
    },
    {
      name: strings.SEED_COLLECTION,
      options: [
        [columns.speciesName, columns.species_commonName, columns.species_familyName],
        [
          columns.collectedDate,
          columns.collectionSiteName,
          columns.collectionSiteLandowner,
          columns.collectionSiteNotes,
        ],
        [columns.ageYears, columns.ageMonths],
      ],
    },
    {
      name: strings.WITHDRAWAL,
      options: totalWithdrawnSection(),
    },
    {
      name: strings.VIABILITY,
      options: [[columns.totalViabilityPercent]],
    },
    {
      name: strings.QUANTITY,
      options:
        system === 'imperial'
          ? [
              [columns.estimatedWeightOunces, columns.estimatedWeightPounds],
              [columns.estimatedWeightMilligrams, columns.estimatedWeightGrams, columns.estimatedWeightKilograms],
              [columns.estimatedCount],
            ]
          : [
              [columns.estimatedWeightMilligrams, columns.estimatedWeightGrams, columns.estimatedWeightKilograms],
              [columns.estimatedWeightOunces, columns.estimatedWeightPounds],
              [columns.estimatedCount],
            ],
    },
  ];

  return columnsSections;
}
