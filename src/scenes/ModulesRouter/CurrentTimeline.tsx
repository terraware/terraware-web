import { Box, Grid, Typography, useTheme } from '@mui/material';

import strings from 'src/strings';

const CurrentTimeline = () => {
  const theme = useTheme();

  // TODO these will probably come from the BE, not sure if they will be attached to the project, or cohort, or some
  // other data model, so for now they are hard coded.
  const currentPhase = 1;
  const phases = [
    {
      phase: 0,
      title: 'Phase 0 - Due Diligence',
      description: 'Review application, final due diligence reviewing documents from shortlisted cohort.',
    },
    {
      phase: 1,
      title: 'Phase 1 - Feasibility',
      description:
        'Attending modules & 1:1s, filling out Feasibility Study sections, completing deliverables. Possible site visit.',
    },
    {
      phase: 2,
      title: 'Phase 2 - PDD Writing & Registration',
      description: 'PDA signed, PDD writing from FS information, PDD registered on Verra (Under Development & Full).',
    },
    {
      phase: 3,
      title: 'Phase 3 - Should not be visible',
      description: 'Mock desription',
    },
    {
      phase: 4,
      title: 'Phase 4 - Should not be visible',
      description: 'Mock desription',
    },
  ];

  const currentPhaseIndex = phases.findIndex((phase) => phase.phase === currentPhase);
  const displayPhases = phases.slice(currentPhaseIndex - 1, 3);

  return (
    <Box borderRadius={theme.spacing(1)} padding={theme.spacing(3)} bgcolor={theme.palette.TwClrBgSecondary}>
      <Grid display={'flex'} flexDirection={'column'}>
        <Grid item marginBottom={theme.spacing(2)}>
          <Typography fontWeight={600}>{strings.CURRENT_TIMELINE}</Typography>
        </Grid>
        <Grid item>
          <Grid display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
            {displayPhases.map((phase, index) => (
              <>
                {index > 0 ? (
                  <Grid item key={index + 0.5}>
                    <Box
                      borderBottom={`1px solid ${theme.palette.TwClrBgTertiary}`}
                      width={'45px'}
                      marginX={theme.spacing(2)}
                      marginTop={theme.spacing(3)}
                    ></Box>
                  </Grid>
                ) : null}
                <Grid
                  item
                  key={index}
                  color={phase.phase === currentPhase ? theme.palette.TwClrBaseBlack : theme.palette.TwClrBgTertiary}
                  alignSelf={'start'}
                >
                  <Box
                    bgcolor={phase.phase === currentPhase ? theme.palette.TwClrBgBrand : ''}
                    width={'100%'}
                    marginBottom={theme.spacing(1)}
                    borderRadius={theme.spacing(0.5)}
                    padding={theme.spacing(0.5)}
                    minHeight={theme.spacing(3)}
                  >
                    {phase.phase === currentPhase ? (
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
                    {phase.title}
                  </Typography>
                  <Typography>{phase.description}</Typography>
                </Grid>
              </>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CurrentTimeline;
