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

  const viabilityTestWithdrawals = useMemo(() => findViabilityTestWithdrawals(events ?? []), [events]);

  const { currentData: nurseryNames } = useListAccessionBatchNurseriesQuery(accessionId);

  // Drop the withdrawal row that points to the viability test event.
  const filterEvent = useCallback(
    (event: EventLogEntryPayload): boolean => !isPairedViabilityTestEvent(event, viabilityTestWithdrawals),
    [viabilityTestWithdrawals]
  );

  const renderEventDescription = useCallback(
    (event: EventLogEntryPayload): ReactNode => {
      const description = renderAccessionEventDescription(
        event,
        strings,
        colors,
        viabilityTestWithdrawals,
        nurseryNames
      );
      const target = accessionEventTarget(event, viabilityTestWithdrawals);

      // A photo whose file is no longer on the accession has nothing to open.
      if (!target || (target.kind === 'photo' && !findTrailingFilename(target.fullText, accession?.photoFilenames))) {
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
    [accession?.photoFilenames, colors, nurseryNames, strings, viabilityTestWithdrawals]
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
