import React, { type JSX, useMemo } from 'react';

import { Box, Divider, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { PlantingSeasonPayload, useGetSpeciesTargetsQuery } from 'src/queries/generated/plantingSeasons';
import { StratumResponsePayload } from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import { getMediumDate } from 'src/utils/dateFormatter';

import PlantingSeasonStatusBadge from './PlantingSeasonStatusBadge';

type PlantingSeasonBoxProps = {
  season: PlantingSeasonPayload;
  plantingSiteName: string;
  strata: StratumResponsePayload[];
  withdrawnForPlanting?: number;
  leftToPlant?: number;
};

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

  const plantingGoal = useMemo(() => {
    const targets = speciesTargets?.targets;
    if (!targets || targets.length === 0) {
      return undefined;
    }
    return targets.reduce((sum, t) => sum + t.quantity, 0);
  }, [speciesTargets]);

  const dateRange = `${getMediumDate(season.startDate, activeLocale)} - ${getMediumDate(season.endDate, activeLocale)}`;

  const strataNames = useMemo(() => strata.map((s) => s.name), [strata]);
  const substrataNames = useMemo(() => strata.flatMap((s) => s.substrata.map((sub) => sub.fullName)), [strata]);

  const numberColumn = (label: string, value: number | undefined) => (
    <Box textAlign='right' minWidth='120px'>
      <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
        {label}
      </Typography>
      <Typography fontSize='24px' fontWeight={600}>
        {value === undefined ? '-' : value.toLocaleString(activeLocale || undefined)}
      </Typography>
    </Box>
  );

  return (
    <Card style={{ width: '100%', marginBottom: theme.spacing(2) }} radius={theme.spacing(1)}>
      <Box display='flex' flexDirection={isMobile ? 'column' : 'row'} gap={theme.spacing(2)}>
        <Box flex={1}>
          <Box display='flex' alignItems='center' gap={theme.spacing(1)}>
            <Icon name='iconCalendar' size='medium' fillColor={theme.palette.TwClrIcnSecondary} />
            <Link
              fontSize='18px'
              fontWeight={600}
              to={APP_PATHS.PLANTING_SEASONS_VIEW.replace(':plantingSeasonId', season.id.toString())}
            >
              {season.name}
            </Link>
            <PlantingSeasonStatusBadge status={season.status} />
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
