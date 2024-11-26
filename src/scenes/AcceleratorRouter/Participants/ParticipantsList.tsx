import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, DropdownItem, TableColumnType } from '@terraware/web-components';

import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import Card from 'src/components/common/Card';
import ExportCsvModal from 'src/components/common/ExportCsvModal';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useUser } from 'src/providers';
import { requestListParticipants } from 'src/redux/features/participants/participantsAsyncThunks';
import { selectParticipantListRequest } from 'src/redux/features/participants/participantsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ParticipantsService } from 'src/services';
import strings from 'src/strings';
import { ParticipantSearchResult } from 'src/types/Participant';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';

import ParticipantsCellRenderer from './ParticipantsCellRenderer';

type ParticipantType = Omit<ParticipantSearchResult, 'projects'> & {
  'projects.name': string[];
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
          key: 'projects.name',
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

const fuzzySearchColumns = ['name', 'projects.name', 'cohort_name'];
const defaultSearchOrder: SearchSortOrder = {
  field: 'name',
  direction: 'Ascending',
};

export default function ParticipantList(): JSX.Element {
  const navigate = useNavigate();
  const { activeLocale } = useLocalization();
  const { isAllowed } = useUser();
  const { isMobile } = useDeviceInfo();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [openDownload, setOpenDownload] = useState<boolean>(false);
  const [lastSearch, setLastSearch] = useState<SearchNodePayload>();
  const [lastSort, setLastSort] = useState<SearchSortOrder>();
  const [hasFilters, setHasFilters] = useState<boolean>(false);
  const [participants, setParticipants] = useState<ParticipantType[]>([]);
  const [requestId, setRequestId] = useState<string>('');
  const participantsResult = useAppSelector(selectParticipantListRequest(requestId));

  const isEmptyState = useMemo<boolean>(
    () => participantsResult?.status === 'success' && participants.length === 0 && !hasFilters,
    [hasFilters, participants, participantsResult]
  );

  useEffect(() => {
    if (participantsResult?.status === 'error') {
      snackbar.toastError();
      return;
    }
    if (participantsResult?.data) {
      setParticipants(
        participantsResult.data.map(
          (participant: ParticipantSearchResult): ParticipantType => ({
            ...participant,
            'projects.name': participant.projects.flatMap((project) => project.name),
          })
        )
      );
    }
  }, [participantsResult, snackbar]);

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search: SearchNodePayload, sortOrder: SearchSortOrder) => {
      if (!locale) {
        return;
      }
      setLastSearch(search);
      setLastSort(sortOrder);
      setHasFilters(search.children.length > 0);
      const request = dispatch(requestListParticipants({ search, sortOrder }));
      setRequestId(request.requestId);
    },
    [dispatch]
  );

  const goToNewParticipant = useCallback(() => {
    navigate(APP_PATHS.ACCELERATOR_PARTICIPANTS_NEW);
  }, [navigate]);

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
              pillValueRenderer: (values: (string | number | null)[]) =>
                values.map((value) => cohorts[value || ''] || '').join(', '),
              renderOption: (id: string | number) => cohorts[id] || '',
            },
          ]
        : [],
    [activeLocale, cohorts, participants]
  );

  const actionMenus = useMemo<ReactNode | null>(() => {
    const canCreateParticipants = isAllowed('CREATE_PARTICIPANTS');
    const canExportParticipants = isAllowed('EXPORT_PARTICIPANTS');

    if (isEmptyState || !activeLocale || !(canCreateParticipants || canExportParticipants)) {
      return null;
    }

    return (
      <Box>
        {canCreateParticipants && (
          <Button
            icon='plus'
            id='new-participant'
            onClick={goToNewParticipant}
            priority='secondary'
            label={isMobile ? '' : strings.ADD_PARTICIPANT}
            size='small'
          />
        )}
        {canExportParticipants && (
          <OptionsMenu
            size='small'
            onOptionItemClick={(item: DropdownItem) => {
              if (item.value === 'export-participants') {
                setOpenDownload(true);
              }
            }}
            optionItems={[{ label: strings.EXPORT, value: 'export-participants' }]}
          />
        )}
      </Box>
    );
  }, [activeLocale, goToNewParticipant, isAllowed, isEmptyState, isMobile]);

  return (
    <>
      <ExportCsvModal
        onClose={() => setOpenDownload(false)}
        onExport={() => ParticipantsService.download(lastSearch, lastSort)}
        open={openDownload}
      />
      {isEmptyState && <EmptyState onClick={goToNewParticipant} />}
      {!isEmptyState && (
        <TableWithSearchFilters
          busy={participantsResult?.status === 'pending'}
          columns={columns}
          defaultSearchOrder={defaultSearchOrder}
          dispatchSearchRequest={dispatchSearchRequest}
          featuredFilters={featuredFilters}
          fuzzySearchColumns={fuzzySearchColumns}
          id='accelerator-participants-table'
          Renderer={ParticipantsCellRenderer}
          rightComponent={actionMenus}
          rows={participants}
          title={strings.PARTICIPANTS}
          stickyFilters
        />
      )}
    </>
  );
}

const EmptyState = ({ onClick }: { onClick: () => void }): JSX.Element => {
  const theme = useTheme();
  const { isAllowed } = useUser();

  return (
    <Card style={{ display: 'flex', flexDirection: 'column' }} title={strings.PARTICIPANTS}>
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
        {isAllowed('CREATE_PARTICIPANTS') && (
          <Box sx={{ margin: 'auto' }}>
            <Button icon='plus' id='new-participant' label={strings.ADD_PARTICIPANT} onClick={onClick} size='medium' />
          </Box>
        )}
      </Box>
    </Card>
  );
};
