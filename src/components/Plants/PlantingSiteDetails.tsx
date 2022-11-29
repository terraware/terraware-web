import React, { useEffect, useState } from 'react';
import { Box, Grid, useTheme } from '@mui/material';
import { PlantingSite } from 'src/api/types/tracking';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { search } from 'src/api/search';
import SpeciesByPlotChart from './SpeciesByPlotChart';
import TotalCount from './TotalCount';
import PlantingSiteDashboardMap from './PlantingSiteDashboardMap';
import PlantBySpeciesChart from './PlantBySpeciesChart';

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
};

export const cardTitleStyle = {
  fontSize: '20px',
  fontWeight: 600,
};

export default function PlantingSiteDetails(props: PlantingSiteDetailsProps): JSX.Element {
  const { plantingSite } = props;
  const [totalPlants, setTotalPlants] = useState<number>();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const [plantsBySpecies, setPlantsBySpecies] = useState<{ [key: string]: number }>();
  const [plots, setPlots] = useState<PlantingSitesPlots[]>();

  const borderCardStyle = {
    border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
    marginBottom: 2,
    borderRadius: '8px',
    padding: 3,
  };

  const mapCardStyle = {
    border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
    marginBottom: 2,
    borderRadius: '8px',
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
          setPlots(serverResponse);
          let totalPlantsOfSite = 0;
          const plantsPerSpecies: { [key: string]: number } = serverResponse.reduce((acc, plot) => {
            if (plot.populations) {
              plot.populations.forEach((population) => {
                totalPlantsOfSite = +totalPlantsOfSite + +population.totalPlants;
                if (acc[population.species_scientificName]) {
                  acc[population.species_scientificName] =
                    +acc[population.species_scientificName] + +population.totalPlants;
                } else {
                  acc[population.species_scientificName] = +population.totalPlants;
                }
              });
            }
            return acc;
          }, {} as { [key: string]: number });

          setTotalPlants(totalPlantsOfSite);
          setPlantsBySpecies(plantsPerSpecies);
        }
      }
    };

    populateResults();
  }, [plantingSite]);

  return (
    <Grid container display='flex' marginTop={6}>
      <Grid item xs={isMobile ? 12 : 6} sx={mapCardStyle}>
        <PlantingSiteDashboardMap plots={plots} siteId={plantingSite?.id} />
      </Grid>
      <Grid item xs={isMobile ? 12 : 6} sx={{ paddingLeft: isMobile ? 0 : 2 }}>
        <Box sx={borderCardStyle}>
          <TotalCount totalCount={totalPlants} />
        </Box>
        <Box sx={borderCardStyle}>
          <PlantBySpeciesChart plantsBySpecies={plantsBySpecies} />
        </Box>
        <Box sx={borderCardStyle}>
          <SpeciesByPlotChart plots={plots} />
        </Box>
      </Grid>
    </Grid>
  );
}
