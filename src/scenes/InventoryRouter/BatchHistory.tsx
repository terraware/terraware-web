import React, { type JSX, useMemo, useState } from 'react';

import { Box, CircularProgress, Grid, Typography, useTheme } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import { EventLogRow } from 'src/components/common/EventLog';
import { FilterField } from 'src/components/common/FilterGroup';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import { useLocalization, useOrganization } from 'src/providers';
import { useGetBatchHistoryQuery } from 'src/queries/generated/nurseryBatches';
import { useListOrganizationUsersQuery } from 'src/queries/generated/organizationUsers';
import strings from 'src/strings';
import {
  BatchAccessionLink,
  BatchHistoryItem,
  BatchHistoryPayload,
  batchHistoryEventEnumToLocalized,
  getBatchHistoryTypesEnum,
} from 'src/types/Batch';
import { FieldOptionsMap, FieldValuesPayload, SearchNodePayload, getFieldNodeValues } from 'src/types/Search';
import { OrganizationUser } from 'src/types/User';
import { getUserDisplayName } from 'src/utils/user';

import BatchHistoryEventDescription, { getEventSearchText } from './BatchHistoryEventDescription';

type BatchHistoryProps = {
  batchId: number;
  nurseryName?: string;
  // The accessions the batch was created from (canonical `accessions` array, with the deprecated
  // singular field as a fallback — see getBatchAccessions). Used to attribute the batch's creation
  // event to the accession it came from.
  accessions?: BatchAccessionLink[];
};

