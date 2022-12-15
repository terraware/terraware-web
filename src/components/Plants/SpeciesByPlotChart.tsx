import React, { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { cardTitleStyle, PlantingSiteZone, PlantingSitePlot } from './PlantingSiteDetails';
import strings from 'src/strings';
import DashboardChart from './DashboardChart';
import PlotSelector, { PlotInfo, ZoneInfo } from 'src/components/PlotSelector';

export interface Props {
  siteId?: string | number | undefined;
  zones?: PlantingSiteZone[];
  plantsDashboardPreferences?: { [key: string]: unknown };
  setPlantsDashboardPreferences: React.Dispatch<React.SetStateAction<{ [key: string]: unknown } | undefined>>;
}

export default function SpeciesByPlotChart(props: Props): JSX.Element {
  const { siteId, zones, plantsDashboardPreferences, setPlantsDashboardPreferences } = props;
  const [selectedPlot, setSelectedPlot] = useState<PlantingSitePlot>();
  const [selectedZone, setSelectedZone] = useState<PlantingSiteZone>();
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

  const onChangeZone = (zone: ZoneInfo | undefined) => {
    if (zones && zone) {
      const foundZone = zones.find((plantingZone) => plantingZone.id.toString() === zone.id.toString());
      setSelectedZone(foundZone);
      if (setPlantsDashboardPreferences && foundZone) {
        setPlantsDashboardPreferences({ ...plantsDashboardPreferences, zoneId: foundZone.id, plotId: undefined });
      }
    } else {
      setSelectedZone(undefined);
      setPlantsDashboardPreferences({ ...plantsDashboardPreferences, zoneId: undefined, plotId: undefined });
    }
  };

  const onChangePlot = (plot: PlotInfo | undefined) => {
    if (plot && selectedZone) {
      const plotFound = selectedZone.plots.find((plantingPlot) => plantingPlot.id.toString() === plot.id.toString());
      setSelectedPlot(plotFound);
      if (setPlantsDashboardPreferences && plotFound) {
        setPlantsDashboardPreferences({ ...plantsDashboardPreferences, plotId: plotFound.id });
      }
    } else {
      setSelectedPlot(undefined);
    }
  };

  React.useEffect(() => {
    if (!zones?.length) {
      setSelectedPlot(undefined);
      return;
    }

    const lastZone = plantsDashboardPreferences?.zoneId as string;
    const zone = zones.find((z) => z.id.toString() === lastZone?.toString());
    const zoneToBeSelected = zone || zones[0];
    setSelectedZone(zoneToBeSelected);

    const lastPlot = plantsDashboardPreferences?.plotId as string;
    const plots = zoneToBeSelected.plots;
    const plot = plots.find((p) => p.id.toString() === lastPlot?.toString());
    setSelectedPlot(plot || plots[0]);
  }, [plantsDashboardPreferences, zones]);

  return (
    <>
      <Typography sx={cardTitleStyle}>{strings.NUMBER_OF_PLANTS_BY_PLOT_AND_SPECIES}</Typography>
      <Box sx={{ marginTop: theme.spacing(3) }}>
        {zones && (
          <PlotSelector
            zones={zones as ZoneInfo[]}
            siteId={siteId}
            onZoneSelected={onChangeZone}
            onPlotSelected={onChangePlot}
            horizontalLayout={true}
            selectedZone={selectedZone}
            selectedPlot={selectedPlot}
          />
        )}
        <Box sx={{ height: '180px', marginTop: 2 }}>
          <DashboardChart chartId='speciesByPlotChart' chartLabels={labels} chartValues={values} />
        </Box>
      </Box>
    </>
  );
}
