import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Link from 'src/components/common/Link';
import PlantingSiteSelector from 'src/components/common/PlantingSiteSelector';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import { selectLatestObservation } from 'src/redux/features/observations/observationsSelectors';
import { selectPlantingsForSite } from 'src/redux/features/plantings/plantingsSelectors';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
import { selectSitePopulationZones } from 'src/redux/features/tracking/sitePopulationSelector';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { requestSitePopulation } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import SimplePlantingSiteMap from 'src/scenes/PlantsDashboardRouter/components/SimplePlantingSiteMap';
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
  const [totalPlants, setTotalPlants] = useState(0);
  const [totalSpecies, setTotalSpecies] = useState<number>();
  const { countries } = useLocalization();
  const dispatch = useAppDispatch();

  const observation = useAppSelector((state) =>
    selectLatestObservation(state, selectedPlantingSiteId || -1, defaultTimeZone.get().id)
  );
  const plantings = useAppSelector((state) => selectPlantingsForSite(state, selectedPlantingSiteId || -1));
  const populationSelector = useAppSelector((state) => selectSitePopulationZones(state));

  const primaryGridSize = useMemo(() => (isDesktop ? 6 : 12), [isDesktop]);

  useEffect(() => {
    if (selectedOrganization.id !== -1) {
      dispatch(requestPlantings(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization.id]);

  useEffect(() => {
    if (selectedPlantingSiteId && selectedOrganization.id !== -1) {
      dispatch(requestSitePopulation(selectedOrganization.id, selectedPlantingSiteId));
    }
  }, [selectedPlantingSiteId, dispatch]);

  // auto-select planting site when selectedPlantingSiteId is set
  useEffect(() => {
    if (selectedPlantingSiteId) {
      setSelectedPlantingSite(plantingSites?.find((site) => site.id === selectedPlantingSiteId));
    }
  }, [plantingSites, selectedPlantingSiteId]);

  useEffect(() => {
    if (populationSelector) {
      const populations = populationSelector
        .flatMap((zone) => zone.plantingSubzones)
        .flatMap((sz) => sz.populations)
        .filter((pop) => pop !== undefined);
      const sum = populations.reduce((acc, pop) => +pop['totalPlants(raw)'] + acc, 0);
      setTotalPlants(sum);
    }
  }, [populationSelector]);

  useEffect(() => {
    const speciesNames: Set<string> = new Set();

    plantings.forEach((planting) => {
      const { scientificName } = planting.species;
      speciesNames.add(scientificName);
    });

    const speciesCount = speciesNames.size;
    setTotalSpecies(speciesCount);
  }, [plantings]);

  if (!plantingSites?.length) {
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
              label='Area'
              showLink={false}
              showBorder={!isDesktop}
              value={
                selectedPlantingSite?.areaHa
                  ? strings.formatString(strings.X_HA, selectedPlantingSite.areaHa.toString())?.toString()
                  : undefined
              }
            />
          </Grid>

          <Grid item xs={primaryGridSize}>
            <StatsCardItem
              label={strings.DATE_OF_LAST_OBSERVATION}
              showLink={false}
              value={observation?.completedDate}
            />
          </Grid>

          <Grid item xs={primaryGridSize}>
            <StatsCardItem
              label={strings.MORTALITY_RATE}
              showBorder={!isDesktop}
              showLink={false}
              value={observation?.mortalityRate ? `${observation.mortalityRate.toString()}%` : ''}
            />
          </Grid>

          <Grid item xs={primaryGridSize}>
            <StatsCardItem label={strings.TOTAL_PLANTS_PLANTED} showLink={false} value={totalPlants.toString()} />
          </Grid>

          <Grid item xs={primaryGridSize}>
            <StatsCardItem
              label={strings.TOTAL_SPECIES_PLANTED}
              showBorder={!isDesktop}
              showLink={false}
              value={totalSpecies?.toString()}
            />
          </Grid>

          <Grid item xs={primaryGridSize} sx={{ whiteSpace: 'nowrap' }}>
            <Box sx={isDesktop ? undefined : { textAlign: 'center' }}>
              {isAdmin(selectedOrganization) ? (
                <Link
                  onClick={() => {
                    navigate(`${APP_PATHS.PLANTING_SITES}?new=true`);
                  }}
                  style={{ textWrap: 'wrap', textAlign: 'left' }}
                >
                  {strings.ADD_PLANTING_SITE}
                </Link>
              ) : null}
            </Box>
          </Grid>

          <Grid item xs={primaryGridSize} sx={{ textAlign: isDesktop ? 'right' : 'center' }}>
            <Link
              onClick={() => {
                navigate(`${APP_PATHS.PLANTS_DASHBOARD}/${selectedPlantingSiteId}`);
              }}
              style={{ textWrap: 'wrap', textAlign: 'left' }}
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
          {token && selectedPlantingSiteId && selectedPlantingSite?.boundary && (
            <SimplePlantingSiteMap
              plantingSiteId={selectedPlantingSiteId}
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
