import { Box, Grid, Typography, useTheme } from '@mui/material';

import strings from 'src/strings';
import { CohortPhaseType } from 'src/types/Cohort';

interface CurrentTimelineProps {
  cohortPhase?: CohortPhaseType;
}

const CurrentTimeline = ({ cohortPhase }: CurrentTimelineProps) => {
  const theme = useTheme();

  // TODO these will probably come from the BE, not sure if they will be attached to the project, or cohort, or some
  // other data model, so for now they are hard coded.
  const phases = [
    {
      phase: 'Phase 0 - Due Diligence',
      description: 'Review application, final due diligence reviewing documents from shortlisted cohort.',
    },
    {
      phase: 'Phase 1 - Feasibility Study',
      description:
        'Attending modules & 1:1s, filling out Feasibility Study sections, completing deliverables. Possible site visit.',
    },
    {
      phase: 'Phase 2 - PDD Writing & Registration',
      description: 'PDA signed, PDD writing from FS information, PDD registered on Verra (Under Development & Full).',
    },
    {
      phase: 'Phase 3 - Should not be visible',
      description: 'Mock desription',
    },
    {
      phase: 'Phase 4 - Should not be visible',
      description: 'Mock desription',
    },
  ];

  const currentPhaseIndex = phases.findIndex((phase) => phase.phase === cohortPhase);
  const displayPhases = phases.slice(currentPhaseIndex - 1, 3);

  return (
    <Box borderRadius={theme.spacing(1)} padding={theme.spacing(3)} bgcolor={theme.palette.TwClrBgSecondary}>
      <Grid display={'flex'} flexDirection={'column'}>
        <Grid item marginBottom={theme.spacing(2)}>
          <Typography fontWeight={600}>{strings.CURRENT_TIMELINE}</Typography>
        </Grid>
        <Grid item>
          <Grid display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
            {displayPhases.map((phase, index) => {
              const isActivePhase = phase.phase === cohortPhase;

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
