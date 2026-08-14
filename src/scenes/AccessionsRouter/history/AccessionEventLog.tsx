import React, { type JSX, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, CircularProgress, Link, Typography, useTheme } from '@mui/material';
import { ViewPhotosDialog } from '@terraware/web-components';

import EventLog from 'src/components/common/EventLog';
import useAccession from 'src/hooks/useAccession';
import { useLocalization, useOrganization } from 'src/providers';
import { useListAccessionEventsQuery } from 'src/queries/accessions/events';
import { useGetViabilityTestQuery } from 'src/queries/generated/accessionsV2';
import { type EventLogEntryPayload } from 'src/queries/generated/events';
import useSnackbar from 'src/utils/useSnackbar';

import ViewViabilityTestModal from '../viabilityTesting/ViewViabilityTestModal';
import {
  type AccessionEventTarget,
  type ChangedValueColors,
  accessionEventTarget,
  accessionPhotoUrl,
  findPhotoFilename,
  findViabilityTestWithdrawals,
  isPairedViabilityTestEvent,
  renderAccessionEventDescription,
} from './accessionEventDescription';

const AccessionEventLog = (): JSX.Element => {
  const { accessionId: accessionIdParam } = useParams<{ accessionId: string }>();
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const snackbar = useSnackbar();

  const accessionId = Number(accessionIdParam);
  const organizationId = selectedOrganization?.id;

  const [openedTarget, setOpenedTarget] = useState<AccessionEventTarget>();

  const { currentData: events, isError } = useListAccessionEventsQuery(
    { accessionId, organizationId: organizationId ?? -1 },
    { skip: !accessionIdParam || organizationId === undefined }
  );

  // Only needed to turn a photo event into a photo URL; the accession is already cached by the page.
  const { accession } = useAccession(accessionId);

  const openedPhotoFilename =
    openedTarget?.kind === 'photo' ? findPhotoFilename(openedTarget.fullText, accession?.photoFilenames) : undefined;

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

  const viabilityTestWithdrawals = useMemo(() => findViabilityTestWithdrawals(events ?? []), [events]);

  // The withdrawal row already says it was for a viability test, so drop the test's own duplicate row.
  const filterEvent = useCallback(
    (event: EventLogEntryPayload): boolean => !isPairedViabilityTestEvent(event, viabilityTestWithdrawals),
    [viabilityTestWithdrawals]
  );

  const renderEventDescription = useCallback(
    (event: EventLogEntryPayload): ReactNode => {
      const description = renderAccessionEventDescription(event, strings, colors, viabilityTestWithdrawals);
      const target = accessionEventTarget(event, viabilityTestWithdrawals);

      // A photo whose file is no longer on the accession has nothing to open.
      if (!target || (target.kind === 'photo' && !findPhotoFilename(target.fullText, accession?.photoFilenames))) {
        return description;
      }

      return (
        <Link component='button' onClick={() => setOpenedTarget(target)} sx={{ textAlign: 'left' }} underline='hover'>
          {description}
        </Link>
      );
    },
    [accession?.photoFilenames, colors, strings, viabilityTestWithdrawals]
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
