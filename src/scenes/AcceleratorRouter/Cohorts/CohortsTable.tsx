import React, { useCallback, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { Box, Typography, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useUser } from 'src/providers';
import { requestCohorts } from 'src/redux/features/cohorts/cohortsAsyncThunks';
import { selectCohorts } from 'src/redux/features/cohorts/cohortsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { CohortPhases } from 'src/types/Cohort';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

import CohortCellRenderer from './CohortCellRenderer';

interface CohortTableProps {
  columns: (activeLocale: string | null) => TableColumnType[];
  extraTableFilters?: SearchNodePayload[];
  filterModifiers?: (filters: FilterConfig[]) => FilterConfig[];
}

const fuzzySearchColumns = ['name', 'phase'];
const defaultSearchOrder: SearchSortOrder = {
  field: 'name',
  direction: 'Ascending',
};

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        {
          key: 'name',
          name: strings.NAME,
          type: 'string',
        },
        {
          key: 'phase',
          name: strings.PHASE,
          type: 'string',
        },
      ]
    : [];

const CohortsTable = ({ filterModifiers, extraTableFilters }: CohortTableProps) => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const history = useHistory();

  const cohorts = useAppSelector(selectCohorts);

  const featuredFilters: FilterConfig[] = useMemo(() => {
    const filters: FilterConfig[] = [
      {
        field: 'phase',
        options: CohortPhases,
        label: strings.PHASE,
      },
    ];

    return activeLocale ? filters : [];
  }, [activeLocale]);

  const goToNewCohort = () => {
    const newProjectLocation = {
      pathname: APP_PATHS.ACCELERATOR_COHORTS_NEW,
    };
    history.push(newProjectLocation);
  };

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search?: SearchNodePayload, searchSortOrder?: SearchSortOrder) => {
      dispatch(requestCohorts({ locale, depth: 'Cohort', search, searchSortOrder }));
    },
    [dispatch]
  );

  useEffect(() => {
    dispatchSearchRequest(activeLocale);
  }, [activeLocale, dispatchSearchRequest]);

  return !cohorts?.length ? (
    <EmptyState onClick={goToNewCohort} />
  ) : (
    <TableWithSearchFilters
      columns={() => columns(activeLocale)}
      defaultSearchOrder={defaultSearchOrder}
      dispatchSearchRequest={dispatchSearchRequest}
      extraTableFilters={extraTableFilters}
      featuredFilters={featuredFilters}
      filterModifiers={filterModifiers}
      fuzzySearchColumns={fuzzySearchColumns}
      id='cohortsTable'
      Renderer={CohortCellRenderer}
      rows={cohorts || []}
    />
  );
};

export default CohortsTable;

const EmptyState = ({ onClick }: { onClick: () => void }): JSX.Element => {
  const theme = useTheme();
  const { isAllowed } = useUser();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 0,
        margin: 'auto',
        padding: theme.spacing(3, 3, 8),
        textAlign: 'center',
      }}
    >
      <Typography
        color={theme.palette.TwClrTxt}
        fontSize='16px'
        fontWeight={400}
        lineHeight='24px'
        marginBottom={theme.spacing(2)}
      >
        {strings.COHORTS_EMPTY_STATE}
      </Typography>
      {isAllowed('CREATE_COHORTS') && (
        <Box sx={{ margin: 'auto' }}>
          <Button icon='plus' id='new-cohort' label={strings.ADD_COHORT} onClick={onClick} size='medium' />
        </Box>
      )}
    </Box>
  );
};
