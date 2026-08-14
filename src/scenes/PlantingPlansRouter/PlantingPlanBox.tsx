import React, { type JSX, useMemo } from 'react';

import { Box, Divider, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { PlantingSitePayload, useListPlantingSiteSpeciesTargetsQuery } from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import PlantingPlanMapThumbnail from './PlantingPlanMapThumbnail';
import { siteGoalPlants } from './plantingPlanGoals';

const PLACEHOLDER = '-';

type PlantingPlanBoxProps = {
  plantingSite: PlantingSitePayload;
};

const PlantingPlanBox = ({ plantingSite }: PlantingPlanBoxProps): JSX.Element => {
  const theme = useTheme();
  const { isMobile, isTablet } = useDeviceInfo();
  const isCompact = isMobile || isTablet;
  const navigate = useSyncNavigate();
  const numberFormatter = useNumberFormatter();

  const { data: speciesTargetsData } = useListPlantingSiteSpeciesTargetsQuery(plantingSite.id);

  const strata = useMemo(() => plantingSite.strata ?? [], [plantingSite.strata]);

  const strataNames = useMemo(() => strata.map((stratum) => stratum.name), [strata]);
  const substrataNames = useMemo(
    () => strata.flatMap((stratum) => stratum.substrata.map((substratum) => substratum.name)),
    [strata]
  );

  const plantingGoalLabel = useMemo(() => {
    const plants = siteGoalPlants(plantingSite, 'initial');
    return strings
      .formatString(strings.X_PLANTS, plants === undefined ? PLACEHOLDER : numberFormatter.format(plants))
      .toString();
  }, [numberFormatter, plantingSite]);

  const speciesLabel = useMemo(() => {
    const count = speciesTargetsData?.targets.length ?? 0;
    return strings
      .formatString(strings.X_SPECIES, count === 0 ? PLACEHOLDER : numberFormatter.format(count))
      .toString();
  }, [numberFormatter, speciesTargetsData]);

  const navigateToDetails = () =>
    navigate(APP_PATHS.PLANTING_PLANS_VIEW.replace(':plantingSiteId', plantingSite.id.toString()));

  const namesList = (names: string[], twoColumn: boolean) => {
    if (names.length === 0) {
      return <Typography fontSize='14px'>{PLACEHOLDER}</Typography>;
    }

    return (
      <Box
        display={twoColumn ? 'grid' : 'flex'}
        flexDirection={twoColumn ? undefined : 'column'}
        gridTemplateColumns={twoColumn ? 'repeat(2, max-content)' : undefined}
        gap='4px 16px'
      >
        {names.map((name, index) => (
          <Typography
            key={`${name}-${index}`}
            fontSize='14px'
            fontWeight={600}
            lineHeight='20px'
            color={theme.palette.TwClrTxtSecondary}
          >
            {name}
          </Typography>
        ))}
      </Box>
    );
  };

  const namesColumn = (label: string, names: string[], twoColumn = false) => (
    <Box display='flex' gap={theme.spacing(2)} minWidth={0}>
      <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary} whiteSpace='nowrap'>
        {label}
      </Typography>
      <Box minWidth={0}>{namesList(names, twoColumn)}</Box>
    </Box>
  );

  const plantingGoal = (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: theme.palette.TwClrBgSecondary,
        borderRadius: theme.spacing(1),
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing(2),
        minWidth: '220px',
        padding: theme.spacing(3),
        width: '400px',
        justifyContent: 'center',
      }}
    >
      <Typography fontSize='16px' fontWeight={400} color={theme.palette.TwClrBaseBlack}>
        {`${strings.PLANTING_GOAL}:`}
      </Typography>
      <Typography fontSize='16px' fontWeight={600} color={theme.palette.TwClrBaseBlack}>
        {plantingGoalLabel}
      </Typography>
      <Typography fontSize='16px' fontWeight={600} color={theme.palette.TwClrBaseBlack}>
        {speciesLabel}
      </Typography>
    </Box>
  );

  const titleAndStrata = (
    <Box flex={1} minWidth={0}>
      <Typography fontSize={isCompact ? '20px' : '28px'} fontWeight={600} color={theme.palette.TwClrTxt}>
        {plantingSite.name}
      </Typography>
      <Divider sx={{ marginY: theme.spacing(1.5), borderColor: theme.palette.TwClrBrdrTertiary }} />
      <Box display='flex' flexDirection='row' flexWrap='wrap' gap={theme.spacing(4)}>
        {namesColumn(strings.STRATA, strataNames)}
        {namesColumn(strings.SUBSTRATA, substrataNames, true)}
      </Box>
    </Box>
  );

  const metrics = (
    <Box display='flex' alignItems='center' marginTop={isCompact ? theme.spacing(2) : 0}>
      {plantingGoal}
    </Box>
  );

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
        border: '1px solid transparent',
        borderRadius: theme.spacing(1),
        cursor: 'pointer',
        marginBottom: theme.spacing(2),
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        '&:hover, &:focus-visible': {
          border: `1px solid ${theme.palette.TwClrBrdrBrand}`,
          boxShadow: '2px 2px 4px 0 rgba(0, 0, 0, 0.15)',
          outline: 'none',
        },
      }}
    >
      <Card style={{ width: '100%', padding: theme.spacing(2) }} radius={theme.spacing(1)}>
        <Box
          display='flex'
          flexDirection={isCompact ? 'column' : 'row'}
          gap={theme.spacing(3)}
          alignItems={isCompact ? 'stretch' : 'center'}
        >
          <Box display='flex' alignItems='center' gap={theme.spacing(3)} flex={1} minWidth={0}>
            <PlantingPlanMapThumbnail plantingSiteId={plantingSite.id} />
            {titleAndStrata}
          </Box>
          {metrics}
        </Box>
      </Card>
    </Box>
  );
};

export default PlantingPlanBox;
