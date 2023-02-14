import { Container, IconButton, Popover, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useCallback, useMemo, useState } from 'react';
import { FieldValuesPayload, SearchNodePayload } from 'src/api/search';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { DatabaseColumn, Option } from '@terraware/web-components/components/table/types';
import TextField from 'src/components/common/Textfield/Textfield';
import useDebounce from 'src/utils/useDebounce';
import Icon from 'src/components/common/icon/Icon';
import FilterMultiSelect from 'src/components/common/FilterMultiSelect';
import FilterGroup from 'src/components/common/FilterGroup';
import { PillList, PillListItem } from '@terraware/web-components';

interface StyleProps {
  isMobile?: boolean;
  isDesktop?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    margin: theme.spacing(2, 0, 2, 0),
    padding: theme.spacing(0),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  filtersContainer: {
    minHeight: '32px',
    display: 'flex',
    flexDirection: (props: StyleProps) => (props.isMobile ? 'column' : 'row'),
    flexWrap: (props: StyleProps) => (props.isMobile ? 'nowrap' : 'wrap'),
    alignItems: (props: StyleProps) => (props.isMobile ? 'flex-start' : 'center'),
    gap: theme.spacing(1),
    marginTop: `-${theme.spacing(1)}`,
  },
  searchField: {
    width: '300px',
    marginTop: theme.spacing(-0.5),
  },
  preExpFilterDropdown: {
    cursor: 'pointer',
    border: `1px solid ${theme.palette.TwClrBrdrSecondary}`,
    borderRadius: '4px',
    width: '176px',
    height: '40px',
    padding: theme.spacing(1, 2, 1, 1),
    display: 'flex',
    justifyContent: 'space-between',
  },
  preExpFilterIconRight: {
    height: '24px',
    width: '24px',
  },
  popoverContainer: {
    '& .MuiPaper-root': {
      borderRadius: '8px',
      overflow: 'visible',
      width: (props: StyleProps) => (props.isMobile ? '90%' : '320px'),
    },
  },
  mobileContainer: {
    borderRadius: '8px',
    overflow: 'visible',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxHeight: '90%',
    width: '90%',
    zIndex: 1300,
  },
  filterIconContainer: {
    borderRadius: 0,
    fontSize: '16px',
    padding: 0,
  },
  filterIcon: {
    fill: theme.palette.TwClrIcnSecondary,
  },
}));

interface Props {
  columns: DatabaseColumn[];
  searchColumns: DatabaseColumn[];
  preExpFilterColumn: DatabaseColumn;
  filters: Record<string, SearchNodePayload>;
  availableValues: FieldValuesPayload;
  allValues: FieldValuesPayload;
  onChange: (filters: Record<string, SearchNodePayload>) => void;
}

