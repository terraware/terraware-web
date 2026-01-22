import React, { type JSX } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { IconTooltip } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useUser } from 'src/providers';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import Checkbox from '../../common/Checkbox';
import Divisor from '../../common/Divisor';
import RadioButton from '../../common/RadioButton';
import { Preset, columnsIndexed, orderedColumnNames, searchPresets } from './columns';

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

  const [value, setValue] = React.useState(props.value);

  React.useEffect(() => {
    setValue(props.value);
    setPreset(undefined);
  }, [props.value]);

  const handleCancel = () => {
    onClose();
  };

  const handleOk = () => {
    const ordered = orderedColumnNames();
    const sortedValues = [...value].sort((a, b) => ordered.indexOf(a) - ordered.indexOf(b));
    onClose(sortedValues);
  };

  const onSelectPreset = (updatedPreset: Preset) => {
    setPreset(updatedPreset);
    setValue([...updatedPreset.fields]);
  };

  const onChange = (id: string, checked: boolean) => {
    if (checked) {
      const newValue = [...value];
      newValue.push(id);
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

  const userSections = sections(userPreferences.preferredWeightSystem as string);

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

        {userSections.map(({ name, tooltip, options }) => (
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
      options: [
        [{ ...columns.accessionNumber, disabled: true }],
        [{ ...columns.state, disabled: true }],
        [{ ...columns.project_name, disabled: true }],
      ],
    },
    {
      name: strings.STORING,
      options: [[columns.facility_name], [columns.subLocation_name]],
    },
    {
      name: strings.SEED_COLLECTION,
      options: [
        [columns.speciesName, columns.species_commonName, columns.species_familyName, columns.plantId],
        [
          columns.collectedDate,
          columns.collectionSiteName,
          columns.collectionSiteLandowner,
          columns.collectionSiteNotes,
          columns['geolocations.coordinates'],
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
