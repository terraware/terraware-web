import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button, DropdownItem, TableColumnType } from '@terraware/web-components';

import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import Card from 'src/components/common/Card';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { requestListParticipants } from 'src/redux/features/participants/participantsAsyncThunks';
import { selectParticipantListRequest } from 'src/redux/features/participants/participantsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Participant } from 'src/types/Participant';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';

import ParticipantsCellRenderer from './ParticipantsCellRenderer';

type ParticipantType = Omit<Participant, 'projects'> & {
  project_name: string[];
};

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        {
          key: 'name',
          name: strings.PARTICIPANT,
          type: 'string',
        },
        {
          key: 'project_name',
          name: strings.PROJECT,
          type: 'string',
        },
        {
          key: 'cohort_name',
          name: strings.COHORT,
          type: 'string',
        },
      ]
    : [];

const fuzzySearchColumns = ['name', 'project_name', 'cohort_name'];
const defaultSearchOrder: SearchSortOrder = {
  field: 'name',
  direction: 'Ascending',
};

export default function ParticipantList(): JSX.Element {
  const history = useHistory();
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [hasFilters, setHasFilters] = useState<boolean>(false);
  const [participants, setParticipants] = useState<ParticipantType[]>([]);
  const [requestId, setRequestId] = useState<string>('');
  const participantsResult = useAppSelector(selectParticipantListRequest(requestId));

  // TODO: check for non-empty filters
  const isEmptyState = useMemo<boolean>(
    () => participantsResult?.status === 'success' && participants.length === 0 && !hasFilters,
    [hasFilters, participants, participantsResult]
  );

  useEffect(() => {
    if (participantsResult?.status === 'error') {
      snackbar.toastError();
    }
    if (participantsResult?.data) {
      setParticipants(
        participantsResult.data.map(
          (participant: Participant): ParticipantType => ({
            ...participant,
            project_name: participant.projects.flatMap((project) => project.name),
          })
        )
      );
    }
  }, [participantsResult, snackbar]);

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search: SearchNodePayload, sortOrder: SearchSortOrder) => {
      setHasFilters(search.children.length > 0);
      const request = dispatch(requestListParticipants({ locale, search, sortOrder }));
      setRequestId(request.requestId);
    },
    [dispatch]
  );

  const goToNewParticipant = useCallback(() => {
    history.push(APP_PATHS.ACCELERATOR_PARTICIPANTS_NEW);
  }, [history]);

  const cohorts = useMemo<Record<string, string>>(
    () =>
      (participants || []).reduce(
        (acc, participant) => {
          acc[participant.cohort_id] = participant.cohort_name;
          return acc;
        },
        {} as Record<string, string>
      ),
    [participants]
  );

  const featuredFilters: FilterConfig[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              field: 'cohort_id',
              label: strings.COHORT,
              options: (participants || [])?.map((participant: ParticipantType) => `${participant.cohort_id}`),
              renderOption: (id: string | number) => cohorts[id] || '',
              searchNodeCreator: (values: (number | string | null)[]) => ({
                field: 'cohort_id',
                operation: 'field',
                type: 'Exact',
                values: values.map((value: number | string | null): string | null =>
                  value === null ? value : `${value}`
                ),
              }),
            },
          ]
        : [],
    [activeLocale, cohorts, participants]
  );

  const actionMenus = useMemo<ReactNode | null>(() => {
    if (isEmptyState || !activeLocale) {
      return null;
    }

    return (
      <Box>
        <Button
          icon='plus'
          id='new-participant'
          onClick={goToNewParticipant}
          priority='secondary'
          label={isMobile ? '' : strings.ADD_PARTICIPANT}
          size='small'
        />
        <OptionsMenu
          size='small'
          onOptionItemClick={(item: DropdownItem) => {
            if (item.value === 'export-participants') {
              window.alert('Export WIP');
            }
          }}
          optionItems={[{ label: strings.EXPORT, value: 'export-participants' }]}
        />
      </Box>
    );
  }, [activeLocale, goToNewParticipant, isEmptyState, isMobile]);

  return (
    <Card style={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Typography color={theme.palette.TwClrTxt} fontSize='20px' fontWeight={600} lineHeight='28px'>
          {strings.PARTICIPANTS}
        </Typography>
        {actionMenus}
      </Box>
      {participantsResult?.status === 'pending' && <BusySpinner />}
      {isEmptyState && <EmptyState onClick={goToNewParticipant} />}
      {!isEmptyState && (
        <TableWithSearchFilters
          columns={columns}
          defaultSearchOrder={defaultSearchOrder}
          dispatchSearchRequest={dispatchSearchRequest}
          featuredFilters={featuredFilters}
          fuzzySearchColumns={fuzzySearchColumns}
          id='accelerator-participants-table'
          Renderer={ParticipantsCellRenderer}
          rows={participants}
        />
      )}
    </Card>
  );
}

const EmptyState = ({ onClick }: { onClick: () => void }): JSX.Element => {
  const theme = useTheme();

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
        {strings.PARTICIPANTS_EMPTY_STATE}
      </Typography>
      <Box sx={{ margin: 'auto' }}>
        <Button icon='plus' id='new-participant' label={strings.ADD_PARTICIPANT} onClick={onClick} size='medium' />
      </Box>
    </Box>
  );
};
