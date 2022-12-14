import React, { useEffect, useState } from 'react';
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

export type PlantingSitesPlots = {
  id: string;
  fullName: string;
  populations: Population[];
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
  const [plotsWithPlants, setPlotsWithPlants] = useState<PlantingSitesPlots[]>();
  const [hasPlots, setHasPlots] = useState<boolean>(false);

  const widgetCardStyle = {
    backgroundColor: theme.palette.TwClrBg,
    marginBottom: 3,
    borderRadius: '24px',
    padding: 3,
  };

  const mapCardStyle = {
    marginBottom: 3,
    borderRadius: '24px',
  };

  useEffect(() => {
    const populateResults = async () => {
      if (plantingSite) {
        const serverResponse: PlantingSitesPlots[] | null = (await search({
          prefix: 'plantingSites.plantingZones.plots',
          fields: [
            'id',
            'fullName',
            'populations.species_scientificName',
            'populations.species_commonName',
            'populations.totalPlants',
          ],
          search: {
            operation: 'field',
            field: 'plantingSite_id',
            values: [plantingSite.id],
          },
          count: 0,
        })) as unknown as PlantingSitesPlots[] | null;

        if (serverResponse) {
          const validPlots = serverResponse
            .filter((plot) => plot?.populations?.length > 0)
            .sort((a, b) => a.fullName.localeCompare(b.fullName));
          setPlotsWithPlants(validPlots);
          let totalPlantsOfSite = 0;
          const plantsPerSpecies: { [key: string]: number } = validPlots.reduce((acc, plot) => {
            plot.populations.forEach((population) => {
              totalPlantsOfSite = +totalPlantsOfSite + +population.totalPlants;
              if (acc[population.species_scientificName]) {
                acc[population.species_scientificName] =
                  +acc[population.species_scientificName] + +population.totalPlants;
              } else {
                acc[population.species_scientificName] = +population.totalPlants;
              }
            });
            return acc;
          }, {} as { [key: string]: number });

          setTotalPlants(totalPlantsOfSite);
          setPlantsBySpecies(plantsPerSpecies);
          setHasPlots(serverResponse.length > 0);
        }
      }
    };

    populateResults();
  }, [plantingSite, organization.id]);

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
        {(!plantingSite || hasPlots) && (
          <Box sx={{ ...widgetCardStyle, minHeight: '240px' }}>
            <SpeciesByPlotChart
              plots={plotsWithPlants}
              updatePlotPreferences={updatePlotPreferences}
              lastPlot={lastPlot}
            />
          </Box>
        )}
      </Grid>
    </Grid>
  );
}
