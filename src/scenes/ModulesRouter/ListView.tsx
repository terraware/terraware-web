import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import strings from 'src/strings';

import CurrentTimeline from './CurrentTimeline';
import ListModulesContent from './ListModulesContent';
import ListViewHeader from './ListViewHeader';

export default function ListView(): JSX.Element {
  const theme = useTheme();

  // TODO - where will this be stored? Is this stored in the back end within another enum table?
  // Should we store it and localize it in the front end? Will it be stored somewhere an admin can edit it?
  // For now, I am hard coding it to get the UI done while we figure out where it belongs.
  const phaseDescription =
    'Phase 1 is divided into a series of modules that provide resources, such as live sessions and workshops, ' +
    'that help you keep your project on track with the program. Each module has a timeframe. Over the course of ' +
    'Phase 1, you will need to review all Phase 1 deliverables. The deliverables that are due or need review are ' +
    'displayed in the To Do list on your Home screen. Please log in to Terraware regularly to check which ' +
    'deliverables are due.';

  return (
    <PageWithModuleTimeline title={strings.ALL_MODULES}>
      <Box sx={{ paddingBottom: 2 }}>
        <ListViewHeader />
      </Box>

      <Card style={{ width: '100%' }}>
        <CurrentTimeline />

        <Box paddingY={theme.spacing(2)} borderBottom={`1px solid ${theme.palette.TwClrBgTertiary}`}>
          <Typography>{phaseDescription}</Typography>
        </Box>

        <ListModulesContent />
      </Card>
    </PageWithModuleTimeline>
  );
}
