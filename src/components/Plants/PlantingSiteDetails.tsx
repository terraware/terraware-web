import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid, useTheme } from '@mui/material';
import { PlantingSite } from 'src/types/Tracking';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { search } from 'src/api/search';
import SpeciesByPlotChart from './SpeciesByPlotChart';
import TotalCount from './TotalCount';
import PlantingSiteDashboardMap from './PlantingSiteDashboardMap';
import PlantBySpeciesChart from './PlantBySpeciesChart';
import BusySpinner from 'src/components/common/BusySpinner';
import { useOrganization } from 'src/providers/hooks';

export type Population = {
  species_scientificName: string;
  totalPlants: number;
};

export type PlantingSitePlot = {
  id: string;
  fullName: string;
  populations: Population[];
};

export type PlantingSiteZone = {
  id: string;
  name: string;
  plots: PlantingSitePlot[];
};

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
  const [selectedPlotId, setSelectedPlotId] = useState<number | undefined>();
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
        const serverResponse: PlantingSiteZone[] | null = (await search({
          prefix: 'plantingSites.plantingZones',
          fields: [
            'plots.id',
            'plots.fullName',
            'plots.populations.species_scientificName',
            'plots.populations.species_organization_id',
            'plots.populations.totalPlants',
            'id',
            'name',
          ],
          search: {
            operation: 'field',
            field: 'plantingSite_id',
            values: [plantingSite.id],
          },
          count: 0,
        })) as unknown as PlantingSiteZone[] | null;

        if (serverResponse) {
          const validZones = serverResponse
            .filter((zone) => zone.plots?.some((plot) => plot?.populations?.length > 0))
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((zone) => {
              const plots = zone?.plots
                ?.filter((plot) => plot?.populations?.length > 0)
                .sort((a, b) => a.fullName.localeCompare(b.fullName));
              return { ...zone, plots };
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
        const serverResponse: Population[] | null = (await search({
          prefix: 'plantingSites.populations',
          fields: ['species_scientificName', 'totalPlants'],
          search: {
            operation: 'field',
            field: 'plantingSite_id',
            values: [plantingSite.id],
          },
          count: 0,
        })) as unknown as Population[] | null;

        if (serverResponse) {
          let totalPlantsOfSite = 0;
          const plantsPerSpecies: { [key: string]: number } = serverResponse.reduce((acc, population) => {
            totalPlantsOfSite = +totalPlantsOfSite + +population.totalPlants;
            if (acc[population.species_scientificName]) {
              acc[population.species_scientificName] =
                +acc[population.species_scientificName] + +population.totalPlants;
            } else {
              acc[population.species_scientificName] = +population.totalPlants;
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

  const plotsWithPlants = useMemo(() => {
    if (!zonesWithPlants) {
      return [];
    }
    return zonesWithPlants.flatMap((zone) => zone.plots);
  }, [zonesWithPlants]);

  if (fetchingPlants || fetchingZones) {
    return <BusySpinner />;
  }

  // if we have a site without zones/plots,
  // show information relevant to site (skip zone/plot related cards)
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
          plots={plotsWithPlants}
          siteId={plantingSite?.id}
          selectedPlotId={selectedPlotId}
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
            <SpeciesByPlotChart
              siteId={plantingSite?.id}
              zones={zonesWithPlants}
              plantsDashboardPreferences={plantsDashboardPreferences}
              setPlantsDashboardPreferences={setPlantsDashboardPreferences}
              setSelectedPlotId={(id?: number) => setSelectedPlotId(id)}
              setSelectedZoneId={(id?: number) => setSelectedZoneId(id)}
            />
          </Box>
        )}
      </Grid>
    </Grid>
  );
}
