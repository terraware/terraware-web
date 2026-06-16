import React, { type JSX, useMemo } from 'react';

import { Box, Divider, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { PlantingSeasonPayload } from 'src/queries/generated/plantingSeasons';
import { StratumResponsePayload } from 'src/queries/generated/plantingSites';
import { useGetPlantingSeasonSpeciesSummaryQuery } from 'src/queries/search/plantingSeasons';
import strings from 'src/strings';
import { getMediumDate } from 'src/utils/dateFormatter';

import PlantingSeasonStatusBadge from './PlantingSeasonStatusBadge';

type PlantingSeasonBoxProps = {
  season: PlantingSeasonPayload;
  plantingSiteName: string;
  strata: StratumResponsePayload[];
};

const PlantingSeasonBox = ({ season, plantingSiteName, strata }: PlantingSeasonBoxProps): JSX.Element => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const navigate = useSyncNavigate();

  const { data: speciesSummary } = useGetPlantingSeasonSpeciesSummaryQuery(season.id);

  const plantingGoal = useMemo(() => {
    if (speciesSummary && speciesSummary.length > 0) {
      return speciesSummary.reduce((sum, target) => sum + target.target, 0);
    }

    const targets = season.speciesTargets ?? [];
    if (targets.length === 0) {
      return undefined;
    }
    return targets.reduce((sum, t) => sum + t.quantity, 0);
  }, [season.speciesTargets, speciesSummary]);

  const withdrawnForPlantingTotal = useMemo(() => {
    if (!speciesSummary || speciesSummary.length === 0) {
      return undefined;
    }
    return speciesSummary.reduce((sum, target) => sum + target.withdrawn, 0);
  }, [speciesSummary]);

  const leftToPlantTotal = useMemo(() => {
    if (!speciesSummary || speciesSummary.length === 0) {
      return undefined;
    }
    return speciesSummary.reduce((sum, target) => sum + target.leftToPlant, 0);
  }, [speciesSummary]);

  const dateRange = `${getMediumDate(season.startDate, activeLocale)} - ${getMediumDate(season.endDate, activeLocale)}`;

  const strataNames = useMemo(() => strata.map((s) => s.name), [strata]);
  const substrataNames = useMemo(() => strata.flatMap((s) => s.substrata.map((sub) => sub.fullName)), [strata]);

  const numberColumn = (
    label: string,
    value: number | undefined,
    align: 'left' | 'center' | 'right' = 'right',
    highlight = false
  ) => {
    const justifyContent = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';

    return (
      <Box
        textAlign={isMobile ? align : 'right'}
        sx={isMobile ? { minWidth: 0 } : { minWidth: '120px' }}
        minWidth={isMobile ? undefined : '120px'}
      >
        <Typography
          fontSize='14px'
          fontWeight={500}
          color={theme.palette.TwClrTxt}
          lineHeight='20px'
          sx={
            isMobile
              ? {
                  alignItems: 'flex-end',
                  display: 'flex',
                  justifyContent,
                  minHeight: '40px',
                }
              : undefined
          }
        >
          {label}
        </Typography>
        <Typography
          fontSize='24px'
          fontWeight={600}
          lineHeight='32px'
          color={highlight && value !== undefined ? theme.palette.TwClrTxtBrand : theme.palette.TwClrTxt}
          sx={highlight && value !== undefined ? { textDecoration: 'underline' } : undefined}
        >
          {value === undefined ? '-' : value.toLocaleString(activeLocale || undefined)}
        </Typography>
      </Box>
    );
  };

  const navigateToDetails = () =>
    navigate(APP_PATHS.PLANTING_SEASONS_VIEW.replace(':plantingSeasonId', season.id.toString()));

  const namesList = (names: string[]) =>
    names.length > 0 ? (
      names.map((name) => (
        <Typography
          key={name}
          fontSize='14px'
          fontWeight={600}
          lineHeight='20px'
          color={theme.palette.TwClrTxtSecondary}
        >
          {name}
        </Typography>
      ))
    ) : (
      <Typography fontSize='14px'>{'-'}</Typography>
    );

  const mobileNamesSection = (label: string, names: string[]) => (
    <Box>
      <Typography
        fontSize='14px'
        fontWeight={400}
        lineHeight='20px'
        color={theme.palette.TwClrTxtSecondary}
        marginBottom={theme.spacing(0.75)}
      >
        {label}
      </Typography>
      <Box>{namesList(names)}</Box>
    </Box>
  );

  const desktopNamesList = (names: string[], twoColumn = false) => {
    if (names.length === 0) {
      return <Typography fontSize='14px'>{'-'}</Typography>;
    }

    if (!twoColumn) {
      return namesList(names);
    }

    return (
      <Box display='flex' flexDirection='column'>
        {Array.from({ length: Math.ceil(names.length / 2) }, (_, i) => {
          const pair = names.slice(i * 2, i * 2 + 2);
          return (
            <Box key={i} display='flex' gap='8px' flexWrap='wrap'>
              {pair.map((name) => (
                <Typography key={name} fontSize='14px' fontWeight={600} color={theme.palette.TwClrTxtSecondary}>
                  {name}
                </Typography>
              ))}
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Box
      onClick={navigateToDetails}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigateToDetails();
        }
      }}
      role='button'
      tabIndex={0}
      sx={{
        borderRadius: theme.spacing(1),
        cursor: 'pointer',
        marginBottom: theme.spacing(2),
        transition: 'box-shadow 0.15s ease',
        '&:hover, &:focus-visible': {
          boxShadow: `0 0 0 1px ${theme.palette.TwClrBrdrBrand}, 2px 2px 4px 0 rgba(0, 0, 0, 0.15)`,
          outline: 'none',
        },
      }}
    >
      <Card style={{ width: '100%' }} radius={theme.spacing(1)}>
        {isMobile ? (
          <Box display='flex' flexDirection='column'>
            <Box display='flex' alignItems='flex-start' gap={theme.spacing(1)}>
              <Icon name='iconCalendar' size='medium' fillColor={theme.palette.TwClrIcnSecondary} />
              <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
                {season.name}
              </Typography>
            </Box>
            <Typography color={theme.palette.TwClrTxtSecondary} marginTop={theme.spacing(1)}>
              {plantingSiteName}
            </Typography>
            <Typography color={theme.palette.TwClrTxt} marginTop={theme.spacing(0.5)}>
              {dateRange}
            </Typography>
            <Box marginTop={theme.spacing(1)}>
              <PlantingSeasonStatusBadge status={season.status} />
            </Box>
            <Divider sx={{ marginY: theme.spacing(2) }} />
            <Box display='flex' flexDirection='column' gap={theme.spacing(2)}>
              {mobileNamesSection(strings.STRATA, strataNames)}
              {mobileNamesSection(strings.SUBSTRATA, substrataNames)}
            </Box>
            <Box
              display='grid'
              gridTemplateColumns='repeat(3, minmax(0, 1fr))'
              gap={theme.spacing(1)}
              marginTop={theme.spacing(3)}
              alignItems='end'
            >
              {numberColumn(strings.TOTAL_GOAL, plantingGoal, 'left')}
              {numberColumn(strings.WITHDRAWN_FOR_PLANTING, withdrawnForPlantingTotal, 'center', true)}
              {numberColumn(strings.LEFT_TO_PLANT, leftToPlantTotal, 'right')}
            </Box>
          </Box>
        ) : (
          <Box display='flex' flexDirection='row' gap={theme.spacing(2)}>
            <Box flex={1}>
              <Box display='flex' alignItems='center' gap={theme.spacing(1)}>
                <Icon name='iconCalendar' size='medium' fillColor={theme.palette.TwClrIcnSecondary} />
                <Typography fontSize='18px' fontWeight={600}>
                  {season.name}
                </Typography>
                <PlantingSeasonStatusBadge status={season.status} />
              </Box>
              <Box display='flex' alignItems='center' gap={theme.spacing(2)} marginTop={theme.spacing(1)}>
                <Typography color={theme.palette.TwClrTxtSecondary}>{plantingSiteName}</Typography>
                <Typography color={theme.palette.TwClrTxt}>{dateRange}</Typography>
              </Box>
              <Divider sx={{ marginY: theme.spacing(2) }} />
              <Box
                display='grid'
                gridTemplateColumns='max-content minmax(160px, 180px) max-content minmax(0, 1fr)'
                columnGap={theme.spacing(2)}
                rowGap={theme.spacing(1)}
                alignItems='start'
              >
                <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary}>
                  {strings.STRATA}
                </Typography>
                <Box minWidth={0}>{desktopNamesList(strataNames)}</Box>
                <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary}>
                  {strings.SUBSTRATA}
                </Typography>
                <Box minWidth={0}>{desktopNamesList(substrataNames, true)}</Box>
              </Box>
            </Box>
            <Box display='flex' gap={theme.spacing(4)} alignItems='flex-start'>
              {numberColumn(strings.PLANTING_GOAL, plantingGoal)}
              {numberColumn(strings.WITHDRAWN_FOR_PLANTING, withdrawnForPlantingTotal)}
              {numberColumn(strings.LEFT_TO_PLANT, leftToPlantTotal)}
            </Box>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default PlantingSeasonBox;
