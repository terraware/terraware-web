import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Link from 'src/components/common/Link';
import PlantingSiteSelector from 'src/components/common/PlantingSiteSelector';
import { APP_PATHS } from 'src/constants';
import { selectLatestObservation } from 'src/redux/features/observations/observationsSelectors';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import useMapboxToken from 'src/utils/useMapboxToken';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import StatsCardItem from './StatsCardItem';

export const PlantingSiteStats = () => {
  const { isDesktop } = useDeviceInfo();
  const theme = useTheme();
  const navigate = useNavigate();
  const plantingSites = useAppSelector(selectPlantingSites);
  const { token } = useMapboxToken();
  const defaultTimeZone = useDefaultTimeZone();

  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<number>();
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();

  const observation = useAppSelector((state) =>
    selectLatestObservation(state, selectedPlantingSiteId || -1, defaultTimeZone.get().id)
  );

  const pathSegments = selectedPlantingSite?.boundary?.coordinates.map((polygon) => {
    // Convert each coordinate pair to "lon,lat" with reduced precision
    return polygon[0].map((coord) => coord.map((value) => value.toFixed(6)).join(',')).join(';');
  });
  const pathCoordinates = pathSegments?.join(':');
  const staticMapURL = `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/path-5+41C07F-1+41c07f-0.4(${pathCoordinates})/auto/580x360@2x?padding=10&access_token=${token}`;

  const primaryGridSize = () => {
    if (isDesktop) {
      return 6;
    }
    return 12;
  };

  // auto-select planting site when selectedPlantingSiteId is set
  useEffect(() => {
    if (selectedPlantingSiteId) {
      setSelectedPlantingSite(plantingSites?.find((site) => site.id === selectedPlantingSiteId));
    }
  }, [plantingSites, selectedPlantingSiteId]);

  if (!plantingSites?.length) {
    return <></>;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isDesktop ? 'row' : 'column',
        justifyContent: 'space-evenly',
        padding: '16px',
        width: '100%',
      }}
    >
      <Box sx={isDesktop ? { width: '50%' } : undefined}>
        <Grid container spacing={3} sx={{ marginBottom: '16px', padding: 0 }}>
          <Grid item xs={primaryGridSize()}>
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
              <Icon name='iconSeedling' size='medium' style={{ fill: theme.palette.TwClrIcnSecondary }} />
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
            xs={primaryGridSize()}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isDesktop ? 'normal' : 'center',
              paddingRight: isDesktop ? '16px' : 0,
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
                setSelectedPlantingSiteId(plantingSiteId);
              }}
            />
          </Grid>

          <Grid item xs={primaryGridSize()}>
            <StatsCardItem label={strings.LOCATION} showLink={false} />
          </Grid>

          <Grid item xs={primaryGridSize()}>
            <StatsCardItem label={strings.TARGET_PLANTING_DENSITY} showBorder={!isDesktop} showLink={false} />
          </Grid>

          <Grid item xs={primaryGridSize()}>
            <StatsCardItem
              label='Area'
              showLink={false}
              value={
                selectedPlantingSite?.areaHa
                  ? strings.formatString(strings.X_HA, selectedPlantingSite.areaHa.toString())?.toString()
                  : undefined
              }
            />
          </Grid>

          <Grid item xs={primaryGridSize()}>
            <StatsCardItem
              label={strings.MORTALITY_RATE}
              showBorder={!isDesktop}
              showLink={false}
              value={observation?.mortalityRate?.toString()}
            />
          </Grid>

          <Grid item xs={primaryGridSize()}>
            <StatsCardItem
              label={strings.OBSERVED_PLANTS}
              showLink={false}
              value={observation?.totalPlants?.toString()}
            />
          </Grid>

          <Grid item xs={primaryGridSize()}>
            <StatsCardItem
              label={strings.OBSERVED_SPECIES}
              showBorder={!isDesktop}
              showLink={false}
              value={observation?.species?.length?.toString()}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ marginBottom: '16px', padding: 0, whiteSpace: 'nowrap' }}>
          <Grid item xs={primaryGridSize()}>
            <Box sx={isDesktop ? undefined : { textAlign: 'center' }}>
              <Link
                onClick={() => {
                  navigate(APP_PATHS.PLANTING_SITES_NEW);
                }}
              >
                {strings.ADD_PLANTING_SITE}
              </Link>
            </Box>
          </Grid>

          <Grid
            item
            xs={primaryGridSize()}
            sx={isDesktop ? { paddingRight: '16px', textAlign: 'right' } : { textAlign: 'center' }}
          >
            <Link
              onClick={() => {
                navigate(APP_PATHS.PLANTS_DASHBOARD);
              }}
            >
              {strings.VIEW_FULL_DASHBOARD}
            </Link>
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{
          width: isDesktop ? '50%' : '100%',
        }}
      >
        {token && (
          <img alt='Mapbox Static Map with Boundaries' src={staticMapURL} style={{ width: '100%', height: 'auto' }} />
        )}
      </Box>
    </Box>
  );
};

export default PlantingSiteStats;
