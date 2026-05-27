import React, { type JSX, useMemo } from 'react';

import { Box, Divider, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import { useLocalization } from 'src/providers';
import { useGetSpeciesTargetsQuery } from 'src/queries/generated/plantingSeasons';
import { PlantingSeasonPayload, StratumResponsePayload } from 'src/queries/generated/plantingSites';
import strings from 'src/strings';

type PlantingSeasonBoxProps = {
  season: PlantingSeasonPayload;
  plantingSiteName: string;
  strata: StratumResponsePayload[];
  withdrawnForPlanting?: number;
  leftToPlant?: number;
};

const formatDate = (date: string, locale: string | undefined | null): string =>
  new Intl.DateTimeFormat(locale || 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));

const PlantingSeasonBox = ({
  season,
  plantingSiteName,
  strata,
  withdrawnForPlanting = 0,
  leftToPlant = 0,
}: PlantingSeasonBoxProps): JSX.Element => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();

  const { data: speciesTargets } = useGetSpeciesTargetsQuery(season.id);

  const plantingGoal = useMemo(
    () => (speciesTargets?.targets ?? []).reduce((sum, t) => sum + t.quantity, 0),
    [speciesTargets]
  );

  const dateRange = `${formatDate(season.startDate, activeLocale)} - ${formatDate(season.endDate, activeLocale)}`;

  const strataNames = useMemo(() => strata.map((s) => s.name), [strata]);
  const substrataNames = useMemo(() => strata.flatMap((s) => s.substrata.map((sub) => sub.fullName)), [strata]);

  const numberColumn = (label: string, value: number) => (
    <Box textAlign='right' minWidth='120px'>
      <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
        {label}
      </Typography>
      <Typography fontSize='24px' fontWeight={600}>
        {value.toLocaleString(activeLocale || undefined)}
      </Typography>
    </Box>
  );

  return (
    <Card style={{ width: '100%', marginBottom: theme.spacing(2) }} radius={theme.spacing(1)}>
      <Box display='flex' flexDirection={isMobile ? 'column' : 'row'} gap={theme.spacing(2)}>
        <Box flex={1}>
          <Box display='flex' alignItems='center' gap={theme.spacing(1)}>
            <Icon name='iconCalendar' size='medium' fillColor={theme.palette.TwClrIcnSecondary} />
            <Typography fontSize='18px' fontWeight={600}>
              {dateRange}
            </Typography>
          </Box>
          <Box display='flex' alignItems='center' gap={theme.spacing(2)} marginTop={theme.spacing(1)}>
            <Typography color={theme.palette.TwClrTxtSecondary}>{plantingSiteName}</Typography>
            <Typography color={theme.palette.TwClrTxt}>{dateRange}</Typography>
          </Box>
          <Divider sx={{ marginY: theme.spacing(2) }} />
          <Box display='flex' gap={theme.spacing(6)} flexWrap='wrap'>
            <Box display='flex' gap={theme.spacing(2)}>
              <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary}>
                {strings.STRATA}
              </Typography>
              <Box>
                {strataNames.length > 0 ? (
                  strataNames.map((name) => (
                    <Typography key={name} fontSize='14px' fontWeight={600} color={theme.palette.TwClrTxtSecondary}>
                      {name}
                    </Typography>
                  ))
                ) : (
                  <Typography fontSize='14px'>{'-'}</Typography>
                )}
              </Box>
            </Box>
            <Box display='flex' gap={theme.spacing(2)}>
              <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary}>
                {strings.SUBSTRATA}
              </Typography>
              <Box>
                {substrataNames.length > 0 ? (
                  substrataNames.map((name) => (
                    <Typography key={name} fontSize='14px' fontWeight={600} color={theme.palette.TwClrTxtSecondary}>
                      {name}
                    </Typography>
                  ))
                ) : (
                  <Typography fontSize='14px'>{'-'}</Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
        <Box display='flex' gap={theme.spacing(4)} alignItems='flex-start'>
          {numberColumn(strings.PLANTING_GOAL, plantingGoal)}
          {numberColumn(strings.WITHDRAWN_FOR_PLANTING, withdrawnForPlanting)}
          {numberColumn(strings.LEFT_TO_PLANT, leftToPlant)}
        </Box>
      </Box>
    </Card>
  );
};

export default PlantingSeasonBox;
