import React, { type JSX, type ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

import EventLog from 'src/components/common/EventLog';
import { useLocalization, useOrganization } from 'src/providers';
import { useListAccessionEventsQuery } from 'src/queries/accessions/events';
import { type EventLogEntryPayload } from 'src/queries/generated/events';
import useSnackbar from 'src/utils/useSnackbar';

import { type ChangedValueColors, renderAccessionEventDescription } from './accessionEventDescription';

const AccessionEventLog = (): JSX.Element => {
  const { accessionId } = useParams<{ accessionId: string }>();
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const snackbar = useSnackbar();

  const organizationId = selectedOrganization?.id;

  const { currentData: events, isError } = useListAccessionEventsQuery(
    { accessionId: Number(accessionId), organizationId: organizationId ?? -1 },
    { skip: !accessionId || organizationId === undefined }
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

  const renderEventDescription = useCallback(
    (event: EventLogEntryPayload): ReactNode => renderAccessionEventDescription(event, strings, colors),
    [colors, strings]
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
      <EventLog
        defaultExpanded
        emptyState={<Typography>{strings.ACCESSION_HISTORY_NO_EVENTS}</Typography>}
        events={events ?? []}
        hideToggle
        renderEventDescription={renderEventDescription}
      />
    </Box>
  );
};

export default AccessionEventLog;
