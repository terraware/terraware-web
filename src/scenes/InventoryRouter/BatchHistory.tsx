import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import { Option } from '@terraware/web-components/components/table/types';

import Card from 'src/components/common/Card';
import { FilterField } from 'src/components/common/FilterGroup';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import Table from 'src/components/common/table';
import { useOrganization } from 'src/providers';
import { NurseryBatchService, OrganizationUserService } from 'src/services';
import strings from 'src/strings';
import {
  BatchHistoryItem,
  BatchHistoryPayload,
  batchHistoryEventEnumToLocalized,
  getBatchHistoryTypesEnum,
} from 'src/types/Batch';
import { FieldOptionsMap, FieldValuesPayload } from 'src/types/Search';
import { OrganizationUser } from 'src/types/User';
import { getUserDisplayName } from 'src/utils/user';

import BatchHistoryRenderer from './BatchHistoryRenderer';
import EventDetailsModal from './EventDetailsModal';

const columns = (): TableColumnType[] => [
  { key: 'createdTime', name: strings.DATE, type: 'date' },
  { key: 'type', name: strings.EVENT, type: 'string' },
  { key: 'editedByName', name: strings.EDITED_BY, type: 'string' },
];

type BatchHistoryProps = {
  batchId: number;
  nurseryName?: string;
};

export type BatchHistoryItemForTable = BatchHistoryItem & {
  editedByName: string;
  previousEvent?: BatchHistoryItem;
  modifiedFields: string[];
  nurseryName?: string;
};

