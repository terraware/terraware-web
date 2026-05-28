import React, { type JSX, useEffect, useMemo } from 'react';

import { Box, Divider, Typography, useTheme } from '@mui/material';
import { Badge, Icon } from '@terraware/web-components';
import { BadgeProps } from '@terraware/web-components/components/Badge';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import { useLocalization } from 'src/providers';
import {
  PlantingSeasonPayload,
  useGetSpeciesTargetsQuery,
  useLazyListPlantingSeasonsQuery,
} from 'src/queries/generated/plantingSeasons';
import { StratumResponsePayload } from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import { getMediumDate } from 'src/utils/dateFormatter';

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

  const [listPlantingSeasons, { data: plantingSeasonsData }] = useLazyListPlantingSeasonsQuery();

  useEffect(() => {
    void listPlantingSeasons(season.plantingSiteId);
  }, [listPlantingSeasons, season.plantingSiteId]);

  const currentSeason = useMemo(
    () => plantingSeasonsData?.seasons.find((s) => s.id === season.id) ?? season,
    [plantingSeasonsData, season]
  );

  const statusBadgeProps = useMemo((): BadgeProps => {
    switch (currentSeason.status) {
      case 'Active':
        return {
          backgroundColor: theme.palette.TwClrBgSuccessTertiary,
          borderColor: theme.palette.TwClrBrdrSuccess,
          labelColor: theme.palette.TwClrTxtSuccess,
          label: strings.ACTIVE,
        };
      case 'Upcoming':
        return {
          backgroundColor: theme.palette.TwClrBgWarningTertiary,
          borderColor: theme.palette.TwClrBrdrWarning,
          labelColor: theme.palette.TwClrTxtWarning,
          label: strings.UPCOMING,
        };
      case 'Past End Date':
        return {
          backgroundColor: theme.palette.TwClrBgDangerTertiary,
          borderColor: theme.palette.TwClrBrdrDanger,
          labelColor: theme.palette.TwClrTxtDanger,
          label: strings.PAST_END_DATE,
        };
      case 'Closed':
        return {
          backgroundColor: theme.palette.TwClrBgInfoTertiary,
          borderColor: theme.palette.TwClrBrdrInfo,
          labelColor: theme.palette.TwClrTxtInfo,
          label: strings.CLOSED,
        };
    }
  }, [currentSeason.status, theme]);

  const plantingGoal = useMemo(() => {
    const targets = speciesTargets?.targets;
    if (!targets || targets.length === 0) {
      return undefined;
    }
    return targets.reduce((sum, t) => sum + t.quantity, 0);
  }, [speciesTargets]);

  const dateRange = `${getMediumDate(currentSeason.startDate, activeLocale)} - ${getMediumDate(currentSeason.endDate, activeLocale)}`;

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
            <Typography fontSize='18px' fontWeight={600}>
              {currentSeason.name}
            </Typography>
            {currentSeason.status && <Badge {...statusBadgeProps} />}
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
