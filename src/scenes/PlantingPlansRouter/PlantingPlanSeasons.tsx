import React, { type JSX, useEffect, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import { useLocalization, useOrganization } from 'src/providers';
import { useLazyListPlantingSeasonsQuery } from 'src/queries/generated/plantingSeasons';
import { PlantingSitePayload } from 'src/queries/generated/plantingSites';
import PlantingSeasonBox from 'src/scenes/NurseryRouter/PlantingSeasons/PlantingSeasonBox';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

const PLACEHOLDER = '-';

export type PlantingPlanSeasonsProps = {
  plantingSite: PlantingSitePayload;
};

const PlantingPlanSeasons = ({ plantingSite }: PlantingPlanSeasonsProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const numberFormatter = useNumberFormatter();
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;

  const [listPlantingSeasons, plantingSeasonsResult] = useLazyListPlantingSeasonsQuery();
  const { data: plantingSeasonsData } = plantingSeasonsResult;

  useEffect(() => {
    if (organizationId) {
      void listPlantingSeasons({ organizationId });
    }
  }, [listPlantingSeasons, organizationId]);

  const seasons = useMemo(
    () =>
      (plantingSeasonsData?.seasons ?? [])
        .filter((season) => season.plantingSiteId === plantingSite.id)
        .sort((a, b) => {
          const startCmp = b.startDate.localeCompare(a.startDate);
          return startCmp !== 0 ? startCmp : b.endDate.localeCompare(a.endDate);
        }),
    [plantingSeasonsData, plantingSite.id]
  );

  // Sum of every season's Planting Target (all non-deleted seasons, regardless of what has been withdrawn).
  const totalPlantingTarget = useMemo(
    () =>
      seasons.reduce(
        (sum, season) =>
          sum + (season.speciesTargets ?? []).reduce((targetSum, target) => targetSum + target.quantity, 0),
        0
      ),
    [seasons]
  );

  const isLoading = !organizationId || plantingSeasonsResult.isFetching || plantingSeasonsData === undefined;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Card style={{ width: '100%', padding: theme.spacing(3) }} radius={theme.spacing(1)}>
        <Box display='flex' alignItems='center' gap={theme.spacing(3)} flexWrap='wrap' width='100%'>
          <Box
            sx={{
              backgroundColor: theme.palette.TwClrBgBrandTertiary,
              borderRadius: theme.spacing(1),
              flex: 1,
              minWidth: '200px',
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
          <Box flex={1} minWidth='200px'>
            <Typography fontSize='14px' fontWeight={500} color={theme.palette.TwClrBaseBlack} lineHeight='20px'>
              {strings.TOTAL_PLANTING_TARGET_IN_SEASONS}
            </Typography>
            <Typography fontSize='24px' fontWeight={600} lineHeight='32px' color={theme.palette.TwClrBaseBlack}>
              {strings.formatString(strings.X_PLANTS, numberFormatter.format(totalPlantingTarget)).toString()}
            </Typography>
          </Box>
        </Box>
      </Card>

      <Box marginTop={theme.spacing(2)}>
        {isLoading ? (
          <BusySpinner withSkrim={true} />
        ) : seasons.length === 0 ? (
          <Card style={{ width: '100%' }} radius={theme.spacing(1)}>
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing(2),
                justifyContent: 'center',
                padding: theme.spacing(6),
              }}
            >
              <Box component='img' src='/assets/calendar.svg' alt='' sx={{ height: 64, width: 64 }} />
              <Typography fontSize='16px' color={theme.palette.TwClrTxtSecondary}>
                {strings.THERE_ARE_NO_PLANTING_SEASONS}
              </Typography>
            </Box>
          </Card>
        ) : (
          seasons.map((season) => (
            <PlantingSeasonBox
              key={season.id}
              season={season}
              plantingSiteName={plantingSite.name}
              strata={plantingSite.strata ?? []}
              showPlantingSiteName={false}
            />
          ))
        )}
      </Box>
    </Box>
  );
};

export default PlantingPlanSeasons;
