import React, { Box, Grid, Typography, useTheme } from '@mui/material';

import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import strings from 'src/strings';

const CurrentTimeline = (): JSX.Element => {
  const theme = useTheme();

  const { currentParticipant } = useParticipantData();

  // TODO these will probably come from the BE, not sure if they will be attached to the project, or cohort, or some
  // other data model, so for now they are hard coded.
  const phases = [
    {
      phaseEnum: 'Phase 0 - Due Diligence',
      phase: 'Phase 0 - Due Diligence',
      description: 'Review application, final due diligence reviewing documents from shortlisted cohort.',
    },
    {
      phaseEnum: 'Phase 1 - Feasibility Study',
      phase: 'Phase 1 - Feasibility Study',
      description:
        'Attending modules & 1:1s, filling out Feasibility Study sections, completing deliverables. Possible site visit.',
    },
    {
      phaseEnum: 'Phase 2 - Plan and Scale',
      phase: 'Phase 2 - PDD Writing & Registration',
      description: 'PDA signed, PDD writing from FS information, PDD registered on Verra (Under Development & Full).',
    },
    {
      phaseEnum: 'Phase 3 - Implement and Monitor',
      phase: 'Phase 3 - Mock title',
      description: 'Mock desription',
    },
    {
      phase: 'Phase 4 - Should not be visible',
      description: 'Mock desription',
    },
  ];

  const currentPhaseIndex = phases.findIndex((phase) => phase.phaseEnum === currentParticipant?.cohortPhase);
  const lowIdx = Math.max(currentPhaseIndex - 1, 0);
  const highIdx = Math.min(lowIdx + 3, phases.length);
  const displayPhases = phases.slice(lowIdx, highIdx);

  return (
    <Box borderRadius={theme.spacing(1)} padding={theme.spacing(3)} bgcolor={theme.palette.TwClrBgSecondary}>
      <Grid display={'flex'} flexDirection={'column'}>
        <Grid item marginBottom={theme.spacing(2)}>
          <Typography fontWeight={600}>{strings.CURRENT_TIMELINE}</Typography>
        </Grid>
        <Grid item>
          <Grid display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
            {displayPhases.map((phase, index) => {
              const isActivePhase = phase.phaseEnum === currentParticipant?.cohortPhase;

              return (
                <>
                  {index > 0 ? (
                    <Grid item key={index + 0.5}>
                      <Box
                        borderBottom={`1px solid ${theme.palette.TwClrBgTertiary}`}
                        width={'45px'}
                        marginX={theme.spacing(2)}
                        marginTop={theme.spacing(3)}
                      />
                    </Grid>
                  ) : null}
                  <Grid
                    item
                    key={index}
                    color={isActivePhase ? theme.palette.TwClrBaseBlack : theme.palette.TwClrBgTertiary}
                    alignSelf={'start'}
                  >
                    <Box
                      bgcolor={isActivePhase ? theme.palette.TwClrBgBrand : ''}
                      width={'100%'}
                      marginBottom={theme.spacing(1)}
                      borderRadius={theme.spacing(0.5)}
                      padding={theme.spacing(0.5)}
                      minHeight={theme.spacing(3)}
                    >
                      {isActivePhase ? (
                        <Typography
                          color={theme.palette.TwClrBaseWhite}
                          fontWeight={600}
                          fontSize={'12px'}
                          lineHeight={'16px'}
                          textAlign={'center'}
                        >
                          {strings.YOU_ARE_HERE}
                        </Typography>
                      ) : null}
                    </Box>
                    <Typography fontWeight={600} marginBottom={theme.spacing(1)}>
                      {phase.phase}
                    </Typography>
                    <Typography>{phase.description}</Typography>
                  </Grid>
                </>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CurrentTimeline;
