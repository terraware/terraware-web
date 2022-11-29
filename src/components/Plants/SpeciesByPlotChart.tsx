import Chart from 'chart.js/auto';
import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { generateRandomColors } from 'src/utils/generateRandomColor';
import { Box, Typography, useTheme } from '@mui/material';
import { cardTitleStyle, PlantingSitesPlots } from './PlantingSiteDetails';
import strings from 'src/strings';
import { Select } from '@terraware/web-components';

const useStyles = makeStyles(() => ({
  chart: {
    height: '180px',
  },
}));

export interface Props {
  plots?: PlantingSitesPlots[];
}

export default function SpeciesByPlotChart({ plots }: Props): JSX.Element {
  const classes = useStyles();
  const chartRef = React.useRef<HTMLCanvasElement>(null);
  const [selectedPlot, setSelectedPlot] = useState<PlantingSitesPlots>();
  const theme = useTheme();

  const onChangePlot = (newValue: string) => {
    if (plots) {
      setSelectedPlot(plots.find((p) => p.fullName === newValue));
    }
  };

  React.useEffect(() => {
    setSelectedPlot(undefined);
  }, [plots]);

  React.useEffect(() => {
    const populations = selectedPlot?.populations;
    const ctx = chartRef?.current?.getContext('2d');
    if (ctx && populations) {
      const colors = generateRandomColors(populations.length);
      const data = populations;
      const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map((population) => population.species_scientificName),
          datasets: [
            {
              data: data.map((population) => population.totalPlants),
              barThickness: 50,
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
            tooltip: {
              displayColors: false,
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
  }, [selectedPlot]);

  return (
    <>
      <Typography sx={cardTitleStyle}>{strings.NUMBER_OF_PLANTS_BY_PLOT_AND_SPECIES}</Typography>
      <Box sx={{ marginTop: theme.spacing(3) }}>
        {plots && (
          <Box display='flex' alignItems='center'>
            <Typography fontSize='16px' fontWeight={500} marginRight={1}>
              {strings.PLOT}
            </Typography>
            <Select
              options={plots.map((plot) => plot.fullName || '')}
              onChange={onChangePlot}
              selectedValue={selectedPlot?.fullName}
              placeholder={strings.SELECT}
            />
          </Box>
        )}
        {selectedPlot && (
          <Box sx={{ height: '180px', marginTop: 2 }}>
            <canvas id='speciesByPlotChart' ref={chartRef} className={classes.chart} />
          </Box>
        )}
      </Box>
    </>
  );
}
