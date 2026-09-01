import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import { Option } from '@terraware/web-components/components/table/types';

import Card from 'src/components/common/Card';
import { FilterField } from 'src/components/common/FilterGroup';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import Table from 'src/components/common/table';
import { useOrganization } from 'src/providers';
import { useGetBatchHistoryQuery } from 'src/queries/generated/nurseryBatches';
import { OrganizationUserService } from 'src/services';
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

type FullQuantityHistoryItem = Extract<BatchHistoryItem, { type: 'QuantityEdited' | 'StatusChanged' }>;
type AddedFromAccessionHistoryItem = Extract<BatchHistoryItem, { type: 'AddedFromAccession' }>;
type IncomingWithdrawalHistoryItem = Extract<BatchHistoryItem, { type: 'IncomingWithdrawal' }>;
type OutgoingWithdrawalHistoryItem = Extract<BatchHistoryItem, { type: 'OutgoingWithdrawal' }>;
type QuantityHistoryItem =
  | FullQuantityHistoryItem
  | AddedFromAccessionHistoryItem
  | IncomingWithdrawalHistoryItem
  | OutgoingWithdrawalHistoryItem;

const isFullQuantityHistoryItem = (historyItem?: BatchHistoryItem): historyItem is FullQuantityHistoryItem =>
  historyItem?.type === 'QuantityEdited' || historyItem?.type === 'StatusChanged';

const isQuantityHistoryItem = (historyItem: BatchHistoryItem): historyItem is QuantityHistoryItem =>
  isFullQuantityHistoryItem(historyItem) ||
  historyItem.type === 'AddedFromAccession' ||
  historyItem.type === 'IncomingWithdrawal' ||
  historyItem.type === 'OutgoingWithdrawal';

const emptyQuantitySnapshot = (historyItem: QuantityHistoryItem): FullQuantityHistoryItem => ({
  activeGrowthQuantity: 0,
  createdBy: historyItem.createdBy,
  createdTime: historyItem.createdTime,
  germinatingQuantity: 0,
  hardeningOffQuantity: 0,
  notReadyQuantity: 0,
  readyQuantity: 0,
  type: 'QuantityEdited',
  version: historyItem.version,
});

const applyQuantityHistoryItem = (
  historyItem: QuantityHistoryItem,
  previousSnapshot?: FullQuantityHistoryItem
): FullQuantityHistoryItem => {
  if (isFullQuantityHistoryItem(historyItem)) {
    return historyItem;
  }

  const snapshot = previousSnapshot ?? emptyQuantitySnapshot(historyItem);
  const baseSnapshot = {
    ...snapshot,
    createdBy: historyItem.createdBy,
    createdTime: historyItem.createdTime,
    type: 'QuantityEdited' as const,
    version: historyItem.version,
  };

  if (historyItem.type === 'AddedFromAccession') {
    return {
      ...baseSnapshot,
      germinatingQuantity: historyItem.germinatingQuantity,
    };
  }

  if (historyItem.type === 'IncomingWithdrawal') {
    return {
      ...baseSnapshot,
      activeGrowthQuantity: snapshot.activeGrowthQuantity + (historyItem.activeGrowthQuantityAdded ?? 0),
      germinatingQuantity: snapshot.germinatingQuantity + (historyItem.germinatingQuantityAdded ?? 0),
      hardeningOffQuantity: snapshot.hardeningOffQuantity + (historyItem.hardeningOffQuantityAdded ?? 0),
      notReadyQuantity: snapshot.notReadyQuantity + (historyItem.notReadyQuantityAdded ?? 0),
      readyQuantity: snapshot.readyQuantity + (historyItem.readyQuantityAdded ?? 0),
    };
  }

  return {
    ...baseSnapshot,
    activeGrowthQuantity: snapshot.activeGrowthQuantity - (historyItem.activeGrowthQuantityWithdrawn ?? 0),
    germinatingQuantity: snapshot.germinatingQuantity - (historyItem.germinatingQuantityWithdrawn ?? 0),
    hardeningOffQuantity: snapshot.hardeningOffQuantity - (historyItem.hardeningOffQuantity ?? 0),
    notReadyQuantity: snapshot.notReadyQuantity - (historyItem.notReadyQuantityWithdrawn ?? 0),
    readyQuantity: snapshot.readyQuantity - (historyItem.readyQuantityWithdrawn ?? 0),
  };
};

