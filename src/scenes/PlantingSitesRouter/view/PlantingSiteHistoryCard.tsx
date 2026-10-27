import React, { type JSX, useCallback, useMemo } from 'react';

import { useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import Table from 'src/components/common/table';
import { useLocalization } from 'src/providers';
import {
  PlantingSiteHistoryEventPayload,
  useListPlantingSiteHistoryEventsQuery,
} from 'src/queries/generated/plantingSites';

type PlantingSiteHistoryCardProps = {
  plantingSiteId: number;
};

const PlantingSiteHistoryCard = ({ plantingSiteId }: PlantingSiteHistoryCardProps): JSX.Element | null => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { currentData } = useListPlantingSiteHistoryEventsQuery(plantingSiteId);

  const columns = useMemo(
    (): TableColumnType[] => [
      { key: 'date', name: strings.DATE, type: 'date' },
      { key: 'event', name: strings.EVENT, type: 'string' },
      { key: 'user', name: strings.USER, type: 'string' },
    ],
    [strings]
  );

  const eventLabel = useCallback(
    (type: PlantingSiteHistoryEventPayload['type']): string => {
      switch (type) {
        case 'Created':
          return strings.CREATED;
        case 'Edited':
          return strings.EDITED;
      }
    },
    [strings]
  );

  const rows = useMemo(
    () =>
      (currentData?.events ?? []).map((event) => ({
        date: event.date,
        event: eventLabel(event.type),
        id: event.historyId,
        user: event.editedByName ?? '',
      })),
    [currentData?.events, eventLabel]
  );

  if (!rows.length) {
    return null;
  }

  return (
    <Card flushMobile radius={theme.spacing(1)} style={{ marginTop: theme.spacing(2.5) }} title={strings.HISTORY}>
      <Table
        id='planting-site-history-table'
        columns={columns}
        rows={rows}
        orderBy='date'
        order='desc'
        isPresorted={false}
      />
    </Card>
  );
};

export default PlantingSiteHistoryCard;
