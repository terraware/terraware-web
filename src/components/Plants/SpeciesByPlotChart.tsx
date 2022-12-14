import React, { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { cardTitleStyle, PlantingSiteZone, PlantingSitePlot } from './PlantingSiteDetails';
import strings from 'src/strings';
import DashboardChart from './DashboardChart';
import PlotSelector, { ZoneInfo } from 'src/components/PlotSelector';

export interface Props {
  siteId?: string | number | undefined;
  zones?: PlantingSiteZone[];
  updatePlotPreferences: (plotId: string) => void;
  lastPlot?: string;
}

export default function SpeciesByPlotChart(props: Props): JSX.Element {
  const { siteId, zones, updatePlotPreferences, lastPlot } = props;
  const [selectedPlot, setSelectedPlot] = useState<PlantingSitePlot>();
  const [labels, setLabels] = useState<string[]>();
  const [values, setValues] = useState<number[]>();
  const theme = useTheme();

  React.useEffect(() => {
    if (selectedPlot) {
      setLabels(selectedPlot?.populations?.map((population) => population.species_scientificName));
      setValues(selectedPlot?.populations?.map((population) => population.totalPlants));
    } else {
      setLabels([]);
      setValues([]);
    }
  }, [selectedPlot]);

  const onChangePlot = (plot: any) => {
    if (plot) {
      setSelectedPlot(plot as PlantingSitePlot);
      updatePlotPreferences(plot.id);
    } else {
      setSelectedPlot(undefined);
    }
  };

  React.useEffect(() => {
    if (!zones?.length) {
      setSelectedPlot(undefined);
      return;
    }
    /** Enable after we can support preselection in the plot selector
     * const plots = zones.flatMap((zone) => zone.plots);
     * const plot = plots.find((p) => p.id.toString() === lastPlot?.toString());
     * setSelectedPlot(plot || plots[0]);
     */
  }, [lastPlot, zones]);

  return (
    <>
      <Typography sx={cardTitleStyle}>{strings.NUMBER_OF_PLANTS_BY_PLOT_AND_SPECIES}</Typography>
      <Box sx={{ marginTop: theme.spacing(3) }}>
        {zones && (
          <PlotSelector
            zones={zones as ZoneInfo[]}
            siteId={siteId}
            onPlotSelected={onChangePlot}
            horizontalLayout={true}
          />
        )}
        <Box sx={{ height: '180px', marginTop: 2 }}>
          <DashboardChart chartId='speciesByPlotChart' chartLabels={labels} chartValues={values} />
        </Box>
      </Box>
    </>
  );
}
