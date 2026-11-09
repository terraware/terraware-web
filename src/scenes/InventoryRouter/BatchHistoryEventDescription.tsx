import React, { type JSX, useState } from 'react';

import { Typography } from '@mui/material';
import { ViewPhotosDialog } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import Link from 'src/components/common/Link';
import { API_PATHS, APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { batchHistoryEventEnumToLocalized, purposeLabel } from 'src/types/Batch';

import { BatchHistoryEvent } from './BatchHistory';
import EventDetailsModal from './EventDetailsModal';

const accessionAttributionOf = (event: BatchHistoryEvent): { id: number; accessionNumber: string } | undefined => {
  if (event.type === 'AddedFromAccession') {
    return { id: event.accessionId, accessionNumber: event.accessionNumber };
  }
  if (event.fromAccessionId !== undefined) {
    return { id: event.fromAccessionId, accessionNumber: event.fromAccessionNumber ?? '' };
  }
  return undefined;
};

export const getEventType = (event: BatchHistoryEvent): string => {
  const accession = accessionAttributionOf(event);
  if (accession) {
    return strings.formatString(strings.BATCH_QUANTITY_UPDATED_FROM_ACCESSION, accession.accessionNumber).toString();
  }
  if (event.type === 'DetailsEdited' || event.type === 'QuantityEdited' || event.type === 'StatusChanged') {
    return `${event.modifiedFields.join(', ')} ${strings.CHANGE}`;
  }
  if (event.type === 'IncomingWithdrawal') {
    return strings.NURSERY_TRANSFER;
  }
  if (event.type === 'OutgoingWithdrawal') {
    return strings
      .formatString(
        strings.BATCH_HISTORY_WITHDRAWAL_ON_DATE,
        getDateDisplayValue(event.withdrawnDate),
        purposeLabel(event.purpose)
      )
      .toString();
  }
  if (event.type === 'PhotoCreated' || event.type === 'PhotoDeleted') {
    return batchHistoryEventEnumToLocalized(event.type) ?? event.type;
  }
  return event.type;
};

export const getEventSearchText = (event: BatchHistoryEvent): string =>
  [
    getEventType(event),
    event.type === 'OutgoingWithdrawal' && event.version === undefined
      ? strings.BATCH_QUANTITY_NOT_UPDATED_EXPLANATION
      : undefined,
    event.type === 'QuantityEdited' ? event.notes : undefined,
  ]
    .filter(Boolean)
    .join(' ');

export type BatchHistoryEventDescriptionProps = {
  batchId: number;
  event: BatchHistoryEvent;
};

const hasEventDetails = (event: BatchHistoryEvent): boolean =>
  event.type === 'DetailsEdited' ||
  event.type === 'QuantityEdited' ||
  event.type === 'StatusChanged' ||
  event.type === 'IncomingWithdrawal';

const EventDetailsDescription = ({ batchId, event }: BatchHistoryEventDescriptionProps): JSX.Element => {
  const [viewingDetails, setViewingDetails] = useState(false);

  return (
    <>
      <Link fontSize='16px' fontWeight={400} lineHeight='24px' onClick={() => setViewingDetails(true)}>
        {getEventType(event)}
      </Link>
      {event.type === 'QuantityEdited' && event.notes && (
        <Typography fontSize='14px' fontWeight={300}>
          {event.notes}
        </Typography>
      )}
      {viewingDetails && (
        <EventDetailsModal batchId={batchId} onClose={() => setViewingDetails(false)} selectedEvent={event} />
      )}
    </>
  );
};

const PhotoCreatedDescription = ({ batchId, event }: BatchHistoryEventDescriptionProps): JSX.Element => {
  const [viewingPhoto, setViewingPhoto] = useState(false);

  const photoUrl =
    event.type === 'PhotoCreated' && typeof event.fileId === 'number'
      ? API_PATHS.NURSERY_BATCH_PHOTO.replace('{batchId}', batchId.toString()).replace(
          '{photoId}',
          event.fileId.toString()
        )
      : undefined;

  if (!photoUrl) {
    return <>{getEventType(event)}</>;
  }

  return (
    <>
      <Link fontSize='16px' fontWeight={400} lineHeight='24px' onClick={() => setViewingPhoto(true)}>
        {getEventType(event)}
      </Link>
      {viewingPhoto && (
        <ViewPhotosDialog
          initialSelectedSlide={0}
          onClose={() => setViewingPhoto(false)}
          open
          photos={[{ url: photoUrl }]}
          title={strings.PHOTOS}
        />
      )}
    </>
  );
};

const BatchHistoryEventDescription = ({ batchId, event }: BatchHistoryEventDescriptionProps): JSX.Element => {
  const accession = accessionAttributionOf(event);

  if (accession) {
    return (
      <>
        {strings.formatString(
          strings.BATCH_QUANTITY_UPDATED_FROM_ACCESSION,
          <Link
            fontSize='16px'
            fontWeight={400}
            lineHeight='24px'
            to={APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', `${accession.id}`)}
          >
            {accession.accessionNumber}
          </Link>
        )}
      </>
    );
  }

  if (event.type === 'OutgoingWithdrawal') {
    return (
      <Link
        fontSize='16px'
        fontWeight={400}
        lineHeight='24px'
        to={APP_PATHS.NURSERY_WITHDRAWALS_DETAILS.replace(':withdrawalId', `${event.withdrawalId}`)}
      >
        {getEventType(event)}
        {event.version === undefined && (
          <Typography fontSize='14px' fontWeight={300}>
            {strings.BATCH_QUANTITY_NOT_UPDATED_EXPLANATION}
          </Typography>
        )}
      </Link>
    );
  }

  if (event.type === 'PhotoCreated') {
    return <PhotoCreatedDescription batchId={batchId} event={event} />;
  }

  if (hasEventDetails(event)) {
    return <EventDetailsDescription batchId={batchId} event={event} />;
  }

  return <>{getEventType(event)}</>;
};

export default BatchHistoryEventDescription;