const findPreviousMatchingEvent = <T extends BatchHistoryItem>(
  historyItem: BatchHistoryItem,
  allItems: BatchHistoryItem[] | null,
  isCandidate: (item: BatchHistoryItem) => item is T
): T | undefined => {
  let previousEv: T | undefined;

  allItems?.forEach((ev) => {
    if (
      isCandidate(ev) &&
      ev.version &&
      historyItem.version &&
      ev.version < historyItem.version &&
      ev.version > (previousEv?.version || 0)
    ) {
      previousEv = ev;
    }
  });

  return previousEv;
};

const findPreviousQuantitySnapshot = (
  historyItem: BatchHistoryItem,
  allItems: BatchHistoryItem[] | null
): FullQuantityHistoryItem | undefined => {
  if (!historyItem.version) {
    return undefined;
  }

  return allItems
    ?.filter(
      (event): event is QuantityHistoryItem =>
        isQuantityHistoryItem(event) && event.version !== undefined && event.version < historyItem.version!
    )
    .sort((a, b) => (a.version ?? 0) - (b.version ?? 0))
    .reduce<FullQuantityHistoryItem | undefined>(
      (previousSnapshot, event) => applyQuantityHistoryItem(event, previousSnapshot),
      undefined
    );
};

export const findPreviousEvent = (
  historyItem: BatchHistoryItem,
  allItems: BatchHistoryItem[] | null
): BatchHistoryItem | undefined => {
  if (isQuantityHistoryItem(historyItem)) {
    return findPreviousQuantitySnapshot(historyItem, allItems);
  }

  return findPreviousMatchingEvent(historyItem, allItems, (ev): ev is BatchHistoryItem => ev.type === historyItem.type);
};

export const getModifiedFields = (historyItem: BatchHistoryItem, previousEv?: BatchHistoryItem): string[] => {
  const changedFields: string[] = [];

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

  if (isFullQuantityHistoryItem(historyItem) && (isFullQuantityHistoryItem(previousEv) || !previousEv)) {
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

  if (historyItem.type === 'AddedFromAccession') {
    changedFields.push(strings.GERMINATION_ESTABLISHMENT_QUANTITY);
  }

  return changedFields;
};

export default function BatchHistory({ batchId, nurseryName }: BatchHistoryProps): JSX.Element {
  const theme = useTheme();
  const [search, setSearch] = useState<string>('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [users, setUsers] = useState<Record<number, OrganizationUser> | undefined>({});
  const { currentData: batchHistory } = useGetBatchHistoryQuery(batchId);
  const filterOptions = useMemo<FieldOptionsMap>(
    () => ({
      type: {
        partial: false,
        values: getBatchHistoryTypesEnum(),
      },
      editedByName: {
        partial: false,
        values: users ? Object.values(users).map((user) => getUserDisplayName(user)) : [],
      },
    }),
    [users]
  );
  const { selectedOrganization } = useOrganization();
  const [selectedEvent, setSelectedEvent] = useState<any>();
  const [openEventDetailsModal, setOpenEventDetailsModal] = useState<boolean>(false);

  const filterColumns = useMemo<FilterField[]>(() => {
    return [
      { name: 'type', label: strings.EVENT, type: 'multiple_selection' },
      { name: 'editedByName', label: strings.EDITED_BY, type: 'multiple_selection' },
    ];
  }, []);

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

  const filteredHistory = useMemo((): BatchHistoryItem[] | null => {
    if (!batchHistory || !users) {
      return null;
    }

    let filtered = [...batchHistory.history];

    if (filters.type?.values) {
      filtered = filtered.filter((ev) => filters.type.values.indexOf(ev.type) > -1);
    }

    if (filters.editedByName?.values) {
      filtered = filtered.filter(
        (ev) => filters.editedByName.values.indexOf(getUserDisplayName(users[ev.createdBy])) > -1
      );
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filtered = filtered.filter((ev) => getUserDisplayName(users[ev.createdBy]).match(regex));
    }

    return filtered;
  }, [batchHistory, filters, search, users]);

  const results = useMemo((): BatchHistoryItemForTable[] | null => {
    if (!filteredHistory || !users) {
      return null;
    }

    return filteredHistory
      .filter((historyItem) => {
        return historyItem.type === 'DetailsEdited'
          ? findPreviousEvent(historyItem, batchHistory?.history ?? null)
          : true;
      })
      .map((historyItem) => {
        const userSelected = users[historyItem.createdBy];
        const previousEv = findPreviousEvent(historyItem, batchHistory?.history ?? null);
        const changedFields = getModifiedFields(historyItem, previousEv);
        return {
          ...historyItem,
          editedByName: getUserDisplayName(userSelected),
          previousEvent: previousEv,
          modifiedFields: changedFields,
          nurseryName,
        };
      });
  }, [batchHistory?.history, filteredHistory, nurseryName, users]);

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
