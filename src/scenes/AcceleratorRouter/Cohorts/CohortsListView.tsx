import React, { type JSX, ReactNode, useCallback, useMemo, useState } from 'react';

import { Box, Card, Typography, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useUser } from 'src/providers';
import { requestCohorts } from 'src/redux/features/cohorts/cohortsAsyncThunks';
import { selectCohorts } from 'src/redux/features/cohorts/cohortsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { CohortPhases } from 'src/types/Cohort';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import CohortCellRenderer from './CohortCellRenderer';

interface CohortsListViewProps {
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
        {
          key: 'numOfParticipants',
          name: strings.PARTICIPANTS,
          type: 'number',
        },
      ]
    : [];

const CohortsListView = ({ filterModifiers, extraTableFilters }: CohortsListViewProps) => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const navigate = useSyncNavigate();
  const { isAllowed } = useUser();
  const { isMobile } = useDeviceInfo();

  const [hasFilters, setHasFilters] = useState<boolean>(false);
  const cohorts = useAppSelector(selectCohorts);
  const isEmptyState = useMemo<boolean>(() => cohorts?.length === 0 && !hasFilters, [cohorts?.length, hasFilters]);

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

  const goToNewCohort = useCallback(() => {
    const newProjectLocation = {
      pathname: APP_PATHS.ACCELERATOR_COHORTS_NEW,
    };
    navigate(newProjectLocation);
  }, [navigate]);

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search: SearchNodePayload, searchSortOrder: SearchSortOrder) => {
      setHasFilters(search.children.length > 0);
      void dispatch(requestCohorts({ locale, search, searchSortOrder }));
    },
    [dispatch]
  );

  const actionMenus = useMemo<ReactNode | null>(() => {
    const canCreateCohorts = isAllowed('CREATE_COHORTS');

    if (isEmptyState || !activeLocale || !canCreateCohorts) {
      return null;
    }

    return (
      <Button
        icon='plus'
        id='new-participant'
        onClick={goToNewCohort}
        priority='secondary'
        label={isMobile ? '' : strings.ADD_COHORT}
        size='small'
      />
    );
  }, [activeLocale, goToNewCohort, isAllowed, isEmptyState, isMobile]);

  return isEmptyState ? (
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
      rightComponent={actionMenus}
      rows={cohorts || []}
      title={strings.COHORTS}
      clientSortedFields={['numOfParticipants']}
      stickyFilters
    />
  );
};

const EmptyState = ({ onClick }: { onClick: () => void }): JSX.Element => {
  const theme = useTheme();
  const { isAllowed } = useUser();

  return (
    <Card style={{ display: 'flex', flexDirection: 'column' }} title={strings.COHORTS}>
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
            <Button icon='plus' id='new-participant' label={strings.ADD_COHORT} onClick={onClick} size='medium' />
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default CohortsListView;