export type BatchHistoryEvent = BatchHistoryItem & {
  editedByName: string;
  modifiedFields: string[];
  previousEvent?: BatchHistoryItem;
  nurseryName?: string;
  // Set on the batch's creation event when the batch was created from an accession, so it can be
  // rendered like the "AddedFromAccession" events for accessions added later.
  fromAccessionId?: number;
  fromAccessionNumber?: string;
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

const findPreviousEvent = (
  historyItem: BatchHistoryItem,
  allItems: BatchHistoryItem[] | null
): BatchHistoryItem | undefined => {
  if (isQuantityHistoryItem(historyItem)) {
    return findPreviousQuantitySnapshot(historyItem, allItems);
  }

  return findPreviousMatchingEvent(historyItem, allItems, (ev): ev is BatchHistoryItem => ev.type === historyItem.type);
};

const getModifiedFields = (historyItem: BatchHistoryItem, previousEv?: BatchHistoryItem): string[] => {
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

export default function BatchHistory({ batchId, nurseryName, accessions }: BatchHistoryProps): JSX.Element {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const [search, setSearch] = useState<string>('');
  const [filters, setFilters] = useState<Record<string, SearchNodePayload>>({});
  const { selectedOrganization } = useOrganization();
  const { currentData: organizationUsersData } = useListOrganizationUsersQuery(selectedOrganization?.id ?? skipToken);
  const users = useMemo(() => {
    const usersById: Record<number, OrganizationUser> = {};
    for (const user of organizationUsersData?.users ?? []) {
      usersById[user.id] = user;
    }
    return usersById;
  }, [organizationUsersData]);
  const { currentData: batchHistory, isFetching } = useGetBatchHistoryQuery(batchId);

  const filterColumns = useMemo(
    (): FilterField[] =>
      activeLocale
        ? [
            { name: 'type', label: strings.EVENT, type: 'multiple_selection' },
            { name: 'editedByName', label: strings.EDITED_BY, type: 'multiple_selection' },
          ]
        : [],
    [activeLocale]
  );

  const filterOptions = useMemo<FieldOptionsMap>(
    () => ({
      type: {
        partial: false,
        values: getBatchHistoryTypesEnum(),
      },
      editedByName: {
        partial: false,
        values: Object.values(users).map((user) => getUserDisplayName(user)),
      },
    }),
    [users]
  );

  const searchProps = useMemo<SearchProps>(
    () => ({
      search,
      onSearch: setSearch,
      hideTableSettings: true,
      filtersProps: {
        filters,
        setFilters,
        filterColumns,
        filterOptions,
        optionsRenderer: (filterName: string, fieldValues: FieldValuesPayload) =>
          filterName === 'type'
            ? fieldValues[filterName].values.map((value) => ({
                label: batchHistoryEventEnumToLocalized((value as BatchHistoryPayload['type']) || '') || '',
                value,
                disabled: false,
              }))
            : undefined,
        pillValuesRenderer: (filterName: string, values: unknown[]) =>
          filterName === 'type'
            ? values
                .map((value) => batchHistoryEventEnumToLocalized((value as BatchHistoryPayload['type']) || '') || '')
                .join(', ')
            : undefined,
      },
    }),
    [filterColumns, filterOptions, filters, search]
  );

  // A batch created from an accession records its initial quantities as a plain "QuantityEdited"
  // event with no accession reference, while accessions added afterward come through as
  // "AddedFromAccession". Attribute the batch's earliest quantity event to the one accession that
  // has no "AddedFromAccession" event of its own (the accession the batch was created from)
  const creationAttribution = useMemo((): { event: BatchHistoryItem; accession: BatchAccessionLink } | undefined => {
    if (!batchHistory || !accessions?.length) {
      return undefined;
    }

    const addedAccessionIds = new Set(
      batchHistory.history
        .filter((item): item is AddedFromAccessionHistoryItem => item.type === 'AddedFromAccession')
        .map((item) => item.accessionId)
    );
    const creationAccession = accessions.find((accession) => !addedAccessionIds.has(accession.accessionId));
    if (!creationAccession) {
      return undefined;
    }

    const earliest = batchHistory.history
      .filter((item): item is FullQuantityHistoryItem => item.type === 'QuantityEdited')
      .reduce<FullQuantityHistoryItem | undefined>(
        (min, item) => ((item.version ?? 0) < (min?.version ?? Infinity) ? item : min),
        undefined
      );
    return earliest ? { event: earliest, accession: creationAccession } : undefined;
  }, [accessions, batchHistory]);

  const events = useMemo((): BatchHistoryEvent[] => {
    if (!batchHistory) {
      return [];
    }

    return batchHistory.history
      .filter((historyItem) =>
        historyItem.type === 'DetailsEdited' ? findPreviousEvent(historyItem, batchHistory.history) : true
      )
      .map((historyItem): BatchHistoryEvent => {
        const previousEvent = findPreviousEvent(historyItem, batchHistory.history);
        return {
          ...historyItem,
          editedByName: getUserDisplayName(users[historyItem.createdBy]),
          modifiedFields: getModifiedFields(historyItem, previousEvent),
          previousEvent,
          nurseryName,
          ...(historyItem === creationAttribution?.event
            ? {
                fromAccessionId: creationAttribution.accession.accessionId,
                fromAccessionNumber: creationAttribution.accession.accessionNumber,
              }
            : {}),
        };
      })
      .sort((a, b) => b.createdTime.localeCompare(a.createdTime) || (b.version ?? 0) - (a.version ?? 0));
  }, [batchHistory, creationAttribution, nurseryName, users]);

  const filteredEvents = useMemo((): BatchHistoryEvent[] => {
    const types = getFieldNodeValues(filters.type);
    const editedByNames = getFieldNodeValues(filters.editedByName);
    const searchTerm = search.trim().toLowerCase();

    return events.filter((event) => {
      if (types?.length && !types.includes(event.type)) {
        return false;
      }
      if (editedByNames?.length && !editedByNames.includes(event.editedByName)) {
        return false;
      }
      return !searchTerm || `${getEventSearchText(event)} ${event.editedByName}`.toLowerCase().includes(searchTerm);
    });
  }, [events, filters, search]);

  return (
    <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt} marginBottom={theme.spacing(1)}>
        {strings.HISTORY}
      </Typography>
      <Grid sx={{ display: 'flex', alignItems: 'center' }} size={12}>
        <Search {...searchProps} />
      </Grid>
      <Box marginTop={theme.spacing(2)}>
        {isFetching && !batchHistory && (
          <Box display='flex' justifyContent='center' padding={theme.spacing(5)}>
            <CircularProgress />
          </Box>
        )}
        {batchHistory && filteredEvents.length === 0 ? (
          <Typography>{strings.BATCH_HISTORY_NO_EVENTS}</Typography>
        ) : (
          filteredEvents.map((event, index) => (
            <EventLogRow
              date={getDateDisplayValue(event.createdTime)}
              description={<BatchHistoryEventDescription batchId={batchId} event={event} />}
              disableTopPadding={index === 0}
              key={`${event.createdTime}-${event.type}-${index}`}
              userName={event.editedByName}
            />
          ))
        )}
      </Box>
    </Card>
  );
}
