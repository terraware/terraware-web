import React, { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { cardTitleStyle, PlantingSitesPlots } from './PlantingSiteDetails';
import strings from 'src/strings';
import { Dropdown } from '@terraware/web-components';
import DashboardChart from './DashboardChart';

export interface Props {
  plots?: PlantingSitesPlots[];
  updatePlotPreferences: (plotId: string) => void;
  lastPlot?: string;
}

export default function SpeciesByPlotChart(props: Props): JSX.Element {
  const { plots, updatePlotPreferences, lastPlot } = props;
  const [selectedPlot, setSelectedPlot] = useState<PlantingSitesPlots>();
  const [labels, setLabels] = useState<string[]>();
  const [values, setValues] = useState<number[]>();
  const theme = useTheme();

  React.useEffect(() => {
    if (selectedPlot) {
      setLabels(selectedPlot?.populations?.map((population) => population.species_scientificName));
      setValues(selectedPlot?.populations?.map((population) => population.totalPlants));
    }
  }, [selectedPlot]);

  const onChangePlot = (newValue: string) => {
    if (plots) {
      const plot = plots.find((p) => p.id.toString() === newValue.toString());
      if (plot) {
        setSelectedPlot(plot);
        updatePlotPreferences(plot.id);
      }
    }
  };

  React.useEffect(() => {
    if (!plots?.length) {
      setSelectedPlot(undefined);
      return;
    }
    const plot = plots.find((p) => p.id.toString() === lastPlot?.toString());
    setSelectedPlot(plot || plots[0]);
  }, [lastPlot, plots]);

  return (
    <>
      <Typography sx={cardTitleStyle}>{strings.NUMBER_OF_PLANTS_BY_PLOT_AND_SPECIES}</Typography>
      <Box sx={{ marginTop: theme.spacing(3) }}>
        {plots && (
          <Box display='flex' alignItems='center'>
            <Typography fontSize='16px' fontWeight={500} marginRight={1}>
              {strings.PLOT}
            </Typography>
            <Dropdown
              options={plots.map((plot) => ({ value: plot.id, label: plot.fullName }))}
              placeholder={strings.SELECT}
              onChange={onChangePlot}
              selectedValue={selectedPlot?.id}
              disabled={plots.length === 0}
            />
          </Box>
        )}
        <Box sx={{ height: '180px', marginTop: 2 }}>
          <DashboardChart chartId='speciesByPlotChart' chartLabels={labels} chartValues={values} />
        </Box>
      </Box>
    </>
  );
}
