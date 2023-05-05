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

    // preserve order of existing visible columns
    // filter out those that are not in the new list of columns to set
    // i.e. current columns: A, C, D, B
    //      new columns: A, B, D, E, F
    //      preserved order of original list of columns: A, D, B (C is not in the new list)
    const orderToMaintain = props.value.filter((name) => value.indexOf(name) !== -1);

    // identify new columns to insert into the preserved order
    // i.e. preserved order: A, D, B
    //      new columns to insert: E, F
    const keysToInsert = value.filter((name) => orderToMaintain.indexOf(name) === -1);

    // insert keys into the maintained order
    // get the index for the keys from the ordered keys in new values
    const systemOrder = value.sort((a, b) => ordered.indexOf(a) - ordered.indexOf(b));
    keysToInsert.forEach((key) => orderToMaintain.splice(systemOrder.indexOf(key), 0, key));

    onClose(orderToMaintain);
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
