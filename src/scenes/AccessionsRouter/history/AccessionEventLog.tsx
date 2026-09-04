import React, { type JSX, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Link, Typography, useTheme } from '@mui/material';
import { ViewPhotosDialog } from '@terraware/web-components';

import EventLog from 'src/components/common/EventLog';
import RouterLink from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import useAccession from 'src/hooks/useAccession';
import { useLocalization, useOrganization } from 'src/providers';
import { useListAccessionEventsQuery } from 'src/queries/accessions/events';
import { useGetViabilityTestQuery } from 'src/queries/generated/accessionsV2';
import { type EventLogEntryPayload } from 'src/queries/generated/events';
import { useListAccessionBatchNurseriesQuery } from 'src/queries/search/batches';
import { findTrailingFilename } from 'src/utils/text';
import useSnackbar from 'src/utils/useSnackbar';

import ViewViabilityTestModal from '../viabilityTesting/ViewViabilityTestModal';
import {
  type AccessionEventTarget,
  type ChangedValueColors,
  accessionEventTarget,
  accessionPhotoUrl,
  findViabilityTestWithdrawals,
  isPairedViabilityTestEvent,
  renderAccessionEventDescription,
} from './accessionEventDescription';

type AccessionEventLogProps = {
  accessionId: number;
};

const AccessionEventLog = ({ accessionId }: AccessionEventLogProps): JSX.Element => {
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const snackbar = useSnackbar();

  const organizationId = selectedOrganization?.id;

  const [openedTarget, setOpenedTarget] = useState<AccessionEventTarget>();

  const { currentData: events, isError } = useListAccessionEventsQuery(
    { accessionId, organizationId: organizationId ?? -1 },
    { skip: organizationId === undefined }
  );

  const { accession } = useAccession(accessionId);

  const openedPhotoFilename =
    openedTarget?.kind === 'photo' ? findTrailingFilename(openedTarget.fullText, accession?.photoFilenames) : undefined;

  const { currentData: viabilityTestData } = useGetViabilityTestQuery(
    {
      accessionId,
      viabilityTestId: openedTarget?.kind === 'viabilityTest' ? openedTarget.viabilityTestId : -1,
    },
    { skip: openedTarget?.kind !== 'viabilityTest' }
  );

  useEffect(() => {
    if (isError) {
      snackbar.toastError();
    }
  }, [isError, snackbar]);

  const colors: ChangedValueColors = useMemo(
    () => ({
      changedFrom: theme.palette.TwClrTxtWarning as string,
      changedTo: theme.palette.TwClrTxtSuccess as string,
    }),
    [theme.palette.TwClrTxtSuccess, theme.palette.TwClrTxtWarning]
  );

  const closeModal = useCallback(() => setOpenedTarget(undefined), []);

  // Only the filename opens the photo; the surrounding label and action read as plain text.
  const renderPhotoSubject = useCallback(
    (fullText: string): JSX.Element | string => {
      const filename = findTrailingFilename(fullText, accession?.photoFilenames);

      if (filename === undefined) {
        return fullText;
      }

      return (
        <>
          {fullText.slice(0, fullText.length - filename.length)}
          <Link
            component='button'
            onClick={() => setOpenedTarget({ kind: 'photo', accessionId, fullText })}
            sx={{ verticalAlign: 'baseline' }}
            underline='hover'
          >
            {filename}
          </Link>
        </>
      );
    },
    [accession?.photoFilenames, accessionId]
  );

  const viabilityTestWithdrawals = useMemo(() => findViabilityTestWithdrawals(events ?? []), [events]);

  const { currentData: nurseryNames } = useListAccessionBatchNurseriesQuery(accessionId);

  // Drop the withdrawal row that points to the viability test event.
  const filterEvent = useCallback(
    (event: EventLogEntryPayload): boolean => !isPairedViabilityTestEvent(event, viabilityTestWithdrawals),
    [viabilityTestWithdrawals]
  );

  const renderEventDescription = useCallback(
    (event: EventLogEntryPayload): ReactNode => {
      const description = renderAccessionEventDescription(event, {
        colors,
        nurseryNames,
        renderPhotoSubject,
        strings,
        viabilityTestWithdrawals,
      });
      const target = accessionEventTarget(event, viabilityTestWithdrawals);

      // Photo rows carry their own link around the filename, so the whole row is never wrapped.
      if (!target || target.kind === 'photo') {
        return description;
      }

      if (target.kind === 'batch') {
        return (
          <RouterLink to={APP_PATHS.INVENTORY_BATCH.replace(':batchId', String(target.batchId))}>
            {description}
          </RouterLink>
        );
      }

      return (
        <Link component='button' onClick={() => setOpenedTarget(target)} sx={{ textAlign: 'left' }} underline='hover'>
          {description}
        </Link>
      );
    },
    [colors, nurseryNames, renderPhotoSubject, strings, viabilityTestWithdrawals]
  );

  if (!events && !isError) {
    return (
      <Box display='flex' justifyContent='center' padding={theme.spacing(5)}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display='flex' flexDirection='column'>
      <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(3.5)}>
        {strings.HISTORY}
      </Typography>

      {openedPhotoFilename && (
        <ViewPhotosDialog
          initialSelectedSlide={0}
          nextButtonLabel={strings.NEXT}
          onClose={closeModal}
          open
          photos={[{ url: accessionPhotoUrl(accessionId, openedPhotoFilename) }]}
          prevButtonLabel={strings.PREVIOUS}
          title={strings.PHOTOS}
        />
      )}

      {viabilityTestData?.viabilityTest && (
        <ViewViabilityTestModal
          isEditable={false}
          onClose={closeModal}
          onEdit={closeModal}
          open
          viabilityTest={viabilityTestData.viabilityTest}
        />
      )}

      <EventLog
        defaultExpanded
        emptyState={<Typography>{strings.ACCESSION_HISTORY_NO_EVENTS}</Typography>}
        events={events ?? []}
        filterEvent={filterEvent}
        hideToggle
        renderEventDescription={renderEventDescription}
      />
    </Box>
  );
};

export default AccessionEventLog;