export default function Filters(props: Props): JSX.Element {
  const { columns, searchColumns, preExpFilterColumn, filters, availableValues, allValues, onChange } = props;
  const { isMobile, isDesktop } = useDeviceInfo();
  const classes = useStyles({ isMobile, isDesktop });
  const [searchTerm, setSearchTerm] = React.useState('');
  const searchTermCallback = useCallback(
    (value: string) => {
      let newFilters;
      if (value === '') {
        newFilters = { ...filters };
        delete newFilters.searchTermFilter;
      } else {
        newFilters = { ...filters, ...getSearchTermFilter(searchColumns, value) };
      }
      onChange(newFilters);
    },
    [searchColumns, filters, onChange]
  );
  useDebounce(searchTerm, 250, searchTermCallback);

  const [preExpAnchorEl, setPreExpAnchorEl] = useState<null | HTMLElement>(null);
  const handlePreExpFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setPreExpAnchorEl(event.currentTarget);
  };
  const handlePreExpFilterClose = () => {
    setPreExpAnchorEl(null);
  };

  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const filterPillItems = useMemo(() => {
    const result: PillListItem<string>[] = [];
    const preExpFilterPill: PillListItem<string> = filters.preExpFilter && {
      id: 'preExpFilter',
      label: strings.STATUS,
      value: filters.preExpFilter.values.join(', '),
    };
    if (preExpFilterPill) {
      result.push(preExpFilterPill);
    }
    for (const col of columns) {
      const filter = filters[col.key];
      if (filter) {
        result.push({
          id: col.key,
          label: col.name,
          value: filter.values.join(`, `),
        } as PillListItem<string>);
      }
    }

    return result;
  }, [filters, columns]);

  const onChangePreExpFilter = (selectedValues: string[]) => {
    let newFilters;
    if (selectedValues.length === 0) {
      newFilters = { ...filters };
      delete newFilters.preExpFilter;
    } else {
      newFilters = { ...filters, ...getPreExpFilter(preExpFilterColumn, selectedValues) };
    }
    onChange(newFilters);
  };

  const onUpdateFilters = (newFilters: Record<string, SearchNodePayload>) => {
    const keepFilters = Object.entries(filters).filter(
      (ent) => ent[0] === 'searchTermFilter' || ent[0] === 'preExpFilter'
    );
    onChange({ ...Object.fromEntries(keepFilters), ...newFilters });
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onChange(newFilters);
  };

  const onChangeSearch = (value: unknown) => {
    setSearchTerm(value as string);
  };

  const onClearSearch = () => {
    setSearchTerm('');
  };

  const preExpFilterOptions = getOptions(preExpFilterColumn, availableValues, allValues).filter(
    (opt) => opt.value !== null
  );
  const numPreExpSelected = getCurrentPreExpFilterValues(preExpFilterColumn, filters).length;

  const renderFilterMultiSelect = () => {
    return (
      <FilterMultiSelect
        label={strings.NURSERIES}
        initialSelection={getCurrentPreExpFilterValues(preExpFilterColumn, filters)}
        onCancel={handlePreExpFilterClose}
        onConfirm={(selectedValues: string[]) => {
          handlePreExpFilterClose();
          onChangePreExpFilter(selectedValues);
        }}
        options={preExpFilterOptions.map((opt) => opt.value!)}
        renderOption={(val) => preExpFilterOptions.find((opt) => opt.value === val)?.label ?? ''}
      />
    );
  };

  return (
    <Container maxWidth={false} className={classes.mainContainer}>
      <div className={classes.filtersContainer}>
        <TextField
          placeholder={strings.SEARCH}
          iconLeft='search'
          label=''
          id='search'
          type='text'
          className={classes.searchField}
          onChange={onChangeSearch}
          value={searchTerm}
          iconRight='cancel'
          onClickRightIcon={onClearSearch}
        />
        {preExpFilterColumn && (
          <>
            <div className={classes.preExpFilterDropdown} onClick={handlePreExpFilterClick}>
              <Typography>
                {`${preExpFilterColumn.name}${numPreExpSelected > 0 ? ' (' + numPreExpSelected + ')' : ''}`}
              </Typography>
              <Icon
                name={Boolean(preExpAnchorEl) ? 'chevronUp' : 'chevronDown'}
                className={classes.preExpFilterIconRight}
              />
            </div>
            {isMobile && Boolean(preExpAnchorEl) ? (
              <div className={classes.mobileContainer}>{renderFilterMultiSelect()}</div>
            ) : (
              <Popover
                id='pre-exposed-filter-popover'
                open={Boolean(preExpAnchorEl)}
                onClose={handlePreExpFilterClose}
                anchorEl={preExpAnchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                className={classes.popoverContainer}
              >
                {renderFilterMultiSelect()}
              </Popover>
            )}
          </>
        )}
        <IconButton onClick={handleFilterClick} size='medium' className={classes.filterIconContainer}>
          <Icon name='filter' className={classes.filterIcon} size='medium' />
        </IconButton>
        <Popover
          id='simple-popover'
          open={Boolean(filterAnchorEl)}
          anchorEl={filterAnchorEl}
          onClose={handleFilterClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          className={classes.popoverContainer}
        >
          <FilterGroup
            initialFilters={filters}
            fields={columns.map((col) => ({
              name: col.key,
              label: col.name as string,
              type: col.filter?.type ?? 'hidden',
            }))}
            values={allValues}
            onCancel={handleFilterClose}
            onConfirm={(fs) => {
              handleFilterClose();
              onUpdateFilters(fs);
            }}
          />
        </Popover>
      </div>
      <PillList data={filterPillItems} onRemove={removeFilter} />
    </Container>
  );
}

function getSearchTermFilter(searchCols: DatabaseColumn[], searchTerm: string): Record<string, SearchNodePayload> {
  const orNode: SearchNodePayload = {
    children: searchCols.map((col) => ({
      operation: 'field',
      field: col.key,
      type: 'Fuzzy',
      values: [searchTerm],
    })),
    operation: 'or',
  };

  return { searchTermFilter: orNode };
}

function getPreExpFilter(col: DatabaseColumn, values: string[]): Record<string, SearchNodePayload> {
  return {
    preExpFilter: {
      operation: 'field',
      field: col.key,
      type: 'Exact',
      values,
    },
  };
}

function getCurrentPreExpFilterValues(col: DatabaseColumn, filters: Record<string, SearchNodePayload>): string[] {
  return filters.preExpFilter?.values ?? [];
}

function getOptions(col: DatabaseColumn, availableValues: FieldValuesPayload, allValues: FieldValuesPayload): Option[] {
  return allValues[col.key].values.map((v) => {
    return {
      label: v,
      value: v,
      disabled: availableValues[col.key].values.findIndex((value) => v === value) === -1,
    };
  });
}
