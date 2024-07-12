import React, { Box, Grid, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import strings from 'src/strings';

export type TimelineStep = {
  name: string;
  description: string;
};

type CurrentTimelineProps = {
  steps: TimelineStep[];
  currentIndex: number;
};

const CurrentTimeline = ({ steps, currentIndex }: CurrentTimelineProps): JSX.Element => {
  const theme = useTheme();

  const { isDesktop } = useDeviceInfo();

  // TODO these will probably come from the BE, not sure if they will be attached to the project, or cohort, or some
  // other data model, so for now they are hard coded.

  const lowIdx = Math.max(currentIndex - 1, 0);
  const highIdx = Math.min(lowIdx + 3, steps.length);
  const displayPhases = steps.slice(lowIdx, highIdx);

  return (
    <Box borderRadius={theme.spacing(1)} padding={theme.spacing(3)} bgcolor={theme.palette.TwClrBgSecondary}>
      <Grid display={'flex'} flexDirection={'column'}>
        <Grid item marginBottom={theme.spacing(2)}>
          <Typography fontWeight={600}>{strings.CURRENT_TIMELINE}</Typography>
        </Grid>
        <Grid item>
          <Grid
            display={'flex'}
            flexDirection={isDesktop ? 'row' : 'column'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            {displayPhases.map((step, index) => {
              const isActivePhase = index === currentIndex;

              return (
                <>
                  {index > 0 ? (
                    <Grid item key={index + 0.5}>
                      <Box
                        borderBottom={`1px solid ${theme.palette.TwClrBgTertiary}`}
                        borderLeft={`1px solid ${theme.palette.TwClrBgTertiary}`}
                        height={isDesktop ? undefined : '40px'}
                        width={isDesktop ? '40px' : undefined}
                        marginX={theme.spacing(2)}
                        marginY={isDesktop ? undefined : theme.spacing(3)}
                      />
                    </Grid>
                  ) : null}
                  <Grid
                    item
                    key={index}
                    color={theme.palette.TwClrBaseBlack}
                    alignSelf={'start'}
                    xs={isDesktop ? undefined : 12}
                  >
                    {(isDesktop || isActivePhase) && (
                      <Box
                        bgcolor={isActivePhase ? theme.palette.TwClrBgBrand : ''}
                        width={'100%'}
                        marginBottom={theme.spacing(1)}
                        borderRadius={theme.spacing(0.5)}
                        padding={theme.spacing(0.5)}
                        minHeight={theme.spacing(3)}
                      >
                        {isActivePhase && (
                          <Typography
                            color={theme.palette.TwClrBaseWhite}
                            fontWeight={600}
                            fontSize={'12px'}
                            lineHeight={'16px'}
                            textAlign={'center'}
                          >
                            {strings.YOU_ARE_HERE}
                          </Typography>
                        )}
                      </Box>
                    )}

                    <Typography fontWeight={600} marginBottom={theme.spacing(1)}>
                      {step.name}
                    </Typography>
                    <Typography>{step.description}</Typography>
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
