import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid, useTheme } from '@mui/material';
import { PlantingSite } from 'src/types/Tracking';
import { useDeviceInfo } from '@terraware/web-components/utils';
import SpeciesBySubzoneChart from 'src/components/Plants/SpeciesBySubzoneChart';
import TotalCount from './TotalCount';
import PlantingSiteDashboardMap from './PlantingSiteDashboardMap';
import PlantBySpeciesChart from './PlantBySpeciesChart';
import BusySpinner from 'src/components/common/BusySpinner';
import { useOrganization } from 'src/providers';
import { Population, PlantingSiteZone } from 'src/types/PlantingSite';
import { TrackingService } from 'src/services';

type PlantingSiteDetailsProps = {
  plantingSite?: PlantingSite;
  plantsDashboardPreferences?: { [key: string]: unknown };
  setPlantsDashboardPreferences: React.Dispatch<React.SetStateAction<{ [key: string]: unknown } | undefined>>;
};

export const cardTitleStyle = {
  fontSize: '20px',
  fontWeight: 600,
};

export default function PlantingSiteDetails(props: PlantingSiteDetailsProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { plantingSite, plantsDashboardPreferences, setPlantsDashboardPreferences } = props;
  const [totalPlants, setTotalPlants] = useState<number>();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const [fetchingPlants, setFetchingPlants] = useState<boolean>(false);
  const [fetchingZones, setFetchingZones] = useState<boolean>(false);
  const [plantsBySpecies, setPlantsBySpecies] = useState<{ [key: string]: number }>();
  const [zonesWithPlants, setZonesWithPlants] = useState<PlantingSiteZone[]>();
  const [hasZones, setHasZones] = useState<boolean>(false);
  const [selectedSubzoneId, setSelectedSubzoneId] = useState<number | undefined>();
  const [selectedZoneId, setSelectedZoneId] = useState<number | undefined>();

  const widgetCardStyle = {
    backgroundColor: theme.palette.TwClrBg,
    marginBottom: 3,
    borderRadius: '24px',
    padding: 3,
  };

  const mapCardStyle = {
    marginBottom: 3,
    borderRadius: '24px',
    flexGrow: 1,
  };

  useEffect(() => {
    const populateZones = async () => {
      if (plantingSite) {
        setFetchingZones(true);
        const serverResponse: PlantingSiteZone[] | null = await TrackingService.getTotalPlantsInZones(
          selectedOrganization.id,
          plantingSite.id
        );

        if (serverResponse) {
          const validZones = serverResponse
            .filter((zone) => zone.plantingSubzones?.some((subzone) => subzone?.populations?.length > 0))
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((zone) => {
              const subzones = zone?.plantingSubzones
                ?.filter((subzone) => subzone?.populations?.length > 0)
                .sort((a, b) => a.fullName.localeCompare(b.fullName));
              return { ...zone, subzones };
            });

          setZonesWithPlants(validZones);
          setHasZones(serverResponse.length > 0);
        } else {
          setHasZones(false);
        }
        setFetchingZones(false);
      }
    };

    const populateTotals = async () => {
      if (plantingSite) {
        setFetchingPlants(true);
        const serverResponse: Population[] | null = await TrackingService.getTotalPlantsInSite(
          selectedOrganization.id,
          plantingSite.id
        );

        if (serverResponse) {
          let totalPlantsOfSite = 0;
          const plantsPerSpecies: { [key: string]: number } = serverResponse.reduce((acc, population) => {
            const populationTotalPlants = +population['totalPlants(raw)'];
            totalPlantsOfSite = +totalPlantsOfSite + populationTotalPlants;
            if (acc[population.species_scientificName]) {
              acc[population.species_scientificName] = +acc[population.species_scientificName] + populationTotalPlants;
            } else {
              acc[population.species_scientificName] = populationTotalPlants;
            }
            return acc;
          }, {} as { [key: string]: number });
          setTotalPlants(totalPlantsOfSite);
          setPlantsBySpecies(plantsPerSpecies);
        }
        setFetchingPlants(false);
      }
    };

    populateZones();
    populateTotals();
  }, [plantingSite, selectedOrganization]);

  const subzonesWithPlants = useMemo(() => {
    if (!zonesWithPlants) {
      return [];
    }
    return zonesWithPlants.flatMap((zone) => zone.plantingSubzones);
  }, [zonesWithPlants]);

  if (fetchingPlants || fetchingZones) {
    return <BusySpinner />;
  }

  // if we have a site without zones/subzones,
  // show information relevant to site (skip zone/subzone related cards)
  if (plantingSite && !hasZones) {
    return (
      <Grid container display='flex' flexGrow={1}>
        <Grid item xs={isMobile ? 12 : 4}>
          <Box sx={{ ...widgetCardStyle, minHeight: '160px', marginBottom: 3 }}>
            <TotalCount totalCount={totalPlants} />
          </Box>
        </Grid>
        <Grid item xs={isMobile ? 12 : 8} sx={{ paddingLeft: isMobile ? 0 : 4 }}>
          <Box sx={{ ...widgetCardStyle }} display='flex' flexGrow={1} flexDirection='column'>
            <PlantBySpeciesChart plantsBySpecies={plantsBySpecies} />
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container display='flex' flexGrow={1}>
      <Grid item xs={isMobile ? 12 : 8} sx={mapCardStyle}>
        <PlantingSiteDashboardMap
          subzones={subzonesWithPlants}
          siteId={plantingSite?.id}
          selectedSubzoneId={selectedSubzoneId}
          selectedZoneId={selectedZoneId}
        />
      </Grid>
      <Grid item xs={isMobile ? 12 : 4} sx={{ paddingLeft: isMobile ? 0 : 3 }}>
        <Box sx={{ ...widgetCardStyle, minHeight: '160px' }}>
          <TotalCount totalCount={totalPlants} />
        </Box>
        <Box sx={{ ...widgetCardStyle, minHeight: '240px' }}>
          <PlantBySpeciesChart plantsBySpecies={plantsBySpecies} />
        </Box>
        {(!plantingSite || hasZones) && (
          <Box sx={{ ...widgetCardStyle, minHeight: '240px' }}>
            <SpeciesBySubzoneChart
              siteId={plantingSite?.id}
              zones={zonesWithPlants}
              plantsDashboardPreferences={plantsDashboardPreferences}
              setPlantsDashboardPreferences={setPlantsDashboardPreferences}
              setSelectedSubzoneId={(id?: number) => setSelectedSubzoneId(id)}
              setSelectedZoneId={(id?: number) => setSelectedZoneId(id)}
            />
          </Box>
        )}
      </Grid>
    </Grid>
  );
}
