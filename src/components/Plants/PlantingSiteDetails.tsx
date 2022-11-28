import React, { useEffect, useState } from 'react';
import { Box, Grid, useTheme } from '@mui/material';
import { PlantingSite } from 'src/api/types/tracking';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { search } from 'src/api/search';
import SpeciesByPlotChart from './SpeciesByPlotChart';
import TotalCount from './TotalCount';
import PlantingSiteMap from './PlantingSiteMap';
import PlantBySpeciesChart from './PlantBySpeciesChart';

export type Population = {
  species_scientificName: string;
  species_commonName: string;
  totalPlants: number;
};

export type PlantingSitesPlotsSearch = {
  id: string;
  fullName: string;
  populations: Population[];
};

type PlantingSiteDetailsProps = {
  selectedPlantingSite?: PlantingSite;
};

export const cardTitleStyle = {
  fontSize: '20px',
  fontWeight: 600,
};

export default function PlantingSiteDetails(props: PlantingSiteDetailsProps): JSX.Element {
  const { selectedPlantingSite } = props;
  const [totalPlants, setTotalPlants] = useState<number>();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const [plantsBySpecies, setPlantsBySpecies] = useState<{ [key: string]: number }>();
  const [plots, setPlots] = useState<PlantingSitesPlotsSearch[]>();

  const borderCardStyle = {
    border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
    marginBottom: 2,
    borderRadius: '8px',
    padding: 3,
  };

  useEffect(() => {
    const populateResults = async () => {
      if (selectedPlantingSite) {
        const serverResponse: PlantingSitesPlotsSearch[] | null = (await search({
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
            values: [selectedPlantingSite.id],
          },
          count: 0,
        })) as unknown as PlantingSitesPlotsSearch[] | null;

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
  }, [selectedPlantingSite]);

  return (
    <Grid container display='flex' marginTop={6}>
      <PlantingSiteMap plots={plots} />
      <Grid item xs={isMobile ? 12 : 6} sx={{ paddingLeft: 1 }}>
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
