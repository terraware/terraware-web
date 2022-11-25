import React, { useEffect, useState } from 'react';
import { ServerOrganization } from 'src/types/Organization';
import strings from 'src/strings';
import TfMain from 'src/components/common/TfMain';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Select } from '@terraware/web-components';
import { listPlantingSites } from 'src/api/tracking/tracking';
import { PlantingSite } from 'src/api/types/tracking';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { search } from 'src/api/search';
import { Chart } from 'chart.js';
import { makeStyles } from '@mui/styles';
import { generateRandomColors } from 'src/utils/generateRandomColor';

type Population = {
  species_scientificName: string;
  species_commonName: string;
  totalPlants: number;
};

type PlantingSitesPlotsSearch = {
  id: string;
  fullName: string;
  populations: Population[];
};

type PlantsDashboardProps = {
  organization: ServerOrganization;
};

const useStyles = makeStyles(() => ({
  chart: {
    height: '180px',
  },
}));

export default function PlantsDashboard(props: PlantsDashboardProps): JSX.Element {
  const { organization } = props;
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>([]);
  const [totalPlants, setTotalPlants] = useState<number>();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const chartRef = React.useRef<HTMLCanvasElement>(null);
  const [plantsBySpecies, setPlantsBySpecies] = useState<{ [key: string]: number }>();
  const classes = useStyles();

  useEffect(() => {
    const populatePlantingSites = async () => {
      const serverResponse = await listPlantingSites(organization.id);
      if (serverResponse.requestSucceeded) {
        setPlantingSites(serverResponse.sites ?? []);
      }
    };
    populatePlantingSites();
  }, [organization]);

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
          let totalPlantsOfSite = 0;
          // eslint-disable-next-line
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

  const onChangePlantingSite = (newValue: string) => {
    setSelectedPlantingSite(plantingSites.find((ps) => ps.name === newValue));
  };

  const borderCardStyle = {
    border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
    marginBottom: 2,
    borderRadius: '8px',
    padding: 3,
  };

  const cardTitleStyle = {
    fontSize: '20px',
    fontWeight: 600,
  };

  const cardElementStyle = {
    marginTop: theme.spacing(3),
  };

  React.useEffect(() => {
    const ctx = chartRef?.current?.getContext('2d');
    if (ctx && plantsBySpecies) {
      const colors = generateRandomColors(Object.keys(plantsBySpecies).length);
      const data = plantsBySpecies;
      const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(data),
          datasets: [
            {
              data: Object.values(data),
              barThickness: 50, // number (pixels) or 'flex'
              backgroundColor: colors,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          layout: {
            padding: {
              left: 0,
              right: 0,
              top: 10,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              ticks: {
                callback: (value, index, ticks) => {
                  if (+value % 1 === 0) {
                    return value;
                  }
                },
              },
            },
          },
        },
      });
      // when component unmounts
      return () => {
        myChart.destroy();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantsBySpecies]);

  return (
    <TfMain>
      <Grid item xs={12} display={isMobile ? 'block' : 'flex'}>
        <Typography sx={{ fontSize: '24px', fontWeight: 600, alignItems: 'center' }}>{strings.DASHBOARD}</Typography>
        {!isMobile && (
          <Box sx={{ margin: '0 1%', width: '1px', height: '32px', backgroundColor: theme.palette.TwClrBgTertiary }} />
        )}
        <Box display='flex' alignItems='center' paddingTop={isMobile ? 2 : 0}>
          <Typography sx={{ paddingRight: 1, fontSize: '16px', fontWeight: 500 }}>{strings.PLANTING_SITE}</Typography>
          <Select
            options={plantingSites.map((ps) => ps?.name || '')}
            onChange={onChangePlantingSite}
            selectedValue={selectedPlantingSite?.name}
            placeholder={strings.SELECT}
          />
        </Box>
      </Grid>
      <Grid container display='flex' marginTop={6}>
        <Grid item xs={isMobile ? 12 : 6} sx={{ paddingRight: 1, paddingBottom: isMobile ? 2 : 0 }}>
          Map
        </Grid>
        <Grid item xs={isMobile ? 12 : 6} sx={{ paddingLeft: 1 }}>
          <Box sx={borderCardStyle}>
            <Typography sx={cardTitleStyle}>{strings.TOTAL_NUMBER_OF_PLANTS}</Typography>
            <Box style={cardElementStyle}>
              <Typography fontSize='48px' fontWeight={600}>
                {totalPlants}
              </Typography>
            </Box>
          </Box>
          <Box sx={borderCardStyle}>
            <Typography sx={cardTitleStyle}>{strings.NUMBER_OF_PLANTS_BY_SPECIES}</Typography>
            <Box style={cardElementStyle}>
              <canvas id='plantsBySpecies' ref={chartRef} className={classes.chart} />
            </Box>
          </Box>
          <Box sx={borderCardStyle}>
            <Typography sx={cardTitleStyle}>{strings.NUMBER_OF_PLANTS_BY_PLOT_AND_SPECIES}</Typography>
            <Box style={cardElementStyle} />
          </Box>
        </Grid>
      </Grid>
    </TfMain>
  );
}
