import React, { useMemo } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';

import AddLink from 'src/components/common/AddLink';
import Link from 'src/components/common/Link';
import PlantingSiteSelector from 'src/components/common/PlantingSiteSelector';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import SimplePlantingSiteMap from 'src/scenes/PlantsDashboardRouter/components/SimplePlantingSiteMap';
import strings from 'src/strings';
import { isAdmin } from 'src/utils/organization';
import useMapboxToken from 'src/utils/useMapboxToken';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import StatsCardItem from './StatsCardItem';

export const PlantingSiteStats = () => {
  const { activeLocale } = useLocalization();
  const numberFormatter = useNumberFormatter(activeLocale);
  const { isDesktop } = useDeviceInfo();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const { selectedOrganization } = useOrganization();
  const { token } = useMapboxToken();

  const { allPlantingSites, plantingSite, setSelectedPlantingSite, latestResult, plantingSiteReportedPlants } =
    usePlantingSiteData();
  const { countries } = useLocalization();

  const primaryGridSize = useMemo(() => (isDesktop ? 6 : 12), [isDesktop]);

  const plantingCompleteArea = useMemo(() => {
    let total = 0;
    if (plantingSite?.strata) {
      plantingSite.strata.forEach((stratum) => {
        stratum.substrata.forEach((substratum) => {
          if (substratum.plantingCompleted) {
            total += substratum.areaHa;
          }
        });
      });
    }
    return total;
  }, [plantingSite]);

  const latestObservationCompletedTime = useMemo(() => {
    if (latestResult?.completedTime && plantingSite) {
      return getDateDisplayValue(latestResult.completedTime, plantingSite.timeZone);
    } else {
      return '';
    }
  }, [latestResult, plantingSite]);

  const totalPlants = useMemo(() => plantingSiteReportedPlants?.totalPlants ?? 0, [plantingSiteReportedPlants]);
  const totalSpecies = useMemo(() => plantingSiteReportedPlants?.species?.length ?? 0, [plantingSiteReportedPlants]);

  if (!allPlantingSites?.length) {
    return <></>;
  }

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
        borderRadius: '9px',
        boxShadow: isDesktop ? 'rgba(58, 68, 69, 0.2) 0px 4px 8px' : 'none',
        display: 'flex',
        flexDirection: isDesktop ? 'row' : 'column',
        justifyContent: 'space-evenly',
        marginBottom: '24px',
        width: '100%',
      }}
    >
      <Box sx={{ padding: '16px', width: isDesktop ? '50%' : '100%' }}>
        <Grid container spacing={3} sx={{ padding: 0 }}>
          <Grid item xs={primaryGridSize}>
            <Box
              sx={{
                alignItems: 'center',
                background: theme.palette.TwClrBgSecondary,
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'row',
                height: '100%',
                justifyContent: 'center',
                padding: '18px',
              }}
            >
              <Icon name='iconRestorationSite' size='medium' style={{ fill: theme.palette.TwClrIcnSecondary }} />
              <Typography
                sx={{
                  color: theme.palette.TwClrTxt,
                  fontSize: '16px',
                  fontWeight: 600,
                  lineHeight: '24px',
                  marginLeft: '8px',
                }}
              >
                {strings.PLANTS}
              </Typography>
            </Box>
          </Grid>

          <Grid
            item
            xs={primaryGridSize}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isDesktop ? 'normal' : 'center',
            }}
          >
            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '24px',
                marginBottom: '8px',
              }}
              title={strings.PLANTING_SITE}
            >
              {strings.PLANTING_SITE}
            </Typography>
            <PlantingSiteSelector
              onChange={(plantingSiteId) => {
                setSelectedPlantingSite(plantingSiteId);
              }}
              hideNoBoundary
            />
          </Grid>

          <Grid item xs={primaryGridSize}>
            <StatsCardItem
              label={strings.LOCATION}
              showLink={false}
              value={countries.find((c) => c.code === plantingSite?.countryCode)?.name}
            />
          </Grid>

          <Grid item xs={primaryGridSize}>
            <StatsCardItem
              label='Area'
              showLink={false}
              showBorder={!isDesktop}
              value={
                plantingSite?.areaHa
                  ? strings.formatString(strings.X_HA, numberFormatter.format(plantingSite.areaHa))?.toString()
                  : undefined
              }
            />
          </Grid>

          <Grid item xs={primaryGridSize}>
            <StatsCardItem
              label={strings.DATE_OF_LAST_OBSERVATION}
              showLink={false}
              value={latestObservationCompletedTime}
            />
          </Grid>

          <Grid item xs={primaryGridSize}>
            <StatsCardItem
              label={strings.SURVIVAL_RATE}
              showBorder={!isDesktop}
              showLink={false}
              value={latestResult?.survivalRate ? `${latestResult.survivalRate}%` : ''}
            />
          </Grid>

          <Grid item xs={primaryGridSize}>
            <StatsCardItem
              label={strings.TOTAL_PLANTS_PLANTED}
              showLink={false}
              value={numberFormatter.format(totalPlants)}
            />
          </Grid>

          <Grid item xs={primaryGridSize}>
            <StatsCardItem
              label={strings.TOTAL_SPECIES_PLANTED}
              showBorder={!isDesktop}
              showLink={false}
              value={numberFormatter.format(totalSpecies ?? 0)}
            />
          </Grid>

          <Grid item xs={primaryGridSize}>
            <StatsCardItem
              label={strings.TOTAL_HECTARES_PLANTED}
              showLink={false}
              showTooltip={true}
              tooltipText={strings.TOTAL_HECTARES_PLANTED_TOOLTIP}
              value={numberFormatter.format(plantingCompleteArea)}
            />
          </Grid>

          <Grid item xs={primaryGridSize} sx={{ textAlign: isDesktop ? 'left' : 'center' }}>
            <Link
              onClick={() => {
                navigate(`${APP_PATHS.PLANTS_DASHBOARD}/${plantingSite?.id}`);
              }}
              style={{ textWrap: 'wrap', textAlign: 'left' }}
            >
              {strings.VIEW_FULL_DASHBOARD}
            </Link>
            <Box>
              {isAdmin(selectedOrganization) && (
                <AddLink
                  disabled={false}
                  id='add-planting-site'
                  large={false}
                  onClick={() => {
                    navigate(`${APP_PATHS.PLANTING_SITES}?new=true`);
                  }}
                  text={strings.ADD_PLANTING_SITE}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{
          overflow: 'hidden',
          width: isDesktop ? '50%' : '100%',
        }}
      >
        <Box
          sx={{
            borderBottomLeftRadius: isDesktop ? '0' : '8px',
            borderBottomRightRadius: '8px',
            borderTopRightRadius: isDesktop ? '8px' : 0,
            height: '100%',
            minHeight: '400px',
            overflow: 'hidden',
            position: 'relative',
            width: '100%',
          }}
        >
          {token && plantingSite && plantingSite.boundary && (
            <SimplePlantingSiteMap
              plantingSiteId={plantingSite.id}
              hideAllControls={true}
              style={{ borderRadius: '0 8px 8px 0' }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PlantingSiteStats;
