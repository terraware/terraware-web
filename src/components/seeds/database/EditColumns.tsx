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

  /**
   * When user confirms selection of table columns to show, this function
   * callback is invoked to pass the information back to the client accessions table.
   * The order of columns in the selection is predetermined by the system (as provided by product/design).
   *
   * However, some of these columns may have been dragged around and changed position.
   * The expectation is that the dragged column positions are maintained.
   *
   * This callback function tries to ensure that by doing the following:
   *
   * For illustration, lets assume the following:
   *
   * Columns before applying the change X = [A, E, B, C, D, I, H] (Here, E and I were dragged into new positions)
   * Newly selected columns Y = [A, C, D, E, F, H, I]
   * Expected final order Z = [A, E, C, D, I, F, H]
   *
   * 1) Find the intersection of X and Y
   *    orderToMaintain = [A, E, C, D, I, H]
   *    this represents the columns that were retained (from the original list prior to selection)
   * 2) Sort orderToMaintain to represent the system defined order
   *    orderToMaintainSorted = [A, C, D, E, H, I]
   * 3) Compare orderToMaintainSorted and orderToMaintain to identify switched columns
   *    i) loop over orderToMaintain (index i), keep another running index j over orderToMaintainSorted which identifies shuffled position index
   *    ii) if orderToMaintain[i] and orderToMaintainSorted[j] are the same, increment both i and j and keep checking
   *    iii) if they are not the same, orderToMaintainSorted at position j was shuffled, book keep that as { [column name]: shuffled-index }
   *         example: { E: 1 }
   *    iv) continue these checks, increment the appropriate index
   *        (we don't want j to move until values at i and j match - since that jumps to the next possible shuffled position)
   *        (if we encounter a column at index j that was already flagged as shuffled, skip over that and continue checking)
   *    v) we end up with the shuffled columns S = { I: 4 ,  E: 1 }
   * 4) Now we can look at the new selections to use
   *    Y = [A, C, D, E, F, H, I]
   *    Remove columns that are on the shuffled list, Y - S = Y'=[A, C, D, F, H]
   *    Reverse this list so we can pop items off like a stack, Y"=[H, F, D, C, A]
   * 5) Create a new result which we populate iterating over the total number of new column names using an index
   *    If the index exists in the shuffled columns, push that into the result
   *    Otherwise, pop colum name off Y" and push that onto the result.
   *    This essentially rebuilds the order of column names while preserving shuffled indices and keeping preferred system order as much as possible.
   *
   */
  const handleOk = () => {
    // fetch system defined preferred order of column names
    const ordered = orderedColumnNames();

    // Determine order of previous columns to maintain such, skip those that aren't in the new list of columns
    const orderToMaintain = props.value.filter((name) => value.indexOf(name) !== -1);

    // sort these keys by system order
    const orderToMaintainSorted = [...orderToMaintain].sort((a, b) => ordered.indexOf(a) - ordered.indexOf(b));
    let i = 0;
    let j = 0;
    const shuffledColumns: Record<string, number> = {};

    // determine which columns were shuffled and book-keep them with shuffled position,
    // do this by comparing the orderToMaintain values against the system sorted values
    while (i < orderToMaintain.length && j < orderToMaintain.length) {
      const currentKey = orderToMaintain[i];
      const sortedKey = orderToMaintainSorted[j];
      if (shuffledColumns[sortedKey]) {
        j++;
      } else if (sortedKey !== currentKey) {
        shuffledColumns[currentKey] = i;
        i++;
      } else {
        i++;
        j++;
      }
    }

    // Sort new columns by system order and filter out the shuffled columns
    const systemOrder: string[] = value
      .sort((a, b) => ordered.indexOf(a) - ordered.indexOf(b))
      .filter((k) => !shuffledColumns[k]);

    systemOrder.reverse(); // reverse so we can pop values off the end

    // create a reverse map of { index: column-name } for quick look-up
    const indexToShuffledColumn: Record<number, string> = Object.keys(shuffledColumns).reduce(
      (acc, curr) => ({ ...acc, [shuffledColumns[curr]]: curr }),
      {} as Record<number, string>
    );

    const result: string[] = []; // populate the list now
    for (let index = 0; index < value.length; index++) {
      if (indexToShuffledColumn[index]) {
        result.push(indexToShuffledColumn[index]);
      } else {
        const columnName = systemOrder.pop();
        if (columnName) {
          result.push(columnName);
        }
      }
    }

    onClose(result);
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
