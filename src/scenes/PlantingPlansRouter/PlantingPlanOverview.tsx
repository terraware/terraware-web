import React, { type JSX, useMemo } from 'react';

import { Box, Divider, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import { PlantingSitePayload } from 'src/queries/generated/plantingSites';
import PlantingSiteMapV2 from 'src/scenes/PlantingSitesRouter/view/PlantingSiteMapV2';
import strings from 'src/strings';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

const PLACEHOLDER = '-';

export type PlantingPlanOverviewProps = {
  plantingSite: PlantingSitePayload;
};

const PlantingPlanOverview = ({ plantingSite }: PlantingPlanOverviewProps): JSX.Element => {
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();

  const area = useMemo(
    () =>
      plantingSite.areaHa === undefined
        ? PLACEHOLDER
        : strings.formatString(strings.X_HA, numberFormatter.format(plantingSite.areaHa, { decimals: 1 })).toString(),
    [numberFormatter, plantingSite.areaHa]
  );

  const strataCount = useMemo(
    () => numberFormatter.format(plantingSite.strata?.length ?? 0),
    [numberFormatter, plantingSite.strata]
  );

  const tile = (label: string, value: string) => (
    <Box flex={1} minWidth={0}>
      <Typography fontSize='14px' fontWeight={500} color={theme.palette.TwClrBaseBlack} lineHeight='20px'>
        {label}
      </Typography>
      <Typography fontSize='24px' fontWeight={600} lineHeight='32px' color={theme.palette.TwClrBaseBlack}>
        {value}
      </Typography>
    </Box>
  );

  const verticalDivider = (
    <Divider orientation='vertical' flexItem sx={{ borderColor: theme.palette.TwClrBrdrTertiary }} />
  );

  return (
    <Card
      style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: theme.spacing(3), width: '100%' }}
      radius={theme.spacing(1)}
    >
      <Box display='flex' alignItems='center' gap={theme.spacing(3)} flexWrap='wrap' width='100%'>
        <Box
          sx={{
            backgroundColor: theme.palette.TwClrBgBrandTertiary,
            borderRadius: theme.spacing(1),
            flex: 1,
            minWidth: '160px',
            padding: theme.spacing(1.5, 2),
          }}
        >
          <Typography fontSize='14px' fontWeight={500} color={theme.palette.TwClrBaseBlack} lineHeight='20px'>
            {strings.TARGET_PLANTS_TITLE}
          </Typography>
          <Typography fontSize='24px' fontWeight={600} lineHeight='32px' color={theme.palette.TwClrBaseBlack}>
            {PLACEHOLDER}
          </Typography>
          <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary} lineHeight='20px'>
            {strings.BY_TARGET_PLANTING_DENSITY}
          </Typography>
        </Box>
        {tile(strings.AREA, area)}
        {verticalDivider}
        {tile(strings.TARGET_PLANTING_DENSITY, PLACEHOLDER)}
        {verticalDivider}
        {tile(strings.TARGET_SPECIES, PLACEHOLDER)}
        {verticalDivider}
        {tile(strings.STRATA, strataCount)}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: theme.spacing(3) }}>
        {plantingSite.boundary && plantingSite.strata && <PlantingSiteMapV2 plantingSiteId={plantingSite.id} />}
      </Box>
    </Card>
  );
};

export default PlantingPlanOverview;
