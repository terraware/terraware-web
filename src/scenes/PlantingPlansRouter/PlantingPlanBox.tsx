import React, { type JSX, useMemo } from 'react';

import { Box, Divider, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { PlantingSitePayload } from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import PlantingPlanMapThumbnail from './PlantingPlanMapThumbnail';

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

  const strata = useMemo(() => plantingSite.strata ?? [], [plantingSite.strata]);

  const strataNames = useMemo(() => strata.map((stratum) => stratum.name), [strata]);
  const substrataNames = useMemo(
    () => strata.flatMap((stratum) => stratum.substrata.map((substratum) => substratum.name)),
    [strata]
  );

  const siteArea = useMemo(
    () =>
      plantingSite.areaHa === undefined
        ? PLACEHOLDER
        : strings.formatString(strings.X_HA, numberFormatter.format(plantingSite.areaHa, { decimals: 1 })).toString(),
    [numberFormatter, plantingSite.areaHa]
  );

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

  const siteGoal = (
    <Box
      sx={{
        backgroundColor: theme.palette.TwClrBgBrandTertiary,
        borderRadius: theme.spacing(1),
        padding: theme.spacing(1.5, 2),
        minWidth: '160px',
      }}
    >
      <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrBaseBlack} lineHeight='20px'>
        {strings.SITE_GOAL}
      </Typography>
      <Typography fontSize='16px' fontWeight={600} lineHeight='32px' color={theme.palette.TwClrBaseBlack}>
        {PLACEHOLDER}
      </Typography>
      <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary} lineHeight='20px'>
        {strings.BY_TARGET_PLANTING_DENSITY}
      </Typography>
    </Box>
  );

  const metric = (label: string, value: string) => (
    <Box minWidth={isCompact ? 0 : '80px'}>
      <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrBaseBlack} lineHeight='20px'>
        {label}
      </Typography>
      <Typography fontSize='16px' fontWeight={600} lineHeight='32px' color={theme.palette.TwClrBaseBlack}>
        {value}
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
    <Box
      display='flex'
      gap={theme.spacing(3)}
      alignItems='center'
      flexWrap={isCompact ? 'wrap' : 'nowrap'}
      marginTop={isCompact ? theme.spacing(2) : 0}
    >
      {siteGoal}
      {metric(strings.SITE_AREA, siteArea)}
      {metric(strings.SPECIES, PLACEHOLDER)}
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
