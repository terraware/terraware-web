import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid, useTheme } from '@mui/material';
import { PlantingSite } from 'src/api/types/tracking';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { search } from 'src/api/search';
import SpeciesByPlotChart from './SpeciesByPlotChart';
import TotalCount from './TotalCount';
import PlantingSiteDashboardMap from './PlantingSiteDashboardMap';
import PlantBySpeciesChart from './PlantBySpeciesChart';
import { ServerOrganization } from 'src/types/Organization';

export type Population = {
  species_scientificName: string;
  species_commonName: string;
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
  updatePlotPreferences: (plotId: string) => void;
  lastPlot?: any;
  organization: ServerOrganization;
};

export const cardTitleStyle = {
  fontSize: '20px',
  fontWeight: 600,
};

export default function PlantingSiteDetails(props: PlantingSiteDetailsProps): JSX.Element {
  const { plantingSite, updatePlotPreferences, lastPlot, organization } = props;
  const [totalPlants, setTotalPlants] = useState<number>();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const [plantsBySpecies, setPlantsBySpecies] = useState<{ [key: string]: number }>();
  const [zonesWithPlants, setZonesWithPlants] = useState<PlantingSiteZone[]>();
  const [hasZones, setHasZones] = useState<boolean>(false);

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
    const populateResults = async () => {
      if (plantingSite) {
        const serverResponse: PlantingSiteZone[] | null = (await search({
          prefix: 'plantingSites.plantingZones',
          fields: [
            'plots.id',
            'plots.fullName',
            'plots.populations.species_scientificName',
            'plots.populations.species_commonName',
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
          let totalPlantsOfSite = 0;
          const plantsPerSpecies: { [key: string]: number } = validZones.reduce((acc, zone) => {
            zone.plots.forEach((plot) => {
              plot.populations.forEach((population) => {
                totalPlantsOfSite = +totalPlantsOfSite + +population.totalPlants;
                if (acc[population.species_scientificName]) {
                  acc[population.species_scientificName] =
                    +acc[population.species_scientificName] + +population.totalPlants;
                } else {
                  acc[population.species_scientificName] = +population.totalPlants;
                }
              });
            });
            return acc;
          }, {} as { [key: string]: number });

          setTotalPlants(totalPlantsOfSite);
          setPlantsBySpecies(plantsPerSpecies);
          setHasZones(serverResponse.length > 0);
        } else {
          setHasZones(false);
        }
      }
    };

    populateResults();
  }, [plantingSite, organization.id]);

  const plotsWithPlants = useMemo(() => {
    if (!zonesWithPlants) {
      return [];
    }
    return zonesWithPlants.flatMap((zone) => zone.plots);
  }, [zonesWithPlants]);

  return (
    <Grid container display='flex' flexGrow={1}>
      <Grid item xs={isMobile ? 12 : 8} sx={mapCardStyle}>
        <PlantingSiteDashboardMap plots={plotsWithPlants} siteId={plantingSite?.id} organization={organization} />
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
              updatePlotPreferences={updatePlotPreferences}
              lastPlot={lastPlot}
            />
          </Box>
        )}
      </Grid>
    </Grid>
  );
}