export default function BatchHistory({ batchId, nurseryName }: BatchHistoryProps): JSX.Element {
  const theme = useTheme();
  const [search, setSearch] = useState<string>('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [filterOptions, setFilterOptions] = useState<FieldOptionsMap>({});
  const [results, setResults] = useState<BatchHistoryItemForTable[] | null>();
  const [users, setUsers] = useState<Record<number, OrganizationUser> | undefined>({});
  const { selectedOrganization } = useOrganization();
  const [selectedEvent, setSelectedEvent] = useState<any>();
  const [openEventDetailsModal, setOpenEventDetailsModal] = useState<boolean>(false);

  const filterColumns = useMemo<FilterField[]>(() => {
    return [
      { name: 'type', label: strings.EVENT, type: 'multiple_selection' },
      { name: 'editedByName', label: strings.EDITED_BY, type: 'multiple_selection' },
    ];
  }, []);

  useEffect(() => {
    setFilterOptions({
      type: {
        partial: false,
        values: getBatchHistoryTypesEnum(),
      },
      editedByName: {
        partial: false,
        values: users ? Object.values(users).map((user) => getUserDisplayName(user)) : [],
      },
    });
  }, [setFilterOptions, users]);

  const searchProps = useMemo<SearchProps>(
    () => ({
      search,
      onSearch: (value: string) => setSearch(value),
      filtersProps: {
        filters,
        setFilters: (value: Record<string, any>) => setFilters(value),
        filterColumns,
        filterOptions,
        optionsRenderer: (filterName: string, fieldValues: FieldValuesPayload): Option[] | undefined => {
          if (filterName !== 'type') {
            return;
          }

          return fieldValues[filterName].values.map(
            (value): Option => ({
              label: batchHistoryEventEnumToLocalized((value as BatchHistoryPayload['type']) || '') || '',
              value,
              disabled: false,
            })
          );
        },
        pillValuesRenderer: (filterName: string, values: unknown[]): string | undefined => {
          if (filterName !== 'type') {
            return;
          }

          return values
            .map((value) => batchHistoryEventEnumToLocalized((value as BatchHistoryPayload['type']) || '') || '')
            .join(', ');
        },
      },
    }),
    [filters, filterColumns, filterOptions, search]
  );

  useEffect(() => {
    if (selectedOrganization) {
      const fetchUsers = async () => {
        const response = await OrganizationUserService.getOrganizationUsers(selectedOrganization.id);
        if (response.requestSucceeded) {
          const usersById: Record<number, OrganizationUser> = {};
          for (const user of response.users ?? []) {
            usersById[user.id] = user;
          }
          setUsers(usersById);
        }
      };
      void fetchUsers();
    }
  }, [selectedOrganization]);

  const findPreviousEvent = useCallback(
    (batch: BatchHistoryItem, allItems: BatchHistoryItem[] | null): BatchHistoryItem | undefined => {
      const eventsOfSameType = allItems?.filter((result) =>
        batch.type === 'QuantityEdited' || batch.type === 'StatusChanged'
          ? result.type === 'QuantityEdited' || result.type === 'StatusChanged'
          : result.type === batch.type
      );
      let previousEv: BatchHistoryItem | undefined;
      eventsOfSameType?.forEach((ev) => {
        if (ev.version && batch.version && ev.version < batch.version && ev.version > (previousEv?.version || 0)) {
          previousEv = ev;
        }
      });
      return previousEv;
    },
    []
  );

  useEffect(() => {
    if (users) {
      const fetchResults = async () => {
        const response = await NurseryBatchService.getBatchHistory(batchId, search, filters, users);
        if (response.requestSucceeded) {
          const historyItemsForTable =
            response.history
              ?.filter((historyItem) => {
                // Filter out the first, "empty" result
                return historyItem.type === 'DetailsEdited' ? findPreviousEvent(historyItem, response.history) : true;
              })
              .map((historyItem) => {
                const userSelected = users[historyItem.createdBy];
                const previousEv = findPreviousEvent(historyItem, response.history);
                const changedFields = [];
                if (historyItem.type === 'DetailsEdited' && (previousEv?.type === 'DetailsEdited' || !previousEv)) {
                  if ((historyItem.notes || '') !== (previousEv?.notes || '')) {
                    changedFields.push(strings.NOTES);
                  }
                  if (
                    (historyItem.substrate || '') !== (previousEv?.substrate || '') ||
                    (historyItem.substrateNotes || '') !== (previousEv?.substrateNotes || '')
                  ) {
                    changedFields.push(strings.SUBSTRATE);
                  }
                  if (
                    (historyItem.treatment || '') !== (previousEv?.treatment || '') ||
                    (historyItem.treatmentNotes || '') !== (previousEv?.treatmentNotes || '')
                  ) {
                    changedFields.push(strings.TREATMENT);
                  }
                  if ((historyItem.germinationStartedDate || '') !== (previousEv?.germinationStartedDate || '')) {
                    changedFields.push(strings.GERMINATION_ESTABLISHMENT_STARTED_DATE);
                  }
                  if ((historyItem.readyByDate || '') !== (previousEv?.readyByDate || '')) {
                    changedFields.push(strings.ESTIMATED_READY_DATE);
                  }
                  if ((historyItem.seedsSownDate || '') !== (previousEv?.seedsSownDate || '')) {
                    changedFields.push(strings.SEEDS_SOWN_DATE);
                  }
                }
                if (
                  (historyItem.type === 'QuantityEdited' || historyItem.type === 'StatusChanged') &&
                  (previousEv?.type === 'QuantityEdited' || previousEv?.type === 'StatusChanged' || !previousEv)
                ) {
                  if (historyItem.germinatingQuantity !== previousEv?.germinatingQuantity) {
                    changedFields.push(strings.GERMINATION_ESTABLISHMENT_QUANTITY);
                  }
                  if (historyItem.activeGrowthQuantity !== previousEv?.activeGrowthQuantity) {
                    changedFields.push(strings.ACTIVE_GROWTH_QUANTITY);
                  }
                  if (historyItem.hardeningOffQuantity !== previousEv?.hardeningOffQuantity) {
                    changedFields.push(strings.HARDENING_OFF_QUANTITY);
                  }
                  if (historyItem.readyQuantity !== previousEv?.readyQuantity) {
                    changedFields.push(strings.READY_TO_PLANT_QUANTITY);
                  }
                }
                return {
                  ...historyItem,
                  editedByName: getUserDisplayName(userSelected),
                  previousEvent: previousEv,
                  modifiedFields: changedFields,
                  nurseryName,
                };
              }) || null;

          setResults(historyItemsForTable);
        }
      };

      void fetchResults();
    }
  }, [users, batchId, findPreviousEvent, nurseryName, filters, search]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onBatchSelected = (batch: any, fromColumn?: string) => {
    setSelectedEvent(batch);
    setOpenEventDetailsModal(true);
  };

  return (
    <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      {openEventDetailsModal && (
        <EventDetailsModal
          onClose={() => {
            setSelectedEvent(undefined);
            setOpenEventDetailsModal(false);
          }}
          selectedEvent={selectedEvent}
          batchId={batchId}
        />
      )}
      <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt} marginBottom={theme.spacing(1)}>
        {strings.HISTORY}
      </Typography>
      <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
        <Search {...searchProps} />
      </Grid>
      <Grid item xs={12}>
        {results && (
          <Table
            id='batch-history-table'
            columns={columns}
            rows={results}
            orderBy={'createdTime'}
            order={'desc'}
            Renderer={BatchHistoryRenderer}
            onSelect={onBatchSelected}
            controlledOnSelect={true}
            isPresorted={false}
          />
        )}
      </Grid>
    </Card>
  );
}
