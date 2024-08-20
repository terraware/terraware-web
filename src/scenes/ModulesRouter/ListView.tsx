import React, { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import strings from 'src/strings';

import CurrentTimeline from './CurrentTimeline';
import ListModulesContent from './ListModulesContent';
import ListViewHeader from './ListViewHeader';

export default function ListView(): JSX.Element {
  const theme = useTheme();

  const { currentParticipant } = useParticipantData();

  // TODO - where will this be stored? Is this stored in the back end within another enum table?
  // Should we store it and localize it in the front end? Will it be stored somewhere an admin can edit it?
  // For now, I am hard coding it to get the UI done while we figure out where it belongs.
  const phaseDescription =
    'Phase 1 is divided into a series of modules that provide resources, such as live sessions and workshops, ' +
    'that help you keep your project on track with the program. Each module has a timeframe. Over the course of ' +
    'Phase 1, you will need to review all Phase 1 deliverables. The deliverables that are due or need review are ' +
    'displayed in the To Do list on your Home screen. Please log in to Terraware regularly to check which ' +
    'deliverables are due.';

  const phases = [
    {
      name: 'Phase 0 - Due Diligence',
      description:
        'Submit project-relevant documentation that prove that the statements provided in the ' +
        'application are truthful and accurate.',
    },
    {
      name: 'Phase 1 - Feasibility Study',
      description:
        'Attend 10 weeks of training, and evaluate the strengths and risks of your proposed carbon project ' +
        'by submitting key information that will also be used to create a Feasibility Study document.',
    },
    {
      name: 'Phase 2 - PDD Writing & Registration',
      description:
        'Work toward having a PDA signed, a PDD written, and the PDD registered on Verra (Under Development & Full).',
    },
    {
      name: 'Phase 3 - Implement and Monitor',
      description: 'Mock desription',
    },
    {
      name: 'Phase 4 - Should not be visible',
      description: 'Mock desription',
    },
  ];

  const currentPhaseIndex = useMemo(
    () => phases.findIndex((phase) => phase.name === currentParticipant?.cohortPhase),
    [currentParticipant]
  );

  return (
    <PageWithModuleTimeline
      title={strings.ALL_MODULES}
      isLoading={!currentParticipant}
      contentStyle={{ paddingLeft: '24px' }}
      titleStyle={{ marginBottom: 2 }}
    >
      <Box sx={{ paddingBottom: 2 }}>
        <ListViewHeader />
      </Box>

      <Card style={{ width: '100%' }}>
        <CurrentTimeline steps={phases} currentIndex={currentPhaseIndex} />

        <Box paddingY={theme.spacing(3)} borderBottom={`1px solid ${theme.palette.TwClrBgTertiary}`}>
          <Typography>{phaseDescription}</Typography>
        </Box>

        <ListModulesContent />
      </Card>
    </PageWithModuleTimeline>
  );
}
