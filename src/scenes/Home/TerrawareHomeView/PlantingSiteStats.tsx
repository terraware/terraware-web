import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import simplify from '@turf/simplify';
import { FeatureCollection } from 'geojson';

import Link from 'src/components/common/Link';
import PlantingSiteSelector from 'src/components/common/PlantingSiteSelector';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import { selectLatestObservation } from 'src/redux/features/observations/observationsSelectors';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { isAdmin } from 'src/utils/organization';
import useMapboxToken from 'src/utils/useMapboxToken';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import StatsCardItem from './StatsCardItem';

export const PlantingSiteStats = () => {
  const { isDesktop } = useDeviceInfo();
  const theme = useTheme();
  const navigate = useNavigate();
  const { selectedOrganization } = useOrganization();
  const plantingSites = useAppSelector(selectPlantingSites);
  const { token } = useMapboxToken();
  const defaultTimeZone = useDefaultTimeZone();

  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<number>();
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const { countries } = useLocalization();
  const [staticMapURL, setStaticMapURL] = useState<string>();

  const observation = useAppSelector((state) =>
    selectLatestObservation(state, selectedPlantingSiteId || -1, defaultTimeZone.get().id)
  );

  useEffect(() => {
    if (selectedPlantingSite?.boundary) {
      const geojson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: selectedPlantingSite?.boundary,
            properties: {
              fill: theme.palette.TwClrBaseGreen300,
              'fill-opacity': 0.2,
              stroke: theme.palette.TwClrBaseGreen300,
            },
          },
        ],
      } as FeatureCollection;

      const simplifiedGeojson = simplify(geojson, { tolerance: 0.002, highQuality: false });
      const geojsonString = encodeURIComponent(JSON.stringify(simplifiedGeojson));
      const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/geojson(${geojsonString})/auto/580x360@2x?padding=80&access_token=${token}`;
      setStaticMapURL(staticMapUrl);
    }
  }, [selectedPlantingSite?.boundary]);

  const primaryGridSize = useMemo(() => (isDesktop ? 6 : 12), [isDesktop]);

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
        border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
        borderRadius: '8px',
        boxShadow: isDesktop ? 'rgba(58, 68, 69, 0.2) 0px 4px 8px' : 'none',
        display: 'flex',
        flexDirection: isDesktop ? 'row' : 'column',
        justifyContent: 'space-evenly',
        marginBottom: '16px',
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
                setSelectedPlantingSiteId(plantingSiteId);
              }}
            />
          </Grid>

          <Grid item xs={primaryGridSize}>
            <StatsCardItem
              label={strings.LOCATION}
              showLink={false}
              value={countries.find((c) => c.code === selectedPlantingSite?.countryCode)?.name}
            />
          </Grid>

          <Grid item xs={primaryGridSize}>
            <StatsCardItem
              label={strings.LAST_OBSERVED}
              showBorder={!isDesktop}
              showLink={false}
              value={observation?.completedDate}
            />
          </Grid>

          <Grid item xs={primaryGridSize}>
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

          <Grid item xs={primaryGridSize}>
            <StatsCardItem
              label={strings.MORTALITY_RATE}
              showBorder={!isDesktop}
              showLink={false}
              value={observation?.mortalityRate?.toString()}
            />
          </Grid>

          <Grid item xs={primaryGridSize}>
            <StatsCardItem
              label={strings.OBSERVED_PLANTS}
              showLink={false}
              value={observation?.totalPlants?.toString()}
            />
          </Grid>

          <Grid item xs={primaryGridSize}>
            <StatsCardItem
              label={strings.OBSERVED_SPECIES}
              showBorder={!isDesktop}
              showLink={false}
              value={observation?.species?.length?.toString()}
            />
          </Grid>

          <Grid item xs={primaryGridSize} sx={{ whiteSpace: 'nowrap' }}>
            <Box sx={isDesktop ? undefined : { textAlign: 'center' }}>
              {isAdmin(selectedOrganization) ? (
                <Link
                  onClick={() => {
                    navigate(APP_PATHS.PLANTING_SITES_NEW);
                  }}
                >
                  {strings.ADD_PLANTING_SITE}
                </Link>
              ) : null}
            </Box>
          </Grid>

          <Grid item xs={primaryGridSize} sx={{ textAlign: isDesktop ? 'right' : 'center' }}>
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
          {token && (
            <img
              alt='Mapbox Static Map with Boundaries'
              src={staticMapURL}
              style={{
                height: '100%',
                left: 0,
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                width: '100%',
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PlantingSiteStats;
